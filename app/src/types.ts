import type { PhotisoApi, PathApi, DialogApi, PhotoInfo, ParsedPath } from '$lib/ipc.types';
import type { DateTime } from 'luxon';

export type PhotisoWindow = Window &
	typeof globalThis & {
		photisoApi: PhotisoApi;
		pathApi: PathApi;
		dialogApi: DialogApi;
	};

export type UserSettings = {
	enableDefaultDirectoryName: boolean;
	defaultDirectoryName: string;
	enableDefaultFileName: boolean;
	defaultFileName: string;
};

export type Photo = Omit<PhotoInfo, 'dateTaken'> & {
	path: ParsedPath;
	info: PhotoInfo;
	dateTaken?: DateTime;
	thumbnailSrc: string;
	src?: string;
};

export type ActionHistoryItem = {
	action: 'copy' | 'move';
	createdEpoch: number;
	from: string;
	to: string;
};

export type RecentDirectory = {
	dir: string;
	favorite?: boolean;
	lastUsedEpoch: number;
};


export type MruAppState = {
	fromDirectory?: string;
	toRootDirectory?: string;
	recentDirectories: RecentDirectory[];
}