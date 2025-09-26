CI/CD Plan

Goals
- Automated build, test, and deploy across workflows, functions, and Cloud Run.

Environments
- dev, staging, prod with separate projects or prefixes; WORKFLOW_ENV suffix propagated.

Pipelines
- [ ] Workflows (Scala): sbt clean compile; run unit tests; verify YAML gens; artifact cache.
- [ ] Functions (TS): lint, type-check, unit tests; emulator integration tests.
- [ ] Cloud Run (ffmpeg): build container; scan (Trivy); push; deploy with revisions.
- [ ] IaC: indexes, rules, and minimal config checked in and deployed.
- [ ] Tagging/versioning: generatorVersion bump on breaking changes.

Deploy Strategy
- [ ] Staging canary, manual promotion to prod.
- [ ] Rollback scripts for functions/run images.

Acceptance criteria
- PR must pass all checks; main branch auto-deploys to staging.
- One-click promote to prod; rollback < 5 minutes.

Verification
- Dry-run deploys on PR; post-deploy smoke tests.

References
- Spec: ../SPEC.md
- Architecture: ../architecture/operations-and-telemetry.md
