# Overview

A lightweight interop layer extends `AcidicSoil/prompts` to ingest Task‑Master artifacts, run an internal state engine, expose Model Context Protocol (MCP) tools over stdio, provide a thin CLI, and wire into Mastra via the Vercel AI SDK with zero‑cost provider presets. It targets developers who manage work with Task‑Master but want `prompts` to reason about readiness, advance workflow state, and serve multiple agentic clients (Codex, Gemini CLI, Mastra) without duplicating logic. It reduces friction by mirroring Task‑Master’s task schema, preserving source‑of‑truth files, and offering deterministic outputs suitable for CI.

# Core Features

## 1) Task‑Master ingest adapter
**What**: Parse `tasks.json` and map to `PromptsTask[]` using a superset schema that preserves Task‑Master field names and types.

**Why**: Zero‑loss ingestion enables consistent state reasoning and avoids vendor lock‑in.

**How**: `src/adapters/taskmaster/ingest.ts` validates against `schemas/task.json` (superset) and normalizes status values and dependency edges.

**Acceptance criteria (BDD)**
Given a valid Task‑Master `tasks.json`
When the adapter runs
Then it produces `PromptsTask[]` with identical IDs, titles, descriptions, statuses, dependencies, priority, details, testStrategy, and subtasks
And it records any non‑canonical statuses in a mapping report.

## 2) Canonical task schema (superset)
**What**: JSON Schema `schemas/task.json` that is a superset of Task‑Master’s fields.

**Why**: Type safety and forward compatibility.

**How**: Preserve names: `id,title,description,status,dependencies,priority,details,testStrategy,subtasks`. Add optional `labels, metadata, evidence, artifacts` fields.

**Acceptance criteria (BDD)**
Given the schema
When validating a canonical Task‑Master example
Then validation passes without warnings
And added optional fields remain optional.

## 3) State engine parity with “next” semantics
**What**: Pure functions `graph.computeReadiness()` and `update.advance()` that match Task‑Master readiness and ordering for the next task.

**Why**: Deterministic task selection across tools.

**How**: Identify tasks with all dependencies satisfied, order by priority, then dependency count, then ID. Support statuses `pending|in_progress|blocked|done` with mappable aliases.

**Acceptance criteria (BDD)**
Given a task graph where some tasks’ dependencies are satisfied
When `next()` runs
Then it returns the highest‑priority ready task per documented tie‑break rules
And never returns a task with unsatisfied dependencies.

## 4) MCP stdio server for prompts tools
**What**: Expose tools: `next_task`, `set_task_status`, `get_task`, `list_tasks`, `graph_export`.

**Why**: Let MCP clients (Codex, Gemini Code Assist) call shared logic.

**How**: Node process using stdio transport; JSON in/out; no side effects without explicit write flags.

**Acceptance criteria (BDD)**
Given an MCP client connected over stdio
When it calls `next_task`
Then the server returns a single task payload consistent with the state engine
And `set_task_status` changes are persisted only when write mode is enabled.

## 5) Thin CLI
**What**: `bin/prompts` with subcommands: `ingest`, `next`, `advance <id> <status>`, `graph --format dot|json`, `status`.

**Why**: Fast local use and CI suitability.

**How**: Commander‑based CLI that calls the same pure functions; outputs machine‑readable JSON by default and DOT for graphs.

**Acceptance criteria (BDD)**
Given a repository containing `tasks.json`
When `prompts next` runs
Then it prints a single JSON object for the next task to stdout
And exits with code 0.

## 6) Mastra agent integration via AI SDK
**What**: Register `prompts-tools` with a Mastra agent that uses AI SDK providers.

**Why**: Enable autonomous workflows that call `prompts` tools during planning and execution.

**How**: Package `packages/prompts-tools` exporting tool handlers; configure provider factory to select a model.

**Acceptance criteria (BDD)**
Given a Mastra agent configured with `prompts-tools`
When the agent plans a step requiring the next task
Then it invokes `next_task` and incorporates the result into its plan without errors.

## 7) Provider presets: Ollama (default) and Gemini CLI (optional)
**What**: Two provider presets for Mastra via AI SDK: local Ollama by default; Gemini CLI as an optional free lane.

**Why**: Zero‑cost or local‑first operation.

**How**: Ship provider config examples and a runtime check that selects an available provider.

**Acceptance criteria (BDD)**
Given no network access and Ollama installed
When the agent initializes
Then it selects the Ollama preset and runs a trivial health prompt successfully.

