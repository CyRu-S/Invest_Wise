import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 6000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (
            id.includes('@splinetool') ||
            id.includes('@react-three') ||
            id.includes('/three/')
          ) {
            return 'spline-3d'
          }

          if (id.includes('recharts')) {
            return 'charts'
          }

          if (
            id.includes('/react/') ||
            id.includes('react-dom') ||
            id.includes('react-router-dom')
          ) {
            return 'react-core'
          }

          if (id.includes('lucide-react') || id.includes('axios')) {
            return 'ui-data'
          }
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
