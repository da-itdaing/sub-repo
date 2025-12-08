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
    chunkSizeWarningLimit: 500, // 500KB로 낮춤
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // node_modules 청크 분리
          if (id.includes('node_modules')) {
          // React 코어
            if (id.includes('react') && !id.includes('react-router') && !id.includes('react-kakao')) {
              return 'react-vendor';
            }
            // 라우팅
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            // 상태관리
            if (id.includes('zustand')) {
              return 'state-vendor';
            }
          // 데이터 페칭
            if (id.includes('@tanstack/react-query') || id.includes('axios')) {
              return 'query-vendor';
            }
          // 카카오맵
            if (id.includes('react-kakao-maps-sdk') || id.includes('kakao')) {
              return 'kakao-vendor';
            }
            // UI 라이브러리
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            if (id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'ui-vendor';
            }
          }
          
          // 앱 코드 페이지별 분리
          if (id.includes('/src/pages/admin/')) {
            return 'admin-pages';
          }
          if (id.includes('/src/pages/seller/')) {
            return 'seller-pages';
          }
          if (id.includes('/src/chatbot/')) {
            return 'chatbot';
          }
          
          return undefined; // 기본 청크
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        // Spring Boot 백엔드: 로컬이면 localhost:8080, 원격이면 Test Backend EC2
        target: process.env.VITE_API_TARGET || 'http://10.0.139.232:8080',
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
