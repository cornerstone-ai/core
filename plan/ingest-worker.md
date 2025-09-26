Ingest Worker Plan

Scope
- Convert user-uploaded source files into normalized text, structure, and metadata; compute content hashes; generate thumbnails; persist artifacts; and update the doc record to drive downstream workflows (NLP, TTS, Video).

Triggers and Inputs
- Trigger
  - Firestore: on docs/{docId} created or on status=registered (preferred for control) OR
  - HTTP: invoked by API register endpoint (passes docId, sourcePath, force)
- Inputs
  - userId (from auth)
  - docId
  - sourcePath (Storage path gs:// or /cornerstone/{uid}/source/...)
  - contentType (optional, will be validated/sniffed)
  - force (optional): bypass cache if true

Outputs
- Firestore docs/{docId}
  - status transitions: registered -> ingesting -> ingested | error
  - fields: contentHash, sourceHash, generatorVersion, pageCount, textChars, ingestMs, error{code,message}
- Storage artifacts under cornerstone/{uid}/docs/{docId}/{generatorVersion}/
  - text.json (normalized text)
  - structure.json (sections, headings, TOC, page map)
  - chunks.jsonl (token-aware segments with offsets)
  - cover.png (first-page or best thumbnail)
  - meta.json (mime, bytes, sourceHash, textHash, timings)

Supported Formats (MVP → later)
- MVP: PDF, plain text (.txt), HTML
- Later: DOCX, EPUB, image bundles (OCR), MD

Pipeline Stages
1) Validate source
   - Confirm sourcePath ownership: must start with cornerstone/{uid}/source/
   - HEAD object: size limit (e.g., 50 MB MVP), contentType allowlist
   - Compute sourceHash = sha256(bytes)
2) Extract
   - PDF: pdfium/poppler extract text per page; render page 1 thumbnail (300px wide)
   - TXT: read as UTF-8, normalize newlines
   - HTML: sanitize, strip scripts/styles, readability extraction, keep headings
   - Optional OCR path for image-only PDFs (Tesseract/Document AI text detection)
3) Normalize
   - Unicode NFC; collapse excessive whitespace; preserve paragraph breaks
   - Detect headings via font size/weight (PDF) or tags (HTML)
   - Build structure.json: sections with start/end page offsets; pageCount
4) Chunk
   - Token-aware chunker (target 800–1200 tokens, 15% overlap ≈ 120–180 tokens)
   - Preserve section boundaries; include heading context on each chunk
   - Emit chunks.jsonl: {chunkId, text, tokens, sectionPath, start,end}
5) Hashing and caching
   - textHash = sha256(normalized text)
   - contentHash = sha256(textHash + "|" + mime + "|" + generatorVersion)
   - If existing doc has same contentHash and force != true: short-circuit (idempotent)
6) Persist artifacts
   - Write artifacts to versioned path; set metadata: contentType, cacheControl, contentHash, generatorVersion
7) Update doc
   - Set status=ingested, contentHash, metrics (textChars, pageCount, ingestMs)
   - Append audit entry and job lineage link
8) Notify downstream
   - Publish job event or set flag to trigger NLP worker (derive-only if already present)

Data Model and Paths
- Storage
  - cornerstone/{uid}/source/{file}
  - cornerstone/{uid}/docs/{docId}/{generatorVersion}/{text.json, structure.json, chunks.jsonl, cover.png, meta.json}
- Firestore
  - docs/{docId}: { userId, sourcePath, status, contentHash, generatorVersion, metrics, created, updated }
  - jobs/{jobId}: type=ingest, status, timings, error

Idempotency and Locking
- Lock key: locks.cornerstone.Ingest:{docId}:{generatorVersion}
- Acquire-then-work with TTL; release if owned; operations safe to re-run (contentHash gates)
- force=true bypasses cache and regenerates artifacts under new generatorVersion if bumped

Performance and Scaling
- Offload heavy PDF render/OCR to Cloud Run service with concurrency; Functions/Workers orchestrate
- Stream downloads/uploads; avoid loading entire file into memory when possible
- Timeouts: 5 min soft, 10 min hard (MVP); resume-safe since idempotent

Security
- Enforce user ownership on reads/writes; never read outside user prefix
- Sanitize HTML; limit file types; guard against zip-bombs/huge pages
- Signed URL usage limited by contentType and length; verify on callback

Telemetry and Metrics
- ingest_ms, page_count, text_chars, ocr_ratio, cache_hit(boolean), bytes_in, bytes_out
- Error taxonomy: unsupported_type, ocr_failed, extract_failed, persist_failed, rule_violation

Dependencies
- Storage bucket and rules; Firestore rules; Cloud Run (pdf/ocr) image; Exec links helper
- Workflows runners available for downstream

Tasks
- [ ] Define API contract for register→ingest handoff (doc schema, statuses)
- [ ] Implement ownership checks and HEAD validation
- [ ] Build extractors: PDF, TXT, HTML; render thumbnail
- [ ] Implement normalize + structure builder
- [ ] Implement token-aware chunker with overlap
- [ ] Compute hashes; implement cache short-circuit and force override
- [ ] Persist artifacts with metadata; write meta.json
- [ ] Update doc and job records; emit lineage links
- [ ] Add metrics and logging; expose counters and timings
- [ ] Unit tests for parsers and chunker; emulator tests for rules; integration with sample PDFs

Acceptance Criteria
- Given a PDF upload and register call, doc transitions to ingested with artifacts present
- Re-register same file (no force) is a fast no-op (cache hit)
- force=true regenerates artifacts under current generatorVersion
- Unsupported types return clear error with no partial writes

Verification
- Golden sample suite: small, medium, image-only PDF; HTML; TXT
- Compare chunk token counts within ±10%; verify headings retained in chunk context
- Stress test: 50 concurrent ingests; no cross-user leaks; no missing indexes

References
- Spec: ../SPEC.md
- Architecture: ../architecture/pipeline.md
