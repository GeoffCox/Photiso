
import * as fs from "fs-extra";
import * as path from "path";
import * as exif from "fast-exif";
import * as crypto from "crypto";



export type OrganizerProps = {
    unorganizedDir: string;
    organizedDir: string;
    duplicatesDir: string;
    onStartedDir?: (dir: string) => void;
    onFinishedDir?: (dir: string) => void;
    onStartedFile?: (file: string) => void;
    onFinishedFile?: (file: string) => void;
    onNoOp?: (file: string) => void;
    onSkipped?: (file: string) => void;
    onMoved?: (fromFile: string, toFile: string) => void;
    onDuplicateMoved?: (fromFile: string, toFile: string) => void;
    onDuplicateNoOp?: (file: string, hash: string) => void;
    onError?: (file: string, error: Error) => void;
}

export type Organizer = {
    organize(): Promise<void>;
}

export const createOrganizer = (props: OrganizerProps) => {

    const padStart = (value: number, paddedLength: number): string => {
        let text = value.toString();
        if (text.length >= paddedLength) {
            return text;
        }

        return `${'0'.repeat(paddedLength - text.length)}${text}`;
    }

    const photoExts = ['.JPG', '.JPEG', '.PNG', '.BMP', '.TIF', '.WMP', '.ICO']

    const isPhotoFile = (file: string) => {
        const ext = path.parse(file).ext.toUpperCase();
        return photoExts.some(e => e === ext);
    }

    const getPhotoTakenTime = async (file: string): Promise<Date> => {

        try {
            const exifData = await exif.read(file);

            const exifOriginal = exifData.exif.DateTimeOriginal;
            const exifDigitized = exifData.exif.DateTimeDigitized;

            const exifTaken = exifOriginal < exifDigitized ? exifOriginal : exifDigitized;

            if (exif.image === undefined || exif.image === null) {
                return exifTaken;
            }

            const exifModify = exifData.image.ModifyDate;
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

        const takenTime = (await getPhotoTakenTime(sourceFile));

        const year = padStart(takenTime.getFullYear(), 4);
        const month = padStart(takenTime.getMonth() + 1, 2);
        const dayOfMonth = padStart(takenTime.getDate(), 2);
        const hours = padStart(takenTime.getHours() + (takenTime.getTimezoneOffset() / 60), 2);
        const minutes = padStart(takenTime.getMinutes() + (takenTime.getTimezoneOffset() % 60), 2);

        const dir = path.join(props.organizedDir, year, month);
        const name = `IMG ${year}-${month}-${dayOfMonth} ${hours}-${minutes}`;

        return { dir: dir, name: name, ext: ext };
    }

    const placePhoto = async (sourceFile: string): Promise<void> => {
        let conflictRevision = 1;

        while (true) {
            let { dir, name, ext } = await getPhotoDest(sourceFile);

            // IMG yyyy-MM-DD hh.mm.rrr
            if (conflictRevision > 0) {
                name = `${name}.${padStart(conflictRevision, 3)}`;
            }

            let destFile = path.format({ dir: dir, name: name, ext: ext });

            // if already in right place, no-op
            if (sourceFile.toUpperCase() === destFile.toUpperCase()) {

                if (props.onNoOp !== undefined) {
                    props.onNoOp(sourceFile);
                }
                return;
            }

            // if dest does not exist move
            if (!(await fs.pathExists(destFile))) {
                await fs.move(sourceFile, destFile);
                if (props.onMoved !== undefined) {
                    props.onMoved(sourceFile, destFile);
                }
                return;
            }

            // if dest exists and same file
            const sourceHash = await getPhotoContentHash(sourceFile);
            const destHash = await getPhotoContentHash(destFile);
            if (sourceHash === destHash) {
                destFile = path.format({ dir: props.duplicatesDir, name: sourceHash, ext: ext });
                // move to duplicates if it doesn't already exist
                if (!(await fs.pathExists(destFile))) {
                    await fs.move(sourceFile, destFile);
                    if (props.onDuplicateMoved !== undefined) {
                        props.onDuplicateMoved(sourceFile, destFile);
                    }
                } else {
                    await fs.unlink(sourceFile);
                    if (props.onDuplicateNoOp !== undefined) {
                        props.onDuplicateNoOp(sourceFile, sourceHash);
                    }

                }
                return;
            }

            // otherwise, I increment the conflict revision
            conflictRevision++;
        }
    }

    const organizeDir = async (dir: string): Promise<void> => {

        // Never process the duplicates folder
        if (dir.toUpperCase() === props.duplicatesDir.toUpperCase()) {
            return;
        }

        if (props.onStartedDir !== undefined) {
            props.onStartedDir(dir);
        }

        const doOrganize = async (p: string) => {
            console.log(`doOrganize start: ${p}`);
            try {

                const sourceFile = path.format({ dir: dir, base: p });
                if (isPhotoFile(p)) {
                    
                    if (props.onStartedFile !== undefined) {
                        props.onStartedFile(sourceFile);
                    }
                    await placePhoto(sourceFile);
                    if (props.onFinishedFile !== undefined) {
                        props.onFinishedFile(sourceFile);
                    }
                }
                else {
                    const stats = await fs.stat(sourceFile);
                    if (stats.isDirectory()) {
                        await organizeDir(sourceFile);
                    } else {
                        if (props.onSkipped !== undefined) {
                            props.onSkipped(sourceFile);
                        }
                    }
                }
            }
            catch (e) {
                if (props.onError !== undefined) {
                    props.onError(p, e)
                }
            }
            console.log(`doOrganize end: ${p}`);
        }

        const forEachPromise = (items, fn) => {
            return items.reduce(function (promise, item) {
                return promise.then(function () {
                    return fn(item);
                });
            }, Promise.resolve());
        }

        const paths = await fs.readdir(dir);
        await forEachPromise(paths, doOrganize);

        if (props.onFinishedDir !== undefined) {
            props.onFinishedDir(dir);
        }
    }

    const organize = async (): Promise<void> => {
        return organizeDir(props.unorganizedDir);
    };

    return {
        organize
    };
}