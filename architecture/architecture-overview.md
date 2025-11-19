Architecture Overview

Objective
- Implement Cornerstone: transform uploaded documents into narrated videos and study materials (flashcards, worksheets, quizzes) with themed UI and background music.
- Reuse TopAigents DSL/workflows and utilities across orchestration, locking, and exec-linking.

Core Components
- Web App (copy awfl-web approach):
  - Upload files, choose theme, preview/publish outputs.
  - Calls API to register docs and kickoff processing; streams status via Firestore/exec links.
- API/Server (Firebase Functions/Express):
  - Issue signed upload URLs or accept direct uploads to Firebase Storage.
  - Register docs, enqueue workflows, expose doc/job status, list artifacts.
- Storage (Firebase Storage/GCS):
  - Buckets for sources and generated assets (text JSON, audio, video, images, subtitles, flashcards JSON, quizzes, worksheets PDFs).
- Firestore (metadata/state):
  - users/{userId}/cornerstone/{collections} for docs, jobs, artifacts, themes, and settings.
  - Reuse users/{userId}/workflowExecLinks for exec linkage and traversal.
- Workflow Orchestrator (Scala DSL):
  - Event-driven workflows implement ingest → NLP → TTS → video → publish pipeline; idempotent with distributed locks.
- Workers:
  - Ingest Worker: text extraction (PDF/doc/HTML), normalization and chunking.
  - NLP Worker: LLM summarization; flashcards/worksheets/quizzes generation.
  - TTS Worker: synthesize audio (Cloud TTS), per-section stitching.
  - Video Composer: ffmpeg overlays, theme assets, subtitles, background music mix.
  - Publisher: write artifacts, update Firestore, set CDN cache headers.

High-level Flow
1) Upload file → registerDoc(userId, sourcePath, theme, options).
2) IngestWorkflow extracts text and structure; write TextAsset and Outline.
3) StudyMaterialsWorkflow produces flashcards, quizzes, worksheets.
4) NarrationWorkflow generates TTS audio and subtitles.
5) VideoWorkflow composes themed video with background music.
6) PublishWorkflow writes artifacts, backfills exec links, updates status.
7) UI polls/streams status; user can re-theme/regenerate selectively.

Non-Goals (MVP)
- No multi-language TTS beyond en-US initially.
- No live editing of generated questions; provide export and basic review first.

Key Reuse from TopAigents
- DSL Workflows: Workflow, AWFL Agent runner pattern, CliEventHandler.
- Distributed locks pattern scoped by ista.name and Kala type.
- Exec link model and endpoints to stitch multi-job pipelines.
- HTTP post helper, Pub/Sub conventions, and telemetry guards.
