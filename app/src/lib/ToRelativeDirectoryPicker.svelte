<script lang="ts">
	import { Label, Input, Button } from '@geoffcox/sterling-svelte';
	import { getDialogApi, getPathApi } from './ipc.apis';

	import { toRootDirectory, toRelativeDirectory, recentRelativeDirectories } from './stores';
	import RecentDirectoryPill from './RecentDirectoryPill.svelte';
	import type { RecentDirectory } from '../types';

	const onBrowse = async () => {
		const path = getPathApi();
		const dialog = getDialogApi();
		if (path && dialog && $toRootDirectory) {
			const currentDir = await path.join($toRootDirectory, $toRelativeDirectory || '');
			const selectedDir = await dialog!.browseForDirectory(currentDir);

			if (selectedDir) {
				toRelativeDirectory.set(await path.relative($toRootDirectory, selectedDir));
			}
		}
	};

	const onRecentDirectory = (recentDir: RecentDirectory) => {
		toRelativeDirectory.set(recentDir.dir);
	};
</script>

<div class="to-directory-picker">
	<div class="relative-directory">
		<Label text="In Directory">
			<Input bind:value={$toRelativeDirectory} />
		</Label>
		<Button on:click={onBrowse}>...</Button>
	</div>
	{#if $recentRelativeDirectories && $recentRelativeDirectories.length > 0}
		<div class="recent-directories">
			<Label text="Recent" for="dummy_id">
				{#each $recentRelativeDirectories as recentDir}
					<RecentDirectoryPill recentDirectory={recentDir} on:click={() => onRecentDirectory(recentDir)} />
				{/each}
			</Label>
		</div>
	{/if}
</div>

<style>
	.to-directory-picker {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto;
		row-gap: 2em;
	}

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
