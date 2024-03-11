import * as path from "node:path";
import * as fs from "node:fs";
import * as fspromises from "node:fs/promises";

import { globIterate } from "glob";
import { PhotisoApi, PhotoInfo } from "./ipc.types";
import { nativeImage } from "electron";
import { getPhotoInfo } from "./photoInfo";

export const createOrganizer = (): PhotisoApi => {
  let dir: string | undefined = undefined;
  let files: AsyncGenerator<string, void, void> | undefined = undefined;
  let file: string = "";

  const start = async (unorganizedDir: string) => {
    console.log("start", unorganizedDir);

    dir = unorganizedDir;
    //TODO: convert any windows path to a forward slash glob compatible path
    files = globIterate(path.join(dir, "**", "*.jpg"));
  };

  const next = async (): Promise<string | undefined> => {
    console.log("next");
    if (files) {
      const result = await files.next();
      if (!result.done) {
        console.log(result.value);
        file = result.value;

        return file;
      }
    }
    return undefined;
  };

  const getInfo = async (): Promise<PhotoInfo> => {
    console.log("getInfo", file);
    return await getPhotoInfo(file);
  };

  const getSrc = async (): Promise<string> => {
    console.log("getSrc", file);
    return Promise.resolve(nativeImage.createFromPath(file).toDataURL());
  };

  const fileExists = async (file: string) : Promise<boolean> => {
    try {
      return file !== undefined && file.length > 0 && (await fspromises.stat(file) !== undefined);
    } catch (_e) {}
    return false;
  }

  const getNoOverwriteSuffix = async (dest: string) => {
    if (!await fileExists(dest)) {
      return undefined;
    }

    const destPath = path.parse(dest);

    let exists = true;
    let count = 1;
    let suffix = '';
    while (exists && count < 1000) {
      suffix = `_${count.toString().padStart(3, '0')}`;
      const newDest = path.format({
        ...destPath,
        base: undefined,
        name: `${destPath.name}${suffix}`
      });
      exists = await fileExists(newDest);
      count++;
    }

    if (count >= 1000) {
      throw new Error('Number of destination file collisions exceeded 1000.');
    }

    return suffix;
  }

  const copy = async (dest: string): Promise<void> => {
    console.log("copy", file, dest);
    return fspromises.copyFile(file, dest, fs.constants.COPYFILE_EXCL);
  };

  const move = async (dest: string): Promise<void> => {
    if (file && dest) {
      let destExists = false;
      try {
        destExists = await fspromises.stat(dest) !== undefined;
      } catch (_e) {}

      if (destExists) {
        throw new Error(`A file already exists at ${dest}.`);
      }

      const destDir = path.dirname(dest);
      console.log("move - destDir:", destDir);
      if (destDir) {
        await fspromises.mkdir(destDir, { recursive: true });
      }

      console.log("move", file, dest);
      return fspromises.rename(file, dest);
    }
  };

  return {
    start,
    next,
    getInfo,
    getSrc,
    getNoOverwriteSuffix,
    copy,
    move,
  };
};

export type Organizer = ReturnType<typeof createOrganizer>;
