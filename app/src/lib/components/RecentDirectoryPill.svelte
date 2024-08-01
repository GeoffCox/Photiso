<script lang="ts">
	import { Button } from '@geoffcox/sterling-svelte';
	import FavoriteFilledIcon from '../icons/FilledHeartIcon.svelte';
	import FavoriteIcon from '../icons/SmallHeartIcon.svelte';
	import type { RecentDirectory } from '../../types';
	import RemoveItemIcon from '../icons/XIcon.svelte';
	import { createEventDispatcher } from 'svelte';

	export let recentDirectory: RecentDirectory;

	const dispatch = createEventDispatcher();

	const raiseToggle = (recentDirectory: RecentDirectory) => {
		dispatch('toggleFavorite', recentDirectory);
	};

	const raiseRemove = (recentDirectory: RecentDirectory) => {
		dispatch('remove', recentDirectory);
	};

	const onToggle = () => {
		raiseToggle(recentDirectory);
	};

	const onRemove = () => {
		raiseRemove(recentDirectory)
	}
</script>

<div class="recent-directory">
	<Button on:click={onToggle} variant="tool square left">
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
