# Overview

Mastra–MCP Prompt Orchestrator (MMPO) converts a repository of Markdown prompts into production-grade, agent-callable tools using Mastra’s Model Context Protocol (MCP) patterns. It serves internal agent developers, prompt engineers, and research analysts who need consistent, discoverable, and composable “prompt tools,” plus curated external toolsets (filesystem, GitHub, search, browser) and an optional local inference provider (Nexa SDK). MMPO reduces glue-code, enforces schemas, and standardizes integration so that agents can reason, plan, and act with predictable inputs/outputs.

# Core Features

**1) Prompt Registry & Auto-Tooling**

- **What:** One MCP tool per prompt generated from prompt metadata (slug, description, variables), with strict input schemas and versioning.
- **Why:** Eliminates ad-hoc prompt usage; enables discoverability and safe, typed invocation by agents and clients.
- **High-level How:** Loader scans `prompts/` for metadata, builds a schema per prompt (from `variables[]`), registers tools on an MCP server under `prompts/<slug>`, returning `{content}` and structured outputs where applicable.
- **Acceptance criteria (BDD):**
  - Given a prompt file with `variables[]`, When the server starts, Then an MCP tool named `prompts/<slug>` is registered with a matching JSON-schema.
  - Given a missing optional variable default, When the tool is invoked without that variable, Then invocation succeeds using the default and logs resolved inputs.
  - Given a prompt marked deprecated, When clients request tools, Then the deprecated tool is hidden by default and flagged in metadata.

**2) Mastra MCP Client Orchestration (Static + Dynamic Toolsets)**

- **What:** Combine core, low-latency utilities via static `getTools()` with per-request `getToolsets()` attachments (e.g., search, GitHub) to minimize overhead and scope access.
- **Why:** Faster warm paths and safer, least-privilege dynamic capabilities.
- **High-level How:** The Agent process initializes a client with a static set; planners attach additional toolsets on demand for a task window.
- **Acceptance criteria (BDD):**
  - Given only static tools configured, When a task does not require external resources, Then no dynamic toolset is attached and latency stays within target.
  - Given a task requires GitHub read-only, When `getToolsets()` attaches the GitHub set, Then only read endpoints are available in that session.
  - Given dynamic tools attached, When the task completes, Then the client detaches them and clears credentials from memory.

**3) Mastra MCP Server & Agent-as-Tool Exposure**

- **What:** Expose internal agents as MCP tools (`ask_<agentKey>`) alongside prompt tools with human-readable descriptions.
- **Why:** Enables external MCP clients to call house agents and allows composition (agents calling agents) through a unified surface.
- **High-level How:** Start a Mastra-backed MCP server; register prompt tools and export agents with descriptions; run over stdio initially.
- **Acceptance criteria (BDD):**
  - Given an agent with a non-empty description, When the server starts, Then a tool `ask_<agentKey>` appears in the tool list.
  - Given a tool call to `ask_planner` with a question, When executed, Then the agent returns a structured plan artifact.
  - Given a client without permission, When attempting to call a restricted agent tool, Then the server denies with a policy error.

**4) Curated MCP Integrations (FS, GitHub, Search, Browser)**

- **What:** Production-ready connectors: Filesystem (sandboxed), GitHub (read-only default), Web Search/Fetch, and Browser automation.
- **Why:** Provides the essential research and codebase context needed by agents while controlling risk and blast radius.
- **High-level How:** Version-pin selected servers; gate write operations behind dry-run/approvals; expose as dynamic toolsets.
- **Acceptance criteria (BDD):**
  - Given FS sandbox roots configured, When a tool reads files outside roots, Then access is denied and audited.
  - Given GitHub read-only mode, When a tool tries to write, Then the call is blocked and a remediation hint is returned.
  - Given Search/Fetch results, When an agent requests page content, Then the server returns parsed text with source metadata.
  - Given Browser automation unavailable on host, When a plan requests browser steps, Then the system falls back to fetch+parse with notices.

**5) Local Provider Integration (Nexa SDK)**

