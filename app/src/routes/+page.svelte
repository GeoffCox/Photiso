<script lang="ts">
	import NoPhotoIcon from '$lib/icons/NoPhotoIcon.svelte';
	import PhotoInfoCard from '$lib/PhotoInfoCard.svelte';
	import Header from './Header.svelte';
	import SettingsDialog from '$lib/SettingsDialog.svelte';
	import DestinationDirectoryPicker from '$lib/ToRelativeDirectoryPicker.svelte';
	import {
		destinationDirectory,
		destinationFile,
		toFileName,
		toRelativeDirectory,
		noConflictDestinationFileName,
		toDirectory,
		photo,
		recentToDirectories,
		suggestedToFileNames,
		fromDirectory,
		userSettings
	} from '$lib/stores';

	import DestinationFileNamePicker from '$lib/ToFileNamePicker.svelte';
	import StartStep from '$lib/StartStep.svelte';
	import OrganizePhotoActions from '$lib/PhotoActions.svelte';
	import { getDispatcher } from '$lib/dispatcher';
	import FromDirectoryPicker from '$lib/FromDirectoryPicker.svelte';
	import ToDirectoryPicker from '$lib/ToDirectoryPicker.svelte';

	const dispatcher = getDispatcher();

	let started = false;

	$: rotation = $photo?.rotation ?? 0;
	$: rotate = rotation === 0 ? 0 : 360 - rotation;

	// $: console.log('$userSettings', $userSettings);

	$: console.log('$unorganizedDirectory', $fromDirectory);
	$: console.log('$photo', $photo);

	$: console.log('$organizedDirectory', $toDirectory);
	$: console.log('$destinationRelativeDirectory', $toRelativeDirectory);
	$: console.log('$destinationFile', $destinationFile);
	$: console.log('$destinationFileName', $toFileName);
	$: console.log('$recentDirectories', $recentToDirectories);
	$: console.log('$suggestedDestinationFileNames', $suggestedToFileNames);
	$: console.log('$destinationDirectory', $destinationDirectory);
	$: console.log('$destinationFile', $destinationFile);
	$: console.log('$noConflictDestinationFileName', $noConflictDestinationFileName);

	// ----- Other State ----- /
	let optionsDialogOpen = false;

	// ----- Methods -----/

	// ----- Handlers -----//

	const onStart = async () => {
		await dispatcher.startOrganizing();
		started = true;
	};

	const onCloseSettingsDialog = async () => {
		dispatcher.saveSettings();
	};
</script>

<div class="root">
	{#if started && $photo}
		<div class="organizing-view">
			<div class="header">
				<Header />
			</div>
			<div class="directories-pane">
				<FromDirectoryPicker readonly/>
				<ToDirectoryPicker readonly/>
			</div>
			<div class="source-pane">
				<div class="photo" style={`--rotate:${rotate}deg`}>
					{#if $photo.src}
						<img alt="current" src={$photo.src} />
					{:else}
						<NoPhotoIcon class="no-photo" />
					{/if}
				</div>
				<div class="photo-info">
					<PhotoInfoCard photo={$photo} />
				</div>
			</div>
			<div class="destination-pane">
				<DestinationDirectoryPicker />
				<div>
					<DestinationFileNamePicker />
				</div>
				<OrganizePhotoActions />
			</div>
		</div>
	{:else}
		<div class="start-view">
			<StartStep
				bind:unorganizedDirectory={$fromDirectory}
				bind:organizedDirectory={$toDirectory}
				on:start={onStart}
			/>
		</div>
	{/if}
	<SettingsDialog
		bind:open={optionsDialogOpen}
		bind:settings={$userSettings}
		on:close={onCloseSettingsDialog}
	/>
</div>

<style>
	.root {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		place-content: stretch;
		place-items: stretch;
		padding: 1em;
	}

	.start-view {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		place-content: stretch;
		place-items: stretch;
	}

	.organizing-view {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto auto 1fr;
		grid-template-areas: 'header header' 'dirs dirs' 'sourcePane destinationPane';
		column-gap: 1em;
	}

	.header {
		grid-area: header;
	}

	.directories-pane {
		grid-area: dirs;
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	.source-pane {
		grid-area: sourcePane;
		padding: 2em;
		display: grid;
		grid-template-rows: 1fr auto auto;
		row-gap: 2em;
	}

	.photo {
		overflow: scroll;
		padding: 0.5em;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		place-content: stretch;
		place-items: stretch;
	}

	.photo :global(.no-photo) {
		width: 90%;
		height: 90%;
	}

	.photo img {
		object-fit: contain;
		width: 90%;
		height: 90%;
		max-width: 100%;
		max-height: 100%;
		transform-origin: 50% 50%;
		transform: rotate(var(--rotate));
	}

	.photo-info {
		justify-self: center;
	}

	.destination-pane {
		grid-area: destinationPane;
		display: grid;
		grid-template-rows: auto;
		align-items: center;
		row-gap: 2em;
		padding: 2em;
		align-self: center;
	}
</style>
