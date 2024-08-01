<script lang="ts">
	import { Label } from '@geoffcox/sterling-svelte';
	import RecentDirectoryList from './components/RecentDirectoryList.svelte';
	import {
		recentRelativeDirectories,
		relativeToDirectory,
		rootToDirectory,
		toFileName,
		photo
	} from './stores';
	import RelativeDirectoryInput from './components/RelativeDirectoryInput.svelte';
	import FileNameInput from './components/FileNameInput.svelte';
	import Bracket from './components/Bracket.svelte';

	const onSelectRecentDirectory = (directory: string) => {
		relativeToDirectory.set(directory);
	};
</script>

<div class="to-file-picker">
	<div class="folder">
		<RelativeDirectoryInput
			label="Folder"
			bind:rootDirectory={$rootToDirectory}
			bind:relativeDirectory={$relativeToDirectory}
		/>
	</div>
	<div class="bracket">
		<Bracket />
	</div>
	<div class="recent">
		<Label text="Recent Folders" />
		<RecentDirectoryList
			recentDirectories={$recentRelativeDirectories}
			on:select={(e) => onSelectRecentDirectory(e.detail.directory)}
		/>
	</div>
	<div class="file">
		<FileNameInput label="File" bind:name={$toFileName} extension={$photo?.path?.ext} />
	</div>
</div>

<style>
	.to-file-picker {
		display: grid;
		align-content: flex-start;
		align-items: flex-start;
		justify-content: stretch;
		justify-items: stretch;;
		grid-template-columns: 1fr auto 1fr;
		grid-template-rows: auto;
		grid-template-areas: 'root bracket recent' 'relative bracket recent' 'file bracket recent';
	}

	.folder {
		grid-area: relative;
		display: grid;
		grid-template-columns: 1fr auto;
		align-self: center;
		margin-top: 0.5em;
	}

	.recent {
		grid-area: recent;
	}

	.bracket {
		grid-area: bracket;
		align-self: stretch;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		place-content: stretch;
		place-items: stretch;
		margin: 0 1em;
	}

	.file {
		grid-area: file;
		margin-top: 1em;
	}
</style>
