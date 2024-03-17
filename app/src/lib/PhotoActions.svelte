<script lang="ts">
	import { Button } from '@geoffcox/sterling-svelte';
	import { tick } from 'svelte';

	import { photo, toFile, noConflictToFileName, userSettings} from './stores'
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
	<div class="destination">
		<div>{$photo?.file}</div>
        <div>to</div>
        <div>{$toFile}</div>
	</div>
	<div class="actions">
		{#if $userSettings?.fileAction === 'move'}
			<Button disabled={!canAct} on:click={onMove} variant="colorful">Move</Button>
		{:else}
			<Button disabled={!canAct} on:click={onCopy} variant="colorful">Copy</Button>
		{/if}
		<Button disabled={$photo?.file === undefined} on:click={onSkip} variant="secondary">Skip</Button>
	</div>
</div>

<style>
    .photo-actions {
        display: grid;
		justify-content: flex-start;
		justify-items: flex-start;
		column-gap: 1em;
    }
	.actions {
		display: grid;
		grid-template-columns: auto auto;
		justify-content: flex-start;
		justify-items: flex-start;
		column-gap: 0.5em;
		font-size: 1.5em;
	}

    .destination {
        display: grid;
        justify-items: flex-start;
        font-size: 0.8em;
        margin: 1em;
    }

    .destination :nth-child(2) {
        margin-left: 2em;
    }
</style>
