<script>
	import { Button, Link } from '@geoffcox/sterling-svelte';
	import { actionHistory, fromDirectory, toRootDirectory } from './stores';
	import { getDispatcher } from './dispatcher';
	import ActionHistoryDialog from '$lib/ActionHistoryDialog.svelte';
	import { getPathApi } from './ipc.apis';

	$: historyItem = $actionHistory[$actionHistory.length - 1];
	$: actionVerb = historyItem?.action == 'move' ? 'moved to' : 'copied to';

	const path = getPathApi();

	let relativeFrom = '';
	let relativeTo = '';

	$: {
		$fromDirectory && historyItem &&
		path.relative($fromDirectory, historyItem.from).then(value => relativeFrom = value );
	}

	$: {
		$toRootDirectory && historyItem &&
		path.relative($toRootDirectory, historyItem.to).then(value => relativeTo = value );
	}

	const dispatcher = getDispatcher();

	let historyDialogOpen = false;

	const onUndo = async () => {
		historyItem && (await dispatcher.undoAction(historyItem.createdEpoch));
	};
</script>

{#if historyItem}
	<div class="undo-last-action">
		<div class="history-item">
			<div class="from">{relativeFrom}</div>
			<span>&nbsp;</span>
			<div class="action">{actionVerb}</div>
			<span>&nbsp;</span>
			<div class="to">{relativeTo}</div>
		</div>
		{#if historyItem?.action == 'move'}
			<div class="undo-action">
				<Button on:click={onUndo}>Undo</Button>
			</div>
			<Button on:click={() => (historyDialogOpen = true)}>History</Button>
		{/if}
	</div>
{/if}
<ActionHistoryDialog bind:open={historyDialogOpen} />

<style>
	.undo-last-action {
		display: grid;
		grid-template-columns: auto auto auto;
		column-gap: 1em;
		font-size: 0.8em;
		align-items: center;
		margin-top: 1em;
		justify-items: flex-start;
	}

	.history-item {
		background-color: var(--stsv-common__background-color--secondary);
		border: 1px solid var(--stsv-common__color--secondary);
		color: var(--stsv-common__color--secondary);
		display: grid;
		grid-template-columns: auto auto auto auto auto;
		justify-items: flex-start;
		align-items: center;
		padding: 1em;
	}
</style>
