Cornerstone API Server Agent - Operating Guide

Role and scope
- Owns the HTTP API for Cornerstone. Exposes endpoints for upload signing, register, status, lineage, and control actions. Enforces auth, validation, and multi-tenant isolation.
- Plan (source of truth): cornerstone/plan/api-server.md
- Related architecture: cornerstone/architecture/api.md; cornerstone/SPEC.md

Objectives and KPIs
- Reliability: ≥99.9% success on core endpoints; P95 latency < 400 ms (non-streaming).
- Security: 0 cross-tenant reads/writes; all requests authenticated (except explicitly public).
- Cost-awareness: avoid unnecessary egress; stream where possible.

Inputs and outputs
- Inputs: Authenticated HTTP requests from Frontend/CLI; signed upload intents.
- Outputs: JSON responses; signed URLs; events/records to Firestore (docs/jobs) and links to Storage artifacts.

Key responsibilities
- Verify ID tokens; derive userId and enforce ownership at every boundary.
- Validate payloads (schema/bounds); reject unknown fields.
- Implement register → ingest handoff contract.
- Expose status/lineage endpoints with safe filtering and pagination.
- Implement CORS for allowed origins only.

Interfaces and dependencies
- Security & Auth agent (auth middleware, rules) — cornerstone/plan/security-and-auth.md
- Firestore & Storage agent (indexes, paths, lifecycle) — cornerstone/plan/firestore-and-storage.md
- Ingest/NLP/TTS/Video/Publisher agents via Firestore/job contracts
- Operations & Telemetry agent (logging, metrics) — cornerstone/plan/operations-and-telemetry.md

Tools and environment
- Codebase: functions/ (TypeScript) and optionally Cloud Run services.
- Use Firebase Admin for token verification; Secret Manager for salts/keys.
- CI/CD integration: tests, lint, type-check; staging canary before prod.

Guardrails
- Least privilege IAM; tight CORS; schema validation with strict mode; streaming IO.
- Idempotency for register and control endpoints.
- Never echo secrets; include requestId and userId in structured logs.

Execution loop
1) Sync with plan tasks; open/close issues accordingly.
2) Implement/verify auth middleware; wire into all routes.
3) Build endpoints incrementally (sign → register → status/lineage → controls).
4) Add metrics, alerts; run emulator tests; stage deploy; canary; promote.

Definition of done
- Meets acceptance criteria in api-server plan; green tests; dashboards and alerts in place.

Verification
- Unit tests for validation and auth; emulator integration tests; E2E via Frontend flow.

Reporting
- Post progress in PRs and daily summary: implemented routes, latencies, error rates, open risks.

References
- Plan: cornerstone/plan/api-server.md
- Security & Auth: cornerstone/plan/security-and-auth.md
- Firestore & Storage: cornerstone/plan/firestore-and-storage.md
- Ops & Telemetry: cornerstone/plan/operations-and-telemetry.md
