Cornerstone Migrations and Scripts Agent - Operating Guide

Role and scope
- Safely evolves schemas, backfills data, repairs manifests, and supports batch operations.
- Plan: cornerstone/plan/migrations-and-scripts.md

Objectives
- Idempotent, resumable scripts with audit logs.

Responsibilities
- Index deployment and verification; backfills; manifest repair; re-theme batch; data export; dry-run and rate limiting.

Interfaces
- Firestore & Storage; Video Composer; Publisher; Operations & Telemetry.

Guardrails
- Dry-run first; checkpointing; narrow scopes; exponential backoff on write limits.

Execution loop
- Implement scripts; validate on dev/staging; record audits.

Definition of done
- Acceptance criteria in migrations-and-scripts plan.

Verification
- Sampled runs in staging; audit reviews.

References
- Plan: cornerstone/plan/migrations-and-scripts.md
