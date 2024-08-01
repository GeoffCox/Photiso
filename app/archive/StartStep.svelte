<script lang="ts">
	import { Label, Input, Button } from '@geoffcox/sterling-svelte';
	import { onMount } from 'svelte';
	import type { PhotisoWindow } from '../src/types';
	import type { DialogApi } from '../src/lib/ipc.types';

	export let unorganizedDirectory: string = '';
	export let organizedDirectory: string = '';

	let dialogApi: DialogApi | undefined = undefined;

	let starting = false;
	let started = false;
	onMount(async () => {
		dialogApi = (<PhotisoWindow>window).dialogApi;
	});

	const onUnorganizedDirectoryBrowse = async () => {
		const selectedDir = await dialogApi!.browseForDirectory(unorganizedDirectory);
		if (selectedDir) {
			unorganizedDirectory = selectedDir;
		}
	};

	const onOrganizedDirectoryBrowse = async () => {
		const selectedDir = await dialogApi!.browseForDirectory(organizedDirectory);
		if (selectedDir) {
			organizedDirectory = selectedDir;
		}
	};

	const onStart = () => {
		starting = true;
	};
	

</script>

<div class="start-step" class:collapsed={started}>
	{#if starting}
		<div class="display-source">
			<Label text="Directory of unorganized photos">
				<div>{unorganizedDirectory}</div>
			</Label>
		</div>
		<div
			class="display-destination"
		>
			<Label text="Directory of organized photos">
				<div>{organizedDirectory}</div>
			</Label>
		</div>
	{:else}
		<div class="edit-source">
			<Label text="Directory of unorganized photos">
				<Input bind:value={unorganizedDirectory} />
			</Label>
			<Button on:click={onUnorganizedDirectoryBrowse}>...</Button>
		</div>
		<div
			class="edit-destination"
		>
			<Label text="Directory of organized photos">
				<Input bind:value={organizedDirectory} />
			</Label>
			<Button on:click={onOrganizedDirectoryBrowse}>...</Button>
		</div>
		<div class="start-action">
			<Button on:click={onStart}>Start Organizing</Button>
		</div>
	{/if}
</div>

<style>
	.start-step {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto 1fr 1fr 0.3fr auto;
		grid-template-areas: 'displaySource displayDestination' '. .' 'editSource editDestination' '. .' 'start start';
		justify-items: stretch;
		align-items: center;
		column-gap: 2em;
	}

	.start-step.collapsed {
		grid-template-rows: auto;
		grid-template-areas: 'displaySource displayDestination';
		align-items: flex-start;
		align-self: flex-start;
	}

	.edit-source,
	.edit-destination {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: flex-end;
		column-gap: 0.5em;
	}

	.edit-source {
		grid-area: editSource;
	}

	.edit-destination {
		grid-area: editDestination;
	}

	.display-source {
		grid-area: displaySource;
	}

	.display-destination {
		grid-area: displayDestination;
	}

	.display-source div, .display-destination div {
		padding: 0.5em;
		border: 2px solid transparent;
	}

	.start-action {
		grid-area: start;
		align-self: flex-start;
		justify-self: center;
		font-size: 2em;
	}
</style>
