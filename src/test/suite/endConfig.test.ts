import { expect } from 'chai';
import * as vscode from 'vscode';
import { endConfigMutationOperators, endConfig } from '../../utilities/endCongif';

suite('SuMo Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    var fs = require('fs');
    const path = require("path");

    let fakeSumoPath = process.platform === "win32" ? path.resolve(__dirname,'../../../src/test/test_sumo') : 'src/test/test_sumo';

    suiteSetup(function () {
        fs.mkdirSync(fakeSumoPath);
        fs.mkdirSync(fakeSumoPath + "/src");
        fs.mkdirSync(fakeSumoPath + '/node_modules');
        fs.writeFileSync(fakeSumoPath + '/package.json', "{\"name\":\"SuMo\"}");
    });

    suiteTeardown(function () {
        fs.rmSync(fakeSumoPath, { recursive: true, force: true });
    });

    suite("endConfig: Setting the config files for SUMO tool", () => {

        test('Should write into the config.js file based on the user preferences', () => {
            fs.writeFileSync(fakeSumoPath + '/src/config.js', "");
            let config: any[] = ['/metacoin-box', '/build', '/contracts', '/test', ['contracts/Migrations.sol'],
                ["/test/TestMetaCoin.sol"], '3000', 'ganache', 'truffle', true, false, fakeSumoPath];

            endConfig(config);

            let expectedFileContent: string = `module.exports = { 
                sumoDir: '/metacoin-box/.sumo',
                projectDir: '/metacoin-box',
                buildDir: '/build',
                contractsDir: '/contracts',
                testDir: '/test',
                skipContracts: ['contracts/Migrations.sol'],
                skipTests: ['/test/TestMetaCoin.sol'],
                testingTimeOutInSec: 3000,
                network: 'ganache',
                testingFramework: 'truffle',
                optimized: true,
                tce: false,
                contractsGlob: '/**/*.sol',
                packageManagerGlob: ['/package-lock.json', '/yarn.lock'],
                testsGlob:  '/**/*.{js,sol,ts}'
            }`.replace(/\s/g, '').trim();

            let actualFileContent = fs.readFileSync(fakeSumoPath + "/src/config.js", 'utf8').replace(/\s/g, '').trim();

            expect(actualFileContent).to.deep.equal(expectedFileContent);
        });
    });

    suite("endConfigMutationOperators: Setting the config files for the mutation operators to use", () => {
        
        test("Should write into the operators.config.js file based on the user's selected operators ", () => {
            fs.writeFileSync(fakeSumoPath + '/src/operators.config.json',
            "{\"ACM\":false,\"AOR\":false,\"AVR\":false,\"DLR\":false,\"FVR\":false,\"GVR\":false,\"SKD\":false,\"SKI\":false,\"SLR\":false,\"TOR\":false,\"UORD\":false,\"VUR\":false,\"VVR\":false}");
            
            let jsonOperatorsToEnable = '[ACM, TOR, UORD]';
            
            endConfigMutationOperators(fakeSumoPath, jsonOperatorsToEnable);

            let jsonFileContent = JSON.parse(fs.readFileSync(fakeSumoPath + "/src/operators.config.json", 'utf8'));

            for(var operator in jsonFileContent){
                if(jsonOperatorsToEnable.includes(operator)){
                    expect(jsonFileContent[operator]).to.be.true;
                }
                else {
                    expect(jsonFileContent[operator]).to.be.false;
                }
            }
        });

    });
});
