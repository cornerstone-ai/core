Migrations and Scripts Plan

Goals
- Safely evolve schemas, backfill data, and repair manifests.

Tasks
- [ ] Index deployment scripts and verification.
- [ ] Backfill script: compute missing contentHash for older docs.
- [ ] Manifest repair: scan Storage and rebuild artifacts/{docId} if missing.
- [ ] Re-theme batch tool: for a theme change, recompose videos across selected docs.
- [ ] Data export scripts: study sets to CSV/Anki.
- [ ] Dry-run mode for all scripts; rate limiting and checkpointing.

Acceptance criteria
- Scripts are idempotent and resumable.
- Can backfill 1k docs within an hour without rate limit violations.

Verification
- Run against dev/staging with sampled data; produce audit logs.

References
- Spec: ../SPEC.md
- Architecture: ../architecture/operations-and-telemetry.md

References
- Spec: ../SPEC.md
- Architecture: ../architecture/data-model.md
