
import * as fs from "fs-extra";
import * as path from "path";
import * as exif from "fast-exif";
import { getHeapSpaceStatistics } from "v8";
import { strictEqual } from "assert";
import { stringify } from "querystring";

export type Organizer = {
    organize(): Promise<void>;
}

export const createOrganizer = (unorganizedDir: string, organizedDir: string, duplicatesDir: string) => {

    const getPhotoTakenTime = async (file: string, stats: fs.Stats): Promise<Date> => {

        try {
            const exifData = await exif.read(file);
            const exifModify = exifData.image.ModifyDate;
            const exifOriginal = exifData.exif.DateTimeOriginal;
            const exifDigitized = exifData.exif.DateTimeDigitized;

            const exifTaken = exifOriginal < exifDigitized ? exifOriginal : exifDigitized;
            return exifModify < exifTaken ? exifModify : exifTaken;
        }
        catch (error) {
            console.warn(error);
        }

        const { ctime, mtime } = stats;
        return ctime < mtime ? ctime : mtime;
    }

    const twoDigitPad = (value: number): string => {
        return value < 10 ? `0${value}` : `${value}`;
    }

    const getPhotoDestDir = async (file: string, stats: fs.Stats): Promise<string> => {
        const takenTime = await getPhotoTakenTime(file, stats);

        const year = takenTime.getFullYear();
        const month = takenTime.getMonth();

        const pathParse = path.parse(file);

        const yearString = year.toString();
        const monthString = twoDigitPad(month);

        return `${organizedDir}/${yearString}/${monthString}/${pathParse.base}`
    }

    const organizeDir = async (dir: string) : Promise<void> => {
        const paths = await fs.readdir(dir);
        paths.forEach(async p => {
            const fullPath = path.format({ dir: dir, base: p });
            const stats = await fs.stat(fullPath);
            if (stats.isFile()) {
                console.log("From: " + fullPath + " To: " + await getPhotoDestDir(fullPath, stats));
            }
            else if (stats.isDirectory()) {
                return organizeDir(fullPath);
            }
        });
    }

    const organize = async (): Promise<void> => {
        return organizeDir(organizedDir);
    };

    return {
        organize
    };
}