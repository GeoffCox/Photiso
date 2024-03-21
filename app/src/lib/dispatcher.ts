import { get, type Unsubscriber } from 'svelte/store';
import {
	recentRelativeDirectories,
	fromDirectory,
	toFile,
	userSettings,
	toRelativeDirectory,
	photo,
	toFileName,
	toRootDirectory,
	actionHistory
} from './stores';
import { getContext } from 'svelte';
import { getPathApi, getPhotisoApi } from './ipc.apis';
import type { MruAppState, Photo, RecentDirectory, UserSettings } from '../types';
import { DateTime } from 'luxon';

const userSettingsStorageKey = 'photiso.UserSettings';
const appStateStorageKey = 'photiso.AppState';

export const createDispatcher = () => {
	const unsubscribers: Unsubscriber[] = [];

	let $fromDirectory: string | undefined;

	let $photo: Photo | undefined;

	let $toRelativeDirectory: string | undefined;
	let $toFile: string | undefined;
	let $userSettings: UserSettings | undefined;

	unsubscribers.push(fromDirectory.subscribe((value) => ($fromDirectory = value)));

	unsubscribers.push(photo.subscribe((value) => ($photo = value)));

	unsubscribers.push(toRelativeDirectory.subscribe((value) => ($toRelativeDirectory = value)));
	unsubscribers.push(toFile.subscribe((value) => ($toFile = value)));
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
				const newSettings = JSON.parse(settingsText) as UserSettings;
				userSettings.set(newSettings);
				console.log('dispatcher.loadSettings:', newSettings);
			}
		}
	};

	const saveSettings = () => {
		const localStorage = globalThis.window?.localStorage;
		if (localStorage && $userSettings) {
			localStorage.setItem(userSettingsStorageKey, JSON.stringify($userSettings));
			console.log('dispatcher.saveSettings', $userSettings);
		}
	};

	// ----- MRU App State ----- //

	const loadAppState = () => {
		const localStorage = globalThis.window?.localStorage;
		if (localStorage) {
			const stateText = window.localStorage.getItem(appStateStorageKey);
			if (stateText) {
				const mruAppState = JSON.parse(stateText) as MruAppState;
				fromDirectory.set(mruAppState.fromDirectory);
				toRootDirectory.set(mruAppState.toRootDirectory);
				recentRelativeDirectories.set(mruAppState.recentDirectories);

				console.log('dispatcher.loadAppState:', mruAppState);
			}
		}
	};

	const saveAppState = () => {
		const localStorage = globalThis.window?.localStorage;
		if (localStorage && $userSettings) {
			const mruAppState: MruAppState = {
				fromDirectory: get(fromDirectory),
				toRootDirectory: get(toRootDirectory),
				recentDirectories: get(recentRelativeDirectories)
			};
			localStorage.setItem(appStateStorageKey, JSON.stringify(mruAppState));
			console.log('dispatcher.saveAppState:', mruAppState);
		}
	};

	// ----- defaults -----//

	let mruRelativeToDirectory: string | undefined = undefined;

	const getDefaultDestinationRelativeDirectory = async (photo: Photo) => {
		if ($userSettings?.enableDefaultDirectoryName) {
			if (photo?.dateTaken && $userSettings?.defaultDirectoryName) {
				return photo.dateTaken.toFormat($userSettings.defaultDirectoryName);
			}
			
			return '';
		}
		
		return mruRelativeToDirectory;
	};

	const getDefaultToFileName = (photo: Photo) => {
		if ($userSettings?.enableDefaultFileName) {
			if (photo?.dateTaken && $userSettings?.defaultFileName) {
				return photo.dateTaken.toFormat($userSettings.defaultFileName);
			}
			return '';
		}
		
		return photo.path.name;
	};

	// ----- load photo ----- //

	const loadPhoto = async (file: string): Promise<Photo> => {
		const timingStart = Date.now();

		const photiso = getPhotisoApi();
		const path = getPathApi();

		const [info, thumbnailSrc, parsedPath] = await Promise.all([
			photiso.getInfo(file),
			photiso.getThumbnailSrc(file),
			path?.parse(file)
		]);

		const dateTaken = info.dateTaken ? DateTime.fromISO(info.dateTaken) : undefined;

		console.log('dispatcher.loadPhoto-loaded:', file, ' in ', Date.now() - timingStart, ' ms.');
		return {
			...info,
			thumbnailSrc,
			dateTaken,
			path: parsedPath
		} as Photo;
	};

	const nextPhoto = async () => {
		const photiso = getPhotisoApi();
		const file = await photiso.next();
		if (file) {
			console.log('dispatcher.nextPhoto-file:', file);

			const newPhoto = await loadPhoto(file);

			photo.set(newPhoto);
			toRelativeDirectory.set(await getDefaultDestinationRelativeDirectory(newPhoto));
			toFileName.set(await getDefaultToFileName(newPhoto));
		} else {
			console.log('dispatcher.nextPhoto-none found.');
			photo.set(undefined);
		}
	};

	const loadPhotoSrc = async () => {
		if ($photo) {
			if ($photo.src) {
				return;
			}

			const photiso = getPhotisoApi();

			const src = await photiso.getSrc($photo.file);
			photo.set({ ...$photo, src });
		}
	};

	const startOrganizing = async () => {
		const photiso = getPhotisoApi();
		if (photiso && $fromDirectory) {
			await photiso.start($fromDirectory);
			photo.set(undefined);
			toRelativeDirectory.set(undefined);
			toFileName.set(undefined);
			//TODO: clear recent and favorite directories once app picks up where it left off
			await nextPhoto();
		}
	};

	const maxRecentDirectories = 5;

	const pushRecentDirectory = (dir: string) => {
		recentRelativeDirectories.update((dirs) => {
			const index = dirs.findIndex((d) => d.dir === dir);
			if (index === 0) {
				dirs[0].lastUsedEpoch = Date.now();
			} else if (index !== -1) {
				const found = dirs.splice(index, 1)[0];
				found.lastUsedEpoch = Date.now();
				dirs.unshift(found);
			} else {
				dirs.unshift({
					dir,
					lastUsedEpoch: Date.now()
				});
			}

			return dirs.slice(0, maxRecentDirectories);
		});
	};

	const favoriteRecentDirectory = (dir: RecentDirectory, favorite: boolean) => {
		recentRelativeDirectories.update((dirs) => {
			const found = dirs.find((d) => d.dir === dir.dir);
			if (found) {
				found.favorite = favorite;
			}
			return dirs.slice();
		});

		saveAppState();
	};

	const copyPhoto = async () => {
		const photiso = getPhotisoApi();
		if (photiso && $photo && $toFile) {
			mruRelativeToDirectory = $toRelativeDirectory;
			await photiso.copy($photo.file, $toFile);
			actionHistory.set([
				{
					action: 'copy',
					createdEpoch: Date.now(),
					from: $photo.file,
					to: $toFile
				},
				...get(actionHistory)
			]);
			mruRelativeToDirectory && pushRecentDirectory(mruRelativeToDirectory);
			saveAppState();
		}
	};

	const movePhoto = async () => {
		const photiso = getPhotisoApi();
		if (photiso && $photo && $toFile) {
			mruRelativeToDirectory = $toRelativeDirectory;
			await photiso.move($photo.file, $toFile);
			actionHistory.set([
				{
					action: 'move',
					createdEpoch: Date.now(),
					from: $photo.file,
					to: $toFile
				},
				...get(actionHistory)
			]);
			mruRelativeToDirectory && pushRecentDirectory(mruRelativeToDirectory);
			saveAppState();
		}
	};

	const undoAction = async (createdEpoch: number) => {
		const photiso = getPhotisoApi();

		const history = get(actionHistory);
		if (history.length > 0) {
			const historyItem = history.find((i) => i.createdEpoch === createdEpoch);
			if (historyItem) {
				await photiso.move(historyItem.to, historyItem.from);
				console.log('dispatcher.undoLastAction-moved:', historyItem.to, ' to ', historyItem.from);
				actionHistory.set(history.filter((i) => i.createdEpoch !== createdEpoch));
			}
		}
	};

	return {
		dispose,
		loadSettings,
		saveSettings,
		loadAppState,
		saveAppState,
		startOrganizing,
		nextPhoto,
		loadPhotoSrc,
		copyPhoto,
		movePhoto,
		favoriteRecentDirectory,
		undoAction
	};
};

export type Dispatcher = ReturnType<typeof createDispatcher>;

export const getDispatcher = (): Dispatcher => {
	return getContext('dispatcher');
};
