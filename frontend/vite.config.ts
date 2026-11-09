import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// In development the Vite dev server proxies `/api` to the NestJS backend,
// so the frontend can always call a relative `/api` path (no CORS needed).
//
// When the dev server runs inside Docker, point the proxy at the backend
// container with VITE_PROXY_TARGET (e.g. http://todo_backend_dev:3000) and
// enable polling with VITE_USE_POLLING=true so HMR detects bind-mounted edits.
const proxyTarget = process.env.VITE_PROXY_TARGET ?? 'http://localhost:3000';
const usePolling = process.env.VITE_USE_POLLING === 'true';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    watch: usePolling ? { usePolling: true } : undefined,
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
  },
});
