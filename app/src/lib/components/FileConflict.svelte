<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Link } from '@geoffcox/sterling-svelte';

	export let conflictFileName : string | undefined;
	export let noConflictFileName: string | undefined;
	export let extension: string;

	const dispatch = createEventDispatcher();
	const onFileNameSuggestion = () => {
		dispatch('resolve', { noConflictFileName });
	};
</script>

{#if conflictFileName}
{#if noConflictFileName}
	<div class="file-conflict">
		<div>File '{conflictFileName}{extension}' already exists.</div>
		<div>You'll need to change the name to resolve the conflict.
		<Link
			href="#"
			on:click={() => onFileNameSuggestion()}
			>Change to '{noConflictFileName}{extension}'</Link
		></div> 
	</div>
	{:else}
	<div class="file-conflict">
		This file {conflictFileName} already exists. You'll need change the name to resolve the conflict.
	</div>
	{/if}
{/if}

<style>
	.file-conflict {
		background-color: var(--stsv-status--danger__background-color);
		color: var(--stsv-status--danger__color);
		border-color: var(--stsv-status--danger__color);
		border-width: 1px;
		border-style: solid;
		font-family: inherit;
		font-size: 0.8em;
		padding: 0.5em;
		line-height: 1.4em;
	}
</style>
