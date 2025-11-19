Cornerstone Web Architecture (aligned with awfl-web)

Purpose
- Document the UI modules, layering, and shared kit usage for the Cornerstone frontend.
- Ensure clean, modular development with encapsulated feature modules and thin pages.

Layering model
- pages/
  - Thin orchestrators. Compose feature modules and coordinate route params and local UI state.
  - Allowed imports: features/*/public, core/public, types/public, lib/public.
  - Forbidden: api/* internals, other features’ internals.
- features/<domain>/
  - Owns hooks, components, mappers, and types for the domain.
  - Exposes a stable, minimal public.ts surface (components, hooks, mappers, types).
  - Internals remain private; cross-feature usage goes only through public.ts.
- core/public
  - Cross-cutting hooks/services (e.g., useAbortableAsync, usePolling, useDebouncedValue).
- api/
  - Centralized client (apiClient). Only feature hooks call it. Pages never import api directly.
- lib/public and types/public
  - Pure utilities and shared types; no side-effects.
- kit/
  - Temporary local UI primitives (Button, IconButton, Skeleton, ErrorBanner) until @awfl/kit is integrated.

Routing and features
- /cornerstone (Document list)
  - features/documents: list documents, statuses, quick actions.
  - features/status: StatusTimeline mapping doc status transitions.
- /cornerstone/new (Upload)
  - features/upload: UploadWidget (signed URL flow, validations, progress) and document registration.
- /cornerstone/:docId (Detail)
  - features/artifacts: ArtifactsList querying /docs/:docId/artifacts with download/preview links.
  - features/preview: PreviewPlayer (video with subtitles; audio fallback; text preview when needed).
  - features/themes: ThemeSelector and theme trigger for recomposition.
  - features/status: live status/polling UI.

Theming model (from SPEC)
- Theme ids: lightPink, lightBlue, lightGreen, lightOrange, lightYellow, lightPurple, grey, lightRed.
- Each theme provides tokens:
  - colors: background, surface, accent, text, textMuted, border.
  - assets: decorative set (e.g., pearls, strawberries, bunnies for lightPink) used around the activity frame.
  - audio: cute game music loop; sound button uses a darker tone of the theme.
  - iconography: theme button is a three-star icon.
- Rendering guidance:
  - Designs outline the activity frame (rectangle) with pearls/decors around it; keep content accessible (contrast ≥ AA).
  - Respect prefers-reduced-motion; allow mute; music off by default.

Hooks and resilience
- Hooks accept `enabled` and return { data, loading, error, reload }.
- Use AbortController; guard setState on unmount; swallow per-item mapping errors and log to console.
- Normalize backend shapes at the boundary with mapper utils; UI uses stable types.

API client
- Centralize headers and base path logic.
  - Authorization: Bearer <idToken> when signed in.
  - X-Skip-Auth: 1 when VITE_SKIP_AUTH=1 for local dev.
  - Dev proxy: Vite proxies /api to backend.

Testing and accessibility
- Keyboard navigation and ARIA on UploadWidget, ThemeSelector, and players.
- Color contrast AA, focus outlines visible.
- Abort tests: switching docs cancels in-flight fetches.
- Unauth + VITE_SKIP_AUTH=1 flows must not crash.

Public import surfaces (examples)
- Pages import only from feature public barrels:
  - import { UploadWidget } from '../features/upload/public'
  - import { ThemeSelector } from '../features/themes/public'
  - import { StatusTimeline } from '../features/status/public'
  - import { ArtifactsList } from '../features/artifacts/public'
  - import { PreviewPlayer } from '../features/preview/public'
  - import { useDocumentsList } from '../features/documents/public'
  - import { useAbortableAsync } from '../core/public'

Next steps toward shared kit
- Introduce @awfl/kit for primitives (Button, Input, Skeleton, ErrorBanner) and hooks (useAbortableAsync, usePolling).
- Replace local kit and core hooks with awfl-kit equivalents once published.
