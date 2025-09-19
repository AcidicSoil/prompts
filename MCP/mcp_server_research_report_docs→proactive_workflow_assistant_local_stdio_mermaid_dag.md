# MCP Server Research Report — Converting a Markdown Prompt Library into a Proactive Workflow Assistant (Local/STDIO, Mermaid DAG)

> Scope: Turn a Markdown-only prompt repo (Codex CLI playbooks) into a local-first MCP server that exposes prompts as tools, tracks project state, interprets a Mermaid workflow, and proactively suggests/executes next steps via stdio with MCP Inspector / Claude Desktop.
> Note: Citations are provided in chat alongside this canvas.

---

## 1) Executive Summary
A viable path is to wrap each Markdown playbook as an MCP **prompt/tool**, add a **state store** to track phase/tasks, parse the **Mermaid** DAG to compute “what’s next,” and use **server notifications** or a `next_step` tool to proactively guide execution. Transport is **stdio** to integrate with Claude Desktop and MCP Inspector.

---

## 2) MCP-Native Patterns to Reuse

### A. Prompts-as-Tools
- Expose each Markdown playbook as an MCP **prompt** and/or **tool** (name, description, inputs).
- Optional: Read YAML front‑matter for metadata (phase tags, gates, inputs, outputs).
- Provide list/get/run endpoints: `list_prompts`, `get_prompt`, `run_prompt` or a single `run_{slug}` tool.

### B. Local-First over STDIO
- Package the server as a CLI (Node/TS or Python) that speaks MCP over **stdio**.
- Ship a minimal config example for Claude Desktop / MCP Inspector.

### C. Persistent Project State
- Maintain a simple SQLite/JSON store of: `phase`, `tasks`, `decisions`, `artifacts`, and `gate_status`.
- Provide tools: `get_state`, `set_state`, `advance_phase`, `add_task`, `complete_task`, `log_decision`.

### D. Diagram-Aware Planner (Mermaid)
- Parse `workflow.mmd` and build a DAG: nodes = phases/steps, edges = transitions (with optional condition tags).
- Compute **eligible next steps** as nodes with satisfied predecessors and unmet outputs.
- Map nodes → prompt/tool slugs, so planner can suggest or trigger the right command.

### E. Proactive Guidance
- Implement `next_step_recommendation(state)` returning: next node(s), rationale, required inputs, and candidate tools.
- Optionally send **server notifications** to nudge when a gate is cleared, or auto‑call follow‑ups when user toggles an `auto_advance` flag.

---

## 3) Reference Implementations & Docs (Mapped to Needs)

- **Prompts exposure**: Reuse the official MCP **Prompts** concept; mirror shape/semantics; treat Markdown playbooks as named prompt templates with args.
- **Mermaid/diagram ops**: Use an existing **Mermaid MCP** (or embed a lightweight mermaid parser) to analyze graph structure and generate/validate diagrams.
- **Project state servers**: Study small **project‑context/tracking** MCP servers (often SQLite + FastMCP) for patterns: schema, tool surface, session persistence.
- **Inspector & debugging**: Use **MCP Inspector** to iterate on tool shapes, prompt discovery, notifications, and stdio wiring.
- **Architecture (local vs remote)**: Follow **Architecture** guidance for local stdio servers and client attachment.
- **Server notifications**: Implement proactive hints via notifications panel; or expose a `poll_next_step` tool the client calls after each action.

---

## 4) Minimal Architecture (ASCII)

```
+--------------------+       stdio       +--------------------+
|  Claude Desktop /  | <----------------> |   MCP Server      |
|  MCP Inspector     |                   |  (Node/TS or Py)  |
+--------------------+                   +--------------------+
                                             |  |   |   |
                                             |  |   |   +-- Notifications (proactive hints)
                                             |  |   +------ State Store (SQLite/JSON)
                                             |  +---------- Mermaid DAG Parser
                                             +------------- Prompts/Tools Registry
```

**Core modules**
- `server.ts` / `main.py`: stdio transport, tool & prompt registry
- `registry/`: loads Markdown prompts + front‑matter → tool descriptors
- `state/`: persistence (SQLite/SQLModel or JSON + locks)
- `planner/mermaid.ts`: parse DAG; next-step computation; gate checks
- `orchestrator/`: optional sequencing for multi-step tool chains

---

## 5) Mermaid DAG → Next-Step Logic (Algorithm Sketch)

1. **Load DAG** from `workflow.mmd` → `Graph{nodes, edges}`
2. **Annotate nodes** with metadata from prompt front‑matter (phase, inputs, outputs, gates)
3. **Read state**: `completed_nodes`, `artifacts`, `decisions`, `signals`
4. **Eligible set** = nodes where all predecessors ∈ `completed_nodes` and gate preconditions satisfied
5. Rank eligible nodes by: (a) critical path, (b) missing artifacts, (c) user intent tokens in last message
6. Emit `NextStep{nodeId, promptSlug, rationale, requiredInputs}`
7. If `auto_advance=true` and inputs resolvable, **invoke** tool; else **notify** suggestion

