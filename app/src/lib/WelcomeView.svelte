<script lang="ts">
	import { quintOut } from "svelte/easing";
	import { crossfade, fade, fly } from "svelte/transition";
    import { createEventDispatcher } from "svelte";

	import { Button } from '@geoffcox/sterling-svelte';

	import NoPhotoIcon from '$lib/icons/NoPhotoIcon.svelte';
    import FromDirectoryPicker from '$lib/FromDirectoryPicker.svelte';
	import RootToDirectoryPicker from '$lib/RootToDirectoryPicker.svelte';

    const eventDispatcher = createEventDispatcher();

	export let crossFadeParts : ReturnType<typeof crossfade>;

	$: send = crossFadeParts[0];
	$: receive = crossFadeParts[1];

	const fromDirectoryKey = 'fromDirectory';
	const rootToDirectoryKey = 'rootToDirectory';

    const onStart = () => {
		eventDispatcher('start');
	};
</script>

<div class="welcome-view" out:fly={{y: '-150%', duration: 2000, easing: quintOut}}>
    <div class="intro">
        <NoPhotoIcon width="400px" height="auto" />
        <p>Photiso helps you organize your photos.</p>
        <p>
            For each photo in the <b>From folder</b>, you choose where to put it in the
            <b>To folder</b> and what to name the photo.
        </p>
        <p>
            In settings, you can choosea default folder and file name for each photo that includes
            when the photo was taken.
        </p>
    </div>
    <div
        class="from-directory"
        in:send={{ key: fromDirectoryKey }}
        out:receive={{ key: fromDirectoryKey }}
    >
        <FromDirectoryPicker />
    </div>
    <div
        class="to-root-directory"
        in:send={{ key: rootToDirectoryKey }}
        out:receive={{ key: rootToDirectoryKey }}
    >
        <RootToDirectoryPicker />
    </div>
    <div out:fade={{ duration: 500 }} class="start-action">
        <Button on:click={onStart} variant="colorful">Start Organizing!</Button>
    </div>
</div>

<style>
    .welcome-view {
		display: grid;
		column-gap: 1em;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto auto auto;
		align-content: center;
		align-items: center;
		grid-template-areas: 'intro intro' 'fromDir rootToDir' 'startAction startAction';
		row-gap: 2em;
	}

    .intro {
		grid-area: intro;
		justify-self: center;
		max-width: 500px;
		display: grid;
		justify-items: center;
		align-content: flex-start;
		align-items: flex-start;
	}

	.from-directory {
		grid-area: fromDir;
		align-self: center;
	}

	.to-root-directory {
		grid-area: rootToDir;
		align-self: center;
	}

	.start-action {
		grid-area: startAction;
		justify-self: center;
		font-size: 1.5em;
	}
</style>
