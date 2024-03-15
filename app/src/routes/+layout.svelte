<script lang="ts">
	import '@geoffcox/sterling-svelte/css/sterling.css';
	import { applyLightDarkMode } from '@geoffcox/sterling-svelte';
	import { createDispatcher } from '$lib/dispatcher';
	import { setContext } from 'svelte';
	import { userSettings } from '$lib/stores';

	const dispatcher = createDispatcher();
  	setContext("dispatcher", dispatcher);

	// default settings
	userSettings.set({
		fileAction: 'move',
		defaultDirectoryName: 'previous',
		defaultDirectoryDateFormat: 'year-month',
		defaultFileName: 'datetime',
		defaultFileNamePrefix: 'IMG_'
	});

	dispatcher.loadSettings();
	
</script>

<div class="app" use:applyLightDarkMode={{ atDocumentRoot: true, mode: 'light' }}>
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

		/* height: 100vh; */
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
		height: 100%;
		display: grid;
		place-content: stretch;
		place-items: stretch;
		overflow: hidden;
	}
</style>
