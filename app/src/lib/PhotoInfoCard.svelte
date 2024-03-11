<script lang="ts">
	import { onMount } from 'svelte';
	import type { PathApi, PhotoInfo } from './ipc.types';
	import { DateTime } from 'luxon';
	import type { PhotisoWindow } from '../types';
	import prettybytes from 'pretty-bytes';

	export let photoInfo: PhotoInfo | undefined;
	export let sourceDir: string;

	let path: PathApi | undefined = undefined;

	onMount(() => {
		path = (<PhotisoWindow>window).pathApi;
	});

	$: dateTaken = photoInfo?.dateTaken
		? DateTime.fromISO('2024-01-03T21:59:19.507-08:00')
		: undefined;
	$: dateTakenText = dateTaken
		? dateTaken.toLocaleString({
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

		$: relativeDir = photoInfo?.file ? `${path?.relative(sourceDir, path?.dirname(photoInfo.file))}` : undefined;
		$: fileName = photoInfo?.file ? `${path?.basename(photoInfo.file)}` : undefined;

		$: fileSize = photoInfo?.sizeInBytes ? prettybytes(photoInfo.sizeInBytes) : undefined;

		$: swapDimensions = photoInfo?.rotation == 90 || photoInfo?.rotation == 270;
		$: width = swapDimensions ? photoInfo?.height : photoInfo?.width; 
		$: height = swapDimensions ? photoInfo?.width : photoInfo?.height; 
		$: dpiX = swapDimensions ? photoInfo?.resolutionY : photoInfo?.resolutionY; 
		$: dpiY = swapDimensions ? photoInfo?.resolutionX : photoInfo?.resolutionY; 
		
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
	{#if dateTaken}
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
	{#if photoInfo?.make}
		<div>Make</div>
		<div>{photoInfo.make}</div>
	{/if}
	{#if photoInfo?.model}
		<div>Model</div>
		<div>{photoInfo.model}</div>
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
