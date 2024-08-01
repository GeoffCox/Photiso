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
				<span>{item.action === 'copy' ? 'Copied' : 'Moved'} </span>
				<span>{item.from}</span>
				<span> to </span>
				<span>{item.to}</span>
				<Button variant="tool square" on:click={() => onUndo(item)}>Undo</Button>
			</div>
		{/each}
	</div>
</div>

<style>
	.list {
		display: grid;
		font-family: monospace;
		font-size: 0.8em;
		grid-template-columns: 1fr;
		grid-template-rows: auto;
		padding: 1em 0;
		align-items: center;
		height: 75px;
		overflow-y: auto;
	}

	.item {	
		word-break: break-all;
	}
</style>
