import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // 启用React Fast Refresh
      fastRefresh: true,
    }),
    tsconfigPaths()
  ],
  server: {
    port: 5175,
    host: '0.0.0.0',
    allowedHosts: ['frp-oil.com', 'localhost', '127.0.0.1','frp-off.com'],
    // 启用HTTPS用于PWA测试
    https: false,
    // 开发服务器优化
    hmr: {
      overlay: true
    }
  },
  build: {
    target: 'es2015',
    cssCodeSplit: true,
    // 移动端优化配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // 资源大小限制
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // 优化代码分割
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['react-vant', '@react-vant/icons'],
          router: ['react-router-dom'],
          utils: ['axios', 'zustand', 'clsx', 'tailwind-merge'],
          motion: ['framer-motion']
        },
        // 资源文件命名
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            return `media/[name]-[hash][extname]`
          }
          if (/\.(png|jpe?g|gif|svg|webp|avif)(\?.*)?$/i.test(assetInfo.name)) {
            return `images/[name]-[hash][extname]`
          }
          if (ext === 'css') {
            return `css/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js'
      }
    },
    // 启用源码映射（开发环境）
    sourcemap: process.env.NODE_ENV === 'development'
  },
  // 预构建优化
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-vant',
      '@react-vant/icons',
      'axios',
      'zustand',
      'clsx',
      'tailwind-merge'
    ]
  },
  // 定义全局变量
  define: {
    __DEV__: process.env.NODE_ENV === 'development',
    __MOBILE__: true
  }
})