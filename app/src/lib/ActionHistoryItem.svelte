<script lang="ts">
	import { DateTime } from 'luxon';
	import { onMount } from 'svelte';

	import CopyFileIcon from './icons/CopyFileIcon.svelte';
	import MoveFileIcon from './icons/MoveFileIcon.svelte';

	import type { ActionHistoryItem } from '../types';

	export let item: ActionHistoryItem | undefined = undefined;

	let baseDateTime = DateTime.now();

	onMount(() => {
		const timeout = setInterval(() => {
			baseDateTime = DateTime.now();
		}, 1000);

		return () => {
			clearInterval(timeout);
		};
	});
</script>

<div class="history-item">
	{#if item}
		{#if item.action === 'copy'}
			<CopyFileIcon width="24" height="24" />
			<div>copied</div>
		{:else}
			<MoveFileIcon width="24" height="24" />
			<div>moved</div>
		{/if}
		<div class="from">{item.from}</div>
		<div class="between-label">to</div>
		<div class="to">{item.to}</div>
		<div class="ago">
			{DateTime.fromMillis(item.createdEpoch).toRelative({ base: baseDateTime })}
		</div>
	{/if}
</div>

<style>
	.history-item {
		display: grid;
		grid-template-columns: auto auto auto auto auto;
		grid-template-rows: auto;
		align-items: center;
		justify-content: flex-start;
		justify-items: flex-start;
		padding: 1em;
		column-gap: 1em;
	}
</style>
