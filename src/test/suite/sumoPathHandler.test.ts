import * as assert from 'assert';
import { expect } from 'chai';
import { suiteSetup, suiteTeardown } from 'mocha';
import * as vscode from 'vscode';
import { checkSuMoPath, checkSuMoConfig } from "../../utilities/sumoPathHandler";

suite('sumoPathHandler Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    const path = require("path");

    let fakeSumoPath = process.platform === "win32" ?
        path.resolve(__dirname, '../../../src/test/test_sumo') : path.resolve('src/test/test_sumo');
    let fakeProjectPath = process.platform === "win32" ?
        path.resolve(__dirname, '../../../src/test/test_project') : path.resolve('src/test/test_project');
    var fs = require('fs');

    suiteSetup(function () {
        fs.mkdirSync(fakeSumoPath);
        fs.mkdirSync(fakeSumoPath + "/src");
        fs.writeFileSync(fakeSumoPath + '/package.json', "");
        fs.mkdirSync(fakeProjectPath);
    });

    suiteTeardown(function () {
        fs.rmSync(fakeSumoPath, { recursive: true, force: true });
        fs.rmSync(fakeProjectPath, { recursive: true, force: true });
    });

    suite("checkSumoPath: Checks if the SuMo tool is installed correctly", () => {

        test('should return false on empty string/undefined sumo path!', () => {
            let sumoPath = "";
            const expectedResult = false;
            const result = checkSuMoPath(sumoPath);
            assert.strictEqual(result, expectedResult);

        });

        test('should return false if node_modules folder is not present', () => {
            fs.writeFileSync(fakeSumoPath + '/package.json', "{\"name\":\"@morenabarboni/sumo\"}");
            expect(checkSuMoPath(fakeSumoPath)).to.be.false;
            fs.unlinkSync(fakeSumoPath + '/package.json');
        });

        test('should return false if package,json is not present', () => {
            fs.mkdirSync(fakeSumoPath + '/node_modules');
            expect(checkSuMoPath(fakeSumoPath)).to.be.false;
            fs.rmSync(fakeSumoPath + '/node_modules', { recursive: true, force: true });
        });

        test('should return false if all present but project name is not "SuMo"', () => {
            fs.mkdirSync(fakeSumoPath + '/node_modules');
            fs.writeFileSync(fakeSumoPath + '/package.json', "{\"name\":\"No_SuMo\"}");
            expect(checkSuMoPath(fakeSumoPath)).to.be.false;
            fs.rmSync(fakeSumoPath + '/node_modules', { recursive: true, force: true });
            fs.unlinkSync(fakeSumoPath + '/package.json');
        });

        test('should return true if the sumo path is set correctly', () => {
            fs.mkdirSync(fakeSumoPath + '/node_modules');
            fs.writeFileSync(fakeSumoPath + '/package.json', "{\"name\":\"@morenabarboni/sumo\"}");
            expect(checkSuMoPath(fakeSumoPath)).to.be.true;
        });
    });

    suite("checkSumoConfig:Checks if SuMo configuration file is correctly sected", () => {

        test('should return false if config file not exist', () => {
            expect(checkSuMoConfig(fakeProjectPath)).to.be.false;
        });

        test('should return true if all fields of configuration file are compiled', () => {
            let data: string = `module.exports = { 
                buildDir: 'build',
                contractsDir: 'con',
                testDir: 'test'
            }`;
            
            fs.writeFileSync(fakeProjectPath + '/sumo-config.js', data);

            expect(checkSuMoConfig(fakeProjectPath)).to.be.true;
            fs.unlinkSync(fakeProjectPath + '/sumo-config.js');
        });
    });
});
