<script lang="ts">
	import { Label, Input, Button, Link } from '@geoffcox/sterling-svelte';

	import { photo, toFileName, noConflictDestinationFileName, suggestedToFileNames } from './stores'

	const onFileNameSuggestion = (suggestion: string) => {
		toFileName.set(suggestion);
	};
</script>

<div class="destination-file-name-picker">
	<div class="file-name">
		<Label text="File Name" message={$noConflictDestinationFileName}>
			<Input bind:value={$toFileName} />
			<svelte:fragment slot="message" let:message>
				<div class="overwrite-message">
					This file already exists. Consider changing it to <Link
						href="#"
						on:click={() => $noConflictDestinationFileName && onFileNameSuggestion($noConflictDestinationFileName)}
						>{$noConflictDestinationFileName}</Link
					>
				</div>
			</svelte:fragment>
		</Label>
		<div class="extension">{$photo?.path.ext}</div>
	</div>
	<div class="suggested-file-names">
		<Label text="Suggestions" for="dummy_id">
			{#each $suggestedToFileNames as fileSuggestion}
				<Button on:click={() => onFileNameSuggestion(fileSuggestion)} variant="tool square"
					>{fileSuggestion}</Button
				>
			{/each}
		</Label>
	</div>
</div>

<style>
	.destination-file-name-picker {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto;
		row-gap: 2em;
	}

	.file-name {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: flex-end;
		column-gap: 0.25em;
	}

	.extension {
		padding-bottom: 0.625em;
	}

	.suggested-file-names {
		font-size: 0.8em;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-self: flex-start;
		margin-left: 2em;
	}

	.suggested-file-names :global(button) {
		justify-content: flex-start;
	}

	.overwrite-message {
		background-color: var(--stsv-status--warning__background-color);
		color: var(--stsv-status--warning__color);
		font-family: inherit;
		font-size: 0.8em;
		padding: 0.5em;
	}
</style>
