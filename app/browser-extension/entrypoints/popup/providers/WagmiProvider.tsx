import { creditCoin3Mainnet } from 'viem/chains';
import { WagmiProvider as Provider, createConfig, createStorage, http } from 'wagmi';
import { walletConnect } from 'wagmi/connectors';

import { storage as wxtStorage } from '#imports';

const storage = createStorage({
  key: 'browser-extension',
  storage: {
    async getItem(key) {
      const val = await wxtStorage.getItem<string>(`local:${key}`);
      return val;
    },
    async setItem(key, value) {
      await wxtStorage.setItem(`local:${key}`, value);
    },
    async removeItem(key) {
      await wxtStorage.removeItem(`local:${key}`);
    },
  },
});

export const wcConnector = walletConnect({
  projectId: '4e0ba9453aff49312e0796df4b922a3a',
  showQrModal: false,
});

export const wagmiConfig = createConfig({
  chains: [creditCoin3Mainnet],
  connectors: [wcConnector],
  transports: { [creditCoin3Mainnet.id]: http() },
  storage: storage,
});

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return <Provider config={wagmiConfig}>{children}</Provider>;
}
