<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { createEventDispatcher, tick } from 'svelte';

	import { Button } from '@geoffcox/sterling-svelte';

	import { getDispatcher } from '../src/lib/dispatcher';
	import { appStatus, appStep, photo, userSettings } from '../src/lib/stores';

	import FromDirectoryPicker from './FromDirectoryPicker.svelte';
	import RootToDirectoryPicker from './RootToDirectoryPicker.svelte';
	import WelcomeIcon from '../src/lib/icons/PolaroidPhotosIcon.svelte';
	import SettingsIcon from '../src/lib/icons/GearIcon.svelte';
	import SettingsDialog from '$lib/SettingsDialog.svelte';

	const dispatcher = getDispatcher();

	const onStart = async () => {
		appStatus.set('loading');
		await tick();
		await dispatcher.startOrganizing();
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
	<div class="intro">
		<div class="welcome-icon">
			<span>
				<WelcomeIcon width="300px" height="auto" color="aliceblue" />
			</span>
			{#if $appStatus === 'loading'}
				<span>
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
	>
		<FromDirectoryPicker />
	</div>
	<div
		class="to-root-directory"
	>
		<RootToDirectoryPicker />
	</div>
	<div class="actions" >
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
