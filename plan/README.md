Cornerstone Delivery Plan

Purpose
- Break down Cornerstone into executable, verifiable tasks per system/service.
- Each plan file lists tasks, owners (TBD), dependencies, acceptance criteria, and verification steps.

How to use
- Work top-to-bottom by dependency order noted below.
- Check off tasks in PRs; link PRs and commits.
- Keep architecture docs in cornerstone/architecture as the source of truth; propose adjustments via PR.

Dependency order (high-level)
1) Security & Auth → Firestore/Storage rules/indexes
2) API/Server scaffolding and signed-URL uploads
3) Workflows (Scala) skeleton + runners
4) Ingest Worker
5) NLP Worker (study materials)
6) TTS Worker
7) Video Composer
8) Publisher
9) Frontend wiring and previews
10) Operations/Telemetry, CI/CD, Costs, QA

Plan files
- security-and-auth.md
- firestore-and-storage.md
- api-server.md
- workflows-scala.md
- ingest-worker.md
- nlp-worker.md
- tts-worker.md
- video-composer.md
- publisher.md
- frontend.md
- operations-and-telemetry.md
- ci-cd.md
- testing-and-qa.md
- cost-and-budgets.md
- theming-assets.md
- migrations-and-scripts.md
- cli-integration.md

Milestones
- MVP: Upload→Register→Ingest→Study→Narrate→Compose→Publish end-to-end for PDF.
- Phase 2: Worksheets PDF, Retheme, caching, quality improvements.
- Phase 3: Multilang, collaboration, exports.

References
- Spec: ../SPEC.md
- Architecture: ../architecture/architecture-overview.md
