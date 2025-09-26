Video Composer Plan

Scope
- Compose narrated video using theme assets, background music, and subtitles.

Dependencies
- Narration audio + subtitles available.
- Theme assets and music available in Storage.
- ffmpeg container on Cloud Run with filters enabled (subtitles, drawtext, overlay, afilter loudnorm).

Inputs/Outputs
- Input: docId, audioPath, subtitlesPath, themeId, contentHash, options {resolution, fps, burnSubtitles?}.
- Output (Storage):
  - cornerstone/{uid}/{docId}/video/video.mp4 (H.264, AAC)
  - cornerstone/{uid}/{docId}/video/preview.jpg
  - Optional: video.webm
- Firestore: users/{uid}/cornerstone/videos/{docId}

Tasks
1) Container and runtime
- [ ] Build Cloud Run image with ffmpeg (static or alpine) + fonts + subtitle filter support.
- [ ] Mount GCS via signed URLs or gcsfuse (prefer signed URLs for portability).

2) Scene design and theming
- [ ] Define background loop or still per theme (1920x1080, 30fps default).
- [ ] Overlay assets (pearls/stars) with subtle motion via zoompan or overlay animations.
- [ ] Place theme watermark/icon minimally invasive.

3) Subtitles handling
- [ ] Option A: Burn-in via subtitles filter using WEBVTT→SRT conversion.
- [ ] Option B: Output sidecar .vtt and keep video clean; decide per options.burnSubtitles.

4) Background music
- [ ] Pick defaultTrackId from theme; loop or extend to match audio length.
- [ ] Mix with ducking under narration (sidechaincompressor) or simple gain scheduling.
- [ ] Normalize final loudness to -14 LUFS integrated.

5) Rendering pipeline
- [ ] Inputs: bg video or generated color; overlays; subtitles; audio narration; music.
- [ ] Output: MP4 H.264 (libx264) CRF 18–22; preset veryfast; tune film.
- [ ] Key ffmpeg filters: scale, overlay, subtitles, loudnorm, amix, asetpts.

6) Preview generation
- [ ] Extract mid-frame preview.jpg at 50% duration or first non-black frame.

7) Performance and cost
- [ ] Target < 2x realtime for 5–10 min videos on 1 vCPU.
- [ ] Constrain memory < 1.5GB; chunk if necessary.

8) Storage and metadata
- [ ] Upload video, preview with cacheControl and contentType; metadata includes contentHash and generatorVersion.

9) Status updates
- [ ] docs.status: composing → composed; update videos/{docId} with durationSec.

Acceptance criteria
- Video duration within ±0.5s of audio length; A/V sync maintained.
- Subtitles readable (font, size) and aligned with narration.
- No peaks above -1 dBFS; loudness -14±1 LUFS.

Verification
- Integration test: compose 60s sample; validate duration, VMAF>90 against baseline.
- Visual QA checklist per theme; automated color/contrast checks if feasible.

References
- Spec: ../SPEC.md
- Architecture: ../architecture/pipeline.md
