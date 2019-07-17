const electron = require('electron');
const app = electron.app;
const globalShortcut = electron.globalShortcut;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({width: 900, height: 680});
    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
    if (isDev) {
        // Open the DevTools.
        //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
        mainWindow.webContents.openDevTools();
    }
    // mainWindow.webContents.openDevTools();
    mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', () => {
    createWindow();

    let ret = globalShortcut.register('CommandOrControl+G', () => {
        if (mainWindow.isMinimized()) {
            mainWindow.show();
            mainWindow.alwaysOnTop = true;
        } else {
            mainWindow.minimize();
            mainWindow.alwaysOnTop = false;
        }
    });

    if (!ret) {
        console.log('registration failed')
    }

    ret = globalShortcut.register('CommandOrControl+D', () => {
        mainWindow.webContents.openDevTools();
    });

    if (!ret) {
        console.log('registration failed')
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});