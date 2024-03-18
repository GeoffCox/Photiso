<script lang="ts">
	import { Button } from '@geoffcox/sterling-svelte';
	import { tick } from 'svelte';

	import { photo, toFile, noConflictToFileName, userSettings } from './stores';
	import { getDispatcher } from './dispatcher';
	import DirectoryHierarchy from './FileHierarchy.svelte';

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
	<div class="from">
		<DirectoryHierarchy path={$photo?.file ?? ''} />
	</div>
	<div class="actions">
		<Button disabled={$photo?.file === undefined} on:click={onSkip} variant="secondary">Skip</Button
		>
		{#if $userSettings?.fileAction === 'move'}
			<Button disabled={!canAct} on:click={onMove} variant="colorful">Move</Button>
		{:else}
			<Button disabled={!canAct} on:click={onCopy} variant="colorful">Copy</Button>
		{/if}
	</div>
	<div class="to">
		<DirectoryHierarchy path={$toFile ?? ''} />
	</div>
</div>

<style>
	.photo-actions {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		column-gap: 1em;
		border-top: 1px solid var(--stsv-button--colorful__border-color);
		border-bottom: 1px solid var(--stsv-button--colorful__border-color);
		padding: 0.5em;
	}
	
	.from {
		justify-self: flex-end;
		align-self: flex-start;
		font-size: 0.8em;
	}

	.actions {
		display: grid;
		grid-template-rows: auto auto;
		justify-content: stretch;
		justify-items: stretch;
		justify-self: stretch;
		align-self: center;
		row-gap: 0.5em;
		font-size: 1.5em;
	}

	.to {
		justify-self: flex-start;
		align-self: flex-start;
		font-size: 0.8em;
	}

	.photo-actions :global(.file) {
		color: var(--stsv-button--colorful__background-color);
	}
</style>
