import * as vscode from 'vscode';
import { unwatchFile, watchFile, readFileSync } from 'fs';
import { join } from 'path';
import { showResultsVariants } from './showResults';

// npm --prefix <path-to--sumo-tool> run sumo <command>
let lastCommand: string;

//watcher for the visualization of results if some SuMo command is run outside the extension
export function startWatcher(projectPath: string) {
    watchFile(join(projectPath, "sumo/results/report.txt"), (curr, prev) => {
        showResults(projectPath);
    });
}

export function stopWatcher(projectPath: string) {
    if (projectPath !== "") { unwatchFile(join(projectPath, "sumo/results/report.txt")); }
}

export function runSumoCommand(sumoPath: string, command: string, firstParameter?: any, secondParameter?: any) {
    //find if there is an instance of SuMo terminal already open
    let sumoTerminal: vscode.Terminal | undefined = vscode.window.terminals.find((terminal) => terminal.name === 'SuMo terminal');

    //if there is no SuMo terminal instance open, a new one will be created
    if(sumoTerminal === undefined) {
        sumoTerminal = vscode.window.createTerminal({
            name: `SuMo terminal`,
        });
    }

    if ((firstParameter === null || firstParameter === undefined) && (secondParameter === null || secondParameter === undefined)) {
        sumoTerminal.sendText("npx sumo " + command);
    }
    else if ((firstParameter !== null || firstParameter !== undefined) && (secondParameter === null || secondParameter === undefined))  {
        sumoTerminal.sendText("npx sumo " + command + " " + firstParameter);
    }    
    else if ((firstParameter !== null || firstParameter !== undefined) && (secondParameter !== null || secondParameter !== undefined)) {
        sumoTerminal.sendText("npx sumo " + command + " " + firstParameter + " " + secondParameter);
    }

    sumoTerminal.show();
    lastCommand = command;
}

function showResults(projectPath: string) {
    switch (lastCommand) {
        case "test":
            // if last line og report.txt include "SuMo test done" 
            try {
                const reportEnd = readFileSync(join(projectPath, "sumo/results/report.txt"), 'utf8').substring(-17);
                if (reportEnd.includes("SuMo test done")) { showResultsVariants(projectPath, ['live']); }
            } catch (error) { }
            break;
        /*case "preflight":
            var setting: vscode.Uri = vscode.Uri.parse("file:" + projectPath + "/sumo/results/generated.csv");
            vscode.workspace.openTextDocument(setting).then((a: vscode.TextDocument) => {
                vscode.window.showTextDocument(a, 1, false);
            });
            break;*/
    }
}
