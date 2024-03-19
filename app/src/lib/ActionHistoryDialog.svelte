<script lang="ts">
	import type { ActionHistoryItem } from '../types';
	import { Button, Dialog, Link } from '@geoffcox/sterling-svelte';
	import { actionHistory, fromDirectory, toRootDirectory } from './stores';
	import FileHierarchy from './FileHierarchy.svelte';
	import { getDispatcher } from './dispatcher';
	import { DateTime } from 'luxon';
	import { getPathApi } from './ipc.apis';

	export let open = false;

	const getRelativeHistoryItem = async (item: ActionHistoryItem) => {
		const path = getPathApi();

		const fromPath = await path.parse(item.from);
		const toPath = await path.parse(item.to);

		return {
			createdEpoch: item.createdEpoch,
			action: item.action,
			from: $fromDirectory ? await path.relative($fromDirectory, fromPath.base) : fromPath,
			to: $toRootDirectory ? await path.relative($toRootDirectory, toPath.base) : toPath
		};
	};

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
		{#each $actionHistory as historyItem}
			<div class="history-item">
				<div class="ago">{DateTime.fromMillis(historyItem.createdEpoch).toRelative()}</div>
				<div class="from"><FileHierarchy path={historyItem.from} /></div>
				<div class="between-label">to</div>
				<div class="to"><FileHierarchy path={historyItem.to} /></div>
				<div class="undo">
					<Link href="#" on:click={() => onUndo(historyItem)}
						>{historyItem.action === 'move' ? ' undo move' : 'undo copy'}</Link
					>
				</div>
			</div>
		{/each}
	</div>
	<div slot="footer">
		<div class="actions">
			<Button on:click={onOk}>OK</Button>
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

	.history-item {
		display: grid;
		grid-template-columns: auto auto auto auto;
		grid-template-rows: auto;
		align-items: flex-start;
		padding: 1em;
		border-bottom: 1px solid grey;
		border-top: 1px solid transparent;
		column-gap: 1em;
	}

	.history-item:first-child {
		border-top: 1px solid grey;
	}

	.between-label,
	.undo {
		align-self: center;
	}

	.from :global(.file),
	.to :global(.file) {
		color: var(--stsv-button--colorful__background-color);
	}
</style>
