<script lang="ts">
	import { Button } from '@geoffcox/sterling-svelte';
	import NoMorePhotosIcon from './icons/NoMorePhotosIcon.svelte';
	import { createEventDispatcher } from 'svelte';
	import { getDispatcher } from './dispatcher';
	import { appStep } from './stores';
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	const dispatcher = getDispatcher();

	const onRestart = () => {
		appStep.set('welcome');
	};
</script>

<div class="done-view">
	<div transition:fly={{ y: '-150%', duration: 2000, easing: quintOut }}>
		<NoMorePhotosIcon />
	</div>
	<div transition:fade={{duration: 500}}>Looks like you're done organizing photos.</div>
	<div transition:fade={{duration: 500}}>There's nothing but empty space here.</div>
	<div class="actions" transition:fly={{ y: '150%', duration: 2000, easing: quintOut }}>
		<Button on:click={onRestart} variant="colorful">Start Over</Button>
	</div>
</div>

<style>
	.done-view {
		display: grid;
		grid-template-rows: 1fr auto auto auto;
		justify-items: center;
		font-size: 2em;
	}

	.actions {
		margin-top: 1em;
	}
</style>
