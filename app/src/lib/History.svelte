<script lang="ts">
	import { Button, Label } from '@geoffcox/sterling-svelte';
	import { actionHistory } from './stores';
	import { createEventDispatcher } from 'svelte';
	import type { ActionHistoryItem } from '../types';

	const dispatch = createEventDispatcher();

	const onUndo = (item: ActionHistoryItem) => {
		dispatch('undo', { item });
	};

	// type RelativeActionHistoryItem = ActionHistoryItem & {
	// 	relativeFrom: string;
	// 	relativeTo: string;
	// };

	// const getRelativeHistory = async (
	// 	actionHistory: ActionHistoryItem[]
	// ): Promise<RelativeActionHistoryItem[]> => {
	// 	const pathApi = getPathApi();
	// 	if (pathApi && $fromDirectory && $rootToDirectory) {
	// 		return await Promise.all(
	// 			await actionHistory.map(async (i) => {
	// 				const relativeFrom = await pathApi!.relative($fromDirectory, i.from);
	// 				const relativeTo = await pathApi!.relative($rootToDirectory, i.to);
	// 				return {
	// 					...i,
	// 					relativeFrom,
	// 					relativeTo
	// 				} as RelativeActionHistoryItem;
	// 			})
	// 		);
	// 	}
	// 	return [];
	// };

	// let relativeHistory: RelativeActionHistoryItem[] = [];
	// $: {
	// 	getRelativeHistory($actionHistory).then((value) => (relativeHistory = value));
	// }
</script>

<div class="history">
	<Label text="History" />
	<div class="list">
		{#each $actionHistory as item}
			<div class="item">
				<div class="action">{item.action === 'copy' ? 'Copied' : 'Moved'}</div>
				<div class="from">{item.from}</div>
				<div class="preposition">to</div>
				<div class="to">{item.to}</div>
				<div class="undo">
					<Button variant="tool square" on:click={() => onUndo(item)}>Undo</Button>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.history {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		display: grid;
		grid-template-rows: auto 1fr;
		grid-template-columns: 1fr;
	}

	.list {
		display: grid;
		font-family: monospace;
		font-size: 0.8em;
		grid-template-columns: 1fr;
		grid-template-rows: auto;
		padding: 1em 0;
		row-gap: 0.5em;
		align-items: center;
		overflow-y: auto;
	}

	.item {
		display: grid;
		grid-template-columns: auto 1fr auto;
		grid-template-rows: auto auto auto;
		grid-template-areas: 'action from undo' 'action preposition undo' 'action to undo';
		row-gap: 0.25em;
		column-gap: 1em;
		word-break: break-all;
		padding: 0.5em;
	}

	.item:nth-child(odd) {
		background-color: var(--stsv-button__background-color--active);
	}

	.action {
		grid-area: action;
		align-self: center;
	}

	.from {
		grid-area: from;
	}

	.preposition {
		grid-area: preposition;
		padding-left: 3em;
	}

	.to {
		grid-area: to;
	}

	.undo {
		grid-area: undo;
		align-self: center;
	}
</style>
