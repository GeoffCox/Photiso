import type { PhotisoApi, PathApi, DialogApi } from '$lib/ipc.types';

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
