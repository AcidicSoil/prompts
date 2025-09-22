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

### Client configuration snippets

**Codex CLI (`~/.codex/config.toml`):**

```toml
[servers.prompts]
command = "node"
args = ["/path/to/repo/dist/mcp/server.js", "--tasks", "/path/to/tasks.json", "--tag", "master"]
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
        "master"
      ]
    }
  ]
}
```

> Replace `/path/to/repo` with the absolute path to your checkout. On Windows via WSL use the `/c/Users/<you>/...` format expected by many MCP clients.

### Write-mode safety

- `--write=false` (default) guarantees no filesystem mutations; MCP clients can explore tasks safely.
- Setting `--write=true` enables `set_task_status` and `workflow/advance_state` to persist changes. Use in controlled environments only.

## Keeping docs in sync

Whenever the CLI or MCP surface changes:

1. Update this reference and the relevant sections in `README.md`.
2. Regenerate any examples if argument defaults change.
3. Re-run `npm run test:jest` to ensure the action-layer tests still cover the updated behaviour.