- **What:** Optional local, OpenAI-compatible inference provider for chat, embeddings, and reranking; selectable per task.
- **Why:** Improves privacy, cost, and offline resilience; supports hardware acceleration where available.
- **High-level How:** Provider abstraction accepts base URL + model; feature flags enable `/embeddings` and `/reranking` when present; model-format awareness (e.g., MLX vs GGUF).
- **Acceptance criteria (BDD):**
  - Given the local provider is reachable, When selected, Then chat requests stream tokens and complete within latency targets.
  - Given embeddings enabled, When an agent requests vectorization, Then vectors are produced with recorded model+dimension metadata.
  - Given reranking unavailable on provider, When requested, Then the system degrades to client-side scoring and logs the fallback.

**6) Safety, Policy, and Side-Effect Guardrails**

- **What:** Least-privilege credentials, dry-run by default on mutating actions, E2E audit logs, rate limits, and PII-safe telemetry.
- **Why:** Prevents accidental changes, enforces governance, and supports incident response.
- **High-level How:** Policy engine mediates all tool calls; mutation calls require `intent=write` and optional approval tokens.
- **Acceptance criteria (BDD):**
  - Given `intent` not set to `write`, When a mutating operation is invoked, Then the call is rejected with instructions to enable write safely.
  - Given audit logging enabled, When any tool runs, Then inputs/outputs/latency and decision traces are recorded without sensitive payloads.
  - Given rate limits configured, When calls exceed thresholds, Then callers receive backoff guidance and a retry-after hint.

# User Experience

**Personas**

- Prompt Engineer: curates prompts, defines variables, validates outputs.
- Agent Developer: composes agents with prompt tools and external toolsets.
- Research Analyst: runs orchestrations with minimal setup; reads structured outputs.
- Platform/Security Admin: configures sandboxes, scopes, policies, and auditing.

**Key Flows**

- Register a prompt → tool is generated → agent invokes tool with typed inputs → result is used downstream.
- Attach dynamic toolsets per task (e.g., GitHub read-only + Search) and detach on completion.
- Switch provider to local (Nexa) for privacy/offline tasks; revert to remote provider as needed.

**UI/UX Considerations**

- Minimal CLI and configuration-first experience; optional lightweight admin page for tool catalog, policies, and logs.
- Clear affordances for dry-run vs write mode; explicit banners when fallbacks are active.
- Structured artifacts (plans, citations, summaries) output as JSON alongside human-readable text.

**Accessibility Considerations**

- Keyboard-first interactions in any UI; semantic headings/labels.
- High-contrast mode and screen-reader-friendly form fields for tool inputs.

# Technical Architecture

**System Components**

- Prompt Loader & Schema Builder: parses metadata, generates JSON-schemas, versions tools.
- MCP Server: hosts prompt tools and `ask_<agent>` tools over stdio; optional SSE/HTTP later.
- MCP Client Orchestrator: manages static tools and on-demand dynamic toolsets per request.
- Integration Servers: Filesystem (sandboxed), GitHub (read-only default), Search/Fetch, Browser automation.
- Provider Layer: pluggable OpenAI-compatible providers; optional Nexa local provider.
- Policy & Guardrails: intent gates, approvals, rate limits, audit logs.
- Observability: metrics, traces, structured logs; redaction for sensitive fields.

**Data Models**

- Prompt: `{ slug, name, description, version, variables: [{ name, type, required, default, description }], category, deprecated?: boolean }`.
- Tool Registration: `{ toolName, schemaRef, version, sideEffects: 'none'|'read'|'write', visibility }`.
- Run Record: `{ id, toolName, inputs, outputsRef, status, latencyMs, startedAt, finishedAt, caller, fallbacks: [] }`.
- Sandbox Config: `{ roots: [path], denyPatterns: [glob], readOnly: boolean }`.
- Provider Config: `{ providerKey, baseUrl, model, features: { embeddings?: boolean, reranking?: boolean }, hardwareHints }`.

**APIs & Integrations**

