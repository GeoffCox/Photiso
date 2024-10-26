import { derived, writable, type Readable } from 'svelte/store';
import type { ActionHistoryItem, Photo, UserSettings, AppStatus, RecentDirectory, Action } from '../types';
import { getPathApi } from './ipc.apis';

// ----- App Stores ----- //
export const appStatus = writable<AppStatus>('waiting');

export const userSettings = writable<UserSettings>();

// ----- Source Photo Stores ----- //

export const fromDirectory = writable<string | undefined>();

export const photo = writable<Photo | undefined>();

export const nextPhoto = writable<Photo | undefined>();

export const previousPhoto = writable<Photo | undefined>();

export const photoSequence = writable<(Photo|undefined)[]>([]);

// ----- Destination Stores ----- //

export const toDirectory = writable<string | undefined>();

export const toFileName = writable<string | undefined>();

export const toFile: Readable<string | undefined> = derived(
	[toDirectory, toFileName, photo],
	([$toDirectory, $toFileName, $photo], set) => {
		const path = getPathApi();
		if (path && $toDirectory && $toFileName && $photo?.path?.ext) {
			path.join($toDirectory, `${$toFileName}${$photo.path.ext}`).then((value) => set(value));
		} else {
			set(undefined);
		}
	}
);

export const favoriteDirectories = writable<string[]>([]);

export const recentDirectories = writable<RecentDirectory[]>([]);

export const defaultToDirectoryName: Readable<string | undefined> = derived(
	[photo, recentDirectories, userSettings],
	([$photo, $recentDirectories, $userSettings], set) => {
		if ($userSettings?.enableDefaultDirectoryName) {
			if ($photo?.dateTaken && $userSettings?.defaultDirectoryPattern !== undefined) {
				console.log(
					'defaultToDirectoryName',
					$photo.dateTaken.toFormat($userSettings.defaultDirectoryPattern)
				);
				set($photo.dateTaken.toFormat($userSettings.defaultDirectoryPattern));
			} else {
				set('');
			}
		} else if ($recentDirectories.length > 0) {
			set($recentDirectories.toSorted((a, b) => b.lastUsedEpoch - a.lastUsedEpoch)?.[0]?.dir || '');
		} else {
			set('');
		}
	}
);

export const defaultToFileName: Readable<string | undefined> = derived(
	[photo, userSettings],
	([$photo, $userSettings], set) => {
		if (
			$userSettings?.enableDefaultFileName &&
			$photo?.dateTaken &&
			$userSettings?.defaultFileNamePattern !== undefined
		) {
			set($photo.dateTaken.toFormat($userSettings.defaultFileNamePattern));
		} else {
			set($photo?.path.name);
		}
	}
);

export const action = writable<Action>('move');

export const actionHistory = writable<ActionHistoryItem[]>([]);

// ----- Action Stores ----- //
export const canAct: Readable<boolean> = derived(
	[appStatus, photo, toDirectory, toFileName],
	([$appStatus, $photo, $toDirectory, $toFileName], set) => {
		const canAct = !!(
			$appStatus === 'ready' &&
			$photo?.file &&
			$photo.file.length > 0 &&
			$toDirectory &&
			$toDirectory.length > 0 &&
			$toFileName &&
			$toFileName.length > 0
		);
		set(canAct);
	}
);
