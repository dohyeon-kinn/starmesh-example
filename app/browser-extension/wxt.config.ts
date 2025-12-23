import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'StarMesh VPN',
    description: 'StarMesh VPN',
    permissions: ['webRequest', 'proxy', 'webRequestAuthProvider', 'storage'],
    host_permissions: ['<all_urls>'],
  },
});
