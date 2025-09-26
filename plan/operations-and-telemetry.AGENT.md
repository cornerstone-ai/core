Cornerstone Operations and Telemetry Agent - Operating Guide

Role and scope
- Provides logging, metrics, tracing, alerts, and dashboards across the system.
- Plan: cornerstone/plan/operations-and-telemetry.md

Objectives
- Actionable alerts; SLO dashboards; request/job lineage visibility.

Responsibilities
- Structured logs with requestId/userId/docId; metrics for each worker; error taxonomy; dashboards and alerts.

Interfaces
- All agents; Cost & Budgets; CI/CD for post-deploy checks.

Guardrails
- PII minimization; redaction; rate limiting on logs.

Execution loop
- Instrument components; build dashboards; define alerts; test paging.

Definition of done
- Acceptance criteria in operations-and-telemetry plan.

Verification
- Synthetic checks; load tests; alert fire drills.

References
- Plan: cornerstone/plan/operations-and-telemetry.md
