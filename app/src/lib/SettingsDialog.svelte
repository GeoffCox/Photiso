<script lang="ts">
	import { Button, Dialog, Input, Label, Radio, Switch } from '@geoffcox/sterling-svelte';
	import type { UserSettings } from './ipc.types';

	export let open = false;

	export let settings: UserSettings;

	let fileAction: 'move' | 'copy';
	let defaultDirectoryName: 'date' | 'previous' | 'empty';
	let defaultDirectoryDateFormat: 'year' | 'year-month' | 'year-month-day';
	let defaultFileName: 'datetime' | 'original' | 'empty';
	let defaultFileNamePrefix: string;

	const loadSettings = () => {
		fileAction = settings.fileAction;
		defaultDirectoryName = settings.defaultDirectoryName;
		defaultDirectoryDateFormat = settings.defaultDirectoryDateFormat;
		defaultFileName = settings.defaultFileName;
		defaultFileNamePrefix = settings.defaultFileNamePrefix;
	};

	const saveSettings = () => {
		settings = {
			fileAction,
			defaultDirectoryName,
			defaultDirectoryDateFormat,
			defaultFileName,
			defaultFileNamePrefix
		};
	}

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
	};

	const now = new Date(Date.now());
	const yearExample = now.getFullYear();
	const monthExample = (now.getMonth() + 1).toString().padStart(2, '0');
	const dayExample = now.getDate().toString().padStart(2, '0');
	const hourExample = now.getHours().toString().padStart(2, '0');
	const minuteExample = now.getMinutes().toString().padStart(2, '0');
	const secondExample = now.getSeconds().toString().padStart(2, '0');
	const subSecondExample = now.getMilliseconds().toString().padStart(3, '0');

	const getDirectoryNameExample = (option: UserSettings['defaultDirectoryDateFormat']) => {
		switch (option) {
			case 'year':
				return `${yearExample}`;
			case 'year-month':
				return `${yearExample}/${monthExample}`;
			case 'year-month-day':
				return `${yearExample}/${monthExample}/${dayExample}`;
			default:
				return '';
		}
	};

	$: directoryNameExample = getDirectoryNameExample(defaultDirectoryDateFormat);

	$: fileNameExample =
		`${defaultFileNamePrefix}${yearExample}-${monthExample}-${dayExample}` +
		`_${hourExample}-${minuteExample}-${secondExample}-${subSecondExample}`;
</script>

<Dialog bind:open on:close on:cancel>
	<div slot="title">Options</div>
	<div class="body" slot="body">
		<div class="section-header">When organizing photos</div>
		<div class="section">
			<Switch onText="Copy" offText="Move" />
		</div>
		<div class="section-header">For each photo, default the directory name to</div>
		<div class="section">
			<div class="radio-group">
				<Radio bind:group={defaultDirectoryName} name="defaultDirectoryName" value="date"
					>when the photo was taken</Radio
				>
				<div class="directory-name-options">
					<Radio
						bind:group={defaultDirectoryDateFormat}
						disabled={defaultDirectoryName !== 'date'}
						name="defaultDirectoryDateFormat"
						value="year">Year</Radio
					>
					<Radio
						bind:group={defaultDirectoryDateFormat}
						disabled={defaultDirectoryName !== 'date'}
						name="defaultDirectoryDateFormat"
						value="year-month">Year/Month</Radio
					>
					<Radio
						bind:group={defaultDirectoryDateFormat}
						disabled={defaultDirectoryName !== 'date'}
						name="defaultDirectoryDateFormat"
						value="year-month-day">Year/Month/Day</Radio
					>
				</div>
				<div class="example">
					<span>e.g. </span><span>{directoryNameExample}</span>
				</div>
				<Radio bind:group={defaultDirectoryName} name="defaultDirectoryName" value="previous"
					>the directory used for previous photo</Radio
				>
				<Radio bind:group={defaultDirectoryName} name="defaultDirectoryName" value="empty"
					>empty (I'll choose each directory myself)</Radio
				>
			</div>
		</div>
		<div class="section-header">For each photo, default the file name to</div>
		<div class="section">
			<div class="radio-group">
				<Radio bind:group={defaultFileName} name="defaultFileName" value="datetime"
					>when the photo was taken (date & time)</Radio
				>
				<div class="file-prefix">
					<Label text="Prefix">
						<Input disabled={defaultFileName !== 'datetime'} bind:value={defaultFileNamePrefix} />
					</Label>
				</div>
				<div class="example">
					<span>e.g. </span><span>{fileNameExample}</span>
				</div>
				<Radio bind:group={defaultFileName} name="defaultFileName" value="original"
					>the original name</Radio
				>
				<Radio bind:group={defaultFileName} name="defaultFileName" value="empty"
					>empty (I'll name each one myself)</Radio
				>
			</div>
		</div>
	</div>
	<div slot="footer">
		<div class="actions">
			<Button on:click={onOK}>OK</Button>
			<Button autofocus on:click={onCancel}>Cancel</Button>
		</div>
	</div>
</Dialog>

<style>
	.body {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto;
		row-gap: 1em;
		overflow-y: auto;
	}

	.section-header {
		font-weight: bold;
	}

	.section {
		display: grid;
		grid-template-columns: auto;
		row-gap: 0.5em;
		padding-left: 0.5em;
	}

	.radio-group {
		display: grid;
		grid-template-columns: auto;
		row-gap: 0.5em;
	}

	.directory-name-options,
	.file-name-options,
	.file-prefix {
		padding: 0 0 0 1em;
		display: grid;
		grid-template-columns: auto;
		row-gap: 0.5em;
	}

	.example {
		font-size: 0.7em;
		font-variant: small-caps;
		color: var(--stsv-common__color--secondary);
		margin-left: 2em;
	}
</style>
