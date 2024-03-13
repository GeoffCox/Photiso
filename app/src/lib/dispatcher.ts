import type { Unsubscriber } from 'svelte/store';
import { recentDirectories } from './stores';
import { getContext } from 'svelte';

export const createDispatcher = () => {
	const unsubscribers: Unsubscriber[] = [];

    const dispose = () => {
        for (const unsubscriber of unsubscribers) {
          unsubscriber();
        }
      };

	let $recentDirectories: string[];
	unsubscribers.push(recentDirectories.subscribe((value) => ($recentDirectories = value)));

	const pushRecentDirectory = (dir: string) => {
		if (!$recentDirectories.includes(dir)) {
			recentDirectories.set([dir, ...$recentDirectories.slice(0, 4)]);
		}
	};

	return {
        dispose,
		pushRecentDirectory
	};
};

export type Dispatcher = ReturnType<typeof createDispatcher>;

export const getDispatcher = (): Dispatcher => {
    return getContext("dispatcher");
  };
  
