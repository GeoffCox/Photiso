import type { Unsubscriber } from 'svelte/store';
import {
	recentToDirectories,
	fromDirectory,
	destinationFile,
	userSettings,
	toRelativeDirectory,
	photo,
	toFileName,
	suggestedToFileNames
} from './stores';
import { getContext, tick } from 'svelte';
import { getPathApi, getPhotisoApi } from './ipc.apis';
import type { Photo, UserSettings } from '../types';
import { DateTime } from 'luxon';

const userSettingsStorageKey = 'photiso.UserSettings';

const cachePhotoCount = 3;

export const createDispatcher = () => {
	const unsubscribers: Unsubscriber[] = [];

	let $photo: Photo | undefined;

	let $destinationRelativeDirectory: string | undefined;
	let $destinationFile: string | undefined;
	let $recentDirectories: string[];
	let $unorganizedDirectory: string | undefined;
	let $userSettings: UserSettings | undefined;

	unsubscribers.push(photo.subscribe((value) => ($photo = value)));

	unsubscribers.push(
		toRelativeDirectory.subscribe((value) => ($destinationRelativeDirectory = value))
	);
	unsubscribers.push(destinationFile.subscribe((value) => ($destinationFile = value)));
	unsubscribers.push(recentToDirectories.subscribe((value) => ($recentDirectories = value)));
	unsubscribers.push(fromDirectory.subscribe((value) => ($unorganizedDirectory = value)));
	unsubscribers.push(userSettings.subscribe((value) => ($userSettings = value)));

	const dispose = () => {
		for (const unsubscriber of unsubscribers) {
			unsubscriber();
		}
	};

	// ----- Settings ----- //

	const loadSettings = () => {
		const localStorage = globalThis.window?.localStorage;
		if (localStorage) {
			const settingsText = window.localStorage.getItem(userSettingsStorageKey);
			if (settingsText) {
				userSettings.set(JSON.parse(settingsText) as UserSettings);
			}
		}
	};

	const saveSettings = () => {
		const localStorage = globalThis.window?.localStorage;
		if (localStorage && $userSettings) {
			localStorage.setItem(userSettingsStorageKey, JSON.stringify($userSettings));
		}
	};

	// ----- defaults -----//

	let mruDestinationRelativeDirectory: string | undefined = undefined;

	const getDefaultDestinationRelativeDirectory = async (photo: Photo) => {
		const path = getPathApi();

		if ($userSettings) {
			switch ($userSettings.defaultDirectoryName) {
				case 'date':
					if (photo.dateTaken) {
						switch ($userSettings.defaultDirectoryDateFormat) {
							case 'year':
								return photo.dateTaken.toFormat('yyyy');
								return;
							case 'year-month': {
								const year = photo.dateTaken.toFormat('yyyy');
								const month = photo.dateTaken.toFormat('MM');
								return await path.join(year, month);
							}
							case 'year-month-day': {
								const year = photo.dateTaken.toFormat('yyyy');
								const month = photo.dateTaken.toFormat('MM');
								const day = photo.dateTaken.toFormat('dd');
								return await path.join(year, month, day);
							}
						}
					}
					break;
				case 'previous': {
					return mruDestinationRelativeDirectory;
				}
				case 'empty': {
					return '';
				}
			}
		}
	};

	const getDateTimeFileName = (photo: Photo) => {
		if (photo && photo.dateTaken) {
			const prefix = $userSettings?.defaultFileNamePrefix ?? '';
			return `${prefix}${photo.dateTaken.toFormat('yyyy-MM-dd_HH-mm-ss-u')}`;
		}

		return undefined;
	};

	const getDefaultDestinationFileName = (photo: Photo) => {
		if ($userSettings) {
			switch ($userSettings?.defaultFileName) {
				case 'datetime':
					if (photo.dateTaken) {
						return getDateTimeFileName(photo);
					}
					break;
				case 'empty':
					return '';
				default:
				case 'original':
					return $photo?.path.name;
			}
		}
		return undefined;
	};

	const getSuggestedFilesNames = (photo: Photo) => {
		if (photo) {
			return [
				photo?.path.name, // original file name
				getDateTimeFileName(photo)
			].filter(Boolean) as string[];
		}
		return [];
	};

	// ----- load photo ----- //

	const loadPhoto = async (file: string): Promise<Photo> => {
		const timingStart = Date.now();

		const photiso = getPhotisoApi();
		const path = getPathApi();

		const [info, src, parsedPath] = await Promise.all([
			photiso.getInfo(file),
			photiso.getSrc(file),
			path?.parse(file)
		]);

		const dateTaken = info.dateTaken ? DateTime.fromISO(info.dateTaken) : undefined;

		console.log('dispatcher.loadPhoto-loaded:', file, ' in ', Date.now() - timingStart, ' ms.');
		return {
			...info,
			src,
			dateTaken,
			path: parsedPath
		} as Photo;
	};

	const photoCache: Record<string, Photo> = {};

	const fillCache = async () => {
		const photiso = getPhotisoApi();
		const peekFiles = await photiso.peek(cachePhotoCount);

		for (let i = 0; i < peekFiles.length; i++) {
			const peekFile = peekFiles[i];
			if (!photoCache[peekFile]) {
				photoCache[peekFile] = await loadPhoto(peekFile);
				console.log('dispatcher.fillCache-added:', peekFile);
			}
		}
	};

	const loadCachedPhoto = async (file: string): Promise<Photo> => {
		const result = photoCache[file];
		if (result) {
			console.log('dispatcher.loadCachedPhoto-HIT:', file);
			delete photoCache[file];
			return result;
		}

		console.log('dispatcher.loadCachedPhoto-MISS:', file);
		return loadPhoto(file);
	};

	const nextPhoto = async () => {
		const photiso = getPhotisoApi();
		const file = await photiso.next();
		if (file) {
			console.log('dispatcher.nextPhoto-file:', file);

			const newPhoto = await loadCachedPhoto(file);

			photo.set(newPhoto);
			toRelativeDirectory.set(await getDefaultDestinationRelativeDirectory(newPhoto));
			toFileName.set(await getDefaultDestinationFileName(newPhoto));
			suggestedToFileNames.set(getSuggestedFilesNames(newPhoto));

			// await the next photo and any UI updates
			// before asking to fill the cache
			await tick();
			fillCache();
		} else {
			console.log('dispatcher.nextPhoto-none found.');
			photo.set(undefined);
		}
	};

	const startOrganizing = async () => {
		const photiso = getPhotisoApi();
		if (photiso && $unorganizedDirectory) {
			await photiso.start($unorganizedDirectory);
			await nextPhoto();
		}
	};

	const copyPhoto = async () => {
		const photiso = getPhotisoApi();
		if (photiso && $photo && $destinationFile) {
			mruDestinationRelativeDirectory = $destinationRelativeDirectory;
			await photiso.copy($photo.file, $destinationFile);
		}
	};

	const movePhoto = async () => {
		const photiso = getPhotisoApi();
		if (photiso && $photo && $destinationFile) {
			mruDestinationRelativeDirectory = $destinationRelativeDirectory;
			await photiso.move($photo.file, $destinationFile);
		}
	};

	const pushRecentDirectory = (dir: string) => {
		if (!$recentDirectories.includes(dir)) {
			recentToDirectories.set([dir, ...$recentDirectories.slice(0, 4)]);
		}
	};

	return {
		dispose,
		loadSettings,
		saveSettings,
		startOrganizing,
		nextPhoto,
		copyPhoto,
		movePhoto,
		pushRecentDirectory
	};
};

export type Dispatcher = ReturnType<typeof createDispatcher>;

export const getDispatcher = (): Dispatcher => {
	return getContext('dispatcher');
};
