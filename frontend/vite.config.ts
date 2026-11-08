import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// In development the Vite dev server proxies `/api` to the NestJS backend,
// so the frontend can always call a relative `/api` path (no CORS needed).
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
  },
});
