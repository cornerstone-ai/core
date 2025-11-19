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
    fs: {
      // Permit serving files from the monorepo root (and thus awfl-web)
      allow: [path.resolve(__dirname, '..')],
    },
  },
})
