<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { DateTime } from 'luxon';

	import type { ActionHistoryItem } from '../types';
	import type { PathApi } from './ipc.types';

	import { getPathApi } from './ipc.apis';

	import MoveFileIcon from './icons/MoveFileIcon.svelte';
	import CopyFileIcon from './icons/CopyFileIcon.svelte';

	// ----- Props ----- //

	export let history: ActionHistoryItem[];
	export let fromDirectory: string | undefined;
	export let rootToDirectory: string | undefined;

	export let showHeader = true;

	const eventDispatcher = createEventDispatcher();

	const onUndo = (item: ActionHistoryItem) => {
		eventDispatcher('undo', item);
	};

	type RelativeActionHistoryItem = ActionHistoryItem & { relativeFrom: string; relativeTo: string };

	const getRelativeHistoryItem = async (
		path: PathApi,
		item: ActionHistoryItem
	): Promise<RelativeActionHistoryItem> => {
		return {
			...item,
			relativeFrom: fromDirectory ? await path.relative(fromDirectory, item.from) : item.from,
			relativeTo: rootToDirectory ? await path.relative(rootToDirectory, item.to) : item.to
		};
	};

	const getRelativeActionHistory = async (items: ActionHistoryItem[]) => {
		if (items) {
			const path = getPathApi();
			return Promise.all(items.map(async (item) => await getRelativeHistoryItem(path, item)));
		}
		return [];
	};

	let relativeHistory: RelativeActionHistoryItem[] = [];

	$: {
		getRelativeActionHistory(history.toSorted((a, b) => b.createdEpoch - a.createdEpoch)).then(
			(value) => (relativeHistory = value)
		);
	}
</script>

<div class="action-history">
	{#if showHeader}
		<div></div>
		<div></div>
		<div class="column-header">{fromDirectory}</div>
		<div></div>
		<div class="column-header">{rootToDirectory}</div>
	{/if}
	{#each relativeHistory as item}
		{#if item.action === 'copy'}
			<CopyFileIcon width="24" height="24" />
			<div>copied</div>
		{:else}
			<MoveFileIcon width="24" height="24" />
			<div>moved</div>
		{/if}
		<div class="from">{item.relativeFrom}</div>
		<div class="between-label">to</div>
		<div class="to">{item.relativeTo}</div>
	{/each}
</div>

<style>
	.action-history {
		display: grid;
		grid-template-columns: auto auto auto auto auto;
		grid-template-rows: auto;
		align-items: center;
		justify-content: flex-start;
		justify-items: flex-start;
		padding: 1em;
		column-gap: 1em;
		row-gap: 0.5em;
	}

	.column-header {
		color: gray;
		font-size: 0.8em;
	}

	.between-label {
		color: grey;
	}

	.ago {
		color: gray;
		font-size: 0.8em;
		font-variant: small-caps;
	}
</style>
