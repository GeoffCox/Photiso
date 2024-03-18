import type { PhotisoApi, PathApi, DialogApi, PhotoInfo, ParsedPath } from '$lib/ipc.types';
import type { DateTime } from 'luxon';

export type PhotisoWindow = Window &
	typeof globalThis & {
		photisoApi: PhotisoApi;
		pathApi: PathApi;
		dialogApi: DialogApi;
	};

export type UserSettings = {
	fileAction: 'move' | 'copy';
	defaultDirectoryName: 'date' | 'previous' | 'empty';
	defaultDirectoryDateFormat: 'year' | 'year-month' | 'year-month-day';
	defaultFileName: 'datetime' | 'original' | 'empty';
	defaultFileNamePrefix: string;
};

export type Photo = Omit<PhotoInfo, 'dateTaken'> & {
	path: ParsedPath;
	info: PhotoInfo;
	dateTaken?: DateTime;
	thumbnailSrc: string;
	src?: string;
};


export type MruAppState = {
	fromDirectory?: string;
	toRootDirectory?: string;
	recentDirectories: string[];
}