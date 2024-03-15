<script lang="ts">
	import { Label, Input, Button } from '@geoffcox/sterling-svelte';
	import { getDialogApi, getPathApi } from './ipc.apis';

    import { organizedDirectory, destinationRelativeDirectory, recentDirectories} from './stores'

	const onRelativeDirectoryBrowse = async () => {
		const path = getPathApi();
		const dialog = getDialogApi();
		if (path && dialog && $organizedDirectory) {
			const currentDir = await path.join($organizedDirectory, $destinationRelativeDirectory || '');
			const selectedDir = await dialog!.browseForDirectory(currentDir);

			if (selectedDir) {
				destinationRelativeDirectory.set(await path.relative($organizedDirectory, selectedDir));
			}
		}
	};

	const onRecentDirectory = (recentDir: string) => {
		destinationRelativeDirectory.set(recentDir);
	};
</script>

<div class="destination-directory-picker">
	<div class="relative-directory">
		<Label text="Destination Directory">
			<Input bind:value={$destinationRelativeDirectory} />
		</Label>
		<Button on:click={onRelativeDirectoryBrowse}>...</Button>
	</div>
	{#if $recentDirectories && $recentDirectories.length > 0}
		<div class="recent-directories">
			<Label text="Recent" for="dummy_id">
				{#each $recentDirectories as recentDir}
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
