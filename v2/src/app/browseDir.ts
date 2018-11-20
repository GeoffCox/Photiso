import electron = require("electron");

export const browseDir = (initialDir: string): string => {
    const remote = electron.remote;
    const dirs = remote.dialog.showOpenDialog({
        defaultPath: initialDir,
        properties: ["openDirectory"],
        title: "Open Direcotry"
    });

    if (dirs && dirs.length === 1) {
        const dir = dirs[0];
        return dir;
    }

    return undefined;
};