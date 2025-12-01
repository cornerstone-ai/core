Cornerstone Workflows (Scala DSL)

Overview
- Cornerstone orchestrates ingestion, study material generation, narration, video composition, and publishing using the AWFL Scala DSL.
- Workflows follow the AWFL Agent runner pattern, emphasize idempotency and locking, and emit telemetry for observability.
- Start here for a quick map of available agents/runners and how to run them.

Key references
- Architecture: ../architecture/workflows.md
- Plan: ../plan/workflows-scala.md
- API overview: ../architecture/api.md
- Components/data/ops: see ../architecture/*.md for details on data-model, operations-and-telemetry, pipeline, theming.

How to run
- Prereqs: JDK 17+, sbt, access to required env vars/credentials.
- Build: sbt clean compile
- CLI: Use the AWFL CLI/runner to invoke background agents and workflows. Common patterns:
  - awfl-cli.sh run <RunnerOrAgentName> [--args]
  - or via sbt: sbt "runMain org.cornerstoneai.workflows.<AgentClass>"
- YAML gens produced by agents are written under ./yaml_gens; check in changes where appropriate.

Agent and workflow index (package org.cornerstoneai.workflows)
- WorkflowsScala.scala — Top-level workflow/agent index for Cornerstone.
- Readme.scala — Agent that prints or maintains high-level docs/readme content.
- ApiServer.scala — API/server scaffolding and endpoints integration tasks.
- BuildManager.scala — Build and dependency management helpers.
- CiCd.scala — CI/CD pipeline helpers and checks.
- CliIntegration.scala — CLI integration and tooling helpers.
- CostAndBudgets.scala — Cost tracking and budgets-related helpers.
- DepMap.scala — Dependency mapping and visualization utilities.
- FirestoreAndStorage.scala — Firestore/Storage integration helpers and rules validation.
- Frontend.scala — Frontend-oriented tasks/runners.
- IngestWorker.scala — Ingestion workflow hooks and runners.
- MigrationsAndScripts.scala — Data migrations and administrative scripts.
- NlpWorker.scala — Study materials (flashcards/quizzes/worksheets) generation.
- OperationsAndTelemetry.scala — Locks, retries, metrics, and ops hooks.
- Publisher.scala — Publishing workflow to update manifests/status and links.
- SecurityAndAuth.scala — Security and auth-related checks/setup.
- TestingAndQa.scala — Testing and smoke/QA helpers.
- ThemingAssets.scala — Theming assets and tokenization helpers.
- TtsWorker.scala — Narration/TTS related tasks.
- VideoComposer.scala — Video composition helpers and runners.
- teachers/ — Domain-specific helpers (expand as those agents land).

Conventions and guarantees
- ista.name = "Cornerstone"; include in lock/idempotency scoping.
- Locks: Use SegKala or equivalent; ensure proper session keys and end markers.
- Idempotency: Prefer deterministic keys (e.g., contentHash + generatorVersion) and map 409 conflicts to safe skips.
- Telemetry: Emit counters by Kala type and ista.name; follow operations-and-telemetry guidance.
- Pathing: Use repo-relative paths and avoid absolute local paths in agents/runners.
- Preloads: Keep preloads scoped to repo files (SPEC.md, architecture/plan docs, etc.).

Developing new workflows
- Follow the AWFL Agent runner structure; expose background runners for CLI.
- Add idempotency keys and distributed locks early; design steps to be resumable.
- Update this README’s index with a one-liner and link relevant architecture/plan docs.
- Compile early/often; keep YAML gens up to date and checked in where relevant.

Placeholders (to expand as more agents land)
- End-to-end examples (CLI invocations and expected artifacts)
- Troubleshooting (common lock/idempotency/permission issues)
