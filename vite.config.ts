import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import yaml from '@rollup/plugin-yaml'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss(), yaml()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
