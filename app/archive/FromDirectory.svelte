<script lang="ts">
	import { Label, Input, Button } from '@geoffcox/sterling-svelte';
	import { getDialogApi } from '../src/lib/ipc.apis';
	import { fromDirectory } from '../src/lib/stores';

	const onBrowse = async () => {
		const dialog = getDialogApi();
		if (dialog) {
			const selectedDir = await dialog.browseForDirectory($fromDirectory ?? '');
			if (selectedDir) {
				fromDirectory.set(selectedDir);
			}
		}
	};
</script>

<div class="from-directory">
	<Label text="From">
		<Input bind:value={$fromDirectory} />
	</Label>
	<Button on:click={onBrowse}>...</Button>
</div>

<style>
	.from-directory {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: flex-end;
		column-gap: 0.5em;
	}
</style>
