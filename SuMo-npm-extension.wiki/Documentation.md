The SuMo extension has been developed following the official documentation of the `Visual Studio Code Extension API` since many core features of VS Code are built as extensions and use the same Extension API.\
Below are some useful links to familiarize yourself with the development of VS Code extensions:
- [VS Code Extension API](https://code.visualstudio.com/api)
- [VS Code API](https://code.visualstudio.com/api/references/vscode-api)
- [VS Code extension samples](https://github.com/microsoft/vscode-extension-samples)

# Requirements

1. [Visual Studio Code](https://code.visualstudio.com/)
2. [Node.js](https://nodejs.org/en/)
3. [SuMo-SOlidity-MUtator](https://github.com/MorenaBarboni/SuMo-SOlidity-MUtator)

# Quick start

```bash
# Copy project extension locally
git clone https://github.com/RiccardoFio/SuMo-npm-extension.git

# Navigate into the project directory
cd ./SuMo-npm-extension

# Install dependencies for both the extension and webview UI source code
npm run install: all 

# Build webview UI source code
npm run build:webview

# Open in VS Code
code .
```
Once the project is open inside VS Code you can run the extension by doing the following:

1. Press `F5` to open a new Extension Development Host window
2. Inside the host window, open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac) and type `sumo` to show all the available commands.

# Extension commands

A quick run down of some of the important commands that can be run when at the root of the project.

```
npm run install:all      Install package dependencies for both the extension and Angular webview source code.
npm run build:webview    Build Angular webview source code. Must be executed before compiling or running the extension.
npm test                 Run the suite test over the project.
```

# Extension structure

This section provides a quick introduction into how this extension is organized and structured.

The two most important directories to take note of are the following:

- `src`: Contains all of the extension source code
- `webview-ui`: Contains all of the webview UI source code

## `src` directory

The `src` directory contains all of the extension-related source code and can be thought of as containing the "backend" code/logic for the entire extension. Inside of this directory you'll find the:

- `panels` directory
- `utilities` directory
- `extension.ts` file

The `panels` directory contains all of the webview-related code that will be executed within the extension context. It can be thought of as the place where all of the "backend" code for each webview panel is contained.

This directory will typically contain individual TypeScript or JavaScript files that contain a class which manages the state and behavior of a given webview panel. Each class is usually in charge of:

- Creating and rendering the webview panel
- Properly cleaning up and disposing of webview resources when the panel is closed
- Setting message listeners so data can be passed between the webview and extension
- Setting the initial HTML markdown of the webview panel
- Other custom logic and behavior related to webview panel management

As the name might suggest, the `utilties` directory contains all of the extension utility functions that make setting up and managing an extension easier. In this case, it contains:
-  `getUri.ts` which contains a helper function which will get the webview URI of a given file or resource. 
- `sumoPathHandler.ts` which contains some handler functions to check that the extension has the needed information to comunicate with the SuMo tool installed locally.
- `openExplorer.ts` which contains a function which allow the user to pick a file/folder from the system when the extension require it.
- `endConfig.ts` which contains the functions to verify and write the configurations chosen from the user to the SuMo tool. 
- `getFilesPath.ts` which contains the functions to handle the reading of filenames from a directory and the formattation of the read paths.
- `fireCommands.ts` which contains a function to send the command to execute in the SuMo tool.
- `showResults.ts` which contains the functions to handle the visualization of SuMo command execution's results.

Finally, `extension.ts` is where all the logic for activating and deactiving the extension usually live. This is also the place where extension commands are registered.
Actually, the latter are:
- `configurationCommand` to open the webview where the user can specify the SUT and other configuration's parameter to run SuMo. 
- `mutationOperatorsCommand` to open the webiview where the user can enable/disable the mutation operators that SuMo will use.
- `runSumoCommandCommand` to let the user pick the the command to execute in the SuMo tool.
- `showResultsCommand` to let the user choose which results display after the execution of the tests of SuMo.

## `webview-ui` directory

The `webview-ui` directory contains all of the Angular-based webview source code and can be thought of as containing the "frontend" code/logic for the extension webview.

This directory is special because it contains a full-blown Angular application which was created using the Angular CLI. As a result, `webview-ui` contains its own `package.json`, `node_modules`, `tsconfig.json` and so on, separate from the extension in the root directory.

This strays a bit from other extension structures, in that you'll usually find the extension and webview dependencies, configurations, and source code more closely integrated or combined with each other.

However, in this case, there are some unique benefits and reasons for why this extension does not follow those patterns such as easier management of conflicting dependencies and configurations, as well as the ability to use a browser-based frontend that allows to build more complex views. 

# Extension development cycle

## Dependency management and project configuration

As mentioned above, the `webview-ui` directory holds a self-contained and isolated Angular application meaning you can (for the most part) treat the development of your webview UI in the same way you would treat the development of a regular Angular application.

To install webview-specific dependencies simply navigate (i.e. `cd`) into the `webview-ui` directory and install any packages you need or set up any Angular specific configurations you want.

## UI development cycle

### Message passing

If you need to implement message passing between the webview context and extension context via the VS Code API, a helpful utility is provided in the `webview-ui/src/utilities/vscode.ts` file.

This file contains a utility wrapper around the `acquireVsCodeApi()` function, which enables message passing and state management between the webview and extension contexts.

To get a concrete how to use of it, you can follow the next examples:
- Send messages from extension context to webview context: 
1. On `YourPanel.ts` file in `panels` directory:
```
public static sendMessageToWebview(id: string, data: string) {
    this.currentPanel?._panel.webview.postMessage({ command: id, text: data });
  }
```
2. Always on `YourPanel.ts` file inside the `<script>` tag of the `html` contained in `_getWebviewContent` function:
```
window.addEventListener('message', event => {

    const message = event.data; // The JSON data our extension sent

    switch (message.command) {
        case 'yourCommand':
            // you can retrieve the message content by message.text and use it as you need 
            break;
        ...
```
- Send messages from webview context to extension context: 
1. On the `panel.component.ts` file in `webview-ui` directory (Angular project):
```
yourFunction(data: string) {
    vscode.postMessage({
      command: "yourCommand",
      text: data
    });
}
```
2. On `YourPanel.ts` file in `panels` directory:
```
private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
        (message: any) => {
            const command = message.command;
            let text;
            if (message.text) { text = message.text; }

            switch (command) {
                case "yourCommand":
                    // your code
                    break; 
                ...
```
### Development cycle

Once you're ready to start building other parts of your extension, simply shift to a development model where you run the `npm run build:webview` command as you make changes, press `F5` to compile your extension and open a new Extension Development Host window.

_Tip: Open the command palette and run the `Developer: Toggle Developer Tools` command. This will open the `Inspection tool` to check the console and so on._
