<script lang="ts">
	import { Label, Input, Button } from "@geoffcox/sterling-svelte";

    export let fileName : string;
    export let extension : string = '';
    export let noOverwriteFileName: string;
    export let fileNameSuggestions : string[] = [];

    const onFileNameSuggestion = (suggestion: string) => {
		fileName = suggestion;
	};

</script>

<div class="destination-file-name-picker">
    <div class="file-name">
        <Label
            text="File Name"
            status={noOverwriteFileName ? 'warning' : undefined}
            message={noOverwriteFileName ? 'This file already exists' : undefined}
        >
            <Input bind:value={fileName} />
        </Label>
        <div class="extension">{extension}</div>
    </div>
    <div class="suggested-file-names">
        <Label text="Suggestions" for="dummy_id">
            {#each fileNameSuggestions as fileSuggestion}
                <Button
                    on:click={() => onFileNameSuggestion(fileSuggestion)}
                    variant="tool square">{fileSuggestion}</Button
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

</style>
