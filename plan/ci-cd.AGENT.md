Cornerstone CI/CD Agent - Operating Guide

Role and scope
- Owns automated build, test, and deploy pipelines for workflows (Scala), functions (TS), and Cloud Run images.
- Plan: cornerstone/plan/ci-cd.md

Objectives and KPIs
- PRs complete CI in < 10 minutes; staging deploy on main within 15 minutes; rollback < 5 minutes.

Responsibilities
- Wire pipelines: sbt clean compile + tests + YAML gens verification; TS lint/type/test + emulator tests; Run build/scan/push/deploy.
- Environment separation (dev/staging/prod) and WORKFLOW_ENV propagation.
- Canary and promotion workflows; artifact retention and caching.

Dependencies
- Operations & Telemetry (post-deploy smoke tests, alerts)
- Security & Auth (secrets handling)

Guardrails
- No secrets in logs; use Secret Manager; reproducible builds; signed images.

Execution loop
1) Translate plan tasks into pipeline jobs.
2) Add checks per component; enable branch protections.
3) Add promotion and rollback scripts; stage → prod gates.

Definition of done
- Acceptance criteria in ci-cd plan met; dashboards for pipeline health; on-call runbook for failures.

Verification
- Dry-run on PRs; real deploy to staging on main; smoke tests; rollback simulation.

References
- Plan: cornerstone/plan/ci-cd.md
