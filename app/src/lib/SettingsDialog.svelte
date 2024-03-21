<script lang="ts">
	import { Button, Checkbox, Dialog, Input, Label } from '@geoffcox/sterling-svelte';
	import type { UserSettings } from '../types';
	import { getDispatcher } from './dispatcher';
	import { userSettings } from './stores';
	import { DateTime } from 'luxon';
	import { defaultUserSettings } from '../constants';

	export let open = false;
	export let settings: UserSettings;

	const dispatcher = getDispatcher();

	let enableDefaultDirectoryName: UserSettings['enableDefaultDirectoryName'];
	let defaultDirectoryName: UserSettings['defaultDirectoryName'];
	let enableDefaultFileName: UserSettings['enableDefaultFileName'];
	let defaultFileName: UserSettings['defaultFileName'];

	const loadSettings = () => {
		enableDefaultDirectoryName = settings.enableDefaultDirectoryName;
		defaultDirectoryName = settings.defaultDirectoryName;
		enableDefaultFileName = settings.enableDefaultFileName;
		defaultFileName = settings.defaultFileName;
	};

	const saveSettings = async () => {
		settings = {
			enableDefaultDirectoryName: enableDefaultDirectoryName,
			defaultDirectoryName,
			enableDefaultFileName,
			defaultFileName
		};
		userSettings.set(settings);
		await dispatcher.saveSettings();
	};

	const onDefault = () => {
		enableDefaultDirectoryName = defaultUserSettings.enableDefaultDirectoryName;
		defaultDirectoryName = defaultUserSettings.defaultDirectoryName;
		enableDefaultFileName = defaultUserSettings.enableDefaultFileName;
		defaultFileName = defaultUserSettings.defaultFileName;
	};

	const onOK = () => {
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

	$: directoryExample = defaultDirectoryName ? now.toFormat(defaultDirectoryName) : '';
	$: fileNameExample = defaultFileName ? now.toFormat(defaultFileName) : '';
</script>

<Dialog bind:open on:close on:cancel>
	<div slot="title">Options</div>
	<div class="body" slot="body">
		<div class="split">
			<div class="edit-defaults">
				<div class="default-directory-name">
					<Checkbox bind:checked={enableDefaultDirectoryName}>
						<Label for="defaultDirectoryName" text="Default Directory Name" />
					</Checkbox>
					<Input
						id="defaultDirectoryName"
						bind:value={defaultDirectoryName}
						disabled={!enableDefaultDirectoryName}
					/>
					<div class="example-default">{enableDefaultDirectoryName ? directoryExample : ''}</div>
				</div>
				<div class="default-file-name">
					<Checkbox bind:checked={enableDefaultFileName}>
						<Label for="defaultFileName" text="Default File Name" />
					</Checkbox>
					<Input
						id="defaultFileName"
						bind:value={defaultFileName}
						disabled={!enableDefaultFileName}
					/>
					<div class="example-default">{enableDefaultFileName ? fileNameExample : ''}</div>
				</div>
			</div>
			<div class="separator" />
			<div class="format-legend">
				<p>You can use format tokens to include date taken information</p>
				<table class="format-table">
					<thead>
						<tr>
							<th>Token</th>
							<th>Description</th>
							<th>Example</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>yy</td>
							<td>year number, two-digits</td>
							<td><code>14</code></td>
						</tr>
						<tr>
							<td>yyyy</td>
							<td>year number, four-digits</td>
							<td><code>2014</code></td>
						</tr>
						<tr>
							<td>M</td>
							<td>month number</td>
							<td><code>8</code></td>
						</tr>
						<tr>
							<td>MM</td>
							<td>month number, 2 digits</td>
							<td><code>08</code></td>
						</tr>
						<tr>
							<td>MMM</td>
							<td>month name, abbreviated</td>
							<td><code>Aug</code></td>
						</tr>
						<tr>
							<td>MMMM</td>
							<td>month name</td>
							<td><code>August</code></td>
						</tr>
						<tr>
							<td>d</td>
							<td>day of month number</td>
							<td><code>6</code></td>
						</tr>
						<tr>
							<td>dd</td>
							<td>day of month number, 2 digits</td>
							<td><code>06</code></td>
						</tr>

						<tr>
							<td>h</td>
							<td>hour, 12 hour clock</td>
							<td><code>1</code></td>
						</tr>
						<tr>
							<td>hh</td>
							<td>hour, 12-hour clock, 2 digits</td>
							<td><code>01</code></td>
						</tr>
						<tr>
							<td>H</td>
							<td>hour, 24-hour clock</td>
							<td><code>9</code></td>
						</tr>
						<tr>
							<td>HH</td>
							<td>hour, 24-hour clock, 2 digits</td>
							<td><code>13</code></td>
						</tr>
						<tr>
							<td>a</td>
							<td>AM or PM</td>
							<td><code>AM</code></td>
						</tr>
						<tr>
							<td>mm</td>
							<td>minute, 2 digits</td>
							<td><code>07</code></td>
						</tr>
						<tr>
							<td>ss</td>
							<td>second, 2 digits</td>
							<td><code>04</code></td>
						</tr>
						<tr>
							<td>SSS</td>
							<td>millisecond, 3 digits</td>
							<td><code>054</code></td>
						</tr>
						<tr>
							<td>''</td>
							<td>Use single quotes to prevent using tokens</td>
							<td><code>'IMG_'</code></td>
						</tr>
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

	.edit-defaults {
		display: grid;
		align-items: flex-start;
		row-gap: 1em;
		min-width: 20em;
	}

	.default-directory-name {
		display: grid;
		align-items: flex-start;
	}

	.default-file-name {
		display: grid;
		align-items: flex-start;
	}

	.format-table th {
		text-align: left;
	}

	.format-table th,
	.format-table td {
		padding: 0 0.5em;
	}

	.example-default {
		margin: 0.5em 0 0 1em;
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
