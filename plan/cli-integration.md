CLI Integration Plan

Goals
- Enable developers to run and debug workflows locally and via CLI.
- Package awfl-cli so it can be installed and used across projects (Cornerstone and third-party repos) with minimal setup.

Packaging and distribution (new)
- Provide a pip-installable package (awfl-cli) with console scripts: awfl and awfl-cli.
- Recommend pipx for isolated installation; also provide a Docker image for hermetic runs.
- Configuration via repo-local .awfl/config.yaml (preferred) with env var overrides for CI/local.
- Ensure no TopAigents-specific constants are hardcoded; everything is configurable.

Tasks
- [ ] Package CLI
      - [ ] Add pyproject.toml with console_script entry points (awfl = cli.main:entrypoint).
      - [ ] Make PROJECT, LOCATION, subscription names, BASE_URL, API_ORIGIN, LLM_MODEL configurable via config and env.
      - [ ] Add config loader: search order → env → .awfl/config.yaml → defaults.
      - [ ] Add AWFL_WORKFLOWS_DIR and AWFL_PROJECT_ROOT detection (git repo root fallback).
      - [ ] Gate Pub/Sub consumers behind config flags (subscribe.autofunds, subscribe.cli_operations) to avoid accidental cross-project subscriptions.
      - [ ] Add `awfl init` to scaffold .awfl/config.yaml and optional .env with presets (e.g., --preset cornerstone).
      - [ ] Update commands.status to show effective configuration and sources (env vs file).
      - [ ] Update workflow discovery to use configured workflows_dir; keep interactive selector.
      - [ ] Provide Dockerfile and publish ghcr.io/topaigents/awfl-cli:latest.
      - [ ] Docs: installation via pipx, uvx, docker; Windows/macOS/Linux notes.
- [ ] Add Cornerstone runner similar to WorkflowBuilder (background-Cornerstone sessionId).
- [ ] Expose an AWFL Agent runner endpoint for query-only operations (status, dry-run checks).
- [ ] Ensure CliEventHandler registers Cornerstone runners.
- [ ] Provide awfl-cli.sh examples:
      ./awfl-cli.sh call cornerstone-workflows-IngestWorkflow '{"docId":"d1"}'
      ./awfl-cli.sh call cornerstone-workflows-VideoWorkflow '{"docId":"d1"}'
- [ ] Document common troubleshooting: missing indexes, permissions, lock collisions.
- [ ] Add smoke tests for packaging flows (pipx install, docker run) and basic commands.

Config model
- File: .awfl/config.yaml at project root (checked into repo). Example keys:
  project_id: your-gcp-project
  location: us-central1
  api_origin: http://localhost:5050
  base_url: https://us-central1-your-gcp-project.cloudfunctions.net
  workflows_dir: ./workflows/yaml_gens
  watch:
    enabled: true
    patterns: ["**/*.md", "**/*.scala", "**/*.yaml"]
    trigger_regex: "\bai:"
  subscribe:
    cli_operations: false
    autofunds: false
  sessions:
    prefix: cornerstone
  tools:
    read_file_max_bytes: 200000
  auth:
    skip_auth: false

- Env overrides map 1:1 (e.g., AWFL_PROJECT_ID, AWFL_LOCATION, API_ORIGIN, BASE_URL, LLM_MODEL, READ_FILE_MAX_BYTES, SKIP_AUTH, ASSISTANT_WORKFLOW, AWFL_WORKFLOWS_DIR).
- Precedence: env > .awfl/config.yaml > hardcoded defaults.

Cornerstone preset
- `awfl init --preset cornerstone` writes:
  project_id: topaigents
  location: us-central1
  api_origin: http://localhost:5050
  base_url: auto (ngrok if present; else prod)
  workflows_dir: ../workflows/yaml_gens
  subscribe:
    cli_operations: true
    autofunds: true
  sessions:
    prefix: Cornerstone

Acceptance criteria
- Can install awfl-cli via pipx and run in any repo with .awfl/config.yaml.
- Can trigger each Cornerstone workflow from CLI and observe outputs.
- Tool calls route to correct Runner; unknown tools are rejected with helpful message.
- Pub/Sub consumers are optional and only bind to configured project/subscriptions.
- Docker image works with mounted repo and gcloud credentials.

Verification
- Smoke tests: READ_FILE tool_call and Cornerstone runner query.
- Packaging tests:
  - pipx install awfl-cli@local && awfl --version.
  - awfl init --preset cornerstone; awfl status shows config.
  - awfl workflows; awfl call cornerstone-workflows-IngestWorkflow '{"docId":"d1"}'.
  - docker run --rm -v $PWD:/work -v $HOME/.config/gcloud:/root/.config/gcloud ghcr.io/topaigents/awfl-cli:latest status.
- Checklist before commit: sbt clean compile; YAML gens updated; Pub/Sub endpoint canonical.

Troubleshooting
- Firestore indexes: run validation command; provide link to create index.
- Permissions: verify ADC or awfl login for API mode; show which principal is active.
- Lock collisions: describe lock namespace (locks.Cornerstone.*) and how to inspect.
- gcloud not installed (gcloud mode): fallback to API mode or prompt to install.

References
- CLI Agent: ../../../cli/AGENT.md
- Spec: ../SPEC.md
- Architecture: ../architecture/workflows.md
