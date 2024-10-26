<script lang="ts">
	import { Button } from '@geoffcox/sterling-svelte';
	import type { Photo } from '../../types';

	export let photo: Photo | undefined;

	$: rotation = photo?.rotation ?? 0;
	$: rotate = rotation === 0 ? 0 : 360 - rotation;
</script>

{#if photo}
	<Button on:click {...$$restProps}>
		<div class="photo-display" style={`--rotate:${rotate}deg`}>
			{#if photo && photo?.thumbnailSrc}
				<img alt="current" src={photo.thumbnailSrc} />
			{/if}
		</div>
	</Button>
{:else}
	<div />
{/if}

<style>
	.photo-display {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		place-content: center;
		place-items: center;
		overflow: hidden;
		width: 160px;
		height: 90px;
	}

	.photo-display img {
		display: block;
		height: 100%;
		width: 100%;
		object-fit: contain;
		overflow: hidden;
		transform-origin: 50% 50%;
		transform: rotate(var(--rotate));
	}
</style>
