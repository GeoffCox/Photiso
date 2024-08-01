<script lang="ts">
	import { Label, Input } from '@geoffcox/sterling-svelte';

	export let name: string | undefined;
	export let extension: string | undefined;
	export let label: string;
</script>

<div class="filename">
	<Label text={label}>
		<Input bind:value={name} />
	</Label>
	<div class="extension">{extension || ''}</div>
</div>

<style>
	.filename {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: flex-end;
		column-gap: 0.25em;
	}
</style>
