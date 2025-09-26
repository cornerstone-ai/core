API Server Plan

Goals
- Provide secure, minimal REST endpoints to drive Cornerstone flows: upload → register → ingest → NLP → TTS → video → publish.
- Enforce tenant isolation, validation, and rate limits; expose lineage and theme controls.

Tech stack
- Node/TypeScript on Cloud Functions or Cloud Run (Express).
- Firebase Admin for Auth, Firestore, Storage; Google IAM for service-to-service.
- zod/ajv for request schema validation; pino for structured logs; helmet + strict CORS.

Auth and security
- Firebase ID token required (Bearer); auth middleware injects userId.
- Storage paths scoped to cornerstone/{uid}/...
- Signed URL issuance via server; finalize webhook verifies MD5, metadata, and ownership.
- Idempotency-Key header supported on mutating endpoints; dedupe by {userId, sourceMD5}.

Resource model and statuses
- docs: { docId, userId, status, contentHash, generatorVersion, metrics, created, updated }
- statuses: registered → ingesting → ingested → analyzed → narrated → composed → published | error
- jobs: { jobId, type, status, timings, error }

Endpoints (v1)
- POST /v1/cornerstone/uploads: issue signed upload URL
  - body: { filename, contentType, contentLength }
  - returns: { url, method, headers, path, expiresAt }
  - validations: allowlisted content types, size ≤ MAX_BYTES; filename sanitized

- POST /v1/cornerstone/docs: register uploaded file and trigger ingest
  - body: { sourcePath, contentType, size, md5, filename, force? }
  - returns: { docId, status }
  - effects: create/merge doc; set status=registered; enqueue ingest (or HTTP call)

- GET /v1/cornerstone/docs: list docs for current user
  - query: { pageSize?, pageToken?, status?, updatedAfter? }
  - returns: { docs: [...], nextPageToken? }

- GET /v1/cornerstone/docs/:docId: fetch doc detail (only owner)

- POST /v1/cornerstone/docs/:docId/reingest: force re-ingest
  - body: { forceGeneratorVersion?: number }

- GET /v1/cornerstone/docs/:docId/artifacts: list artifact descriptors
  - returns: [{ type, path, size, updated, signedUrl? }]

- POST /v1/cornerstone/docs/:docId/study: generate/refresh study set
  - body: { mode?: "quick"|"thorough" }

- POST /v1/cornerstone/docs/:docId/narrate: trigger TTS
  - body: { voice?: string, speed?: number }

- POST /v1/cornerstone/docs/:docId/video: compose video
  - body: { themeId, layout?: string, subtitles?: boolean }

- POST /v1/cornerstone/docs/:docId/theme: switch theme and recompose
  - body: { themeId }

- POST /v1/cornerstone/docs/:docId/publish: publish assets
  - returns: { publicUrl?, shareCode? }

- GET /v1/cornerstone/themes: list available themes (id, name, preview)

- GET /v1/cornerstone/exec-links: lineage for a doc
  - query: { docId } → returns call graph { callingExec, triggeredExec, created }

- POST /v1/cornerstone/hooks/storageFinalize: Storage finalize webhook
  - validates object metadata, ownership, and content-type; optional antivirus hook

- GET /healthz and /readyz: health and readiness probes

Requests/Responses (zod shapes)
- UploadSignRequest: { filename: string; contentType: string; contentLength: number }
- UploadSignResponse: { url: string; method: "PUT"; headers: Record<string,string>; path: string; expiresAt: string }
- RegisterDocRequest: { sourcePath: string; contentType: string; size: number; md5: string; filename: string; force?: boolean }
- RegisterDocResponse: { docId: string; status: string }
- Error: { code: string; message: string; details?: unknown }

Workflow integration
- Server invokes workflows via HTTP jobs or Pub/Sub-triggered workers; uses distributed locks per ista.name and Kala type.
- Idempotent writes: contentHash gates and generatorVersion versioning.

Rate limits and quotas
- Per-user caps: sign (60/min), register (10/min), action endpoints (30/min).
- Global circuit breaker for downstream services; exponential backoff on 429/5xx.

Logging and tracing
- pino JSON logs: { ts, requestId, userId, path, method, status, ms }.
- Propagate requestId into downstream jobs; include exec ids in responses when available.

Tasks
- [ ] Implement auth middleware; attach userId and requestId; structured logging.
- [ ] Implement /uploads with V4 sign; finalize webhook; storage metadata checks.
- [ ] Implement /docs register; create doc; enqueue ingest; handle idempotency.
- [ ] Implement list/get docs with Firestore queries and indexes.
- [ ] Implement artifacts listing and short-lived signed URLs where needed.
- [ ] Implement theme listing and switch; trigger recompose.
- [ ] Implement study/narrate/video endpoints that enqueue workers; return job refs.
- [ ] Implement exec-links endpoint that queries linkage collection.
- [ ] Add OpenAPI (yaml) and Postman collection; generate TS client types.
- [ ] Add rate limiting and CORS; security headers via helmet.
- [ ] Emulator and integration tests; CI includes schema/type checks.

Acceptance criteria
- Upload→register→ingest completes for a PDF and doc reflects artifacts.
- Unauthorized or cross-user access attempts are denied (401/403) and logged.
- Idempotent register: same file twice is a fast no-op unless force=true.
- OpenAPI spec covers all endpoints; Dev can run E2E locally with emulators.

Verification
- Unit tests: validators, middleware, storage signer, webhook, Firestore queries.
- Emulator tests for rule enforcement and happy paths.
- E2E: script reproduces full flow and asserts status transitions and artifacts.

References
- Spec: ../SPEC.md
- Architecture: ../architecture/api.md
