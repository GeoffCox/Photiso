
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

    const getPhotoContentHash = async (file: string): Promise<string> => {
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

    // <organizedDir>/yyyy/MM/IMG yyyy-MM-DD hh.mm    
    const getPhotoDest = async (sourceFile: string): Promise<{ dir: string; name: string; ext: string; }> => {

        const ext = path.parse(sourceFile).ext;

        const takenTime = (await getPhotoTakenTime(sourceFile)).;        

        const year = padStart(takenTime.getFullYear(), 4);
        const month = padStart(takenTime.getMonth(), 2);
        const dayOfMonth = padStart(takenTime.getDate(), 3);
        const hours = padStart(takenTime.getHours() + takenTime.getTimezoneOffset(), 4);
        const minutes = padStart(takenTime.getMinutes(), 2);

        const dir = path.join(organizedDir, year, month);
        const name = `IMG ${year}-${month}-${dayOfMonth} ${hours}-${minutes}`;

        return { dir: dir, name: name, ext: ext };
    }

    const placePhoto = async (sourceFile: string): Promise<void> => {
        let conflictRevision = 0;

        while (true) {
            let { dir, name, ext } = await getPhotoDest(sourceFile);

            // IMG yyyy-MM-DD hh.mm.rrr
            if (conflictRevision > 0) {
                name = `${name}.${padStart(conflictRevision, 3)}`;
            }

            let destFile = path.format({ dir: organizedDir, name: name, ext: ext });

            // if already in right place, no-op
            if (sourceFile.toUpperCase() === destFile.toUpperCase()) {
                console.log(`Not moved: ${sourceFile}`);
                return;
            }

            // if dest does not exit move
            if (!(await fs.pathExists(destFile))) {
                await fs.move(sourceFile, destFile);
                console.log(`Moved: ${sourceFile} to ${destFile}`);
                return;
            }

            // if dest exists and same file
            const sourceHash = await getPhotoContentHash(sourceFile);
            const destHash = await getPhotoContentHash(destFile);
            if (sourceHash === destHash) {
                destFile = path.format({ dir: duplicatesDir, name: sourceHash, ext: ext });
                // move to duplicates if it doesn't already exist
                if (!(await fs.pathExists(destFile))) {
                    await fs.move(sourceFile, destFile);   
                    console.log(`Duplicate moved: ${sourceFile} to ${destFile}`);                 
                } else {
                    await fs.unlink(sourceFile);
                    console.log(`Duplicate deleted: ${sourceFile}`);                 
                }
                return;
            }

            // otherwise, I increment the conflict revision
            conflictRevision++;
        }
    }

    const organizeDir = async (dir: string): Promise<void> => {
        console.log(`Found directory: ${dir}`);

        const paths = await fs.readdir(dir);
        paths.forEach(async p => {
            const sourceFile = path.format({ dir: dir, base: p });
            if (isPhotoFile(p)) {
                await placePhoto(sourceFile);
            }
            else {
                const stats = await fs.stat(sourceFile);
                if (stats.isDirectory()) {                    
                    await organizeDir(sourceFile);
                } else {
                    console.log(`Skipped: ${sourceFile}`);
                }
            }
        });
    }

    const organize = async (): Promise<void> => {
        return organizeDir(unorganizedDir);
    };

    return {
        organize
    };
}