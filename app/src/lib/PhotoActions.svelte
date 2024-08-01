<script lang="ts">
	import { Button } from '@geoffcox/sterling-svelte';
	import { tick } from 'svelte';

	import { canAct, appStatus } from './stores';
	import { getDispatcher } from './dispatcher';

	const dispatcher = getDispatcher();

	const onCopy = async () => {
		await tick();
		await dispatcher.copyPhoto();
	};

	const onMove = async () => {
		await tick();
		await dispatcher.movePhoto();
	};

</script>

<div class="photo-actions">
	<Button disabled={!$canAct} on:click={onCopy}>Copy</Button>
	<Button disabled={!$canAct} on:click={onMove} variant="colorful">Move</Button>
</div>

<style>
	.photo-actions {
		display: grid;
		grid-template-columns: auto auto;
		grid-template-rows: auto;
		column-gap: 2em;
		padding: 0.5em;
		justify-content: flex-start;
		justify-items: flex-start;
		align-items: center;
	}
</style>
