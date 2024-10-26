<script lang="ts">
	import { Button, Checkbox, Dialog, Input, Label } from '@geoffcox/sterling-svelte';
	import type { UserSettings } from '../types';
	import { getDispatcher } from './dispatcher';
	import { userSettings } from './stores';
	import { DateTime } from 'luxon';
	import { defaultUserSettings } from '../constants';
	import PhotoInfo from './components/PhotoInfo.svelte';

	export let open = false;

    // export let leftInfo : PhotoInfo;
    // export let rightInfo : PhotoInfo;

	export let settings: UserSettings;

	const dispatcher = getDispatcher();

	let enableDefaultDirectoryName: UserSettings['enableDefaultDirectoryName'];
	let defaultDirectoryName: UserSettings['defaultDirectoryPattern'];
	let enableDefaultFileName: UserSettings['enableDefaultFileName'];
	let defaultFileName: UserSettings['defaultFileNamePattern'];

	const loadSettings = () => {
		enableDefaultDirectoryName = settings.enableDefaultDirectoryName;
		defaultDirectoryName = settings.defaultDirectoryPattern;
		enableDefaultFileName = settings.enableDefaultFileName;
		defaultFileName = settings.defaultFileNamePattern;
	};

	const saveSettings = async () => {
		settings = {
			enableDefaultDirectoryName: enableDefaultDirectoryName,
			defaultDirectoryPattern: defaultDirectoryName,
			enableDefaultFileName,
			defaultFileNamePattern: defaultFileName
		};
		userSettings.set(settings);
		await dispatcher.saveSettings();
	};

	const onDefault = () => {
		enableDefaultDirectoryName = defaultUserSettings.enableDefaultDirectoryName;
		defaultDirectoryName = defaultUserSettings.defaultDirectoryPattern;
		enableDefaultFileName = defaultUserSettings.enableDefaultFileName;
		defaultFileName = defaultUserSettings.defaultFileNamePattern;
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

</Dialog>