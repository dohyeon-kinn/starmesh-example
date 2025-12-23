import { Routes } from './pages/Routes';
import { ReactQueryProvider } from './providers/ReactQueryProvider';
import { WagmiProvider } from './providers/WagmiProvider';

export function App() {
  return (
    <ReactQueryProvider>
      <WagmiProvider>
        <Routes />
      </WagmiProvider>
    </ReactQueryProvider>
  );
}
