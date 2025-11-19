Cornerstone Project Manager — AGENT.md

Purpose
- This document is the operating guide for the overall Project Manager (PM) agent of the Cornerstone repo. It provides a high-level overview of the product vision, system architecture, delivery plan, and the PM workflows and guardrails to drive execution.

Product vision (from SPEC.md)
- Core idea: Upload a document or file and automatically generate:
  - A narrated video you can listen to
  - Flashcards, worksheets, and quizzes
- Themed UI: light pink/blue/green/orange/yellow/purple/grey/light red with cute, motivational aesthetics. Theme assets frame the activity area (background frame, pearls outline, etc.).
- Background music: cute video game style; sound button and theme selector integrated with the chosen theme.

Architecture compass (from architecture/README.md)
- Goal: Implement the Cornerstone app with reusable TopAigents/AWFL workflows and Firebase/GCP infrastructure.
- Reuse: workflows DSL for orchestration, AWFL Agent runner pattern, and existing conventions for locks/retries/metrics.
- Deploy: Firebase/Cloud Run/Functions; Firestore + Cloud Storage for data; follow collection/index conventions.
- Key documents in architecture/ (for quick navigation):
  - api.md
  - architecture-overview.md
  - backlog.md
  - components.md
  - data-model.md
  - operations-and-telemetry.md
  - pipeline.md
  - README.md
  - theming.md
  - workflows.md

Delivery plan (from plan/README.md)
- Work is organized as verifiable tasks with acceptance criteria; link PRs/commits to plan items.
- High-level dependency order:
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
- Plan files in plan/ (for quick navigation):
  - api-server.AGENT.md
  - api-server.md
  - ci-cd.AGENT.md
  - ci-cd.md
  - cli-integration.AGENT.md
  - cli-integration.md
  - cost-and-budgets.AGENT.md
  - cost-and-budgets.md
  - firestore-and-storage.AGENT.md
  - firestore-and-storage.md
  - frontend.AGENT.md
  - frontend.md
  - ingest-worker.AGENT.md
  - ingest-worker.md
  - migrations-and-scripts.AGENT.md
  - migrations-and-scripts.md
  - nlp-worker.AGENT.md
  - nlp-worker.md
  - operations-and-telemetry.AGENT.md
  - operations-and-telemetry.md
  - publisher.AGENT.md
  - publisher.md
  - README.AGENT.md
  - README.md
  - security-and-auth.AGENT.md
  - security-and-auth.md
  - testing-and-qa.AGENT.md
  - testing-and-qa.md
  - theming-assets.AGENT.md
  - theming-assets.md
  - tts-worker.AGENT.md
  - tts-worker.md
  - video-composer.AGENT.md
  - video-composer.md
  - workflows-scala.AGENT.md
  - workflows-scala.md

PM agent operating playbook
- Task management
  - Open a task for any work spanning more than a handful of file edits or requiring multiple steps.
  - Use concise titles and scoped descriptions; include a TODO checklist that is updated as work progresses.
  - Status flow: Queued → In Progress → Done/Stuck. Mark Done upon completion.
- Working constraints
  - Read/update incrementally. Avoid reading more than 5–7 files at once. Prefer tight loops: read → edit → validate.
  - When updating many files (>5), batch work thoughtfully and track with tasks.
  - Prefer relative repo paths in code; avoid absolute local paths.
- Engineering guardrails
  - Workflows: Conform Scala agents to AWFL Agent structure (imports, Agent base, preloads, prompt, runner).
  - Preloads: Ensure SPEC.md, architecture docs, and relevant plan files exist for any agent that references them.
  - Build: Keep build.sbt aligned with AWFL libraries and Scala version; run compile after structural changes.
  - CI: Add/maintain a compile step; consider smoke tests for key runners.
  - Operations: Follow architecture/operations-and-telemetry.md for locks, retries, metrics, and budgets.
  - Security: Enforce Firestore/Storage rules and least-privilege IAM; validate signed-URL flows.
- Definition of done (per feature/milestone)
  - Code compiles; minimal smoke tests pass; telemetry hooks added where applicable.
  - Docs updated: architecture and plan sections reflect the change.
  - Costs and quotas considered for new services; errors and retries budgeted.

Risks and mitigations
- API drift with AWFL libraries → Compile early and often; pin versions; maintain migration notes.
- Missing plan/preload files → Create stubs or adjust preloads; validate paths.
- Theming and asset bloat → Tokenize themes (architecture/theming.md); lazy-load assets; budget bandwidth.
- Pipeline idempotency → Follow pipeline.md; ensure resumable stages and dedup keys.

Immediate priorities
- Verify all workflow agents compile against the current AWFL libraries; fix any API drift.
- Ensure Readme.scala and other agents preload only repo-relative paths and valid files.
- Confirm architecture and plan documents are current and referenced by the agents that need them.
- Stand up CI compile step and a minimal smoke test for primary runners.

References
- Spec: SPEC.md
- Architecture index: architecture/README.md
- Delivery plan index: plan/README.md
