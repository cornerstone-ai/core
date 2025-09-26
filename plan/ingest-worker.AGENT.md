Cornerstone Ingest Worker Agent - Operating Guide

Role and scope
- Converts uploaded sources into normalized text, structure, chunks, and artifacts; updates doc status.
- Plan: cornerstone/plan/ingest-worker.md

Objectives
- Reliable, idempotent ingestion; cache hits on re-register without force.

Responsibilities
- Validate ownership; extract (PDF/TXT/HTML); normalize; chunk; hash; persist artifacts; update status; emit lineage.

Interfaces
- API Server; Firestore & Storage; NLP Worker; Operations & Telemetry; Security & Auth.

Guardrails
- Enforce user prefix; idempotent writes; lock key locks.cornerstone.Ingest:{docId}:{generatorVersion}.

Execution loop
- Implement pipeline stages; metrics; tests; scale heavy work to Cloud Run.

Definition of done
- Acceptance criteria in ingest-worker plan; golden sample suite passes.

Verification
- Emulator rule tests; stress tests; token-count checks.

References
- Plan: cornerstone/plan/ingest-worker.md
