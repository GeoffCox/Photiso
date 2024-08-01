import { getPhotisoApi } from './ipc.apis';

type FileEntry = {
	file: string;
	movedTo?: string;
};

export const createFileNavigator = () => {
	let backStack: FileEntry[] = [];
	let currentFile: FileEntry | undefined = undefined;
	let forwardStack: FileEntry[] = [];

	const current = () => currentFile;

	const next = async (): Promise<string | undefined> => {
		currentFile && backStack.push(currentFile);

		// look in the forward stack, skipping any moved files
		while (forwardStack.length > 0) {
			const candidate = forwardStack.pop();
			if (candidate?.movedTo) {
				backStack.push(candidate);
			} else {
				currentFile = candidate;
				return currentFile!.file;
			}
		}

		// get the next file from disk
		const photiso = getPhotisoApi();
		const nextFile = await photiso.next();
		if (nextFile) {
			currentFile = { file: nextFile };
			return currentFile.file;
		}

		// undo moving current to back since we didn't find a next file
        backStack.pop();
		return currentFile?.file;
	};

	const previous = async (): Promise<string | undefined> => {

        currentFile && forwardStack.push(currentFile);
		
        // look in the back stack, skipping any moved file
		while (backStack.length > 0) {
			const candidate = backStack.pop();
			if (candidate?.movedTo) {
				forwardStack.push(candidate);
			} else {
				currentFile = candidate;
				return currentFile!.file;
			}
		}

        // undo moving current to forward since we didn't find a previous file
        forwardStack.pop();
		return currentFile?.file;
	};

	const goTo = async (fromFile: string): Promise<string | undefined> => {
		if (currentFile && currentFile.file === fromFile) {
			return;
		} else {
			const backIndex = backStack.findIndex((entry) => entry.file === fromFile);
			if (backIndex !== -1) {
				currentFile && forwardStack.push(currentFile);
				const toForward = backStack.splice(backIndex + 1).reverse();
				forwardStack.push(...toForward);
				currentFile = backStack.pop();
			} else {
				const forwardIndex = forwardStack.findIndex((entry) => entry.file === fromFile);
				if (forwardIndex !== -1) {
					currentFile && backStack.push(currentFile);
					const toBack = forwardStack.splice(forwardIndex + 1).reverse();
					backStack.push(...toBack);
					currentFile = forwardStack.pop();
				}
			}
		}

		return currentFile?.file;
	};

	const markMoved = (fromFile: string, toFile: string) => {
		if (currentFile && currentFile.file === fromFile) {
			currentFile.movedTo = toFile;
		} else {
			const backIndex = backStack.findIndex((entry) => entry.file === fromFile);
			if (backIndex !== -1) {
				// TODO: What if already moved?
				backStack[backIndex].movedTo = toFile;
			} else {
				const forwardIndex = forwardStack.findIndex((entry) => entry.file === fromFile);
				if (forwardIndex !== -1) {
					// TODO: What if already moved?
					forwardStack[forwardIndex].movedTo = toFile;
				}
			}
		}
	};

	const markRestored = (origFile: string) => {
		if (currentFile && currentFile.file === origFile) {
			currentFile.movedTo = undefined;
		} else {
			const backIndex = backStack.findIndex((entry) => entry.file === origFile);
			if (backIndex !== -1) {
				// TODO: What if already moved?
				backStack[backIndex].movedTo = undefined;
			} else {
				const forwardIndex = forwardStack.findIndex((entry) => entry.file === origFile);
				if (forwardIndex !== -1) {
					// TODO: What if already moved?
					forwardStack[forwardIndex].movedTo = undefined;
				}
			}
		}
	};

	const clear = () => {
		backStack = [];
		forwardStack = [];
		currentFile = undefined;
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
