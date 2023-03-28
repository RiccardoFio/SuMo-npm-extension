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
      case "AOR": { this.longName = "Assignment Operator Replacement"; break; }
      case "AVR": { this.longName = "Address Value Replacement"; break; }
      case "BCRD": { this.longName = "Break and Continue Replacement and Deletion"; break; }
      case "BLR": { this.longName = "Boolean Literal Replacement"; break; }
      case "BOR": { this.longName = "Binary Operator Replacement"; break; }
      case "CBD": { this.longName = "Catch Block Deletion"; break; }
      case "CCD": { this.longName = "Contract Constructor Deletion"; break; }
      case "CSC": { this.longName = "Conditional Statement Change"; break; }
      case "DLR": { this.longName = "Data Location Replacement"; break; }
      case "DOD": { this.longName = "Delete Operator Deletion"; break; }
      case "ECS": { this.longName = "Explicit Conversion to Smaller type"; break; }
      case "EED": { this.longName = "Event Emission Deletion"; break; }
      case "EHC": { this.longName = "Exception Handling Change"; break; }
      case "ER": { this.longName = "Enum Replacement"; break; }
      case "ETR": { this.longName = "Ether Transfer function Replacement"; break; }
      case "FVR": { this.longName = "Function Visibility Replacement"; break; }
      case "GVR": { this.longName = "Global Variable Replacement"; break; }
      case "HLR": { this.longName = "Hexadecimal Literal Replacement"; break; }
      case "ILR": { this.longName = "Integer Literal Replacement"; break; }
      case "ICM": { this.longName = "Increments Mirror"; break; }
      case "LSC": { this.longName = "Loop Statement Change"; break; }
      case "PKD": { this.longName = "Payable Keyword Deletion"; break; }
      case "MCR": { this.longName = "Mathematical and Cryptographic function Replacement"; break; }
      case "MOC": { this.longName = "Modifier Order Change"; break; }
      case "MOD": { this.longName = "Modifier Deletion"; break; }
      case "MOI": { this.longName = "Modifier Insertion"; break; }
      case "MOR": { this.longName = "Modifier Replacement"; break; }
      case "OLFD": { this.longName = "Overloaded Function Deletion"; break; }
      case "OMD": { this.longName = "Overridden Modifier Deletion"; break; }
      case "ORFD": { this.longName = "Overridden Function Deletion"; break; }
      case "RSD": { this.longName = "Return Statement Deletion"; break; }
      case "RVS": { this.longName = "Return Values Swap"; break; }
      case "SCEC": { this.longName = "Switch Call Expression Casting"; break; }
      case "SFI": { this.longName = "Selfdestruct Insertion"; break; }
      case "SFD": { this.longName = "Selfdestruct Deletion"; break; }
      case "SFR": { this.longName = "SafeMath Function Replacement"; break; }
      case "SKD": { this.longName = "Super Keyword Deletion"; break; }
      case "SKI": { this.longName = "Super Keyword Insertion"; break; }
      case "SLR": { this.longName = "String Literal Replacement"; break; }
      case "TOR": { this.longName = "Transaction Origin Replacement"; break; }
      case "UORD": { this.longName = "Unary Operator Replacement and Deletion"; break; }
      case "VUR": { this.longName = "Variable Unit Replacement"; break; }
      case "VVR": { this.longName = "Variable Visibility Replacement"; break; }
      default:
        break;
    }
  }
}
