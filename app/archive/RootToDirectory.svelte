<script lang="ts">
	import { Label, Input, Button } from '@geoffcox/sterling-svelte';
	import { getDialogApi } from '../src/lib/ipc.apis';
	import { rootToDirectory } from '../src/lib/stores';
	
	const onBrowse = async () => {
		const dialog = getDialogApi();
		if (dialog) {
			const selectedDir = await dialog.browseForDirectory($rootToDirectory ?? '');
			if (selectedDir) {
				rootToDirectory.set(selectedDir);
			}
		}
	};
</script>

<div class="root-to-directory">
	<Label text="To">
		<Input bind:value={$rootToDirectory} />
	</Label>
	<Button on:click={onBrowse}>...</Button>
</div>

<style>
	.root-to-directory {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: flex-end;
		column-gap: 0.5em;
	}
</style>
