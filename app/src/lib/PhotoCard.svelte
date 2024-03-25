<script lang="ts">
	import prettybytes from 'pretty-bytes';

	import type { Photo } from '../types';
	import NoPhotoIcon from './icons/NoPhotoIcon.svelte';
	import PhotoInfoCard from './PhotoInfoCard.svelte';

	export let photo: Photo | undefined;

	$: rotation = photo?.rotation ?? 0;
	$: rotate = rotation === 0 ? 0 : 360 - rotation;

</script>

<div class="photo-card">
	{#if photo}
		<div class="photo" style={`--rotate:${rotate}deg`}>
			{#if photo?.thumbnailSrc}
				<img alt="current" src={photo.thumbnailSrc} />
			{/if}
		</div>
		<PhotoInfoCard photo={photo} />
	{:else}
		<div class="no-photo">
			<NoPhotoIcon />
		</div>
		<div class="no-photo-message">
			Looks like you've been busy<br />and organized all your photos!
		</div>
	{/if}
</div>

<style>
	.photo-card {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 400px auto;
		row-gap: 0.5em;
		justify-items: center;
	}

	.photo {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		place-content: stretch;
		place-items: stretch;
		overflow: hidden;
	}

	.photo img {
		object-fit: contain;
		width: 400px;
		height: 400px;
		transform-origin: 50% 50%;
		transform: rotate(var(--rotate));
	}

	.no-photo :global(svg) {
		width: 400px;
		height: 400px;
	}

	.no-photo-message {
		font-size: 1.2em;
	}
</style>
