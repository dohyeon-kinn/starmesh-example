import { platform } from 'node:os';
import path from 'node:path';
import { BrowserWindow, IpcMainEvent, Menu, Tray, app, ipcMain, nativeImage } from 'electron';
import started from 'electron-squirrel-startup';

import { getBinaryPath, getIconPath } from './path';
import { ChildProcessManager } from './process';

let isVpnOn = false;
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
const TRAY_ICON_IMAGES = {
  default: nativeImage.createFromPath(getIconPath('tray@2x.png')),
};

const childProcess = new ChildProcessManager({
  binaryPath: getBinaryPath(),
  onNotification: (response) => {
    switch (response.method) {
      case 'vpn_status': {
        const nextStatus = response.params.status;
        if (isVpnOn !== nextStatus) {
          isVpnOn = nextStatus;
          createTray();
        } else {
          isVpnOn = nextStatus;
        }
        mainWindow?.webContents.send('vpn_status', response.params);
        break;
      }
      default:
        break;
    }
  },
});

if (started) {
  app.quit();
  childProcess.stop();
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    title: 'StarMesh',
    icon: nativeImage.createFromPath(getIconPath('icon.ico')),
    width: 340,
    height: 600,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    roundedCorners: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      devTools: !app.isPackaged,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
};

const createTray = () => {
  const icon = TRAY_ICON_IMAGES.default.resize({ width: 16, height: 16 });
  if (platform() === 'darwin') {
    icon.setTemplateImage(true);
  }

  if (tray) {
    tray.destroy();
  }
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: isVpnOn ? 'Stop' : 'Start',
      accelerator: 'CmdOrCtrl+S',
      click: () => {
        childProcess.request({ method: isVpnOn ? 'vpn_off' : 'vpn_on' });
      },
    },
    { type: 'separator' },
    {
      label: 'Open',
      accelerator: 'CmdOrCtrl+O',
      click: () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createWindow();
          return;
        }
        mainWindow?.focus();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      accelerator: 'CmdOrCtrl+Q',
      click: () => app.quit(),
    },
  ]);

  tray.setContextMenu(contextMenu);
};

ipcMain.handle('vpn_on', async (_event: IpcMainEvent) => {
  return childProcess.request({ method: 'vpn_on' });
});

ipcMain.handle('vpn_off', async (_event: IpcMainEvent) => {
  return childProcess.request({ method: 'vpn_off' });
});

app.on('ready', () => {
  createWindow();
  createTray();
  childProcess.start();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    childProcess.stop();
  }
});
