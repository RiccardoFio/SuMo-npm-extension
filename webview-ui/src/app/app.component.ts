import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  showConfig:boolean = false;
  showMutation:boolean = false;
  page: any = document.getElementById("txt") as HTMLInputElement | null;

  ngOnInit () { 
    if(this.page.innerHTML == "configuration") {
      this.showConfig = true;
      this.showMutation = false;
    }
    else if(this.page.innerHTML == "mutation") {
      this.showConfig = false;
      this.showMutation = true;
    }
  }
}
