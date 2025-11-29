import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'lucide-react'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // 챗봇 FastAPI가 있는 EC2로 프록시
      '/ai': {
        target: 'http://10.0.150.137:9000',  // <-- 챗봇 EC2 내부 IP
        changeOrigin: true,
        secure: false,
        // /ai/api/... -> /api/... 로 변환해서 FastAPI에 전달
        rewrite: (path) => path.replace(/^\/ai/, ''),
      },
    },
  },
})