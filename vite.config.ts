import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Proxy /api và /uploads → Spring Boot.
// 502 Bad Gateway: thường do (1) backend chưa chạy / sai port, (2) trên Windows dùng "localhost"
// có thể trỏ IPv6 (::1) trong khi JVM chỉ bind IPv4 — dùng 127.0.0.1 mặc định.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendHost = env.VITE_BACKEND_HOST || '127.0.0.1'
  const backendPort = env.VITE_BACKEND_PORT || '8080'
  const backendOrigin = `http://${backendHost}:${backendPort}`
  const devPort = Number(env.VITE_DEV_PORT) || 5173
  const disableHmr =
    env.VITE_DISABLE_HMR === 'true' || env.VITE_DISABLE_HMR === '1'

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
      proxy: {
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
      },
    },
  }
})
