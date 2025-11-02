import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Optional: enable production profiling build of React by setting VITE_REACT_PROFILE=true
export default defineConfig(({ mode }) => {
  const enableProdProfiling = process.env.VITE_REACT_PROFILE === 'true' || process.env.REACT_PROFILE === 'true'
  return {
    plugins: [react()],
    resolve: {
      // Important: don't alias 'react-dom/client' or createRoot will be missing.
      // Alias only the core 'react-dom' entry to the profiling build.
      alias: enableProdProfiling
        ? [
            { find: /^react-dom$/, replacement: 'react-dom/profiling' },
            { find: 'scheduler/tracing', replacement: 'scheduler/tracing-profiling' },
          ]
        : [],
    },
  }
})
