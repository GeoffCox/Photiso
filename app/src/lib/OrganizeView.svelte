<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { crossfade, fly } from 'svelte/transition';

	import { photo } from './stores';

	import FromDirectoryPicker from '$lib/FromDirectoryPicker.svelte';
	import RootToDirectoryPicker from '$lib/RootToDirectoryPicker.svelte';

	import PhotoImage from '$lib/PhotoCard.svelte';
	import PhotoInfoCard from '$lib/PhotoInfoCard.svelte';

	import RelativeToDirectoryPicker from '$lib/RelativeToDirectoryPicker.svelte';
	import ToFileNamePicker from '$lib/ToFileNamePicker.svelte';
	import PhotoActions from '$lib/PhotoActions.svelte';

	export let crossFadeParts: ReturnType<typeof crossfade>;

	$: send = crossFadeParts[0];
	$: receive = crossFadeParts[1];

	const fromDirectoryKey = 'fromDirectory';
	const rootToDirectoryKey = 'rootToDirectory';
</script>

<div class="organize-view">
	<div
		class="display-from-directory"
		in:send={{ key: fromDirectoryKey }}
		out:receive={{ key: fromDirectoryKey }}
	>
		<FromDirectoryPicker readonly />
	</div>
	<div
		class="display-to-root-directory"
		in:send={{ key: rootToDirectoryKey }}
		out:receive={{ key: rootToDirectoryKey }}
		on:introend
	>
		<RootToDirectoryPicker readonly />
	</div>
	<div class="from-pane" in:fly={{ x: '-50%', duration: 2000, easing: quintOut }}>
		<PhotoImage photo={$photo} />
	</div>
	<div class="to-pane" in:fly={{ x: '150%', duration: 2000, easing: quintOut }}>
		<RelativeToDirectoryPicker />
		<div>
			<ToFileNamePicker />
		</div>
	</div>
	<div class="actions" in:fly={{ y: '150%', duration: 2000, easing: quintOut }}>
		<PhotoActions />
	</div>
</div>

<style>
	.organize-view {
		display: grid;
		column-gap: 1em;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto 1fr auto;
		grid-template-areas: 'displayFromDir displayRootToDir' 'fromPane toPane' 'actions actions';
		align-self: center;
	}

	.display-from-directory {
		grid-area: displayFromDir;
	}

	.display-to-root-directory {
		grid-area: displayRootToDir;
	}

	.from-pane {
		grid-area: fromPane;
		padding: 2em;
		display: grid;
		grid-template-rows: auto auto;
		justify-content: stretch;
		justify-items: center;
		align-content: flex-start;
		align-items: flex-start;
		row-gap: 1em;
	}

	.from-pane :global(:nth-child(2)) {
		align-self: flex-start;
		justify-self: center;
	}

	.to-pane {
		grid-area: toPane;
		display: grid;
		grid-template-rows: auto;
		row-gap: 2em;
		padding: 2em;
		justify-items: stretch;
		align-content: flex-start;
	}

	.actions {
		grid-area: actions;
		justify-self: center;
		display: grid;
		justify-items: center;
	}
</style>
