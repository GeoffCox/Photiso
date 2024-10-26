<script lang="ts">
	import '@geoffcox/sterling-svelte/css/sterling.css';
	import { applyLightDarkMode } from '@geoffcox/sterling-svelte';
	import { createDispatcher } from '$lib/dispatcher';
	import { onMount, setContext } from 'svelte';
	import { userSettings } from '$lib/stores';
	import { defaultUserSettings } from '../constants';

	const dispatcher = createDispatcher();
	setContext('dispatcher', dispatcher);

	// default settings
	userSettings.set(defaultUserSettings);

	dispatcher.loadSettings();
	dispatcher.loadAppState();

	onMount(() => {
		return () => {
			dispatcher.saveSettings();
			dispatcher.saveAppState();
		}
	})

	let clientHeight : number;
	let clientWidth: number;
</script>

<div class="app" use:applyLightDarkMode={{ atDocumentRoot: true, mode: 'light' }} bind:clientHeight bind:clientWidth>
	<slot />
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap');

	:global(body) {
		font-family:
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			'Open Sans',
			sans-serif;
		font-size: 16px;

		/* SPA positioning */
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		overflow: hidden;
		padding: 0;
		margin: 0;
	}

	.app {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		height: 100vh;
		margin: 0;
		overflow: hidden;
		padding: 0;
		place-content: stretch;
		place-items: stretch;
	}
</style>
