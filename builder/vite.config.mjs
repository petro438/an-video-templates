import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname),
  resolve: {
    alias: {
      '@templates': path.resolve(__dirname, '../src/templates'),
      '@lib': path.resolve(__dirname, '../src/lib'),
    },
  },
  server: {
    port: 3001,
    open: true,
  },
});
