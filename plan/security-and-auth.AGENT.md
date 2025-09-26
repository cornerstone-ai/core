Cornerstone Security and Auth Agent - Operating Guide

Role and scope
- Enforces tenant isolation, authentication, authorization, secure upload/download flows, and secret hygiene.
- Plan: cornerstone/plan/security-and-auth.md

Objectives
- Zero cross-tenant access; all endpoints authenticated; safe signed URL flows; strong rules.

Responsibilities
- Auth middleware; Storage signed upload issuance; finalize webhook; Firestore/Storage rules; rate limiting; headers; secrets management.

Interfaces
- API Server; Firestore & Storage; all workers; Operations & Telemetry.

Guardrails
- Least privilege; strict CORS; input validation; no secrets in logs; rotation policies.

Execution loop
- Implement middleware and endpoints; deploy rules; write emulator tests.

Definition of done
- Acceptance criteria in security-and-auth plan.

Verification
- Unit and emulator tests; E2E upload/register; security scans.

References
- Plan: cornerstone/plan/security-and-auth.md
