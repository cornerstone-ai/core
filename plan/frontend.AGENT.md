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
  - Single small client module handles headers (Authorization, X-Skip-Auth), base paths, and body auth (userAuthToken).
- Stable, normalized types
  - Map backend shapes to shared types at the boundary (mappers in utils). UI uses only normalized types.
- Presentational components
  - Stateless, focused on rendering; accept data via props; no fetches.
- File-size targets and cohesion
  - Keep modules ≤275 lines; split helpers into utils when hooks/components grow.
- Abort and resilience
  - Cancel in-flight requests on dependency changes; swallow per-item mapping errors and log to console only.
- App shell and scrolling
  - Match awfl-web: outer container manages height; inner panels own overflow with overscrollBehavior contain.
- Testing and dev flows
  - Support VITE_SKIP_AUTH=1 for local dev; ensure unauthenticated flows don’t crash; verify abort guards and no memory leaks.

Shared library and reuse (awfl-kit)
- Create an internal package exported from awfl-web (name: @awfl/kit or packages/awfl-kit) with:
  - UI primitives: Sidebar, Header, MessageList-like list scaffolds, Button, Input, Skeleton, ErrorBanner.
  - Hooks patterns: useAbortableAsync, usePolling, useDebouncedValue, useSessionsList-like list hook template.
  - API helpers/services: makeJobsClient-style client, auth header helpers, fetch wrappers with AbortController.
  - Types and mappers: minimal Session-like, Context-like example types; mapper patterns.
- Cornerstone consumes awfl-kit for shared primitives and helpers, extending where needed.
- Avoid duplicate implementations across repos; changes land in awfl-kit first, then bumped in dependents.

Operating practices adopted from awfl-web
- Minimal diffs; conservative refactors preserving behavior.
- Explicit inputs/outputs for modules; avoid hidden globals.
- Defensive mapping and tolerant rendering for missing fields.
- Small debounces for search/inputs to reduce re-renders (150–250ms).
- Expose reloads from hooks and thread refresh controls through the UI.
- Add simple telemetry hooks around key actions (upload, register, generate, publish).

Action items for Cornerstone
- [ ] Add an Architecture section to the plan documenting modules and shared kit usage.
- [ ] Introduce a centralized api/client.ts mirroring awfl-web jobsClient semantics (headers, skip-auth).
- [ ] Extract mappers for Firestore/REST responses into utils/mapping.ts.
- [ ] Convert any inline fetch to hooks with enabled flags and abort handling.
- [ ] Integrate awfl-kit once published; replace local primitives with shared components.
- [ ] Add testing checklist (auth/no-auth, errors, abort, scrolling, accessibility ≥90).
