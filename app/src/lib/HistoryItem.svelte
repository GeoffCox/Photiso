<script lang="ts">
	import { Button } from '@geoffcox/sterling-svelte';
	import type { ActionHistoryItem } from '../types';
	import { getDispatcher } from './dispatcher';
	import { fromDirectory } from './stores';
	import { getPathApi } from './ipc.apis';
    import MoveFolderToIcon from './icons/MoveFolderToIcon.svelte';
	import CopyToFolderIcon from './icons/CopyToFolderIcon.svelte';

	export let item: ActionHistoryItem;

	const dispatcher = getDispatcher();

	const onUndo = async () => {
		await dispatcher.undoAction(item);
	};

    const getRelativeDirectory = async (value: string) => {
        const pathApi = getPathApi();
        if (pathApi && value && $fromDirectory) {
            const relativeDir = await pathApi.relative($fromDirectory, value);
            return (relativeDir.length <= value.length) ? relativeDir : value;
        }
        return value;
    };

    let relativeFrom : string | undefined = undefined;

    $: {
        getRelativeDirectory(item.from).then((value) => (relativeFrom = value));
    }

    let relativeTo : string | undefined = undefined;

    $: {
        getRelativeDirectory(item.to).then((value) => (relativeTo = value));
    }

</script>

<div class="history-item">
    {#if item.action === 'move'}
        <MoveFolderToIcon />
        {:else if item.action === 'copy'}
        <CopyToFolderIcon />
    {/if}
	<div class="paths">{relativeFrom} to {relativeTo}</div>
	<div class="undo">
		<Button variant="secondary square" on:click={onUndo}>Undo</Button>
	</div>
</div>

<style>
    .history-item {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        column-gap: 0.5em;
    }
</style>