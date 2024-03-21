<script lang="ts">
	import { Label, Input, Button } from '@geoffcox/sterling-svelte';
	import { getDialogApi } from './ipc.apis';
	import { rootToDirectory } from './stores';

	export let readonly = false;

	const onBrowse = async () => {
		const dialog = getDialogApi();
		if (dialog) {
			const selectedDir = await dialog.browseForDirectory($rootToDirectory ?? '');
			if (selectedDir) {
				rootToDirectory.set(selectedDir);
			}
		}
	};

	const labelText = 'To folder';
</script>

{#if readonly}
	<div class="to-root-directory-picker readonly">
		<Label text={labelText}>
			<div>{$rootToDirectory}</div>
		</Label>
	</div>
{:else}
	<div class="to-root-directory-picker">
		<Label text={labelText}>
			<Input bind:value={$rootToDirectory} />
		</Label>
		<Button on:click={onBrowse}>...</Button>
	</div>
{/if}

<style>
	.to-root-directory-picker {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: flex-end;
		column-gap: 0.5em;
	}

	.to-root-directory-picker.readonly {
		grid-template-columns: 1fr;
	}

	.to-root-directory-picker.readonly div {
		padding: 0.5 0 0 0.5em;
		border: 2px solid transparent;
	}
</style>
