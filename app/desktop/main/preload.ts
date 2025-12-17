import { contextBridge, ipcRenderer } from 'electron';

import { RpcResponse, VPNStatus } from './rpc';

contextBridge.exposeInMainWorld('api', {
  vpnOn: (): Promise<RpcResponse<VPNStatus>> => {
    return ipcRenderer.invoke('vpn_on');
  },
  vpnOff: (): Promise<RpcResponse<VPNStatus>> => {
    return ipcRenderer.invoke('vpn_off');
  },
  vpnStatusNotificationListener: (callback: (notification: VPNStatus) => void) => {
    const handler = (_event: object, notification: VPNStatus) => callback(notification);
    ipcRenderer.on('vpn_status', handler);
    return () => ipcRenderer.removeListener('vpn_status', handler);
  },
});
