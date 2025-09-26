const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: false
        },
        show: false // No mostrar hasta que esté listo
    });

    // and load the index.html of the app.
    const startUrl = isDev 
        ? 'http://localhost:3000' 
        : `file://${path.join(__dirname, 'build', 'index.html')}`;
    
    console.log('Loading URL:', startUrl);
    console.log('__dirname:', __dirname);
    console.log('isDev:', isDev);
    
    win.loadURL(startUrl);
    
    // Mostrar ventana cuando esté lista
    win.once('ready-to-show', () => {
        win.show();
    });
    
    // Manejo de errores
    win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Failed to load:', errorCode, errorDescription);
    });

    // Open the DevTools in development or for debugging
    if (isDev) {
        win.webContents.openDevTools();
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
