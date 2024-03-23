<script lang="ts">
	import { Button } from '@geoffcox/sterling-svelte';
	import NoMorePhotosIcon from './icons/NoMorePhotosIcon.svelte';
	import { createEventDispatcher } from 'svelte';
	import { getDispatcher } from './dispatcher';
	import { appStep } from './stores';

	const dispatcher = getDispatcher();

    const onRestart = () => {
        appStep.set('welcome');
    }
</script>

<div class="done-view">
	<NoMorePhotosIcon />
	<div>Looks like you're done organizing photos.</div>
	<div>There's nothing but empty space here.</div>
	<div class="actions">
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
