<script lang="ts">
	import type { Photo } from '../../types';
	import PictureFrame from './PictureFrame.svelte';

	export let photo: Photo | undefined;

	$: rotation = photo?.rotation ?? 0;
	$: rotate = rotation === 0 ? 0 : 360 - rotation;
</script>

<PictureFrame name={photo?.path.base}>
	<div class="photo-display" style={`--rotate:${rotate}deg`}>
		{#if photo && photo?.thumbnailSrc}
			<img alt="current" src={photo.thumbnailSrc} />
		{/if}
	</div>
</PictureFrame>

<style>
	.photo-display {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		place-content: center;
		place-items: center;
		overflow: hidden;
	}

	.photo-display img {
		display: block;
		object-fit: contain;
		overflow: hidden;
		transform-origin: 50% 50%;
		transform: rotate(var(--rotate));
		max-width: 400px;
		max-height: 400px;
	}
</style>
