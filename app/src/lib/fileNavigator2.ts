import { getPhotisoApi } from './ipc.apis';

type FileEntry = {
	file: string;
	movedTo?: string;
};

export const createFileNavigator2 = () => {
	let files: FileEntry[] = [];
	let index: number | undefined = undefined;

	const current = () => (index !== undefined ? files[index] : undefined);

	const next = async (): Promise<string | undefined> => {
		// look forward, skipping any moved files
		if (index !== undefined) {
			let nextIndex = index;
			while (nextIndex < files.length - 1) {
				nextIndex++;
				if (!files[nextIndex].movedTo) {
					index = nextIndex;
					console.log('navigator.next found in forward stack', current()?.file);
					return current()?.file;
				}
			}
		}

		// get the next file from disk
		const photiso = getPhotisoApi();
		const nextFile = await photiso.next();
		if (nextFile) {
			files.push({ file: nextFile });
			index = files.length - 1;
			console.log('navigator.next loaded', current()?.file);

			return current()?.file;
		}

		// didn't find any next, return current
		console.log('navigator.next sticking with current', current()?.file);
		return current()?.file;
	};

	const previous = async (): Promise<string | undefined> => {
		// look back, skipping any moved files
		if (index !== undefined) {
			let prevIndex = index;
			while (prevIndex > 0) {
				prevIndex--;
				if (!files[prevIndex].movedTo) {
					index = prevIndex;
					console.log('navigator.prev found in back stack', current()?.file);
					return current()?.file;
				}
			}
		}

		// didn't find any previous, return current
		console.log('navigator.prev sticking with current', current()?.file);
		return current()?.file;
	};

	const goTo = async (file: string): Promise<string | undefined> => {
		const goIndex = files.findIndex((entry) => entry.file === file);
		if (goIndex !== -1) {
			index = goIndex;
			console.log('navigator.goTo found', current()?.file);
			return current()?.file;
		}

		// file not found
		console.log('navigator.goTo not found');
		return undefined;
	};

	const markMoved = (fromFile: string, toFile: string) => {
		const markIndex = files.findIndex((entry) => entry.file === fromFile);
		if (markIndex !== -1) {
			// TODO: What if already moved?
			console.log('navigator.mark updating', files[markIndex].file, 'to', toFile);

			files[markIndex].movedTo = toFile;
		}
	};

	const markRestored = (origFile: string) => {
		const restoreIndex = files.findIndex((entry) => entry.file === origFile);
		if (restoreIndex !== -1) {
			// TODO: What if not moved?
			console.log('navigator.restore updating', files[restoreIndex].file, 'to', origFile);

			files[restoreIndex].movedTo = undefined;
		}
	};

	const clear = () => {
		files = [];
		index = undefined;
	};

	return {
		next,
		previous,
		goTo,
		current,
		clear,
		markMoved,
		markRestored
	};
};
