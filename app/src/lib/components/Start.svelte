<script lang="ts">
	import { Button, Input, Label } from '@geoffcox/sterling-svelte';
	import { fromDirectory } from '../stores';
	import { getDispatcher } from '../dispatcher';

	import { getDialogApi } from '../ipc.apis';

	const dispatcher = getDispatcher();

	const onBrowseToDirectory = async () => {
		const dialog = getDialogApi();
		if (dialog) {
			const selectedDir = await dialog.browseForDirectory($fromDirectory ?? '');
			if (selectedDir) {
				$fromDirectory = selectedDir;
			}
		}
	};

	const onStart = async () => {
		dispatcher.startOrganizing();
	};
</script>

<div class="start">
	<Label text="Directory of photos to organize">
		<div class="layout">
			<Input bind:value={$fromDirectory} />
			<Button on:click={onBrowseToDirectory}>...</Button>
		</div>
	</Label>
	<Button variant="capsule colorful" style="min-width: 150px;" on:click={onStart}
		>Start Organizing</Button
	>
</div>

<style>
	.start {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto;
		justify-items: center;
		align-content: center;
		row-gap: 2em;
	}

	.layout {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		column-gap: 0.5em;
		min-width: 500px;
	}
</style>
