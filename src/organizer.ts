import * as path from "node:path";
import * as fs from "node:fs";
import * as fspromises from "node:fs/promises";

import { PhotisoApi, PhotoInfo } from "./ipc.types";
import { nativeImage } from "electron";
import { getPhotoInfo } from "./photoInfo";

const photoFileExtensions = [".jpg", ".JPG", ".png", ".PNG"];

export const createOrganizer = (): PhotisoApi => {
  let dir: string | undefined = undefined;
  //let files: AsyncGenerator<string, void, void> | undefined = undefined;

  let currentDirectory: string | undefined = undefined;
  let filesToProcess: string[] = [];
  let directoriesToProcess: string[] = [];

  const addDirectory = async (dir: string) => {
    const entries = await fspromises.readdir(dir);

    const foundFiles: string[] = [];
    const foundDirs: string[] = [];

    for (const entry of entries) {
      const fullFile = path.join(dir, entry);

      const lfileStats = await fspromises.lstat(fullFile);
      if (lfileStats.isSymbolicLink()) {
        continue;
      }

      const fileStats = await fspromises.stat(fullFile);

      if (fileStats.isDirectory()) {
        foundDirs.push(fullFile);
      } else if (fileStats.isFile() && photoFileExtensions.includes(path.extname(entry))) {
        foundFiles.push(fullFile);
      }
    }

    directoriesToProcess = [...foundDirs.sort(), ...directoriesToProcess];
    filesToProcess = [...foundFiles.sort(), ...filesToProcess];
  };

  const acquireFiles = async () => {
    // get the files for the next directory until exhausted
    while (filesToProcess.length === 0 && directoriesToProcess.length > 0) {
      console.log(".");
      currentDirectory = directoriesToProcess.shift();
      currentDirectory && (await addDirectory(currentDirectory));
    }
  };

  const start = async (unorganizedDir: string) => {
    console.log("start", unorganizedDir);

    filesToProcess = [];
    directoriesToProcess = [];
    dir = unorganizedDir;
    directoriesToProcess.push(unorganizedDir);
  };

  const next = async (): Promise<string | undefined> => {
    console.log("next");

    await acquireFiles();
    return filesToProcess.length > 0 ? filesToProcess.shift() : undefined;
  };

  const peek = async (count: number): Promise<string[]> => {
    await acquireFiles();
    return filesToProcess.slice(0, 3);
  };

  const getInfo = async (file: string): Promise<PhotoInfo> => {
    console.log("getInfo", file);
    return await getPhotoInfo(file);
  };

  const getThumbnailSrc = async (file: string): Promise<string> => {
    return Promise.resolve(nativeImage.createFromPath(file).resize({ width: 400 }).toDataURL());
  };

  const getSrc = async (file: string): Promise<string> => {
    return Promise.resolve(nativeImage.createFromPath(file).toDataURL());
  };

  const fileExists = async (file: string): Promise<boolean> => {
    try {
      if (file) {
        const stat = await fspromises.stat(file);
        console.log("fileExists", file, stat?.isFile);
        return !!stat?.isFile;
      }
    } catch (_e) {}
    return false;
  };

  const getNoOverwriteSuffix = async (dest: string) => {
    console.log("getNoOverwriteSuffix", dest);
    if (!(await fileExists(dest))) {
      console.log("getNoOverwriteSuffix", dest, " does not exist");
      return undefined;
    }

    const destPath = path.parse(dest);

    let exists = true;
    let count = 1;
    let suffix = "";
    while (exists && count < 1000) {
      suffix = `_${count.toString().padStart(3, "0")}`;
      const newDest = path.format({
        ...destPath,
        base: undefined,
        name: `${destPath.name}${suffix}`,
      });
      exists = await fileExists(newDest);
      count++;
    }

    if (count >= 1000) {
      throw new Error("Number of destination file collisions exceeded 1000.");
    }

    console.log("getNoOverwriteSuffix", dest, " exists. suffix:", suffix);
    return suffix;
  };

  const copy = async (source: string, dest: string): Promise<void> => {
    console.log("copy", source, dest);
    return fspromises.copyFile(source, dest, fs.constants.COPYFILE_EXCL);
  };

  const move = async (source: string, dest: string): Promise<void> => {
    if (source && dest) {
      let destExists = false;
      try {
        destExists = (await fspromises.stat(dest)) !== undefined;
      } catch (_e) {}

      if (destExists) {
        throw new Error(`A file already exists at ${dest}.`);
      }

      const destDir = path.dirname(dest);
      console.log("move - destDir:", destDir);
      if (destDir) {
        await fspromises.mkdir(destDir, { recursive: true });
      }

      console.log("move", source, dest);
      return fspromises.rename(source, dest);
    }
  };

  return {
    start,
    next,
    peek,
    getInfo,
    getThumbnailSrc,
    getSrc,
    getNoOverwriteSuffix,
    copy,
    move,
  };
};

export type Organizer = ReturnType<typeof createOrganizer>;
