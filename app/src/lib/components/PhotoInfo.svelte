<script lang="ts">
	import prettybytes from 'pretty-bytes';
	import type { Photo } from '../../types';

	export let photo: Photo | undefined = undefined;

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

	$: folder = photo?.path.dir;
	$: fileName = photo?.path.name;

	$: fileSize = photo?.sizeInBytes ? prettybytes(photo.sizeInBytes) : undefined;

	$: swapDimensions = photo?.rotation == 90 || photo?.rotation == 270;
	$: width = swapDimensions ? photo?.height : photo?.width;
	$: height = swapDimensions ? photo?.width : photo?.height;
	$: dpiX = swapDimensions ? photo?.resolutionY : photo?.resolutionY;
	$: dpiY = swapDimensions ? photo?.resolutionX : photo?.resolutionY;

	$: dimensions = width || height ? `${width}x${height}` : '';
	$: resoluton = dpiX || dpiY ? `${dpiX}x${dpiY}` : '';
</script>

<div class="photo-info-card">
	<div>Folder</div>
	<div>{folder ?? ''}</div>
	<div>File</div>
	<div>{fileName ?? ''}</div>
	<div>Taken on</div>
	<div>{dateTakenText ?? ''}</div>
	<div>Size</div>
	<div>{fileSize ?? ''}</div>
	<div>Dimensions</div>
	<div>{dimensions ?? ''}</div>
	<div>Resolution</div>
	<div>{resoluton ?? ''}</div>
	<div>Camera</div>
	<div>{photo?.make ?? ''} {photo?.model ?? ''}</div>
</div>

<style>
	.photo-info-card {
		display: grid;
		grid-template-columns: auto 1fr;
		grid-template-rows: auto;
		column-gap: 1em;
		row-gap: 0.5em;
		font-size: 0.8em;
	}

	.photo-info-card div {
		word-break: break-all;
	}

	.photo-info-card div:nth-child(odd) {
		justify-self: flex-end;
	}

	.photo-info-card div:nth-child(even) {
		justify-self: flex-start;
	}
</style>
