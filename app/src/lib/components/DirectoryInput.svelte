<script lang="ts">
	import { Label, Input, Button } from '@geoffcox/sterling-svelte';
	import { getDialogApi } from '../ipc.apis';

	export let directory : string | undefined;
	export let label : string;

	const onBrowse = async () => {
		const dialog = getDialogApi();
		if (dialog) {
			const selectedDir = await dialog.browseForDirectory(directory ?? '');
			if (selectedDir) {
				directory = selectedDir;
			}
		}
	};
</script>

<div class="directory">
	<Label text={label}>
		<Input bind:value={directory} />
	</Label>
	<Button on:click={onBrowse}>...</Button>
</div>

<style>
	.directory {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: flex-end;
		column-gap: 0.5em;
	}
</style>
