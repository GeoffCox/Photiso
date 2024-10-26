<script lang="ts">
	import { flip } from 'svelte/animate';
	import { sineInOut } from 'svelte/easing';
	import { crossfade, fly } from 'svelte/transition';

	const items = [
		{
			name: 'item 1',
			color: 'red'
		},
		{
			name: 'item 2',
			color: 'blue'
		},
		{
			name: 'item 3',
			color: 'green'
		},
		{
			name: 'item 4',
			color: 'yellow'
		},
		{
			name: 'item 5',
			color: 'purple'
		},
		{
			name: 'item 6',
			color: 'orange'
		},
		{
			name: 'item 7',
			color: 'pink'
		},
		{
			name: 'item 8',
			color: 'brown'
		},
		{
			name: 'item 9',
			color: 'teal'
		},
		{
			name: 'item 10',
			color: 'violet'
		}
	];

	let currentIndex = 0;
	let moving = 'none';

	$: left = currentIndex === 0 ? undefined : items[currentIndex - 1];
	$: middle = items[currentIndex];
	$: right = currentIndex === items.length - 1 ? undefined : items[currentIndex + 1];

	$: carouselItems = [left, middle, right];

	$: console.log(moving);

	const moveLeft = () => {
		if (moving === 'none') {
			moving = 'left';
			currentIndex = Math.max(0, currentIndex - 1);
		}
	};

	const moveRight = () => {
		if (moving === 'none') {
			moving = 'right';
			currentIndex = Math.min(items.length - 1, currentIndex + 1);
		}
	};

	const moveToItem = (item: any) => {
		if (item) {
			if (item === left) {
				moveLeft();
			} else if (item === right) {
				moveRight();
			}
		}
	};

	$: console.log(...carouselItems);
</script>

<div class="carousel">
	{#each carouselItems as item (item?.name ?? 'empty')}
		{@const key = item?.name ?? 'empty'}
		<button
			class="item"
			class:left={item === left}
			class:middle={item === middle}
			class:right={item === right}
			style="background-color: {item?.color ?? 'black'}"
			on:click={() => moveToItem(item)}
			in:fly={{ x: item === right ? 100 : -100, duration: 500, easing: sineInOut }}
			out:fly={{ x: item === left ? -100 : 100, duration: 500, easing: sineInOut }}
			on:introend={() => (moving = 'none')}
			on:outroend={() => (moving = 'none')}
			animate:flip={{ duration: 500, easing: sineInOut }}
		>
			{item?.name}
		</button>
	{/each}
	<!-- {#if left}
		{@const key = left.name}
		<button
			class="item left"
			style="background-color: {left.color}"
			on:click={moveLeft}
			in:receive={{ key }}
			out:send={{ key }}
		>
			{left.name}
		</button>
	{/if}
	{#if middle}
		{@const key = middle.name}
		<button
			class="item middle"
			style="background-color: {middle.color}"
			in:receive={{ key }}
			out:send={{ key }}
		>
			{middle.name}
		</button>
	{/if}
	{#if right}
		{@const key = right.name}
		<button
			class="item right"
			style="background-color: {right.color}"
			on:click={moveRight}
			in:receive={{ key }}
			out:send={{ key }}
		>
			{right.name}
		</button>
	{/if} -->
</div>

<style>
	.carousel {
		position: relative;
		height: 100px;
		width: 300px;
	}

	.item {
		position: absolute;
		min-width: 100px;
		min-height: 100px;
	}

	.left {
		left: 0;
		z-index: 1;
	}

	.left.movingLeft {
		left: -100px;
	}

	.middle {
		left: 50%;
		transform: translateX(-50%);
	}

	.right {
		right: 0;
		z-index: 1;
	}

	.right.movingRight {
		right: -100px;
	}
</style>
