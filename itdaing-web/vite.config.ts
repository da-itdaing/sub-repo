
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  export default defineConfig({
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // 개발 모드에서 sourcemap 활성화 (Chrome DevTools 디버깅용)
    css: {
      devSourcemap: true,
    },
    build: {
        target: 'esnext',
        // Use the conventional Vite output directory so existing deploy scripts
        // that rsync the `dist/` folder continue to work.
        outDir: 'dist',
        sourcemap: true, // 프로덕션 빌드에서도 sourcemap 생성
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: [
              'react',
              'react-dom',
              'lucide-react',
            ],
          },
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0', // Private EC2에서 외부 접근 허용
      open: true,
      strictPort: false, // 포트가 사용 중이면 자동으로 다른 포트 사용
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  });