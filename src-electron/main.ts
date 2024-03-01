import { app, BrowserWindow } from 'electron';

const loadUrl = (appWindow: BrowserWindow) => {
    appWindow.loadURL('http://localhost:5173').catch((e) => {
		console.log('Error loading URL, retrying', e);
		setTimeout(() => {
			loadUrl(appWindow);
		}, 200);
	});
}

const createWindow = () => {
	const appWindow = new BrowserWindow({
		width: 800,
		height: 600
	});

	loadUrl(appWindow);
};

app.whenReady().then(() => {
	createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
