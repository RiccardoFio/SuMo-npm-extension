import { window } from "vscode";
import { ConfigurationPanel } from "../panels/ConfigurationPanel";
import { dirFilesPathJSON, checkIfDirIsPresent } from "./getFilesPath";

/**
 * A helper function which will get the webview URI of a given file or resource.
 *
 * @returns A URI pointing to the file/resource
 */
export async function openExplorer(dir: string) {
  const choose = await window.showOpenDialog({
    title: "Select the " + dir + " folder",
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
  ConfigurationPanel.sendDirPath(dir + "Dir", path);
  if (dir === "project") {
    ConfigurationPanel.sendDirPath("buildDir", checkIfDirIsPresent(path + "/build") ? path + "/build" : "undefined");
    ConfigurationPanel.sendDirPath("contractsDir", checkIfDirIsPresent(path + "/contracts") ? path + "/contracts" : "undefined");
    ConfigurationPanel.sendDirPath("testDir", checkIfDirIsPresent(path + "/test") ? path + "/test" : "undefined");
    ConfigurationPanel.sendDirFilesPath("contractsFiles",dirFilesPathJSON(path + "/contracts", [".sol"]));
    ConfigurationPanel.sendDirFilesPath("testFiles",dirFilesPathJSON(path + "/test", [".js", ".ts", ".sol"]));
  } else if (dir === "contracts") {
    ConfigurationPanel.sendDirFilesPath("contractsFiles",dirFilesPathJSON(path, [".sol"]));
  } else if (dir === "test"){
    ConfigurationPanel.sendDirFilesPath("testFiles",dirFilesPathJSON(path, [".js", ".ts", ".sol"]));
  }
}
