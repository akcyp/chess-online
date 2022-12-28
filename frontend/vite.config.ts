import react from '@vitejs/plugin-react';
import fs from 'fs';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), eslint(), tsconfigPaths()],
  define: {
    API_URL: JSON.stringify(process.env.API_URL || 'localhost:3000'),
    API_SECURE: JSON.stringify(process.env.API_SECURE || true),
  },
  server: {
    https: {
      cert: fs.readFileSync(process.env.CERT_PATH || '../certificates/localhost.pem'),
      key: fs.readFileSync(process.env.CERT_KEY_PATH || '../certificates/localhost-key.pem'),
    },
    strictPort: true,
    host: true,
    port: 4000,
  },
});
