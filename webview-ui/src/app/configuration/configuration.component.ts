import { Component } from "@angular/core";
import { provideVSCodeDesignSystem, allComponents } from "@vscode/webview-ui-toolkit";
import { TreeviewConfig, TreeviewItem } from "ngx-treeview";
import { vscode } from "src/app/utilities/vscode";

// In order to use the Webview UI Toolkit web components they
// must be registered with the browser (i.e. webview) using the
// syntax below.
// provideVSCodeDesignSystem().register(vsCodeButton());

// To register more toolkit components, simply import the component
// registration function and call it from within the register
// function, like so:
//
// provideVSCodeDesignSystem().register(
//   vsCodeButton(),
//   vsCodeTextField()
// );
//
// Finally, if you would like to register all of the toolkit
// components at once, there's a handy convenience function:
//
provideVSCodeDesignSystem().register(allComponents);

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent {
  show: boolean = false;

  title = "SuMo tool configuration";
  default: string = 'Yes';
  config = TreeviewConfig.create({
    hasAllCheckBox: true,
    hasFilter: true,
    hasCollapseExpand: true,
    maxHeight: 300
  });
  contracts: TreeviewItem[] = [];
  tests: TreeviewItem[] = [];
  skipContracts: any[] = [];
  skipTests: any[] = [];

  buildTree(target: string) {
    const dirFiles = document.getElementById(target) as HTMLInputElement | null;
    const pathsString = dirFiles?.value;
    let paths: any[] = [];
    if (pathsString != undefined) {
      paths = JSON.parse(pathsString);
    }
    if (target === "contractsFiles") {
      this.contracts = [];
    } else if (target == "testFiles") {
      this.tests = [];
    }
    this.arrangeIntoTree(paths, target);
  }

  /*showLog(input: any) {
    console.log(this.skipTests);
    console.log(input);
  }*/

  arrangeIntoTree(paths: any[], target: string) {
    const targetDir = target == "contractsFiles" ?
      document.getElementById('contractsDir') as HTMLInputElement | null :
      document.getElementById('testDir') as HTMLInputElement | null;
    const targetDirPath = targetDir?.value;

    for (let i = 0; i < paths.length; i++) {
      let path = paths[i];
      let currentLevel = target == "contractsFiles" ? this.contracts : this.tests;

      for (let j = 0; j < path.length; j++) {
        let part = path[j];
        const partPath = path.join("/");
        let existingPath = this.findWhere(currentLevel, 'text', part);

        if (existingPath) {
          currentLevel = existingPath.children;
        } else {
          let newPart;
          if ((i + 1) == paths.length) {
            newPart = new TreeviewItem({ text: part, value: partPath, checked: false });
          } else if ((j + 1) == path.length && paths[i + 1][j] != path[j]) {
            newPart = new TreeviewItem({ text: part, value: partPath, checked: false });
          } else {
            let children: TreeviewItem[] = [new TreeviewItem({ text: "", value: "", checked: false })];
            newPart = new TreeviewItem({ text: part, value: "", children: children, checked: false });
            newPart.children.pop();
          }

          currentLevel.push(newPart);
          currentLevel = newPart.children;
        }
      }
    }
  }

  findWhere(array: any[], key: string, value: any) {
    let t = 0; // t is used as a counter
    while (t < array.length && array[t][key] !== value) { t++; }; // find the index where the id is the as the aValue

    if (t < array.length) {
      return array[t];
    } else {
      return false;
    }
  }

  checkTrueIfPathIsPresent(array: TreeviewItem[], skipArray: any[], value: string) {
    array.forEach(o => {
      if (value === o.value) {
        o.checked = true;
        skipArray.push(o.value);
      } else if (o.children !== undefined) {
        this.checkTrueIfPathIsPresent(o.children, skipArray, value)
      }
    });
  }

  async initializeConfig() {
    const elementConfig = document.getElementById("actualConfig") as HTMLInputElement;
    const actualConfig = JSON.parse(elementConfig.value);
    document.getElementById('testingTimeOutInSec')?.setAttribute("value", actualConfig.testingTimeOutInSec);
    const networkSelect = document.getElementById('network') as HTMLSelectElement | null;
    for (let index = 0; index < (networkSelect ? networkSelect.options.length : 0); index++) {
      if (networkSelect != null)
        if (networkSelect.options[index]?.ariaLabel == actualConfig.network)
          networkSelect.selectedIndex = index;
    }
    const frameworkSelect = document.getElementById('testingFramework') as HTMLSelectElement | null;
    for (let index = 0; index < (frameworkSelect ? frameworkSelect.options.length : 0); index++) {
      if (frameworkSelect != null)
        if (frameworkSelect.options[index]?.ariaLabel == actualConfig.testingFramework)
          frameworkSelect.selectedIndex = index;
    }
    if (actualConfig.optimized) {
      document.getElementsByName('optimized')[0].ariaChecked = "true";
      document.getElementsByName('optimized')[0].setAttribute("current-checked", "true");
      document.getElementsByName('optimized')[1].ariaChecked = "false";
      document.getElementsByName('optimized')[1].setAttribute("current-checked", "false");
    } else if (!actualConfig.optimized) {
      document.getElementsByName('optimized')[0].ariaChecked = "false";
      document.getElementsByName('optimized')[0].setAttribute("current-checked", "false");
      document.getElementsByName('optimized')[1].ariaChecked = "true";
      document.getElementsByName('optimized')[1].setAttribute("current-checked", "true");
    }
    if (actualConfig.tce) {
      document.getElementsByName('tce')[0].ariaChecked = "true";
      document.getElementsByName('tce')[0].setAttribute("current-checked", "true");
      document.getElementsByName('tce')[1].ariaChecked = "false";
      document.getElementsByName('tce')[1].setAttribute("current-checked", "false");
    } else if (!actualConfig.tce) {
      document.getElementsByName('tce')[0].ariaChecked = "false";
      document.getElementsByName('tce')[0].setAttribute("current-checked", "false");
      document.getElementsByName('tce')[1].ariaChecked = "true";
      document.getElementsByName('tce')[1].setAttribute("current-checked", "true");
    }
    //delay to avoid that ngx-treeview element at the start empty the skip arrays
    await this.delay(500);
    //check the contracts that were excluded and put them in the skipContracts array
    actualConfig.skipContracts.forEach((contract: string) => {
      this.checkTrueIfPathIsPresent(this.contracts, this.skipContracts, contract);
    });
    //check the tests that were excluded and put them in the skipTests array
    actualConfig.skipTests.forEach((test: string) => {
      this.checkTrueIfPathIsPresent(this.tests, this.skipTests, test);
    });
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  openExplorer(dir: string) {
    const projectDir = document.getElementById('projectDir') as HTMLInputElement | null;
    const message: string = JSON.stringify({dir: dir, projectDir: projectDir?.value});

    console.log(message);

    vscode.postMessage({
      command: "openExplorer",
      text: message
    });
  }

  endConfig() {
    const projectDir = document.getElementById('projectDir') as HTMLInputElement | null;
    const buildDir = document.getElementById('buildDir') as HTMLInputElement | null;
    const contractsDir = document.getElementById('contractsDir') as HTMLInputElement | null;
    const testDir = document.getElementById('testDir') as HTMLInputElement | null;
    const testingTimeOutInSec = document.getElementById('testingTimeOutInSec') as HTMLInputElement | null;
    const networkSelect = document.getElementById('network') as HTMLSelectElement | null;
    const network = networkSelect?.options[networkSelect?.selectedIndex];
    const testingFrameworkSelect = document.getElementById('testingFramework') as HTMLSelectElement | null;
    const testingFramework = testingFrameworkSelect?.options[testingFrameworkSelect?.selectedIndex];
    const optimized: string = this.getOption('optimized');
    const tce: string = this.getOption('tce');
    
    vscode.postMessage({
      command: "endConfig",
      text: [
        projectDir?.value,
        buildDir?.value,
        contractsDir?.value,
        testDir?.value,
        this.skipContracts,
        this.skipTests,
        testingTimeOutInSec?.value,
        network?.text,
        testingFramework?.text,
        optimized == "Yes" ? true : false,
        tce == "Yes" ? true : false,
      ]
    });
  }

  private getOption(option: string): string {
    let ret: string = "";
    document.getElementsByName(option).forEach(radio => {
      if (radio.ariaChecked == "true")
        ret = radio.innerText;
    });
    return ret;
  }
}
