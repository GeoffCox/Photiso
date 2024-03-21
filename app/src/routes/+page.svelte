<script lang="ts">
	import { crossfade, fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	import { Button } from '@geoffcox/sterling-svelte';

	import {
		toDirectory,
		toFile,
		toFileName,
		relativeToDirectory,
		noConflictToFileName,
		rootToDirectory,
		photo,
		recentRelativeDirectories,
		fromDirectory,
		userSettings
	} from '$lib/stores';
	import { getDispatcher } from '$lib/dispatcher';

	import Header from './Header.svelte';
	import NoPhotoIcon from '$lib/icons/NoPhotoIcon.svelte';

	import FromDirectoryPicker from '$lib/FromDirectoryPicker.svelte';
	import RootToDirectoryPicker from '$lib/RootToDirectoryPicker.svelte';

	import PhotoImage from '$lib/PhotoImage.svelte';
	import PhotoInfoCard from '$lib/PhotoInfoCard.svelte';

	import RelativeToDirectoryPicker from '$lib/RelativeToDirectoryPicker.svelte';
	import ToFileNamePicker from '$lib/ToFileNamePicker.svelte';
	import PhotoActions from '$lib/PhotoActions.svelte';
	import LastActionBanner from '$lib/LastActionBanner.svelte';
	import WelcomeView from '$lib/WelcomeView.svelte';
	import OrganizeView from '$lib/OrganizeView.svelte';
	import DoneView from '$lib/DoneView.svelte';

	const dispatcher = getDispatcher();

	// ----- State ----- //
	let visualState: 'welcome' | 'starting' | 'started' | 'loading' | 'ready' | 'acting' | 'done' =
		'welcome';

	// ----- Store Logging ----- //

	$: console.log('$userSettings', $userSettings);

	$: console.log('$fromDirectory', $fromDirectory);
	$: console.log('$rootToDirectory', $rootToDirectory);

	$: console.log('$photo', $photo);

	$: console.log('$relativeToDirectory', $relativeToDirectory);
	$: console.log('$toFileName', $toFileName);

	$: console.log('$toDirectory', $toDirectory);
	$: console.log('$toFile', $toFile);
	$: console.log('$noConflictDestinationFileName', $noConflictToFileName);

	$: console.log('$recentDirectories', $recentRelativeDirectories);

	// ----- Visual Handlers -----//

	const onStart = () => {
		visualState = 'starting';
		dispatcher.startOrganizing();
		dispatcher.saveAppState();
	};

	const onStarted = () => {
		visualState = 'started';
	};

	const onRestart = () => {
		visualState = 'welcome';
	}

	$: {
		if (visualState === 'started' && $photo !== undefined) {
			visualState = 'ready';
		}
	}

	$: {
		if (visualState !== 'welcome' && visualState !== 'starting' && $photo === undefined) {
			visualState = 'done';
		}
	}

	$: console.log(visualState);

	// ----- Animation -----//

	const crossfadeParts = crossfade({
		duration: 1500,
		easing: quintOut
	});

	const [send, receive] = crossfadeParts;

	const fromDirectoryKey = 'fromDirectory';
	const rootToDirectoryKey = 'rootToDirectory';

	$: starting = visualState === 'starting';
	$: started = visualState === 'started';
</script>

<div class="root">
	<div class="main-view">
		<div class="header">
			<Header />
		</div>
		{#if starting || started || visualState === 'ready'}
			<div class="organize-step">
				<OrganizeView crossFadeParts={[send, receive]} on:introend={onStarted} />
			</div>
		{:else if visualState === 'welcome'}
			<div class="welcome-step">
				<WelcomeView on:start={onStart} crossFadeParts={[send, receive]} />
			</div>
		{:else if visualState === 'done'}
			<div class="done-step">
				<DoneView on:restart={onRestart} />
			</div>
		{/if}
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

	/* ----- Split view  ----- */

	.main-view {
		display: grid;
		column-gap: 1em;
		grid-template-columns: 1fr;
		grid-template-rows: auto 1fr;
		grid-template-areas: 'header' 'organize';
		justify-items: stretch;
	}

	.header {
		grid-area: header;
	}

	.welcome-step,
	.organize-step,
	.done-step {
		grid-area: organize;
	}
</style>
