import type { PhotisoWindow } from "../types";

export const getPhotisoApi = () => {
    return (globalThis.window as PhotisoWindow)?.photisoApi;
}

export const getPathApi = () => {
    return (globalThis.window as PhotisoWindow)?.pathApi;
}

export const getDialogApi = () => {
    return (globalThis.window as PhotisoWindow)?.dialogApi;
}