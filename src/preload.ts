import { contextBridge, ipcRenderer } from "electron";
import { DialogApi, FormatInputPathObject, PathApi, PhotisoApi } from "./ipc.types";

const photisoApi: PhotisoApi = {
  start: (dir: string) => ipcRenderer.invoke("start", dir),
  next: () => ipcRenderer.invoke("next"),
  peek: () => ipcRenderer.invoke("peek"),
  getInfo: (file: string) => ipcRenderer.invoke("getInfo", file),
  getSrc: (file: string) => ipcRenderer.invoke("getSrc", file),
  getNoOverwriteSuffix: (dest: string) => ipcRenderer.invoke("getNoOverwriteSuffix", dest),
  copy: (source: string, dest: string) => ipcRenderer.invoke("copy", source, dest),
  move: (source: string, dest: string) => ipcRenderer.invoke("move", source, dest),
};

const dialogApi: DialogApi = {
  browseForDirectory: (startDir: string) => ipcRenderer.invoke("browseForDirectory", startDir),
};

const pathApi: PathApi = {
  normalize: (path: string) => ipcRenderer.invoke("normalize", path),
  join: (...paths: string[]) => ipcRenderer.invoke("join", paths),
  resolve: (...paths: string[]) => ipcRenderer.invoke("resolve", paths),
  isAbsolute: (path: string) => ipcRenderer.invoke("isAbsolute", path),
  relative: (from: string, to: string) => ipcRenderer.invoke("relative", from, to),
  dirname: (path: string) => ipcRenderer.invoke("dirname", path),
  basename: (path: string, suffix?: string) => ipcRenderer.invoke("basename", path),
  extname: (path: string) => ipcRenderer.invoke("extname", path),
  parse: (path: string) => ipcRenderer.invoke("parse", path),
  format: (pathObject: FormatInputPathObject) => ipcRenderer.invoke("format", pathObject),
  toNamespacedPath: (path: string) => ipcRenderer.invoke("toNamespacedPath", path),
};

contextBridge.exposeInMainWorld("photisoApi", photisoApi);
contextBridge.exposeInMainWorld("dialogApi", dialogApi);
contextBridge.exposeInMainWorld("pathApi", pathApi);
