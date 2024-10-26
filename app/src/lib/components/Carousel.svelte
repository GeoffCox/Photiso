<script lang="ts">
	import { type Photo } from '../../types';

	import { createEventDispatcher } from 'svelte';

	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import PhotoButton from './PhotoButton.svelte';

	export let items: (Photo | undefined)[] = [];

	let animating = false;
	let direction = 'none';

	const onOutroStart = () => {
		animating = true;
	};

	const onOutroEnd = () => {
		animating = false;
	};

	const dispatcher = createEventDispatcher();

	const onNext = () => {
		if (!animating) {
			direction = 'right';
			dispatcher('next');
		}
	};

	const onPrevious = () => {
		if (!animating) {
			direction = 'left';
			dispatcher('previous');
		}
	};

	const movePrevious = () => {
		onPrevious();
	};

	const moveNext = () => {
		onNext();
	};

	const onClickItem = (index: number) => {
		if (index === 0) {
			movePrevious();
		} else if (index === 2) {
			moveNext();
		}
	};

	$: inX = direction === 'right' ? 200 : -200;
	$: outX = direction === 'right' ? -200 : 200;
</script>

<div class="carousel">
	{#each items as item, index (item?.file ? `${item.file}` : `empty ${index}`)}
		<div
			class="item"
			class:left={index === 0}
			class:middle={index === 1}
			class:right={index === 2}
			in:fly={{ x: index === 2 ? 200 : index === 0 ? -200 : 0, duration: 250 }}
			out:fly={{ x: index === 2 ? 200 : index === 0 ? -200 : 0, duration: 250 }}
			animate:flip={{ duration: 250 }}
			on:outrostart={onOutroStart}
			on:outroend={onOutroEnd}
		>
			<PhotoButton photo={item} on:click={() => onClickItem(index)} />
		</div>
	{/each}
</div>

<style>
	.carousel {
		position: relative;
		height: 120px;
		width: 600px;
	}

	.item {
		position: absolute;
		width: 200px;
	}

	.left {
		left: 0;
	}

	.middle {
		left: 50%;
		transform: translateX(-50%);
	}

	.right {
		right: 0;
	}
</style>
