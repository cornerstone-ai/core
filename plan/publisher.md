Publisher Plan

Scope
- Persist artifacts, update Firestore state, and wire exec links.

Dependencies
- Prior stages produce artifacts and manifests.
- Firestore collections and indexes deployed.

Inputs/Outputs
- Input: docId, artifact list [{type, path, bytes?, contentType, metadata}], contentHash.
- Output: Firestore updates to docs/{docId}, artifacts/{docId}; status transitions; exec link backfills.

Tasks
1) Manifest creation
- [ ] Build artifact manifest with stable IDs and etags; include size, contentType, cacheControl.
- [ ] Store at users/{uid}/cornerstone/artifacts/{docId}.

2) Uploads and metadata
- [ ] Ensure all Storage objects have correct contentType and cache headers.
- [ ] Set custom metadata: {contentHash, generatorVersion, stage}.

3) Firestore state machine
- [ ] Implement status transitions and timestamps; validate allowed transitions.
- [ ] Write derived collections (textAssets, studySets, narration, videos) with references.

4) Exec links
- [ ] Register execution link for each stage using existing exec-links helpers.

5) Idempotency
- [ ] If identical manifest exists by key (contentHash+params), skip re-upload and just link.

6) Error handling
- [ ] On partial failure, mark status=error and leave manifest partial; allow resume with force.

Acceptance criteria
- UI can list artifacts via GET /docs/:docId/artifacts immediately after publish.
- Re-publish with same inputs performs no duplicate uploads.

Verification
- Unit tests for state transitions and manifest diffing.
- Integration tests validate Storage metadata and Firestore writes.

References
- Spec: ../SPEC.md
- Architecture: ../architecture/pipeline.md
