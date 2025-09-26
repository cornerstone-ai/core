Cornerstone CLI Integration Agent - Operating Guide

Role and scope
- Own the developer CLI experience for Cornerstone and enable cross-project usage via a packaged awfl-cli.
- Deliver commands to call workflows, tail logs, validate configs, and generate artifacts.
- Ensure the CLI can be installed with pipx or run via Docker in any repo with a minimal .awfl/config.yaml.

Objectives
- Fast feedback for developers; simple onboarding; parity with CI tasks.
- Zero hardcoded project constants; all tunables configurable via env or .awfl/config.yaml.
- Safe, optional bindings to Pub/Sub to avoid cross-project interference.

What success looks like
- awfl-cli installable via pipx and runnable from any repo; `awfl init --preset cornerstone` bootstraps config.
- `awfl call cornerstone-workflows-...` works locally; outputs visible; tool calls dispatched to the correct runner.
- Docker image ghcr.io/topaigents/awfl-cli:latest supports hermetic runs with volumes for repo and gcloud creds.

Packaging and distribution
- Produce a pip-installable package "awfl-cli" with console scripts: awfl and awfl-cli → entrypoint cli.main:main (or cli.main:entrypoint).
- Recommend pipx for isolated install; support uvx as alternative. Provide a Dockerfile image published to GHCR.
- Keep cli as the source of truth; pyproject.toml defines dependencies and entry points. Ensure google-auth is declared.

Configuration model
- Repo-local file .awfl/config.yaml is the primary configuration; env vars override file; reasonable defaults last.
- Example keys (see plan file for a full example): project_id, location, api_origin, base_url, workflows_dir, watch.enabled/patterns/trigger_regex, subscribe.cli_operations/autofunds, sessions.prefix, tools.read_file_max_bytes, auth.skip_auth.
- Env overrides map 1:1: AWFL_PROJECT_ID, AWFL_LOCATION, API_ORIGIN, BASE_URL, LLM_MODEL, READ_FILE_MAX_BYTES, SKIP_AUTH, ASSISTANT_WORKFLOW, AWFL_WORKFLOWS_DIR, etc.
- Detection: project root via git top-level; fallback to current working directory; workflows_dir relative to project root unless absolute.

Key integrations with existing CLI (see cli/AGENT.md)
- Session identity resolution order remains: ASSISTANT_WORKFLOW env → active workflow in state → locally generated UUID.
- Workflow execution modes: gcloud (default) and api; configurable via WORKFLOW_EXEC_MODE. Respect get_api_origin() and get_base_url().
- Pub/Sub consumers are disabled by default for third-party repos; gate them behind subscribe.* config flags to avoid unintended subscriptions.
- File watcher behavior: diffs vs HEAD; added lines containing " ai:" trigger cli-CommentAddedDev. Make trigger_regex configurable; default remains backward compatible.

Commands to support
- init: scaffold .awfl/config.yaml; presets (cornerstone) fill recommended defaults and enable required subscriptions.
- status: print effective configuration and the source of each setting (env vs file vs default); show execution mode, API origin, BASE_URL, SKIP_AUTH, token override.
- workflows (ls): discover workflows from configured workflows_dir; interactive selector; sets active workflow (suffix Dev).
- call <workflow> [json]: invoke a specific workflow; inject configured LLM_MODEL; honor execution mode.
- model [name]: get/set LLM model.
- auth: login/logout/status, SKIP_AUTH toggles, token overrides; reuse existing implementations.
- stop/cancel: cancel active workflow execution via gcloud.

Cornerstone runners and tool calls
- Provide a CornerstoneRunner (query-only) analogous to WorkflowBuilder for background operations. Session prefix: background-Cornerstone (configurable via sessions.prefix).
- Ensure CliEventHandler registers Cornerstone runners so tool calls from Cornerstone workflows route correctly.
- Unknown tool calls: return a helpful error message indicating the allowed tools and where to configure additional handlers.

Authentication
- Support two modes: API mode uses Firebase ID token (auth login); gcloud mode uses the gcloud CLI and ADC.
- Token acquisition for callbacks: honor CALLBACK_USE_GCLOUD_TOKEN; otherwise use ADC. Expose CALLBACK_* envs in docs and status output if present.

Logging and troubleshooting
- Deduplicated logs via log_unique; keep last 20 unique lines; ensure repeated lines collapse to reduce noise.
- Common issues to document: missing Firestore indexes, permissions (ADC vs Firebase auth), lock collisions in locks.Cornerstone.*, gcloud missing in PATH.
- macOS TLS: prefer Python builds linked against OpenSSL to avoid urllib3 LibreSSL warnings.

Testing and verification
- Smoke tests: READ_FILE tool_call and a CornerstoneRunner query.
- Packaging tests: pipx install from local build; awfl --version; awfl init --preset cornerstone; awfl status; awfl workflows; awfl call cornerstone-workflows-IngestWorkflow '{"docId":"d1"}'.
- Docker tests: docker run with volumes for repo and gcloud credentials; run status and a simple call.
- Platforms: macOS (Homebrew Python 3.13), Ubuntu LTS; Windows via WSL recommended.

Release process
- Version with SemVer; tag releases. Publish to PyPI (or internal index initially) and GHCR Docker registry.
- Rebuild cli/.venv for local dev if Python version changes. Ensure entry-point shebangs point to cli/.venv/bin/python when developing.
- Keep requirements in sync with pyproject and cli/.venv.

Security and guardrails
- Safe defaults; destructive ops require --force and confirmations.
- Pub/Sub consumers opt-in; background messages allowed but session filtering enforced per cli/consume_cli_operations.
- RUN_COMMAND tool is trusted only from tool_call messages; ensure upstream workflows are trusted in docs.

Definition of done
- Matches acceptance criteria in the plan; help docs and examples included; packaging smoke tests pass.

References
- Plan: cornerstone/plan/cli-integration.md
- CLI Agent: cli/AGENT.md
- Architecture: cornerstone/architecture/workflows.md
