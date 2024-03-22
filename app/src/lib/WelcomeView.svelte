<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { crossfade, fade, fly } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';

	import { Button } from '@geoffcox/sterling-svelte';

	import { getDispatcher } from './dispatcher';
	import { userSettings } from './stores';
	
	import FromDirectoryPicker from '$lib/FromDirectoryPicker.svelte';
	import RootToDirectoryPicker from '$lib/RootToDirectoryPicker.svelte';
	import WelcomeIcon from './icons/WelcomeIcon.svelte';
	import SettingsIcon from './icons/SettingsIcon.svelte';
	import SettingsDialog from '$lib/SettingsDialog.svelte';

	const eventDispatcher = createEventDispatcher();

	export let crossFadeParts: ReturnType<typeof crossfade>;

	$: send = crossFadeParts[0];
	$: receive = crossFadeParts[1];

	const fromDirectoryKey = 'fromDirectory';
	const rootToDirectoryKey = 'rootToDirectory';

	const onStart = () => {
		eventDispatcher('start');
	};

	const dispatcher = getDispatcher();
	let settingsDialogOpen = false;

	const onCloseSettingsDialog = async () => {
		dispatcher.saveSettings();
	};
</script>

<div class="welcome-view" out:fly={{ y: '-150%', duration: 2000, easing: quintOut }}>
	<div class="intro">
		<WelcomeIcon width="300px" height="auto" color="aliceblue" />
		<p>Photiso helps you organize your photos.</p>
		<p>
			For each photo in the <b>From folder</b>, you choose where to put it in the
			<b>To folder</b> and what to name the photo.
		</p>
		<p>
			In settings, you can choose the default folder and file name for each photo including when the
			photo was taken.
		</p>
	</div>
	<div
		class="from-directory"
		in:send={{ key: fromDirectoryKey }}
		out:receive={{ key: fromDirectoryKey }}
	>
		<FromDirectoryPicker />
	</div>
	<div
		class="to-root-directory"
		in:send={{ key: rootToDirectoryKey }}
		out:receive={{ key: rootToDirectoryKey }}
	>
		<RootToDirectoryPicker />
	</div>
	<div out:fade={{ duration: 500 }} class="actions">
		<Button on:click={onStart} variant="colorful">Start Organizing!</Button>
		<Button on:click={() => (settingsDialogOpen = true)}
			><SettingsIcon width="1em" height="1em" /></Button
		>
	</div>
	<SettingsDialog
		bind:open={settingsDialogOpen}
		bind:settings={$userSettings}
		on:close={onCloseSettingsDialog}
	/>
</div>

<style>
	.welcome-view {
		display: grid;
		column-gap: 3em;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto auto auto;
		align-content: center;
		align-items: center;
		grid-template-areas: 'intro intro' 'fromDir rootToDir' 'actions actions';
		row-gap: 2em;
	}

	.intro {
		grid-area: intro;
		justify-self: center;
		max-width: 500px;
		display: grid;
		justify-items: center;
		align-content: flex-start;
		align-items: flex-start;
	}

	.from-directory {
		grid-area: fromDir;
		align-self: center;
		margin-left: 4em;
	}

	.to-root-directory {
		grid-area: rootToDir;
		align-self: center;
		margin-right: 4em;
	}

	.actions {
		display: grid;
		column-gap: 0.5em;
		grid-area: actions;
		grid-template-columns: auto auto;
		justify-self: center;
		align-items: center;
		align-content: center;
		
	}

	.actions :global(button:first-child) {
		font-size: 1.5em;
	}
</style>
