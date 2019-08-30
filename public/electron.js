const electron = require('electron');
const app = electron.app;
const globalShortcut = electron.globalShortcut;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

const path = require('path');
const isDev = require('electron-is-dev');
const robot = require("robotjs");
const sp = require('serialport');

let mainWindow;
let arduinoPort;

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
    mainWindow.setAutoHideMenuBar(true);
}

ipcMain.on('switch-screen', (event, arg) => {
    switchScreen();
});

function switchScreen() {
    console.log(arduinoPort);
    if (!arduinoPort.isOpen) {
        console.log("Port is closed...opening now");
        arduinoPort.open(function (err) {
            if (err) {
                return console.log(err.message)
            }
            sendSwitch();
        })
    } else {
        sendSwitch();
    }

    function sendSwitch() {
        console.log("sending display_switch");

        // Because there's no callback to write, write errors will be emitted on the port:
        arduinoPort.write('switch_display', function (err) {
            if (err) {
                return console.log(err.message)
            }
            console.log('display_switch sent');
            mainWindow.webContents.send('switch-successful');
        });
    }
}


app.on('ready', () => {
    createWindow();

    //
    // Init shortcuts
    //

    // Open close
    let ret = globalShortcut.register('F10', () => {
        if (mainWindow.isMinimized()) {
            mainWindow.show();
            mainWindow.alwaysOnTop = true;
        } else {
            mainWindow.minimize();
            mainWindow.alwaysOnTop = false;
        }
    });

    if (!ret) {
        console.log('F10 registration failed')
    }

    // Open dev tools
    ret = globalShortcut.register('CommandOrControl+D', () => {
        mainWindow.webContents.openDevTools();
    });

    if (!ret) {
        console.log('Ctrl+D registration failed')
    }

    // Mouse left
    ret = globalShortcut.register('F7', () => {
        robot.mouseClick();
    });

    if (!ret) {
        console.log('F7 registration failed')
    }

    // Mouse right
    ret = globalShortcut.register('F9', () => {
        robot.mouseClick("right")
    });

    if (!ret) {
        console.log('F9 registration failed')
    }

    // Display on off
    ret = globalShortcut.register('F6', () => {
        switchScreen();
    });

    if (!ret) {
        console.log('F6 registration failed')
    }

    // Display on off
    ret = globalShortcut.register('F1', () => {
        mainWindow.setFullScreen(!mainWindow.isFullScreen());
    });

    if (!ret) {
        console.log('F1 registration failed')
    }

    //
    // Init Arduino
    //
    arduinoPort = new sp('COM6', {
        baudRate: 9600
    });
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