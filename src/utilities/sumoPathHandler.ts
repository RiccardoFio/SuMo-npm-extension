import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import * as vscode from "vscode";
import { win32PathConverter } from "./getFilesPath";

export function checkSuMoPath(sumoPath: string) {
  let nodeModulesDirIsPresent: boolean = false;
  let packageJsonIsPresent: boolean = false;

  try {
    readdirSync(sumoPath).forEach((file: any) => {

      const absolutePath = join(sumoPath, file);

      if (file === 'node_modules' && statSync(absolutePath).isDirectory()) {
        nodeModulesDirIsPresent = true;
      }
      if (file === 'package.json' && statSync(absolutePath).isFile()) {
        let packageJson = JSON.parse(readFileSync(absolutePath, 'utf8'));
        if (packageJson.name === "@morenabarboni/sumo") {
          packageJsonIsPresent = true;
        }
      }
    });
  } catch (err) {
    vscode.window.showErrorMessage("ERROR: SuMo is not installed in your project! Follow the instructions on SuMo doc: https://github.com/MorenaBarboni/SuMo-SOlidity-MUtator");
    return false;
  }

  if (nodeModulesDirIsPresent && packageJsonIsPresent) {
    return true;
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

// clear cache require function
export function clearRequireCache(file: string) {
  Object.keys(require.cache).forEach(function (key) {
    if (win32PathConverter(key) === file) {
      delete require.cache[key];
    }
  });
}
