import { window } from "vscode";
import { ConfigurationPanel } from "../panels/ConfigurationPanel";
import { dirFilesPathJSON, checkIfDirIsPresent, removeDirPathFromSigleFilePath } from "./getFilesPath";

/**
 * A helper function which will get the webview URI of a given file or resource.
 *
 * @returns A URI pointing to the file/resource
 */
export async function openExplorer(message: string) {

  let messageContent: any = JSON.parse(message);

  const choose = await window.showOpenDialog({
    title: "Select the " + messageContent.dir + " folder",
    canSelectFolders: true,
    canSelectFiles: false,
    canSelectMany: false,
  });
  let path;
  if (choose !== undefined) {
    path = choose[0].path.substring(process.platform === "win32" ? 1 : 0);
  } else {
    path = "";
    window.showErrorMessage("ERROR: Something went wrong! Please try again :(");
  }

  if (messageContent.dir === "project") {
    ConfigurationPanel.sendDirPath(messageContent.dir + "Dir", path);
    ConfigurationPanel.sendDirPath("buildDir", checkIfDirIsPresent(path + "/build") ? "build" : "undefined");
    ConfigurationPanel.sendDirPath("contractsDir", checkIfDirIsPresent(path + "/contracts") ? "contracts" : "undefined");
    ConfigurationPanel.sendDirPath("testDir", checkIfDirIsPresent(path + "/test") ? "test" : "undefined");
    ConfigurationPanel.sendDirFilesPath("contractsFiles",dirFilesPathJSON("contracts", [".sol"]));
    ConfigurationPanel.sendDirFilesPath("testFiles",dirFilesPathJSON("test", [".js", ".ts", ".sol"]));
  } else if (messageContent.dir === "contracts") {
    ConfigurationPanel.sendDirFilesPath("contractsFiles",dirFilesPathJSON(path, [".sol"]));
  } else if (messageContent.dir === "test") {
    ConfigurationPanel.sendDirFilesPath("testFiles",dirFilesPathJSON(path, [".js", ".ts", ".sol"]));
  } else {
    ConfigurationPanel.sendDirPath(messageContent.dir + "Dir", removeDirPathFromSigleFilePath(messageContent.projectDir, path));
  }
}
