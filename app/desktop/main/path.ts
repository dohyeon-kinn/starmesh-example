import { arch, platform } from 'node:os';
import path from 'node:path';
import { app } from 'electron';

export const getBinaryPath = () => {
  const ext = platform() === 'win32' ? '.exe' : '';
  const binaryName = `go_ipc_server_${platform()}_${arch()}${ext}`;
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'resources', binaryName);
  }
  return path.join(app.getAppPath(), 'resources', binaryName);
};

export const getIconPath = (filename: string) => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'assets', filename);
  }
  return path.join(app.getAppPath(), 'assets', filename);
};
