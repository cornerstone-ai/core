Cornerstone NLP Worker Agent - Operating Guide

Role and scope
- Derives study assets and semantic enrichments from ingested chunks; caches by contentHash.
- Plan: cornerstone/plan/nlp-worker.md

Objectives
- High-quality study assets at controlled token spend; cache hits when content unchanged.

Responsibilities
- Chunk-level prompts; section context; output schemas; dedupe; cache; write artifacts and status.

Interfaces
- Ingest Worker; TTS Worker; Cost & Budgets; Operations & Telemetry.

Guardrails
- Tiered model usage; token caps; deterministic outputs for same contentHash.

Execution loop
- Implement derivations; caching; metrics; tests; tune prompts and budgets.

Definition of done
- Acceptance criteria in nlp-worker plan.

Verification
- Unit tests for prompt pipelines; E2E doc flow with cached reruns.

References
- Plan: cornerstone/plan/nlp-worker.md
