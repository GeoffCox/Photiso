import { app, BrowserWindow, ipcMain, nativeImage } from "electron";
import * as path from "node:path";
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
      preload: path.join(__dirname, "./preload.js"),
    },
  });

  loadUrl(appWindow);
};

// const getPhotoExifData = (file: string): Promise<ExifData> => {
//   return new Promise<ExifData>((resolve, reject) => {
//     new ExifImage(file, (error, exifData) => {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(exifData);
//       }
//     });
//   });
// };

// const getPhotoData = async (file: string): Promise<{ src: string; thumbnail: string }> => {
//   let start = Date.now();
//  const image = nativeImage.createFromPath(file);
//   console.log(`createFromPath: ${Date.now() - start}ms`);

//   start = Date.now();
//   const src = image.toDataURL();
//   console.log(`image toDataUrl: ${Date.now() - start}ms`);

//   start = Date.now();
//   const tnImage = await nativeImage.createThumbnailFromPath(file, { width: 100, height: 100 });
//   console.log(`createThumbnailFromPath: ${Date.now() - start}ms`);

//   start = Date.now();
//   const thumbnail = tnImage.toDataURL();
//   console.log(`thumbnail toDataUrl: ${Date.now() - start}ms`);

//   return {
//     src,
//     thumbnail,
//   };
// };

//let startDir: string = "";

const photisoApi = createOrganizer();
const dialogApi = createDialogApi();

app.whenReady().then(() => {
  ipcMain.handle("start", (_event, dir) => photisoApi.start(dir));
  ipcMain.handle("next", (_event) => photisoApi.next());
  ipcMain.handle("getInfo", (_event) => photisoApi.getInfo());
  ipcMain.handle("getSrc", (_event) => photisoApi.getSrc());
  ipcMain.handle("getNoOverwriteSuffix", (_event, dest) => photisoApi.getNoOverwriteSuffix(dest));
  ipcMain.handle("copy", (_event, dest) => photisoApi.copy(dest));
  ipcMain.handle("move", (_event, dest) => photisoApi.move(dest));
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
