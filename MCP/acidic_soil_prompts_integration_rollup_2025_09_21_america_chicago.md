# Integration Plan: Task‑Master, MCP/CLI, and Mastra in `AcidicSoil/prompts`

> **Windows + WSL path note:** When showing local Windows paths, use `/c/Users/user/...` (WSL style) rather than `C:\\Users\\user\\...`.

---

## Contents

- [Integration Plan: Task‑Master, MCP/CLI, and Mastra in `AcidicSoil/prompts`](#integration-plan-taskmaster-mcpcli-and-mastra-in-acidicsoilprompts)
  - [Contents](#contents)
  - [Item 1: Ingest Task‑Master and run `prompts` state engine](#item-1-ingest-taskmaster-and-run-prompts-state-engine)
  - [Item 2: Ship a CLI for shell use](#item-2-ship-a-cli-for-shell-use)
  - [Item 3: Wire Mastra as the agentic layer](#item-3-wire-mastra-as-the-agentic-layer)
  - [Item 4: Zero‑cost model options for Mastra](#item-4-zerocost-model-options-for-mastra)
  - [Item 5: Are Codex and Gemini‑CLI “providers”? What to do](#item-5-are-codex-and-geminicli-providers-what-to-do)
  - [Item 6: Exact touch points to add](#item-6-exact-touch-points-to-add)
  - [Item 7: Minimal migration plan for `prompts`](#item-7-minimal-migration-plan-for-prompts)
  - [Item 8: Gemini‑CLI free usage context](#item-8-geminicli-free-usage-context)
  - [Roll‑up Summary](#rollup-summary)
    - [Monitoring Note](#monitoring-note)

---

## Item 1: Ingest Task‑Master and run `prompts` state engine

**Goal**

Enable `AcidicSoil/prompts` to load Task‑Master artifacts and execute an equivalent state machine for task management. Match Task‑Master’s `tasks.json` schema and replicate the “next” logic.

**Assumptions**

- `prompts` may extend the schema (superset) but must preserve all Task‑Master field names and types.

<details><summary><strong>Query Set</strong></summary>

- site:docs.task-master.dev "Task Structure" tasks.json fields
- site:docs.task-master.dev "next" command semantics dependency readiness
- site:docs.task-master.dev MCP tools list “next_task” or similar
- site:github.com eyaltoledano/claude-task-master tasks.json schema file or issue
- "Task Master" complexity report JSON location
- "Task Master" CLI "validate-dependencies" docs
- site:docs.task-master.dev "CLI Commands" task statuses
- site:docs.task-master.dev "Advanced Tasks" dependencies rules

</details>

<details><summary><strong>Evidence Log</strong></summary>

| SourceID | Title                                           | Publisher        | URL                                                                                                                            | PubDate    | Accessed   | Quote (≤25w)                                                                                                                                 | Finding                                          | Rel | Conf |
| -------- | ----------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | --- | ---- |
| S1.1     | Task Structure                                  | Task Master Docs | https://docs.task-master.dev/capabilities/task-structure                                                                       | n/a        | 2025-09-21 | “Tasks in tasks.json have the following structure: id, title, description, status, dependencies, priority, details, testStrategy, subtasks.” | Confirms exact field names and examples.         | H   | 0.95 |
| S1.2     | Task Structure → Finding the Next Task          | Task Master Docs | https://docs.task-master.dev/capabilities/task-structure                                                                       | n/a        | 2025-09-21 | “Identifies tasks… with all dependencies satisfied. Prioritizes by priority, dependency count, and task ID.”                                 | Readiness and prioritization rules for `next`.   | H   | 0.9  |
| S1.3     | MCP Tools                                       | Task Master Docs | https://docs.task-master.dev/capabilities/mcp                                                                                  | n/a        | 2025-09-21 | “MCP interface… exposes core functionalities as a set of tools… ‘next_task’, ‘set_task_status’, …”                                          | Confirms MCP tool surface including next/status. | H   | 0.9  |
| S1.4     | Improve documentation… Create tasks.schema.json | GitHub Issue     | https://github.com/eyaltoledano/claude-task-master/issues/363                                                                  | 2025-04-30 | 2025-09-21 | “Create `tasks.schema.json` – a JSON Schema describing… `tasks.json`.”                                                                       | Evidence of schema formalization.                | M   | 0.7  |

</details>

**Synthesis**

- Task‑Master defines `tasks.json` with fields: `id, title, description, status, dependencies, priority, details, testStrategy, subtasks`.
- `next` selects tasks whose dependencies are satisfied; orders by priority, dependency count, then ID.
- MCP surface includes `next_task` and `set_task_status`; parity tools in `prompts` are feasible.
- A formal JSON Schema is planned; use it as baseline for a superset `schemas/task.json`.

**Contradictions**

- None material; the schema issue shows intent, not final spec. Treat as advisory vs canonical.

**Gaps & Next**

- Confirm allowed `status` values (e.g., `pending`, `done`, `deferred`) and map to any `prompts` variants.
- Fetch `tasks.schema.json` if/when published; validate types/enums.

**Decision Hook**

Proceed to implement `schemas/task.json` superset and `next()` readiness identical to Task‑Master.

---

## Item 2: Ship a CLI for shell use

**Goal**

Select a Node CLI framework and output options for `bin/prompts` with subcommands mapped to shared core.

<details><summary><strong>Query Set</strong></summary>

- commander.js GitHub README features and install
- oclif docs introduction and commands API
- oclif packaging/auto-update installers
- Graphviz DOT language reference for `graph --format dot`
- AI SDK or general Node CLI best practices flags/subcommands

</details>

<details><summary><strong>Evidence Log</strong></summary>

| SourceID | Title        | Publisher  | URL                                                                                      | PubDate    | Accessed   | Quote                                                                   | Finding                                 | Rel | Conf |
| -------- | ------------ | ---------- | ---------------------------------------------------------------------------------------- | ---------- | ---------- | ----------------------------------------------------------------------- | --------------------------------------- | --- | ---- |
| S2.1     | commander.js | GitHub     | https://github.com/tj/commander.js                                                       | n/a        | 2025-09-21 | “parsing the arguments… implements a help system.”                      | Commander fits thin CLIs.               | H   | 0.9  |
| S2.2     | Introduction | oclif Docs | https://oclif.github.io/docs/introduction/                                               | 2025-08-25 | 2025-09-21 | “framework for building command-line interfaces… capable of much more.” | oclif for larger CLIs.                  | H   | 0.85 |
| S2.3     | Features     | oclif Docs | https://oclif.github.io/docs/features                                                    | 2025-08-25 | 2025-09-21 | “package your CLI into installers… auto-updatable.”                     | oclif supports installers/auto-update.  | M   | 0.8  |
| S2.4     | DOT Language | Graphviz   | https://graphviz.org/doc/info/lang.html                                                  | 2024-09-28 | 2025-09-21 | “DOT assumes the UTF-8 character encoding.”                             | DOT reference for `graph --format dot`. | M   | 0.9  |

</details>

**Synthesis**

- Use **Commander** for a thin CLI that wraps shared core; low overhead.
- If installers and plugin system become needs, migrate to **oclif**.
- Output `graph --format dot` per Graphviz DOT spec (UTF‑8).

**Decision Hook**

Start with Commander now; keep layout compatible with later oclif migration.

---

## Item 3: Wire Mastra as the agentic layer

**Goal**

Verify Mastra supports AI SDK providers and tool registration so `prompts` can expose tools to a Mastra agent.

<details><summary><strong>Query Set</strong></summary>

- mastra.ai docs “Using Vercel AI SDK”
- Mastra examples for AI SDK v5 integration
- Mastra blog post on AI SDK integration
- Mastra model providers page

</details>

<details><summary><strong>Evidence Log</strong></summary>

| SourceID | Title                             | Publisher   | URL                                                                                                                | PubDate    | Accessed   | Quote                                                                         | Finding                         | Rel | Conf |
| -------- | --------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------ | ---------- | ---------- | ----------------------------------------------------------------------------- | ------------------------------- | --- | ---- |
| S3.1     | Using Vercel AI SDK               | Mastra Docs | https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk                                                               | n/a        | 2025-09-21 | “Mastra integrates with Vercel’s AI SDK… specify any AI SDK-supported model.” | Confirms provider layer.        | H   | 0.9  |
| S3.2     | Example: AI SDK v5 Integration    | Mastra Docs | https://mastra.ai/examples/agents/ai-sdk-v5-integration                                                            | n/a        | 2025-09-21 | “integrate Mastra agents with AI SDK v5… tool integration.”                   | Shows v5 interop pattern.       | H   | 0.9  |
| S3.3     | Using Vercel’s AI SDK with Mastra | Mastra Blog | https://mastra.ai/blog/using-ai-sdk-with-mastra                                                                     | 2025-02-13 | 2025-09-21 | “built Mastra as a framework on top of the AI SDK.”                           | Architectural confirmation.     | M   | 0.85 |
| S3.4     | Model Providers                   | Mastra Docs | https://mastra.ai/docs/getting-started/model-providers                                                             | n/a        | 2025-09-21 | “AI SDK model providers are packages… install … for a different provider.”    | Provider installation guidance. | M   | 0.8  |

</details>

**Synthesis**

- Mastra layers on the **Vercel AI SDK** and accepts any AI‑SDK provider.
- Tools register on agents; wiring matches the `prompts-tools` plan.

**Decision Hook**

Implement `packages/prompts-tools` and register in a Mastra agent using AI‑SDK providers.

---

## Item 4: Zero‑cost model options for Mastra

**Goal**

List viable free or local providers for Mastra via AI SDK: **Ollama** and **Gemini CLI**.

<details><summary><strong>Query Set</strong></summary>

- ai-sdk.dev community providers: ollama
- npm “ai-sdk-ollama” or similar
- Gemini CLI provider page on ai-sdk.dev
- Gemini CLI provider GitHub readme

</details>

<details><summary><strong>Evidence Log</strong></summary>

| SourceID | Title                          | Publisher   | URL                                                                                                                        | PubDate    | Accessed   | Quote                                                                           | Finding                                  | Rel | Conf |
| -------- | ------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | ------------------------------------------------------------------------------- | ---------------------------------------- | --- | ---- |
| S4.1     | Community Providers: Ollama    | AI SDK Docs | https://ai-sdk.dev/providers/community-providers/ollama                                                                      | n/a        | 2025-09-21 | “Uses the official `ollama` npm package… Full TypeScript support.”              | Confirms Ollama provider exists.         | H   | 0.9  |
| S4.2     | ai-sdk-ollama                  | npm         | https://www.npmjs.com/package/ai-sdk-ollama                                                                                | 2025-08-17 | 2025-09-21 | “provider for Ollama built on the official ollama package.”                     | Reinforces Ollama provider availability. | M   | 0.8  |
| S4.3     | Gemini CLI Provider            | AI SDK Docs | https://ai-sdk.dev/providers/community-providers/gemini-cli                                                                  | n/a        | 2025-09-21 | “enables using Google’s Gemini models through… Gemini CLI.”                     | Confirms Gemini‑CLI provider.            | H   | 0.9  |
| S4.4     | AI SDK Provider for Gemini CLI | GitHub      | https://github.com/ben-vargas/ai-sdk-provider-gemini-cli                                                                    | 2025-07-22 | 2025-09-21 | “Compatible with AI SDK v5… OAuth authentication using Gemini CLI credentials.” | Auth and version specifics.              | H   | 0.9  |

</details>

**Synthesis**

- **Local**: Ollama community provider works with AI SDK; zero API keys.
- **Free lane**: Gemini CLI community provider uses Gemini CLI creds; supports AI SDK v5.

**Decision Hook**

Ship two provider presets: `ollama` default, `gemini-cli` optional.

---

## Item 5: Are Codex and Gemini‑CLI “providers”? What to do

**Goal**

Clarify provider status under AI SDK and integration path with `prompts`.

<details><summary><strong>Query Set</strong></summary>

- openai/codex README MCP config
- Codex issues about transports (stdio vs SSE)
- ai-sdk.dev Gemini CLI provider
- Gemini CLI provider GitHub auth types

</details>

<details><summary><strong>Evidence Log</strong></summary>

| SourceID | Title                                        | Publisher    | URL                                                                                                                        | PubDate    | Accessed   | Quote                                                                       | Finding                             | Rel | Conf |
| -------- | -------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | --------------------------------------------------------------------------- | ----------------------------------- | --- | ---- |
| S5.1     | OpenAI Codex CLI README                      | GitHub       | https://github.com/openai/codex                                                                                            | 2025-09-18 | 2025-09-21 | “Enable by adding an `mcp_servers` section to your `~/.codex/config.toml`.” | Codex consumes MCP via config TOML. | H   | 0.95 |
| S5.2     | Native SSE transport support for MCP servers | GitHub Issue | https://github.com/openai/codex/issues/2129                                                                                | 2025-08-10 | 2025-09-21 | “Currently, Codex only supports MCP servers that communicate over stdio.”   | Transport limitation.               | H   | 0.9  |
| S5.3     | Community Providers: Gemini CLI              | AI SDK Docs  | https://ai-sdk.dev/providers/community-providers/gemini-cli                                                                  | n/a        | 2025-09-21 | “provider… using the Gemini CLI.”                                           | Gemini‑CLI is an AI‑SDK provider.   | H   | 0.9  |
| S5.4     | AI SDK Provider for Gemini CLI               | GitHub       | https://github.com/ben-vargas/ai-sdk-provider-gemini-cli                                                                    | 2025-07-22 | 2025-09-21 | “authType: 'oauth-personal'… uses `~/.gemini/oauth_creds.json`.”            | Concrete auth config.               | H   | 0.9  |

</details>

**Synthesis**

- **Codex** is not an AI‑SDK provider. It is an **MCP client** via `~/.codex/config.toml`. Stdio only per current issues.
- **Gemini‑CLI** is exposed as an AI‑SDK community provider (use in Mastra) and is also an MCP client (configure via settings.json).

**Decision Hook**

Treat Codex as an MCP client only; treat Gemini‑CLI as an AI‑SDK provider (for Mastra) and as an MCP client (for IDE use).

---

## Item 6: Exact touch points to add

**Goal**

Confirm concrete config for **Codex** and **Gemini‑CLI** MCP hookup and provider wiring.

<details><summary><strong>Query Set</strong></summary>

- Codex README: `mcp_servers` key and config path
- Codex community guides showing TOML key name
- Gemini settings.json MCP configuration docs
- Gemini Code Assist docs on MCP config file location
- Gemini CLI provider install and auth options

</details>

<details><summary><strong>Evidence Log</strong></summary>

| SourceID | Title                                   | Publisher    | URL                                                                                                                                                                  | PubDate    | Accessed   | Quote                                                                        | Finding                                       | Rel | Conf |
| -------- | --------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | ---------------------------------------------------------------------------- | --------------------------------------------- | --- | ---- |
| S6.1     | OpenAI Codex CLI README                 | GitHub       | https://github.com/openai/codex                                                                                                                                        | 2025-09-18 | 2025-09-21 | “add an `mcp_servers` section to your `~/.codex/config.toml`.”               | Confirms key + path.                          | H   | 0.95 |
| S6.2     | Codex CLI guide (config.toml)           | Snyk Docs    | https://docs.snyk.io/.../codex-cli-guide                                                                                                                              | 2025-09-03 | 2025-09-21 | “Insert the following `mcpServers` configuration block…”                     | Shows example spelling variation in the wild. | M   | 0.6  |
| S6.3     | Use agentic chat… Configure MCP servers | Google Cloud | https://cloud.google.com/gemini/docs/codeassist/use-agentic-chat-pair-programmer                                                                                      | n/a        | 2025-09-21 | “Open your Gemini settings JSON file, located at `~/.gemini/settings.json`.” | File location + `mcpServers` example.         | H   | 0.9  |
| S6.4     | Gemini CLI Provider                     | AI SDK Docs  | https://ai-sdk.dev/providers/community-providers/gemini-cli                                                                                                           | n/a        | 2025-09-21 | “enables using Google’s Gemini models through the… CLI.”                     | Provider wiring reference.                    | H   | 0.9  |
| S6.5     | AI SDK Provider for Gemini CLI          | GitHub       | https://github.com/ben-vargas/ai-sdk-provider-gemini-cli                                                                                                              | 2025-07-22 | 2025-09-21 | “createGeminiProvider({ authType: 'oauth-personal' })”                       | Auth options for provider.                    | H   | 0.9  |

</details>

**Synthesis**

- **Codex ↔ prompts MCP**: add `mcp_servers` in `~/.codex/config.toml`. Use `command="node"` and args to your built server path, e.g. `/c/Users/user/.../dist/mcp/server.js`.
- **Gemini‑CLI ↔ MCP**: edit `~/.gemini/settings.json` and add `"mcpServers": { "prompts": { "command": "node", "args": [".../server.js"] } }`.
- **Mastra ↔ providers**: install and configure `ai-sdk-provider-gemini-cli` or an Ollama provider; select via AI SDK model factory.

**Decision Hook**

Publish copy‑paste config snippets for both files with server path placeholders (include Windows/WSL path examples).

---

## Item 7: Minimal migration plan for `prompts`

**Goal**

Sequence steps to reach ingest + MCP + CLI + Mastra tool consumption.

<details><summary><strong>Query Set</strong></summary>

- Task‑Master Task Structure page for statuses and fields
- MCP transports overview to select stdio
- Mastra “Using Vercel AI SDK” to confirm provider abstraction
- AI SDK community providers pages for Ollama and Gemini CLI
- Codex README MCP config

</details>

<details><summary><strong>Evidence Log</strong></summary>

| SourceID | Title                       | Publisher        | URL                                                                                                                        | PubDate    | Accessed   | Quote                                                        | Finding                              | Rel | Conf |
| -------- | --------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | ------------------------------------------------------------ | ------------------------------------ | --- | ---- |
| S7.1     | Task Structure              | Task Master Docs | https://docs.task-master.dev/capabilities/task-structure                                                                     | n/a        | 2025-09-21 | “Tasks in tasks.json have the following structure…”          | Baseline schema.                     | H   | 0.95 |
| S7.2     | Transports                  | MCP Docs         | https://modelcontextprotocol.io/docs/concepts/transports                                                                      | 2025-06-18 | 2025-09-21 | “two standard transport mechanisms… stdio… Streamable HTTP.” | Choose stdio for max client support. | H   | 0.9  |
| S7.3     | Using Vercel AI SDK         | Mastra Docs      | https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk                                                                          | n/a        | 2025-09-21 | “Mastra integrates with Vercel’s AI SDK…”                    | Provider abstraction confirmed.      | H   | 0.9  |
| S7.4     | Community Providers: Ollama | AI SDK Docs      | https://ai-sdk.dev/providers/community-providers/ollama                                                                        | n/a        | 2025-09-21 | “Uses the official `ollama` npm package…”                    | Local default.                       | M   | 0.9  |
| S7.5     | Gemini CLI Provider         | AI SDK Docs      | https://ai-sdk.dev/providers/community-providers/gemini-cli                                                                    | n/a        | 2025-09-21 | “community provider… Gemini CLI.”                            | Optional free lane.                  | M   | 0.9  |
| S7.6     | OpenAI Codex CLI README     | GitHub           | https://github.com/openai/codex                                                                                               | 2025-09-18 | 2025-09-21 | “add an `mcp_servers` section…”                              | Codex hookup.                        | H   | 0.95 |

</details>

**Synthesis (Step‑by‑step)**

1. Author `schemas/task.json` as superset of Task‑Master.
2. Implement pure `graph.ts` and `update.ts` based on that schema.
3. Expose an **MCP stdio** server wrapping those functions.
4. Ship a thin **Commander** CLI mapping to the same functions.
5. Add a **Mastra example** using AI SDK providers (Ollama default, Gemini CLI optional).
6. Publish **Codex** and **Gemini** config snippets.

**Decision Hook**

Green‑light implementation with stdio MCP as the common surface.

---

## Item 8: Gemini‑CLI free usage context

**Goal**

Validate generous free limits for Gemini CLI preview and note variability.

<details><summary><strong>Query Set</strong></summary>

- The Verge coverage on Gemini CLI preview limits
- Google codelab or official doc referencing free preview
- Gemini CLI GitHub README general description

</details>

<details><summary><strong>Evidence Log</strong></summary>

| SourceID | Title                          | Publisher | URL                                                                                                                                                          | PubDate    | Accessed   | Quote                                                            | Finding                           | Rel | Conf |
| -------- | ------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ---------- | ---------------------------------------------------------------- | --------------------------------- | --- | ---- |
| S8.1     | Google is bringing Gemini CLI… | The Verge | https://www.theverge.com/news/692517/google-gemini-cli-ai-agent-dev-terminal                                                                                  | 2025-06-25 | 2025-09-21 | “preview… free… usage limit of 60 rpm and 1,000 daily requests.” | Reports preview limits.           | H   | 0.75 |
| S8.2     | Gemini CLI                     | GitHub    | https://github.com/google-gemini/gemini-cli                                                                                                                   | n/a        | 2025-09-21 | “open-source AI agent… brings the power of Gemini… terminal.”    | Confirms project and positioning. | M   | 0.9  |

</details>

**Synthesis**

- Gemini CLI preview was free with high limits; limits may change. Treat as non‑contractual and re‑verify before publishing guarantees.

**Decision Hook**

Position Gemini‑CLI as “often zero‑cost for dev,” with a recheck step on limits.

---

## Roll‑up Summary

| Item                     | Status   | Decision enabled                                                    |
| ------------------------ | -------- | ------------------------------------------------------------------- |
| 1. Ingest + state engine | Complete | Build schema superset and readiness logic identical to Task‑Master. |
| 2. CLI                   | Complete | Start with Commander; revisit oclif if installers needed.           |
| 3. Mastra layer          | Complete | Register `prompts-tools` on Mastra agent using AI SDK.              |
| 4. Zero-cost models      | Complete | Ship presets for Ollama and Gemini‑CLI.                             |
| 5. Providers vs clients  | Complete | Codex = MCP client; Gemini‑CLI = AI‑SDK provider + MCP client.      |
| 6. Touch points          | Complete | Publish Codex TOML + Gemini settings JSON snippets.                 |
| 7. Migration plan        | Complete | Execute six steps with stdio MCP core.                              |
| 8. Free limits           | Partial  | Media‑reported; verify per release.                                 |

---

### Monitoring Note

We will track upstream changes that might impact this plan:

- Task‑Master docs/repo: schema fields, `next` semantics, MCP tools
- Mastra docs/examples: provider integration, tool interfaces, Node version
- AI SDK providers (Ollama, Gemini CLI): install/auth/compat
- Codex CLI: transport support or config key changes

Significant updates will be noted in this document with dates and links.

