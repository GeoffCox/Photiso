<script lang="ts">
	import { Label, Input, Button } from '@geoffcox/sterling-svelte';
	import { getDialogApi, getPathApi } from '../ipc.apis';

	export let rootDirectory: string | undefined;
	export let relativeDirectory: string | undefined;
	export let label: string;

	const onBrowse = async () => {
		const path = getPathApi();
		const dialog = getDialogApi();
		if (path && dialog && rootDirectory) {
			const currentDir = await path.join(rootDirectory, relativeDirectory || '');
			const selectedDir = await dialog!.browseForDirectory(currentDir);

			if (selectedDir) {
				relativeDirectory = await path.relative(rootDirectory, selectedDir);
			}
		}
	};

</script>

<div class="directory">
	<Label text={label}>
		<Input bind:value={relativeDirectory} />
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
