// Re-export AWFL web auth provider/hooks for Cornerstone
// Requires Firebase env vars (VITE_FIREBASE_*) to be defined at runtime.
// Use Vite alias to avoid brittle relative paths.
export { AuthProvider, useAuth } from '@awfl/web/auth/AuthProvider'
