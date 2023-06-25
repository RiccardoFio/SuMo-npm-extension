import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { provideVSCodeDesignSystem, allComponents } from "@vscode/webview-ui-toolkit";
import { vscode } from "src/app/utilities/vscode";

provideVSCodeDesignSystem().register(allComponents);
@Component({
  selector: 'app-mutation-operators',
  templateUrl: './mutation-operators.component.html',
  styleUrls: ['./mutation-operators.component.css']
})
export class MutationOperatorsComponent {

  form: FormGroup;
  operatorsData: Operator[] = [];

  get operatorsFormArray() {
    return this.form.controls['operators'] as FormArray;
  }

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      operators: new FormArray([])
    });
  }

  public addCheckboxes() {
    this.buildOperatorsList();
    this.operatorsData.forEach((operator) => this.operatorsFormArray.push(new FormControl(operator.check)));
  }

  submit() {
    const sumodir = document.getElementById('sumoDir') as HTMLInputElement | null;
    if (this.operatorsData.length !== 0) {
      const selectedOperators = this.form.value.operators
        .map((checked: any, i: number) => checked ? this.operatorsData[i].name : null)
        .filter((v: null) => v !== null);

      vscode.postMessage({
        command: "endConfig",
        text: [
          sumodir?.value,
          selectedOperators
        ]
      })
    }
    else {
      vscode.postMessage({
        command: "endConfig",
        text: [
          sumodir?.value,
          "empty"
        ]
      })
    }
  }

  buildOperatorsList() {
    let mutationOperators = document.getElementById("mutationOperators") as HTMLInputElement;
    let jsonOperators = JSON.parse(mutationOperators.value);

    for (var operator in jsonOperators) {
      this.operatorsData.push(new Operator(operator, jsonOperators[operator]))
      //console.log(operator + " -> " + jsonOperators[operator]);
    }
  }

  public toggle() {
    let togle = document.getElementById("toggleAll") as HTMLInputElement;

    this.operatorsFormArray.controls.map(control => {
      control.setValue(togle.checked);
    });
  }

  isAllChecked() {
    let allCheck: boolean = true
    this.operatorsFormArray.controls.map(control => {
      control.value === false ? allCheck = false : null;
    });

    return allCheck;
  }
}

class Operator {

  name: string;
  longName: string;
  check: boolean;

  constructor(name: string, check: boolean) {
    this.name = name;
    this.longName = "";
    this.check = check;

    switch (name) {
      case "ACM": { this.longName = "Argument Change of overloaded Method call"; break; }
      case "AMR" : { this.longName = "Array Member Replacement"; break; }
      case "AOR": { this.longName = "Assignment Operator Replacement"; break; }
      case "AVR": { this.longName = "Address Value Replacement"; break; }
      case "BCRD": { this.longName = "Break and Continue Replacement and Deletion"; break; }
      case "BOR": { this.longName = "Binary Operator Replacement"; break; }
      case "BVR": { this.longName = "Boolean Value Replacement"; break; }
      case "CAO": { this.longName = "Compound Assignment Optimization"; break; }
      case "CBD": { this.longName = "Catch Block Deletion"; break; }
      case "CER": { this.longName = "Casting Expression Replacement"; break; }
      case "CSC": { this.longName = "Conditional Statement Change"; break; }
      case "DLO": { this.longName = "Data Location Optimization"; break; }
      case "DOD": { this.longName = "Delete Operator Deletion"; break; }
      case "EED": { this.longName = "Event Emission Deletion"; break; }
      case "EHD": { this.longName = "Exception Handling Statement Deletion"; break; }
      case "ER": { this.longName = "Enum Replacement"; break; }
      case "FVO": { this.longName = "Function Visibility Optimization"; break; }
      case "GVR": { this.longName = "Global Variable Replacement"; break; }
      case "HLR": { this.longName = "Hexadecimal Literal Replacement"; break; }
      case "ICM": { this.longName = "Increments Mirror"; break; }
      case "ISD": { this.longName = "Initialization Statement Deletion"; break; }
      case "LSC": { this.longName = "Loop Statement Change"; break; }
      case "PKD": { this.longName = "Payable Keyword Deletion"; break; }
      case "PLR": { this.longName = "Precision Loss Replacement"; break; }
      case "MCR": { this.longName = "Mathematical and Cryptographic function Replacement"; break; }
      case "MOD": { this.longName = "Modifier Deletion"; break; }
      case "MOI": { this.longName = "Modifier Insertion"; break; }
      case "NVR": { this.longName = "Number Value Replacement"; break; }
      case "OLFD": { this.longName = "Overloaded Function Deletion"; break; }
      case "OMD": { this.longName = "Overridden Modifier Deletion"; break; }
      case "ORFD": { this.longName = "Overridden Function Deletion"; break; }
      case "RRI": { this.longName = "Revoke Role Insertion"; break; }
      case "RSD": { this.longName = "Return Statement Deletion"; break; }
      case "RSI": { this.longName = "Require Statement Insertion"; break; }
      case "RVS": { this.longName = "Return Values Swap"; break; }
      case "SCEC": { this.longName = "Switch Call Expression Casting"; break; }
      case "SFID": { this.longName = "Selfdestruct Function Insertion Deletion"; break; }
      case "SKID": { this.longName = "Super Keyword Insertion Deletion"; break; }
      case "SVR": { this.longName = "String Value Replacement"; break; }
      case "TOR": { this.longName = "Transaction Origin Replacement"; break; }
      case "TRC": { this.longName = "Transfer Return Check"; break; }
      case "UBO": { this.longName = "Unchecked Block Optimization"; break; }
      case "UORD": { this.longName = "Unary Operator Replacement and Deletion"; break; }
      case "VUR": { this.longName = "Variable Unit Replacement"; break; }
      case "VVO": { this.longName = "Variable Visibility Optimization"; break; }
      default:
        break;
    }
  }
}
