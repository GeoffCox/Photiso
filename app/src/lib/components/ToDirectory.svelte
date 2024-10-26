<script lang="ts">
	import { Button, Input, Label } from '@geoffcox/sterling-svelte';
	import {
		toDirectory,
		photo,
		defaultToDirectoryName,
		favoriteDirectories
	} from '../stores';
	import { getDispatcher } from '../dispatcher';

	import { getDialogApi, getPhotisoApi } from '../ipc.apis';
	import FilledHeartIcon from '../icons/FilledHeartIcon.svelte';
	import SmallHeartIcon from '../icons/SmallHeartIcon.svelte';

	const dispatcher = getDispatcher();
	const photisoApi = getPhotisoApi();

	const onBrowseToDirectory = async () => {
		const dialog = getDialogApi();
		if (dialog) {
			const selectedDir = await dialog.browseForDirectory($toDirectory ?? '');
			if (selectedDir) {
				$toDirectory = selectedDir;
			}
		}
	};

	$: isToDirectoryFavorite = $toDirectory && $favoriteDirectories.indexOf($toDirectory) !== -1;

	const onToggleFavorite = () => {
		if ($toDirectory) {
			dispatcher.toggleFavoriteDirectory($toDirectory);
		}
	};

	const setDefaultToDirectory = () => {
		$toDirectory = $defaultToDirectoryName;
	};

	$: $photo, $defaultToDirectoryName, setDefaultToDirectory();
</script>

<div class="to-directory">
	<Label text="To Directory">
		<div class="layout">
			<Input bind:value={$toDirectory} />
			<Button on:click={onBrowseToDirectory}>...</Button>
			<Button on:click={onToggleFavorite} variant="favorite">
				{#if isToDirectoryFavorite}
					<FilledHeartIcon />
				{:else}
					<SmallHeartIcon />
				{/if}</Button
			>
		</div>
	</Label>
</div>

<style>
	.layout {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		column-gap: 0.5em;
	}

	.to-directory :global(.favorite svg) {
		width: 1.2em;
		height: 1.2em;
		color: var(--stsv-status--danger__color);
	}
</style>
