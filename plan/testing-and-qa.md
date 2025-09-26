Testing and QA Plan

Goals
- Ensure correctness, stability, and user experience quality across the pipeline.

Test Types
- Unit tests: SSML builder, subtitle splitter, manifest diff, status machine.
- Integration tests: API endpoints + emulator; worker end-to-end on sample docs.
- E2E UI (Cypress): upload→publish→preview; re-theme flow.
- Performance tests: large PDFs; TTS and video composition timings.
- Security tests: rules enforcement, auth bypass, path traversal.

Data Sets
- Sample PDFs (text-heavy, image-heavy), DOCX, HTML.
- Golden outputs for flashcards/quiz and short audio/video clips.

Tasks
- [ ] Set up emulator-based integration suite for API and Firestore rules.
- [ ] Create golden files and tolerances for A/V verification (duration ±0.5s, LUFS -14±1).
- [ ] Load test: 50 concurrent docs end-to-end in dev.
- [ ] Accessibility tests with axe-core; keyboard navigation checks.
- [ ] Pen test checklist and scripts.

Acceptance criteria
- All tests green in CI; flake rate < 1%.
- E2E passes against staging before prod promotion.

Verification
- Test reports archived; trend dashboards for perf and flake.

References
- Spec: ../SPEC.md
- Architecture: ../architecture/operations-and-telemetry.md
