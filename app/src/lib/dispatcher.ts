import type { ActionHistoryItem, AppState, Photo, UserSettings } from '../types';

import { getContext, tick } from 'svelte';
import { get } from 'svelte/store';
import {
	mostRecentToDirectory as mostRecentToDirectoryStore,
	fromDirectory as fromDirectoryStore,
	userSettings as userSettingsStore,
	photo as photoStore,
	toDirectory as toDirectoryStore,
	toFileName as toFileNameStore,
	toFile as toFileStore,
	actionHistory as actionHistoryStore,
	appStatus as appStatusStore,
	favoriteDirectories as favoriteDirectoriesStore,
	previousPhoto as previousPhotoStore,
	nextPhoto as nextPhotoStore,
	photoSequence as photoSequenceStore
} from './stores';
import { getPathApi, getPhotisoApi } from './ipc.apis';
import { DateTime } from 'luxon';
import { createFileNavigator2 as createFileNavigator } from './fileNavigator2';
import { isEqual} from 'lodash-es';

const userSettingsStorageKey = 'photiso.UserSettings';
const appStateStorageKey = 'photiso.AppState';

export const createDispatcher = () => {
	// ----- File Navigation ----- //

	const fileNav = createFileNavigator();

	const clearPhotoState = () => {
		photoStore.set(undefined);
		previousPhotoStore.set(undefined);
		nextPhotoStore.set(undefined);
		photoSequenceStore.set([]);
		toDirectoryStore.set(undefined);
		toFileNameStore.set(undefined);
		actionHistoryStore.set([]);
		fileNav.clear();
	};

	// ----- Settings ----- //

	const loadSettings = () => {
		const localStorage = globalThis.window?.localStorage;
		if (localStorage) {
			const settingsText = window.localStorage.getItem(userSettingsStorageKey);
			if (settingsText) {
				const newSettings = JSON.parse(settingsText) as UserSettings;
				userSettingsStore.set(newSettings);
			}
		}
	};

	const saveSettings = () => {
		const localStorage = globalThis.window?.localStorage;
		const userSettings = get(userSettingsStore);
		if (localStorage && userSettings) {
			localStorage.setItem(userSettingsStorageKey, JSON.stringify(userSettings));
		}
	};

	// ----- MRU App State ----- //

	const loadAppState = () => {
		const localStorage = globalThis.window?.localStorage;
		if (localStorage) {
			const appStateText = window.localStorage.getItem(appStateStorageKey);
			if (appStateText) {
				const appState = JSON.parse(appStateText) as AppState;
				fromDirectoryStore.set(appState.fromDirectory);
				mostRecentToDirectoryStore.set(appState.mostRecentToDirectory);
				favoriteDirectoriesStore.set(appState.favoriteDirectories || []);
			}
		}
	};

	const saveAppState = () => {
		const localStorage = globalThis.window?.localStorage;
		if (localStorage) {
			const mruAppState: AppState = {
				fromDirectory: get(fromDirectoryStore),
				mostRecentToDirectory: get(mostRecentToDirectoryStore),
				favoriteDirectories: get(favoriteDirectoriesStore)
			};
			localStorage.setItem(appStateStorageKey, JSON.stringify(mruAppState));
		}
	};

	// ----- Photo load ----- //

	const loadPhoto = async (file: string): Promise<Photo> => {
		// const timingStart = Date.now();

		const photiso = getPhotisoApi();
		const path = getPathApi();

		const [info, thumbnailSrc, parsedPath] = await Promise.all([
			photiso.getInfo(file),
			photiso.getThumbnailSrc(file),
			path?.parse(file)
		]);

		const dateTaken = info.dateTaken ? DateTime.fromISO(info.dateTaken) : undefined;

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

	const loadPhotoHash = async () => {
		const photo = get(photoStore);
		if (photo) {
			if (photo.src) {
				return;
			}

			const photiso = getPhotisoApi();
			return await photiso.getSrcHash(photo.file);
		}
	};

	// ----- Photo navigation -----//

	const nextPhoto = async () => {
		await tick();
		appStatusStore.set('loading');
		const file = await fileNav.next();
		if (file) {
			const newPhoto = await loadPhoto(file);
			photoStore.set(newPhoto);

			const previousFile = await fileNav.peekPrevious();
			previousPhotoStore.set(
				previousFile && previousFile !== file ? await loadPhoto(previousFile) : undefined
			);
			const nextFile = await fileNav.peekNext();
			nextPhotoStore.set(nextFile && nextFile !== file ? await loadPhoto(nextFile) : undefined);
			photoSequenceStore.set([
				await get(previousPhotoStore),
				await get(photoStore),
				await get(nextPhotoStore)
			]);
		}
		appStatusStore.set('ready');
	};

	const previousPhoto = async () => {
		await tick();
		appStatusStore.set('loading');
		const file = await fileNav.previous();
		const photo = get(photoStore);
		if (file && file !== photo?.file) {
			const newPhoto = await loadPhoto(file);
			photoStore.set(newPhoto);

			const previousFile = await fileNav.peekPrevious();
			previousPhotoStore.set(
				previousFile && previousFile !== file ? await loadPhoto(previousFile) : undefined
			);
			const nextFile = await fileNav.peekNext();
			nextPhotoStore.set(nextFile && nextFile !== file ? await loadPhoto(nextFile) : undefined);
			photoSequenceStore.set([
				await get(previousPhotoStore),
				await get(photoStore),
				await get(nextPhotoStore)
			]);
		}
		appStatusStore.set('ready');
	};

	const goToPhoto = async (file: string) => {
		await tick();
		appStatusStore.set('loading');
		const goToFile = await fileNav.goTo(file);
		const photo = get(photoStore);
		if (goToFile && goToFile !== photo?.file) {
			const newPhoto = await loadPhoto(goToFile);
			photoStore.set(newPhoto);

			const previousFile = await fileNav.peekPrevious();
			previousPhotoStore.set(
				previousFile && previousFile !== file ? await loadPhoto(previousFile) : undefined
			);
			const nextFile = await fileNav.peekNext();
			nextPhotoStore.set(nextFile && nextFile !== file ? await loadPhoto(nextFile) : undefined);
			photoSequenceStore.set([
				await get(previousPhotoStore),
				await get(photoStore),
				await get(nextPhotoStore)
			]);
		}
		appStatusStore.set('ready');
	};

	const startOrganizing = async () => {
		const photiso = getPhotisoApi();
		const fromDirectory = get(fromDirectoryStore);
		if (photiso && fromDirectory) {
			saveAppState(); //save from directory
			await photiso.start(fromDirectory);
			clearPhotoState();
			await nextPhoto();
			appStatusStore.set('ready'); //TODO: unnecessary?
		}
	};

	const doneOrganizing = () => {
		clearPhotoState();
		appStatusStore.set('waiting');
	};

	// ----- Favorite Directories ----- //

	const addFavoriteDirectory = (directory: string) => {
		const favorites = get(favoriteDirectoriesStore);
		const index = favorites.indexOf(directory);
		if (index === -1) {
			favoriteDirectoriesStore.update((dirs) => {
				const newFavorites = [...dirs, directory];
				newFavorites.toSorted((a, b) => a.localeCompare(b));
				return newFavorites;
			});
			saveAppState();
		}
	};

	const removeFavoriteDirectory = (directory: string) => {
		const favorites = get(favoriteDirectoriesStore);
		const index = favorites.indexOf(directory);
		if (index !== -1) {
			favoriteDirectoriesStore.update((dirs) => {
				dirs.splice(index, 1);
				return [...dirs];
			});
			saveAppState();
		}
	};

	const toggleFavoriteDirectory = (directory: string) => {
		const favorites = get(favoriteDirectoriesStore);
		const index = favorites.indexOf(directory);
		if (index === -1) {
			favoriteDirectoriesStore.update((dirs) => {
				const newFavorites = [...dirs, directory];
				newFavorites.toSorted((a, b) => a.localeCompare(b));
				return newFavorites;
			});
		} else {
			favoriteDirectoriesStore.update((dirs) => {
				dirs.splice(index, 1);
				return [...dirs];
			});
		}
	};

	// ----- Actions -----//

	const movePhoto = async () => {
		const photisoApi = getPhotisoApi();
		const pathApi = getPathApi();
		let photo = get(photoStore);
		const toDirectory = get(toDirectoryStore);
		const toFileName = get(toFileNameStore);
		const toFile = get(toFileStore);
		const userSettings = get(userSettingsStore);
		if (photisoApi && pathApi && photo?.file && toDirectory && toFileName && toFile) {
			appStatusStore.set('busy');
			const noOverwriteSuffix = await photisoApi.getNoConflictFileNameSufix(toFile);
			if (noOverwriteSuffix && userSettings.autoRenameConflicts) {
				toFileNameStore.set(`${toFileName}${noOverwriteSuffix}`);
				await movePhoto();
			} else if (!noOverwriteSuffix) {
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

				mostRecentToDirectoryStore.set(toDirectory);

				const movedFile = photo.file;
				await nextPhoto();
				photo = get(photoStore);
				if (movedFile == photo?.file) {
					photoStore.set(undefined);
					toFileNameStore.set(undefined);
				}
			} else {
				console.log('CONFLICT!');
			}
			appStatusStore.set('ready');
		}
	};

	const copyPhoto = async () => {
		const photisoApi = getPhotisoApi();
		const pathApi = getPathApi();
		const photo = get(photoStore);
		const toDirectory = get(toDirectoryStore);
		const toFileName = get(toFileNameStore);
		const toFile = get(toFileStore);
		const userSettings = get(userSettingsStore);
		if (photisoApi && pathApi && photo?.file && toDirectory && toFileName && toFile) {
			appStatusStore.set('busy');
			const noOverwriteSuffix = await photisoApi.getNoConflictFileNameSufix(toFile);
			if (noOverwriteSuffix && userSettings.autoRenameConflicts) {
				toFileNameStore.set(`${toFileName}${noOverwriteSuffix}`);
				await copyPhoto();
			} else if (!noOverwriteSuffix) {
				console.log('copying from ', photo.file, toFile);
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

				mostRecentToDirectoryStore.set(toDirectory);

				await nextPhoto();
				appStatusStore.set('ready');
			}
		} else {
			console.log('CONFLICT!');
		}
	};

	// ----- Photo actions -----//
	

	const undoAction = async (item: ActionHistoryItem) => {
		const photisoApi = getPhotisoApi();

		const actionHistory = get(actionHistoryStore);
		if (actionHistory.length > 0) {
			appStatusStore.set('busy');

			const historyItem = actionHistory.find((i) => {
				return isEqual(i, item);
			});
			if (historyItem) {
				await photisoApi.move(historyItem.to, historyItem.from);
				fileNav.markRestored(historyItem.from);
				actionHistoryStore.update((h) => {
					return h.filter((i) => !isEqual(i, historyItem));
				});
				goToPhoto(historyItem.from);
			}
			appStatusStore.set('ready');
		}
	};

	const undoLastAction = async () => {
		const actionHistory = get(actionHistoryStore);
		if (actionHistory.length > 0) {
 			await undoAction(actionHistory[0]);
		}
	}


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
		loadPhotoHash,
		copyPhoto,
		movePhoto,
		undoAction,
		undoLastAction,
		addFavoriteDirectory,
		removeFavoriteDirectory,
		toggleFavoriteDirectory
	};
};

export type Dispatcher = ReturnType<typeof createDispatcher>;

export const getDispatcher = (): Dispatcher => {
	const dispatcher = getContext<Dispatcher>('dispatcher');
	return dispatcher;
};
