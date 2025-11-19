// Re-export AWFL web auth provider/hooks for Cornerstone
// Requires Firebase env vars (VITE_FIREBASE_*) to be defined at runtime.
export { AuthProvider, useAuth } from '../../../../awfl-web/src/auth/AuthProvider'