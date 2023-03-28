import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn } from "vscode";
import { endConfig } from "../utilities/endCongif";
import { getUri } from "../utilities/getUri";
import { openExplorer } from "../utilities/openExplorer";

export class ConfigurationPanel {

  public static currentPanel: ConfigurationPanel | undefined;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];

  /**
   * The panel class private constructor (called only from the render method).
   *
   * @param panel A reference to the webview panel
   * @param extensionUri The URI of the directory containing the extension
   */
  private constructor(panel: WebviewPanel, extensionUri: Uri) {
    this._panel = panel;

    // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
    // the panel or when the panel is closed programmatically)
    this._panel.onDidDispose(this.dispose, null, this._disposables);

    // Set the HTML content for the webview panel
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);

    // Set an event listener to listen for messages passed from the webview context
    this._setWebviewMessageListener(this._panel.webview);
  }

  /**
   * Renders the current webview panel if it exists otherwise a new webview panel
   * will be created and displayed.
   *
   * @param extensionUri The URI of the directory containing the extension.
   */
  public static render(extensionUri: Uri) {
    if (ConfigurationPanel.currentPanel) {
      // If the webview panel already exists reveal it
      ConfigurationPanel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      // If a webview panel does not already exist create and show a new one
      const panel = window.createWebviewPanel(
        // Panel view type
        "showConfiguration",
        // Panel title
        "SuMo configuration",
        // The editor column the panel should be displayed in
        ViewColumn.Beside,
        // Extra panel configurations
        {
          // Enable JavaScript in the webview
          enableScripts: true,
          //Enable to save data when pannel is hiden or moved
          retainContextWhenHidden: true
        }
      );

      ConfigurationPanel.currentPanel = new ConfigurationPanel(panel, extensionUri);
    }

  }

  /**
   * Cleans up and disposes of webview resources when the webview panel is closed.
   */
  public dispose() {
    ConfigurationPanel.currentPanel = undefined;

    // Dispose of the current webview panel
    this._panel.dispose();

    // Dispose of all disposables (i.e. commands) for the current webview panel
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  /**
   * Defines and returns the HTML that should be rendered within the webview panel.
   *
   * @remarks This is also the place where references to the Angular webview build files
   * are created and inserted into the webview HTML.
   *
   * @param webview A reference to the extension webview
   * @param extensionUri The URI of the directory containing the extension
   * @returns A template string literal containing the HTML that should be
   * rendered within the webview panel
   */
  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    // The CSS file from the Angular build output
    const stylesUri = getUri(webview, extensionUri, ["webview-ui", "build", "styles.css"]);
    // The JS files from the Angular build output
    const runtimeUri = getUri(webview, extensionUri, ["webview-ui", "build", "runtime.js"]);
    const polyfillsUri = getUri(webview, extensionUri, ["webview-ui", "build", "polyfills.js"]);
    const scriptUri = getUri(webview, extensionUri, ["webview-ui", "build", "main.js"]);

    const codiconsUri = webview.asWebviewUri(Uri.joinPath(extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));

    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <link href="${codiconsUri}" rel="stylesheet" />
          <title>ConfigurationPanel</title>
        </head>
        <body>
          <h1 id="txt" hidden>configuration</h1>
          <app-root></app-root>
          <script type="module" src="${runtimeUri}"></script>
          <script type="module" src="${polyfillsUri}"></script>
          <script type="module" src="${scriptUri}"></script>
        </body>
        <script>
          window.addEventListener('message', event => {

            const message = event.data; // The JSON data our extension sent

            switch (message.command) {
                case 'projectDir':
                    document.getElementById('projectDir').value = message.text;
                    break;
                case 'buildDir':
                    document.getElementById('buildDir').value = message.text;
                    break;
                case 'contractsDir':
                    document.getElementById('contractsDir').value = message.text;
                    break;
                case 'testDir':
                    document.getElementById('testDir').value = message.text;
                    break;
                case 'contractsFiles':
                    document.getElementById('contractsFiles').value = message.text;
                    document.getElementById('build-contracts-tree').click();
                    break;
                case 'testFiles':
                    document.getElementById('testFiles').value = message.text;
                    document.getElementById('build-test-tree').click();
                    break;
                case 'sumoDir':
                    document.getElementById('sumoDir').value = message.text; 
                    break;
                case 'actualConfig':
                    document.getElementById('actualConfig').value = message.text;
                    document.getElementById('initialize-config').click();
                    break;
            }
            
          });
        </script>
      </html>
    `;
  }

  public static sendDirPath(dir: string, path: string) {
    this.currentPanel?._panel.webview.postMessage({ command: dir, text: path });
  }

  public static sendDirFilesPath(target: string, paths: string) {
    this.currentPanel?._panel.webview.postMessage({ command: target, text: paths });
  }

  /**
   * Sets up an event listener to listen for messages passed from the webview context and
   * executes code based on the message that is recieved.
   *
   * @param webview A reference to the extension webview
   * @param context A reference to the extension context
   */
  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const command = message.command;
        let text;
        if (message.text) { text = message.text; }

        switch (command) {
          case "endConfig":
            endConfig(text);
            return;
          case "openExplorer":
            openExplorer(text);
            return;
          case "logPaths":
            console.log(text);
            return;
        }
      },
      undefined,
      this._disposables
    );
  }
}
