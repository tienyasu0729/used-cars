import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'node:url'

// Proxy /api và /uploads → Spring Boot.
// loadEnv theo thư mục file cấu hình (không phải process.cwd) — tránh chạy Vite từ thư mục cha
// mà không đọc được .env → proxy trỏ sai port / sai target → 404 hoặc 502.
// 502 Bad Gateway: thường do (1) backend chưa chạy / sai port, (2) trên Windows dùng "localhost"
// có thể trỏ IPv6 (::1) trong khi JVM chỉ bind IPv4 — dùng 127.0.0.1 mặc định.
export default defineConfig(({ mode }) => {
  const projectRoot = fileURLToPath(new URL('.', import.meta.url))
  const env = loadEnv(mode, projectRoot, '')
  const backendHost = (env.VITE_BACKEND_HOST || '127.0.0.1').trim()
  const backendPort = (env.VITE_BACKEND_PORT || '8080').trim()
  const backendOrigin = `http://${backendHost}:${backendPort}`

  const aiChatHost = (env.VITE_AI_CHATBOT_HOST || '127.0.0.1').trim()
  const aiChatPort = (env.VITE_AI_CHATBOT_PORT || '8000').trim()
  const aiChatOrigin = `http://${aiChatHost}:${aiChatPort}`

  const devPort = Number(env.VITE_DEV_PORT) || 5173
  const disableHmr =
    env.VITE_DISABLE_HMR === 'true' || env.VITE_DISABLE_HMR === '1'

  const proxy = {
    '/api': {
      target: backendOrigin,
      changeOrigin: true,
    },
    '/uploads': {
      target: backendOrigin,
      changeOrigin: true,
    },
    '/ws': {
      target: backendOrigin,
      changeOrigin: true,
      ws: true,
    },
    '/ai-chat': {
      target: aiChatOrigin,
      changeOrigin: true,
    },
    '/ai-health': {
      target: aiChatOrigin,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/ai-health/, '/health'),
    },
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    server: {
      port: devPort,
      strictPort: false,
      hmr: disableHmr
        ? false
        : {
            protocol: 'ws',
            port: devPort,
            clientPort: devPort,
          },
      proxy: { ...proxy },
    },
    preview: {
      proxy: { ...proxy },
    },
  }
})
