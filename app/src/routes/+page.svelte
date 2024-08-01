<script lang="ts">
	import PhotoDisplay from '$lib/components/Photo.svelte';
	import PhotoActions from '$lib/PhotoActions.svelte';
	import PhotoInfoCard from '$lib/components/PhotoInfo.svelte';
	import PhotoNavigation from '$lib/PhotoNavigation.svelte';
	import ToFilePicker from '$lib/ToFilePicker.svelte';
	import NewHistoryList from '$lib/History.svelte';
	import { appStatus, noConflictToFileName, photo, toFileName, userSettings } from '$lib/stores';
	import { fromDirectory, rootToDirectory } from '$lib/stores';

	import { Button } from '@geoffcox/sterling-svelte';
	import { getDispatcher } from '$lib/dispatcher';
	import DirectoryInput from '$lib/components/DirectoryInput.svelte';
	import FileConflict from '$lib/components/FileConflict.svelte';
	import GearIcon from '$lib/icons/GearIcon.svelte';
	import SettingsDialog from '$lib/SettingsDialog.svelte';
	import type { ActionHistoryItem } from '../types';

	$: photoConflictFileName = $photo && $noConflictToFileName ? $toFileName : undefined;

	const dispatcher = getDispatcher();

	let settingsDialogOpen = false;

	const onSettings = () => {
		settingsDialogOpen = true;
	};

	const onStart = async () => {
		dispatcher.startOrganizing();
	};

	const onDone = async () => {
		dispatcher.doneOrganizing();
	};

	const onResolveFileConflict = (event: { detail: { noConflictFileName: string } }) => {
		toFileName.set(event.detail.noConflictFileName);
	};

	const onUndo = (event: { detail: { item: ActionHistoryItem } }) => {
		dispatcher.undoAction(event.detail.item.createdEpoch);
	};
</script>

<div class="root">
	<div class="header">
		<div class="app-name">Photiso</div>
		<div class="settings">
			<Button on:click={onSettings} variant="tool"><GearIcon width="0.75em" height="0.75em" /></Button>
		</div>
	</div>
	<div class="from-directory">
		<DirectoryInput label="From" bind:directory={$fromDirectory} />
	</div>
	<div class="to-directory">
		<DirectoryInput label="To" bind:directory={$rootToDirectory} />
	</div>
	<div class="organize-action">
		{#if $appStatus === 'waiting'}
			<Button variant="capsule" on:click={onStart}>Start Organizing</Button>
		{:else}
			<Button variant="capsule" on:click={onDone}>Done Organizing</Button>
		{/if}
	</div>
	<div class="photo">
		<PhotoDisplay photo={$photo} />
	</div>
	<div class="separator" />
	<div class="to-file">
		<ToFilePicker />
		<FileConflict
			conflictFileName={$appStatus !== 'busy' ? photoConflictFileName : undefined}
			noConflictFileName={$noConflictToFileName}
			extension={$photo?.path.ext || ''}
			on:resolve={onResolveFileConflict}
		/>
	</div>
	<div class="photo-navigation">
		<PhotoNavigation />
	</div>
	<!-- <div class="photo-info">
		<PhotoInfoCard photo={$photo} />
	</div> -->
	<div class="photo-actions">
		<PhotoActions />
	</div>
	<div class="history">
		<NewHistoryList on:undo={onUndo} />
	</div>
</div>
<SettingsDialog open={settingsDialogOpen} settings={$userSettings} on:close={() => settingsDialogOpen = false} />

<style>
	.root {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		grid-template-rows: auto auto auto 1fr auto auto;
		grid-template-areas: 'header header header' 'fromDirectory . toDirectory' 'organizeAction organizeAction organizeAction' 'photo separator toFile' 'photoNavigation separator photoActions' 'history history history';
		place-content: stretch;
		place-items: stretch;
		overflow: hidden;
	}

	.header {
		grid-area: header;
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		font-size: 2em;
		padding: 0.25em 0.5em 0.25em 1em;
		background-color: var(--stsv-common__background_color--secondary);
		border-bottom: 1px solid var(--stsv-common__color--secondary);
	}

	.from-directory {
		grid-area: fromDirectory;
		padding: 0.5em 1em;
	}

	.to-directory {
		grid-area: toDirectory;
		padding: 0.5em 1em;
	}

	.organize-action {
		grid-area: organizeAction;
		justify-self: center;
		padding: 1em 0;
	}

	.separator {
		grid-area: separator;
		width: 1px;
		align-self: stretch;
		background: var(--stsv-common__color--secondary);
		margin: 0 1em;
	}

	.photo {
		grid-area: photo;
		overflow: hidden;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		place-content: center;
		place-items: center;
		padding: 1em;
	}

	.photo-navigation {
		grid-area: photoNavigation;
		padding: 0.5em 0;
	}

	.to-file {
		grid-area: toFile;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto;
		row-gap: 0.5em;
		padding: 0.5em 2em;
		justify-items: stretch;
		align-items: center;
	}

	.photo-actions {
		grid-area: photoActions;
	}

	.history {
		grid-area: history;
		justify-self: stretch;
		background-color: var(--stsv-common__background_color--secondary);
		border-top: 1px solid var(--stsv-common__color--secondary);
		padding: 1em;
	}
</style>
