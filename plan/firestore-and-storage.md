Firestore and Storage Plan

Tasks
- [ ] Create collections and sample docs per architecture/data-model.md.
- [ ] Define and deploy indexes:
  - [ ] docs: where(status), where(contentHash), orderBy(updated desc)
  - [ ] studySets: where(generatorVersion, contentHash)
  - [ ] videos: where(themeId), orderBy(updated desc)
  - [ ] jobs: where(type, status), orderBy(started desc)
  - [ ] workflowExecLinks: callingExec ASC, created DESC; equality on callingExec and triggeredExec
- [ ] Set up Storage buckets/paths with lifecycle policies (expire temp files after 7 days).
- [ ] Storage metadata conventions (contentType, cacheControl, custom metadata for contentHash, generatorVersion).
- [ ] Firestore rules and Storage rules deployment pipeline.

Acceptance criteria
- Emulator + production index definitions match; no missing index errors under expected queries.
- All artifacts have correct contentType and cache headers.

Verification
- Emulator tests creating docs and running queries.
- Script to validate Storage object metadata for a sample doc.

References
- Spec: ../SPEC.md
- Architecture: ../architecture/data-model.md
