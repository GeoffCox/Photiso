import { DateTime } from 'luxon';
import { derived, writable, type Readable, get } from 'svelte/store';
import type { ParsedPath, PhotoInfo } from './ipc.types';
import { getPathApi, getPhotisoApi } from './ipc.apis';
import type { UserSettings } from '../types';

// ----- App Stores ----- //
export const userSettings = writable<UserSettings>();

// ----- Source Photo Stores ----- //

/** The directory containing unorganized photos */
export const unorganizedDirectory = writable<string | undefined>(
	'/Users/geoff/github/Photiso/photos/unorganized'
);

/** The full file path to the current photo to organize */
export const photoFile = writable<string | undefined>();

export const photoInfoCache = writable<Record<string, PhotoInfo>>({});
export const photoSrcCache = writable<Record<string, string>>({});

/** The photo information **/
export const photoInfo: Readable<PhotoInfo | undefined> = derived(photoFile, ($photoFile, set) => {
	const photiso = getPhotisoApi();
	if (photiso && $photoFile) {
		const info = get(photoInfoCache)?.[$photoFile];
		if (info) {
			console.log('photoInfoCache: Hit', $photoFile);
			const oldInfos = get(photoInfoCache);
			delete oldInfos[$photoFile];
			photoInfoCache.set(oldInfos);
			set(info);
		} else {
			console.log('photoInfoCache: Miss', $photoFile);
			photiso.getInfo($photoFile).then((value) => {
				set(value);
			});
		}
	} else {
		set(undefined);
	}
});

/** The photo information **/
export const photoSrc: Readable<string | undefined> = derived([photoFile], ([$photoFile], set) => {
	const photiso = getPhotisoApi();
	if (photiso && $photoFile) {
		const src = get(photoSrcCache)?.[$photoFile];
		if (src) {
			console.log('photoSrcCache: Hit', $photoFile);
			const oldSrcs = get(photoSrcCache);
			delete oldSrcs[$photoFile];
			photoSrcCache.set(oldSrcs);
			set(src);
		} else {
			console.log('photoSrcCache: Miss', $photoFile);
			photiso.getSrc($photoFile).then((value) => {
				set(value);
			});
		}
	} else {
		set(undefined);
	}
});

/** The luxon DateTime of the photo date taken **/
export const photoDateTaken = derived(photoInfo, ($photoInfo) =>
	$photoInfo?.dateTaken ? DateTime.fromISO($photoInfo.dateTaken) : undefined
);

/** The path parts parsed from the photo file **/
export const photoPath: Readable<ParsedPath | undefined> = derived(photoFile, ($photoFile, set) => {
	const path = getPathApi();
	if (path && $photoFile) {
		path?.parse($photoFile).then((value) => {
			set(value);
		});
	} else {
		set(undefined);
	}
});

// ----- Destination Stores ----- //

/** The directory that is the destination for organized photos */
export const organizedDirectory = writable<string | undefined>(
	'/Users/geoff/github/Photiso/photos/organized'
);

/** The directory relative to organizedDirectory to put the current photo */
export const destinationRelativeDirectory = writable<string | undefined>();

/** The the file name to use when moving/copying the current photo */
export const destinationFileName = writable<string | undefined>();

/** The destinationRelativeDirectory when the most recent photo was moved or copied. */
export const mostRecentDestinationRelativeDirectory = writable<string | undefined>();

export const recentDirectories = writable<string[]>([]);

export const dateDestinationRelativeDirectory: Readable<string | undefined> = derived(
	[userSettings, photoDateTaken],
	([$userSettings, $photoDateTaken], set) => {
		const path = getPathApi();
		if (path && $userSettings && $photoDateTaken) {
			switch ($userSettings.defaultDirectoryDateFormat) {
				case 'year':
					set($photoDateTaken.toFormat('yyyy'));
					return;
				case 'year-month': {
					const year = $photoDateTaken.toFormat('yyyy');
					const month = $photoDateTaken.toFormat('MM');
					path.join(year, month).then((value) => set(value));
					return;
				}
				case 'year-month-day': {
					const year = $photoDateTaken.toFormat('yyyy');
					const month = $photoDateTaken.toFormat('MM');
					const day = $photoDateTaken.toFormat('dd');
					path.join(year, month, day).then((value) => set(value));
					return;
				}
			}
		}

		set(undefined);
	}
);

export const defaultDestinationRelativeDirectory: Readable<string | undefined> = derived(
	[userSettings, dateDestinationRelativeDirectory, mostRecentDestinationRelativeDirectory],
	([$userSettings, $dateDestinationRelativeDirectory, $mostRecentDestinationRelativeDirectory]) => {
		const path = getPathApi();
		if (path && $userSettings) {
			switch ($userSettings.defaultDirectoryName) {
				case 'date':
					return $dateDestinationRelativeDirectory;
				case 'previous': {
					return $mostRecentDestinationRelativeDirectory;
				}
				case 'empty': {
					return '';
				}
			}
		}

		return undefined;
	}
);

export const dateTimeDestinationFileName = derived(
	[userSettings, photoDateTaken],
	([$userSettings, $photoDateTaken]) => {
		if ($photoDateTaken) {
			const prefix = $userSettings?.defaultFileNamePrefix ?? '';
			return `${prefix}${$photoDateTaken.toFormat('yyyy-MM-dd_HH-mm-ss-u')}`;
		}
		return undefined;
	}
);

export const defaultDestinationFileName = derived(
	[userSettings, dateTimeDestinationFileName, photoPath],
	([$userSettings, $dateTimeDestinationFileName, $photoPath]) => {
		if ($userSettings) {
			switch ($userSettings?.defaultFileName) {
				case 'datetime':
					return $dateTimeDestinationFileName;
				case 'empty':
					return '';
				default:
				case 'original':
					return $photoPath?.name;
			}
		}
		return undefined;
	}
);

export const suggestedDestinationFileNames: Readable<string[]> = derived(
	[dateTimeDestinationFileName, photoPath],
	([$dateTimeDestinationFileName, $photoPath]) => {
		return [$photoPath?.name, $dateTimeDestinationFileName].filter(Boolean) as string[];
	}
);

/** The full path to the destination directory **/
export const destinationDirectory: Readable<string | undefined> = derived(
	[organizedDirectory, destinationRelativeDirectory],
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
	[destinationDirectory, destinationFileName, photoPath],
	([$destinationDirectory, $destinationFileName, $photoPath], set) => {
		const path = getPathApi();
		if (path && $destinationDirectory && $destinationFileName && $photoPath?.ext) {
			path
				.join($destinationDirectory, `${$destinationFileName}${$photoPath.ext}`)
				.then((value) => set(value));
		} else {
			set(undefined);
		}
	}
);

/** The destination file name that does not cause an overwrite conflict **/
export const noConflictDestinationFileName: Readable<string | undefined> = derived(
	[destinationFile, destinationFileName],
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
