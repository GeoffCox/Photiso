import { contextBridge, ipcRenderer } from "electron";
import { DialogApi, PathApi, PhotisoApi } from "./ipc.types";
import * as path from 'path';

const photisoApi: PhotisoApi = {
  start: (dir: string) => ipcRenderer.invoke("start", dir),
  next: () => ipcRenderer.invoke("next"),
  getInfo: () => ipcRenderer.invoke("getInfo"),
  getSrc: () => ipcRenderer.invoke("getSrc"),
  getNoOverwriteSuffix: (dest: string) => ipcRenderer.invoke("getNoOverwriteSuffix", dest),
  copy: (dest: string) => ipcRenderer.invoke("copy", dest),
  move: (dest: string) => ipcRenderer.invoke("move", dest),
};

const dialogApi : DialogApi = {
  browseForDirectory: (startDir: string) => ipcRenderer.invoke('browseForDirectory', startDir),
}

const pathApi : PathApi = {
  //TODO invoke the path methods so that preload will work in full electron app
  ...path
};

contextBridge.exposeInMainWorld("photisoApi", photisoApi);
contextBridge.exposeInMainWorld("dialogApi", dialogApi);
contextBridge.exposeInMainWorld("pathApi", pathApi);
