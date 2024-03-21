<script lang="ts">
	import { Label, Input, Button } from '@geoffcox/sterling-svelte';
	import { getDialogApi } from './ipc.apis';
	import { fromDirectory } from './stores';

	export let readonly = false;

	const onBrowse = async () => {
		const dialog = getDialogApi();
		if (dialog) {
			const selectedDir = await dialog.browseForDirectory($fromDirectory ?? '');
			if (selectedDir) {
				fromDirectory.set(selectedDir);
			}
		}
	};

	const labelText = 'From folder';

</script>

{#if readonly}
	<div class="from-directory-picker readonly">
		<Label text={labelText}>
			<div>{$fromDirectory}</div>
		</Label>
	</div>
{:else}
	<div class="from-directory-picker">
		<Label text={labelText}>
			<Input bind:value={$fromDirectory} />
		</Label>
		<Button on:click={onBrowse}>...</Button>
	</div>
{/if}

<style>
	.from-directory-picker {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: flex-end;
		column-gap: 0.5em;
	}

	.from-directory-picker.readonly {
		grid-template-columns: 1fr;
		align-items: center;
		column-gap: 0;
	}

	.from-directory-picker.readonly div {
		padding: 0.5 0 0 0.5em;
		border: 2px solid transparent;
	}
</style>
