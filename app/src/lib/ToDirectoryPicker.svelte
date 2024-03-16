<script lang="ts">
	import { Label, Input, Button } from '@geoffcox/sterling-svelte';
	import { getDialogApi } from './ipc.apis';
	import { toDirectory } from './stores';

	export let readonly = false;

	const onBrowse = async () => {
		const dialog = getDialogApi();
		if (dialog) {
			const selectedDir = await dialog.browseForDirectory($toDirectory ?? '');
			if (selectedDir) {
				toDirectory.set(selectedDir);
			}
		}
	};

	const labelText = 'Directory of organized photos';
</script>

{#if readonly}
	<div class="to-directory-picker readonly">
		<Label text={labelText}>
			<div>{$toDirectory}</div>
		</Label>
	</div>
{:else}
	<div class="to-directory-picker">
		<Label text={labelText}>
			<Input bind:value={$toDirectory} />
		</Label>
		<Button on:click={onBrowse}>...</Button>
	</div>
{/if}

<style>
	.to-directory-picker {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: flex-end;
		column-gap: 0.5em;
	}

	.to-directory-picker.readonly {
		grid-template-columns: 1fr;
	}

	.to-directory-picker.readonly div {
		padding: 0.5em;
		border: 2px solid transparent;
	}
</style>
