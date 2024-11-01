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
  width?: number;
  exifData?: any;
};

export type PhotisoApi = {
  start: (dir: string) => Promise<void>;
  next: () => Promise<string | undefined>;
  peek: (count: number) => Promise<string[]>;
  getInfo: (file: string) => Promise<PhotoInfo>;
  getThumbnailSrc: (file: string) => Promise<string>;
  getSrc: (file: string) => Promise<string>;
  getSrcHash: (file: string) => Promise<string>;
  getNoConflictFileNameSufix: (destFile: string) => Promise<string | undefined>;
  copy: (source: string, dest: string) => Promise<void>;
  move: (source: string, dest: string) => Promise<void>;
};

export type ParsedPath = {
  root: string;
  dir: string;
  base: string;
  ext: string;
  name: string;
};

export type FormatInputPathObject = {
  root?: string | undefined;
  dir?: string | undefined;
  base?: string | undefined;
  ext?: string | undefined;
  name?: string | undefined;
};

export type PathApi = {
  normalize: (path: string) => Promise<string>;
  join: (...paths: string[]) => Promise<string>;
  resolve: (...paths: string[]) => Promise<string>;
  isAbsolute: (path: string) => Promise<boolean>;
  relative: (from: string, to: string) => Promise<string>;
  dirname: (path: string) => Promise<string>;
  basename: (path: string, suffix?: string) => Promise<string>;
  extname: (path: string) => Promise<string>;
  parse: (path: string) => Promise<ParsedPath>;
  format: (pathObject: FormatInputPathObject) => Promise<string>;
  toNamespacedPath: (path: string) => Promise<string>;
};

export type DialogApi = {
  browseForDirectory: (startDir: string) => Promise<string | undefined>;
};
