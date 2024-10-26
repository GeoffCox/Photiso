import { onMount } from 'svelte';
import { writable } from 'svelte/store';

export const ctrlKeyDown = writable(false, (set) => {
	const onKeyDown = (event: KeyboardEvent) => {
		set(event.altKey);
	};

	const onKeyUp = (event: KeyboardEvent) => {
		set(event.altKey);
	};

	onMount(() => {
		globalThis?.window?.addEventListener('keydown', onKeyDown, { passive: true });
		globalThis?.window?.addEventListener('keyup', onKeyUp,  { passive: true });
	});

	return () => {
		globalThis?.window?.removeEventListener('keydown', onKeyDown);
		globalThis?.window?.removeEventListener('keyup', onKeyUp);
	};
});
