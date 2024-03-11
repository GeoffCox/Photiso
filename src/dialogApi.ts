import { OpenDialogOptions, dialog } from "electron";
import { DialogApi } from "./ipc.types";

const browseOptions: OpenDialogOptions = {
  title: "Select directory",
  properties: ["openDirectory", "createDirectory", "dontAddToRecent"],
};

const browseForDirectory = async (startDir: string): Promise<string | undefined> => {
  const result = await dialog.showOpenDialog({
    ...browseOptions,
    defaultPath: startDir,
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return undefined;
};

export const createDialogApi = () : DialogApi => {
  return {
    browseForDirectory
  }
}
