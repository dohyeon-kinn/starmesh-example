export function App() {
  return (
    <div className="app-container">
      <div className="error-circle">
        <div className="error-rings">
          <div className="ring ring-1"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-3"></div>
        </div>
        <div className="error-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-label="Warning Icon"
          >
            <title>Warning Icon</title>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
      </div>

      <div className="error-content">
        <h1 className="error-title">프록시 연결 실패</h1>
        <p className="error-message">
          프록시 서버에 연결할 수 없습니다.
          <br />
          <br />
          확장 프로그램 팝업을 열어서
          <br />
          프록시 연결을 다시 시도해주세요.
        </p>
      </div>
    </div>
  );
}