- MCP Server (stdio initially) exposing: `prompts/<slug>` tools and `ask_<agent>` tools.
- MCP Client with `getTools()` (static) and `getToolsets()` (dynamic) to attach FS/GitHub/Search/Browser.
- OpenAI-compatible Provider API for chat/embeddings/reranking; model registry for format/hardware hints.

**Infrastructure Requirements**

- Runs locally-first; containerized deployment optional.
- Secrets injected via environment/secret store; no secrets persisted to logs.
- File access restricted to sandbox roots; outbound HTTP egress controlled by policy.

**Non-Functional Requirements (NFRs)**

- Latency: static tool calls p50 ≤ 300ms; dynamic toolset attach overhead ≤ 500ms; local chat p95 ≤ 3s per 100 tokens.
- Reliability: successful tool call rate ≥ 99%; graceful degradation on missing integrations.
- Observability: 100% of calls logged with redaction; trace sampling configurable.
- Security: least-privilege tokens; write actions require explicit intent and optional approval.
- Privacy: PII redaction on logs; local provider option for sensitive workloads.

**Cross-Platform Strategy**

- Platform-Specific Capabilities: macOS may run MLX models; Linux/Windows prefer GGUF. Browser automation may vary by host.
- Fallbacks (work everywhere): if Browser automation unavailable → use Search/Fetch parsing; if reranking unsupported → client-side scoring; if GitHub write blocked → read-only with patch proposal artifact; if local provider unreachable → use remote provider.
- BDD Acceptance Tests for Fallbacks:
  - Given Browser tools are unavailable on the host, When an automation step requires DOM interaction, Then the system uses Search/Fetch parsing and annotates the plan with a fallback notice.
  - Given provider reranking is unsupported, When reranking is requested, Then results are produced via client-side scoring with a recorded `fallback='client_rerank'` flag.
  - Given write intent is disabled, When a change is proposed to GitHub, Then a patch file and instructions are emitted instead of performing the write.
  - Given the local provider is down, When a chat completion is requested, Then the remote provider is used and a provider-switch event is logged.

**Security & Privacy Considerations**

- Sensitive data categories: repository paths, access tokens, search queries, and user-provided prompt inputs.
- Controls: token scoping, sandboxed FS access, network egress policies, approval gates for mutations, redacted structured logs.
- Never store secrets in prompts or tool metadata; environment-only and rotated regularly.

# Development Roadmap

**MVP Scope (with acceptance criteria)**

- Prompt Registry & Auto-Tooling: Given valid prompt metadata, When server boots, Then tools are registered and invocable with schema validation.
- MCP Server & Agent-as-Tool: Given at least one agent with description, When server exposes tools, Then `ask_<agent>` appears and returns structured outputs.
- MCP Client Orchestration: Given static tools configured, When a task runs, Then dynamic toolsets are not attached unless requested by the planner.
- FS & GitHub (read-only) Integrations: Given sandbox roots and GitHub read-only tokens, When invoked, Then reads succeed and writes are prevented with guidance.
- Safety & Audit: Given policy engine enabled, When any tool runs, Then an audit record is stored with redacted fields.

**Post-MVP Enhancements (with acceptance criteria)**

- Browser Automation: Given browser tools available, When a page task is run, Then DOM actions succeed and snapshots are archived.
- Local Provider (Nexa) Chat/Embeddings: Given local provider configured, When selected, Then chat streams and embeddings return within NFRs.
- Reranking Feature Flag: Given reranking is enabled, When called, Then ranked items include scores and provenance; when disabled, Then fallback scoring applies.
- Admin Catalog & Policies UI: Given a user with admin role, When visiting the catalog, Then they can view tools, toggle visibility, and edit policies with audit.
- Write Workflows with Approvals: Given `intent=write` and approval token present, When a mutating call is made, Then changes are applied and logged with reviewer identity.
- SSE/HTTP Transport Option: Given server runs with HTTP transport, When a client connects, Then the same tools are discoverable and callable over HTTP.

# Logical Dependency Chain

