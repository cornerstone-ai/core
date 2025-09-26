Backlog and Milestones

MVP (Phase 1)
- Upload + register endpoints and UI wiring.
- IngestWorkflow (PDF/DOCX/HTML) with text.json and outline.json.
- StudyMaterialsWorkflow generating flashcards.json and quiz.json.
- NarrationWorkflow with Cloud TTS and subtitles.
- VideoWorkflow composing simple background + subtitles + music.
- PublishWorkflow, manifests, and UI previews.
- Firestore rules and indexes; basic telemetry.

Phase 2
- Worksheets PDF generator with layout templates.
- RethemeWorkflow; advanced overlays and animations.
- Caching and reuse across docs; per-section TTS caching.
- Improved question quality with higher-tier model and review UI.

Phase 3
- Multi-language support; voice cloning options.
- Collaboration/sharing; export to Anki/Quizlet and MP4 download CDN.
- Mobile-friendly optimizations.

Engineering Tasks
- Create Cornerstone Scala workflows and register runners.
- Add server endpoints in functions (cornerstone/*.js) reusing existing utils.
- Implement ffmpeg Cloud Run image and deploy.
- Define Firestore indexes and deploy rules.
- Add UI routes/components in awfl-web.
- Write migration/ops scripts as needed.
