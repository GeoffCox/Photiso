
import * as fs from "fs-extra";
import * as path from "path";
import * as exif from "fast-exif";
import * as crypto from "crypto";
import * as _ from "lodash";
import { isNullOrUndefined } from "util";
import moment = require("moment");
import * as globby from "globby";

export type OrganizerProps = {
    readonly unorganizedDir: string;
    readonly organizedDir: string;
    readonly duplicatesDir: string;
    readonly onShouldContinue?: () => boolean;
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

            let exifOriginalDate: Date = undefined;
            let exifDigitizedDate: Date = undefined;

            // moment(undefined) returns today's date, so I have to be careful to check exif for undefined.
            if (!isNullOrUndefined(exifData) && !isNullOrUndefined(exifData.exif)) {

                if (!isNullOrUndefined(exifData.exif.DateTimeOriginal)) {
                    exifOriginalDate = moment(exifData.exif.DateTimeOriginal).utc().toDate();
                }

                if (!isNullOrUndefined(exifData.exif.DateTimeDigitized)) {
                    exifDigitizedDate = moment(exifData.exif.DateTimeDigitized).utc().toDate();
                }

                const dateTaken = earliestDate(exifOriginalDate, exifDigitizedDate);
                if (!isNullOrUndefined(dateTaken)) {
                    return dateTaken;
                }
            }
        }
        catch (error) {
            console.warn(error);
        }

        const stats = await fs.stat(file);
        const ctime = moment(stats.ctimeMs).toDate();
        const mtime = moment(stats.mtimeMs).toDate();

        const earliestFileDate = earliestDate(ctime, mtime);
        return earliestFileDate;
    }

    // <organizedDir>/yyyy/MM/IMG yyyy-MM-DD hh.mm    
    const getPhotoDest = async (sourceFile: string): Promise<{ dir: string; name: string; ext: string; }> => {
        const takenTime = moment((await getPhotoDate(sourceFile)));

        const dir = path.join(props.organizedDir, takenTime.format('YYYY'), takenTime.format('MM'));
        const name = takenTime.format('YYYY-MM-DD HH.mm.ss.SSS');
        const ext = path.parse(sourceFile).ext;

        return { dir: dir, name: name, ext: ext };
    }

    const moveToDuplicates = async (sourceFile: string, hash: string, name: string, ext: string): Promise<void> => {
        let destDir = path.join(props.duplicatesDir, hash);
        await fs.mkdirp(destDir);

        let revision = 1;
        while (true) {

            if (props.onShouldContinue) {
                if (!props.onShouldContinue()) {
                    return;
                }
            }

            let destName = name;

            if (revision > 0) {
                destName = `${name}^${padStart(revision, 3)}`;
            }

            let destFile = path.format({ dir: destDir, name: destName, ext: ext });

            // if already in right place, I no-op
            if (sourceFile.toUpperCase() === destFile.toUpperCase()) {

                if (props.onNoOp !== undefined) {
                    props.onNoOp(sourceFile);
                }
                return;
            }

            // I move if it doesn't already exist
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

            if (props.onShouldContinue) {
                if (!props.onShouldContinue()) {
                    return;
                }
            }

            let destName = name;

            if (revision > 0) {
                destName = `${name}^${padStart(revision, 3)}`;
            }

            let destFile = path.format({ dir: dir, name: destName, ext: ext });

            // if already in right place, I no-op
            if (sourceFile.toUpperCase() === destFile.toUpperCase()) {

                if (props.onNoOp !== undefined) {
                    props.onNoOp(sourceFile);
                }
                return;
            }

            // if there are no files with the same name (not considering extension)
            // I move the file
            const existingFiles = await globby(`${dir}/${destName}.*`);
            if (existingFiles.length == 0) {

                await fs.mkdirp(dir);
                await fs.move(sourceFile, destFile);

                if (props.onMoved !== undefined) {
                    props.onMoved(sourceFile, destFile);
                }
                return;
            }

            // if file is a duplicate of an existing file (same extension)
            // I move it to duplicates
            if ((await fs.pathExists(destFile))) {
                const sourceHash = await hashFile(sourceFile);
                const destHash = await hashFile(destFile);
                if (sourceHash === destHash) {
                    await moveToDuplicates(sourceFile, sourceHash, name, ext);
                    return;
                }
            }

            // otherwise, I increment the conflict revision
            revision++;
        }
    }

    const organizeDir = async (dir: string): Promise<void> => {

        // I never process the duplicates folder
        if (dir.toUpperCase() === props.duplicatesDir.toUpperCase()) {
            return;
        }

        const doOrganize = async (p: string) => {
            try {

                if (props.onShouldContinue) {
                    if (!props.onShouldContinue()) {
                        return;
                    }
                }

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

        try {
            await fs.access(props.unorganizedDir, fs.constants.F_OK);
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                return;
            }
        }

        return organizeDir(props.unorganizedDir);
    };

    return {
        organize
    };
}