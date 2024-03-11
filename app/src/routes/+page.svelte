<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { DialogApi, PathApi, PhotisoApi, PhotoInfo } from '$lib/ipc.types';
	import NoPhotoIcon from '$lib/icons/NoPhotoIcon.svelte';
	import PhotoInfoCard from '$lib/PhotoInfoCard.svelte';
	import { Button, Input, Label } from '@geoffcox/sterling-svelte';
	import type { PhotisoWindow, UserSettings } from '../types';
	import { DateTime } from 'luxon';
	import SettingsIcon from '$lib/icons/SettingsIcon.svelte';
	import SettingsDialog from '$lib/SettingsDialog.svelte';

	// ----- Photiso API -----//
	let photisoApi: PhotisoApi | undefined = undefined;
	let path: PathApi | undefined = undefined;
	let dialogApi: DialogApi | undefined = undefined;

	onMount(() => {
		photisoApi = (<PhotisoWindow>window).photisoApi;
		path = (<PhotisoWindow>window).pathApi;
		dialogApi = (<PhotisoWindow>window).dialogApi;
	});

	// ----- Source State -----//
	let sourceDir: string = '/Users/geoff/github/Photiso/photos/unorganized';
	let file: string | undefined = undefined;
	let info: PhotoInfo | undefined = undefined;
	let src: string | undefined = undefined;

	$: dateTaken = info?.dateTaken ? DateTime.fromISO(info.dateTaken) : undefined;
	$: rotation = info?.rotation ?? 0;
	$: rotate = rotation === 0 ? 0 : 360 - rotation;
	$: sourcePath = file ? path?.parse(file) : undefined;
	$: sourceFileName = sourcePath ? sourcePath.name : undefined;
	$: sourceExtension = sourcePath ? sourcePath.ext : undefined;
	// ----- Destination State -----/
	let destinationDir: string = '/Users/geoff/github/Photiso/photos/organized';
	let destinationSubDir: string = '';
	let destinationFileName: string | undefined = '';

	let recentDestinationDirs: string[] = [];

	$: suggestedDestinationFileName = dateTaken
		? `IMG_${dateTaken.toFormat('yyyy-MM-dd_HH-mm-ss-u')}`
		: sourceFileName;

	//TODO: Update move to separate dir and file?  Export an API for path methods?
	$: destinationFile = (destinationDir && destinationFileName && sourceExtension) ? path?.join(
		destinationDir,
		destinationSubDir,
		`${destinationFileName}${sourceExtension ?? ''}`) : undefined;

	let noCollisionDestFileName: string | undefined = undefined;

	const updateNoCollisionDestFile = async (destFile?: string) => {
		const suffix = destFile ? await photisoApi?.getNoOverwriteSuffix(destFile) : undefined;
		noCollisionDestFileName = (destFile && suffix) ? `${destinationFileName}${suffix}` : undefined;
	};

	$: updateNoCollisionDestFile(destinationFile);

	// ----- Other State ----- /
	let optionsDialogOpen = false;

	let settings : UserSettings = {
		fileAction: 'move',
		defaultDirectoryName: 'previous',
		defaultDirectoryDateFormat: 'year-month',
		defaultFileName: 'datetime',
		defaultFileNamePrefix: 'IMG_'
	};

	$: console.log({...settings});

	// ----- Methods -----/

	const nextPhoto = async () => {
		file = await photisoApi!.next();

		if (file) {
			photisoApi!.getInfo().then(
				async (value) => {
					info = value;
					await tick();
					destinationFileName = suggestedDestinationFileName;
				},
				async (reason) => {
					info = undefined;
					await tick();
					destinationFileName = suggestedDestinationFileName;
				}
			);

			photisoApi!.getSrc().then(
				(value) => {
					src = value;
				},
				(reason) => {
					src = undefined;
				}
			);
		} else {
			info = undefined;
			src = undefined;
		}
	};

	// ----- Handlers -----//

	const onStart = async () => {
		await tick();
		await photisoApi!.start(sourceDir);
		await nextPhoto();
	};

	const onMove = async () => {
		await tick();
		if (destinationFile) {
			await photisoApi!.move(destinationFile);
			await nextPhoto();

			if (destinationSubDir && !recentDestinationDirs.includes(destinationSubDir)) {
				recentDestinationDirs.unshift(destinationSubDir);
				recentDestinationDirs = recentDestinationDirs.slice(0, 5);
			}
		}
	};

	const onSkip = async () => {
		await nextPhoto();
	};

	const onSourceBrowse = async () => {
		const selectedDir = await dialogApi!.browseForDirectory(sourceDir);
		if (selectedDir) {
			sourceDir = selectedDir;
		}
	};

	const onDestinationBrowse = async () => {
		const selectedDir = await dialogApi!.browseForDirectory(destinationDir);
		if (selectedDir) {
			destinationDir = selectedDir;
		}
	};

	const onDestinationSubDirBrowse = async () => {
		if (path) {
			const selectedDir = await dialogApi!.browseForDirectory(
				path.join(destinationDir, destinationSubDir)
			);
			if (selectedDir) {
				destinationSubDir = path.relative(destinationDir, selectedDir);
			}
		}
	};

	const onRecentDestinationDir = (recentDestinationDir: string) => {
		destinationSubDir = recentDestinationDir;
	};

	const onFileNameSuggestion = (suggestedFileName: string) => {
		destinationFileName = suggestedFileName;
	};
