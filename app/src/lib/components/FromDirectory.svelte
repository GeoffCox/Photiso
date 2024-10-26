<script lang="ts">
	import { Button, Input, Label } from '@geoffcox/sterling-svelte';
	import {
		appStatus,
		fromDirectory	} from '../stores';
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

	const onDone = async () => {
		dispatcher.doneOrganizing();
	};
</script>

<div class="from-directory">
	<Label text="Directory of photos to organize">
		<div class="layout">
			<Input bind:value={$fromDirectory} />
			<Button on:click={onBrowseToDirectory}>...</Button>
			{#if $appStatus === 'waiting'}
				<Button variant="capsule colorful" style="min-width: 150px;" on:click={onStart}
					>Start Organizing</Button
				>
			{:else}
				<Button variant="capsule" style="min-width: 150px;" on:click={onDone}
					>Done Organizing</Button
				>
			{/if}
		</div>
	</Label>
</div>

<style>
	.layout {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		column-gap: 0.5em;
	}

	.from-directory :global(.favorite svg) {
		width: 1.2em;
		height: 1.2em;
		color: var(--stsv-status--danger__color);
	}
</style>
