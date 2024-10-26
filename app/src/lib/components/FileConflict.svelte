<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Link } from '@geoffcox/sterling-svelte';
	import ConflictIcon from '$lib/icons/ConflictIcon.svelte';

	export let noConflictFileNameSuffix: string | undefined;
	export let willAutoResolve: boolean = false;

	const dispatch = createEventDispatcher();
	const onResolve = () => {
		dispatch('resolve', { noConflictFileNameSuffix });
	};
</script>

<div class="file-conflict" class:warning={willAutoResolve} class:hidden={noConflictFileNameSuffix == undefined}>
	<ConflictIcon/>
	<span>A file with this name already exists.</span>
	{#if willAutoResolve}
		<span>The file will automatically have {noConflictFileNameSuffix} appended.</span>
	{:else}
		<Link href="#" variant="danger" on:click={onResolve}>Append <i>{noConflictFileNameSuffix}</i> to the file name.</Link>
	{/if}
</div>

<style>
	.file-conflict {
		background-color: var(--stsv-status--danger__background-color);
		color: var(--stsv-status--danger__color);
		font: inherit;
		font-size: 0.8em;
		padding: 0.25em;
		line-height: 1.4em;
		position: relative;
		display: flex;
		align-items: center;
		column-gap: 0.5em;
	}

	.file-conflict.warning {
		background-color: var(--stsv-status--warning__background-color);
		color: var(--stsv-status--warning__color);
	}

	.file-conflict.hidden {
		opacity: 0;
	}

	.file-conflict :global(svg) {
		width: 2em;
		height: 2em;
	}

	.file-conflict :global(a.danger),
	.file-conflict :global(a.danger:hover),
	.file-conflict :global(a.danger:active),
	.file-conflict :global(a.danger:visited) {
		color: var(--stsv-status--danger__color);
		border-bottom-color: var(--stsv-status--danger__color);
	}
</style>
