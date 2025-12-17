import { RpcResponse, VPNStatus } from '@/main/rpc';

declare global {
  interface Window {
    api: {
      vpnOn: () => Promise<RpcResponse<VPNStatus>>;
      vpnOff: () => Promise<RpcResponse<VPNStatus>>;
      vpnStatusNotificationListener: (callback: (notification: VPNStatus) => void) => () => void;
    };
  }
}
