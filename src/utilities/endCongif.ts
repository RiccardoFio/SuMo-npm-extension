import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import * as vscode from 'vscode';
import { setProjectDir } from '../extension';
import { checkSuMoPath } from './sumoPathHandler';

/**
 * A helper function which will get the webview URI of a given file or resource.
 *
 */
export function endConfig(config: any[]) {
    // adds quotes to each element of the array to obtain the desired formattation
    config[4] = config[4].map((c: string) => { c = "'" + c + "'"; return c; });
    config[5] = config[5].map((c: string) => { c = "'" + c + "'"; return c; });

    // overwrite a file 
    let writeStr: string = `module.exports = { 
			sumoDir: '${config[0]}/.sumo',
			projectDir: '${config[0]}',
			buildDir: '${config[1]}',
			contractsDir: '${config[2]}',
			testDir: '${config[3]}',
			skipContracts: [${config[4]}],
			skipTests: [${config[5]}],
            testingTimeOutInSec: ${config[6]},
            network: '${config[7]}',
            testingFramework: '${config[8]}',
            optimized: ${config[9]},
            tce: ${config[10]},
            contractsGlob: '/**/*.sol',
            packageManagerGlob: ['/package-lock.json', '/yarn.lock'],
            testsGlob:  '/**/*.{js,sol,ts}'
		}`;
    let writeData: Uint8Array = Buffer.from(writeStr, 'utf8');
    //vscode.workspace.fs.writeFile(vscode.Uri.file(config[0] + "/.sumo/config.js"), writeData);

    // console.log(config[7]);
    let checkUndifinedValue: boolean = false;

    //check if there are undifined element
    config.forEach(element => {
        if (element === "undefined" || element === "") { checkUndifinedValue = true; }
    });

    if (checkSuMoPath(config[11]) && !checkUndifinedValue) {
        let sumoPath: any = config[11] + "/src/config.js";
        try {
            writeFileSync(sumoPath, writeData);
            mkdirSync(config[0]+"/.sumo", { recursive: true});
            writeFileSync(config[0]+"/.sumo/config.js", writeData,);
            setProjectDir(config);
            vscode.window.showInformationMessage("Configuration done correctly!");
        } catch (err) {
            vscode.window.showErrorMessage("ERROR: Something went wrong!");
        }
    } else {
        vscode.window.showErrorMessage("ERROR: Some fields are missing!");
    }
}

export function endConfigMutationOperators(sumoPath: string, jsonOperators: string) {
    if (checkSuMoPath(sumoPath) && jsonOperators !== "empty") {
        try {
            let operatorsStatus = JSON.parse(readFileSync(sumoPath + "/src/operators.config.json", 'utf8'));
            for(var operator in operatorsStatus){
                if(jsonOperators.includes(operator)){
                    operatorsStatus[operator] = true;
                } else {
                    operatorsStatus[operator] = false;
                }
            }

            writeFileSync(sumoPath + "/src/operators.config.json", JSON.stringify(operatorsStatus));
            vscode.window.showInformationMessage("Mutation operators set correctly!");
        }
        catch (err) {
            vscode.window.showErrorMessage("ERROR: Something went wrong!");
        }
    }
    else{
        vscode.window.showErrorMessage("ERROR: Somenthing went wrong! Try to reload the page.");
    }
}
