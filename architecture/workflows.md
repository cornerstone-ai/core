Workflows (Scala DSL)

Naming
- Family name: cornerstone (ista.name = "Cornerstone") for lock and collection scoping.

Runner Exposure
- Add a query-only runner CornerstoneRunner similar to WorkflowBuilder for background ops.
- CLI integration for testing via awfl-cli.sh.

Core Workflows
1) IngestWorkflow
- Trigger: docs.registered or Storage finalize event.
- Steps: acquire lock → compute contentHash → extract text → write TextAsset → enqueue next.
- Lock collection: locks.Cornerstone.SegKala (session scoped by docId:hash).

2) StudyMaterialsWorkflow
- Trigger: ingest.completed.
- Steps: chunk text → prompt LLM → create flashcards.json, quiz.json, worksheets.pdf.
- Idempotency key: contentHash + generatorVersion.

3) NarrationWorkflow
- Trigger: ingest.completed.
- Steps: select voice by theme → synthesize per-section → stitch → subtitles.
- Output: audio.mp3, narration.srt.

4) VideoWorkflow
- Trigger: narration.completed.
- Steps: pick theme assets + background music → ffmpeg compose → produce mp4/webm.

5) PublishWorkflow
- Trigger: study/video completed or via generate API.
- Steps: update Firestore docs status, write artifact manifests, backfill exec links.

6) RethemeWorkflow (optional)
- Trigger: user updates theme selection.
- Steps: reuse narration if voice unchanged; recompose video with new assets/music.

Implementation Notes
- Use the AWFL Agent runner pattern to expose a Cornerstone background runner.
- Reuse post(...) helper to call server endpoints from workflows when needed.
- Capture telemetry counters per Kala type and ista.name.
- Ensure toolCallBackfill and sizeLimiter filters are honored in TopicContextYoj.
