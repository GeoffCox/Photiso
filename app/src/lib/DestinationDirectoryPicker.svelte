<script lang="ts">
	import type { PhotisoWindow } from '../types';
	import type { DialogApi, PathApi } from './ipc.types';

	import { onMount } from 'svelte';
	import { Label, Input, Button } from '@geoffcox/sterling-svelte';

	export let rootDirectory: string | undefined = undefined;
	export let relativeDirectory: string | undefined = undefined;
	export let recentDirectories: string[] = [];

	let dialogApi: DialogApi | undefined = undefined;
	let path: PathApi | undefined = undefined;

	onMount(async () => {
		dialogApi = (<PhotisoWindow>window).dialogApi;
		path = (<PhotisoWindow>window).pathApi;
	});

	const onRootDirectoryBrowse = async () => {
		if (path && rootDirectory) {
			const selectedDir = await dialogApi!.browseForDirectory(rootDirectory);
			if (selectedDir) {
				rootDirectory = selectedDir;
			}
		}
	};

	const onRelativeDirectoryBrowse = async () => {
		if (path && rootDirectory) {
			const selectedDir = await dialogApi!.browseForDirectory(
				path.join(rootDirectory, relativeDirectory || '')
			);

			if (selectedDir) {
				relativeDirectory = path.relative(rootDirectory, selectedDir);
			}
		}
	};

	const onRecentDirectory = (recentDir: string) => {
		relativeDirectory = recentDir;
	};
</script>

<div class="destination-directory-picker">
	<div class="root-directory">
		<Label text="Organized Photos Directory">
			<Input bind:value={rootDirectory} />
		</Label>
		<Button on:click={onRootDirectoryBrowse}>...</Button>
	</div>
	<div class="relative-directory">
		<Label text="Destination Directory">
			<Input bind:value={relativeDirectory} />
		</Label>
		<Button on:click={onRelativeDirectoryBrowse}>...</Button>
	</div>
	{#if recentDirectories && recentDirectories.length > 0}
		<div class="recent-directories">
			<Label text="Recent" for="dummy_id">
				{#each recentDirectories as recentDir}
					<Button on:click={() => onRecentDirectory(recentDir)} variant="tool square"
						>{recentDir}</Button
					>
				{/each}
			</Label>
		</div>
	{/if}
</div>

<style>
	.destination-directory-picker {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto;
		row-gap: 2em;
	}

	.root-directory,
	.relative-directory {
		align-items: flex-end;
		column-gap: 0.5em;
		display: grid;
		grid-template-columns: 1fr auto;
	}

	.recent-directories {
		display: grid;
		font-size: 0.8em;
		grid-template-columns: 1fr;
		grid-template-rows: auto;
		justify-items: flex-start;
		margin-left: 2em;
	}

	.recent-directories :global(button) {
		justify-content: flex-start;
	}
</style>
