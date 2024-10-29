import type { PhotisoApi, PathApi, DialogApi, PhotoInfo, ParsedPath } from '$lib/ipc.types';
import type { DateTime } from 'luxon';

export type AppStatus = 'waiting' | 'loading' | 'ready' | 'busy' | 'done';

export type Action = 'copy' | 'move';

export type PhotisoWindow = Window &
	typeof globalThis & {
		photisoApi: PhotisoApi;
		pathApi: PathApi;
		dialogApi: DialogApi;
	};

export type Photo = Omit<PhotoInfo, 'dateTaken'> & {
	path: ParsedPath;
	info: PhotoInfo;
	dateTaken?: DateTime;
	thumbnailSrc: string;
	src?: string;
};

export type RecentDirectory = {
	dir: string;
	favorite?: boolean;
	firstUsedEpoch: number;
	lastUsedEpoch: number;
};

export type ActionHistoryItem = {
	action: 'copy' | 'move';
	createdEpoch: number;
	from: string;
	to: string;
};

export type AppState = {
	fromDirectory?: string;
	mostRecentToDirectory?: string;
	favoriteDirectories: string[];
};

export type UserSettings = {
	enableDefaultDirectoryName: boolean;
	defaultDirectoryPattern: string;
	enableDefaultFileName: boolean;
	defaultFileNamePattern: string;
	autoRenameConflicts: boolean;
	copyOrMove: 'copy' | 'move';
};

