import type { Unsubscriber } from 'svelte/store';
import {
	recentDirectories,
	photoFile,
	unorganizedDirectory,
	destinationFile,
	userSettings,
	mostRecentDestinationRelativeDirectory,
	destinationRelativeDirectory,
	photoSrcCache,
	photoInfoCache
} from './stores';
import { getContext } from 'svelte';
import { getPhotisoApi } from './ipc.apis';
import type { UserSettings } from '../types';
import type { PhotoInfo } from './ipc.types';

const userSettingsStorageKey = 'photiso.UserSettings';

export const createDispatcher = () => {
	const unsubscribers: Unsubscriber[] = [];

	let $photoFile: string | undefined;
	let $photoInfoCache: Record<string, PhotoInfo>;
	let $photoSrcCache: Record<string, string>;
	let $destinationRelativeDirectory: string | undefined;
	let $destinationFile: string | undefined;
	let $recentDirectories: string[];
	let $unorganizedDirectory: string | undefined;
	let $userSettings: UserSettings | undefined;

	unsubscribers.push(photoFile.subscribe((value) => ($photoFile = value)));
	unsubscribers.push(photoSrcCache.subscribe((value) => ($photoSrcCache = value)));
	unsubscribers.push(photoInfoCache.subscribe((value) => ($photoInfoCache = value)));
	unsubscribers.push(
		destinationRelativeDirectory.subscribe((value) => ($destinationRelativeDirectory = value))
	);
	unsubscribers.push(destinationFile.subscribe((value) => ($destinationFile = value)));
	unsubscribers.push(recentDirectories.subscribe((value) => ($recentDirectories = value)));
	unsubscribers.push(unorganizedDirectory.subscribe((value) => ($unorganizedDirectory = value)));
	unsubscribers.push(userSettings.subscribe((value) => ($userSettings = value)));

	const dispose = () => {
		for (const unsubscriber of unsubscribers) {
			unsubscriber();
		}
	};

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

	const preCachePhotoInfo = async (peekFiles: string[]) => {
		const photiso = getPhotisoApi();
		if (photiso && $photoInfoCache) {
			const newInfos: Record<string, PhotoInfo> = {};
			for (let i = 0; i < peekFiles.length; i++) {
				const peekFile = peekFiles[i];
				if (!$photoInfoCache[peekFile]) {
					console.log('preCachePhotoInfo file:', peekFile);
					newInfos[peekFile] = await photiso.getInfo(peekFile);
				}
			}
			if (Object.keys(newInfos).length > 0) {
				photoInfoCache.set({ ...$photoInfoCache, ...newInfos });
			}
		}
	};

	const preCachePhotoSrc = async (peekFiles: string[]) => {
		const photiso = getPhotisoApi();
		if (photiso && $photoSrcCache) {
			const newSrcs: Record<string, string> = {};
			for (let i = 0; i < peekFiles.length; i++) {
				const peekFile = peekFiles[i];
				if (!$photoSrcCache[peekFile]) {
					console.log('preCachePhotoSrc file:', peekFile);
					newSrcs[peekFile] = await photiso.getSrc(peekFile);
				}
			}
			if (Object.keys(newSrcs).length > 0) {
				photoSrcCache.set({ ...$photoSrcCache, ...newSrcs });
			}
		}
	};

	const preCache = async () => {
		const photiso = getPhotisoApi();
		if (photiso && $photoSrcCache) {
			const peekFiles = await photiso.peek(3);
			if (peekFiles.length > 0) {
				preCachePhotoInfo(peekFiles);
				preCachePhotoSrc(peekFiles);
			}
		}
	}

	const nextPhoto = async () => {
		const photiso = getPhotisoApi();
		if (photiso) {
			photoFile.set(await photiso.next());

			preCache();
		} else {
			photoFile.set(undefined);
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
		if (photiso && $photoFile && $destinationFile) {
			mostRecentDestinationRelativeDirectory.set($destinationRelativeDirectory);
			await photiso.copy($photoFile, $destinationFile);
		}
	};

	const movePhoto = async () => {
		const photiso = getPhotisoApi();
		if (photiso && $photoFile && $destinationFile) {
			mostRecentDestinationRelativeDirectory.set($destinationRelativeDirectory);
			await photiso.move($photoFile, $destinationFile);
		}
	};

	const pushRecentDirectory = (dir: string) => {
		if (!$recentDirectories.includes(dir)) {
			recentDirectories.set([dir, ...$recentDirectories.slice(0, 4)]);
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
