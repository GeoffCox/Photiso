<script lang="ts">
	import NoPhotoIcon from '$lib/icons/NoPhotoIcon.svelte';
	import PhotoInfoCard from '$lib/PhotoInfoCard.svelte';
	import { Button } from '@geoffcox/sterling-svelte';
	import SettingsIcon from '$lib/icons/SettingsIcon.svelte';
	import SettingsDialog from '$lib/SettingsDialog.svelte';
	import DestinationDirectoryPicker from '$lib/DestinationDirectoryPicker.svelte';
	import {
	dateDestinationRelativeDirectory,
	dateTimeDestinationFileName,
	defaultDestinationFileName,
		defaultDestinationRelativeDirectory,
		destinationDirectory,
		destinationFile,
		destinationFileName,
		destinationRelativeDirectory,
		mostRecentDestinationRelativeDirectory,
		noConflictDestinationFileName,
		organizedDirectory,
		photoDateTaken,
		photoFile,
		photoInfo,
		photoPath,
		photoSrc,
		photoSrcCache,
		recentDirectories,
		suggestedDestinationFileNames,
		unorganizedDirectory,
		userSettings
	} from '$lib/stores';

	import DestinationFileNamePicker from '$lib/DestinationFileNamePicker.svelte';
	import StartStep from '$lib/StartStep.svelte';
	import OrganizePhotoActions from '$lib/PhotoActions.svelte';
	import { getDispatcher } from '$lib/dispatcher';
	import { getDialogApi } from '$lib/ipc.apis';

	const dispatcher = getDispatcher();

	let started = false;

	$: rotation = $photoInfo?.rotation ?? 0;
	$: rotate = rotation === 0 ? 0 : 360 - rotation;

	// $: console.log('$userSettings', $userSettings);

	// $: console.log('$unorganizedDirectory', $unorganizedDirectory);
	$: console.log('$photoFile', $photoFile);
	// $: console.log('$photoInfo', $photoInfo);
	$: console.log('$photoSrc.length', $photoSrc?.length);
	$: console.log('$photoSrcCache keys', Object.keys($photoSrcCache));
	// $: console.log('$photoDateTaken', $photoDateTaken);
	// $: console.log('$photoPath', $photoPath);

	// $: console.log('$organizedDirectory', $organizedDirectory);
	// $: console.log('$destinationRelativeDirectory', $destinationRelativeDirectory);
	// $: console.log('$destinationFile', $destinationFile);
	// $: console.log('$destinationFileName', $destinationFileName);
	// $: console.log('$mostRecentDestinationRelativeDirectory', $mostRecentDestinationRelativeDirectory);
	// $: console.log('$recentDirectories', $recentDirectories);
	// $: console.log('$dateDestinationRelativeDirectory', $dateDestinationRelativeDirectory);
	// $: console.log('$defaultDestinationRelativeDirectory', $defaultDestinationRelativeDirectory);
	// $: console.log('$dateTimeDestinationFileName', $dateTimeDestinationFileName);
	// $: console.log('$defaultDestinationFileName', $defaultDestinationFileName);
	// $: console.log('$suggestedDestinationFileNames', $suggestedDestinationFileNames);
	// $: console.log('$destinationDirectory', $destinationDirectory);
	// $: console.log('$destinationFile', $destinationFile);
	// $: console.log('$noConflictDestinationFileName', $noConflictDestinationFileName);

	// ----- Destination State -----/

	const setDestinationRelativeDirectoryToDefault = (defaultValue?: string) => {
		destinationRelativeDirectory.set(defaultValue);
	};

	$: $photoFile, setDestinationRelativeDirectoryToDefault($defaultDestinationRelativeDirectory);
	
	const setDestinationFileNameToDefault = (defaultValue?: string) => {
		destinationFileName.set(defaultValue)
	}
	
	$: $photoFile, setDestinationFileNameToDefault($defaultDestinationFileName);
	
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
	{#if started && $photoSrc}
		<div class="organizing-view">
			<div class="header">
				<Button on:click={() => (optionsDialogOpen = true)}
					><SettingsIcon width="1em" height="1em" /></Button
				>
			</div>
			<div class="source-pane">
				<div class="photo" style={`--rotate:${rotate}deg`}>
					{#if $photoSrc}
						<img alt="current" src={$photoSrc} />
					{:else}
						<NoPhotoIcon class="no-photo" />
					{/if}
				</div>
				<div class="photo-info">
					{#if $photoInfo}
						<PhotoInfoCard photoInfo={$photoInfo} photoPath={$photoPath} />
					{/if}
				</div>
			</div>
			<div class="destination-pane">
				<DestinationDirectoryPicker/>
				<div>
					<DestinationFileNamePicker/>
				</div>
				<OrganizePhotoActions/>
			</div>
		</div>
	{:else}
		<div class="start-view">
			<StartStep
				bind:unorganizedDirectory={$unorganizedDirectory}
				bind:organizedDirectory={$organizedDirectory}
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
		grid-template-rows: auto 1fr;
		grid-template-areas: 'header header' 'sourcePane destinationPane';
		column-gap: 1em;
	}

	.header {
		grid-area: header;
		display: grid;
		justify-self: flex-end;
		padding: 0.5em;
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
