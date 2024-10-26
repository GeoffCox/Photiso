<script lang="ts">
	import { Label, Input, Button } from '@geoffcox/sterling-svelte';
	import { getDialogApi } from '../ipc.apis';

	export let directory : string | undefined;
	export let label : string | undefined = undefined;
	export let readonly : boolean | undefined = undefined;

	const onBrowse = async () => {
		const dialog = getDialogApi();
		if (dialog) {
			const selectedDir = await dialog.browseForDirectory(directory ?? '');
			if (selectedDir) {
				directory = selectedDir;
			}
		}
	};

 $: console.log('readonly',readonly);
</script>

<div class="directory">
	{#if label}
	<Label text={label}>
		<Input bind:value={directory} readonly={readonly || null} {...$$restProps}/>
	</Label>
	<Button on:click={onBrowse} disabled={readonly}>...</Button>
	{:else}
	<Input bind:value={directory} {...$$restProps}/>
	<Button on:click={onBrowse} disabled={readonly}>...</Button>
	{/if}
</div>

<style>
	.directory {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: flex-end;
		column-gap: 0.5em;
	}
</style>
