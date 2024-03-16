import { derived, writable, type Readable} from 'svelte/store';
import { getPathApi, getPhotisoApi } from './ipc.apis';
import type { Photo, UserSettings } from '../types';

// ----- App Stores ----- //
export const userSettings = writable<UserSettings>();

// ----- Source Photo Stores ----- //

/** The directory containing unorganized photos */
export const fromDirectory = writable<string | undefined>(
	'/Users/geoff/github/Photiso/photos/unorganized'
);

/** The current photo to organize */
export const photo = writable<Photo | undefined>();

// ----- Destination Stores ----- //

/** The directory that is the destination for organized photos */
export const toDirectory = writable<string | undefined>(
	'/Users/geoff/github/Photiso/photos/organized'
);

/** The directory relative to organizedDirectory to put the current photo */
export const toRelativeDirectory = writable<string | undefined>();

/** The file name to use when moving/copying the current photo */
export const toFileName = writable<string | undefined>();

/** The list of directories where photos were moved or copied */
export const recentToDirectories = writable<string[]>([]);

/** The list of file names to suggest  */
export const suggestedToFileNames = writable<string[]>([]);

/** The full path to the destination directory **/
export const destinationDirectory: Readable<string | undefined> = derived(
	[toDirectory, toRelativeDirectory],
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
export const destinationFile: Readable<string | undefined> = derived(
	[destinationDirectory, toFileName, photo],
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
export const noConflictDestinationFileName: Readable<string | undefined> = derived(
	[destinationFile, toFileName],
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
