import { derived, writable, type Readable } from 'svelte/store';
import { getPathApi, getPhotisoApi } from './ipc.apis';
import { type ActionHistoryItem, type Photo, type RecentDirectory, type UserSettings, type AppStatus } from '../types';

// ----- App Stores ----- //
export const appStatus = writable<AppStatus>('waiting');

export const userSettings = writable<UserSettings>();

// ----- Source Photo Stores ----- //

/** The directory containing unorganized photos */
export const fromDirectory = writable<string | undefined>();

/** The current photo to organize */
export const photo = writable<Photo | undefined>();

// ----- Destination Stores ----- //

/** The directory that is the destination for organized photos */
export const rootToDirectory = writable<string | undefined>();

/** The directory relative to organizedDirectory to put the current photo */
export const relativeToDirectory = writable<string | undefined>();

/** The file name to use when moving/copying the current photo */
export const toFileName = writable<string | undefined>();

/** The list of directories where photos were moved or copied */
export const recentRelativeDirectories = writable<RecentDirectory[]>([]);

/** The most recent to least recent history of actions taken */
export const actionHistory = writable<ActionHistoryItem[]>([]);

/** The full path to the destination directory **/
export const toDirectory: Readable<string | undefined> = derived(
	[rootToDirectory, relativeToDirectory],
	([$organizedDirectory, $destinationRelativeDirectory], set) => {
		const path = getPathApi();
		if (path && $organizedDirectory) {
			path
				.join($organizedDirectory, $destinationRelativeDirectory ?? '')
				.then((value) => set(value));
		} else {
			set(undefined);
		}
	}
);

/** The full path to the destination file **/
export const toFile: Readable<string | undefined> = derived(
	[toDirectory, toFileName, photo],
	([$destinationDirectory, $destinationFileName, $photo], set) => {
		const path = getPathApi();
		if (path && $destinationDirectory && $destinationFileName && $photo?.path?.ext) {
			path
				.join($destinationDirectory, `${$destinationFileName}${$photo.path.ext}`)
				.then((value) => set(value));
		} else {
			set(undefined);
		}
	}
);

/** The destination file name that does not cause an overwrite conflict **/
export const noConflictToFileName: Readable<string | undefined> = derived(
	[toFile, toFileName, photo],
	([$destinationFile, $destinationFileName], set) => {
		const photiso = getPhotisoApi();
		if (photiso && $destinationFile) {
			photiso.getNoOverwriteSuffix($destinationFile).then((suffix) => {
				suffix ? set(`${$destinationFileName}${suffix}`) : set(undefined);
			});
		} else {
			set(undefined);
		}
	}
);

// ----- Action Stores ----- //



export const canAct: Readable<boolean> = derived(
	[appStatus, photo, toFile, noConflictToFileName],
	([$appStatus, $photo, $toFile, $noConflictToFileName], set) => {
		const canAct =
		!!($appStatus === 'ready' &&
		$photo?.file &&
		$photo.file.length > 0 &&
		$toFile &&
		$toFile.length > 0 &&
		$photo.file != $toFile &&
		!$noConflictToFileName);
		set(canAct);
	}
);