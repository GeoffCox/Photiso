<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { RecentDirectory } from '../../types';
	import RecentDirectoryPill from './RecentDirectoryPill.svelte';

	export let recentDirectories : RecentDirectory[] = [];

	const dispatch = createEventDispatcher();

	const raiseSelect = (value: string) => {
		dispatch('select', {directory: value});
	};

	const onSelect = (recentDir: RecentDirectory) => {
		raiseSelect(recentDir.dir);
	};

</script>

<div class="recent-directory-list">
	<div class="recent-directories">
		{#each recentDirectories as recentDir}
			<RecentDirectoryPill
				recentDirectory={recentDir}
				on:click={() => onSelect(recentDir)}
				on:toggleFavorite
				on:remove
			/>
		{/each}
	</div>
</div>

<style>
	.recent-directories {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto;
		row-gap: 2em;
	}

	.recent-directories {
		display: flex;
		font-size: 0.8em;
		flex-wrap: wrap;
		justify-items: flex-start;
		row-gap: 2px;
		column-gap: 2px;
	}

	.recent-directories :global(button) {
		justify-content: flex-start;
	}
</style>
