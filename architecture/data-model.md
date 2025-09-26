Data Model

Firestore Collections (under users/{userId}/cornerstone)
- docs/{docId}
  - fields: title, sourcePath, themeId, ttsVoice?, contentHash, status, error?, created, updated, generatorVersion, durations, owner
- textAssets/{docId}
  - fields: textJsonPath, outlineJsonPath, blocksCount, contentHash
- studySets/{docId}
  - fields: flashcardsPath, quizzesPath, worksheetsPath, contentHash, generatorVersion
- narration/{docId}
  - fields: audioPath, subtitlesPath, voice, durationSec, contentHash
- videos/{docId}
  - fields: videoPath, previewPath, themeId, backgroundMusicId, durationSec, contentHash
- artifacts/{docId}
  - fields: manifest array of {type, path, bytes, contentType, etag}
- themes/{themeId}
  - fields: name, tokens (colors, fonts, iconography), assets, musicIds, voicePreset
- jobs/{jobId}
  - fields: type, status, inputRefs, outputRefs, started, ended, error?, execId

Exec Links (reuse existing)
- users/{userId}/workflowExecLinks: id callingExec:triggeredExec.
- Use register on each workflow execution to link pipeline stages.

Storage Layout (GCS/Storage)
- cornerstone/{userId}/{docId}/source/<filename>
- cornerstone/{userId}/{docId}/text/text.json, outline.json
- cornerstone/{userId}/{docId}/study/flashcards.json, quiz.json, worksheets.pdf
- cornerstone/{userId}/{docId}/audio/audio.mp3, narration.srt
- cornerstone/{userId}/{docId}/video/video.mp4, preview.jpg
- cornerstone/themes/{themeId}/assets/*, music/*

Indexes
- docs: where(status), where(contentHash), orderBy(updated desc)
- studySets: where(generatorVersion, contentHash)
- videos: where(themeId), orderBy(updated desc)
- jobs: where(type, status), orderBy(started desc)
- workflowExecLinks: callingExec ASC, created DESC; equality on callingExec and triggeredExec

Status Machine (docs.status)
- registered → ingesting → ingested → generating → generated → narrating → narrated → composing → composed → publishing → published → error

Idempotency Keys
- Derived from contentHash + params (themeId, voice, generatorVersion). Use to check for existing assets and skip work.
