<script lang="ts">
	import { Button } from '@geoffcox/sterling-svelte';
	import RemoveItemIcon from '../icons/XIcon.svelte';
	import { createEventDispatcher } from 'svelte';

	export let favoriteDirectory: string;

	const dispatch = createEventDispatcher();

	const raiseSelect = () => {
		dispatch('select', { favoriteDirectory });
	};

	const raiseRemove = () => {
		dispatch('remove', { favoriteDirectory });
	};
</script>

<div class="favorite-directory">
	<Button variant="tool square left" on:click={raiseSelect}>
			{favoriteDirectory}
		</Button
	>
	<Button on:click={raiseRemove} variant="tool square right">
		<span class="remove">
			<RemoveItemIcon />
		</span>
	</Button>
</div>

<style>
	.favorite-directory {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: stretch;
		padding: 0.125em;
		border-radius: 10000px;
		column-gap: 0.125em;
		border: 1px solid gray;
	}

	.favorite-directory :global(.left) {
        justify-content: flex-start;
        text-align: left;
		font-size: 0.8em;
		border-top-left-radius: 10000px;
		border-bottom-left-radius: 10000px;
	}

	.favorite-directory :global(.middle) {
        
        border-top-left-radius: 10000px;
		border-bottom-left-radius: 10000px;
	}

	.favorite-directory :global(.right) {
		font-size: 0.8em;
		border-top-right-radius: 10000px;
		border-bottom-right-radius: 10000px;
	}

	.remove {
		align-self: center;
	}

	.remove :global(svg) {
		margin-bottom: -2px;
		width: 18px;
		height: 18px;
	}
</style>
