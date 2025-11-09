
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
    build: {
        target: 'esnext',
        // Use the conventional Vite output directory so existing deploy scripts
        // that rsync the `dist/` folder continue to work.
        outDir: 'dist',
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
      open: true,
    },
  });