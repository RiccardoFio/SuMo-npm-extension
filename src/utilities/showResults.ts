import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import { liveDecorationType, multipleVariantsDecorationType, variantDecorationType, toBeTestedDecorationType, variantDiagnostics } from '../extension';
import { win32PathConverter } from './getFilesPath';

let timeout: NodeJS.Timer | undefined = undefined;

let activeEditor = vscode.window.activeTextEditor;
let activeEditorFilename: string | undefined = activeEditor?.document.fileName;
let activeDocument: vscode.TextDocument;

let projectDir: string | undefined = undefined;

let filteredFiles: string[] = [];

let allVariantsJson: any[] = [];
let toShowVariantsJson: any[][] = [];
let page: number = 0;
let lastPage: number = 0;
const nResultsForPage = 480;

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

	if (operatorsStatus.length > 0) {
		try {
			operatorsStatus.forEach(status => {
				const selectedstatus = status === "toBeTested" ? null : status;
				//Read results from mutation.json file
				let allOperators2 = readJsonFile(projectPath + '/sumo/results/mutations.json');

				for( let contract in allOperators2) {
					allOperators2[contract].forEach((mutation: any) => {
						if(mutation.status === selectedstatus) {
							allVariantsJson.push(mutation);
						}
					});
				}
			});
		} catch {
			vscode.window.showErrorMessage("ERROR: '/sumo/results/mutations.json' file does not exist!");
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
		const foundTBT: vscode.DecorationOptions[] = [];
		var pathElements: string[];
		var projectPathBaseDir: string = "";

		if (typeof projectDir === 'string') {
			pathElements = projectDir.replace(/\/$/, '').split('/');
			projectPathBaseDir = pathElements[pathElements.length - 1];
		}

		if(toShowVariantsJson.length > 0) {
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

					switch (variant.status) {
						case "live": foundLive.push(decoration); break;
						case null: foundTBT.push(decoration); break;
						default: foundVariants.push(decoration); break;
					}
				}
			});
			vscode.window.showInformationMessage(`INFO: You're visualizing page ${page + 1} out of ${lastPage + 1}!`);
		}
		
		if (liveDecorationType && variantDecorationType && multipleVariantsDecorationType && toBeTestedDecorationType) {

			//set decorations on line where there are multiple mutators
			activeEditor?.setDecorations(multipleVariantsDecorationType, filterMoreVariantsSameLine(foundVariants.concat(foundLive).concat(foundTBT)));

			//set decorations on LIVE mutators live
			activeEditor?.setDecorations(liveDecorationType, foundLive);

			//set decorations on 'toBeTested' mutators live
			activeEditor?.setDecorations(toBeTestedDecorationType, foundTBT);

			//set decorations only if there is no LIVE mutators in the same line
			activeEditor?.setDecorations(variantDecorationType, foundVariants.filter(function (entry1) {
				return !foundLive.some(function (entry2) { return entry1.range.start.line === entry2.range.start.line; });
			}));
		}
		variantDiagnostics.set(activeDocument.uri, diagnostics);
	}
}

function filterMoreVariantsSameLine(variantsDecoration: vscode.DecorationOptions[]): vscode.DecorationOptions[] {
	const sameLines = variantsDecoration.filter((variant, index, arr) =>
	  arr.some((p, i) => i !== index && p.range.start.line === variant.range.start.line)
	);
  
	return variantsDecoration.filter(variant =>
	  sameLines.some(p => p.range.start.line === variant.range.start.line)
	);
  }

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

		const pathElements = projectDir!.replace(/\/$/, '').split('/');
		const projectPathBaseDir = pathElements[pathElements.length - 1];

		filterVariantsPerFile(activeEditor.document.uri.path.split(projectPathBaseDir)[1]);

		variantDiagnostics.clear();
		triggerUpdateDecorations();
	}
}

function filterVariantsPerFile(filename: string) {
	let resultsArray = allVariantsJson.filter(a => String(a.file).endsWith(filename)).sort((a,b) => a.start - b.start);;

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

function readJsonFile(path: string) {
	const file = readFileSync(path, 'utf8');
	return JSON.parse(file);
}

function createDiagnostic(range: vscode.Range, variant: any): vscode.Diagnostic {
	const message = `Operator: ` + (variant.operator).trim() +
		`, \nOriginal: ` + (variant.original).trim() +
		`, \nReplacement: ` + (variant.replace).trim() +
		`, \nStatus: ` + (variant.status);
	const diagnostic = new vscode.Diagnostic(
		range,
		message,
		variant.status === "live" ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Information);
	diagnostic.code = variant.id;
	// diagnostic. code - relatedInformation - source - tags
	return diagnostic;
}
