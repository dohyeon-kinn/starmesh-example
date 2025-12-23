import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useConnect, useConnection, useConnectors, useDisconnect, useReconnect } from 'wagmi';

import { QrCode } from '@/entrypoints/popup/components/qrCode';

import './index.css';

export function Login() {
  const [uri, setUri] = useState<string | null>(null);

  const navigate = useNavigate();
  const { address, isConnected } = useConnection();
  const { mutate: connect, isPending: isConnecting, error: connectError } = useConnect();
  const { isPending: isReconnecting, error: reconnectError } = useReconnect();
  const { mutate: disconnect } = useDisconnect();
  const connectors = useConnectors();

  useEffect(() => {
    if (connectors.length === 0) {
      return;
    }

    const onMessage = (payload: { type: string; data?: unknown | undefined }) => {
      if (payload?.type === 'display_uri') {
        setUri(String(payload.data));
      }
    };
    connectors[0].emitter.on('message', onMessage);
    return () => {
      connectors[0].emitter.off('message', onMessage);
    };
  }, [connectors]);

  return (
    <div className="app-container">
      <div className="wallet-circle">
        <div className="wallet-rings">
          <div className="ring ring-1"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-3"></div>
        </div>
        <div className="wallet-icon">
          {uri && <QrCode value={uri} size={200} />}
          {!uri && (
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label="Wallet Icon"
            >
              <title>Wallet Icon</title>
              <rect x="4" y="6" width="16" height="12" rx="2" fill="rgba(255, 255, 255, 0.1)" />
              <path d="M4 10h16" />
              <path d="M4 10V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
              <path d="M8 10V7a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3" />
              <line x1="7" y1="13" x2="7" y2="15" />
              <line x1="10" y1="13" x2="10" y2="15" />
              <line x1="13" y1="13" x2="13" y2="15" />
              <circle cx="17.5" cy="13.5" r="1.5" fill="white" />
            </svg>
          )}
        </div>
      </div>

      <div className="status-text">
        {isConnected && (
          <>
            <p className="status-main">지갑이 연결되었습니다</p>
            <p className="status-sub">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}</p>
          </>
        )}
        {!isConnected && uri && (
          <>
            <p className="status-main">QR 코드를 스캔하세요</p>
            <p className="status-sub">지갑 앱에서 연결을 승인해주세요</p>
          </>
        )}
        {!isConnected && !uri && (
          <>
            <p className="status-main">지갑을 연결해주세요</p>
            <p className="status-sub">버튼을 눌러 지갑을 연결하세요</p>
          </>
        )}
      </div>

      <div className="wallet-buttons">
        {isConnected && (
          <button
            type="button"
            className="wallet-button disconnect"
            onClick={() => disconnect()}
            disabled={isReconnecting}
          >
            연결 해제
          </button>
        )}
        {!isConnected && (
          <button
            type="button"
            className="wallet-button connect"
            onClick={() => connect({ connector: connectors[0] })}
            disabled={isConnecting || isReconnecting || connectors.length === 0}
          >
            {isConnecting ? '연결 중...' : '지갑 연결'}
          </button>
        )}
        {(connectError || reconnectError) && (
          <p className="error-text">{connectError?.message || reconnectError?.message || '연결 오류가 발생했습니다'}</p>
        )}
      </div>

      <button type="button" className="back-button" onClick={() => navigate('/')}>
        뒤로
      </button>
    </div>
  );
}
