import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'node:path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@client': path.resolve(__dirname, '../client/src'),
    },
  },
  server: {
    port: 4173,
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
});
