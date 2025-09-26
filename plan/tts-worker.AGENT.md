Cornerstone TTS Worker Agent - Operating Guide

Role and scope
- Synthesizes narration from NLP outputs; caches by contentHash; writes audio artifacts.
- Plan: cornerstone/plan/tts-worker.md

Objectives
- Natural-sounding speech at controlled costs; caching and reuse across reruns.

Responsibilities
- Chunk-level synthesis; voice selection; audio normalization; caching; write artifacts and status.

Interfaces
- NLP Worker; Video Composer; Cost & Budgets; Operations & Telemetry.

Guardrails
- Character caps; rate limiting; retries with backoff; checksum verification.

Execution loop
- Implement synthesis pipeline; cost tracking; tests.

Definition of done
- Acceptance criteria in tts-worker plan.

Verification
- Audio quality checks; cost accounting validation.

References
- Plan: cornerstone/plan/tts-worker.md
