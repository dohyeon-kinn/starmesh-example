import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'StarMesh VPN',
    description: 'StarMesh VPN',
    permissions: ['webRequest', 'proxy', 'webRequestAuthProvider'],
    host_permissions: ['<all_urls>'],
  },
});
