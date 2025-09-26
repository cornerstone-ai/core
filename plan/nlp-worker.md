NLP Worker Plan

Scope
- Generate outline, summaries, flashcards, quizzes, and worksheet prompts.

Tasks
- [ ] Chunking strategy based on headings and token budget.
- [ ] Prompt templates and guardrails aligned to exam-quality outputs.
- [ ] Implement calls via services.Llm; tiered models by stage (cheap for chunking, higher for final Q/A).
- [ ] Deterministic IDs for items (hash of prompt+section).
- [ ] Write flashcards.json and quiz.json; optionally worksheets.json for PDF renderer.
- [ ] Idempotency via contentHash+generatorVersion.
- [ ] Cost tracking: tokens used per doc.
- [ ] Quality checks: minimum items, duplicates, hallucination heuristics.

Acceptance criteria
- Outputs are reproducible for same inputs and version.
- Meets minimum counts (e.g., 20 flashcards per 30 pages, adjustable).
- Costs logged and within budget caps.

References
- Spec: ../SPEC.md
- Architecture: ../architecture/pipeline.md
