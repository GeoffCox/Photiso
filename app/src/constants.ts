import type { UserSettings } from './types';

export const defaultUserSettings: UserSettings = {
	enableDefaultDirectoryName: false,
	defaultDirectoryPattern: 'yyyy/MM',
	enableDefaultFileName: false,
	defaultFileNamePattern: "'IMG_'yyyy-MM-dd_HH-mm-ss-SSS",
	autoRenameConflicts: false,
	copyOrMove: 'move',
};
