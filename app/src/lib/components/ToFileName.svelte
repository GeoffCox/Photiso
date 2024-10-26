<script lang="ts">
	import { Input, Label } from '@geoffcox/sterling-svelte';
	import { toFileName, photo, userSettings, toFile, defaultToFileName, action } from '../stores';
	import { getDispatcher } from '../dispatcher';

	import { tick } from 'svelte';
	import { getPhotisoApi } from '../ipc.apis';
	import FileConflict from '../components/FileConflict.svelte';

	const photisoApi = getPhotisoApi();

	let moveEnabled = $action === 'move';

	$: {
		$action = moveEnabled ? 'move' : 'copy';
	}

	let noConflictSuffix: string | undefined = undefined;
	const updateNoConflictSuffix = async () => {
		await tick();
		if ($toFile) {
			noConflictSuffix = await photisoApi.getNoConflictFileNameSufix($toFile);
		} else {
			noConflictSuffix = undefined;
		}
	};

	$: updateNoConflictSuffix(), $toFile, $photo;

	const onResolveFileConflict = () => {
		if (noConflictSuffix) {
			toFileName.set($toFileName + noConflictSuffix);
		}
	};

	const setDefaultToFileName = () => {
		toFileName.set($defaultToFileName);
	};

	$: $photo, $defaultToFileName, setDefaultToFileName();
</script>

<div class="to-filename">
	<Label text="File Name" message={'true'}>
		<Input bind:value={$toFileName} />
		<span class="extension">{$photo?.path?.ext || ''}</span>
		<svelte:fragment slot="message">
			<FileConflict
				noConflictFileNameSuffix={noConflictSuffix}
				willAutoResolve={$userSettings.autoRenameConflicts}
				on:resolve={onResolveFileConflict}
			/>
		</svelte:fragment>
	</Label>
</div>

<style>
	.to-filename :global(.sterling-label .content) {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
	}
</style>
