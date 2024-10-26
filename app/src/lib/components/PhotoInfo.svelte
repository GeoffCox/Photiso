<script lang="ts">
	import prettybytes from 'pretty-bytes';
	import type { Photo } from '../../types';
	import { getPathApi } from '$lib/ipc.apis';
	import DimensionIcon from '$lib/icons/DimensionIcon.svelte';
	import CalendarIcon from '$lib/icons/CalendarIcon.svelte';
	import ResolutionIcon from '$lib/icons/ResolutionIcon.svelte';
	import CameraIcon from '$lib/icons/CameraIcon.svelte';
	import FileIcon from '$lib/icons/FileIcon.svelte';
	import FolderIcon from '$lib/icons/FolderIcon.svelte';
	import FileSizeIcon from '$lib/icons/FileSizeIcon.svelte';

	export let photo: Photo | undefined = undefined;
	
	export let rootDirectory: string | undefined = undefined;

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

	const getRelativeDirectory = async (
		rootDirectory: string | undefined,
		directory: string | undefined
	) => {
		return directory;
		// const pathApi = getPathApi();
		// if (pathApi && rootDirectory && directory) {
		// 	const dir = await pathApi.relative(rootDirectory, directory);
		// 	return !!dir ? dir : './';
		// }
		// return directory;
	};

	let folder = photo?.path.dir;
	$: {
		getRelativeDirectory(rootDirectory, photo?.path.dir).then(data => folder = data);
	}

	$: fileName = photo?.path.base;

	$: fileSize = photo?.sizeInBytes ? prettybytes(photo.sizeInBytes) : undefined;

	$: swapDimensions = photo?.rotation == 90 || photo?.rotation == 270;
	$: width = swapDimensions ? photo?.height : photo?.width;
	$: height = swapDimensions ? photo?.width : photo?.height;

	$: dimensions = width || height ? `${width}x${height} px` : '';

	// $: console.log('exifData', photo?.exifData);
	// const dispatcher = getDispatcher();

	// let hash : string | undefined = undefined;
	// const updatePhotoHash = async () => {
	// 	hash = await dispatcher.loadPhotoHash();
	// }

	// $: updatePhotoHash(), photo;
</script>

<div class="photo-info-card">
	<div title="Folder"><FolderIcon /></div>
	<div>{folder ?? ''}</div>
	<div title="File Name"><FileIcon /></div>
	<div>{fileName ?? ''}</div>
	<div title="Taken On"><CalendarIcon /></div>
	<div>{dateTakenText ?? ''}</div>
	<div title="File Size"><FileSizeIcon /></div>
	<div>{fileSize ?? ''}</div>
	<div title="Dimensions"><DimensionIcon /></div>
	<div>{dimensions ?? ''}</div>
	<div title="Camera"><CameraIcon /></div>
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
		align-items: center;
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
