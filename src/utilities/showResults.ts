import { readdirSync, readFileSync } from 'fs';
import * as vscode from 'vscode';
import { liveDecorationType, variantDecorationType, variantDiagnostics } from '../extension';
import { filterFiles, win32PathConverter } from './getFilesPath';

let timeout: NodeJS.Timer | undefined = undefined;

let activeEditor = vscode.window.activeTextEditor;
let activeEditorFilename: string | undefined = activeEditor?.document.fileName;
let activeDocument: vscode.TextDocument;

let projectDir: string | undefined = undefined;

const filters: string[] = [".json"];
let filteredFiles: string[] = [];

let allVariantsJson: any[] = [];
let toShowVariantsJson: any[][] = [];
let page: number = 0;
let lastPage: number = 0;
const nResultsForPage = 1000;

/**
 * show results variants
 * @param projectPath the project directory path set by the user 
 * @param operatorsStatus the type of results to be shown
 *  */
export async function showResultsVariants(projectPath: string, operatorsStatus: string[]) {
	projectDir = projectPath;
	allVariantsJson = [];
	toShowVariantsJson = [];
	filteredFiles = [];
	page = 0;

	let promiseArr: any[] = [];

	if (operatorsStatus.length > 0) {
		try {
			operatorsStatus.forEach(status => {
				//find all files recursively in a directory
				let operatorsToShowPath = projectPath + '/.sumo/results/' + status + '/';
				let allOperators = readdirSync(operatorsToShowPath);
				//filter the files list
				filters.forEach(filter => {
					filteredFiles = filterFiles(filter, allOperators);
				});

				promiseArr = promiseArr.concat(filteredFiles.map(async function (resource) {
					const res = await readJsonFile(operatorsToShowPath + resource);
					return res;
				}));
			});

			await Promise.all(promiseArr).then(function (resultsArray) {
				allVariantsJson = resultsArray;
			}).catch(function (err) {
				console.log("error: " + err);
			});

		} catch {
			vscode.window.showErrorMessage("ERROR: '.sumo/results/' folder/subfolders does not exist!");
		}
	}
	if (activeEditor) {
		editorChanged(activeEditor);
	}
}

function updateDecorations() {
	if (!activeEditor) {
		return;
	} else {
		const diagnostics: vscode.Diagnostic[] = [];
		activeEditor.setDecorations(vscode.window.createTextEditorDecorationType({}), []);
		const foundVariants: vscode.DecorationOptions[] = [];
		const foundLive: vscode.DecorationOptions[] = [];
		var pathElements: string[];
		var projectPathBaseDir: string = "";
		if (typeof projectDir === 'string') {
			pathElements = projectDir.replace(/\/$/, '').split('/');
			projectPathBaseDir = pathElements[pathElements.length - 1]
		}
		toShowVariantsJson[page].forEach(variant => {
			let relativeVariantPath = variant.file.split(projectPathBaseDir)[1];
			if (activeEditorFilename?.toLowerCase().endsWith(relativeVariantPath.toLowerCase())) {

				const startPos = activeEditor ? activeEditor.document.positionAt(variant.start) : new vscode.Position(0, 0);
				const endPos = activeEditor ? activeEditor.document.positionAt(variant.end) : new vscode.Position(0, 0);
				const range = new vscode.Range(startPos, endPos);

				diagnostics.push(createDiagnostic(range, variant));

				const decoration = {
					range: new vscode.Range(startPos, startPos)
				};
				variant.status === "live" ? foundLive.push(decoration) : foundVariants.push(decoration);
			}
		});

		if (liveDecorationType && variantDecorationType) {
			//set decorations only if there is no LIVE mutators in the same line
			activeEditor?.setDecorations(variantDecorationType, foundVariants.filter(function (entry1) {
				return !foundLive.some(function (entry2) { return entry1.range.start.line === entry2.range.start.line; });
			}));
			vscode.window.showInformationMessage(`INFO: You're visualizing page ${page + 1} out of ${lastPage + 1}!`);

			//set decorations on LIVE mutators live
			activeEditor?.setDecorations(liveDecorationType, foundLive);
		}
		variantDiagnostics.set(activeDocument.uri, diagnostics);
	}
}

// export function hideAliveVariants() {
// 	variantsJson = [];
// 	filteredFiles = [];
// 	variantDiagnostics.clear();
// 	triggerUpdateDecorations();
// }

function triggerUpdateDecorations(throttle = false) {
	if (timeout) {
		clearTimeout(timeout);
		timeout = undefined;
	}
	if (throttle) {
		timeout = setTimeout(updateDecorations, 500);
	} else {
		updateDecorations();
	}
}

export function editorChanged(editor: vscode.TextEditor) {
	if (editor) {
		activeEditor = editor;
		activeEditorFilename = win32PathConverter(editor.document.fileName);
		activeDocument = editor.document;

		filterVariantsPerFile(activeEditor.document.uri.path.substring(activeEditor.document.uri.path.lastIndexOf("/") + 1));

		variantDiagnostics.clear();
		triggerUpdateDecorations();
	}
}

function filterVariantsPerFile(filename: string) {
	const resultsArray = allVariantsJson.filter(a => String(a.file).endsWith(filename));
	let r = 0;
	for (let index = 0; index < Math.ceil(resultsArray.length / nResultsForPage); index++) {
		toShowVariantsJson[index] = [];
		lastPage = index;
	}
	let r2 = 0;
	resultsArray.forEach(result => {
		toShowVariantsJson[Math.floor(r / nResultsForPage)][r2] = result;
		r++;
		r2++;
		if (r2 === nResultsForPage) {
			r2 = 0;
		}
	});
}

export function turnPage() {
	if (toShowVariantsJson.length > 1) {
		if ((page + 1) > lastPage) {
			page = 0;
		} else {
			page++;
		}
		variantDiagnostics.clear();
		triggerUpdateDecorations();
	}
}

async function readJsonFile(path: string) {
	const file = readFileSync(path, 'utf8');
	return JSON.parse(file);
}

function createDiagnostic(range: vscode.Range, variant: any): vscode.Diagnostic {
	const message = `Operator: ` + (variant.operator).trim() +
		`, \nOriginal: ` + (variant.original).trim() +
		`, \nReplacement: ` + (variant.replace).trim() +
		`, \nStatus: ` + (variant.status).trim();
	const diagnostic = new vscode.Diagnostic(
		range,
		message,
		variant.status === "live" ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Information);
	diagnostic.code = variant.id;
	// diagnostic. code - relatedInformation - source - tags
	return diagnostic;
}