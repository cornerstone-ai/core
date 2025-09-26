Cornerstone Architecture Docs

Purpose
- This folder outlines the architecture required to implement the Cornerstone app described in SPEC.md.
- Goals: transform uploaded documents into (a) narrated videos, (b) flashcards, (c) worksheets, and (d) quizzes; provide themed UI with background music.
- Constraints: maximize reuse of existing TopAigents DSL, workflows, and utilities; align with existing Firebase/GCP stack and conventions.

Contents
- architecture-overview.md: High-level system diagram and flows
- components.md: Services and responsibilities
- workflows.md: Scala DSL workflows to orchestrate processing
- data-model.md: Firestore collections, Storage layout, and indexes
- api.md: HTTP endpoints (client/server) and events
- pipeline.md: End-to-end processing stages and idempotency
- theming.md: Theme token system and assets
- operations-and-telemetry.md: Locks, retries, metrics, and budgets
- backlog.md: Implementation plan and milestones

How this integrates with TopAigents
- Reuse workflows DSL (workflows/src/main/scala/workflows) for orchestration.
- Leverage existing runners and patterns: Tools.invokerRunner, CliEventHandler, distributed locks, and Exec link model.
- Implement server-side workers using Firebase Functions/Cloud Run where appropriate; follow collection and index conventions.
