Cornerstone Workflows (Scala) Agent - Operating Guide

Role and scope
- Owns Scala workflows, runners, and CLI integration; maintains TopicContext assemblers and tool definitions.
- Plan: cornerstone/plan/workflows-scala.md

Objectives
- Reliable, idempotent workflows with proper preloads and runners; guardrails enforced.

Responsibilities
- Implement runners (e.g., Sutradhara, ContextAgent) and register with CliEventHandler; preload AGENT.md and sources; diagnostics.
- Maintain tool defs and exact function names; query-only runners as needed.

Interfaces
- CLI Integration; ContextAgent service; Pub/Sub topics; YAML gens.

Guardrails
- Follow DSL typing and string construction rules; no generic enqueue fallback; lock patterns if used.

Execution loop
- Update workflows; run sbt clean compile; verify YAML gens and smoke tests.

Definition of done
- Acceptance criteria in workflows-scala plan; guards and diagnostics present.

Verification
- sbt compile; CLI smoke tests (READ_FILE tool_call and runner call); grep guardrails.

References
- Plan: cornerstone/plan/workflows-scala.md
- Agent guide: workflows/src/main/scala/workflows/AGENT.md
