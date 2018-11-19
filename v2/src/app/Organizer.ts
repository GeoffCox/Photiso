
import * as fs from "fs-extra";
import * as path from "path";
import * as exif from "fast-exif";
import * as crypto from "crypto";
import * as _ from "lodash";
import { isNullOrUndefined } from "util";
import moment = require("moment");


export type OrganizerProps = {
    readonly unorganizedDir: string;
    readonly organizedDir: string;
    readonly duplicatesDir: string;
    readonly onStartedDir?: (dir: string) => void;
    readonly onFinishedDir?: (dir: string) => void;
    readonly onStartedFile?: (file: string) => void;
    readonly onFinishedFile?: (result: string) => void;
    readonly onNoOp?: (file: string) => void;
    readonly onSkipped?: (file: string) => void;
    readonly onMoved?: (fromFile: string, toFile: string) => void;
    readonly onDuplicateMoved?: (fromFile: string, toFile: string) => void;
    readonly onError?: (file: string, error: Error) => void;
}

export type Organizer = {
    organize(): Promise<void>;
}


export const createOrganizer = (props: OrganizerProps) => {

    // pads a number with zeros as necessary
    const padStart = (value: number, paddedLength: number): string => {
        let text = value.toString();
        if (text.length >= paddedLength) {
            return text;
        }

        return `${'0'.repeat(paddedLength - text.length)}${text}`;
    }

    // given two possible dates, returns the earliest or undefined
    const earliestDate = (x?: Date, y?: Date): Date | undefined => {
        const isXDate = _.isDate(x);
        const isYDate = _.isDate(y);

        if (isXDate && isYDate) {
            return x < y ? x : y;
        }
        else if (isXDate) {
            return x;
        }
        else if (isYDate) {
            return y;
        }

        return undefined;
    }

    // uses a sha256 encryption algorithm to get the hash of a file's contents
    const hashFile = async (file: string): Promise<string> => {
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

    const isPhotoFile = (file: string) => {
        const photoExts = ['.JPG', '.JPEG', '.PNG', '.BMP', '.TIF', '.WMP', '.ICO']
        const ext = path.parse(file).ext.toUpperCase();
        return photoExts.some(e => e === ext);
    }

    // if the file contains exif data, returns the earliest date taken
    // otherwise returns the earliest created/modified date
    const getPhotoDate = async (file: string): Promise<Date> => {
        try {
            const exifData = await exif.read(file);

            if (!isNullOrUndefined(exifData) && !isNullOrUndefined(exifData.exif)) {
                const exifOriginalDate = moment(exifData.exif.DateTimeOriginal)
                const exifDigitizedDate = moment(exifData.exif.DateTimeOriginal)
                const dateTaken = earliestDate(exifOriginalDate.toDate(), exifDigitizedDate.toDate());
                if (!isNullOrUndefined(dateTaken)) {
                    return dateTaken;
                }
            }
        }
        catch (error) {
            console.warn(error);
        }

        const stats = await fs.stat(file);
        const ctime = moment(stats.mtimeMs);
        const mtime = moment(stats.mtimeMs);

        return earliestDate(ctime.toDate(), mtime.toDate());
    }

    // <organizedDir>/yyyy/MM/IMG yyyy-MM-DD hh.mm    
    const getPhotoDest = async (sourceFile: string): Promise<{ dir: string; name: string; ext: string; }> => {
        const takenTime = moment((await getPhotoDate(sourceFile))).utc();

        const dir = path.join(props.organizedDir, takenTime.format('YYYY'), takenTime.format('MM'));
        const name = takenTime.toISOString().replace(/\:/g, '.').replace('T', ' ').replace('Z', '');
        const ext = path.parse(sourceFile).ext;

        return { dir: dir, name: name, ext: ext };
    }

    const moveToDuplicates = async (sourceFile: string, hash: string, name: string, ext: string): Promise<void> => {
        let destDir = path.join(props.duplicatesDir, hash);
        await fs.mkdirp(destDir);

        let revision = 1;
        while (true) {

            let destName = name;

            if (revision > 0) {
                destName = `${name}^${revision}`;
            }

            let destFile = path.format({ dir: destDir, name: destName, ext: ext });

            // if already in right place, no-op
            if (sourceFile.toUpperCase() === destFile.toUpperCase()) {

                if (props.onNoOp !== undefined) {
                    props.onNoOp(sourceFile);
                }
                return;
            }

            // move if it doesn't already exist
            if (!(await fs.pathExists(destFile))) {

                await fs.mkdirp(props.duplicatesDir);
                await fs.move(sourceFile, destFile);

                if (props.onDuplicateMoved !== undefined) {
                    props.onDuplicateMoved(sourceFile, destFile);
                }

                return;
            }

            revision++;
        }
    }

    const organizeFile = async (sourceFile: string): Promise<void> => {

        const { dir, name, ext } = await getPhotoDest(sourceFile);

        let revision = 0;
        while (true) {

            let destName = name;

            if (revision > 0) {
                destName = `${name}^${revision}`;
            }

            let destFile = path.format({ dir: dir, name: destName, ext: ext });

            // if already in right place, no-op
            if (sourceFile.toUpperCase() === destFile.toUpperCase()) {

                if (props.onNoOp !== undefined) {
                    props.onNoOp(sourceFile);
                }
                return;
            }

            // if dest does not exist move
            if (!(await fs.pathExists(destFile))) {

                await fs.mkdirp(dir);
                await fs.move(sourceFile, destFile);

                if (props.onMoved !== undefined) {
                    props.onMoved(sourceFile, destFile);
                }
                return;
            }

            // if file is a duplicate
            const sourceHash = await hashFile(sourceFile);
            const destHash = await hashFile(destFile);
            if (sourceHash === destHash) {
                await moveToDuplicates(sourceFile, sourceHash, name, ext);
                return;
            }

            // otherwise, I increment the conflict revision
            revision++;
        }
    }

    const organizeDir = async (dir: string): Promise<void> => {

        // never process the duplicates folder
        if (dir.toUpperCase() === props.duplicatesDir.toUpperCase()) {
            return;
        }

        const doOrganize = async (p: string) => {
            try {

                const sourceFile = path.format({ dir: dir, base: p });

                const stats = await fs.stat(sourceFile);
                if (stats.isDirectory()) {
                    await organizeDir(sourceFile);
                }
                else {
                    if (props.onStartedFile !== undefined) {
                        props.onStartedFile(sourceFile);
                    }

                    if (isPhotoFile(p)) {
                        await organizeFile(sourceFile);
                    }
                    else if (props.onSkipped !== undefined) {
                        props.onSkipped(sourceFile);
                    }

                    if (props.onFinishedFile !== undefined) {
                        props.onFinishedFile(sourceFile);
                    }
                }
            }
            catch (e) {
                if (props.onError !== undefined) {
                    props.onError(p, e)
                }
            }
        }

        const forEachPromise = (items, fn) => {
            return items.reduce(function (promise, item) {
                return promise.then(function () {
                    return fn(item);
                });
            }, Promise.resolve());
        }

        if (props.onStartedDir !== undefined) {
            props.onStartedDir(dir);
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