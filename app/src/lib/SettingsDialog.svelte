<script lang="ts">
	import { Button, Checkbox, Dialog, Input, Label, MenuButton, MenuItem, Switch } from '@geoffcox/sterling-svelte';
	import type { UserSettings } from '../types';
	import { getDispatcher } from './dispatcher';
	import { userSettings } from './stores';
	import { DateTime } from 'luxon';
	import { defaultUserSettings } from '../constants';

	const dateFormats = [
  { token: "yy", description: "year number, two-digits", example: "14" },
  { token: "yyyy", description: "year number, four-digits", example: "2014" },
  { token: "M", description: "month number", example: "8" },
  { token: "MM", description: "month number, 2 digits", example: "08" },
  { token: "MMM", description: "month name, abbreviated", example: "Aug" },
  { token: "MMMM", description: "month name", example: "August" },
  { token: "d", description: "day of month number", example: "6" },
  { token: "dd", description: "day of month number, 2 digits", example: "06" },
  { token: "h", description: "hour, 12 hour clock", example: "1" },
  { token: "hh", description: "hour, 12-hour clock, 2 digits", example: "01" },
  { token: "H", description: "hour, 24-hour clock", example: "9" },
  { token: "HH", description: "hour, 24-hour clock, 2 digits", example: "13" },
  { token: "a", description: "AM or PM", example: "AM" },
  { token: "mm", description: "minute, 2 digits", example: "07" },
  { token: "ss", description: "second, 2 digits", example: "04" },
  { token: "SSS", description: "millisecond, 3 digits", example: "054" },
  { token: "''", description: "Use single quotes to prevent using tokens", example: "'IMG_'" }
];

	export let open = false;
	export let settings: UserSettings;

	const dispatcher = getDispatcher();

	let enableDefaultDirectoryName: UserSettings['enableDefaultDirectoryName'];
	let defaultDirectoryPattern: UserSettings['defaultDirectoryPattern'];
	let enableDefaultFileName: UserSettings['enableDefaultFileName'];
	let defaultFileNamePattern: UserSettings['defaultFileNamePattern'];
	let autoRenameConflicts: UserSettings['autoRenameConflicts'];
	let copyOrMove: UserSettings['copyOrMove'];

	let isMoveAction: boolean = defaultUserSettings.copyOrMove === 'move';

	const loadSettings = () => {
		enableDefaultDirectoryName = settings.enableDefaultDirectoryName;
		defaultDirectoryPattern = settings.defaultDirectoryPattern;
		enableDefaultFileName = settings.enableDefaultFileName;
		defaultFileNamePattern = settings.defaultFileNamePattern;
		autoRenameConflicts = settings.autoRenameConflicts;
		copyOrMove = settings.copyOrMove;
		isMoveAction = copyOrMove === 'move';
	};

	const saveSettings = async () => {
		settings = {
			enableDefaultDirectoryName,
			defaultDirectoryPattern,
			enableDefaultFileName,
			defaultFileNamePattern,
			autoRenameConflicts,
			copyOrMove
		};
		userSettings.set(settings);
		await dispatcher.saveSettings();
	};

	const onDefault = () => {
		enableDefaultDirectoryName = defaultUserSettings.enableDefaultDirectoryName;
		defaultDirectoryPattern = defaultUserSettings.defaultDirectoryPattern;
		enableDefaultFileName = defaultUserSettings.enableDefaultFileName;
		defaultFileNamePattern = defaultUserSettings.defaultFileNamePattern;
		autoRenameConflicts = defaultUserSettings.autoRenameConflicts;
		copyOrMove = defaultUserSettings.copyOrMove;
		isMoveAction = copyOrMove === 'move';
	};

	const onOK = () => {
		copyOrMove = isMoveAction ? 'move' : 'copy';
		saveSettings();
		open = false;
	};

	const onCancel = () => {
		open = false;
	};

	$: {
		if (open) {
			loadSettings();
		}
	}

	const now = DateTime.now();

	$: directoryExample = defaultDirectoryPattern ? now.toFormat(defaultDirectoryPattern) : '';
	$: fileNameExample = defaultFileNamePattern ? now.toFormat(defaultFileNamePattern) : '';
