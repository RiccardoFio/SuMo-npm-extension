import * as vscode from 'vscode';
import { ConfigurationPanel } from "../panels/ConfigurationPanel";
import { dirFilesPathJSON, removeDirPathFromSigleFilePath, win32PathConverter } from "./getFilesPath";

export async function openExplorer(message: string) {

  let messageContent: any = JSON.parse(message);
  let path: string;

  const choose = await vscode.window.showOpenDialog({
    title: "Select the " + messageContent.dir + " folder",
    canSelectFolders: true,
    canSelectFiles: false,
    canSelectMany: false,
  });
  
  if (choose !== undefined) {
    path = win32PathConverter(choose[0].path);

    if(!path.includes(messageContent.projectDir)) {
      vscode.window.showWarningMessage("Sorry, you have to select a folder inside the project! Try again.");
      return;
    }
  }
  else {
    return;
  }

  if (messageContent.dir === "contracts") {
    ConfigurationPanel.sendDirPath(messageContent.dir + "Dir", removeDirPathFromSigleFilePath(messageContent.projectDir, path));
    ConfigurationPanel.sendDirFilesPath("contractsFiles", dirFilesPathJSON(path, [".sol"]));
  } else if (messageContent.dir === "test") {
    ConfigurationPanel.sendDirPath(messageContent.dir + "Dir", removeDirPathFromSigleFilePath(messageContent.projectDir, path));
    ConfigurationPanel.sendDirFilesPath("testFiles", dirFilesPathJSON(path, [".js", ".ts", ".sol"]));
  } else {
    ConfigurationPanel.sendDirPath(messageContent.dir + "Dir", removeDirPathFromSigleFilePath(messageContent.projectDir, path));
  }
}
