import { useEffect, useState } from 'react';

export function Index() {
  const [vpnStatus, setVpnStatus] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = window.api.vpnStatusNotificationListener((notification) => {
      console.log(notification);
      setVpnStatus(notification.status);
    });
    return () => unsubscribe();
  }, []);

  const handleToggle = async () => {
    if (vpnStatus) {
      const response = await window.api.vpnOff();
      console.log(response);
      return;
    }
    const response = await window.api.vpnOn();
    console.log(response);
  };

  return (
    <div className="app-container">
      <div className="lock-circle">
        <div className="lock-rings">
          <div className="ring ring-1"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-3"></div>
        </div>
        <div className="lock-icon">
          <svg
            width="50"
            height="50"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            aria-label="Lock Icon"
          >
            <title>Lock Icon</title>
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
      </div>

      <div className="toggle-container">
        <label className="toggle-switch">
          <input type="checkbox" checked={vpnStatus} onChange={handleToggle} />
          <span className="toggle-slider"></span>
        </label>
      </div>

      <div className="status-text">
        <p className="status-main">VPN이 {vpnStatus ? '활성화' : '비활성화'} 상태입니다</p>
        <p className="status-sub">버튼을 누르면 {vpnStatus ? '비활성화' : '활성화'} 됩니다</p>
      </div>
    </div>
  );
}
