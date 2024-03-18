<script lang="ts">
	import type { Photo } from '../types';
	import NoPhotoIcon from './icons/NoPhotoIcon.svelte';

	export let photo: Photo | undefined;


	$: rotation = photo?.rotation ?? 0;
	$: rotate = rotation === 0 ? 0 : 360 - rotation;
</script>

<div class="photo" style={`--rotate:${rotate}deg`}>
	{#if photo?.thumbnailSrc}
		<img alt="current" src={photo.thumbnailSrc} />
	{:else}
		<NoPhotoIcon class="no-photo" />
	{/if}
</div>

<style>
	.photo {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		place-content: stretch;
		place-items: stretch;
		overflow: hidden;
	}

	.photo :global(.no-photo) {
		object-fit: contain;
		width: 100%;
		height: auto;
		max-width: 400px;
		max-height: 400px;
	}

	.photo img {
		object-fit: contain;
		width: 100%;
		height: 100%;
		max-width: 400px;
		max-height: 400px;
		transform-origin: 50% 50%;
		transform: rotate(var(--rotate));
	}
</style>
