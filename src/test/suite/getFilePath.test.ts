import { expect } from 'chai';
import * as vscode from 'vscode';
import { filterFiles, win32PathConverter, pathSplitIntoArrays, removeDirPathFromMultipleFilesPath, dirFilesPathJSON, removeElementsDuplicationFromArray } from "../../utilities/getFilesPath";

suite('getFilePath Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');
	const path = require("path");

	suite('filtertFiles', () =>  {
		test('Should filter the files based on the specified file extention', () => {
			let paths: string[] = ["test.json", "dog.txt", "cat.json"];
			let extension: string = ".json";
			expect(filterFiles(extension, paths)).to.be.an('array').that.does.not.include("dog.txt");
	
		});
	});

	suite('win32PathConverter', () =>  {
		test('Should replace \\ to / if we are in a windows os', () => {
			if (process.platform === "win32") {
				let win32Path = 'C:\\Users\\Test\\Sumo';
				expect(win32PathConverter(win32Path)).to.be.equal('C:/Users/Test/Sumo');
	
			} else {
				let linuxPath = 'C:/Users/Test/Sumo';
				expect(win32PathConverter(linuxPath)).to.be.equal('C:/Users/Test/Sumo');
	
			}
		});
	});

	suite('pathSplitIntoArrays', () =>  {
		test('Should split a path into an array', () => {
			expect(pathSplitIntoArrays(['/home/sumo/test'])).to.deep.equal([['home'], ['home', 'sumo'], ['home', 'sumo', 'test']]);
	
		});
	});
	
	suite('removeDirPathFromFilesPath', () =>  {
		test('Should remove the directory path from the files path', () => {
			const dirPath = 'C:/Users/Test/sumo-tool/.sumo/baseline/contracts';
			const files = ["C:/Users/Test/sumo-tool/.sumo/baseline/contracts/CovertLib.sol", "C:/Users/Test/sumo-tool/.sumo/baseline/contracts/MetaCoin.sol"];
			expect(removeDirPathFromMultipleFilesPath(dirPath, files)).to.deep.equal(["/CovertLib.sol", "/MetaCoin.sol"]);
	
		});
	});
	
	suite('removeElementsDuplicationFromArray', () =>  {
		test('Should remove element duplication from an array', ()=>{
			expect(removeElementsDuplicationFromArray([['A'], ['B'], ['C'], ['A']])).to.deep.equal([['A'], ['B'], ['C']]);
			 
		});
	});

	suite('dirFilesPathJSON', () =>  {
		test('Should return a json with the paths of all files presents inside a directory filtered by extension', () => {
			var fs = require('fs');
			
			const dirPath = process.platform === "win32" ? path.resolve(__dirname,'../../../src/test/test_sumo') : 'src/test/test_sumo';

			fs.mkdirSync(dirPath);
			fs.writeFileSync(dirPath + '/file.json', "");
			fs.writeFileSync(dirPath + '/file2.json', "");
			fs.writeFileSync(dirPath + '/file3.txt', "");
	
			let result = '[["file.json"],["file2.json"]]';
			
			expect(dirFilesPathJSON(dirPath, ['json'])).to.deep.equal(result);
	
			fs.rmSync(dirPath, { recursive: true, force: true });
		});
	
		test('Should return undefined if directory does not exit', () => {
			const dirPath = 'src/test/no_test_sumo';
			let result = "undefined";
			
			expect(dirFilesPathJSON(dirPath, ['json'])).to.deep.equal(result);
		});
	});
});
