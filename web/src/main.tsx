import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import '@awfl/web/styles.css'
import './app/global.css'
import { AuthProvider } from './features/auth/public'

const container = document.getElementById('root')!
createRoot(container).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)