## 8) Client touch points for Codex and Gemini
**What**: Document configuration snippets to register the MCP stdio server with Codex and Gemini settings.

**Why**: Reduce setup friction.

**How**: Provide TOML/JSON snippet examples with placeholder paths; include Windows+WSL path examples using `/c/Users/user/...`.

**Acceptance criteria (BDD)**
Given a user copies the provided snippets and updates the path
When the client starts
Then the client lists the `prompts` server as available
And tool calls succeed over stdio.

## 9) Optional artifact enrichment
**What**: Non‑blocking readers for Task‑Master artifact files (e.g., complexity reports) to augment task metadata.

**Why**: Richer context without hard dependencies.

**How**: `src/artifacts/*` modules detect files and add derived fields under `metadata`.

**Acceptance criteria (BDD)**
Given an artifacts directory is absent
When enrichment runs
Then ingestion still succeeds and `metadata` remains empty.

# User Experience

## Personas
- Solo developer: wants quick “what’s next” and lightweight edits.
- Team lead: needs deterministic ordering and exportable graphs for stand‑ups.
- CI job: validates dependency integrity and fails fast on schema errors.

## Key flows
- Ingest → Next → Advance: read `tasks.json`, choose next task, update status.
- Agentic flow: Mastra agent calls MCP tools to unblock or plan.
- Visualization: export DOT, render elsewhere.
- Client setup: register MCP server in Codex or Gemini settings.

## UI/UX considerations
- JSON first; human‑readable pretty‑print via `--pretty`.
- Color‑safe CLI output; avoid reliance on ANSI by default.
- Deterministic ordering for lists and logs.
- Paths in examples use `/c/Users/user/...` for Windows+WSL.

## Accessibility considerations
- No color‑only semantics; include symbols or keys.
- TTY detection; fall back to plain text when non‑interactive.
- Respect locale for number/date formatting in any summaries.

# Technical Architecture

## System components
- Adapter: `src/adapters/taskmaster/ingest.ts`.
- Schema: `schemas/task.json`.
- State engine: `src/state/graph.ts`, `src/state/update.ts`.
- MCP server: `src/mcp/server.ts` (stdio transport).
- CLI: `bin/prompts` wired to core.
- Mastra tools: `packages/prompts-tools`.
- Provider presets: `src/providers/ollama.ts`, `src/providers/geminiCli.ts`.
- Artifact readers: `src/artifacts/*`.

## Data models
- Task: `{id, title, description, status, dependencies[], priority, details, testStrategy, subtasks[], labels?, metadata?, evidence?, artifacts?}`.
- Status enum: `pending|in_progress|blocked|done` with alias map.
- Graph: adjacency list plus computed readiness and ordering.

## APIs and integrations
- MCP tools: `next_task`, `set_task_status`, `get_task`, `list_tasks`, `graph_export`.
- CLI commands mirror MCP tools; outputs JSON or DOT.
- Mastra integration registers tools; providers selected at runtime.

## Infrastructure requirements
- Node ≥18; pnpm or npm.
- No database; file I/O only.
- Optional Graphviz for rendering; DOT export works without Graphviz.

## Non‑functional requirements (NFRs)
- Determinism: identical inputs yield identical outputs.
- Performance: `next_task` resolves in <100 ms for 5k tasks on a modern laptop.
- Portability: runs on Windows (WSL), macOS, Linux.
- Observability: `--verbose` flag emits structured logs to stderr.
- Testability: unit tests for adapter, engine, and tools; golden files for examples.

## Cross‑platform strategy
- Platform‑specific capabilities: use `/c/Users/user/...` in Windows+WSL docs; POSIX paths elsewhere.
- Fallbacks:
  - If Graphviz is unavailable, return DOT text even when `--format svg` is requested and emit a warning.
  - If Ollama is missing, attempt Gemini CLI; if neither available, run a stub echo provider and warn.
  - Normalize newlines on read/write to avoid CRLF issues.

**BDD fallback tests**
Given Graphviz is not installed
When `prompts graph --format svg` runs
Then the command exits 0 and writes DOT to stdout with a warning to stderr.

Given Ollama is not installed and Gemini CLI is configured
When the Mastra agent initializes
Then provider selection chooses Gemini CLI and a health check succeeds.

Given neither provider is available
When the Mastra agent initializes
Then it selects the stub provider and logs an actionable warning.

