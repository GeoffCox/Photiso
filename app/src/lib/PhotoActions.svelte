<script lang="ts">
	import { Button } from '@geoffcox/sterling-svelte';
	import { tick } from 'svelte';

	import { photo, toFile, noConflictToFileName, userSettings } from './stores';
	import { getDispatcher } from './dispatcher';

	const dispatcher = getDispatcher();

	$: canAct =
		$photo?.file &&
		$photo.file.length > 0 &&
		$toFile &&
		$toFile.length > 0 &&
		$photo.file != $toFile &&
		!$noConflictToFileName;

	const onCopy = async () => {
		await tick();
		dispatcher.copyPhoto();
		dispatcher.nextPhoto();
	};

	const onMove = async () => {
		await tick();
		dispatcher.movePhoto();
		dispatcher.nextPhoto();
	};

	const onSkip = async () => {
		dispatcher.nextPhoto();
	};
</script>

<div class="photo-actions">
	<Button disabled={$photo?.file === undefined} on:click={onSkip} variant="secondary">Skip</Button>
	<Button disabled={!canAct} on:click={onCopy}>Copy</Button>
	<Button disabled={!canAct} on:click={onMove} variant="colorful">Move</Button>
</div>

<style>
	.photo-actions {
		display: grid;
		grid-template-columns: auto auto auto;
		column-gap: 1em;
		padding: 0.5em;
		font-size: 1.5em;
	}
</style>
