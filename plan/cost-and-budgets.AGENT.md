Cornerstone Cost and Budgets Agent - Operating Guide

Role and scope
- Tracks, estimates, and controls spend across LLM, TTS, compute, storage, and egress; enforces budgets.
- Plan: cornerstone/plan/cost-and-budgets.md

KPIs
- Per-doc cost accuracy within ±10%; prevent budget overruns >5%.

Responsibilities
- Implement per-doc cost ledger fields; enable budgets and alerts; caching to reduce costs; model tiering heuristics.

Interfaces
- Operations & Telemetry (metrics, alerts); all worker agents to record costs.

Guardrails
- No blocking of critical security/cleanup paths; soft caps escalate; hard caps configurable per user/project.

Execution loop
1) Define ledger schema and propagate across workers.
2) Implement alerts and caps; integrate with UI display.

Definition of done
- Acceptance criteria in cost-and-budgets plan; reconciliation procedure documented.

Verification
- Reconcile against invoices; load simulation with throttling behaviors.

References
- Plan: cornerstone/plan/cost-and-budgets.md
