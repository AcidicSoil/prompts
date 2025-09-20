# MCP CLI Integration Brief — `AcidicSoil/prompts` & `AcidicSoil/claude-task-master`

## Scope
This brief maps architectures and interfaces of two repositories and proposes a cross‑platform Node.js/TypeScript CLI design that interoperates over MCP stdio with JSON‑Schema I/O. It identifies commands, schemas, config formats, dependency/IPC patterns, and aggregates ecosystem best practices (MCP spec, transports, mcpdoc, Claude Desktop/Inspector, Smithery). Targets Node ≥18 on macOS/Windows/WSL/Linux; supports VS Code tasks and optional Docker.

---

## (1) Command taxonomy & MVP for `prompts` CLI
**Binary:** `prompts`

**Core commands**

- `prompts list` — List prompt playbooks, tags, and paths (from catalog or directory scan).
- `prompts show <name>` — Print resolved prompt (markdown) to stdout.
- `prompts run <name> [--input <file>|--var k=v ...]` — Render with vars; emit JSON result (MCP‑friendly schema).
- `prompts plan [<graph.json>|--auto]` — Build a task plan/graph from prompt metadata (e.g., prev/next links) or auto‑plan; output JSON.
- `prompts mcp-server` (alias `mcp start`) — Start an MCP stdio server exposing prompts as tools.
- `prompts call <tool> --json <file|- >` — Act as a thin MCP client to call a tool via local stdio bridge.
- `prompts export [--format llms.txt]` — Generate/validate exports (e.g., llms.txt; validate catalog consistency).

**I/O & schemas**

- Inputs/outputs follow MCP JSON‑RPC envelopes with per‑tool JSON‑Schema (params/results). Each prompt tool advertises schema via server introspection.

**Minimal internal modules**

- Catalog loader (reads `catalog.json` or scans prompt dirs/front‑matter).
- Renderer (applies `--var`/`--input` to templates; returns hydrated text/JSON).
- MCP transport (stdio JSON‑RPC loop; tool registry; schema advertisement).

**Example table**

| Command | Purpose |
|---|---|
| `list` | Enumerate prompts with tags/phase |
| `show <name>` | Output prompt markdown |
| `run <name>` | Render/execute; JSON result |
| `plan` | Output JSON task plan/graph |
| `mcp-server` | Expose prompts as MCP tools |
| `call <tool>` | Invoke tool via stdio; pipeable |
| `export` | Emit/validate external formats |

---

## (2) Compatibility layer: `prompts` ⇄ `claude-task-master`
**Transport:** MCP over stdio (JSON‑RPC 2.0). Persistent process preferred for multiple calls.

**Discovery & config**

- Prefer project `.mcp.json` / `mcp.config.(json|toml)` for server entries.
- Environment fallbacks: e.g., `MCP_SERVERS`, `PROMPTS_DIR`, API keys.

**Tool namespace & schema**

- Methods like `prompts/<slug>` map to prompt tools. Each advertises `params`/`result` JSON‑Schema.
- Errors: JSON‑RPC error with code/message; CLI exits non‑zero for shell use.

**Interoperation modes**

1) **Task‑master→Prompts:** `claude-task-master` connects to `prompts mcp-server`; calls tools like `prompts/render_prompt`, `prompts/list_prompts`, `prompts/plan_session`.
2) **Prompts→Task‑master:** `prompts` acts as MCP client to call `taskmaster.run_plan` / `taskmaster.execute` where available.

**Sample `.mcp.json` entry**

```json
{
  "servers": [
    { "name": "PromptsTools", "command": "prompts mcp-server", "autoStart": true }
  ]
}
```

---

## (3) Sample end‑to‑end flows
**Flow A: plan → run tools → persist**

1. `prompts plan --auto > plan.json`
2. `claude-task-master run --plan plan.json --out run.json`
3. `prompts call prompts/render_prompt --json run.json | tee artifacts/prompt.txt`

**Flow B: single‑tool pipe**

```sh
prompts show define_prd_generator \
| prompts call prompts/render_prompt --json - \
| claude-task-master run --stdin
```

**Flow C: prompts orchestrates via task‑master**

```sh
prompts orchestrate <prompt> --goal "<objective>" --use-taskmaster
```

- Internally: connect via MCP, request plan, execute, stream results.

---

## (4) Security & sandboxing

- Prefer local stdio; avoid exposing network sockets. If remote, require auth and least‑privilege tokens.
- Validate all inputs/outputs against JSON‑Schema before execution/use.
- Side‑effects guarded: explicit flags for filesystem writes; use temp dirs; principle of least privilege.
- Subprocess safety: use `execa`/spawn with controlled `PATH`, cwd, env allow‑lists.
- Logging: structured logs for MCP requests/responses (redact secrets); per‑step audit trail.
- Keys & secrets: env vars or OS keychain; never log values; optional secret manager integration.
- Idempotency: design tools to be safe on retries; include operation IDs; write‑once file naming.

