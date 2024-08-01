<script lang="ts">
	import { Label, Input, Button } from '@geoffcox/sterling-svelte';
	import { getDialogApi, getPathApi } from '../src/lib/ipc.apis';

	import { rootToDirectory, relativeToDirectory, photo } from '../src/lib/stores';

	const onBrowse = async () => {
		const path = getPathApi();
		const dialog = getDialogApi();
		if (path && dialog && $rootToDirectory) {
			const currentDir = await path.join($rootToDirectory, $relativeToDirectory || '');
			const selectedDir = await dialog!.browseForDirectory(currentDir);

			if (selectedDir) {
				relativeToDirectory.set(await path.relative($rootToDirectory, selectedDir));
			}
		}
	};

</script>

<div class="to-directory-picker">
	<div class="relative-directory">
		<Label text="In Directory">
			<Input bind:value={$relativeToDirectory} />
		</Label>
		<Button on:click={onBrowse}>...</Button>
	</div>
</div>

<style>
	.to-directory-picker {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto;
		row-gap: 2em;
	}

	.relative-directory {
		align-items: flex-end;
		column-gap: 0.5em;
		display: grid;
		grid-template-columns: 1fr auto;
	}
</style>
