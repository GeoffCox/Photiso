<script lang="ts">
	import { Label, Input, Link } from '@geoffcox/sterling-svelte';

	import { photo, toFileName, noConflictToFileName } from '../src/lib/stores'

	const onFileNameSuggestion = (suggestion: string) => {
		toFileName.set(suggestion);
	};
</script>

<div class="to-file-name-picker">
	<div class="file-name">
		<Label text="File Name" message={$noConflictToFileName}>
			<Input bind:value={$toFileName} />
			<svelte:fragment slot="message" let:message>
				<div class="overwrite-message">
					This file already exists. Consider changing it to <Link
						href="#"
						on:click={() => $noConflictToFileName && onFileNameSuggestion($noConflictToFileName)}
						>{$noConflictToFileName}</Link
					>
				</div>
			</svelte:fragment>
		</Label>
		<div class="extension">{$photo?.path.ext || ''}</div>
	</div>
</div>

<style>
	.to-file-name-picker {
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

	.overwrite-message {
		background-color: var(--stsv-status--warning__background-color);
		color: var(--stsv-status--warning__color);
		font-family: inherit;
		font-size: 0.8em;
		padding: 0.5em;
	}
</style>
