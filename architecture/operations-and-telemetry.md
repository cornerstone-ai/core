Operations and Telemetry

Locks and Concurrency
- Use distributed locks per AGENT.md guidance: locks.{ista.name}.{KalaType} with owner and TTL.
- Acquire on per-doc/per-stage scope; release conditionally and validate owner.

Retries and DLQ
- Map HTTP 409 (lock busy) to skip; retry with backoff for transient errors.
- Introduce a failedJobs collection and optional Pub/Sub DLQ.

Metrics
- Counters: docs_registered, ingest_succeeded/failed, study_generated, tts_seconds, video_encode_seconds, publish_succeeded/failed.
- Costs: LLM tokens, TTS minutes, egress bytes.
- Export to Cloud Monitoring; annotate with ista.name and KalaType.

Budgets and Guardrails
- Size limits on uploads; chunking caps; LLM tiering with token budgets.
- Pre-truncation maxContentChars before sizeLimiter.

Security
- Validate ownership of Storage paths.
- Sanitize HTML; scan uploads (ClamAV/Cloud Storage malware scanning).

Release and Configuration
- Feature flags in Firestore (users/{uid}/settings/cornerstone).
- Externalize environment-sensitive values (project/topic, lock TTL).
