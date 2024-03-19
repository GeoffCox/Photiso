<script lang="ts">
	import type { ActionHistoryItem } from '../types';
	import { Button, Dialog } from '@geoffcox/sterling-svelte';
	import { actionHistory, fromDirectory, toRootDirectory } from './stores';
	import { getDispatcher } from './dispatcher';
	import { DateTime } from 'luxon';
	import { getPathApi } from './ipc.apis';
	import type { PathApi } from './ipc.types';
	import CopyFileIcon from './icons/CopyFileIcon.svelte';
	import MoveFileIcon from './icons/MoveFileIcon.svelte';
	import UndoIcon from './icons/UndoIcon.svelte';
	import { onMount } from 'svelte';

	export let open = false;

	const getRelativeHistoryItem = async (
		path: PathApi,
		item: ActionHistoryItem
	): Promise<ActionHistoryItem> => {
		const result = {
			createdEpoch: item.createdEpoch,
			action: item.action,
			from: $fromDirectory ? await path.relative($fromDirectory, item.from) : item.from,
			to: $toRootDirectory ? await path.relative($toRootDirectory, item.to) : item.to
		};

		console.log('getRelativeHistoryItem', item, result);
		return result;
	};

	const getRelativeActionHistory = async (items: ActionHistoryItem[]) => {
		if (items) {
			const path = getPathApi();
			return Promise.all(items.map(async (item) => await getRelativeHistoryItem(path, item)));
		}
		return [];
	};

	let relativeActionHistory: ActionHistoryItem[] = [];

	$: {
		getRelativeActionHistory($actionHistory).then((value) => (relativeActionHistory = value));
	}

	let baseDateTime = DateTime.now();

	onMount(() => {
		const timeout = setInterval(() => {
			baseDateTime = DateTime.now();
		}, 1000);

		return () => {
			clearInterval(timeout);
		};
	});

	const dispatcher = getDispatcher();
	const onUndo = (historyItem: ActionHistoryItem) => {
		dispatcher.undoAction(historyItem.createdEpoch);
	};

	const onOk = () => {
		open = false;
	};
</script>

<Dialog bind:open on:close on:cancel>
	<div slot="title">Copy/Move History</div>
	<div class="body" slot="body">
		{#if relativeActionHistory.length === 0}
			<div class="empty-history">o_0 Nothing left to undo here.</div>
		{:else}
			<div class="history">
				<div></div>
				<div></div>
				<div class="column-header">{$fromDirectory}</div>
				<div></div>
				<div class="column-header">{$toRootDirectory}</div>
				<div></div>
				<div></div>
				{#each relativeActionHistory as historyItem}
					{#if historyItem.action === 'copy'}
						<CopyFileIcon width="24" height="24" />
						<div>copied</div>
					{:else}
						<MoveFileIcon width="24" height="24" />
						<div>moved</div>
					{/if}
					<div class="from">{historyItem.from}</div>
					<div class="between-label">to</div>
					<div class="to">{historyItem.to}</div>
					<div class="ago">
						{DateTime.fromMillis(historyItem.createdEpoch).toRelative({ base: baseDateTime })}
					</div>
					<div class="undo-action">
						{#if historyItem.action === 'move'}
							<Button on:click={() => onUndo(historyItem)}
								><UndoIcon width="24px" height="24px" />Undo</Button
							>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
	<div slot="footer">
		<div class="actions">
			<Button on:click={onOk}>Close</Button>
		</div>
	</div>
</Dialog>

<style>
	.body {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		row-gap: 1em;
		overflow-y: auto;
		max-height: 500px;
	}

	.empty-history {
		font-size: 1.5em;
	}

	.history {
		display: grid;
		grid-template-columns: auto auto auto auto auto auto auto;
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

	.from :global(.file),
	.to :global(.file) {
		color: var(--stsv-button--colorful__background-color);
	}
</style>
