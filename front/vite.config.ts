import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths()
  ],
  base: '/',
  resolve: {
    alias: {
      'prop-types': 'prop-types'
    }
  },
  server: {
    port: 5174,
    host: '0.0.0.0',
    allowedHosts: ['frp-oil.com', 'localhost', '127.0.0.1','frp-off.com']
  },
  // 静态资源配置
  publicDir: 'public',
  build: {
    assetsDir: 'assets',
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
