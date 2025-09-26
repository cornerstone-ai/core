Components and Responsibilities

Frontend (Cornerstone UI aligned with awfl-web architecture)
- Composition principles
  - Thin page orchestrators: compose state and render components; avoid inline data fetching.
  - Stateless presentational components: render-only; accept normalized data via props.
  - Cohesive hooks: useXyz hooks fetch and manage side effects; accept enabled and return { data, loading, error, reload }.
  - Centralized API client: one jobs/client module applies Authorization, X-Skip-Auth (dev), and userAuthToken semantics.
  - Stable types and mappers: normalize backend shapes into shared types in utils; UI does not depend on raw backend docs.
  - File-size target: modules ~≤275 lines; extract helpers into utils as needed.
  - Abort/resilience: cancel in-flight requests on dependency changes; swallow per-item mapping errors; log non-fatal issues.
  - App shell/scrolling: outer container manages height; inner panels own overflow with overscrollBehavior: contain.

Views and Components
- DocumentListPage (/cornerstone)
  - Uses useDocumentsList hook; filters and quick actions; consumes Sidebar and Header from shared kit.
- NewDocumentPage (/cornerstone/new)
  - UploadWidget (signed URL + progress), RegisterDocument form; integrates with client.signUpload and client.registerDoc.
- DocumentDetailPage (/cornerstone/:docId)
  - StatusTimeline, ArtifactsList, PreviewPlayer, ThemeSelector; polling via usePolling; Firestore listeners where applicable.

Shared library (awfl-kit) for reuse across awfl-web and Cornerstone
- UI primitives: Sidebar, Header, List scaffolds, Button, Input, Skeleton, ErrorBanner, Toast.
- Hooks: useAbortableAsync, usePolling, useDebouncedValue, list/data hook templates.
- Services: jobsClient-style API client, auth header helpers, fetch with AbortController, optional retry/backoff.
- Types/mappers: base normalized types (Session/Context-like) and defensive mapper helpers.

API/Server (Firebase Functions/Express)
- POST /api/cornerstone/uploads/sign → signed URL for Storage.
- POST /api/cornerstone/docs/register → create doc, enqueue IngestWorkflow.
- POST /api/cornerstone/docs/:docId/generate → enqueue full pipeline or selective stages.
- GET /api/cornerstone/docs/:docId → metadata and status.
- GET /api/cornerstone/docs/:docId/artifacts → list asset URLs.
- GET /api/cornerstone/themes → list themes.

Workers
- Ingest Worker (Node/Cloud Run or Function)
  - Detect file type; extract text; normalize to JSON with {blocks, headings, images, tables} + source hash.
- NLP Worker (Scala DSL + LLM service)
  - Outline, section summaries; generate flashcards, quiz items, and worksheet prompts; reuse services.Llm.
- TTS Worker
  - Google Cloud Text-to-Speech; voice per theme; per-section wav/mp3; SRT/WEBVTT.
- Video Composer (Cloud Run container with ffmpeg)
  - Assemble frames/background; overlay theme assets and subtitles; mix background music.
- Publisher
  - Upload assets to Storage with metadata; update Firestore; set cache headers.

Security and Auth
- Firebase Auth on client; Firestore rules isolate users.
- Signed URLs for upload/download; Cloud Run IAM for internal workers.

Best practices carried from awfl-web
- Minimal diffs; conservative refactors; keep PRs small and focused.
- Explicit inputs/outputs; avoid implicit coupling and globals.
- Defensive mapping; tolerant rendering for missing data; keep logs non-invasive.
- Debounce text inputs 150–250ms; thread reload controls from hooks to UI.
- Verify unauthenticated and VITE_SKIP_AUTH=1 dev bypass flows; ensure no memory leaks or stale UI on fast navigation.
