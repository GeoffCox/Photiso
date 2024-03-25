<script lang="ts">
	import { Button } from '@geoffcox/sterling-svelte';
	import FavoriteFilledIcon from './icons/FavoriteFilledIcon.svelte';
	import FavoriteIcon from './icons/FavoriteIcon.svelte';
	import { getDispatcher } from './dispatcher';
	import type { RecentDirectory } from '../types';
	import RemoveItemIcon from './icons/RemoveItemIcon.svelte';

	export let recentDirectory: RecentDirectory;

	const dispatcher = getDispatcher();

	const onToggleFavorite = () => {
		dispatcher.favoriteRecentDirectory(recentDirectory, !recentDirectory.favorite);
	};

	const onRemove = () => {
		dispatcher.removeRecentDirectory(recentDirectory);
	}
</script>

<div class="recent-directory">
	<Button on:click={onToggleFavorite} variant="tool square left">
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
	<Button variant="tool square" on:click>{recentDirectory.dir}</Button>
	<Button on:click={onRemove} variant="tool square right">
		<span class="remove">
			<RemoveItemIcon />
		</span>
	</Button>
</div>

<style>
	.recent-directory {
		display: grid;
		grid-template-columns: auto auto auto;
		align-items: stretch;
		padding: 0.125em;
		border-radius: 10000px;
		column-gap: 0.125em;
		border: 1px solid gray;
	}

	.recent-directory :global(.left) {
		font-size: 0.8em;
		border-top-left-radius: 10000px;
		border-bottom-left-radius: 10000px;
	}

	.recent-directory :global(.right) {
		font-size: 0.8em;
		border-top-right-radius: 10000px;
		border-bottom-right-radius: 10000px;
	}

	.favorite,
	.favorite-filled,
	.remove {
		align-self: center;
	}

	.favorite :global(svg),
	.favorite-filled :global(svg),
	.remove :global(svg) {
		margin-bottom: -2px;
		width: 18px;
		height: 18px;
	}


	.favorite {
		color: transparent;
	}

	.recent-directory:hover .favorite {
		color: rgb(184, 34, 20);
	}

	.favorite-filled {
		color: rgb(184, 34, 20);
	}
</style>
