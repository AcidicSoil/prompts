# Client Setup — Using the MCP Server from Codex and Gemini

This guide provides copy‑paste snippets to register the local MCP stdio server with common clients.

## Prerequisites

- Build the project: `npm run build`
- Start the server (read‑only by default):

```bash
node dist/mcp/server.js \
  --tasks .taskmaster/tasks/tasks.json \
  --tag master \
  --write-enabled=false
```

Enable script execution only when ready (optional): add `--exec-enabled` to allow allowlisted scripts via workflow tools.

## Codex CLI (`~/.codex/config.toml`)

```toml
[servers.prompts]
command = "node"
args = [
  "/ABSOLUTE/PATH/TO/repo/dist/mcp/server.js",
  "--tasks", "/ABSOLUTE/PATH/TO/repo/.taskmaster/tasks/tasks.json",
  "--tag", "master",
  # Optional gates
  # "--write-enabled",
  # "--exec-enabled"
]
transport = "stdio"
```

WSL path example (Windows hosts): `/c/Users/<you>/code/prompts/dist/mcp/server.js`.

## Gemini CLI (`~/.gemini/settings.json`)

```json
{
  "servers": [
    {
      "name": "prompts",
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/repo/dist/mcp/server.js",
        "--tasks", "/ABSOLUTE/PATH/TO/repo/.taskmaster/tasks/tasks.json",
        "--tag", "master"
      ],
      "transport": "stdio"
    }
  ]
}
```

## Verifying the connection

From your client, list tools and call a read‑only method:

```bash
# Pseudocode — exact commands depend on the client
mcp tools list --server prompts
mcp tools call --server prompts --name next_task --args '{}'
```

You should receive a JSON result like `{ task, ready }`. If not, confirm the absolute paths above are correct.

## Safety and execution

- The server is read‑only by default; `--write-enabled` must be set to persist status changes.
- Script execution is disabled by default; add `--exec-enabled` to allow calling `workflow_run_script`, `workflow_run_task_action`, and domain wrappers. Scripts must also be listed in `package.json#mcpAllowScripts`.
