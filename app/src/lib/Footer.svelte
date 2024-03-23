<script lang="ts">
	import { Button } from '@geoffcox/sterling-svelte';

	import { actionHistory, fromDirectory, rootToDirectory } from './stores';
	import { getDispatcher } from './dispatcher';

	import ActionHistoryDialog from './ActionHistoryDialog.svelte';
	import ActionHistoryList from './ActionHistoryList.svelte';
	import type { EventHandler } from 'svelte/elements';

	const dispatcher = getDispatcher();

	$: lastAction = $actionHistory[0];

	let historyDialogOpen = false;

	// const onUndo : EventHandler<ActionHistoryItem> = async (event) => {
	// 	const undoAction = event.detail;
	// 	undoAction && (await dispatcher.undoAction(undoAction.createdEpoch));
	// };
</script>

<div class="footer">
	{#if lastAction}
		<div class="last-action">
			<ActionHistoryList
				history={[lastAction]}
				fromDirectory={$fromDirectory}
				rootToDirectory={$rootToDirectory}
				showHeader={false}
			/>
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
