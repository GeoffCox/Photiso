<script lang="ts">
	import { Button } from '@geoffcox/sterling-svelte';

	import {
		toDirectory,
		toFile,
		toFileName,
		toRelativeDirectory,
		noConflictToFileName,
		toRootDirectory,
		photo,
		recentToDirectories,
		suggestedToFileNames,
		fromDirectory,
		userSettings
	} from '$lib/stores';
	import { getDispatcher } from '$lib/dispatcher';

	import Header from './Header.svelte';

	import FromDirectoryPicker from '$lib/FromDirectoryPicker.svelte';
	import ToRootDirectoryPicker from '$lib/ToRootDirectoryPicker.svelte';

	import PhotoInfoCard from '$lib/PhotoInfoCard.svelte';

	import ToRelativeDirectoryPicker from '$lib/ToRelativeDirectoryPicker.svelte';
	import ToFileNamePicker from '$lib/ToFileNamePicker.svelte';
	import PhotoActions from '$lib/PhotoActions.svelte';
	import { crossfade, fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import PhotoImage from '$lib/PhotoImage.svelte';

	const dispatcher = getDispatcher();

	// ----- State ----- //
	let visualState: 'welcome' | 'starting' | 'started' | 'loading' | 'ready' | 'acting' | 'done' =
		'welcome';

	// ----- Store Logging ----- //

	$: console.log('$userSettings', $userSettings);

	$: console.log('$fromDirectory', $fromDirectory);
	$: console.log('$toRootDirectory', $toRootDirectory);

	$: console.log('$photo', $photo);

	$: console.log('$toRelativeDirectory', $toRelativeDirectory);
	$: console.log('$toFileName', $toFileName);

	$: console.log('$toDirectory', $toDirectory);
	$: console.log('$toFile', $toFile);
	$: console.log('$noConflictDestinationFileName', $noConflictToFileName);

	$: console.log('$recentDirectories', $recentToDirectories);
	$: console.log('$suggestedDestinationFileNames', $suggestedToFileNames);

	// ----- Visual Handlers -----//

	const onStart = () => {
		visualState = 'starting';
		dispatcher.startOrganizing();
	};

	const onStarted = () => {
		visualState = 'started';
	};

	$: console.log(visualState);

	// ----- Animation -----//

	const [send, receive] = crossfade({
		duration: 1500,
		easing: quintOut
	});

	const fromDirectoryKey = 'fromDirectory';
	const toRootDirectoryKey = 'toRootDirectory';
	const photoKey = 'photo';
	const infoKey = 'info';

	$: starting = visualState === 'starting';
	$: started = visualState === 'started';
</script>

<div class="root">
	<div class="main-view">
		<div class="header">
			<Header />
		</div>
		<div class="split-view">
			{#if starting || started}
				<div
					class="display-from-directory"
					in:send={{ key: fromDirectoryKey }}
					out:receive={{ key: fromDirectoryKey }}
				>
					<FromDirectoryPicker readonly />
				</div>
				<div
					class="display-to-root-directory"
					in:send={{ key: toRootDirectoryKey }}
					out:receive={{ key: toRootDirectoryKey }}
					on:introend={onStarted}
				>
					<ToRootDirectoryPicker readonly />
				</div>
				<div class="organize-view">
					<div class="from-pane" in:fly={{ x: '-50%', duration: 2000, easing: quintOut }}>
						<PhotoImage photo={$photo} />
						<PhotoInfoCard photo={$photo} />
					</div>
					<div class="to-pane" in:fly={{ x: '150%', duration: 2000, easing: quintOut }}>
						<ToRelativeDirectoryPicker />
						<div>
							<ToFileNamePicker />
						</div>
						<PhotoActions />
					</div>
				</div>
			{:else}
				<div />
				<div />
				<div class="welcome-view">
					<div
						class="from-directory"
						in:send={{ key: fromDirectoryKey }}
						out:receive={{ key: fromDirectoryKey }}
					>
						<FromDirectoryPicker />
					</div>
					<div
						class="to-root-directory"
						in:send={{ key: toRootDirectoryKey }}
						out:receive={{ key: toRootDirectoryKey }}
					>
						<ToRootDirectoryPicker />
					</div>
					<div out:fade={{ duration: 500 }} class="start-action">
						<Button on:click={onStart}>Start Organizing</Button>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.root {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		place-content: stretch;
		place-items: stretch;
		padding: 1em;
	}

	.main-view {
		display: grid;
		column-gap: 1em;
		grid-template-columns: 1fr;
		grid-template-rows: auto 1fr;
	}

	/* ----- Split view  ----- */

	.split-view {
		display: grid;
		column-gap: 1em;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto 1fr;
		grid-template-areas: 'displayFromDir displayToRootDir' 'organize organize';
	}

	.display-from-directory {
		grid-area: displayFromDir;
	}

	.display-to-root-directory {
		grid-area: displayToRootDir;
	}

	/* ----- Welcome view  ----- */
	.welcome-view {
		display: grid;
		column-gap: 1em;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto auto;
		align-content: center;
		align-items: center;
		grid-template-areas: 'fromDir toRootDir' 'startAction startAction';
		grid-area: organize;
	}

	.from-directory {
		grid-area: fromDir;
		align-self: center;
	}

	.to-root-directory {
		grid-area: toRootDir;
		align-self: center;
	}

	.start-action {
		grid-area: startAction;
		justify-self: center;
	}

	/* ----- Split view  ----- */

	.organize-view {
		display: grid;
		column-gap: 1em;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr;
		grid-template-areas: 'fromPane toPane';
		grid-area: organize;
	}

	.from-pane {
		grid-area: fromPane;
		padding: 2em;
		display: grid;
		grid-template-rows: auto auto;
		justify-content: stretch;
		justify-items: stretch;
		align-content: flex-start;
		align-items: flex-start;
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
</style>
