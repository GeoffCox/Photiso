import type {
	ActionHistoryItem,
	MruAppState,
	Photo,
	RecentDirectory,
	UserSettings
} from '../types';

import { getContext, tick } from 'svelte';
import { get } from 'svelte/store';
import {
	recentRelativeDirectories as recentRelativeDirectoriesStore,
	fromDirectory as fromDirectoryStore,
	toFile as toFileStore,
	userSettings as userSettingsStore,
	relativeToDirectory as relativeToDirectoryStore,
	photo as photoStore,
	toFileName as toFileNameStore,
	rootToDirectory as rootToDirectoryStore,
	actionHistory as actionHistoryStore,
	appStatus as appStatusStore,
} from './stores';
import { getPathApi, getPhotisoApi } from './ipc.apis';
import { DateTime } from 'luxon';
import { createFileNavigator2 } from './fileNavigator2';

const userSettingsStorageKey = 'photiso.UserSettings';
const appStateStorageKey = 'photiso.AppState';

export const createDispatcher = () => {
	// ----- File Navigation ----- //

	const fileNav = createFileNavigator2();

	// ----- Settings ----- //

	const loadSettings = () => {
		const localStorage = globalThis.window?.localStorage;
		if (localStorage) {
			const settingsText = window.localStorage.getItem(userSettingsStorageKey);
			if (settingsText) {
				const newSettings = JSON.parse(settingsText) as UserSettings;
				userSettingsStore.set(newSettings);
				console.log('dispatcher.loadSettings:', newSettings);
			}
		}
	};

	const saveSettings = () => {
		const localStorage = globalThis.window?.localStorage;
		const userSettings = get(userSettingsStore);
		if (localStorage && userSettings) {
			localStorage.setItem(userSettingsStorageKey, JSON.stringify(userSettings));
			console.log('dispatcher.saveSettings', userSettings);
		}
	};

	// ----- MRU App State ----- //

	const loadAppState = () => {
		const localStorage = globalThis.window?.localStorage;
		if (localStorage) {
			const appStateText = window.localStorage.getItem(appStateStorageKey);
			if (appStateText) {
				const mruAppState = JSON.parse(appStateText) as MruAppState;
				fromDirectoryStore.set(mruAppState.fromDirectory);
				rootToDirectoryStore.set(mruAppState.rootToDirectory);
				recentRelativeDirectoriesStore.set(mruAppState.recentDirectories);
				console.log('dispatcher.loadAppState:', mruAppState);
			}
		}
	};

	const saveAppState = () => {
		const localStorage = globalThis.window?.localStorage;
		if (localStorage) {
			const mruAppState: MruAppState = {
				fromDirectory: get(fromDirectoryStore),
				rootToDirectory: get(rootToDirectoryStore),
				recentDirectories: get(recentRelativeDirectoriesStore)
			};
			localStorage.setItem(appStateStorageKey, JSON.stringify(mruAppState));
			console.log('dispatcher.saveAppState:', mruAppState);
		}
	};

	// ----- Default destinations -----//

	let mruRelativeToDirectory: string | undefined = undefined;

	const getDefaultDestinationRelativeDirectory = async (photo: Photo) => {
		const userSettings = get(userSettingsStore);
		if (userSettings?.enableDefaultDirectoryName) {
			if (photo?.dateTaken && userSettings?.defaultDirectoryName) {
				return photo.dateTaken.toFormat(userSettings.defaultDirectoryName);
			}

			return '';
		}

		return mruRelativeToDirectory;
	};

	const getDefaultToFileName = (photo: Photo) => {
		const userSettings = get(userSettingsStore);
		if (userSettings?.enableDefaultFileName) {
			if (photo?.dateTaken && userSettings?.defaultFileName) {
				return photo.dateTaken.toFormat(userSettings.defaultFileName);
			}
		}

		return photo.path.name;
	};

	// ----- Photo load ----- //

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

	const loadPhotoSrc = async () => {
		const photo = get(photoStore);
		if (photo) {
			if (photo.src) {
				return;
			}

			const photiso = getPhotisoApi();
			const src = await photiso.getSrc(photo.file);

			photoStore.update((p) => {
				return { ...p, src } as Photo;
			});
		}
	};

	// ----- Photo navigation -----//

	const nextPhoto = async () => {
		await tick();

		appStatusStore.set('loading');
		const file = await fileNav.next();
		if (file) {
			console.log('dispatcher.nextPhoto-file:', file);
			const newPhoto = await loadPhoto(file);

			photoStore.set(newPhoto);
			relativeToDirectoryStore.set(await getDefaultDestinationRelativeDirectory(newPhoto));
			toFileNameStore.set(await getDefaultToFileName(newPhoto));
			console.log('dispatcher.nextPhoto-loaded:', file);
		}
		appStatusStore.set('ready');
	};

	const previousPhoto = async () => {
		await tick();

		appStatusStore.set('loading');
		const file = await fileNav.previous();
		const photo = get(photoStore);
		if (file && file !== photo?.file) {
			console.log('dispatcher.previousPhoto-file:', file);
			const newPhoto = await loadPhoto(file);

			photoStore.set(newPhoto);
			relativeToDirectoryStore.set(await getDefaultDestinationRelativeDirectory(newPhoto));
			toFileNameStore.set(await getDefaultToFileName(newPhoto));
			console.log('dispatcher.previousPhoto-loaded:', file);
		}
		appStatusStore.set('ready');
	};

	const goToPhoto = async (file: string) => {
		await tick();

		appStatusStore.set('loading');
		const goToFile = await fileNav.goTo(file);
		const photo = get(photoStore);
		if (goToFile && goToFile !== photo?.file) {
			console.log('dispatcher.goToPhoto-file:', goToFile);
			const newPhoto = await loadPhoto(goToFile);

			photoStore.set(newPhoto);
			relativeToDirectoryStore.set(await getDefaultDestinationRelativeDirectory(newPhoto));
			toFileNameStore.set(await getDefaultToFileName(newPhoto));
			console.log('dispatcher.goToPhoto-loaded:', goToFile);
		}
		appStatusStore.set('ready');
	};

	const startOrganizing = async () => {
		console.log('in startOrganizing');
		const photiso = getPhotisoApi();
		const fromDirectory = get(fromDirectoryStore);
		if (photiso && fromDirectory) {
			await photiso.start(fromDirectory);

			// clear state
			photoStore.set(undefined);
			relativeToDirectoryStore.set(undefined);
			toFileNameStore.set(undefined);
			actionHistoryStore.set([]);
			mruRelativeToDirectory = undefined;
			fileNav.clear();
			await nextPhoto();
			appStatusStore.set('ready');
		}
	};

	const doneOrganizing = () => {
		photoStore.set(undefined);
		relativeToDirectoryStore.set(undefined);
		toFileNameStore.set(undefined);
		actionHistoryStore.set([]);
		mruRelativeToDirectory = undefined;
		fileNav.clear();
		appStatusStore.set('waiting');
	}

	// ----- Recent directories -----//

	const maxRecentDirectories = 20;

	const addRecentDirectory = (dir: string) => {
		recentRelativeDirectoriesStore.update((dirs) => {
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
					firstUsedEpoch: Date.now(),
					lastUsedEpoch: Date.now()
				});
			}

			return dirs
				.toSorted((a, b) => {
					if (a.favorite === b.favorite) {
						return b.lastUsedEpoch - a.lastUsedEpoch;
					} else if (a.favorite) {
						return -1;
					} else if (b.favorite) {
						return 1;
					}

					return 0;
				})
				.slice(0, maxRecentDirectories);
		});
	};

	const favoriteRecentDirectory = (recentDirectory: RecentDirectory, favorite: boolean) => {
		recentRelativeDirectoriesStore.update((dirs) => {
			const found = dirs.find((d) => d.dir === recentDirectory.dir);
			if (found) {
				found.favorite = favorite;
			}
			return dirs.slice();
		});

		saveAppState();
	};

	const removeRecentDirectory = (recentDirectory: RecentDirectory) => {
		recentRelativeDirectoriesStore.update((dirs) => {
			return dirs.filter((d) => d.dir !== recentDirectory.dir);
		});

		saveAppState();
	};

	// ----- Photo actions -----//

	const copyPhoto = async () => {
		const photisoApi = getPhotisoApi();
		const photo = get(photoStore);
		const toFile = get(toFileStore);
		const relativeToDirectory  = get(relativeToDirectoryStore);
		if (photisoApi && photo?.file && toFile) {
			appStatusStore.set('busy');
			mruRelativeToDirectory = relativeToDirectory ;
			await photisoApi.copy(photo.file, toFile);

			actionHistoryStore.update((h) => {
				return [
					{
						action: 'copy',
						createdEpoch: Date.now(),
						from: photo!.file,
						to: toFile
					},
					...h
				] as ActionHistoryItem[];
			});

			mruRelativeToDirectory && addRecentDirectory(mruRelativeToDirectory);
			saveAppState();

			await nextPhoto();
			appStatusStore.set('ready');
		}
	};

	const movePhoto = async () => {
		const photisoApi = getPhotisoApi();
		let photo = get(photoStore);
		const toFile = get(toFileStore);
		const relativeToDirectory = get(relativeToDirectoryStore);

		if (photisoApi && photo?.file && toFile) {
			appStatusStore.set('busy');
			mruRelativeToDirectory = relativeToDirectory;
			await photisoApi.move(photo.file, toFile);

			fileNav.markMoved(photo.file, toFile);
			actionHistoryStore.update((h) => {
				return [
					{
						action: 'move',
						createdEpoch: Date.now(),
						from: photo!.file,
						to: toFile
					},
					...h
				] as ActionHistoryItem[];
			});
			mruRelativeToDirectory && addRecentDirectory(mruRelativeToDirectory);
			saveAppState();

			const movedFile = photo.file;
			await nextPhoto();
			photo = get(photoStore);
			if (movedFile == photo?.file) {
				photoStore.set(undefined);
				relativeToDirectoryStore.set(undefined);
				toFileNameStore.set(undefined);
				console.log('dispatcher.movePhoto-next not found.');
			}
			appStatusStore.set('ready');
		}
	};

	const undoAction = async (createdEpoch: number) => {
		const photisoApi = getPhotisoApi();

		const actionHistory = get(actionHistoryStore);
		if (actionHistory.length > 0) {
			appStatusStore.set('busy');

			const historyItem = actionHistory.find((i) => i.createdEpoch === createdEpoch);
			if (historyItem) {
				console.log('dispatcher.undoLastAction-moved:', historyItem.to, ' to ', historyItem.from);
				await photisoApi.move(historyItem.to, historyItem.from);
				fileNav.markRestored(historyItem.from);
				actionHistoryStore.update((h) => {
					return h.filter((i) => i.createdEpoch !== createdEpoch);
				});
				goToPhoto(historyItem.from);
			}
			appStatusStore.set('ready');
		}
	};

	return {
		loadSettings,
		saveSettings,
		loadAppState,
		saveAppState,
		startOrganizing,
		doneOrganizing,
		nextPhoto,
		previousPhoto,
		loadPhotoSrc,
		copyPhoto,
		movePhoto,
		undoAction,
		favoriteRecentDirectory,
		removeRecentDirectory
	};
};

export type Dispatcher = ReturnType<typeof createDispatcher>;

export const getDispatcher = (): Dispatcher => {
	const dispatcher = getContext<Dispatcher>('dispatcher');
	// console.log('getDispatcher:', dispatcher);
	return dispatcher;
	// return getContext('dispatcher');
};
