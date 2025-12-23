Cornerstone Web (Frontend)

Overview
- Vite + React + TypeScript scaffold aligned with awfl-web practices.
- Routes: /cornerstone, /cornerstone/new, /cornerstone/:docId.
- Theme selector with 8 themes (pink, blue, green, orange, yellow, purple, grey, red).

Getting started
1) Install deps
   npm install
2) Start dev server
   npm run dev
3) Build
   npm run build
4) Preview build
   npm run preview

Environment configuration
- Dev
  - API base: leave VITE_API_BASE unset (or empty). The API client defaults to "/api" and Vite proxies to your local backend (see vite.config.ts).
  - Optional: set VITE_SKIP_AUTH=1 to bypass auth locally if your backend allows it.
  - Firebase: set VITE_FIREBASE_* in web/.env.local (already provided in this repo for local use).
- Production
  - API base: VITE_API_BASE=https://api.cornerstoneai.org (set in web/.env.production in this repo). The client will call `${VITE_API_BASE}/api/...`.
  - Auth bypass should be disabled by default: VITE_SKIP_AUTH=0.
  - Provide VITE_FIREBASE_* via your deploy environment if not bundling from .env.production.

Validation
- Local dev: run `npm run dev`, open the app, and verify network requests are relative to /api.
- Production build: run `npm run build && npm run preview` and verify network requests target https://api.cornerstoneai.org.

Project structure
- src/app: app shell, theme provider, globals
- src/pages: route pages (list, new, detail)
- src/kit: temporary UI primitives until @awfl/kit is integrated

Conventions (awfl-web alignment)
- Pages orchestrate; no fetch in pages. Use feature hooks/services (to be added).
- Abort in-flight requests on deps change; expose reloads.
- Accessibility: keyboard focusable controls, ARIA labels, contrast ≥ AA.

Next steps
- Integrate @awfl/kit when available; replace kit primitives.
- Add feature modules (upload, docs, artifacts) with hooks and mappers.
- Wire API client (api/client.ts) and Firestore listeners.
- Implement ThemeSelector with preview assets per SPEC.md.
- Add Cypress E2E and Lighthouse checks (≥90 accessibility).