## Security and privacy considerations
- Sensitive inputs: task titles/descriptions may contain confidential work; avoid sending to remote models unless explicitly configured.
- Default local‑first: no network calls without a chosen provider.
- Secrets hygiene: do not log task payloads at `info`; redact IDs at `debug` unless `--unsafe-logs` is set by the user.

# Development Roadmap

## MVP scope
- Superset schema and ingest adapter.
- State engine with “next” parity and status mapping.
- MCP stdio server exposing `next_task` and `set_task_status`.
- CLI: `ingest`, `next`, `advance`, `graph --format dot`.
- Provider presets: Ollama default, Gemini CLI optional with runtime selection.
- Client touch points documented.

**MVP acceptance criteria (BDD)**
Given a sample repo with `tasks.json`
When the user runs `prompts next`
Then the output matches the expected task per documented ordering.

Given an MCP client is connected
When it invokes `next_task`
Then it receives the same task as the CLI produced.

## Future enhancements
- CLI migration path to oclif and installers.
- Dependency validator and cycle detector.
- Artifact enrichment modules for complexity and risk inputs.
- Web viewer for DOT graphs.
- Configurable status enums and custom ordering strategies.

**Enhancement acceptance criteria (BDD)**
Given a graph with a cycle
When the validator runs
Then it reports the cycle with the minimal edge set and exits non‑zero.

# Logical Dependency Chain
1. Define schema superset.
2. Implement adapter and unit tests.
3. Implement pure state engine and parity tests.
4. Expose MCP server over stdio.
5. Ship thin CLI wired to the same core.
6. Add Mastra tools and provider presets.
7. Document Codex and Gemini client setup.
8. Add artifact enrichment as optional modules.

# Risks and Mitigations
- Schema drift vs Task‑Master
  - Likelihood: Medium
  - Impact: High
  - Mitigation: Keep a mirroring test suite against canonical examples; gate changes behind alias maps.

- Transport incompatibility (non‑stdio clients)
  - Likelihood: Low
  - Impact: Medium
  - Mitigation: Standardize on stdio; evaluate additional transports only when required.

- Provider availability and free‑tier changes
  - Likelihood: Medium
  - Impact: Medium
  - Mitigation: Default to local provider; include stub fallback; surface health checks.

- Windows/WSL path issues
  - Likelihood: Medium
  - Impact: Medium
  - Mitigation: Normalize paths; document `/c/Users/user/...` conventions; test on WSL.

- Privacy leakage via remote providers
  - Likelihood: Low
  - Impact: High
  - Mitigation: Opt‑in remote calls; redact logs; add data‑handling notice in docs.

# Appendix

## Assumptions
- Task‑Master fields include `id,title,description,status,dependencies,priority,details,testStrategy,subtasks`.
- Status values can be mapped into `pending|in_progress|blocked|done` without loss of meaning.
- Node ≥18 is available across developer machines and CI.
- Users may operate in Windows+WSL; examples use `/c/Users/user/...` paths.
- Graphviz may not be installed; DOT output suffices as a universal exchange format.

## Research findings and references (from provided material)
- “Task Structure” — confirms exact task fields and examples.
- “Finding the Next Task” — defines readiness and ordering rules.
- “MCP Tools” — lists next/status tool surface.
- “Commander.js” vs “oclif” — trade‑offs for thin vs large CLIs.
- “DOT Language” — baseline for graph exports.
- “Using Vercel AI SDK” and “AI SDK v5 Integration” — Mastra integration path.
- “Community Providers: Ollama” and “Gemini CLI Provider” — zero‑cost provider options.
- “OpenAI Codex CLI README” — Codex consumes MCP via config; stdio only noted.
- “Use agentic chat… Configure MCP servers” — Gemini settings JSON location and MCP section.
- “Preview free limits” — free usage context reported; treat as variable.

## Context notes (from link text)
- Task Structure — task fields and readiness
- MCP Tools — tool surface and semantics
- Commander.js — thin CLI utilities
- oclif — installer‑friendly CLI framework
- DOT Language — graph specification
- Using Vercel AI SDK — Mastra provider abstraction
- AI SDK v5 Integration — agent wiring example
- Community Providers: Ollama — local provider
- Gemini CLI Provider — optional free lane
- OpenAI Codex CLI README — MCP client configuration
- Configure MCP servers (Gemini) — settings file location and schema

