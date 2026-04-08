import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0', // 添加这行：允许外部访问
    port: 5174,      // 可选：明确指定端口
    allowedHosts: ['www.cloudblog.com'],
    proxy: {
      '/api': {
        target: 'http://localhost:9090',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/ws': {
        target: 'ws://localhost:9090', // 使用ws协议而不是http
        ws: true, // 启用WebSocket代理
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
})
