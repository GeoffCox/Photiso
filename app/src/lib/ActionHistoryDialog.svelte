<script lang="ts">
	import type { ActionHistoryItem } from '../types';
	import { Button, Dialog } from '@geoffcox/sterling-svelte';
	import { actionHistory, fromDirectory, rootToDirectory } from './stores';
	import { getDispatcher } from './dispatcher';
	import { DateTime } from 'luxon';
	import { getPathApi } from './ipc.apis';
	import type { PathApi } from './ipc.types';
	import { onMount } from 'svelte';
	import ActionHistoryList from './ActionHistoryList.svelte';

	export let open = false;

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
		{#if $actionHistory.length === 0}
			<div class="empty-history">o_0 Nothing left to undo here.</div>
		{:else}
			<ActionHistoryList history={$actionHistory} fromDirectory={$fromDirectory} rootToDirectory={$rootToDirectory} />
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
</style>
