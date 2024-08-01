<script lang="ts">
    import { Label, Input, Button } from '@geoffcox/sterling-svelte';
	import { getDialogApi } from '../src/lib/ipc.apis';
	import { appStatus, fromDirectory, rootToDirectory } from '../src/lib/stores';
	import { getDispatcher } from '../src/lib/dispatcher';

	const onFromBrowse = async () => {
		const dialog = getDialogApi();
		if (dialog) {
			const selectedDir = await dialog.browseForDirectory($fromDirectory ?? '');
			if (selectedDir) {
				fromDirectory.set(selectedDir);
			}
		}
	};

    const onToBrowse = async () => {
		const dialog = getDialogApi();
		if (dialog) {
			const selectedDir = await dialog.browseForDirectory($rootToDirectory ?? '');
			if (selectedDir) {
				rootToDirectory.set(selectedDir);
			}
		}
	};

    const onStart = async () => {
        const dispatcher = getDispatcher();
        dispatcher.startOrganizing();
    }

	const onDone = async () => {
		const dispatcher = getDispatcher();
		dispatcher.doneOrganizing();
	}

</script>
<div class="root-folders">
    <div class="from-directory">
		<Label text="From">
			<Input bind:value={$fromDirectory} />
		</Label>
		<Button on:click={onFromBrowse}>...</Button>
	</div>
    <div class="to-directory">
		<Label text="To">
			<Input bind:value={$rootToDirectory} />
		</Label>
		<Button on:click={onToBrowse}>...</Button>
	</div>
    <div class="organize">
		{#if $appStatus === 'waiting'}
        <Button on:click={onStart}>Start Organizing</Button>
		{:else}
		<Button on:click={onDone}>Done Organizing</Button>
		{/if}
    </div>
</div>

<style>
    .root-folders {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto auto;
        row-gap: 1em;
        column-gap: 2em;
    }
    
    .from-directory, .to-directory {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: flex-end;
		column-gap: 0.5em;
	}

    .organize {
        grid-row-start: 2;
        grid-column: 1 / span 2;
        justify-self: center;
    }

</style>