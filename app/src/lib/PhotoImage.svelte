<script lang="ts">
	import NoPhotoIcon from './icons/NoPhotoIcon.svelte';
	import { photo } from './stores';

	$: rotation = $photo?.rotation ?? 0;
	$: rotate = rotation === 0 ? 0 : 360 - rotation;
</script>

<div class="photo" style={`--rotate:${rotate}deg`}>
	{#if $photo?.src}
		<img alt="current" src={$photo.src} />
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
		position: relative;
		width: 100%;
		height: 100%;
	}

	.photo :global(.no-photo) {
		width: 100%;
		height: 100%;
	}

	.photo img {
		object-fit: contain;
		width: 100%;
		height: 100%;
		transform-origin: 50% 50%;
		transform: rotate(var(--rotate));
	}
</style>
