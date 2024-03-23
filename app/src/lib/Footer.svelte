<script lang="ts">
	import { Button } from '@geoffcox/sterling-svelte';
	import { actionHistory } from './stores';
	import { getDispatcher } from './dispatcher';
	import ActionHistoryDialog from '$lib/ActionHistoryDialog.svelte';
	import { getPathApi } from './ipc.apis';
	import ActionHistoryLine from './ActionHistoryItem.svelte';
	import type { ActionHistoryItem } from '../types';

	const dispatcher = getDispatcher();

	$: lastAction = $actionHistory[$actionHistory.length - 1];

	const path = getPathApi();

	let relativeLastAction: ActionHistoryItem | undefined = undefined;
	$: {
		if (lastAction) {
			dispatcher.getRelativeActionHistoryItem(lastAction).then((Value) => relativeLastAction);
		}
	}

	let historyDialogOpen = false;

	const onUndo = async () => {
		lastAction && (await dispatcher.undoAction(lastAction.createdEpoch));
	};
</script>

<div class="footer">
	{#if relativeLastAction}
		<div class="last-action">
			<ActionHistoryLine item={relativeLastAction} />
			<div class="undo-action">
				{#if lastAction?.action == 'move'}
					<Button on:click={onUndo}>Undo</Button>
				{/if}
			</div>
		</div>
	{/if}
	<div class="actions">
		{#if $actionHistory.length !== 0}
			<Button on:click={() => (historyDialogOpen = true)}>History</Button>
		{/if}
	</div>
</div>
<ActionHistoryDialog bind:open={historyDialogOpen} />

<style>
	.footer {
		background-color: var(--stsv-common__background-color--subtle);
		color: var(--stsv-common__color--secondary);
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-areas: 'lastAction actions';
		padding: 0.5em 1em;
		align-items: center;
		min-height: 2em;
	}

	.last-action {
		grid-area: lastAction;
		display: grid;
		grid-template-columns: 1fr auto;
	}

	.actions {
		grid-area: actions;
	}
</style>
