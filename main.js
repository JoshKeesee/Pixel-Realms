const { app, BrowserWindow } = require("electron");
const { autoUpdater } = require("electron-updater")

function createWindow() {
	autoUpdater.checkForUpdatesAndNotify();
	
	const win = new BrowserWindow({
		icon: "icon.png",
		fullscreen: true,
	});

	win.loadFile("index.html");
	win.center();
	win.removeMenu();
}

app.whenReady().then(createWindow);
app.on("activate", () => BrowserWindow.getAllWindows().length == 0 ? createWindow() : "");
app.on("window-all-closed", () => process.platform != "darwin" ? app.quit() : "");