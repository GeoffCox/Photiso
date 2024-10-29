<script lang="ts">
	import type { RecentDirectory } from '../src/types';
	import RecentDirectoryPill from '../src/lib/components/RecentDirectoryPill.svelte';

	export let recentDirectories : RecentDirectory[] = [];

</script>

<div class="recent-directory-list">
	<div class="recent-directories">
		{#each recentDirectories as recentDir}
			<RecentDirectoryPill
				recentDirectory={recentDir}
				on:favorite
				on:select
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
		row-gap: 0.25em;
		font-size: 0.8em;
		justify-items: flex-start;
	}

	.recent-directories :global(button) {
		justify-content: flex-start;
	}
</style>
