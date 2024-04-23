<script lang="ts">
	import { Button } from '@geoffcox/sterling-svelte';
	import { tick } from 'svelte';

	import { photo, toFile, noConflictToFileName, userSettings, appStep, appStatus } from './stores';
	import { getDispatcher } from './dispatcher';
	import CopyFileIcon from './icons/CopyFileIcon.svelte';
	import MoveFileIcon from './icons/MoveFileIcon.svelte';
	import SkipIcon from './icons/SkipIcon.svelte';
	import BackIcon from './icons/BackIcon.svelte';
	import StartOverIcon from './icons/StartOverIcon.svelte';

	const dispatcher = getDispatcher();

	$: canAct =
		$appStatus === 'idle' &&
		$photo?.file &&
		$photo.file.length > 0 &&
		$toFile &&
		$toFile.length > 0 &&
		$photo.file != $toFile &&
		!$noConflictToFileName;

	const onCopy = async () => {
		await tick();
		await dispatcher.copyPhoto();
	};

	const onMove = async () => {
		await tick();
		await dispatcher.movePhoto();
	};

	const onPrevious = async () => {
		await tick();
		await dispatcher.previousPhoto();
	};

	const onSkip = async () => {
		await tick();
		await dispatcher.nextPhoto();
	};

	const onStartOver = () => {
		appStep.set('welcome');
		appStatus.set('idle');
	}
</script>

<div class="photo-actions">
	<Button on:click={onPrevious}><BackIcon width="24px" height="24px"/>Back</Button>
	<Button on:click={onStartOver}><StartOverIcon width="24px" height="24px"/>Start Over</Button>
	<Button disabled={!canAct} on:click={onCopy}><CopyFileIcon width="24px" height="24px"/>Copy</Button>
	<Button disabled={!canAct} on:click={onMove} variant="colorful"><MoveFileIcon width="24px" height="24px"/>Move</Button>
	<Button disabled={$photo?.file === undefined} on:click={onSkip}><SkipIcon width="24px" height="24px"/>Skip</Button>
</div>

<style>
	.photo-actions {
		display: grid;
		grid-template-columns: auto auto auto auto auto;
		grid-template-rows: auto auto;
		grid-template-areas:  
		column-gap: 1em;
		padding: 0.5em;
		font-size: 1.5em;
	}
</style>
