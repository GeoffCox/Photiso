import { BrowserWindow, ipcMain, app } from "electron";
import * as path from "path";
import * as url from "url";
import { isNullOrUndefined } from "util";

export default class Main {
  static mainWindow: Electron.BrowserWindow;
  static application: Electron.App;

  private static onWindowAllClosed() {
    if (process.platform !== "darwin") {
      Main.application.quit();
    }
  }

  private static onClose(e: Event) {
    Main.mainWindow = null;  
  }

  private static onReady() {
    Main.mainWindow = new BrowserWindow({ width: 800, height: 600 });

    var mainUrl = url.format({
      protocol: "file:",
      pathname: path.join(__dirname, "index.html"),
      slashes: true
    });
    
    if (process.env.NODE_ENV === 'development') {
      mainUrl = "http://localhost:1616";
    }

    Main.mainWindow.loadURL(mainUrl);
    Main.mainWindow.on("closed", Main.onClose);
  }

  static main() {
    Main.application = app;
    Main.application.on("window-all-closed", Main.onWindowAllClosed);
    Main.application.on("ready", Main.onReady);
  }
}