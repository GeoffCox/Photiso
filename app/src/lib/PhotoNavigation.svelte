<script lang="ts">
	import { getDispatcher } from "./dispatcher";

	import { Button } from "@geoffcox/sterling-svelte";

    import LeftChevron from './icons/LeftChevronIcon.svelte';
	import RightChevron from './icons/RightChevronIcon.svelte';

	const dispatcher = getDispatcher();

    const onPrevious = async () => {
		await dispatcher.previousPhoto();
	};

	const onNext = async () => {
		await dispatcher.nextPhoto();
	};

</script>
<div class='photo-navigation'>
    <Button variant="circular secondary" on:click={onPrevious}><LeftChevron width="24px" height="24px" /></Button>
	<Button variant="circular secondary" on:click={onNext}><RightChevron width="24px" height="24px" /></Button>
</div>

<style>
    .photo-navigation {
        display: grid;
        grid-template-columns: auto auto;
		grid-template-rows: 50px;
		justify-content: center;
        column-gap: 1em;
		overflow: hidden;
    }

	.photo-navigation :global(button) {
		display: grid;
		place-content: center;
		place-items: center;
		width: 48px;
		height: 48px;
	}

	.photo-navigation :global(button:last-child svg) {
		margin-right: -4px;	
	}

	.photo-navigation :global(button:first-child svg) {
		margin-left: -4px;	
	}


</style>