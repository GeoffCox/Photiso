
import * as fs from "fs-extra";
import * as path from "path";
import * as exif from "fast-exif";
import * as crypto from "crypto";

export type Organizer = {
    organize(): Promise<void>;
}

export const createOrganizer = (unorganizedDir: string, organizedDir: string, duplicatesDir: string) => {

    const padStart = (value: number, length: number): string => {
        let text = value.toString();
        return `${'0'.repeat(length - text.length)}${text}`;
    }

    const photoExts = ['.JPG', '.JPEG', '.PNG', '.BMP', '.TIF', '.WMP', '.ICO']

    const isPhotoFile = (file: string) => {
        const ext = path.parse(file).ext.toUpperCase();
        return photoExts.some(e => e === ext);
    }

    const getPhotoTakenTime = async (file: string): Promise<Date> => {

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

        const stats = await fs.stat(file);
        const { ctime, mtime } = stats;
        return ctime < mtime ? ctime : mtime;
    }

    const getPhotoContentHash = async (file: string) : Promise<string> => {                
        return new Promise<string>((resolve, reject) => {
            const hash = crypto.createHash('sha256');
        const input = fs.createReadStream(file);
        
            input.on('readable', () => {
                const data = input.read();
                if (data)
                hash.update(data);
                else {
                    resolve(`${hash.digest('hex')}`);
                }
            });
        });
    }

    const getPhotoDestFile = async (sourceFile: string) : Promise<string> => {

        const takenTime = await getPhotoTakenTime(sourceFile);

        const year = padStart(takenTime.getFullYear(), 4);
        const month = padStart(takenTime.getMonth(), 2);
        const dayOfMonth = padStart(takenTime.getDate(), 3);
        const hours = padStart(takenTime.getHours(), 4);
        const minutes = padStart(takenTime.getMinutes(), 2);

        // IMG 2018-11-06 09.59.jpeg
        const name = `IMG ${year}-${month}-${dayOfMonth} ${hours}-${minutes}`;

        const pathParse = path.parse(sourceFile);

        let destFile = path.format({ dir: organizedDir, name: name, ext: pathParse.ext });

        if (sourceFile === destFile) {
            return destFile;
        }

        if (await fs.pathExists(destFile)) {
            if (getPhotoContentHash(sourceFile) === getPhotoContentHash(destFile)) {

            }
        }
    }

    const organizeDir = async (dir: string): Promise<void> => {
        const paths = await fs.readdir(dir);
        paths.forEach(async p => {

            const sourceFile = path.format({ dir: dir, base: p });
            if (isPhotoFile(p)) {
                console.log("From: " + sourceFile + " To: " + await getPhotoDestFile(sourceFile));
            }
            else {
                const stats = await fs.stat(sourceFile);
                if (stats.isDirectory()) {
                    return organizeDir(sourceFile);
                }
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