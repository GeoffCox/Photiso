<script lang="ts">
	import { Button, Input, Label, Switch } from '@geoffcox/sterling-svelte';
	import {
		toDirectory,
		toFileName,
		photo,
		canAct,
		userSettings,
		toFile,
		defaultToDirectoryName,
		defaultToFileName,
		action,
		favoriteDirectories
	} from './stores';
	import type { ActionHistoryItem } from '../types';
	import { getDispatcher } from './dispatcher';

	import { tick } from 'svelte';
	import { getDialogApi, getPhotisoApi } from './ipc.apis';
	import FileConflict from './components/FileConflict.svelte';
	import History from './History.svelte';
	import { Split } from '@geoffcox/svelte-splitter';
	import CopyToFolderIcon from './icons/CopyToFolderIcon.svelte';
	import MoveFolderToIcon from './icons/MoveFolderToIcon.svelte';
	import FavoriteDirectory from './components/FavoriteDirectory.svelte';
	import ToDirectory from './components/ToDirectory.svelte';
	import ToFileName from './components/ToFileName.svelte';

	const dispatcher = getDispatcher();
	const photisoApi = getPhotisoApi();

	let moveEnabled = $action === 'move';

	$: {
		$action = moveEnabled ? 'move' : 'copy';
	}

	const onCopy = async () => {
		console.log('onCopy');
		await tick();
		await dispatcher.copyPhoto();
	};

	const onMove = async () => {
		await tick();
		await dispatcher.movePhoto();
	};

	//#region Favorite Directories

	const onSelectFavoriteDirectory = async (directory: string) => {
		toDirectory.set(directory);
		if ($action === 'copy') {
			await dispatcher.copyPhoto();
		} else {
			await dispatcher.movePhoto();
		}
	};

	const onRemoveFavoriteDirectory = (directory: string) => {
		favoriteDirectories.set($favoriteDirectories.filter((d) => d !== directory));
	};

	//#endregion

	let noConflictSuffix: string | undefined = undefined;
	const updateNoConflictSuffix = async () => {
		await tick();
		if ($toFile) {
			noConflictSuffix = await photisoApi.getNoConflictFileNameSufix($toFile);
		} else {
			noConflictSuffix = undefined;
		}
	};

	$: console.log(noConflictSuffix);

	$: updateNoConflictSuffix(), $toFile, $photo;


	const onDone = async () => {
		dispatcher.doneOrganizing();
	};

	const onUndo = (event: { detail: { item: ActionHistoryItem } }) => {
		dispatcher.undoAction(event.detail.item.createdEpoch);
	};

	// ----- Apply Default Naming ----- //
	const setDefaultToDirectory = () => {
		toDirectory.set($defaultToDirectoryName);
	};

	$: $photo, $defaultToDirectoryName, setDefaultToDirectory();

	const setDefaultToFileName = () => {
		toFileName.set($defaultToFileName);
	};

	$: $photo, $defaultToFileName, setDefaultToFileName();
</script>

<div class="to-view">
	<Split horizontal initialPrimarySize="70%" minSecondarySize="100px">
		<svelte:fragment slot="primary">
			<div class="top-area">
				<div class="to-directory">
					<ToDirectory />
				</div>
				<div class="filename">
					<ToFileName />
				</div>
				<div class="actions">
					<Button variant="capsule" style="min-width: 150px;" on:click={onDone}
						>Done Organizing</Button
					>
					<Button>Undo</Button>
					<div class="copy-move-action">
						<Button disabled={!$canAct || moveEnabled} on:click={onCopy}
							><CopyToFolderIcon width="32px" /> Copy</Button
						>
						<Switch bind:checked={moveEnabled} onText=" " offText=" "></Switch>
						<Button disabled={!$canAct || !moveEnabled} on:click={onMove}
							><MoveFolderToIcon />Move</Button
						>
					</div>
				</div>
				<Label text={$action === 'copy' ? 'Quick Copy' : 'Quick Move'} for="dummy">
					<div>
						{#each $favoriteDirectories as favoriteDirectory}
							<FavoriteDirectory
								{favoriteDirectory}
								on:select={(e) => onSelectFavoriteDirectory(e.detail.favoriteDirectory)}
								on:remove={(e) => onRemoveFavoriteDirectory(e.detail.favoriteDirectory)}
							/>
						{/each}
					</div>
				</Label>
			</div>
		</svelte:fragment>
		<svelte:fragment slot="secondary">
			<div class="history">
				<History on:undo={onUndo} />
			</div>
		</svelte:fragment>
	</Split>
</div>

<style>

	.top-area {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto auto auto auto 1fr 10px;
		row-gap: 1em;
		padding: 1em;
	}

	.to-directory {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		column-gap: 0.5em;
	}

	.to-directory :global(.favorite svg) {
		width: 1.2em;
		height: 1.2em;
		color: var(--stsv-status--danger__color);
	}

	.filename :global(.sterling-label .content) {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
	}

	.actions {
		display: grid;
		grid-template-columns: auto auto 1fr;
		justify-content: center;
		justify-items: center;
		column-gap: 2em;
	}

	.copy-move-action {
		display: grid;
		grid-template-columns: auto auto auto;
		justify-items: center;
	}

	.history {
		background-color: var(--stsv-common__background_color--secondary);
		padding: 1em;
	}
</style>
