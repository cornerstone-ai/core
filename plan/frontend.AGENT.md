Cornerstone Frontend Agent - Operating Guide

Role and scope
- Builds the Cornerstone UI flows: upload, register, status, previews, theming, and controls.
- Plan: cornerstone/plan/frontend.md

Objectives
- Smooth end-to-end flow; accessibility score ≥90; stable previews.

Responsibilities
- Routes/pages per plan; components (UploadWidget, ThemeSelector, StatusTimeline, ArtifactsList, PreviewPlayer).
- Firestore listeners; status polling; error handling; telemetry hooks.

Interfaces
- API Server; Firestore & Storage; Theming Assets; Publisher.

Guardrails
- Validate file size/type client-side; handle auth state; avoid leaking PII in logs.

Execution loop
- Implement routes/components; integrate signed upload; status and previews; theming controls; tests.

Definition of done
- Acceptance criteria in frontend plan; Cypress E2E; Lighthouse ≥90.

Verification
- E2E tests and manual QA checklists.

References
- Plan: cornerstone/plan/frontend.md

---
Architecture alignment with awfl-web (composable, functional modules)
- Thin page orchestrator
  - Pages coordinate state and compose components; no inline fetch or heavy logic in pages.
- Hooks for data and side effects
  - useXyz hooks handle fetching, polling, and abort behavior; accept an enabled flag and expose { data, loading, error, reload }.
- Centralized API client
  - Single small client module handles headers (Authorization, X-Skip-Auth), base paths, and body auth (userAuthToken). Pages do not import the API client directly; feature hooks/services do.
- Stable, normalized types
  - Map backend shapes to shared types at the boundary (mappers in utils). UI uses only normalized types.
- Presentational components
  - Stateless, focused on rendering; accept data via props; no fetches.
- File-size targets and cohesion
  - Keep modules ≤275 lines; split helpers into utils when hooks/components grow.
- Abort and resilience
  - Cancel in-flight requests on dependency changes; swallow per-item mapping errors and log to console only.
- App shell and scrolling
  - Match awfl-web: outer container manages height; inner panels own overflow with overscrollBehavior: contain.
- Testing and dev flows
  - Support VITE_SKIP_AUTH=1 for local dev; ensure unauthenticated flows don’t crash; verify abort guards and no memory leaks.

Public import surfaces (LLM-friendly)
- Pages import only from features/*/public and core/public; do not deep-import feature internals.
- Each feature exposes a minimal public.ts surface that re-exports:
  - Stateless presentation components
  - Hooks/services (data orchestration, side effects)
  - Types and mappers required by consumers

Layering model and allowed imports
- pages/
  - May import: features/*/public, core/public, types/public, lib/public
  - Must not import: features/* internals, api/* internals
- features/<domain>/
  - Public: features/<domain>/public.ts — the only import surface others should use
  - Internals: features/<domain>/* — used only within the same feature
  - May import: core/public, types/public, lib/public, api (through local hooks/services only)
  - Must not import: other features’ internals; pages/*
- core/public
  - Cross-cutting hooks/services (e.g., useAbortableAsync, usePolling, useDebouncedValue)
- api/
  - Centralized client (apiClient). Hooks encapsulate api calls; pages never import api directly.
- lib/public and types/public
  - Pure utilities and shared types; no side-effects.

Encapsulation checklist for new work
1) Implement hook/service/component inside the owning feature.
2) Export only the intended surface from that feature’s public.ts.
3) Normalize backend shapes in mappers close to the boundary; keep UI types stable.
4) Hooks accept `enabled` and use AbortController; guard setState on unmount.
5) Never import another feature’s internals; extend its public.ts if needed.
6) Keep pages as orchestrators only; pass ids/tokens and compose public hooks/components.
7) Update feature README or docs when changing public surfaces.

Operating practices adopted from awfl-web
- Minimal diffs; conservative refactors preserving behavior.
- Explicit inputs/outputs for modules; avoid hidden globals.
- Defensive mapping and tolerant rendering for missing fields.
- Small debounces for search/inputs (150–250ms) to reduce re-renders.
- Expose reloads from hooks and thread refresh controls through the UI.
- Add simple telemetry hooks around key actions (upload, register, generate, publish).

Action items for Cornerstone
- [ ] Add an Architecture section to the plan documenting modules and shared kit usage.
- [ ] Introduce a centralized api/client.ts mirroring awfl-web jobsClient semantics (headers, skip-auth).
- [ ] Extract mappers for Firestore/REST responses into utils/mapping.ts.
- [ ] Convert any inline fetch to hooks with enabled flags and abort handling.
- [ ] Integrate awfl-kit once published; replace local primitives with shared components.
- [ ] Add testing checklist (auth/no-auth, errors, abort, scrolling, accessibility ≥90).

Testing checklist (for any change)
- Unauthenticated: no crashes; guarded flows when signed out.
- Authenticated: uploads, registrations, and status updates behave; first-load states sane.
- Errors: API/mapping errors surface in UI; no hard crashes.
- Abort: switching selection/routes cancels in-flight work; no memory leaks.
- Shell: scrolling within panels; header/theme controls remain accessible.
- Accessibility: color contrast AA; keyboard navigation and ARIA on controls.
