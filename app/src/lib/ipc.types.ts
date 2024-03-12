// import type { ExifData } from "exif";
import * as path from 'path';

export type Rotation = 0 | 90 | 180 | 270;

export type PhotoInfo = {
	file: string;
	sizeInBytes: number;

	dateTaken?: string;
	height?: number;
	make?: string;
	model?: string;
	mirrored?: boolean;
	rotation?: Rotation;
	resolutionX?: number;
	resolutionY?: number;
	width?: number;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	exifData?: any;
};

export type PhotisoApi = {
	start: (dir: string) => Promise<void>;
	next: () => Promise<string | undefined>;
	getInfo: () => Promise<PhotoInfo>;
	getSrc: () => Promise<string>;
	getNoOverwriteSuffix: (destFile: string) => Promise<string | undefined>;
	copy: (dest: string) => Promise<void>;
	move: (dest: string) => Promise<void>;
};

export type PathApi = typeof path;

export type DialogApi = {
	browseForDirectory: (startDir: string) => Promise<string | undefined>;
};
