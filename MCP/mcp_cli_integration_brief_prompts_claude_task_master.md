# MCP Integration Brief — Proactive Workflow Assistant & Task Master AI

## Context Primer

- **Server entry**: `src/index.ts` bootstraps the Proactive Workflow Assistant MCP server, registers prompt resources/tools, workflow tools, and StateStore persistence before connecting via `StdioServerTransport`.
- **Prompt catalogs**: `resources/prompts.meta.yaml` + prompt markdown under `prompts/**`. Scripts `npm run validate:metadata` and `npm run build:catalog` keep metadata synchronized.
- **Workflow tools**: `src/tools/register.ts` wires `refresh_metadata`, `export_task_list`, and `advance_state`, exposing automation over MCP. Tests live in `test/integration/tools.test.ts`.
- **Task Master data**: `.taskmaster/tasks/tasks.json` holds the authoritative backlog generated from `prd.txt` via Task Master AI.

This brief explains how to wire the prompts server, the MCP Inspector/clients, and Task Master AI so that prompt automation and backlog management stay in lockstep.

---

## 1. Runtime & Commands

| Scenario | Command | Notes |
| --- | --- | --- |
| Build TypeScript → dist | `npm run build` | Uses `tsconfig.build.json`; run before shipping.
| Launch MCP server (direct) | `node dist/index.js` | Preferred for MCP transports; stdout reserved for JSON-RPC.
| Launch MCP server (dev) | `npm run start` | Convenience wrapper; avoid when piping into Inspector because npm prefixes stdout.
| Inspector attach | `npx @modelcontextprotocol/inspector --config inspector.config.json` | Config points at `node dist/index.js`; ensure Inspector sees clean JSON-RPC on stdout.
| Validate metadata | `npm run validate:metadata` | Calls MCP tool `refresh_metadata` internally when invoked via client.
| Rebuild catalog & README table | `npm run build:catalog` | Safe to run standalone or through the MCP toolchain.

**Logging rule:** The server already routes operational logs through `SecureLogger` to stderr; do not reintroduce stdout logging or npm prefixes will corrupt JSON-RPC streams.

---

## 2. MCP Surface Overview
### 2.1 Prompt Resources

- Registered via `registerPromptResources`.
- Each prompt becomes a `file://` resource capped at 1 MiB by `capPayload`; previews match Inspector expectations.

### 2.2 Prompt Tools (dynamic)

- `registerPromptTools` turns every prompt definition into an MCP tool with generated Zod schemas.
- Return payloads include both structured JSON (`structuredResult`) and a trimmed textual preview with footer annotations (see `src/tools/prompt-handler.ts`).

### 2.3 Workflow Tools (Node-only utilities)

| Tool | Purpose | Input | Output |
| --- | --- | --- | --- |
| `workflow/refresh_metadata` | Run `validate:metadata` then `build:catalog`; optional `updateWorkflow` flag cascades to `npm run build:catalog -- --update-workflow`. | `{ updateWorkflow?: boolean }` | `summary` text + `steps[]` describing scripts run and their exit codes. |
| `workflow/export_task_list` | Emit normalized task list for orchestration. Currently sources `resources/prompts.meta.yaml`; roadmap below covers pivoting to Task Master tasks. | none | `{ tasks: [{ id, title, dependsOn[], status }] }`. |
| `workflow/advance_state` | Persist tool completions/artifacts into `StateStore`. | `{ id, summary, phase?, artifacts[] }` | Echoes recorded state; updates `.codex/workflow-state.json`. |

Inspector or Task Master can call these over MCP stdio once the server is running.

---

## 3. Task Master AI Integration
### 3.1 Source of Truth

- Task Master AI parses `prd.txt` into `.taskmaster/tasks/tasks.json` (already under version control).
- The MCP tool `workflow/export_task_list` should be the bridge for agents needing task context.

### 3.2 Current Behaviour vs. Desired Alignment

| Aspect | Current | Target Alignment |
| --- | --- | --- |
| Task feed | Reads prompt metadata (`prompts.meta.yaml`). | Swap to `.taskmaster/tasks/tasks.json` (respect subtasks and dependencies). |
| Status sync | `advance_state` records progress locally only. | Extend to POST updates back into Task Master via MCP (future work). |
| Script wiring | Manual scripts exist; MCP clients must chain them manually. | `workflow/refresh_metadata` orchestrates scripts so Task Master can request “update workflow” in one call. |

Until the tool swap is implemented, wrap Task Master workflows as follows:

