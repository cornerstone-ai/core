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
