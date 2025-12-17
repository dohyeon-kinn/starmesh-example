export const REQUEST_TIMEOUT_MS = 10_000;

export const JSON_RPC_VERSION = '2.0';

export type RpcRequestMethod = 'vpn_on' | 'vpn_off';

export type RpcRequest<T = unknown> = {
  jsonrpc: typeof JSON_RPC_VERSION;
  id: string;
  method: string;
  params?: T;
};

export type RpcError = {
  code: number;
  message: string;
  data?: unknown;
};

export type RpcResponse<T = unknown> = {
  jsonrpc: typeof JSON_RPC_VERSION;
  id: string;
  result?: T;
  error?: RpcError | null;
};

export type NotificationMethod = 'vpn_status';

export type VPNStatus = {
  status: boolean;
  timestamp: number;
};

export type RpcNotification<T = VPNStatus> = {
  jsonrpc: typeof JSON_RPC_VERSION;
  method: NotificationMethod;
  params?: T;
};
