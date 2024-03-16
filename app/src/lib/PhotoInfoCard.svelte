<script lang="ts">
	import prettybytes from 'pretty-bytes';
	import type { Photo } from '../types';

	export let photo: Photo | undefined;

	$: dateTakenText = photo?.dateTaken
		? photo.dateTaken.toLocaleString({
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				fractionalSecondDigits: 3,
				timeZoneName: 'short'
			})
		: undefined;

		$: relativeDir = photo?.path.dir;
		$: fileName = photo?.path.name;

		$: fileSize = photo?.sizeInBytes ? prettybytes(photo.sizeInBytes) : undefined;

		$: swapDimensions = photo?.rotation == 90 || photo?.rotation == 270;
		$: width = swapDimensions ? photo?.height : photo?.width; 
		$: height = swapDimensions ? photo?.width : photo?.height; 
		$: dpiX = swapDimensions ? photo?.resolutionY : photo?.resolutionY; 
		$: dpiY = swapDimensions ? photo?.resolutionX : photo?.resolutionY; 
		
</script>

<div class="exif-card">
	{#if relativeDir}
		<div>Directory</div>
		<div>{relativeDir}</div>
	{/if}
	{#if fileName}
		<div>File</div>
		<div>{fileName}</div>
	{/if}
	{#if fileSize}
		<div>Size</div>
		<div>{fileSize}</div>
	{/if}
	{#if dateTakenText}
		<div>Date Taken</div>
		<div>{dateTakenText}</div>
	{/if}
	{#if width && height}
		<div>Dimensions</div>
		<div>{width}x{height}</div>
	{/if}
	{#if dpiX && dpiY}
		<div>Resolution</div>
		<div>{dpiX}x{dpiY}</div>
	{/if}
	{#if photo?.make}
		<div>Make</div>
		<div>{photo.make}</div>
	{/if}
	{#if photo?.model}
		<div>Model</div>
		<div>{photo.model}</div>
	{/if}
</div>

<style>
	.exif-card {
		display: grid;
		grid-template-columns: auto 1fr;
		grid-template-rows: auto;
		column-gap: 1em;
		row-gap: 0.5em;
		font-size: 0.8em;
	}

	.exif-card div:nth-child(odd) {
		justify-self: flex-end;
	}

	.exif-card div:nth-child(even) {
		justify-self: flex-start;
	}
</style>