1) Foundations: data models, loader, schema builder, audit, policy gates.
2) MCP Server baseline over stdio; register prompt tools and agent tools.
3) MCP Client static tools; planner logic for dynamic toolsets.
4) FS sandbox + GitHub read-only; validate end-to-end flows.
5) Search/Fetch integration; basic parsing outputs.
6) Browser automation (optional) with graceful fallbacks.
7) Provider abstraction; add local provider; performance tuning.
8) Admin catalog/policies UI; approvals for writes.
9) Alternative transports (SSE/HTTP), packaging, and version pinning.

# Risks and Mitigations

- **FS Sandbox Escape** — *Likelihood:* Medium, *Impact:* High. *Mitigation:* strict roots, deny-patterns, path normalization, unit tests for traversal.
- **GitHub Write Misuse** — *Likelihood:* Medium, *Impact:* High. *Mitigation:* read-only default; `intent=write` + approval token; dry-run patches first.
- **Integration Churn (MCP server versions)** — *Likelihood:* Medium, *Impact:* Medium. *Mitigation:* pin versions; smoke tests; compatibility matrix.
- **Local Provider Hardware Variability** — *Likelihood:* Medium, *Impact:* Medium. *Mitigation:* model-format hints; MLX on macOS and GGUF elsewhere; automatic provider fallback.
- **Prompt Schema Gaps** — *Likelihood:* High, *Impact:* Medium. *Mitigation:* conservative defaults, required flags, schema linter, CI checks.
- **Network/Egress Restrictions** — *Likelihood:* Medium, *Impact:* Medium. *Mitigation:* offline-first flows; fallbacks to local context; clear error surfaces.
- **PII/Secrets in Logs** — *Likelihood:* Low, *Impact:* High. *Mitigation:* redaction, allowlist fields, periodic audits, no secret persistence.
- **Browser Automation Instability** — *Likelihood:* Medium, *Impact:* Medium. *Mitigation:* feature flag; switch to fetch+parse fallback automatically.
- **Vendor Lock-in** — *Likelihood:* Low, *Impact:* Medium. *Mitigation:* MCP standard; OpenAI-compatible provider abstraction; portable schemas.

# Appendix

**Assumptions**

- Product name set to “Mastra–MCP Prompt Orchestrator (MMPO)” for clarity; may be renamed.
- Minimal CLI and optional lightweight admin UI are acceptable for v1.
- Prompt metadata includes `variables[]` sufficient for schema generation; gaps handled by defaults and linter.
- GitHub integration starts read-only; write paths require approvals and are post-MVP.
- Local provider (Nexa) is optional and toggled per environment.
- Running over stdio initially is acceptable; HTTP/SSE may follow later.

**Research Findings & References (from README content only)**

- Mastra MCPClient supports static and dynamic tool discovery.
- Mastra MCPServer exposes agents as `ask_<agentKey>` tools with descriptions.
- Mature MCP servers exist for Filesystem, GitHub, Search, and Browser automation.
- Nexa SDK offers OpenAI-compatible local APIs, embeddings, and reranking; MLX models are macOS-only; GGUF suits cross-platform needs.

**Context Notes (visible link text only)**

- mastra.ai — Mastra references and docs for MCP client/server, tools, and agents.
- npm — Filesystem MCP server package and versions.
- GitHub — Official GitHub MCP server and releases; additional server repos.
- Model Context Protocol — Developer documentation for connecting local servers.
- docs.tavily.com — Tavily MCP server documentation for search.
- Nexa Docs — Nexa SDK capabilities and endpoints.
- Hugging Face — NexaAI model availability in GGUF/MLX formats.

**Technical Specifications & Glossary**

- **MCP (Model Context Protocol):** A standard for exposing tools/servers to AI clients.
- **Mastra:** Agent framework with MCP client/server utilities and agent-as-tool exposure.
- **Toolset:** A group of related tools attached dynamically to a client session.
- **Prompt Tool:** An MCP tool generated from a Markdown prompt and variables schema.
- **Stdio Transport:** Standard I/O-based server transport used for local development.
- **MLX:** Apple’s ML framework; macOS-only; useful for local acceleration.
- **GGUF:** Quantized model format suitable across platforms and devices.
- **Intent Flag:** Parameter indicating read vs write actions for policy gating.

