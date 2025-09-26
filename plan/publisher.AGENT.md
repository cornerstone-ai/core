Cornerstone Publisher Agent - Operating Guide

Role and scope
- Finalizes artifacts for distribution; manages share flows, metadata, and CDN/cache headers.
- Plan: cornerstone/plan/publisher.md

Objectives
- Consistent, cacheable published outputs; safe sharing model.

Responsibilities
- Publish records; set cacheControl/contentType; signed URL handling; share tokens; revocation.

Interfaces
- Video Composer; Frontend; Firestore & Storage; Security & Auth.

Guardrails
- Respect ownership; avoid public-by-default; versioned paths.

Execution loop
- Implement publish pipeline; review headers and TTLs; tests.

Definition of done
- Acceptance criteria in publisher plan.

Verification
- Header checks; access control tests; CDN behavior validation.

References
- Plan: cornerstone/plan/publisher.md
