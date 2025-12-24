import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'StarMesh Proxy',
    description: 'StarMesh Proxy',
    permissions: ['webRequest', 'proxy', 'webRequestAuthProvider', 'storage'],
    host_permissions: ['<all_urls>'],
  },
});
