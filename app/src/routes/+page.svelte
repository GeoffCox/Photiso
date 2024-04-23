<script lang="ts">
	import { crossfade, fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

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
		userSettings,
		appStep,
		appStatus
	} from '$lib/stores';
	import { getDispatcher } from '$lib/dispatcher';

	import Header from '$lib/Header.svelte';
	import WelcomeView from '$lib/WelcomeView.svelte';
	import OrganizeView from '$lib/OrganizeView.svelte';
	import DoneView from '$lib/DoneView.svelte';
	import { Button } from '@geoffcox/sterling-svelte';
	import Footer from '$lib/Footer.svelte';

	const dispatcher = getDispatcher();

	// ----- State ----- //
	// welcome -> starting
	// starting -> ready
	// starting -> done
	// ready -> acting
	// acting -> loading
	// loading -> ready
	// loading -> done

	const onNextStep = () => {
		switch ($appStep) {
			case 'welcome':
				appStep.set('organizing');
				break;
			case 'organizing':
				appStep.set('welcome');
				break;
		}
	};

	const onNextStatus = () => {
		switch ($appStatus) {
			case 'idle':
				appStatus.set('loading');
				break;
			case 'loading':
				appStatus.set('busy');
				break;
			case 'busy':
				appStatus.set('idle');
				break;
		}
	};

	// ----- Store Logging ----- //

	$: console.log('$appStep', $appStep);
	$: console.log('$appStatus', $appStatus);
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

	// ----- Animation -----//

	const crossfadeParts = crossfade({
		duration: 1500,
		easing: quintOut
	});

	const [send, receive] = crossfadeParts;

	const fromDirectoryKey = 'fromDirectory';
	const rootToDirectoryKey = 'rootToDirectory';
</script>

<div class="root">
	<div class="main-view">
		<div class="header">
		</div>
		{#if $appStep === 'welcome'}
			<div class="welcome-step" transition:fade={{duration:1000}}>
				<WelcomeView crossFadeParts={[send, receive]} />
			</div>
		{:else if $appStep === 'organizing'}
			<div class="organize-step" transition:fade={{duration:500}}>
				<OrganizeView crossFadeParts={[send, receive]} on:introend={() => {}} />
			</div>
		{/if}
		<div class="footer">
			{#if $appStep === 'organizing'}
			<Footer />
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
	}

	/* ----- Split view  ----- */

	.main-view {
		display: grid;
		column-gap: 1em;
		grid-template-columns: 1fr;
		grid-template-rows: auto 1fr auto;
		grid-template-areas: 'header' 'body' 'footer';
		justify-items: stretch;
	}

	.header {
		grid-area: header;
		height: 20px;
	}

	.welcome-step,
	.organize-step {
		grid-area: body;
		padding: 1em;
	}

	.footer {
		grid-area: footer;
		min-height: 3em;
	}
</style>
