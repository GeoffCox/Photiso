<script lang="ts">
	import { photo } from './stores';

	import PhotoDisplay from '$lib/PhotoDisplay.svelte';
	import PhotoActions from '$lib/PhotoActions.svelte';
	import PhotoInfoCard from './PhotoInfoCard.svelte';
	import PhotoNavigation from './PhotoNavigation.svelte';
	import ToFilePicker from './ToFilePicker.svelte';
	import NewHistoryList from './NewHistoryList.svelte';
</script>

<div class="organize-view">
	<div class="main-area">
		<div class="from-area">
			<div class="photo">
				<PhotoDisplay photo={$photo} />
			</div>
			<div class="navigation">
				<PhotoNavigation />
			</div>
			<div class="photo-info">
				<PhotoInfoCard photo={$photo} />
			</div>
		</div>
		<div class="main-separator" />
		<div class="to-area">
			<div class="to-file">
				<ToFilePicker />
			</div>
			<div class="actions">
				<PhotoActions />
			</div>
		</div>
	</div>
	<div class="history">
		<NewHistoryList />
	</div>
</div>

<style>
	.organize-view {
		display: grid;
		column-gap: 1em;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr auto;
		grid-template-areas: 'main' 'history';
		justify-items: stretch;
		overflow: hidden;
		height: 100%;
	}

	.main-area {
		grid-area: main;
		display: grid;
		grid-template-columns: auto auto 1fr;
		grid-template-rows: 1fr;
		grid-template-areas: 'from separator to';
		align-content: center;
		align-items: center;
	}

	.main-separator {
		grid-area: separator;
		width: 3px;
		align-self: stretch;
		background: #dfdfdf;
		margin: 0 1em;
	}

	.from-area {
		grid-area: from;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto auto auto;
		grid-template-areas: 'photo' 'nav' 'info';
		column-gap: 1em;
		row-gap: 1em;
	}

	.photo {
		grid-area: photo;
		width: 400px;
		height: 400px;
		max-width: 400px;
		max-height: 400px;
		overflow: hidden;
		align-self: center;
		justify-self: center;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		place-content: stretch;
		place-items: stretch;
	}

	.photo-info {
		grid-area: info;
		align-self: center;
		width: 400px;
		max-width: 400px;
	}

	.navigation {
		grid-area: nav;
	}

	.navigation :global(button.fixed-width) {
		min-width: 150px;
	}

	.to-area {
		grid-area: to;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto auto;
	}

	.to-file {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto;
		row-gap: 0.5em;
		padding: 0.5em 2em;
		justify-items: stretch;
		align-items: flex-start;
	}

	.actions {
		padding: 2em;
	}

	.history {
		grid-area: history;
	}
</style>