---

## 6) Tool Surface (Draft)

- `list_prompts()` → `[PromptMeta]`
- `run_prompt(slug, args)` → `{outputs, artifacts}`
- `get_state()` / `set_state(patch)` → `{phase, tasks, gates, artifacts}`
- `advance_phase(target)` → `{phase}` (validates Mermaid edges + gate checks)
- `next_step_recommendation()` → `{candidates[], rationale, missing_inputs}`
- `record_gate_result(gateId, pass|fail, notes)` → updates state
- `render_workflow(format=svg|png)` → returns diagram for UI feedback

---

## 7) Implementation Notes

- **Front‑matter schema** per playbook: `id`, `title`, `phase`, `inputs`, `produces`, `gates`, `estimated_cost`, `tags`.
- **Idempotency**: tools should be safe to re‑run or detect prior outputs (hash/artifact check).
- **Artifacts**: persist key outputs (files, links) with reverse index → nodes that produced them.
- **Testing**: scriptable Inspector sessions; golden files for `next_step_recommendation` on sample states.
- **Security**: if any tool shells out, sandbox paths and validate args; prefer explicit allow‑lists.

---

## 8) Quickstart (TS Example Outline)

1. **Scaffold**: `pnpm add @modelcontextprotocol/sdk` (or FastMCP for Python)
2. **Load prompts**: glob `prompts/**/*.md`, parse front‑matter, register with SDK
3. **State store**: init SQLite/JSON; define schema + accessors
4. **Mermaid parser**: load `workflow.mmd` → `Graph` (use existing lib or simple parser)
5. **Planner tool**: implement `next_step_recommendation()` using DAG + state
6. **Notifications**: after tool success, compute next candidates and `notify()`
7. **Inspect**: run via MCP Inspector; iterate shapes/IO contracts

---

## 9) Risks & Limitations
- **Ecosystem flux**: MCP SDK revisions may change prompt/tool registration APIs.
- **Diagram fidelity**: Mermaid → DAG parsing may miss semantics (conditions, loops) without conventions.
- **Autonomy boundaries**: aggressive auto‑advance can surprise users; keep a toggle and confirmations.
- **State drift**: ensure gates reflect real artifacts (tests, files) not just flags; add verifiers.

---

## 10) Action Plan (2 Weeks)

**Day 1–2**  Setup server skeleton (stdio), prompt loader, and basic `list/get/run` tools.
**Day 3–4**  Add state store + CRUD tools; persist phase/tasks/decisions.
**Day 5–6**  Implement Mermaid parser + node↔prompt mapping.
**Day 7–8**  Build `next_step_recommendation` + ranking; wire notifications.
**Day 9–10**  Inspector test flows; add idempotency and artifact indexing.
**Day 11–12**  Author gates for each phase; add `advance_phase` validation.
**Day 13–14**  Hardening: errors, metrics logs, sample configs for Claude Desktop/Inspector.

---

## 11) Deliverables
- MCP server (stdio) with prompt registry, state store, Mermaid planner.
- Inspector scripts & fixtures for reproducible tests.
- Sample client configs (Claude Desktop / Inspector).
- Developer docs: front‑matter schema, tool contracts, gate policy.

**Sources used (high-signal):**

* MCP Prompts concept & API (protocol site). ([Model Context Protocol][1])
* MCP architecture (local/STDIO vs remote/HTTP). ([Model Context Protocol][2])
* MCP Inspector docs & GitHub (testing stdio servers, notifications view). ([Model Context Protocol][3])
* Mermaid-focused MCP servers (features, analysis): Lobehub page; GitHub impl; marketplace entry. ([LobeHub][4])
* Project/persistent-context MCP servers (state, planning): discovery pages/articles. ([LobeChat][5])
* How-to guides for building MCP servers (quickstart, prompts in servers, notifications). ([Medium][6])
* Overview/tutorials of MCP features (prompts/resources/tools, practical server build). ([WorkOS][7])

[1]: https://modelcontextprotocol.io/docs/concepts/prompts?utm_source=chatgpt.com "Prompts"
[2]: https://modelcontextprotocol.io/docs/concepts/architecture?utm_source=chatgpt.com "Architecture overview"
[3]: https://modelcontextprotocol.io/docs/tools/inspector?utm_source=chatgpt.com "MCP Inspector"
[4]: https://lobehub.com/mcp/kayaozkur-mcp-server-mermaid?utm_source=chatgpt.com "MCP Mermaid Server"
[5]: https://lobechat.com/discover/mcp/aaronfeingold-mcp-project-context?utm_source=chatgpt.com "MCP Project Context Server"
[6]: https://matt-harper.medium.com/getting-started-with-mcp-model-context-protocol-ded288ef3ae7?utm_source=chatgpt.com "Getting Started with MCP (Model Context Protocol)"
[7]: https://workos.com/blog/mcp-features-guide?utm_source=chatgpt.com "Understanding MCP features: Tools, Resources, Prompts ..."
