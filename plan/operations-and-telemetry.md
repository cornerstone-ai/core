Operations and Telemetry Plan

Goals
- Provide reliable ops with observability, guardrails, and clear runbooks.

Tasks
- [ ] Structured logging (JSON) with correlation ids: {userId, docId, execId, stage}.
- [ ] Distributed lock configuration (TTL, owner validation); metrics for acquired/busy/reclaimed.
- [ ] Metrics: counters and histograms for each stage; token usage; TTS minutes; ffmpeg duration.
- [ ] Tracing: OpenTelemetry spans across API→workflows→workers; export to Cloud Trace.
- [ ] Dashboards: operations, cost, performance; per-env filtering by ista.name suffix.
- [ ] Alerts: failure rates, stuck statuses (> N minutes), budget thresholds.
- [ ] Runbooks: common failures, retry guidance, rollback steps, data cleanup.
- [ ] Feature flags: per-user/per-env toggles in Firestore with safe defaults.
- [ ] Rate limiting and quotas per user to control spend.

Acceptance criteria
- On incident, can trace a job end-to-end with a single execId.
- Alert fires when publish error rate > 5% over 15m.

Verification
- Synthetic canary job hourly; alert if fails twice consecutively.
- Chaos test: induce transient failures and observe retries and metrics.

References
- Spec: ../SPEC.md
- Architecture: ../architecture/operations-and-telemetry.md
