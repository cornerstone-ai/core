Cornerstone Firestore and Storage Agent - Operating Guide

Role and scope
- Owns data layer setup: collections, indexes, rules; Storage buckets, paths, metadata, and lifecycle.
- Plan: cornerstone/plan/firestore-and-storage.md

Objectives
- Zero missing indexes in expected queries; correct metadata on all artifacts; strict tenant isolation.

Responsibilities
- Define collections and indexes; deploy rules; configure buckets and lifecycle; metadata conventions.

Interfaces
- Security & Auth; API Server; all workers; Frontend for read patterns.

Guardrails
- Emulator and prod parity for indexes/rules; least privilege IAM; change review required for rules.
- All reads/writes are user-scoped under users/{userId}/cornerstone; no cross-tenant access.
- Prefer idempotent writes (contentHash + params-based keys) and write-once artifacts; mutate only status/error fields.

Execution loop
- Implement plan tasks; write emulator tests; deploy; validate.
- On each change: update firestore.indexes.json, storage.rules, firestore.rules; run emulator tests; stage, then prod.

Definition of done
- Acceptance criteria in firestore-and-storage plan; emulator tests green; staging verified.

Verification
- Emulator and script-based checks of metadata and queries.

References
- Plan: cornerstone/plan/firestore-and-storage.md

Reusable utilities and patterns from AWFL (framework)
- Auth + user scoping (from @awfl/auth and @awfl/paths)
  - getUserIdFromReq(req): derive userId from req.userId, body.userAuthToken, or Authorization: Bearer; supports SKIP_AUTH=1 and X-Skip-Auth: 1 with X-User-Id for local dev.
  - userScopedCollectionPath(userId, subpath, options?): build user-scoped Firestore paths. Cornerstone usage: userScopedCollectionPath(userId, 'cornerstone/docs'). Prefer an appNamespace option so apps don’t hardcode strings (e.g., { app: 'cornerstone' }).
- Workflow execution links (from @awfl/workflow)
  - users/{userId}/workflowExecLinks with deterministic IDs (callingExec:triggeredExec) and created (serverTimestamp). Composite indexes: callingExec ASC, created DESC; equality on callingExec and triggeredExec.
- Migration-safe lookup (from @awfl/data)
  - Query user-scoped collections first. Optional read-only legacy fallback behind an explicit flag. Writes always go to user-scoped paths.
- Idempotency and dedupe (from @awfl/idempotency)
  - Keys based on contentHash + params (themeId, voice, generatorVersion). Skip work when artifacts already exist.
- Field naming/timestamps (from @awfl/conventions)
  - CamelCase fields; server timestamps for created and updated.
- Observability (from @awfl/logging)
  - Structured logs: userId, path, predicates; redact tokens; correlationId per request.

Best practices to adopt here
- Tenant isolation in rules
  - Firestore rules: only allow users/{userId}/cornerstone/** when request.auth.uid == userId. Block cross-tenant queries.
  - Storage rules: mirror users/{userId}/cornerstone/** with same uid check. Enforce contentType and path allowlists per artifact type.
- Index and rule parity
  - Keep firestore.indexes.json and firestore.rules versioned. CI runs firebase emulators:exec to detect missing indexes or rule regressions.
- Storage metadata conventions
  - Always set: contentType, cacheControl, custom metadata: { contentHash, generatorVersion }. Immutable cache for content-addressed artifacts; shorter cache for previews.
  - Lifecycle: expire cornerstone/*/tmp/** after 7 days.
- Status machine invariants (docs.status)
  - Transitions move forward except to error. After published, allow only non-material changes. Track lastTransition and lastError.
- Path helpers
  - Centralize GCS and FS path construction via @awfl/paths for docs, text, audio, video, study sets under cornerstone/{userId}/{docId}/... to avoid drift.
- Emulator-first development
  - Seed scripts to create users/{userId}/cornerstone docs and artifacts. Tests exercise queries from architecture/data-model.md.
- Migration playbook
  - If legacy/global data exists, provide a one-off backfill into users/{userId}/cornerstone with dry-run and verification.

Concrete tasks to add to plan (tracked in firestore-and-storage.md)
- Extract utilities into AWFL and consume from Cornerstone
  - Move/implement in AWFL packages: @awfl/auth (getUserIdFromReq), @awfl/paths (userScopedCollectionPath, storage path builders), @awfl/workflow (exec links), @awfl/idempotency (key builders), @awfl/logging (structured logs).
  - Publish initial versions; add dependencies in Cornerstone; replace any direct imports from functions/utils/userAuth.js with @awfl/* imports.
  - Ensure @awfl/paths supports appNamespace param (e.g., 'cornerstone') for collection and storage path builders.
- Add verification scripts in Cornerstone (can leverage @awfl/testing helpers later)
  - verifyIndexes.js: run expected queries; fail on missing index hints.
  - validateStorageMetadata.js: assert required metadata and cache headers.
  - auditTenantIsolation.js: simulate cross-tenant access; expect permission denied.
- Add logging guidelines
  - Include userId and path in structured logs; no tokens; treat 404 as expected empty vs. error.
- Add CI gates
  - Emulator test suite for queries and rules. Block merge on missing index/regression.

Quick references from data model
- Firestore collections (under users/{userId}/cornerstone): docs, textAssets, studySets, narration, videos, artifacts, themes, jobs; plus users/{userId}/workflowExecLinks.
- Expected indexes:
  - docs: where(status), where(contentHash), orderBy(updated desc)
  - studySets: where(generatorVersion, contentHash)
  - videos: where(themeId), orderBy(updated desc)
  - jobs: where(type, status), orderBy(started desc)
  - workflowExecLinks: callingExec ASC, created DESC; equality on callingExec and triggeredExec.

Import examples (Cornerstone consuming AWFL)
- Auth: import { getUserIdFromReq } from '@awfl/auth'
- Paths: import { userScopedCollectionPath, storagePathFor } from '@awfl/paths'
- Workflow: import { linkWorkflowExecs } from '@awfl/workflow'
