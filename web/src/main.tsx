import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import '@awfl/web/styles.css'
import './app/global.css'
import { AuthProvider } from './features/auth/public'
import { setDefaultApiBase } from '@awfl/web/core/public'

// Set API base at runtime: dev keeps '/api'; prod uses VITE_API_BASE
setDefaultApiBase(import.meta.env.VITE_API_BASE || '')

const container = document.getElementById('root')!
createRoot(container).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)
