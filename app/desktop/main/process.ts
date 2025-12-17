import { ChildProcess, spawn } from 'node:child_process';

import {
  JSON_RPC_VERSION,
  REQUEST_TIMEOUT_MS,
  type RpcNotification,
  type RpcRequestMethod,
  type RpcResponse,
} from './rpc';

type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  timeout: NodeJS.Timeout;
};

type RequestParams = {
  method: RpcRequestMethod;
  params?: Record<string, unknown>;
};

type NotificationHandler = (response: RpcNotification) => void;

type Options = {
  binaryPath: string;
  onNotification: NotificationHandler;
};

export class ChildProcessManager {
  private readonly binaryPath: string;
  private readonly onNotification: NotificationHandler;
  private readonly pendingRequests = new Map<string, PendingRequest>();
  private requestCounter = 0;
  private process: ChildProcess | null = null;
  private stdoutBuffer = '';

  constructor({ binaryPath, onNotification }: Options) {
    this.binaryPath = binaryPath;
    this.onNotification = onNotification;
  }

  private nextRequestId() {
    return `${Date.now()}-${++this.requestCounter}`;
  }

  private handleLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return;
    }

    let message: RpcResponse | RpcNotification;
    try {
      message = JSON.parse(trimmed);
    } catch {
      return;
    }

    const isResponse = Object.hasOwn(message, 'id');
    if (isResponse) {
      const response = message as RpcResponse;
      const key = String(response.id ?? 'null');
      const pending = this.pendingRequests.get(key);
      if (!pending) {
        return;
      }

      clearTimeout(pending.timeout);
      this.pendingRequests.delete(key);

      if (response.error) {
        pending.reject(response.error);
        return;
      }

      pending.resolve(response);
      return;
    }

    const isNotification = Object.hasOwn(message, 'method');
    if (isNotification) {
      const notification = message as RpcNotification;
      this.onNotification?.(notification);
    }
  };

  request({ method, params }: RequestParams): Promise<unknown> {
    if (!this.process || !this.process.stdin?.writable) {
      return Promise.reject(new Error('Go process is not running'));
    }

    const id = this.nextRequestId();
    const payload = {
      jsonrpc: JSON_RPC_VERSION,
      id,
      method,
      params,
    };

    return new Promise<unknown>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error('Request timed out'));
      }, REQUEST_TIMEOUT_MS);

      this.pendingRequests.set(id, {
        resolve,
        reject,
        timeout,
      });

      try {
        this.process.stdin?.write(`${JSON.stringify(payload)}\n`);
      } catch (err) {
        clearTimeout(timeout);
        this.pendingRequests.delete(id);
        reject(err);
      }
    });
  }

  start() {
    if (this.process) {
      return;
    }

    this.process = spawn(this.binaryPath, [], { shell: false });
    this.stdoutBuffer = '';

    this.process.stdout?.on('data', (data) => {
      this.stdoutBuffer += data.toString();
      const lines = this.stdoutBuffer.split(/\r?\n/);
      this.stdoutBuffer = lines.pop() ?? '';
      lines.forEach(this.handleLine);
    });

    this.process.stderr?.on('data', (data) => {
      console.error('Go stderr:', data.toString());
    });

    this.process.on('close', (code, signal) => {
      const reason = new Error(`process exited (code=${code}, signal=${signal ?? 'null'})`);
      this.pendingRequests.forEach(({ timeout, reject }) => {
        clearTimeout(timeout);
        reject(reason);
      });
      this.pendingRequests.clear();
      this.process = null;
      this.stdoutBuffer = '';
    });

    this.process.on('error', () => {
      const reason = new Error('process failed to start');
      this.pendingRequests.forEach(({ timeout, reject }) => {
        clearTimeout(timeout);
        reject(reason);
      });
      this.pendingRequests.clear();

      this.process = null;
    });
  }

  stop() {
    if (!this.process) {
      return;
    }

    const reason = new Error('Process stopped');
    this.pendingRequests.forEach(({ timeout, reject }) => {
      clearTimeout(timeout);
      reject(reason);
    });
    this.pendingRequests.clear();

    this.process.kill();
    this.process = null;
  }
}
