<script lang="ts">
	import FromView from '$lib/FromView.svelte';
	import ToView from '$lib/ToView.svelte';
	import GearIcon from '$lib/icons/GearIcon.svelte';
	import SettingsDialog from '$lib/SettingsDialog.svelte';
	import { Split } from '@geoffcox/svelte-splitter';
	import { Button } from '@geoffcox/sterling-svelte';
	import { appStatus, userSettings } from '$lib/stores';
	import Start from '$lib/components/Start.svelte';

	let settingsDialogOpen = false;
</script>

<div class="root">
	<div class="header">
		<div class="app-name">Photiso</div>
		<Button on:click={() => (settingsDialogOpen = true)} variant="tool settings"
			><GearIcon width="2em" height="2em" /></Button
		>
	</div>
	<div class="content">
		{#if $appStatus == 'waiting'}
			<Start />
		{:else}
			<Split>
				<svelte:fragment slot="primary">
					<FromView />
				</svelte:fragment>
				<svelte:fragment slot="secondary">
					<ToView />
				</svelte:fragment>
			</Split>
		{/if}
	</div>
</div>
<SettingsDialog
	open={settingsDialogOpen}
	settings={$userSettings}
	on:close={() => (settingsDialogOpen = false)}
/>

<style>
	.root {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto 1fr;
		place-content: stretch;
		place-items: stretch;
		overflow: hidden;
	}

	.header {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;

		padding: 0.25em 0.5em 0.25em 1em;
		background-color: var(--stsv-common__background_color--secondary);
		border-bottom: 1px solid var(--stsv-common__color--secondary);
	}

	.header .app-name {
		font-size: 2em;
	}

	.header :global(button.settings) {
		justify-self: flex-end;
	}

	.header :global(button.settings svg) {
		width: 32px;
		height: 32px;
	}
	.content {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		place-content: stretch;
		place-items: stretch;
		overflow: hidden;
	}
</style>
