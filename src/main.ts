import { app, BrowserWindow, ipcMain, nativeImage } from "electron";
import * as nodePath from "node:path";
import { createOrganizer } from "./organizer";
import { createDialogApi } from "./dialogApi";

if (app.getName() === "Electron") {
  app.setName("photiso");
  console.log("app name", app.getName());
}

const loadUrl = (appWindow: BrowserWindow) => {
  appWindow.loadURL("http://localhost:5173").catch((e) => {
    //console.log('Error loading URL, retrying', e);
    setTimeout(() => {
      loadUrl(appWindow);
    }, 200);
  });
};

const createWindow = () => {
  const appWindow = new BrowserWindow({
    title: "photiso",
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      devTools: true,
      preload: nodePath.join(__dirname, "./preload.js"),
    },
  });

  loadUrl(appWindow);
};

const photisoApi = createOrganizer();
const dialogApi = createDialogApi();

app.whenReady().then(() => {
  // PhotisoApi
  ipcMain.handle("start", (_event, dir) => photisoApi.start(dir));
  ipcMain.handle("next", (_event) => photisoApi.next());
  ipcMain.handle("peek", (_event, count) => photisoApi.peek(count));
  ipcMain.handle("getInfo", (_event, file) => photisoApi.getInfo(file));
  ipcMain.handle("getThumbnailSrc", (_event, file) => photisoApi.getThumbnailSrc(file));
  ipcMain.handle("getSrc", (_event, file) => photisoApi.getSrc(file));
  ipcMain.handle("getNoOverwriteSuffix", (_event, dest) => photisoApi.getNoOverwriteSuffix(dest));
  ipcMain.handle("copy", (_event, source, dest) => photisoApi.copy(source, dest));
  ipcMain.handle("move", (_event, source, dest) => photisoApi.move(source, dest));
  
  // PathApi
  ipcMain.handle("normalize", (_event, path) => nodePath.normalize(path));
  ipcMain.handle("join", (_event, paths) => nodePath.join(...paths));
  ipcMain.handle("resolve", (_event, paths) => nodePath.resolve(...paths));
  ipcMain.handle("isAbsolute", (_event, path) => nodePath.isAbsolute(path));
  ipcMain.handle("relative", (_event, from, to) => nodePath.relative(from, to));
  ipcMain.handle("dirname", (_event, path) => nodePath.dirname(path));
  ipcMain.handle("basename", (_event, path) => nodePath.basename(path));
  ipcMain.handle("extname", (_event, path) => nodePath.extname(path));
  ipcMain.handle("parse", (_event, path) => nodePath.parse(path));
  ipcMain.handle("format", (_event, pathObject) => nodePath.format(pathObject));
  ipcMain.handle("toNamespacedPath", (_event, path) => nodePath.toNamespacedPath(path));

  // DialogApi
  ipcMain.handle("browseForDirectory", (_event, startDir) => dialogApi.browseForDirectory(startDir));

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
