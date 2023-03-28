import { readFileSync, copyFileSync } from "fs";
import * as vscode from "vscode";
import { ConfigurationPanel } from "./panels/ConfigurationPanel";
import { MutationOperatorsPanel } from "./panels/MutationOperatorsPanel";
import { runSumoCommand, startWatcher, stopWatcher } from "./utilities/fireCommands";
import { dirFilesPathJSON, win32PathConverter } from "./utilities/getFilesPath";
import { editorChanged, showResultsVariants, turnPage } from "./utilities/showResults";
import { checkSuMoConfig, checkSuMoPath, clearRequireCache } from "./utilities/sumoPathHandler";

let testStatusBarItem: vscode.StatusBarItem;
export let extensionUri: vscode.Uri;
export let variantDecorationType: vscode.TextEditorDecorationType;
export let liveDecorationType: vscode.TextEditorDecorationType;

export const variantDiagnostics = vscode.languages.createDiagnosticCollection("variants");

let projectDir: string = "undefined";
let buildDir: string = "undefined";
let contractsDir: string = "undefined";
let testDir: string = "undefined";

export async function activate(context: vscode.ExtensionContext) {

  //set directories path using open project on workspace
  try {
    //take project folder open in workspace
    const wf = vscode.workspace.workspaceFolders;
    if (wf !== undefined) {
      projectDir = win32PathConverter(wf[0].uri.path);
    }
    clearRequireCache(projectDir + '/.sumo/config.js');
    let actualConfig = require(projectDir + '/.sumo/config.js');
    projectDir = actualConfig.projectDir;
    buildDir = actualConfig.buildDir;
    contractsDir = actualConfig.contractsDir;
    testDir = actualConfig.testDir;
    startWatcher(projectDir);
  } catch (err) { }

  context.subscriptions.push(testStatusBarItem);
  context.subscriptions.push(variantDiagnostics);
  extensionUri = context.extensionUri;

  // create a decorator type that we use to decorate variants
  variantDecorationType = vscode.window.createTextEditorDecorationType({
    gutterIconPath: vscode.Uri.joinPath(extensionUri, "assets", "variants-sumo.png"),
    gutterIconSize: "contain"
  });

  // create a decorator type that we use to decorate LIVE mutators
  liveDecorationType = vscode.window.createTextEditorDecorationType({
    gutterIconPath: vscode.Uri.joinPath(extensionUri, "assets", "live-sumo.png"),
    gutterIconSize: "contain"
  });

  // listner to refresh decoration on active editor
  vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor) {
      editorChanged(editor);
    }
  }, null, context.subscriptions);

  // create a test status bar item
  testStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  testStatusBarItem.command = "sumo-tool.runSumoCommand";
  testStatusBarItem.text = "$(debug-start) Run SuMo";
  testStatusBarItem.show();

  //cache SuMoPath
  let sumoPath: any = typeof context.globalState.get("SuMoPath") === "string" ? context.globalState.get("SuMoPath") : "";

  //check if SuMo path is correctly set othervwise the function return an error message
  checkSuMoPath(sumoPath);

  // Command for update the SuMo tool folder
  const setSumoPathCommand = vscode.commands.registerCommand("sumo-tool.setSuMoPath", async () => {
    let newSumoPath: any = await vscode.window.showOpenDialog({
      title: "Select the folder where SuMo is installed",
      canSelectFolders: true,
      canSelectFiles: false,
      canSelectMany: false,
    });
    newSumoPath === undefined ? newSumoPath = "" : newSumoPath = win32PathConverter(newSumoPath[0].path);

    if (checkSuMoPath(newSumoPath)) {
      sumoPath = newSumoPath;
      context.globalState.update("SuMoPath", sumoPath);
      vscode.window.showInformationMessage("SuMo folder correctly set!");
    }
  });

  // Command that provide a webview to edit/create the configuration file of SuMo
  const configurationCommand = vscode.commands.registerCommand("sumo-tool.configuration", async () => {
    if (checkSuMoPath(sumoPath)) {
      ConfigurationPanel.render(context.extensionUri);
      const wf = vscode.workspace.workspaceFolders;
      if (wf !== undefined) {
        projectDir = win32PathConverter(wf[0].uri.path);
        buildDir = projectDir + "/build";
        contractsDir = projectDir + "/contracts";
        testDir = projectDir + "/test";
      } else {
        vscode.window.showWarningMessage("WARNING: there isn't a folder opened in the VSCode workspace");
      }
      // search for a config.js inside the project, but if it isn't present it takes the sumo ones
      let actualConfig;
      try {
        clearRequireCache(projectDir + '/.sumo/config.js');
        actualConfig = require(projectDir + '/.sumo/config.js');
      } catch (err) {
        clearRequireCache(sumoPath + '/src/config.js');
        actualConfig = require(sumoPath + '/src/config.js');
      }
      await delay(1500);

      //send data to the webview pannel
      ConfigurationPanel.sendDirPath("projectDir", projectDir);
      ConfigurationPanel.sendDirPath("buildDir", buildDir);
      ConfigurationPanel.sendDirPath("contractsDir", contractsDir);
      ConfigurationPanel.sendDirPath("testDir", testDir);
      ConfigurationPanel.sendDirPath("sumoDir", sumoPath);
      ConfigurationPanel.sendDirFilesPath("contractsFiles", dirFilesPathJSON(contractsDir, [".sol"]));
      ConfigurationPanel.sendDirFilesPath("testFiles", dirFilesPathJSON(testDir, [".js", ".ts", ".sol"]));
      ConfigurationPanel.sendDirPath("actualConfig", JSON.stringify(actualConfig));
    }
  });

  // Command that provide a webview to enable/disable mutation operators of SuMo
  const mutationOperatorsCommand = vscode.commands.registerCommand("sumo-tool.selectMutationOperators", async () => {
    if (checkSuMoPath(sumoPath)) {
      MutationOperatorsPanel.render(context.extensionUri);
      try {
        let mutationOperaorsJson = checkSuMoPath(sumoPath) === true ? JSON.parse(readFileSync(sumoPath + "/src/operators.config.json", 'utf8')) : "";

        //send data to the webview pannel
        MutationOperatorsPanel.sendDataOperatorsConfig("sumo", sumoPath);
        MutationOperatorsPanel.sendDataOperatorsConfig("operators", JSON.stringify(mutationOperaorsJson));
      } catch {
        vscode.window.showErrorMessage("ERROR: Operators config file not found or not correctly set!");
      }
    }
  });

  // Command that allow to perform a command on SuMo
  const runSumoCommandCommand = vscode.commands.registerCommand("sumo-tool.runSumoCommand", async () => {
    if (projectDir !== "undefined") {
      if (checkSuMoPath(sumoPath) && checkSuMoConfig(projectDir)) {
        copyFileSync(projectDir + '/.sumo/config.js', sumoPath + '/src/config.js');

        const command = await vscode.window.showQuickPick(
          ["preflight", "mutate", "pretest", "test", "diff", "restore"],
          {
            placeHolder: "Run SuMo",
            canPickMany: false,
          }
        ).then((selection) => {
          return selection;
        });

        switch (command) {
          case 'preflight':
            runSumoCommand(sumoPath, command);
            break;
          case 'mutate':
            runSumoCommand(sumoPath, command);
            break;
          case 'diff':
            const hash = await getMutantHash("Insert the hash of the Mutant that you want to check");
            if(hash !== undefined) {runSumoCommand(sumoPath, command, hash);}
            break;
          case 'pretest':
            runSumoCommand(sumoPath, command);
            break;
          case 'test':
            const startHash = await getMutantHash("(Optional) Insert the hash of the first Mutant to be tested");
            const lastHash = await getMutantHash("(Optional) Insert the hash of the last Mutant to be tested");
            runSumoCommand(sumoPath, command, startHash, lastHash);
            break;
          case 'restore':
            runSumoCommand(sumoPath, command);
            break;
          default:
            vscode.window.showErrorMessage("Command not recognized!");
            break;
        }
      } else {
        vscode.window.showErrorMessage("ERROR: SuMo is not configured!");
      }
    }
    else {
      vscode.window.showErrorMessage("ERROR: No open project on VS code or not configured yet!");
    }
  });

  // Command that enable/disable visualization of SuMo test results
  const showResultsCommand = vscode.commands.registerCommand("sumo-tool.showResultsCommand", async () => {
    if (projectDir !== "undefined") {
      const choose = await vscode.window.showQuickPick(
        ["live", "equivalent", "redundant", "stillborn", "killed"],
        {
          placeHolder: "Which operators results you want to view in the editor?",
          canPickMany: true,
        }
      ).then((selection) => {
        return selection;
      });

      if (choose !== undefined) {
        showResultsVariants(projectDir, choose);
      }
    }
    else {
      vscode.window.showErrorMessage("ERROR: No open project on VS code or not configured yet!");
    }
  });

  // Command that enable/disable visualization of SuMo test results
  const nextResultsPage = vscode.commands.registerCommand("sumo-tool.nextResultsPage", async () => {
    turnPage();
  });

  // Add commands to the extension context
  context.subscriptions.push(configurationCommand);
  context.subscriptions.push(mutationOperatorsCommand);
  context.subscriptions.push(setSumoPathCommand);
  context.subscriptions.push(runSumoCommandCommand);
  context.subscriptions.push(showResultsCommand);
  context.subscriptions.push(nextResultsPage);
}

async function getMutantHash(promptMessage: string) {
  let hash = await vscode.window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: "Mutant Hash",
    prompt: promptMessage,
  });

  return hash = hash === "" ? undefined : hash;
}

function delay(ms: any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function setProjectDir(config: any[]) {
  stopWatcher(projectDir);
  projectDir = config[0];
  buildDir = config[1];
  contractsDir = config[2];
  testDir = config[3];
  startWatcher(projectDir);
}