</script>

<Dialog bind:open on:close on:cancel>
	<div slot="title">Options</div>
	<div class="body" slot="body">
		<div class="split">
			<div class="edit">
				<div class="edit-section">
					<Label for="enableDefaultDirectoryName" text="Default Directory Name">
						<div class="checkbox-input">
							<Checkbox id="enableDefaultDirectoryName" bind:checked={enableDefaultDirectoryName}
							></Checkbox>
							<Input
								id="defaultDirectoryName"
								bind:value={defaultDirectoryPattern}
								disabled={!enableDefaultDirectoryName}
							/>
						</div>
						<div class="example-default">{`(e.g. ${directoryExample})`}</div>
					</Label>
				</div>
				<div class="edit-section">
					<Label for="enableDefaultFileName" text="Default File Name">
						<div class="checkbox-input">
							<Checkbox id="enableDefaultFileName" bind:checked={enableDefaultFileName}></Checkbox>
							<Input
								id="defaultFileName"
								bind:value={defaultFileNamePattern}
								disabled={!enableDefaultFileName}
							/>
						</div>
						<div class="example-default">{`(e.g. ${fileNameExample})`}</div>
					</Label>
				</div>
				<div class="edit-section">
					<Label text="Conflict Resolution">
						<Checkbox bind:checked={autoRenameConflicts}>Automatically add number suffix</Checkbox>
					</Label>
				</div>
			</div>
			<div class="separator" />
			<div class="format-legend">
				<p>You can include the when the photo was taken in the default directory name and file name by using tokens.</p>
				<table class="format-table">
					<thead>
						<tr>
							<th>Token</th>
							<th>Description</th>
							<th>Example</th>
						</tr>
					</thead>
					<tbody>
						{#each dateFormats as dateFormat}
						<tr>
							<td>{dateFormat.token}</td>
							<td>{dateFormat.description}</td>
							<td><code>{dateFormat.example}</code></td>
						</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
	<svelte:fragment slot="footer">
		<div class="actions">
			<Button on:click={onDefault}>Default</Button>
			<Button on:click={onOK}>OK</Button>
			<Button autofocus on:click={onCancel}>Cancel</Button>
		</div>
	</svelte:fragment>
</Dialog>

<style>
	.body {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto;
		row-gap: 1em;
		overflow-y: hidden;
	}

	.split {
		display: grid;
		grid-template-columns: auto auto auto;
		justify-items: stretch;
		align-items: flex-start;
		column-gap: 2em;
	}

	.separator {
		background-color: grey;
		width: 3px;
		height: 100%;
	}

	.edit {
		display: grid;
		align-items: flex-start;
		row-gap: 1em;
		min-width: 20em;
	}

	.edit-section {
		padding: 0 0.25em;
	}

	.edit-section > :global(label .content) {
		padding: 0.25em 0;
	}

	.checkbox-input {
		display: grid;
		grid-template-columns: auto 1fr;
	}

	.example-default {
		margin: 0.5em 0 0 2.25em;
		font-size: 0.8em;
	}

	.format-legend {
		max-width: 400px;
	}

	.format-table th {
		text-align: left;
	}

	.format-table th,
	.format-table td {
		padding: 0 0.5em;
	}

	.format-table {
		font-size: 0.8em;
	}

	:global(.content > .footer) {
		display: grid !important;
		grid-template-columns: 1fr;
		justify-content: stretch !important;
		justify-items: stretch !important;
	}

	.actions {
		display: grid;
		grid-template-columns: 1fr 6em 6em;
		column-gap: 1em;
	}

	:global(.actions button:first-child) {
		justify-self: flex-start;
	}
</style>
