<script lang="ts">
	import { Label, Input, Button } from '@geoffcox/sterling-svelte';
	import { getDialogApi, getPathApi } from './ipc.apis';

	import { rootToDirectory, relativeToDirectory, recentRelativeDirectories } from './stores';
	import RecentDirectoryPill from './RecentDirectoryPill.svelte';
	import type { RecentDirectory } from '../types';

	const onBrowse = async () => {
		const path = getPathApi();
		const dialog = getDialogApi();
		if (path && dialog && $rootToDirectory) {
			const currentDir = await path.join($rootToDirectory, $relativeToDirectory || '');
			const selectedDir = await dialog!.browseForDirectory(currentDir);

			if (selectedDir) {
				relativeToDirectory.set(await path.relative($rootToDirectory, selectedDir));
			}
		}
	};

	const onRecentDirectory = (recentDir: RecentDirectory) => {
		relativeToDirectory.set(recentDir.dir);
	};

	$: sortedRecentDirectories = $recentRelativeDirectories.toSorted((a, b) => {
		if (a.favorite === b.favorite) {
			return b.firstUsedEpoch - a.firstUsedEpoch;
		} else if (a.favorite) {
			return -1;
		} else if (b.favorite) {
			return 1;
		}

		return 0;
	});
</script>

<div class="to-directory-picker">
	<div class="relative-directory">
		<Label text="In Directory">
			<Input bind:value={$relativeToDirectory} />
		</Label>
		<Button on:click={onBrowse}>...</Button>
	</div>
	{#if $recentRelativeDirectories && $recentRelativeDirectories.length > 0}
		<div class="recent-directories">
			<Label text="Recent" for="dummy_id">
				{#each sortedRecentDirectories as recentDir}
					<RecentDirectoryPill
						recentDirectory={recentDir}
						on:click={() => onRecentDirectory(recentDir)}
					/>
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
