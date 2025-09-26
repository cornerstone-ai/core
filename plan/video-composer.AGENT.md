Cornerstone Video Composer Agent - Operating Guide

Role and scope
- Composes final videos from narration, study assets, and theme; emits playable media with captions.
- Plan: cornerstone/plan/video-composer.md

Objectives
- Render reliably within time bounds; consistent theming; correct captions.

Responsibilities
- ffmpeg (or Run service) composition; sidecar subtitles; generatorVersion management; artifacts and metadata.

Interfaces
- TTS Worker; Theming Assets; Publisher; Frontend.

Guardrails
- Stream I/O; resource caps; resumability.

Execution loop
- Implement composition pipeline; optimize performance; tests.

Definition of done
- Acceptance criteria in video-composer plan.

Verification
- Playback tests; subtitle sync validation; performance benchmarks.

References
- Plan: cornerstone/plan/video-composer.md
