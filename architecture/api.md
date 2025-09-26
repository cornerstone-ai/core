API Endpoints (Firebase Functions/Express)

Uploads
- POST /api/cornerstone/uploads/sign
  - body: { filename, contentType }
  - reply: { url, headers, path }

Documents
- POST /api/cornerstone/docs/register
  - body: { sourcePath, title?, themeId, options? }
  - reply: { docId, execId }
- POST /api/cornerstone/docs/:docId/generate
  - body: { stages?: [ingest|study|narration|video|publish], force?: boolean }
  - reply: { execId }
- GET /api/cornerstone/docs/:docId
  - reply: doc metadata/status
- GET /api/cornerstone/docs/:docId/artifacts
  - reply: { artifacts: [...] }

Themes
- GET /api/cornerstone/themes
  - reply: [ {themeId, name, tokens, assets, sampleMusicIds, voicePreset} ]
- POST /api/cornerstone/docs/:docId/theme
  - body: { themeId }
  - reply: { execId }

Jobs/Exec
- GET /api/workflows/exec/links/by-calling/:callingExecId
- GET /api/workflows/exec/links/by-triggered/:triggeredExecId
- GET /api/workflows/exec/links/latest/:callingExecId

Auth and Rules
- Firebase Auth required; userId from token.
- Firestore rules restrict to users/{uid} path; functions verify ownership for sourcePath.

Examples
- curl -X POST /api/cornerstone/docs/register -d '{"sourcePath":"cornerstone/u1/d1/source/file.pdf","themeId":"pink"}'
- curl -X POST /api/cornerstone/docs/d1/generate -d '{"stages":["study","video"]}'
