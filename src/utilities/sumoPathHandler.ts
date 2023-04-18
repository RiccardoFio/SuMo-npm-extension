import { readFileSync } from "fs";
import * as vscode from "vscode";
import { win32PathConverter } from "./getFilesPath";

export function checkSuMoPath(sumoPath: string) {
  try {
    let packageJson = JSON.parse(readFileSync(sumoPath + "/package.json", 'utf8'));
    if (packageJson.name === "@morenabarboni/sumo") {
      return true;
    }
  } catch (err) {
    vscode.window.showErrorMessage("ERROR: SuMo is not installed in your project! Follow the instructions on SuMo doc: https://github.com/MorenaBarboni/SuMo-SOlidity-MUtator");
    return false;
  }

  vscode.window.showErrorMessage("ERROR: SuMo is not installed in your project! Follow the instructions on SuMo doc: https://github.com/MorenaBarboni/SuMo-SOlidity-MUtator");
  return false;
}

export function checkSuMoConfig(projectDir: string) {
  projectDir = win32PathConverter(projectDir);
  try {
    clearRequireCache(projectDir + '/sumo-config.js');
    const projConf = require(projectDir + '/sumo-config.js');
    return true;
  }
  catch {
    vscode.window.showErrorMessage("ERROR: SuMo configuration file not found! Try to install SuMo inside your project.");
    return false;
  }
}

// clear the cache of require function (update file content)
export function clearRequireCache(file: string) {
  Object.keys(require.cache).forEach(function (key) {
    if (win32PathConverter(key) === file) {
      delete require.cache[key];
    }
  });
}
