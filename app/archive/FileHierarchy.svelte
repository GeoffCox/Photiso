<script lang="ts">
	import DirectoryIcon from '../src/lib/icons/FolderIcon.svelte';
	import PhotoFileIcon from '../src/lib/icons/PhotoIcon.svelte';

	export let path: string;

	$: split = path.split('/').filter(Boolean);

	$: dirs = split.slice(0, split.length - 1);
	$: fileName = split.length > 0 ? split[split.length - 1] : '';
</script>

<div class="hierarchy">
	{#each dirs as dir, index}
		<div style={`padding-left: calc(${index} * 0.5em);`} class="directory">
			<DirectoryIcon width="16px" height="16px" /><span>{dir}</span>
		</div>
	{/each}
	{#if fileName}
		<div style={`padding-left: calc(${dirs.length} * 0.5em);`} class="file">
			<PhotoFileIcon width="16px" height="16px" /><span>{fileName}</span>
		</div>
	{/if}
</div>

<style>
	.directory, .file {
		display: grid;
		grid-template-columns: auto auto;
		grid-template-rows: auto;
		justify-content: flex-start;
		justify-items: flex-start;
		align-items: center;
		column-gap: 0.25em;
	}
</style>
