<script lang="ts">
	import { Button } from '@geoffcox/sterling-svelte';
	import FavoriteFilledIcon from './icons/FavoriteFilledIcon.svelte';
	import FavoriteIcon from './icons/FavoriteIcon.svelte';
	import { getDispatcher } from './dispatcher';
	import type { RecentDirectory } from '../types';

	export let recentDirectory: RecentDirectory;

	const dispatcher = getDispatcher();

	const toggleFavorite = () => {
		dispatcher.favoriteRecentDirectory(recentDirectory, !recentDirectory.favorite);
	};
</script>

<div class="recent-directory">
	<Button variant="tool square" on:click>{recentDirectory.dir}</Button>
	<div class="favorite-action">
		<Button on:click={toggleFavorite} variant="tool square">
			{#if recentDirectory.favorite}
				<span class="favorite-filled">
					<FavoriteFilledIcon />
				</span>
			{:else}
				<span class="favorite">
					<FavoriteIcon />
				</span>
			{/if}
		</Button>
	</div>
</div>

<style>
	.recent-directory {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: stretch;
		padding: 0.125em;
		border-radius: 10000px;
		column-gap: 0.125em;
	}

	.favorite-action {
		font-size: 0.8em;
	}

	.favorite {
		color: transparent;
		align-self: center;
	}

	.favorite :global(svg),
	.favorite-filled :global(svg) {
		width: 18px;
		height:18px;
	}

	.recent-directory:hover .favorite {
		color:  rgb(184, 34, 20);
	}

	.favorite-filled {
		align-self: center;
		color:  rgb(184, 34, 20);
	}
</style>
