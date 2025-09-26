Workflows (Scala DSL) Plan

Goals
- Implement orchestration in Scala DSL with idempotent, locked stages and exec linking.

Tasks
- [ ] Create Cornerstone package under workflows/src/main/scala/workflows/cornerstone/workflows.
- [ ] Define ista.name = "Cornerstone"; verify non-empty before lock keys.
- [ ] Implement IngestWorkflow with distributed lock (SegKala docId:contentHash:end).
- [ ] Implement StudyMaterialsWorkflow with idempotency key contentHash+generatorVersion.
- [ ] Implement NarrationWorkflow selecting voice from theme.
- [ ] Implement VideoWorkflow composing outputs with ffmpeg container.
- [ ] Implement PublishWorkflow writing manifests and updating Firestore.
- [ ] Optional RethemeWorkflow.
- [ ] Add Tools.invokerRunner for Cornerstone; sessionId background-Cornerstone.
- [ ] Preload AGENT.md and workflow source; include diagnostics (yaml gens, now UTC).
- [ ] Register runners in CliEventHandler; enforce TopicContext filter order.
- [ ] Telemetry counters tagged by KalaType and ista.name; map 409 to skip.
- [ ] Compile and verify YAML gens changed; CLI smoke test.

Acceptance criteria
- sbt clean compile succeeds; CLI can call each workflow.
- Lock semantics observed; repeated runs are idempotent.
- Exec links correctly stitched between stages.

References
- Spec: ../SPEC.md
- Architecture: ../architecture/workflows.md
