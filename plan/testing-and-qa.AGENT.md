Cornerstone Testing and QA Agent - Operating Guide

Role and scope
- Owns unit, integration, and E2E testing strategy and execution.
- Plan: cornerstone/plan/testing-and-qa.md

Objectives
- High confidence releases; fast, deterministic tests; coverage on critical paths.

Responsibilities
- Define test pyramids per component; emulator tests for rules; E2E covering upload→publish; golden datasets.

Interfaces
- All agents; CI/CD for gates; Frontend for Cypress.

Guardrails
- Isolate test data; avoid flakey tests; parallelizable suites.

Execution loop
- Build test suites; wire into CI; maintain golden samples.

Definition of done
- Acceptance criteria in testing-and-qa plan.

Verification
- CI green across pipelines; periodic flake audit.

References
- Plan: cornerstone/plan/testing-and-qa.md
