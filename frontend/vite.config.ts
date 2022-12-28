import react from '@vitejs/plugin-react';
import fs from 'fs';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import tsconfigPaths from 'vite-tsconfig-paths';

const isProd = process.env.MODE === 'PRODUCTION';

export default defineConfig({
  plugins: [react(), eslint(), tsconfigPaths()],
  define: {
    API_URL: JSON.stringify(process.env.API_URL || 'localhost:3000'),
    API_SECURE: JSON.stringify(process.env.API_SECURE || true),
  },
  server: {
    https: {
      cert: fs.readFileSync(isProd ? '/certs/cert.pem' : '../certificates/cert.pem'),
      key: fs.readFileSync(isProd ? '/certs/key.pem' : '../certificates/key.pem'),
    },
    strictPort: true,
    host: true,
    port: 4000,
  },
  preview: {
    strictPort: true,
    port: 4000,
  },
});