---

## (5) Phased roadmap (with refs & snippets)
**Phase 0 — Scaffold**

- Add TS CLI skeleton in `prompts`; choose `commander` for MVP. Ensure Node ≥18, cross‑platform paths, ESM/CJS choice.
- Wire scripts: `build`, `dev`, `lint`, `test`.

**Commander skeleton**

```ts
#!/usr/bin/env node
import { Command } from 'commander';
const program = new Command();
program.name('prompts').version('0.1.0');
program.command('list').action(async () => {/* scan & print */});
program.parseAsync(process.argv);
```

**Phase 1 — Core commands**

- Implement `list`, `show`, `run`, `plan`; JSON output by default; `--format json|text`.
- Basic renderer (front‑matter + vars). Generate simple plan from metadata (prev/next/phase).

**Phase 2 — MCP stdio server**

- `prompts mcp-server`: long‑lived JSON‑RPC loop on stdin/stdout; advertise tools & schemas.
- Map `method`→prompt; unify with `run` execution path.
- Add `prompts call` thin client for piping/system tests.

**Phase 3 — Orchestration interop**

- Read `.mcp.json`; auto‑launch/attach to `claude-task-master`.
- Concurrency + retries via `p-limit`/`p-retry`.
- Structured logging; `--verbose`; JSON logs for IDE ingestion.

**Phase 4 — Packaging & plugins**

- Evaluate `oclif` if plugins/autoupdater required; otherwise keep Commander.
- Config discovery: `mcp.config.json|toml`, env overrides; home‑dir search.
- Optional: Dockerfile + VS Code tasks for local dev.

**Phase 5 — Advanced**

- Multi‑tool coordination (parallel steps); session state cache; resumable runs.
- Bridges (LangGraph/LangChain/Smithery); MCP Inspector for server testing.
- `export --format llms.txt` validation; cross‑repo plugin loading.

---

## Implementation details & patterns
**Config precedence**

1) CLI flags → 2) env vars → 3) project config (`.mcp.json` / `mcp.config.*`) → 4) defaults.

**JSON‑RPC envelopes**

```json
{ "jsonrpc": "2.0", "id": 1, "method": "prompts/render_prompt", "params": { "name": "<slug>", "vars": {"k":"v"} } }
```

**Result envelope**

```json
{ "jsonrpc": "2.0", "id": 1, "result": { "output": "...", "artifacts": [{"path":"..."}] } }
```

**Exit codes**

- `0` success; `1` validation error; `2` tool not found; `3` transport error; `>3` reserved.

**Logging**

- Default human logs to stderr; machine‑readable JSON to stdout only when `--json`.

**Telemetry (optional, off by default)**

- Event names: `plan_generated`, `tool_invoked`, `rpc_error` (redact PII; opt‑in only).

---

## Licensing & contribution notes

- `claude-task-master`: MIT with Commons Clause (permissive; no selling as‑a‑service). Follow upstream tests/contrib patterns.
- `prompts`: add/confirm OSS license; enforce metadata validation (`validate:metadata`), rebuild catalog pre‑commit.

---

## Appendix A — Minimal JSON Schemas (examples)
**Render Prompt (params)**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["name"],
  "properties": {
    "name": {"type": "string"},
    "vars": {"type": "object", "additionalProperties": true},
    "input": {"type": "object", "additionalProperties": true}
  }
}
```

**Render Prompt (result)**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["output"],
  "properties": {
    "output": {"type": "string"},
    "artifacts": {
      "type": "array",
      "items": {"type": "object", "properties": {"path": {"type":"string"}}}
    }
  }
}
```

**Plan Session (params/result)**

```json
{
  "params": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "properties": {"spec": {"type":"string"}, "auto": {"type":"boolean"}}
  },
  "result": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "required": ["plan"],
    "properties": {
      "plan": {
        "type": "array",
        "items": {"type":"object", "properties": {"step": {"type":"string"}, "desc": {"type":"string"}}}
      }
    }
  }
}
```

## Appendix B — Suggested package set

- `commander` (CLI), `zod` or `ajv` (schema validation), `execa` (subprocess), `p-limit`, `p-retry`, `chalk` (TTY), `ora` (spinners, optional), `winston` or `pino` (logs), `tsx` (dev), `tsup`/`esbuild` (build), `vitest`/`jest` (tests).

## Appendix C — VS Code tasks (example)

```json
{
  "version": "2.0.0",
  "tasks": [
    { "label": "Prompts: MCP Server", "type": "shell", "command": "prompts mcp-server" },
    { "label": "TaskMaster: Run Plan", "type": "shell", "command": "claude-task-master run --plan plan.json --out run.json" }
  ]
}
```