1. **List tasks for an agent session**: call `workflow/export_task_list`; treat results as canonical but note source column in the structured payload.
2. **Run workflow maintenance**: call `workflow/refresh_metadata` with `updateWorkflow: true` after editing prompts or tasks so catalog + README regenerate automatically.
3. **Record completions**: call `workflow/advance_state` whenever a Task Master task transitions; include `artifacts` pointing to logs or generated files.

### 3.3 Suggested JSON-RPC sequences

```json
{ "id": 1, "jsonrpc": "2.0", "method": "workflow/export_task_list" }
```

```json
{ "id": 2, "jsonrpc": "2.0", "method": "workflow/refresh_metadata", "params": { "updateWorkflow": true } }
```

```json
{ "id": 3, "jsonrpc": "2.0", "method": "workflow/advance_state", "params": { "id": "task-10", "summary": "Prompt metadata validated", "phase": "validate", "artifacts": [{ "uri": "file://.../artifacts/test/state-store-20250920T143228Z.log" }] } }
```

### 3.4 Operating without Task Master

- The prompts server remains useful even when Task Master AI is offline or not installed. Use the same MCP tools and npm scripts to keep metadata fresh.
- `workflow/export_task_list` can backfill session task lists by deriving pseudo-tasks from prompt metadata; once Task Master returns, its backlog simply supersedes the generated list.
- For manual operation, run `npm run validate:metadata` and `npm run build:catalog`, then consult the regenerated catalog/README to drive work queues.
- The bundled CLI (`npm run prompts -- …`) materializes backfilled tasks and metadata without needing an MCP client; MCP remains available when automation is desired.

---

## 4. Inspector & Client Configuration

- **Inspector config** (`inspector.config.json`) should launch `node dist/index.js` directly to avoid npm noise.
- Ensure `stdio` transport is selected; Inspector expects zero stdout chatter outside JSON-RPC frames.
- For CLI-driven automation, create a `.mcp.json` entry:

```json
{
  "servers": [
    {
      "name": "ProactiveWorkflowAssistant",
      "command": "node dist/index.js",
      "autoStart": true
    }
  ]
}
```

---

## 5. Automation Patterns & Safety

- Pair `workflow/refresh_metadata` with Task Master hooks so documentation updates happen before downstream prompts read stale schemas.
- Redaction & payload capping are already enforced (`src/utils/safety.ts`); keep large outputs under 1 MiB to satisfy MCP transport guidance.
- When running through CI, prefer invoking tools via MCP so that stdout stays machine-readable and logs continue on stderr.

---

## 6. Roadmap

1. **Pivot `workflow/export_task_list` to Task Master** — Teach the tool to parse `.taskmaster/tasks/tasks.json`, flatten subtasks, and expose status so external agents mirror Task Master exactly.
2. **Bidirectional status sync** — Surface Task Master status transitions as MCP notifications (e.g., DocFetch signals) and optionally allow MCP calls to trigger Task Master updates.
3. **Workflow bundles** — Provide a single MCP tool that performs `refresh_metadata`, `build:catalog`, and catalog diffing, returning artifact URIs for Task Master ingestion.
4. **Manual script fallback** — Retain `npm run validate:metadata` and `npm run build:catalog` for developers without MCP clients; document in README alongside MCP usage.
5. **Enhance CLI surface** — Add niceties like completion, structured logging, and bundle scenarios now that the Node.js CLI mirrors MCP workflows.
6. **Backfill generators** — Provide a helper that synthesizes minimal task backlogs from prompt metadata when Task Master is absent, writing changelogs or TODO files.

## 7. CLI Surface

- `npm run prompts -- <command>` wraps the same workflow helpers exposed over MCP.
- `list`/`export` reuse `export_task_list` to emit Task Master aligned backlogs (with `--json` for machine output).
- `refresh [--update-workflow]` shells `validate:metadata` and `build:catalog`, mirroring `workflow/refresh_metadata`.
- `advance <id> [--outputs <json>] [--artifact <json>]` records completions through `StateStore`, writing to `.mcp/state.json`.
- The CLI binaries are published via `bin/prompts` so external tooling can call `npx prompts ...` once the package is built.


---

## References

- `src/index.ts`, `src/tools/register.ts`, `src/prompts/register.ts`
- `test/integration/tools.test.ts`, `test/integration/resources.test.ts`
- `.taskmaster/tasks/tasks.json`, `prd.txt`
- `inspector.config.json`
