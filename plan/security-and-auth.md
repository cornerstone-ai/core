Security and Auth Plan

Goals
- Enforce strong tenant isolation (per-user by default; team/project later) across Firestore and Storage.
- Validate ownership and authorization on every server operation; least privilege everywhere.
- Provide safe, bounded signed uploads/downloads; secure service-to-service calls.

Threat model (MVP focus)
- Unauthenticated access to protected resources.
- Cross-tenant data access via mis-scoped paths or weak rules.
- Abusive uploads (oversize, wrong content type, malware).
- Token replay and confused deputy in signed URL and workflow triggers.
- Secrets leakage in logs or client bundles.

Identity and authentication
- Client: Firebase Auth (email/password + OAuth providers later). ID token attached as Authorization: Bearer <token>.
- Server (Functions/Cloud Run): verify ID token and derive userId; cache JWKs; verify audience/issuer.
- Service-to-service: use Google OIDC/IAM with dedicated service accounts and minimal roles (e.g., storage.objectViewer on narrow prefixes).
- CLI/dev tools: support emulators; skip-auth only in local emulator with explicit flag.

Authorization model
- Resource ownership = userId; all paths include uid prefix.
- Future: projects/{projectId} ownership with members/roles; map user → active project for requests.
- Roles (future): user, admin, support; no admin backdoors in client; gated by custom claims and server-only checks.

Paths and scoping conventions
- Storage: cornerstone/{uid}/source/* (uploads); cornerstone/{uid}/docs/{docId}/... (artifacts).
- Firestore: users/{uid}/cornerstone/docs/{docId} or top-level docs with userId field + rules enforcing user match.
- Logs: include requestId, userId, docId; redact PII and secrets.

Security rules (MVP)
- Firestore rules (sketch):
  - allow read, write on docs where request.auth.uid == resource.data.userId (create checks request.resource.data.userId == request.auth.uid).
  - Restrict indexes and queries to permitted fields to avoid path leaks.
- Storage rules (sketch):
  - allow write to cornerstone/{uid}/source/** when request.auth.uid == uid and contentType in allowlist and size < limit.
  - allow read of artifacts under same uid; deny cross-uid access.

Signed URL design
- Uploads: server issues V4 signed URL for exact path cornerstone/{uid}/source/{filename} with constraints:
  - contentType exact match; content-length-range [1, MAX_BYTES]; TTL ≤ 15m; x-goog-meta-userId set to uid.
  - Client includes Content-MD5; server validates on finalize callback.
- Downloads: signed URLs only for public/share flows; otherwise authenticated Storage access via SDK.
- Finalize webhook verifies path ownership, metadata (userId, contentType), and sets object retention metadata.

API endpoints security
- CORS: allow specific origins only; allow credentials=false; strict methods/headers.
- CSRF: not applicable to pure Bearer AJAX calls; for cookie auth (future) use double-submit token.
- Rate limiting and abuse control: IP/user caps via Cloud Armor/Cloud Functions quotas; exponential backoff on hot endpoints.
- Input validation: schema validation (zod/ajv); strict types and bounds; reject unknown fields; log with sanitized inputs.

Secrets and config
- Use Secret Manager for API keys and salts; mount via runtime; never commit secrets.
- Environment separation: dev/staging/prod projects, isolated SA and buckets.
- Key rotation policy: 90 days; deploy roll-forward strategy with dual keys.

Crypto and data protection
- Server-side encryption default; opt-in CMEK for buckets with KMS-managed keys (staging/prod).
- Hashing: SHA-256 for contentHash and sourceHash; keyed HMAC for signed callbacks if needed.
- PII minimization: avoid storing emails; reference by uid; redact payloads in logs.

Auditing and monitoring
- Audit log: who did what (userId, endpoint, docId, result) with requestId.
- Alerts on repeated 401/403 spikes, upload failures, and rule-denied attempts.
- Periodic access review for service accounts and IAM bindings.

Operational playbooks
- Compromised token: revoke refresh tokens for user; force re-auth; rotate any derived keys.
- Key leak: rotate Secret Manager versions; invalidate older signed URL salts; redeploy.
- Incident response: timeline, blast radius analysis, user notification templates.

Tasks
- [ ] Implement auth middleware (Express) with Firebase Admin verifyIdToken, audience/issuer checks.
- [ ] Wire middleware into all endpoints; propagate userId in request context and logs.
- [ ] Author Storage signed upload endpoint: validates intent, returns V4 URL with tight constraints.
- [ ] Implement upload finalize handler: verify metadata, MD5, user ownership; write register record.
- [ ] Define and deploy Firestore and Storage rules; add emulator tests for allow/deny cases.
- [ ] Add rate limiting and basic abuse detection (user/IP) for register and sign endpoints.
- [ ] Secrets: move salts and API keys to Secret Manager; add rotation scripts.
- [ ] Add security headers (helmet) and strict CORS.
- [ ] Document role model and future project-level authorization.

Acceptance criteria
- Unauth requests receive 401; other-users’ resources receive 403.
- Only allowed content types and sizes can be uploaded; mis-matches are rejected pre-signed or at finalize.
- Firestore/Storage rules prevent cross-tenant access in emulator tests and staging.
- All endpoints include requestId and userId in logs; no secrets printed.

Verification
- Unit tests for middleware and schema validation.
- Emulator rule tests (positive/negative) for docs and artifacts.
- E2E: upload via signed URL → register → ingest; attempt cross-user access → deny.
- Security scan: npm audit/trivy; header checks; penetration test checklist.

References
- Spec: ../SPEC.md
- Architecture: ../architecture/api.md
