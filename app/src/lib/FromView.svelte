<script lang="ts">
	import type { Photo } from '../types';
	import {
		appStatus,
		fromDirectory,
		nextPhoto,
		photo,
		photoSequence,
		previousPhoto
	} from './stores';
	import PhotoDisplay from './components/Photo.svelte';
	import PhotoInfoCard from './components/PhotoInfo.svelte';
	import { onMount, tick } from 'svelte';
	import { getDispatcher } from './dispatcher';
	import ColorSpinnerIcon from './icons/ColorSpinnerIcon.svelte';
	import PhotoButton from './components/PhotoButton.svelte';
	import Carousel from './components/Carousel.svelte';

	const dispatcher = getDispatcher();

	const onStart = async () => {
		dispatcher.startOrganizing();
	};

	const onDone = async () => {
		dispatcher.doneOrganizing();
	};

	const onPrevious = async () => {
		await tick();
		await dispatcher.previousPhoto();
	};

	const onNext = async () => {
		await tick();
		await dispatcher.nextPhoto();
	};

	const onInfo = async () => {};

	let photoAreaHeight = 0;

	$: console.log('photoAreaHeight:', photoAreaHeight);
</script>

<div class="from-view" bind:clientHeight={photoAreaHeight}>
	{#if $appStatus === 'waiting'}
		<div class="spinner">
			<ColorSpinnerIcon />
		</div>
	{:else}
		<div class="photo-area">
			<div class="navigation">
				<Carousel items={$photoSequence} on:previous={onPrevious} on:next={onNext} />
			</div>
			<div class="photo">
				<div class="photo-scale">
					<PhotoDisplay photo={$photo} />
				</div>
			</div>
			<PhotoInfoCard photo={$photo} rootDirectory={$fromDirectory} />
		</div>
	{/if}
</div>

<style>
	.from-view {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		justify-items: stretch;
		align-items: stretch;
		padding: 1em;
		/* Take up room so that photo-scale can absolute position rather than push out the height */
		height: 100%;
		box-sizing: border-box;
	}

	@keyframes spin {
		100% {
			transform: rotate(360deg);
		}
	}

	.spinner {
		width: 45px;
		height: 45px;
		animation: spin 4s linear infinite;
	}

	.navigation {
		justify-self: center;
	}

	.photo-area {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto 1fr auto;
		justify-items: stretch;
		align-items: stretch;
		overflow: hidden;
		row-gap: 1em;
		height: 100%;
		position: relative;
	}

	.navigation {
		align-self: top;
	}

	.photo {
		align-self: stretch;
		position: relative;
	}

	.photo-scale {
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		display: grid;
		place-content: stretch;
		place-items: stretch;
		overflow: hidden;
	}
</style>
