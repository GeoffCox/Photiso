<script lang="ts">
	import { Button } from '@geoffcox/sterling-svelte';
	import { tick } from 'svelte';

	import { canAct } from './stores';
	import { getDispatcher } from './dispatcher';

	import LeftChevron from './icons/LeftChevronIcon.svelte';
	import RightChevron from './icons/RightChevronIcon.svelte';

	const dispatcher = getDispatcher();

	const onPrevious = async () => {
		await tick();
		await dispatcher.previousPhoto();
	};

	const onNext = async () => {
		await tick();
		await dispatcher.nextPhoto();
	};

	const onCopy = async () => {
		await tick();
		// await dispatcher.copyPhoto();
	};

	const onMove = async () => {
		await tick();
		// await dispatcher.movePhoto();
	};

</script>

<div class="photo-actions">
	<Button variant="circular secondary" on:click={onPrevious}><LeftChevron width="24px" height="24px" /></Button>
	<Button disabled={!$canAct} on:click={onCopy}>Copy</Button>
	<Button disabled={!$canAct} on:click={onMove} variant="colorful">Move</Button>
	<Button variant="circular secondary" on:click={onNext}><RightChevron width="24px" height="24px" /></Button>
</div>

<style>
	.photo-actions {
		display: grid;
		grid-template-columns: auto auto auto auto;
		grid-template-rows: auto;
		column-gap: 2em;
		padding: 0.5em;
		justify-content: center;
		justify-items: center;
		align-items: center;
	}
</style>
