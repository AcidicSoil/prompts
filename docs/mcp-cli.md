# MCP Server & CLI Quick Reference

This guide covers the two primary ways to interact with the Task-Master aware workflow logic exposed from this repository: the Commander-based CLI and the stdio Model Context Protocol (MCP) server.

## CLI Overview (`npm run prompts`)

The CLI wraps the same shared utilities as the MCP server. Every command accepts the common options listed below and emits machine-readable JSON (or DOT) so it can be scripted in CI or other tooling.

### Common options

| Option | Default | Purpose |
| ------ | ------- | ------- |
| `--tasks <path>` | `.taskmaster/tasks/tasks.json` | Source Task-Master file to ingest. |
| `--tag <tag>` | `master` | Named tag within `tasks.json` to load when using tagged files. |
| `--write` | _unset_ | Enable persistence for commands that mutate state (currently `advance`). |
| `--pretty` | _unset_ | Pretty-print JSON output for easier inspection. |

### Commands

| Command | Description | Example |
| ------- | ----------- | ------- |
| `ingest` | Validate and normalize Task-Master data. Returns `{ tasks, report }`. | `npm run prompts -- ingest --pretty` |
| `next` | Return the highest-priority ready task plus the ready queue. | `npm run prompts -- next` |
| `advance <id> <status>` | Update a task status. Use `--write` to persist. | `npm run prompts -- advance 21 done --write` |
| `graph [--format dot|json]` | Export dependency graph as JSON (default) or DOT text. | `npm run prompts -- graph --format dot` |
| `status` | Summarise totals, ready tasks, and the current `next` pick. | `npm run prompts -- status --pretty` |

> **Tip:** All commands run in dry-run mode by default. Supplying `--write` is the only way to persist changes back to `tasks.json`.

## MCP Server (`dist/mcp/server.js`)

The MCP server exposes the same domain logic over stdio so Codex, Gemini, Cursor, and other MCP-aware clients can consume it.

### Launching the server

1. Build the project: `npm run build`.
2. Start the server with stdio transport:

   ```bash
   node dist/mcp/server.js \
     --tasks /path/to/tasks.json \
     --tag master \
     --write=false
   ```

3. Register the process with your client as a Command (stdio) MCP server.

### Tool surface

| Tool | Description | Notes |
| ---- | ----------- | ----- |
| `next_task` | Returns `{ task, ready }` using readiness rules. | Read-only. |
| `list_tasks` | Returns `{ tasks }` as normalized by the ingest adapter. | Read-only. |
| `get_task` | Returns `{ task }` for a numeric ID. | Read-only. |
| `graph_export` | Returns `{ nodes }` for DOT graph generation. | Read-only. |
| `set_task_status` | Returns `{ task, persisted }`. Persists only when server started with `--write=true`. | Mutating. |
| `workflow/refresh_metadata` | Rebuilds catalog artifacts. | Matches CLI tooling. |
| `workflow/export_task_list` | Emits curated task list for clients. | Matches CLI tooling. |
| `workflow/advance_state` | Records tool completions into `.mcp/state.json`. | Mutating. |
| `workflow/run_script` | Executes an allowlisted npm script. | Dry-run supported; gated for safety. |
| `workflow/run_task_action` | Resolves `{script,args}` by task id (metadata or actions.json) and executes via `run_script`. | Dry-run supported; gated for safety. |
| `workflow/run_tests` | Runs project tests via allowlisted script. | Wrapper around `run_script`. |
| `workflow/run_build` | Runs project build via allowlisted script. | Wrapper around `run_script`. |

### How this improves your workflow (use cases)

- Personal triage: ask for `next_task` to focus on the highest-value work that is actually unblocked.
- Fast status hygiene: flip status with `set_task_status` right from your AI client; plans and dashboards stay accurate.
- Planning visibility: `graph_export` and `workflow/export_task_list` power simple dashboards and dependency views.
- Safer automation: default read-only mode lets agents explore without side effects; opt-in `--write=true` when ready.

### End-to-end example (copy/paste)

1. Start server (read-only):

```bash
node dist/mcp/server.js --tasks .taskmaster/tasks/tasks.json --tag master --write=false
```

2. From your MCP client:

- Call `next_task` → returns `{ task, ready }`.
- Do the work locally.

3. Persist status (enable write mode):

```bash
node dist/mcp/server.js --tasks .taskmaster/tasks/tasks.json --tag master --write=true
```

- Call `set_task_status` with the chosen `id` and status (e.g., `done`).
- Optionally call `workflow/advance_state` to attach artifacts or notes.

4. Re-plan and visualize:

- Call `graph_export` for `{ nodes }` (render DOT in your tooling if desired).
- Call `workflow/export_task_list` to feed a lightweight dashboard.

### Troubleshooting / FAQ

- Schema not found when embedding: the server resolves `schemas/task.json` relative to the module/package by default. You can also pass an absolute override via the ingest options (programmatic) or ensure the packaged `schemas/` directory ships with your distribution (it does in this repo).
- Write mode: you’ll see `persisted: false` until the server is launched with `--write=true`.
- Logging: protocol JSON uses stdout; logs are emitted to stderr. If your client shows garbled output, ensure stdout isn’t mixed with logs.

### Client configuration snippets

**Codex CLI (`~/.codex/config.toml`):**

```toml
[servers.prompts]
command = "node"
args = [
  "/path/to/repo/dist/mcp/server.js",
  "--tasks", "/path/to/tasks.json",
  "--tag", "master",
  "--exec-enabled" # Optional: enable execution of allowlisted scripts
]
transport = "stdio"
```

**Gemini CLI (`~/.gemini/settings.json`):**

```json
{
  "servers": [
    {
      "name": "prompts",
      "command": "node",
      "args": [
        "/path/to/repo/dist/mcp/server.js",
        "--tasks",
        "/path/to/tasks.json",
        "--tag",
        "master",
        "--exec-enabled" // Optional: enable execution of allowlisted scripts
      ]
    }
  ]
}
```

> Replace `/path/to/repo` with the absolute path to your checkout. On Windows via WSL use the `/c/Users/<you>/...` format expected by many MCP clients.

### Write-mode safety

- `--write=false` (default) guarantees no filesystem mutations; MCP clients can explore tasks safely.
- Setting `--write=true` enables `set_task_status` and `workflow/advance_state` to persist changes. Use in controlled environments only.

### Execution and gating

- Execution of local scripts is disabled by default to avoid side effects.
- Two layers of safety must be satisfied:
  - Allowlist: scripts must appear in `package.json#mcpAllowScripts`.
  - Exec gate: either set environment `PROMPTS_EXEC_ALLOW=1` or launch the server with `--exec-enabled`.
- Most execution tools support `dryRun: true` so you can preview the exact command before allowing live runs.
- Actions by task id: `workflow/run_task_action` looks for `{ metadata.action: {script,args} }` on a task or in an `actions.json` mapping (keyed by task id) and dispatches through the same safe path.

## Keeping docs in sync

Whenever the CLI or MCP surface changes:

1. Update this reference and the relevant sections in `README.md`.
2. Regenerate any examples if argument defaults change.
3. Re-run `npm run test:jest` to ensure the action-layer tests still cover the updated behaviour.
