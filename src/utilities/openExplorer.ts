import { window } from "vscode";
import { ConfigurationPanel } from "../panels/ConfigurationPanel";
import { dirFilesPathJSON, checkIfDirIsPresent, removeDirPathFromSigleFilePath, win32PathConverter } from "./getFilesPath";

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
    path = win32PathConverter(choose[0].path);
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
