Frontend Plan (awfl-web Cornerstone module)

Scope
- Build UI flows for upload, generation control, previews, and theming.

Dependencies
- API endpoints live; Firestore rules configured; themes defined.

Routes and Views
- /cornerstone
  - Document list: title, status, updated, quick actions.
- /cornerstone/new
  - Upload flow: drag/drop, file picker, progress; signed URL upload; then register.
- /cornerstone/:docId
  - Detail: status timeline, artifacts list, preview player (video, audio, text), theme selector, regenerate controls.

Components
- UploadWidget: handles signed URL and Storage path validation.
- ThemeSelector: 8 themes (pink..red), shows sample assets; three-star icon.
- StatusTimeline: maps docs.status transitions with timestamps.
- ArtifactsList: queries /docs/:docId/artifacts; download/preview links.
- PreviewPlayer: video player with sidecar subtitles; audio-only fallback.

State and Data
- Use Firestore listeners for docs/{docId} and derived collections.
- Poll exec-links endpoints for detailed job lineage.

Accessibility and UX
- Keyboard navigation; ARIA for controls; color contrast meets WCAG AA.
- Error surfaces with retry and support links.

Tasks
- [x] Scaffold routes and lazy-loaded pages.
- [ ] Implement upload with size/type validation; integrate sign endpoint.
- [ ] Implement document registration and progress updates.
- [ ] Build detail page with live status, artifacts list, and previews.
- [x] Implement theme switching and re-theme trigger.
- [ ] Add skeleton loaders, toasts, and error boundaries.
- [ ] Telemetry hooks for key actions.

Acceptance criteria
- Can upload a PDF and complete end-to-end generation from the UI.
- Previews display correctly; theme change triggers recomposition.

Verification
- Cypress E2E covering upload→publish.
- Lighthouse accessibility score ≥ 90 on relevant pages.

References
- Spec: ../SPEC.md
- Architecture: ../architecture/components.md

---
Architecture alignment with awfl-web (composable, functional modules)
- Thin page orchestrator
  - Pages coordinate state and compose components; no inline fetch or heavy logic in pages.
- Hooks for data/side-effects
  - useXyz hooks handle fetching, polling, and abort; accept enabled and expose { data, loading, error, reload }.
- Centralized API client
  - One small client module applies Authorization, X-Skip-Auth (VITE_SKIP_AUTH=1), and userAuthToken body semantics.
- Stable, normalized types and mappers
  - Normalize backend shapes to shared types at boundaries; mapping lives in utils; UI uses only normalized types.
- Stateless presentational components
  - Components render-only; receive data via props; no fetch logic.
- File-size and cohesion targets
  - Modules ≤ ~275 lines; extract helpers as needed to utils.
- Abort and resilience
  - Cancel in-flight requests on dependency changes; swallow per-item mapping errors; log non-fatal issues to console.
- App shell and scrolling
  - Outer container owns height; inner panels manage overflow; overscrollBehavior: contain.

Shared library reuse (awfl-kit)
- Introduce a shared internal package exported from awfl-web (e.g., @awfl/kit or packages/awfl-kit) providing:
  - UI primitives: Sidebar, Header, List/MessageList scaffolds, Button, Input, Skeleton, ErrorBanner, Toasts.
  - Hooks: useAbortableAsync, usePolling, useDebouncedValue, list/data hook templates.
  - Services/helpers: jobsClient-style API client, auth header helpers, fetch with AbortController, retry/backoff opts.
  - Types/mappers: base Session/Context-like types and defensive mapper patterns.
- Cornerstone depends on awfl-kit; general components should be added to awfl-kit first and consumed here to avoid duplication.

Operating practices from awfl-web
- Minimal diffs and conservative refactors; preserve behavior while improving structure.
- Explicit inputs/outputs for modules; avoid globals.
- Defensive mapping and tolerant rendering when data is missing.
- Debounce search/interactive text inputs (150–250ms) to reduce re-render churn.
- Expose reload functions from hooks and route them to small refresh controls in the UI.
- Verify unauthenticated and dev bypass flows; ensure abort guards and absence of memory leaks.

Action items to align
- [ ] Create a centralized api/client.ts mirroring awfl-web jobs client behavior.
- [ ] Extract all mapping logic into utils/mapping.ts and keep it defensive.
- [ ] Convert any direct fetch to hooks with enabled flags and AbortController.
- [ ] Set up awfl-kit dependency; replace local primitives with shared components/hooks/services where possible.
- [ ] Add a testing checklist covering auth/no-auth, errors, abort behavior, scrolling, and accessibility ≥90.
