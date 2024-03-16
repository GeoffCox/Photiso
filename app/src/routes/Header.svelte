<script lang="ts">
	import { Button } from '@geoffcox/sterling-svelte';
	import SettingsDialog from '$lib/SettingsDialog.svelte';
	import SettingsIcon from '$lib/icons/SettingsIcon.svelte';
	import { userSettings } from '$lib/stores';
	import { getDispatcher } from '$lib/dispatcher';

	const dispatcher = getDispatcher();

	let settingsDialogOpen = false;

	const onCloseSettingsDialog = async () => {
		dispatcher.saveSettings();
	};
</script>

<div class="header">
	<div class="app-name">Photiso</div>
	<div class="settings">
		<Button on:click={() => (settingsDialogOpen = true)}
			><SettingsIcon width="1em" height="1em" /></Button
		>
	</div>
	<SettingsDialog
		bind:open={settingsDialogOpen}
		bind:settings={$userSettings}
		on:close={onCloseSettingsDialog}
	/>
</div>

<style>
	.header {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
	}
  
	.app-name {
    font-size: 3em;
		font-weight: bold;
	}

	.settings {
		align-self: flex-start;
	}
</style>
