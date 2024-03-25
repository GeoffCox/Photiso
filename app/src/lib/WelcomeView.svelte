<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { crossfade, fade, fly, slide, blur } from 'svelte/transition';
	import { createEventDispatcher, onMount, tick } from 'svelte';

	import { Button } from '@geoffcox/sterling-svelte';

	import { getDispatcher } from './dispatcher';
	import { appStatus, appStep, photo, userSettings } from './stores';

	import FromDirectoryPicker from '$lib/FromDirectoryPicker.svelte';
	import RootToDirectoryPicker from '$lib/RootToDirectoryPicker.svelte';
	import WelcomeIcon from './icons/WelcomeIcon.svelte';
	import SettingsIcon from './icons/SettingsIcon.svelte';
	import SettingsDialog from '$lib/SettingsDialog.svelte';

	const eventDispatcher = createEventDispatcher();
	const dispatcher = getDispatcher();

	export let crossFadeParts: ReturnType<typeof crossfade>;

	$: send = crossFadeParts[0];
	$: receive = crossFadeParts[1];

	const fromDirectoryKey = 'fromDirectory';
	const rootToDirectoryKey = 'rootToDirectory';

	const onStart = async () => {
		appStatus.set('loading');
		await tick();
		await dispatcher.startOrganizing();
		await dispatcher.nextPhoto();
		await tick();
		appStatus.set('idle');
		appStep.set('organizing');
	};

	let settingsDialogOpen = false;

	const onCloseSettingsDialog = async () => {
		dispatcher.saveSettings();
	};
</script>

<div class="welcome-view">
	<div class="intro" out:fly={{ y: '-150%', duration: 2000, easing: quintOut }}>
		<div class="welcome-icon">
			<span>
				<WelcomeIcon width="300px" height="auto" color="aliceblue" />
			</span>
			{#if $appStatus === 'loading'}
				<span in:fade={{ duration: 2000 }}>
					<WelcomeIcon width="300px" height="auto" color="rgb(65, 170, 255)" />
				</span>
			{/if}
		</div>
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
	<div class="actions" out:fly={{ y: '150%', duration: 2000, easing: quintOut }}>
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

	.welcome-icon {
		display: grid;
		place-content: stretch;
		place-items: stretch;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
	}

	.welcome-icon :global(*) {
		grid-row: 1;
		grid-column: 1;
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
