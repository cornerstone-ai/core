import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Expose dev server on LAN so phones/tablets on the same Wi‑Fi can access it
    host: true, // equivalent to --host (binds to 0.0.0.0)
    port: 5174, // avoid clashing with other local Vite apps
    fs: {
      // Permit serving files from the monorepo root
      allow: [path.resolve(__dirname, '..')],
    },
    proxy: {
      // Proxy API calls to the local backend
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
      },
    },
  },
  preview: {
    // Also expose vite preview on LAN in case you run `vite preview`
    host: true,
    port: 5174,
  },
})