TTS Worker Plan

Scope
- Convert section text into themed narration audio with subtitles.
- Optimize cost and speed via caching and parallelization.

Dependencies
- Ingest normalized text + outline with contentHash.
- Theme voice presets (architecture/theming.md) available.
- ffmpeg tool available for stitching and normalization (or use Node bindings).

Inputs/Outputs
- Input: docId, sections [{id, text, order}], themeId, voicePreset?, contentHash.
- Output (Storage):
  - cornerstone/{userId}/{docId}/audio/audio.mp3
  - cornerstone/{userId}/{docId}/audio/narration.srt (and .vtt)
  - Optional: per-section audio cache audio/{sectionId}-{voiceHash}.mp3
- Firestore: users/{uid}/cornerstone/narration/{docId}
  - { audioPath, subtitlesPath, voice, durationSec, contentHash }

Tasks
1) Voice presets and mapping
- [ ] Define default voice per theme (voice name, speakingRate, pitch, effectsProfile).
- [ ] Allow override on request; compute voiceHash = hash(voicePreset JSON).
- [ ] Fallback logic if region/voice unavailable.

2) Text segmentation and SSML
- [ ] Build SSML per section with <break time> between sentences.
- [ ] Escape special chars; support prosody (rate, pitch) from preset.
- [ ] Insert <mark> tokens at sentence boundaries for timing extraction.

3) Synthesis engine
- [ ] Implement Google Cloud TTS client with retry/backoff.
- [ ] audioConfig: MP3, sampleRateHz=48000, speakingRate/pitch from preset.
- [ ] Optional multi-region routing to avoid throttling.

4) Caching strategy
- [ ] Key: hash(sectionTextNormalized + voiceHash) → sectionAudioKey.
- [ ] Before synthesis, check Storage for existing cached per-section audio by key.
- [ ] If found, reuse; else synthesize and upload with metadata {textHash, voiceHash}.

5) Stitching and normalization
- [ ] Concatenate per-section MP3s with crossfade=0 and fixed gap (e.g., 250ms) unless SSML includes final trailing pause.
- [ ] Normalize loudness to -14 LUFS integrated; peak -1 dBFS.
- [ ] Export audio.mp3 at 192kbps CBR, 48kHz.

6) Subtitles generation
- [ ] Use SSML <mark> timings to build SRT and WEBVTT.
- [ ] If no timings, approximate by words-per-minute from speakingRate.
- [ ] Ensure line length <= 42 chars; two-line max; 1–7s per cue.

7) Storage and metadata
- [ ] Upload audio.mp3 and narration.srt/.vtt; set contentType and cacheControl.
- [ ] Set custom metadata: {contentHash, voiceHash, generatorVersion}.

8) Firestore updates and status
- [ ] Update narration/{docId} doc and docs/{docId}.status transitions: narrating → narrated.

9) Telemetry and costs
- [ ] Record tts_seconds, bytes_out, and estimated cost ($/min).

10) Errors and retries
- [ ] Map transient errors to retry with exponential backoff; on permanent, set docs.status=error with code.

Acceptance criteria
- Re-running with same inputs results in cache hit and identical audio path.
- Audio passes loudness checks; no clipping; duration within ±2% of expected.
- Subtitles in sync within ±300ms median.

Verification
- Unit tests for SSML builder and subtitle segmenter.
- Integration test on sample sections; assert Storage objects and metadata.
- Listen spot-check; measure LUFS with ffmpeg loudnorm report.

References
- Spec: ../SPEC.md
- Architecture: ../architecture/pipeline.md
