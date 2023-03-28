import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import * as vscode from "vscode";
import { win32PathConverter } from "./getFilesPath";

export function checkSuMoPath(sumoPath: string) {
  if (sumoPath === "") {
    vscode.window.showErrorMessage("ERROR: SuMo folder not set! Please, run the setSumoPath command.");
    return false;
  }

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
        if (packageJson.name === "SuMo") {
          packageJsonIsPresent = true;
        }
      }
    });
  } catch (err) {
    vscode.window.showErrorMessage("ERROR: SuMo folder not correctly set! Please, run the setSumoPath command.");
    return false;
  }

  if (nodeModulesDirIsPresent && packageJsonIsPresent) {
    return true;
  }

  vscode.window.showErrorMessage("ERROR: This is not the SuMo folder or it is not installed yet! Follow the instructions on SuMo doc: https://github.com/MorenaBarboni/SuMo-SOlidity-MUtator");
  return false;
}

export function checkSuMoConfig(projectDir: string) {
  projectDir = win32PathConverter(projectDir);
  try {
    clearRequireCache(projectDir + '/.sumo/config.js');
    const projConf = require(projectDir + '/.sumo/config.js');
    if (projConf.projectDir !== "" && projConf.buildDir !== "" && projConf.contractsDir !== "" && projConf.testDir !== "") {
      return true;
    }
    return false;
  }
  catch {
    vscode.window.showErrorMessage("ERROR: Configuration not found! Run SuMo configuration command.");
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
