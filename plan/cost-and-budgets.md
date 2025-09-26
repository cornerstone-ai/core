Cost and Budgets Plan

Goals
- Predict, monitor, and control spend for LLM, TTS, storage, and egress.

Estimates (MVP ballparks)
- LLM: $1–$3 per long document (prompt/response tokens; tiered models).
- TTS: ~$16 per 1M chars (Google TTS); ~8k chars ≈ 10 minutes ≈ $0.13.
- Storage: pennies; Egress: avoid by serving via Storage with signed URLs/CDN.
- Cloud Run ffmpeg: minutes of CPU per video.

Tasks
- [ ] Implement per-doc cost ledger: tokens, tts_chars, run_cpu_sec, storage_bytes, egress_bytes.
- [ ] Budget limits per user/day and per project/month; soft and hard caps.
- [ ] Alerts for nearing budgets via Cloud Billing Budgets API.
- [ ] Caching: reuse narration and study assets by contentHash.
- [ ] Model tiering with heuristics (cheap for chunking; upscale for final questions when under budget).
- [ ] Lifecycle policies to delete temp/intermediate assets after 7 days.
- [ ] Compress JSON artifacts; stream uploads.

Acceptance criteria
- Cost per doc recorded with ±10% accuracy.
- Caps prevent exceeding monthly budget by >5%.

Verification
- Reconcile sampled invoices vs metrics.
- Simulate heavy usage; observe throttling and graceful degradation.

References
- Spec: ../SPEC.md
- Architecture: ../architecture/operations-and-telemetry.md
