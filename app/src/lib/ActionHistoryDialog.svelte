<script lang="ts">
	import type { ActionHistoryItem } from '../types';
	import { Button, Dialog } from '@geoffcox/sterling-svelte';
	import { actionHistory, fromDirectory, rootToDirectory } from './stores';
	import { getDispatcher } from './dispatcher';
	import ActionHistoryList from './ActionHistoryList.svelte';

	export let open = false;

	const dispatcher = getDispatcher();
	const onUndo = async (event: CustomEvent<ActionHistoryItem>) => {
		const undoAction = event.detail;
		undoAction && (await dispatcher.undoAction(undoAction.createdEpoch));
	};

	const onOk = () => {
		open = false;
	};
</script>

<Dialog bind:open on:close on:cancel>
	<div slot="title">Copy/Move History</div>
	<div class="body" slot="body">
		<ActionHistoryList
			history={$actionHistory}
			fromDirectory={$fromDirectory}
			rootToDirectory={$rootToDirectory}
			on:undo={onUndo}
		/>
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