</script>

<div class="root">
	<div class="header">
		<Button on:click={() => optionsDialogOpen = true}><SettingsIcon width="1em" height="1em" /></Button>
	</div>
	<div class="source-pane">
		<div class="source-directory">
			<Label text="Source Directory">
				<Input bind:value={sourceDir} />
			</Label>
			<Button on:click={onSourceBrowse}>...</Button>
			<Button on:click={onStart}>Start</Button>
		</div>
		<div class="photo" style={`--rotate:${rotate}deg`}>
			{#if src}
				<img alt="current" {src} />
			{:else}
				<NoPhotoIcon class="no-photo" />
			{/if}
		</div>
		<div class="photo-info">
			{#if info}
				<PhotoInfoCard photoInfo={info} {sourceDir} />
			{/if}
		</div>
	</div>
	<div class="destination-pane">
		<div class="destination-directory">
			<Label text="Organized Photos Directory">
				<Input bind:value={destinationDir} />
			</Label>
			<Button on:click={onDestinationBrowse}>...</Button>
		</div>
		<div class="destination-subdirectory">
			<Label text="Destination Directory">
				<Input bind:value={destinationSubDir} />
			</Label>
			<Button on:click={onDestinationSubDirBrowse}>...</Button>
		</div>
		<div class="suggested-directories">
			{#if recentDestinationDirs && recentDestinationDirs.length > 0}
			<Label text="Suggestions" for="dummy_id">
				{#each recentDestinationDirs as recentDir}
					<Button on:click={() => onRecentDestinationDir(recentDir)} variant="tool square"
						>{recentDir}</Button
					>
				{/each}
			</Label>
			{/if}
		</div>
		<div class="destination-file">
			<Label
				text="File Name"
				status={noCollisionDestFileName ? 'warning' : undefined}
				message={noCollisionDestFileName ? 'This file already exists' : undefined}
			>
				<Input bind:value={destinationFileName} />
			</Label>
			<div class="destination-extension">{sourceExtension ?? ''}</div>
		</div>
		<div class="suggested-files">
			<Label text="Suggestions" for="dummy_id">
				{#if sourceFileName}
					<Button on:click={() => sourceFileName && onFileNameSuggestion(sourceFileName)} variant="tool square">{sourceFileName}</Button>
				{/if}
				{#if suggestedDestinationFileName}
					<Button on:click={() => suggestedDestinationFileName && onFileNameSuggestion(suggestedDestinationFileName)} variant="tool square">{suggestedDestinationFileName}</Button>
				{/if}
				{#if noCollisionDestFileName}
					<Button on:click={() => noCollisionDestFileName && onFileNameSuggestion(noCollisionDestFileName)} variant="tool square">{noCollisionDestFileName}</Button>
				{/if}
			</Label>
		</div>
		<div class="actions">
			<Button on:click={onMove} title={destinationFile}>Move</Button>
			<Button on:click={onSkip} variant="secondary">Skip</Button>
		</div>
		<div>{destinationFile}</div>
		<div>{noCollisionDestFileName}</div>
	</div>
	<SettingsDialog bind:open={optionsDialogOpen} bind:settings={settings} />
</div>

<style>
	.root {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto 1fr;
		grid-template-areas: "header header" "sourcePane destinationPane";
		column-gap: 1em;
		height: 100%;
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
		grid-template-rows: auto 1fr auto;
		row-gap: 2em;
	}

	.source-directory {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: flex-end;
		column-gap: 0.5em;
	}

	.photo {
		overflow: hidden;
		padding: 0.5em;
	}

	.photo :global(.no-photo) {
		width: 100%;
		height: 100%;
	}

	.photo img {
		object-fit: contain;
		width: 100%;
		height: 100%;
		transform-origin: 50% 50%;
		transform: rotate(var(--rotate));
	}

	/* img.orientation-6 {
		transform-origin: 50% 50%;
		transform: rotate(90deg);
	}

	img.orientation-5 {
		transform-origin: 50% 50%;
		transform: rotate(-90deg) scaleX(-1);
	} */

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

	.destination-directory,
	.destination-subdirectory {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: flex-end;
		column-gap: 0.5em;
	}

	.suggested-directories {
		font-size: 0.8em;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-self: flex-start;
		margin-left: 2em;
	}

	.suggested-directories :global(button) {
		justify-content: flex-start;
	}

	.destination-file {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: flex-end;
		column-gap: 0.25em;
	}

	.destination-extension {
		padding-bottom: 0.625em;
	}

	.suggested-files {
		font-size: 0.8em;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-self: flex-start;
		margin-left: 2em;
	}

	.suggested-files :global(button) {
		justify-content: flex-start;
	}

	.actions {
		display: grid;
		grid-template-columns: auto auto;
		justify-content: flex-start;
		justify-items: flex-start;
		column-gap: 0.5em;
		font-size: 1.5em;
	}
</style>
