Processing Pipeline

1) Register/Upload
- Client uploads to Storage via signed URL; calls docs.register.
- Server computes storage etag and basic metadata; sets docs.status=registered.

2) Ingest
- Lock acquisition (locks.Cornerstone.SegKala with id docId:contentHash:end).
- Extract text/structure; write text.json and outline.json; status=ingested.

3) Study Materials
- Chunk text; LLM prompts for flashcards/quiz/worksheets.
- Outputs written to Storage; status=generated.

4) Narration
- Select TTS voice based on theme; synthesize per section; produce audio.mp3 and narration.srt; status=narrated.

5) Video Composition
- Use ffmpeg to compose: background, overlay theme assets (pearls, icons), place text cards optionally, add subtitles, and mix background music.
- Produce video.mp4 and preview.jpg; status=composed.

6) Publish
- Write artifact manifest; update docs and derived collections; backfill exec links; status=published.

Idempotency and Recompute
- Key = hash(sourceBytes) + params(themeId, generatorVersion).
- If identical key exists, skip regeneration or reuse artifacts.
- Retheme triggers only composition step unless voice changes.

Error Handling
- On failure: set status=error with error.code/message; allow retry with force=true to ignore cache.

Performance Considerations
- Parallelize Study Materials and Narration after Ingest.
- Cache TTS per-section by textHash+voice.
- Use low-cost LLM tier for chunking, higher tier for exam-quality questions.
