import { get, type Unsubscriber } from 'svelte/store';
import {
	recentRelativeDirectories,
	fromDirectory,
	toFile,
	userSettings,
	relativeToDirectory,
	photo,
	toFileName,
	rootToDirectory,
	actionHistory
} from './stores';
import { getContext, tick } from 'svelte';
import { getPathApi, getPhotisoApi } from './ipc.apis';
import type {
	ActionHistoryItem,
	MruAppState,
	Photo,
	RecentDirectory,
	UserSettings
} from '../types';
import { DateTime } from 'luxon';

const userSettingsStorageKey = 'photiso.UserSettings';
const appStateStorageKey = 'photiso.AppState';

export const createDispatcher = () => {
	const unsubscribers: Unsubscriber[] = [];

	let $fromDirectory: string | undefined;
	let $rootToDirectory: string | undefined;

	let $photo: Photo | undefined;

	let $relativeToDirectory: string | undefined;
	let $toFile: string | undefined;
	let $userSettings: UserSettings | undefined;

	unsubscribers.push(fromDirectory.subscribe((value) => ($fromDirectory = value)));
	unsubscribers.push(rootToDirectory.subscribe((value) => ($rootToDirectory = value)));

	unsubscribers.push(photo.subscribe((value) => ($photo = value)));

	unsubscribers.push(relativeToDirectory.subscribe((value) => ($relativeToDirectory = value)));
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
				rootToDirectory.set(mruAppState.rootToDirectory);
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
				rootToDirectory: get(rootToDirectory),
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
		await tick();
		const file = await photiso.next();
		if (file) {
			console.log('dispatcher.nextPhoto-file:', file);
			const newPhoto = await loadPhoto(file);

			photo.set(newPhoto);
			relativeToDirectory.set(await getDefaultDestinationRelativeDirectory(newPhoto));
			toFileName.set(await getDefaultToFileName(newPhoto));
			console.log('dispatcher.nextPhoto-loaded:', file);
		} else {
			photo.set(undefined);
			relativeToDirectory.set(undefined);
			toFileName.set(undefined);
			console.log('dispatcher.nextPhoto-none found.');
		}
	};

	const loadPhotoSrc = async () => {
		if ($photo) {
			if ($photo.src) {
				return;
			}

			const photiso = getPhotisoApi();
			const src = await photiso.getSrc($photo.file);

			photo.update((p) => {
				return { ...p, src } as Photo;
			});
		}
	};

	const startOrganizing = async () => {
		const photiso = getPhotisoApi();
		if (photiso && $fromDirectory) {
			await photiso.start($fromDirectory);
			photo.set(undefined);
			relativeToDirectory.set(undefined);
			toFileName.set(undefined);
			actionHistory.set([]);
			//TODO: clear recent and favorite directories once app picks up where it left off
			await nextPhoto();
		}
	};

	const maxRecentDirectories = 20;

	const addRecentDirectory = (dir: string) => {
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
		recentRelativeDirectories.update((dirs) => {
			const found = dirs.find((d) => d.dir === recentDirectory.dir);
			if (found) {
				found.favorite = favorite;
			}
			return dirs.slice();
		});

		saveAppState();
	};

	const removeRecentDirectory = (recentDirectory: RecentDirectory) => {
		recentRelativeDirectories.update((dirs) => {
			return dirs.filter((d) => d.dir !== recentDirectory.dir);
		});

		saveAppState();
	};

	const copyPhoto = async () => {
		const photiso = getPhotisoApi();
		if (photiso && $photo && $toFile) {
			mruRelativeToDirectory = $relativeToDirectory;
			await photiso.copy($photo.file, $toFile);

			actionHistory.update((h) => {
				return [
					{
						action: 'copy',
						createdEpoch: Date.now(),
						from: $photo!.file,
						to: $toFile
					},
					...h
				] as ActionHistoryItem[];
			});

			mruRelativeToDirectory && addRecentDirectory(mruRelativeToDirectory);
			saveAppState();
		}
	};

	const movePhoto = async () => {
		const photiso = getPhotisoApi();
		if (photiso && $photo && $toFile) {
			mruRelativeToDirectory = $relativeToDirectory;
			await photiso.move($photo.file, $toFile);

			actionHistory.update((h) => {
				return [
					{
						action: 'move',
						createdEpoch: Date.now(),
						from: $photo!.file,
						to: $toFile
					},
					...h
				] as ActionHistoryItem[];
			});
			mruRelativeToDirectory && addRecentDirectory(mruRelativeToDirectory);
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
				actionHistory.update((h) => {
					return h.filter((i) => i.createdEpoch !== createdEpoch);
				});
			}
		}
	};

	const getRelativeActionHistoryItem = async (
		item: ActionHistoryItem
	): Promise<ActionHistoryItem> => {
		const path = getPathApi();

		const result = {
			createdEpoch: item.createdEpoch,
			action: item.action,
			from: $fromDirectory ? await path.relative($fromDirectory, item.from) : item.from,
			to: $rootToDirectory ? await path.relative($rootToDirectory, item.to) : item.to
		};

		console.log('getRelativeHistoryItem', item, result);
		return result;
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
		removeRecentDirectory,
		undoAction,
		getRelativeActionHistoryItem
	};
};

export type Dispatcher = ReturnType<typeof createDispatcher>;

export const getDispatcher = (): Dispatcher => {
	return getContext('dispatcher');
};
