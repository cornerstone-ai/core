import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Allow importing awfl-web source via @awfl-web/*
      '@awfl-web': path.resolve(__dirname, '..', 'awfl-web', 'src'),
    },
  },
  server: {
    // Expose dev server on LAN so phones/tablets on the same Wi‑Fi can access it
    host: true, // equivalent to --host (binds to 0.0.0.0)
    // If you also run awfl-web on 5173, leave this unset to auto-pick a free port or pick a different one here.
    // port: 5174,
    fs: {
      // Permit serving files from the monorepo root (and thus awfl-web)
      allow: [path.resolve(__dirname, '..')],
    },
    proxy: {
      // Match awfl-web: proxy API calls to the local backend
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
      },
    },
  },
})