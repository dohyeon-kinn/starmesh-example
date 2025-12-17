import path from 'node:path';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@/main/*': path.resolve(__dirname, 'main/*'),
      '@/renderer/*': path.resolve(__dirname, 'renderer/*'),
    },
  },
});
