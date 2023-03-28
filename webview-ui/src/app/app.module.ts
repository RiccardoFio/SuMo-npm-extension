import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { TreeviewModule } from 'ngx-treeview';
import { AppComponent } from "./app.component";
import { MutationOperatorsComponent } from './mutation-operators/mutation-operators.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [AppComponent, MutationOperatorsComponent, ConfigurationComponent],
  imports: [TreeviewModule.forRoot(),BrowserModule, FormsModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
