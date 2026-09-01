import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // ── Development proxy ──────────────────────────────────────────────────────
  // Forwards /api and /transactions to the local Spring Boot backend.
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/transactions': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },

  // ── Production build ───────────────────────────────────────────────────────
  build: {
    outDir: 'dist',
    // Emit a source map only for staging/debug; disable for production if preferred
    sourcemap: false,
    // Chunk splitting: keeps vendor code separate from app code for better caching
    rollupOptions: {
      output: {
        manualChunks(id) {
          const vendorPackages = ['react', 'react-dom', 'react-router-dom']
          const uiPackages = ['lucide-react', 'react-hot-toast']
          if (vendorPackages.some((pkg) => id.includes(`/node_modules/${pkg}/`))) {
            return 'vendor'
          }
          if (uiPackages.some((pkg) => id.includes(`/node_modules/${pkg}/`))) {
            return 'ui'
          }
        },
      },
    },
  },
})
