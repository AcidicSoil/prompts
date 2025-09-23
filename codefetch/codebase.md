.markdownlint-cli2.jsonc
```
1 | {
2 |   // Ignore patterns for markdownlint-cli2
3 |   "ignores": ["node_modules/**", "dist/**", "build/**", "tmp/**", "codefetch/",".archive/", "MCP/", ".taskmaster/"],
4 | 
5 |   // You can also include rule configuration here
6 |   "config": {
7 |     "default": true,
8 |     "MD013": false // Disable line length rule
9 |   }
10 | }
```

.markdownlint.json
```
1 | {
2 |   "default": true,
3 | 
4 |   "MD003": { "style": "atx" },
5 |   "MD004": { "style": "dash" },
6 |   "MD007": { "indent": 2 },
7 |   "MD012": false,
8 |   "MD013": false,
9 |   "MD022": false,
10 |   "MD024": false,
11 |   "MD026": { "punctuation": ".,;:!?" },
12 |   "MD033": false,
13 |   "MD034": false,
14 |   "MD036": false,
15 |   "MD041": false,
16 |   "MD040": false,
17 |   "MD051": false,
18 |   "MD046": { "style": "fenced" },
19 |   "MD048": { "style": "backtick" },
20 |   "MD056": false
21 | }
```

AGENTS.md
```
1 | ## Instruction Loading Model (Extended)
2 | 
3 | - **Baseline:** This file (AGENTS.md) is the canonical baseline.
4 | 
5 | - **Two extension types:**
6 | 
7 |   1. **Behavior extensions**. Plain instruction files.
8 | 
9 |      - Locations: `instructions/**/*.md`, `instructions/**/*.txt`
10 |      - Ignored: paths starting with `_`, or names containing `.archive.`
11 |   2. **Rule-packs**. Files with YAML front matter:
12 | 
13 |      ```markdown
14 |      ---
15 |      description: <one-line purpose>
16 |      globs: <glob or comma-list, e.g., **/* or src/**/*.ts,apps/**>
17 |      alwaysApply: true|false
18 |      ---
19 |      <optional body>
20 |      ```
21 | 
22 |      - Locations: `instructions/**/*.md`, `instructions/**/*.mdc`, `.cursor/rules/**/*.mdc`
23 |      - Detection: file starts with `---` and declares `description`, `globs`, `alwaysApply`
24 | 
25 | - **Scope semantics:**
26 | 
27 |   - `globs` limits where the pack claims relevance. If empty or missing, scope is repo-wide.
28 |   - A pack can be listed even if no current files match, but it is marked “out of scope”.
29 | 
30 | - **Order and precedence:**
31 | 
32 |   - Default load order: lexicographic by path.
33 |   - User can reorder before apply. Later wins on conflict.
34 |   - If `alwaysApply: true`, default selection is **on** and pinned to the **end** of the order unless the user moves it.
35 | 
36 | ---
37 | 
38 | ## Startup confirmation flow
39 | 
40 | 1. **Discover**
41 | 
42 |    - Collect behavior extensions and rule-packs from the locations above.
43 |    - Exclude `_` prefixed paths and `.archive.` files.
44 | 2. **Summarize**
45 | 
46 |    - Title = first `# H1` if present, else filename.
47 |    - For rule-packs show `alwaysApply` and `globs`.
48 | 3. **Confirm**
49 | 
50 |    - Options: **Apply all**, **Apply none**, **Select subset and order**.
51 |    - Default = **Apply none** for behavior extensions. **Apply** for rule-packs with `alwaysApply: true`.
52 | 4. **Record**
53 | 
54 |    - Write final order to `DocFetchReport.approved_instructions[]`.
55 |    - Write approved rule-packs to `DocFetchReport.approved_rule_packs[]` with `{path, alwaysApply, globs}`.
56 | 
57 | ---
58 | 
59 | ## Validation
60 | 
61 | - Behavior extension: must be readable text.
62 | - Rule-pack: must have front matter with `description` (string), `globs` (string), `alwaysApply` (bool).
63 | - Invalid items are skipped and logged in `DocFetchReport.validation_errors[]`.
64 | 
65 | ---
66 | 
67 | ## Execution flow (docs integration)
68 | 
69 | - **Preflight must list:**
70 | 
71 |   - `DocFetchReport.context_files[]` from `@{...}`
72 |   - `DocFetchReport.approved_instructions[]`
73 |   - `DocFetchReport.approved_rule_packs[]`
74 | - Compose in this order:
75 | 
76 |   1. Baseline
77 |   2. Behavior extensions
78 |   3. Rule-packs
79 | - Proceed only when `DocFetchReport.status == "OK"`.
80 | 
81 | ---
82 | 
83 | ## Conflict resolution
84 | 
85 | - **Specificity rule:** If both target the same scope, the later item in the final order wins.
86 | - **Pack vs. extension:** No special case. Order controls outcome.
87 | - **Out-of-scope packs:** Do not affect behavior. They remain listed as informational.
88 | 
89 | ---
90 | 
91 | ## Tagging Syntax (context only)
92 | 
93 | **Context tag — `@{file}` (no behavior change)**
94 | 
95 | - Purpose: include files for retrieval only.
96 | - Syntax: `@{path/to/file.md}`. Globs allowed.
97 | - Report under `DocFetchReport.context_files[]`.
98 | 
99 | ---
100 | 
101 | ## Resolution and loading
102 | 
103 | 1. Baseline = AGENTS.md.
104 | 2. Load **approved behavior extensions** in final order.
105 | 3. Load **approved rule-packs** in final order. Packs with `alwaysApply: true` default to the end.
106 | 4. Apply later-wins on conflicts.
107 | 5. Record `DocFetchReport.status`.
108 | 
109 | ---
110 | 
111 | ## Validation
112 | 
113 | - Behavior extension: must be readable text.
114 | - Rule-pack: must have front matter with `description` (string), `globs` (string), `alwaysApply` (bool).
115 | - Invalid items are skipped and logged in `DocFetchReport.validation_errors[]`.
116 | 
117 | ---
118 | 
119 | ## Execution flow (docs integration)
120 | 
121 | - **Preflight must list:**
122 | 
123 |   - `DocFetchReport.context_files[]` from `@{...}`
124 |   - `DocFetchReport.approved_instructions[]`
125 |   - `DocFetchReport.approved_rule_packs[]`
126 | - Compose in this order:
127 | 
128 |   1. Baseline
129 |   2. Behavior extensions
130 |   3. Rule-packs
131 | - Proceed only when `DocFetchReport.status == "OK"`.
132 | 
133 | ---
134 | 
135 | ## Failure handling
136 | 
137 | - If any approved item cannot be loaded:
138 | 
139 |   - Do not finalize. Return a “Docs Missing” plan with missing paths and a fix.
140 | - If any context file fails:
141 | 
142 |   - Continue. Add to `DocFetchReport.gaps.context_missing[]`. Suggest a fix in the plan.
143 | 
144 | ---
145 | 
146 | ## DocFetchReport Addendum
147 | 
148 | When discovery/confirmation is used, add:
149 | 
150 | ```json
151 | {
152 |   "DocFetchReport": {
153 |     "approved_instructions": [
154 |       {"path": "instructions/prd_generator.md", "loaded": true, "order": 1},
155 |       {"path": "instructions/security/guardrails.md", "loaded": true, "order": 2}
156 |     ],
157 |     "context_files": [
158 |       {"path": "docs/changelog.md", "loaded": true}
159 |     ],
160 |     "memory_ops": [
161 |       {"tool": "memory", "op": "create_entities|create_relations|add_observations|read_graph|search_nodes", "time_utc": "<ISO8601>", "scope": "project:${PROJECT_TAG}"}
162 |     ],
163 |     "proposed_mcp_servers": [
164 |       {"name": "<lib> Docs", "url": "https://gitmcp.io/{OWNER}/{REPO}", "source": "techstack-bootstrap", "status": "proposed"}
165 |     ],
166 |     "owner_repo_resolution": [
167 |       {"library": "<lib>", "candidates": ["owner1/repo1", "owner2/repo2"], "selected": "owner/repo", "confidence": 0.92, "method": "registry|package_index|docs_link|search"}
168 |     ],
169 |     "server_inventory": [
170 |       {"name": "fastapi_docs", "url": "https://gitmcp.io/tiangolo/fastapi", "source": "project-local|user|generated", "writable": true}
171 |     ],
172 |     "server_diff": {
173 |       "missing": ["fastapi_docs", "httpx_docs"],
174 |       "extra": ["legacy_docs_server"]
175 |     },
176 |     "server_actions": [
177 |       {"action": "add", "name": "httpx_docs", "target": "project-local", "accepted": true}
178 |     ]
179 |   }
180 | }
181 | ```
182 | 
183 | > Note: Omit any fields related to generating or writing `config/mcp_servers.generated.toml`. Use a separate instruction file such as `instructions/mcp_servers_generated_concise.md` if present.
184 | 
185 | Also log memory batching and status coupling events when applicable:
186 | 
187 | - Each memory flush: append `{tool:"memory", op:"upsert_batch", time_utc, scope, batch_id, count}` to `memory_ops[]`.
188 | - Each Task Master status call: append `{action:"status", name:"task-master", value, status}` to `server_actions[]`.
189 | 
190 | ---
191 | 
192 | ## Task Master Integration — Correct Usage (per README)
193 | 
194 | - **Package vs CLI:** The npm package is `task-master-ai`. The CLI binary is `task-master`.
195 | - **MCP server (Cursor) setup:** Use a Command server with `npx -y task-master-ai` as the command. Name “Task Master”. This exposes Task Master tools inside Cursor.
196 | - **Configuration source of truth:** Use the `.taskmasterconfig` file created/managed by `task-master models --setup` or the `models` MCP tool. Do **not** set model choice, max tokens, temperature, or log level via environment variables.
197 | - **Environment variables:** Only for API keys and specific endpoints (e.g., `ANTHROPIC_API_KEY`, `PERPLEXITY_API_KEY`, `OLLAMA_BASE_URL`). For CLI, store in a project `.env`. For MCP, store under the server’s `env` block.
198 | - **CLI commands used by this system:** `task-master parse-prd`, `task-master list`, `task-master next`, `task-master generate`, `task-master show`, `task-master set-status`, `task-master update`, `task-master expand`, `task-master clear-subtasks`, dependency validators, and complexity analysis commands. Use exactly these spellings.
199 | - **Status vocabulary:** Prefer `pending`, `in-progress`, `done`, and `deferred` for Task Master. Keep any extra internal states (e.g., `verify`, `needs-local-tests`) inside this system and map them to Task Master per §3.
200 | 
201 | **Logging note:** When logging to `DocFetchReport.server_actions[]`, keep `{action:"status", name:"task-master", value:"<status>", status:"ok|error"}`. This aligns with the CLI/MCP usage.
202 | 
203 | **ESM note:** Task Master is ESM. If invoking scripts directly, ensure Node ESM compatibility.
204 | 
205 | ## A) Preflight: Latest Docs Requirement (**MUST**, Blocking)
206 | 
207 | **Goal:** Ensure the assistant retrieves and considers the *latest relevant docs* before planning, acting, or finalizing.
208 | 
209 | **Primary/Fallback Order (consolidated):**
210 | 
211 | 1. **contex7-mcp** (primary)
212 | 2. **gitmcp** (fallback)
213 | 
214 | **What to do:**
215 | 
216 | - For every task that could touch code, configuration, APIs, tooling, or libraries:
217 | 
218 |   - Call **contex7-mcp** to fetch the latest documentation or guides.
219 |   - If the **primary** call **fails**, retry with **gitmcp**.
220 | - Each successful call **MUST** capture:
221 | 
222 |   - Tool name, query/topic, retrieval timestamp (UTC), and source refs/URLs (or repo refs/commits).
223 | - Scope:
224 | 
225 |   - Fetch docs for each **area to be touched** (framework, library, CLI, infra, etc.).
226 |   - Prefer focused topics (e.g., "exception handlers", "lifespan", "retry policy", "schema").
227 | 
228 | **Failure handling:**
229 | 
230 | - If **all** providers fail for a required area, **do not finalize**. Return a minimal plan that includes:
231 | 
232 |   - The attempted providers and errors
233 |   - The specific topics/areas still uncovered
234 |   - A safe, read-only analysis and suggested next checks (or user confirmation).
235 | 
236 | **Proof-of-Work Artifact (required):**
237 | 
238 | - Produce and attach a `DocFetchReport` (JSON) with `status`, `tools_called[]`, `sources[]`, `coverage`, `key_guidance[]`, `gaps`, and `informed_changes[]`.
239 | 
240 | **Override Path (explicit, logged):**
241 | 
242 | Allowed only for outages/ambiguous scope/timeboxed spikes. Must include:
243 | 
244 | ```json
245 | {
246 |   "Override": {
247 |     "reason": "server_down|ambiguous_scope|timeboxed_spike",
248 |     "risk_mitigation": ["read-only analysis", "scoped PoC", "user confirmation required"],
249 |     "expires_after": "1 action or 30m",
250 |     "requested_by": "system|user"
251 |   }
252 | }
253 | ```
254 | 
255 | ---
256 | 
257 | ## A.1) Tech & Language Identification (Pre-Requirement)
258 | 
259 | - Before running Preflight (§A), the assistant must determine both:
260 | 
261 |   1. The **primary language(s)** used in the project (e.g., TypeScript, Python, Go, Rust, Java, Bash).
262 |   2. The **current project’s tech stack** (frameworks, libraries, infra, tools).
263 | 
264 | - Sources to infer language/stack:
265 | 
266 |   - Project tags (`${PROJECT_TAG}`), memory checkpoints, prior completion records.
267 |   - Files present in repo (e.g., manifests like `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`, CI configs).
268 |   - File extensions in repo (`.ts`, `.js`, `.py`, `.go`, `.rs`, `.java`, `.sh`, `.sql`, etc.).
269 |   - User/task context (explicit mentions of frameworks, CLIs, infra).
270 | 
271 | - **Repo mapping requirement:** Resolve the **canonical GitHub OWNER/REPO** for each detected library/tool whenever feasible.
272 | 
273 |   - **Resolution order:**
274 | 
275 |     1. **Registry mapping** (maintained lookup table for common libs).
276 |     2. **Package index metadata** (e.g., npm `repository.url`, PyPI `project_urls` → `Source`/`Homepage`).
277 |     3. **Official docs → GitHub link** discovery.
278 |     4. **Targeted search** (as a last resort) with guardrails below.
279 |   - **Guardrails:** Prefer official orgs; require name similarity and recent activity; avoid forks and mirrors unless explicitly chosen.
280 |   - Record outcomes in `DocFetchReport.owner_repo_resolution[]` with candidates, selected repo, method, and confidence score.
281 | 
282 | - Doc retrieval (§A) **must cover each identified language and stack element** that will be touched by the task.
283 | 
284 | - Record both in the `DocFetchReport`:
285 | 
286 | ```json
287 | "tech_stack": ["<stack1>", "<stack2>"],
288 | "languages": ["<lang1>", "<lang2>"]
289 | ```
290 | 
291 | ---
292 | 
293 | ## B) Decision Gate: No Finalize Without Proof (**MUST**)
294 | 
295 | - The assistant **MUST NOT**: finalize, apply diffs, modify files, or deliver a definitive answer **unless** `DocFetchReport.status == "OK"`.
296 | - The planner/executor must verify `ctx.docs_ready == true` (set when at least one successful docs call exists **per required area**).
297 | - If `status != OK` or `ctx.docs_ready != true`:
298 | 
299 |   - Stop. Return a **Docs Missing** message that lists the exact MCP calls and topics to run.
300 | 
301 | ---
302 | 
303 | ## 0) Debugging
304 | 
305 | - **Use consolidated docs-first flow** before touching any files or finalizing:
306 | 
307 |   - Try **contex7-mcp** → **gitmcp**.
308 |   - Record results in `DocFetchReport`.
309 | 
310 | ### 0.1) Docs Staleness Re-check Policy (**3-turn trigger**)
311 | 
312 | **Trigger:** If **three assistant responses** have occurred since the first unresolved error report **and** errors persist **after** applying suggested changes and attempting to run allowed checks, **force a docs refresh**.
313 | 
314 | **Action:**
315 | 
316 | 1. Re-run the **Dynamic Docs MCP Router** (§7) to discover and rank all `*-docs-mcp` servers relevant to the error topics (derive from stack traces, failing commands, and test names).
317 | 2. Fetch **latest pertinent docs** via the ranked chain, then `contex7-mcp` → `gitmcp`.
318 | 3. Rebuild `DocFetchReport` with `refresh_reason: "3_turns_persistent_errors"`, `since_turns: 3`, and `since_time_utc` from the last successful run.
319 | 4. Set `ctx.docs_ready = false` until the refreshed report returns `status == "OK"`.
320 | 5. Compute and record `doc_delta` vs the previous report (changed sources, new guidance, version bumps). Attach to `DocFetchReport.changed_guidance[]`.
321 | 
322 | **Notes:**
323 | 
324 | - Count a **turn** as one assistant message replying to the same error class. Reset the counter on a green run or a new error class.
325 | - If no new guidance is found, record `no_update: true` and continue debugging; otherwise update the plan per new guidance.
326 | - Log the refresh in memory: `task:${task_id}.observations.staleness_refresh` with UTC timestamp and topics.
327 | 
328 | ---
329 | 
330 | ## 1) Startup memory bootstrap (memory)
331 | 
332 | - On chat/session start: initialize **memory**.
333 | 
334 | - Retrieve (project-scoped):
335 | 
336 |   - **memory** → latest `memory_checkpoints` and recent task completions.
337 |   - **memory** → ensure a graph namespace exists for this project and load prior nodes/edges.
338 | 
339 |     - **Server alias**: `memory` (e.g., Smithery "Memory Server" such as `@modelcontextprotocol/server-memory`).
340 |     - **Bootstrap ops** (idempotent):
341 | 
342 |       - `create_entities` (or `upsert_entities`) for: `project:${PROJECT_TAG}`.
343 |       - `create_relations` to link existing tasks/files if present.
344 |       - `read_graph` / `search_nodes` to hydrate working context.
345 | 
346 | - Read/write rules:
347 | 
348 |   - Prefer **memory** for free-form notes and checkpoints.
349 |   - Prefer **memory** for **structured** facts/relations (entities, edges, observations).
350 |   - If memory is unavailable, record `memory_unavailable: true` in the session preamble.
351 | 
352 | ### 1.0) Memory MCP Server Usage Contract (**NEW**)
353 | 
354 | - **Alias:** `memory`.
355 | - **Required tools:** `create_entities`, `create_relations`, `add_observations`, `delete_entities`, `delete_observations`, `delete_relations`, `read_graph`, `search_nodes`, `open_nodes`.
356 | - **Concept rules:**
357 | 
358 |   - **Entities** carry `name`, `entityType`, `observations[]`. Names are unique. Observations are atomic facts.
359 |   - **Relations** are directed and written in **active voice**: `{from, to, relationType}`.
360 |   - **Observations** are strings attached to entities; add/remove independently.
361 | - **Operational guarantees:**
362 | 
363 |   - Treat `create_*` as **idempotent upserts**. Skip duplicates silently.
364 |   - `delete_*` calls are **tolerant** to missing targets. No errors on non-existent items.
365 |   - `open_nodes` returns only requested entities and their inter-relations; silently skips misses.
366 | - **Usage patterns (batched, quality-first):**
367 | 
368 |   - Maintain an in-memory buffer of observations and relation updates during execution.
369 |   - Flush to `memory` only on any of:
370 | 
371 |     1. Subtask boundary reached (from §1.1),
372 |     2. Status transition intent (`in-progress|verify|done|blocked|needs-local-tests`),
373 |     3. 10 observations accumulated, or
374 |     4. 60s since last flush.
375 |   - On flush, send a single upsert with a `batch_id`, `dedupe_keys[]`, and `context` (task\_id, files\_touched, guidance\_refs).
376 |   - Prefer merging observations into concise summaries when multiple micro-events target the same entity within a flush window.
377 | - **Setup pointers (non-blocking):**
378 | 
379 |   - Storage file via `MEMORY_FILE_PATH` env; default `memory.json`.
380 |   - Configure server in **user** MCP config or workspace `.vscode/mcp.json`. Do not embed install steps here.
381 | - **Prompting note:**
382 | 
383 |   - If a separate chat-personalization prompt is used, it must not override gates (§A, §B) nor status flow (§3). Treat it as guidance for memory creation frequency and categories.
384 | 
385 | ### 1.1) Subtask plan and finish-in-one-go contract (**NEW**)
386 | 
387 | - **Before starting execution**, derive a **subtask plan** with clear **Definition of Done (DoD)** per subtask.
388 | - **Finish-in-one-go policy:** Once execution starts, work the subtask list to completion within the session unless a blocking gate occurs (§A, §B, or external dependency). If blocked, record the block and propose an unblock plan; do not leave partial work without a recorded reason.
389 | - **Recording:** Persist the subtask plan to **memory** under `task:${task_id}` as `observations.plan` with timestamps.
390 | 
391 | ### 1.2) Execution logging to memory (**NEW**)
392 | 
393 | - For each subtask: on **start** and **finish**, append an observation including `subtask_id`, `action`, `files_touched[]`, and short result.
394 | - Keep a running `percent_complete` on the task node. Update after each subtask.
395 | - Mirror links: `task:${task_id}` —\[touches]→ `file:<path>` as work proceeds, not only at the end.
396 | 
397 | #### Observation schema (batched)
398 | 
399 | ```
400 | {
401 |   subtask_id, action, ts_utc, files_touched[],
402 |   summary, details_md, metrics:{time_ms?, tokens?, pass?},
403 |   guidance_refs[], dedupe_key
404 | }
405 | ```
406 | 
407 | - Compute `dedupe_key` as a stable hash of `{task_id, subtask_id, action, summary}`.
408 | - Replace per-event writes with buffered batches per §1.0.
409 | 
410 | ## Memory MCP Usage — Quality-over-Quantity Mode
411 | 
412 | ### Write policy
413 | 
414 | - Maintain an in-memory buffer for observations and relation updates.
415 | - Flush triggers (any):
416 | 
417 |   1. Subtask boundary per §1.1,
418 |   2. Status transition intent,
419 |   3. 10 buffered observations,
420 |   4. 60s since last flush.
421 | - Single-call upsert per flush with `batch_id`, `dedupe_keys[]`, and `context`.
422 | 
423 | ### Observation schema
424 | 
425 | - Item: `{subtask_id, action, ts_utc, files_touched[], summary, details_md, metrics:{time_ms?, tokens?, pass?}, guidance_refs[], dedupe_key}`.
426 | - `dedupe_key` = hash(task\_id, subtask\_id, action, summary). Treat creates as idempotent upserts. Skips on duplicate.
427 | 
428 | ### Merge & summarization
429 | 
430 | - If multiple items target the same entity within a window, coalesce into one summary with bullet details.
431 | - Keep observations atomic but summarized; avoid trivial micro-events.
432 | 
433 | ### Read-after-write consistency
434 | 
435 | - On finalization: force `final:true` flush, then `open_nodes` to verify write result.
436 | - Retry once with 250–500 ms backoff on mismatch; record outcome as observation.
437 | 
438 | ### Error and backoff
439 | 
440 | - Network errors: exponential backoff starting at 250 ms, max 3 attempts per flush.
441 | - On persistent failure: mark `memory_unavailable:true` in session preamble and proceed read-only.
442 | 
443 | ### Post-save Task Master coupling
444 | 
445 | - After any successful flush that changes `percent_complete` or has `status_intent`:
446 | 
447 |   - Update **Task Master** using either the CLI (`task-master set-status`) or the MCP server.
448 | 
449 |     - **Start of execution** → set Task Master status to **`in-progress`**.
450 |     - **Internal `verify` phase** → **do not** set a nonstandard Task Master status. Keep **`in-progress`** and attach a note in memory (and, if supported, task details) that verification is running.
451 |     - **Outcomes**
452 | 
453 |       - Success → set **`done`**.
454 |       - Failure or deferral → set **`deferred`** and include a reason note (e.g., `blocked` or `needs-local-tests`).
455 | 
456 | - Record hook: `{hook:"task-master", result:"ok|error", ts_utc}` in memory.
457 | 
458 | ### Completion
459 | 
460 | - Replace per-event writes with batch buffer per the policy above.
461 | - Update `percent_complete` only at flush time.
462 | 
463 | ### Completion
464 | 
465 | - Write concise `completion_summary_md` + `evidence_refs[]`.
466 | - Ensure graph links and observations are updated before exit.
467 | 
468 | ## 2) On task completion (status → done)
469 | 
470 | - **Before finalizing:**
471 | 
472 |   - Force a final buffer flush with `final:true`.
473 |   - Re-read (`open_nodes`) the affected entities to confirm merge result; if mismatch, retry once with backoff (250–500 ms).
474 |   - Attach a consolidated `completion_summary_md` and `evidence_refs[]` to `task:${task_id}`.
475 | 
476 | - Write a concise completion to memory including:
477 | 
478 |   - `task_id`, `title`, `status`, `next step`
479 |   - Files touched
480 |   - Commit/PR link (if applicable)
481 |   - Test results (if applicable)
482 | 
483 | - **Completion criteria (explicit):**
484 | 
485 |   - All subtasks from §1.1 are marked **done** and their DoD satisfied.
486 |   - Required gates passed (§A, §B).
487 |   - Post-completion checks executed or proposed (§2.1).
488 | 
489 | - **Update the Knowledge Graph (memory)**:
490 | 
491 |   - Ensure base entity `project:${PROJECT_TAG}` exists.
492 |   - Upsert `task:${task_id}` and any `file:<path>` entities touched.
493 |   - Create/refresh relations:
494 | 
495 |     - `project:${PROJECT_TAG}` —\[owns]→ `task:${task_id}`
496 |     - `task:${task_id}` —\[touches]→ `file:<path>`
497 |     - `task:${task_id}` —\[status]→ `<status>`
498 |     - Optional: `task:${task_id}` —\[depends\_on]→ `<entity>`
499 |   - Attach `observations` capturing key outcomes (e.g., perf metrics, regressions, decisions).
500 | 
501 | - Seed/Update the knowledge graph **before** exiting the task so subsequent sessions can leverage it.
502 | 
503 | - Do **NOT** write to `AGENTS.md` beyond these standing instructions.
504 | 
505 | ### 2.1) Post-completion checks and tests (**REVISED — Run-then-verify**)
506 | 
507 | - **Order of operations:**
508 |   a) Append subtask completion logs to **memory** (§1.2).
509 |   b) Set task status to **`verify`** (new intermediate state).
510 |   c) Evaluate the **Safety Gate** per **§8 Environment & Testing Policy**.
511 |   d) If **safe**, run **stateless checks automatically** (see §8 Allowed Automatic Checks).
512 |   e) If **unsafe**, **defer** execution and emit a **Local Test Instructions** block for the user.
513 | 
514 | - **Recording:** Write outcomes to `task:${task_id}.observations.test_results` and also set:
515 | 
516 |   - `tests_deferred: true|false`
517 |   - `tests_deferred_reason: <string|null>`
518 |   - `test_log_path: artifacts/test/<UTC-timestamp>.log` when any checks are executed.
519 | 
520 | - **Status transitions:**
[TRUNCATED]
```

GEMINI.md
```
1 | ## Instruction Loading Model (Extended)
2 | 
3 | - **Baseline:** This file (AGENTS.md) is the canonical baseline.
4 | 
5 | - **Two extension types:**
6 | 
7 |   1. **Behavior extensions**. Plain instruction files.
8 | 
9 |      - Locations: `instructions/**/*.md`, `instructions/**/*.txt`
10 |      - Ignored: paths starting with `_`, or names containing `.archive.`
11 |   2. **Rule-packs**. Files with YAML front matter:
12 | 
13 |      ```markdown
14 |      ---
15 |      description: <one-line purpose>
16 |      globs: <glob or comma-list, e.g., **/* or src/**/*.ts,apps/**>
17 |      alwaysApply: true|false
18 |      ---
19 |      <optional body>
20 |      ```
21 | 
22 |      - Locations: `instructions/**/*.md`, `instructions/**/*.mdc`, `.cursor/rules/**/*.mdc`
23 |      - Detection: file starts with `---` and declares `description`, `globs`, `alwaysApply`
24 | 
25 | - **Scope semantics:**
26 | 
27 |   - `globs` limits where the pack claims relevance. If empty or missing, scope is repo-wide.
28 |   - A pack can be listed even if no current files match, but it is marked “out of scope”.
29 | 
30 | - **Order and precedence:**
31 | 
32 |   - Default load order: lexicographic by path.
33 |   - User can reorder before apply. Later wins on conflict.
34 |   - If `alwaysApply: true`, default selection is **on** and pinned to the **end** of the order unless the user moves it.
35 | 
36 | ---
37 | 
38 | ## Startup confirmation flow
39 | 
40 | 1. **Discover**
41 | 
42 |    - Collect behavior extensions and rule-packs from the locations above.
43 |    - Exclude `_` prefixed paths and `.archive.` files.
44 | 2. **Summarize**
45 | 
46 |    - Title = first `# H1` if present, else filename.
47 |    - For rule-packs show `alwaysApply` and `globs`.
48 | 3. **Confirm**
49 | 
50 |    - Options: **Apply all**, **Apply none**, **Select subset and order**.
51 |    - Default = **Apply none** for behavior extensions. **Apply** for rule-packs with `alwaysApply: true`.
52 | 4. **Record**
53 | 
54 |    - Write final order to `DocFetchReport.approved_instructions[]`.
55 |    - Write approved rule-packs to `DocFetchReport.approved_rule_packs[]` with `{path, alwaysApply, globs}`.
56 | 
57 | ---
58 | 
59 | ## Validation
60 | 
61 | - Behavior extension: must be readable text.
62 | - Rule-pack: must have front matter with `description` (string), `globs` (string), `alwaysApply` (bool).
63 | - Invalid items are skipped and logged in `DocFetchReport.validation_errors[]`.
64 | 
65 | ---
66 | 
67 | ## Execution flow (docs integration)
68 | 
69 | - **Preflight must list:**
70 | 
71 |   - `DocFetchReport.context_files[]` from `@{...}`
72 |   - `DocFetchReport.approved_instructions[]`
73 |   - `DocFetchReport.approved_rule_packs[]`
74 | - Compose in this order:
75 | 
76 |   1. Baseline
77 |   2. Behavior extensions
78 |   3. Rule-packs
79 | - Proceed only when `DocFetchReport.status == "OK"`.
80 | 
81 | ---
82 | 
83 | ## Conflict resolution
84 | 
85 | - **Specificity rule:** If both target the same scope, the later item in the final order wins.
86 | - **Pack vs. extension:** No special case. Order controls outcome.
87 | - **Out-of-scope packs:** Do not affect behavior. They remain listed as informational.
88 | 
89 | ---
90 | 
91 | ## Tagging Syntax (context only)
92 | 
93 | **Context tag — `@{file}` (no behavior change)**
94 | 
95 | - Purpose: include files for retrieval only.
96 | - Syntax: `@{path/to/file.md}`. Globs allowed.
97 | - Report under `DocFetchReport.context_files[]`.
98 | 
99 | ---
100 | 
101 | ## Resolution and loading
102 | 
103 | 1. Baseline = AGENTS.md.
104 | 2. Load **approved behavior extensions** in final order.
105 | 3. Load **approved rule-packs** in final order. Packs with `alwaysApply: true` default to the end.
106 | 4. Apply later-wins on conflicts.
107 | 5. Record `DocFetchReport.status`.
108 | 
109 | ---
110 | 
111 | ## Validation
112 | 
113 | - Behavior extension: must be readable text.
114 | - Rule-pack: must have front matter with `description` (string), `globs` (string), `alwaysApply` (bool).
115 | - Invalid items are skipped and logged in `DocFetchReport.validation_errors[]`.
116 | 
117 | ---
118 | 
119 | ## Execution flow (docs integration)
120 | 
121 | - **Preflight must list:**
122 | 
123 |   - `DocFetchReport.context_files[]` from `@{...}`
124 |   - `DocFetchReport.approved_instructions[]`
125 |   - `DocFetchReport.approved_rule_packs[]`
126 | - Compose in this order:
127 | 
128 |   1. Baseline
129 |   2. Behavior extensions
130 |   3. Rule-packs
131 | - Proceed only when `DocFetchReport.status == "OK"`.
132 | 
133 | ---
134 | 
135 | ## Failure handling
136 | 
137 | - If any approved item cannot be loaded:
138 | 
139 |   - Do not finalize. Return a “Docs Missing” plan with missing paths and a fix.
140 | - If any context file fails:
141 | 
142 |   - Continue. Add to `DocFetchReport.gaps.context_missing[]`. Suggest a fix in the plan.
143 | 
144 | ---
145 | 
146 | ## DocFetchReport Addendum
147 | 
148 | When discovery/confirmation is used, add:
149 | 
150 | ```json
151 | {
152 |   "DocFetchReport": {
153 |     "approved_instructions": [
154 |       {"path": "instructions/prd_generator.md", "loaded": true, "order": 1},
155 |       {"path": "instructions/security/guardrails.md", "loaded": true, "order": 2}
156 |     ],
157 |     "context_files": [
158 |       {"path": "docs/changelog.md", "loaded": true}
159 |     ],
160 |     "memory_ops": [
161 |       {"tool": "memory", "op": "create_entities|create_relations|add_observations|read_graph|search_nodes", "time_utc": "<ISO8601>", "scope": "project:${PROJECT_TAG}"}
162 |     ],
163 |     "proposed_mcp_servers": [
164 |       {"name": "<lib> Docs", "url": "https://gitmcp.io/{OWNER}/{REPO}", "source": "techstack-bootstrap", "status": "proposed"}
165 |     ],
166 |     "owner_repo_resolution": [
167 |       {"library": "<lib>", "candidates": ["owner1/repo1", "owner2/repo2"], "selected": "owner/repo", "confidence": 0.92, "method": "registry|package_index|docs_link|search"}
168 |     ],
169 |     "server_inventory": [
170 |       {"name": "fastapi_docs", "url": "https://gitmcp.io/tiangolo/fastapi", "source": "project-local|user|generated", "writable": true}
171 |     ],
172 |     "server_diff": {
173 |       "missing": ["fastapi_docs", "httpx_docs"],
174 |       "extra": ["legacy_docs_server"]
175 |     },
176 |     "server_actions": [
177 |       {"action": "add", "name": "httpx_docs", "target": "project-local", "accepted": true}
178 |     ]
179 |   }
180 | }
181 | ```
182 | 
183 | > Note: Omit any fields related to generating or writing `config/mcp_servers.generated.toml`. Use a separate instruction file such as `instructions/mcp_servers_generated_concise.md` if present.
184 | 
185 | Also log memory batching and status coupling events when applicable:
186 | 
187 | - Each memory flush: append `{tool:"memory", op:"upsert_batch", time_utc, scope, batch_id, count}` to `memory_ops[]`.
188 | - Each Task Master status call: append `{action:"status", name:"task-master", value, status}` to `server_actions[]`.
189 | 
190 | ---
191 | 
192 | ## Task Master Integration — Correct Usage (per README)
193 | 
194 | - **Package vs CLI:** The npm package is `task-master-ai`. The CLI binary is `task-master`.
195 | - **MCP server (Cursor) setup:** Use a Command server with `npx -y task-master-ai` as the command. Name “Task Master”. This exposes Task Master tools inside Cursor.
196 | - **Configuration source of truth:** Use the `.taskmasterconfig` file created/managed by `task-master models --setup` or the `models` MCP tool. Do **not** set model choice, max tokens, temperature, or log level via environment variables.
197 | - **Environment variables:** Only for API keys and specific endpoints (e.g., `ANTHROPIC_API_KEY`, `PERPLEXITY_API_KEY`, `OLLAMA_BASE_URL`). For CLI, store in a project `.env`. For MCP, store under the server’s `env` block.
198 | - **CLI commands used by this system:** `task-master parse-prd`, `task-master list`, `task-master next`, `task-master generate`, `task-master show`, `task-master set-status`, `task-master update`, `task-master expand`, `task-master clear-subtasks`, dependency validators, and complexity analysis commands. Use exactly these spellings.
199 | - **Status vocabulary:** Prefer `pending`, `in-progress`, `done`, and `deferred` for Task Master. Keep any extra internal states (e.g., `verify`, `needs-local-tests`) inside this system and map them to Task Master per §3.
200 | 
201 | **Logging note:** When logging to `DocFetchReport.server_actions[]`, keep `{action:"status", name:"task-master", value:"<status>", status:"ok|error"}`. This aligns with the CLI/MCP usage.
202 | 
203 | **ESM note:** Task Master is ESM. If invoking scripts directly, ensure Node ESM compatibility.
204 | 
205 | ## A) Preflight: Latest Docs Requirement (**MUST**, Blocking)
206 | 
207 | **Goal:** Ensure the assistant retrieves and considers the *latest relevant docs* before planning, acting, or finalizing.
208 | 
209 | **Primary/Fallback Order (consolidated):**
210 | 
211 | 1. **contex7-mcp** (primary)
212 | 2. **gitmcp** (fallback)
213 | 
214 | **What to do:**
215 | 
216 | - For every task that could touch code, configuration, APIs, tooling, or libraries:
217 | 
218 |   - Call **contex7-mcp** to fetch the latest documentation or guides.
219 |   - If the **primary** call **fails**, retry with **gitmcp**.
220 | - Each successful call **MUST** capture:
221 | 
222 |   - Tool name, query/topic, retrieval timestamp (UTC), and source refs/URLs (or repo refs/commits).
223 | - Scope:
224 | 
225 |   - Fetch docs for each **area to be touched** (framework, library, CLI, infra, etc.).
226 |   - Prefer focused topics (e.g., "exception handlers", "lifespan", "retry policy", "schema").
227 | 
228 | **Failure handling:**
229 | 
230 | - If **all** providers fail for a required area, **do not finalize**. Return a minimal plan that includes:
231 | 
232 |   - The attempted providers and errors
233 |   - The specific topics/areas still uncovered
234 |   - A safe, read-only analysis and suggested next checks (or user confirmation).
235 | 
236 | **Proof-of-Work Artifact (required):**
237 | 
238 | - Produce and attach a `DocFetchReport` (JSON) with `status`, `tools_called[]`, `sources[]`, `coverage`, `key_guidance[]`, `gaps`, and `informed_changes[]`.
239 | 
240 | **Override Path (explicit, logged):**
241 | 
242 | Allowed only for outages/ambiguous scope/timeboxed spikes. Must include:
243 | 
244 | ```json
245 | {
246 |   "Override": {
247 |     "reason": "server_down|ambiguous_scope|timeboxed_spike",
248 |     "risk_mitigation": ["read-only analysis", "scoped PoC", "user confirmation required"],
249 |     "expires_after": "1 action or 30m",
250 |     "requested_by": "system|user"
251 |   }
252 | }
253 | ```
254 | 
255 | ---
256 | 
257 | ## A.1) Tech & Language Identification (Pre-Requirement)
258 | 
259 | - Before running Preflight (§A), the assistant must determine both:
260 | 
261 |   1. The **primary language(s)** used in the project (e.g., TypeScript, Python, Go, Rust, Java, Bash).
262 |   2. The **current project’s tech stack** (frameworks, libraries, infra, tools).
263 | 
264 | - Sources to infer language/stack:
265 | 
266 |   - Project tags (`${PROJECT_TAG}`), memory checkpoints, prior completion records.
267 |   - Files present in repo (e.g., manifests like `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`, CI configs).
268 |   - File extensions in repo (`.ts`, `.js`, `.py`, `.go`, `.rs`, `.java`, `.sh`, `.sql`, etc.).
269 |   - User/task context (explicit mentions of frameworks, CLIs, infra).
270 | 
271 | - **Repo mapping requirement:** Resolve the **canonical GitHub OWNER/REPO** for each detected library/tool whenever feasible.
272 | 
273 |   - **Resolution order:**
274 | 
275 |     1. **Registry mapping** (maintained lookup table for common libs).
276 |     2. **Package index metadata** (e.g., npm `repository.url`, PyPI `project_urls` → `Source`/`Homepage`).
277 |     3. **Official docs → GitHub link** discovery.
278 |     4. **Targeted search** (as a last resort) with guardrails below.
279 |   - **Guardrails:** Prefer official orgs; require name similarity and recent activity; avoid forks and mirrors unless explicitly chosen.
280 |   - Record outcomes in `DocFetchReport.owner_repo_resolution[]` with candidates, selected repo, method, and confidence score.
281 | 
282 | - Doc retrieval (§A) **must cover each identified language and stack element** that will be touched by the task.
283 | 
284 | - Record both in the `DocFetchReport`:
285 | 
286 | ```json
287 | "tech_stack": ["<stack1>", "<stack2>"],
288 | "languages": ["<lang1>", "<lang2>"]
289 | ```
290 | 
291 | ---
292 | 
293 | ## B) Decision Gate: No Finalize Without Proof (**MUST**)
294 | 
295 | - The assistant **MUST NOT**: finalize, apply diffs, modify files, or deliver a definitive answer **unless** `DocFetchReport.status == "OK"`.
296 | - The planner/executor must verify `ctx.docs_ready == true` (set when at least one successful docs call exists **per required area**).
297 | - If `status != OK` or `ctx.docs_ready != true`:
298 | 
299 |   - Stop. Return a **Docs Missing** message that lists the exact MCP calls and topics to run.
300 | 
301 | ---
302 | 
303 | ## 0) Debugging
304 | 
305 | - **Use consolidated docs-first flow** before touching any files or finalizing:
306 | 
307 |   - Try **contex7-mcp** → **gitmcp**.
308 |   - Record results in `DocFetchReport`.
309 | 
310 | ### 0.1) Docs Staleness Re-check Policy (**3-turn trigger**)
311 | 
312 | **Trigger:** If **three assistant responses** have occurred since the first unresolved error report **and** errors persist **after** applying suggested changes and attempting to run allowed checks, **force a docs refresh**.
313 | 
314 | **Action:**
315 | 
316 | 1. Re-run the **Dynamic Docs MCP Router** (§7) to discover and rank all `*-docs-mcp` servers relevant to the error topics (derive from stack traces, failing commands, and test names).
317 | 2. Fetch **latest pertinent docs** via the ranked chain, then `contex7-mcp` → `gitmcp`.
318 | 3. Rebuild `DocFetchReport` with `refresh_reason: "3_turns_persistent_errors"`, `since_turns: 3`, and `since_time_utc` from the last successful run.
319 | 4. Set `ctx.docs_ready = false` until the refreshed report returns `status == "OK"`.
320 | 5. Compute and record `doc_delta` vs the previous report (changed sources, new guidance, version bumps). Attach to `DocFetchReport.changed_guidance[]`.
321 | 
322 | **Notes:**
323 | 
324 | - Count a **turn** as one assistant message replying to the same error class. Reset the counter on a green run or a new error class.
325 | - If no new guidance is found, record `no_update: true` and continue debugging; otherwise update the plan per new guidance.
326 | - Log the refresh in memory: `task:${task_id}.observations.staleness_refresh` with UTC timestamp and topics.
327 | 
328 | ---
329 | 
330 | ## 1) Startup memory bootstrap (memory)
331 | 
332 | - On chat/session start: initialize **memory**.
333 | 
334 | - Retrieve (project-scoped):
335 | 
336 |   - **memory** → latest `memory_checkpoints` and recent task completions.
337 |   - **memory** → ensure a graph namespace exists for this project and load prior nodes/edges.
338 | 
339 |     - **Server alias**: `memory` (e.g., Smithery "Memory Server" such as `@modelcontextprotocol/server-memory`).
340 |     - **Bootstrap ops** (idempotent):
341 | 
342 |       - `create_entities` (or `upsert_entities`) for: `project:${PROJECT_TAG}`.
343 |       - `create_relations` to link existing tasks/files if present.
344 |       - `read_graph` / `search_nodes` to hydrate working context.
345 | 
346 | - Read/write rules:
347 | 
348 |   - Prefer **memory** for free-form notes and checkpoints.
349 |   - Prefer **memory** for **structured** facts/relations (entities, edges, observations).
350 |   - If memory is unavailable, record `memory_unavailable: true` in the session preamble.
351 | 
352 | ### 1.0) Memory MCP Server Usage Contract (**NEW**)
353 | 
354 | - **Alias:** `memory`.
355 | - **Required tools:** `create_entities`, `create_relations`, `add_observations`, `delete_entities`, `delete_observations`, `delete_relations`, `read_graph`, `search_nodes`, `open_nodes`.
356 | - **Concept rules:**
357 | 
358 |   - **Entities** carry `name`, `entityType`, `observations[]`. Names are unique. Observations are atomic facts.
359 |   - **Relations** are directed and written in **active voice**: `{from, to, relationType}`.
360 |   - **Observations** are strings attached to entities; add/remove independently.
361 | - **Operational guarantees:**
362 | 
363 |   - Treat `create_*` as **idempotent upserts**. Skip duplicates silently.
364 |   - `delete_*` calls are **tolerant** to missing targets. No errors on non-existent items.
365 |   - `open_nodes` returns only requested entities and their inter-relations; silently skips misses.
366 | - **Usage patterns (batched, quality-first):**
367 | 
368 |   - Maintain an in-memory buffer of observations and relation updates during execution.
369 |   - Flush to `memory` only on any of:
370 | 
371 |     1. Subtask boundary reached (from §1.1),
372 |     2. Status transition intent (`in-progress|verify|done|blocked|needs-local-tests`),
373 |     3. 10 observations accumulated, or
374 |     4. 60s since last flush.
375 |   - On flush, send a single upsert with a `batch_id`, `dedupe_keys[]`, and `context` (task\_id, files\_touched, guidance\_refs).
376 |   - Prefer merging observations into concise summaries when multiple micro-events target the same entity within a flush window.
377 | - **Setup pointers (non-blocking):**
378 | 
379 |   - Storage file via `MEMORY_FILE_PATH` env; default `memory.json`.
380 |   - Configure server in **user** MCP config or workspace `.vscode/mcp.json`. Do not embed install steps here.
381 | - **Prompting note:**
382 | 
383 |   - If a separate chat-personalization prompt is used, it must not override gates (§A, §B) nor status flow (§3). Treat it as guidance for memory creation frequency and categories.
384 | 
385 | ### 1.1) Subtask plan and finish-in-one-go contract (**NEW**)
386 | 
387 | - **Before starting execution**, derive a **subtask plan** with clear **Definition of Done (DoD)** per subtask.
388 | - **Finish-in-one-go policy:** Once execution starts, work the subtask list to completion within the session unless a blocking gate occurs (§A, §B, or external dependency). If blocked, record the block and propose an unblock plan; do not leave partial work without a recorded reason.
389 | - **Recording:** Persist the subtask plan to **memory** under `task:${task_id}` as `observations.plan` with timestamps.
390 | 
391 | ### 1.2) Execution logging to memory (**NEW**)
392 | 
393 | - For each subtask: on **start** and **finish**, append an observation including `subtask_id`, `action`, `files_touched[]`, and short result.
394 | - Keep a running `percent_complete` on the task node. Update after each subtask.
395 | - Mirror links: `task:${task_id}` —\[touches]→ `file:<path>` as work proceeds, not only at the end.
396 | 
397 | #### Observation schema (batched)
398 | 
399 | ```
400 | {
401 |   subtask_id, action, ts_utc, files_touched[],
402 |   summary, details_md, metrics:{time_ms?, tokens?, pass?},
403 |   guidance_refs[], dedupe_key
404 | }
405 | ```
406 | 
407 | - Compute `dedupe_key` as a stable hash of `{task_id, subtask_id, action, summary}`.
408 | - Replace per-event writes with buffered batches per §1.0.
409 | 
410 | ## Memory MCP Usage — Quality-over-Quantity Mode
411 | 
412 | ### Write policy
413 | 
414 | - Maintain an in-memory buffer for observations and relation updates.
415 | - Flush triggers (any):
416 | 
417 |   1. Subtask boundary per §1.1,
418 |   2. Status transition intent,
419 |   3. 10 buffered observations,
420 |   4. 60s since last flush.
421 | - Single-call upsert per flush with `batch_id`, `dedupe_keys[]`, and `context`.
422 | 
423 | ### Observation schema
424 | 
425 | - Item: `{subtask_id, action, ts_utc, files_touched[], summary, details_md, metrics:{time_ms?, tokens?, pass?}, guidance_refs[], dedupe_key}`.
426 | - `dedupe_key` = hash(task\_id, subtask\_id, action, summary). Treat creates as idempotent upserts. Skips on duplicate.
427 | 
428 | ### Merge & summarization
429 | 
430 | - If multiple items target the same entity within a window, coalesce into one summary with bullet details.
431 | - Keep observations atomic but summarized; avoid trivial micro-events.
432 | 
433 | ### Read-after-write consistency
434 | 
435 | - On finalization: force `final:true` flush, then `open_nodes` to verify write result.
436 | - Retry once with 250–500 ms backoff on mismatch; record outcome as observation.
437 | 
438 | ### Error and backoff
439 | 
440 | - Network errors: exponential backoff starting at 250 ms, max 3 attempts per flush.
441 | - On persistent failure: mark `memory_unavailable:true` in session preamble and proceed read-only.
442 | 
443 | ### Post-save Task Master coupling
444 | 
445 | - After any successful flush that changes `percent_complete` or has `status_intent`:
446 | 
447 |   - Update **Task Master** using either the CLI (`task-master set-status`) or the MCP server.
448 | 
449 |     - **Start of execution** → set Task Master status to **`in-progress`**.
450 |     - **Internal `verify` phase** → **do not** set a nonstandard Task Master status. Keep **`in-progress`** and attach a note in memory (and, if supported, task details) that verification is running.
451 |     - **Outcomes**
452 | 
453 |       - Success → set **`done`**.
454 |       - Failure or deferral → set **`deferred`** and include a reason note (e.g., `blocked` or `needs-local-tests`).
455 | 
456 | - Record hook: `{hook:"task-master", result:"ok|error", ts_utc}` in memory.
457 | 
458 | ### Completion
459 | 
460 | - Replace per-event writes with batch buffer per the policy above.
461 | - Update `percent_complete` only at flush time.
462 | 
463 | ### Completion
464 | 
465 | - Write concise `completion_summary_md` + `evidence_refs[]`.
466 | - Ensure graph links and observations are updated before exit.
467 | 
468 | ## 2) On task completion (status → done)
469 | 
470 | - **Before finalizing:**
471 | 
472 |   - Force a final buffer flush with `final:true`.
473 |   - Re-read (`open_nodes`) the affected entities to confirm merge result; if mismatch, retry once with backoff (250–500 ms).
474 |   - Attach a consolidated `completion_summary_md` and `evidence_refs[]` to `task:${task_id}`.
475 | 
476 | - Write a concise completion to memory including:
477 | 
478 |   - `task_id`, `title`, `status`, `next step`
479 |   - Files touched
480 |   - Commit/PR link (if applicable)
481 |   - Test results (if applicable)
482 | 
483 | - **Completion criteria (explicit):**
484 | 
485 |   - All subtasks from §1.1 are marked **done** and their DoD satisfied.
486 |   - Required gates passed (§A, §B).
487 |   - Post-completion checks executed or proposed (§2.1).
488 | 
489 | - **Update the Knowledge Graph (memory)**:
490 | 
491 |   - Ensure base entity `project:${PROJECT_TAG}` exists.
492 |   - Upsert `task:${task_id}` and any `file:<path>` entities touched.
493 |   - Create/refresh relations:
494 | 
495 |     - `project:${PROJECT_TAG}` —\[owns]→ `task:${task_id}`
496 |     - `task:${task_id}` —\[touches]→ `file:<path>`
497 |     - `task:${task_id}` —\[status]→ `<status>`
498 |     - Optional: `task:${task_id}` —\[depends\_on]→ `<entity>`
499 |   - Attach `observations` capturing key outcomes (e.g., perf metrics, regressions, decisions).
500 | 
501 | - Seed/Update the knowledge graph **before** exiting the task so subsequent sessions can leverage it.
502 | 
503 | - Do **NOT** write to `AGENTS.md` beyond these standing instructions.
504 | 
505 | ### 2.1) Post-completion checks and tests (**REVISED — Run-then-verify**)
506 | 
507 | - **Order of operations:**
508 |   a) Append subtask completion logs to **memory** (§1.2).
509 |   b) Set task status to **`verify`** (new intermediate state).
510 |   c) Evaluate the **Safety Gate** per **§8 Environment & Testing Policy**.
511 |   d) If **safe**, run **stateless checks automatically** (see §8 Allowed Automatic Checks).
512 |   e) If **unsafe**, **defer** execution and emit a **Local Test Instructions** block for the user.
513 | 
514 | - **Recording:** Write outcomes to `task:${task_id}.observations.test_results` and also set:
515 | 
516 |   - `tests_deferred: true|false`
517 |   - `tests_deferred_reason: <string|null>`
518 |   - `test_log_path: artifacts/test/<UTC-timestamp>.log` when any checks are executed.
519 | 
520 | - **Status transitions:**
[TRUNCATED]
```

WORKFLOW.md
```
1 | # WORKFLOW\.md
2 | 
3 | ## 1) Goal
4 | 
5 | Ship a production-grade full-stack web app from zero to deployed with audit trails, tests, and rollback. Use Codex slash commands as the execution surface.&#x20;
6 | 
7 | ## 2) Scope
8 | 
9 | ### In
10 | 
11 | Greenfield repo. Web UI, API, DB, auth, CI/CD, observability, security baseline, docs, release. Full run uses prompts end-to-end.&#x20;
12 | 
13 | ### Out / Won’t do
14 | 
15 | Vendor lock-in choices, bespoke infra, ML features, mobile clients, data science. No auto-running prompts; all manual per AGENTS baseline.&#x20;
16 | 
17 | ### Ideas for later
18 | 
19 | Multi-region, blue/green, SSO, feature flags, load testing, A/B infra.
20 | 
21 | ## 3) Roles & Owners
22 | 
23 | Planner, Full-stack dev, API dev, Frontend dev, QA, DevOps, Security, Docs. One person may hold multiple roles. Owners per phase below.
24 | 
25 | ## 4) Milestones
26 | 
27 | M1 Plan approved.
28 | M2 Scaffold + CI green.
29 | M3 E2E happy path green.
30 | M4 Staging deployed.
31 | M5 Production release with rollback tested.
32 | 
33 | ## 5) Phases
34 | 
35 | <!-- BEGIN GENERATED PHASES -->
36 | ### P0 Preflight Docs (Blocking)
37 | 
38 | - **Purpose**: Enforce docs-first policy and record DocFetchReport.&#x20;
39 | - **Inputs**: Empty repo, tool access.
40 | - **Steps**: Run Preflight Latest Docs. Record approved instructions and packs. Stop if status≠OK.&#x20;
41 | - **Gate Criteria**: DocFetchReport.status==OK.
42 | - **Outputs**: DocFetchReport JSON.
43 | - **Risks**: Missing docs.
44 | - **Owners**: Planner.
45 | 
46 | <!-- commands:start -->
47 | - _No catalog commands mapped to this phase._
48 | <!-- commands:end -->
49 | 
50 | ### P1 Plan & Scope
51 | 
52 | - **Purpose**: Lock scope and acceptance.
53 | - **Steps**: `/planning-process "<app one-line>"` → draft plan. `/scope-control` → In/Out, Won’t do. `/stack-evaluation` → pick stack.&#x20;
54 | - **Gate**: Scope Gate passed.
55 | - **Outputs**: PLAN.md, scope table.
56 | - **Owners**: Planner.
57 | 
58 | <!-- commands:start -->
59 | - `/planning-process` — Draft, refine, and execute a feature plan with strict scope control and progress tracking.
60 | - `/prototype-feature` — Spin up a standalone prototype in a clean repo before merging into main.
61 | - `/scope-control` — Enforce explicit scope boundaries and maintain "won't do" and "ideas for later" lists.
62 | - `/stack-evaluation` — Evaluate language/framework choices relative to AI familiarity and repo goals.
63 | <!-- commands:end -->
64 | 
65 | ### P2 App Scaffold & Contracts
66 | 
67 | - **Purpose**: Create minimal working app.
68 | - **Steps**:
69 | 
70 |   - `/scaffold-fullstack <stack>` → create repo, packages, app, api, infra stubs. **(new)**
71 |   - `/api-contract` or `/openapi-generate` → draft API spec. **(new)**
72 |   - `/modular-architecture` → boundaries. `/reference-implementation` if copying style.&#x20;
73 | - **Gate**: Test Gate lite = build runs, lint clean.
74 | - **Outputs**: repo tree, OpenAPI/SDL.
75 | - **Owners**: Full-stack dev.
76 | 
77 | <!-- commands:start -->
78 | - `/api-contract "<feature or domain>"` — Author an initial OpenAPI 3.1 or GraphQL SDL contract from requirements.
79 | - `/api-docs-local` — Fetch API docs and store locally for offline, deterministic reference.
80 | - `/openapi-generate <server|client> <lang> <spec-path>` — Generate server stubs or typed clients from an OpenAPI spec.
81 | - `/prototype-feature` — Spin up a standalone prototype in a clean repo before merging into main.
82 | - `/reference-implementation` — Mimic the style and API of a known working example.
83 | - `/scaffold-fullstack <stack>` — Create a minimal, production-ready monorepo template with app, API, tests, CI seeds, and infra stubs.
84 | <!-- commands:end -->
85 | 
86 | ### P3 Data & Auth
87 | 
88 | - **Purpose**: Persistence and identity.
89 | - **Steps**: `/db-bootstrap <db>` → schema, migrations, seeds. **(new)**
90 |   `/auth-scaffold <oauth|email>` → flows + threat model. **(new)**
91 |   `/migration-plan` → up/down scripts. **(new)**
92 | - **Gate**: Migration dry-run ok. Threat checklist done.
93 | - **Outputs**: migrations, seed script, auth routes.
94 | - **Owners**: API dev, Security.
95 | 
96 | <!-- commands:start -->
97 | - `/auth-scaffold <oauth|email|oidc>` — Scaffold auth flows, routes, storage, and a basic threat model.
98 | - `/db-bootstrap <postgres|mysql|sqlite|mongodb>` — Pick a database, initialize migrations, local compose, and seed scripts.
99 | - `/migration-plan "<change summary>"` — Produce safe up/down migration steps with checks and rollback notes.
100 | <!-- commands:end -->
101 | 
102 | ### P4 Frontend UX
103 | 
104 | - **Purpose**: Routes and components.
105 | - **Steps**: `/modular-architecture` (UI), `/ui-screenshots` for reviews, `/design-assets` for favicon/brand, `/logging-strategy` client events.&#x20;
106 | - **Gate**: Accessibility checks queued.
107 | - **Outputs**: Screens, states, assets.
108 | - **Owners**: Frontend.
109 | 
110 | <!-- commands:start -->
111 | - `/design-assets` — Generate favicons and small design snippets from product brand.
112 | - `/ui-screenshots` — Analyze screenshots for UI bugs or inspiration and propose actionable UI changes.
113 | <!-- commands:end -->
114 | 
115 | ### P5 Quality Gates & Tests
116 | 
117 | - **Purpose**: E2E-first coverage.
118 | - **Steps**: `/e2e-runner-setup <playwright|cypress>` **(new)** → runner + fixtures.
119 |   `/integration-test` → happy path E2E. `/coverage-guide` → target areas. `/regression-guard` → unrelated drift.&#x20;
120 | - **Gate**: Test Gate = E2E happy path green.
121 | - **Outputs**: E2E suite, coverage plan.
122 | - **Owners**: QA.
123 | 
124 | <!-- commands:start -->
125 | - `/coverage-guide` — Propose high-ROI tests to raise coverage using uncovered areas.
126 | - `/e2e-runner-setup <playwright|cypress>` — Configure an end-to-end test runner with fixtures and a data sandbox.
127 | - `/generate <source-file>` — Generate unit tests for a given source file.
128 | - `/integration-test` — Generate E2E tests that simulate real user flows.
129 | - `/regression-guard` — Detect unrelated changes and add tests to prevent regressions.
130 | <!-- commands:end -->
131 | 
132 | ### P6 CI/CD & Env
133 | 
134 | - **Purpose**: Reproducible pipeline and environments.
135 | - **Steps**: `/version-control-guide` → commit rules. `/devops-automation` → CI, DNS, SSL, deploy. `/env-setup` + `/secrets-manager-setup` **(new)**. `/iac-bootstrap` **(new)**.&#x20;
136 | - **Gate**: Review Gate = CI green, approvals, no unrelated churn.
137 | - **Outputs**: CI config, IaC, secret store wiring.
138 | - **Owners**: DevOps.
139 | 
140 | <!-- commands:start -->
141 | - `/devops-automation` — Configure servers, DNS, SSL, CI/CD at a pragmatic level.
142 | - `/env-setup` — Create .env.example, runtime schema validation, and per-env overrides.
143 | - `/iac-bootstrap <aws|gcp|azure|fly|render>` — Create minimal Infrastructure-as-Code for the chosen platform plus CI hooks.
144 | - `/secrets-manager-setup <provider>` — Provision a secrets store and map application variables to it.
145 | - `/version-control-guide` — Enforce clean incremental commits and clean-room re-implementation when finalizing.
146 | - `commit` — Generate a conventional, review-ready commit message from the currently staged changes.
147 | <!-- commands:end -->
148 | 
149 | ### P7 Release & Ops
150 | 
151 | - **Purpose**: Ship safely.
152 | - **Steps**: `/pr-desc`, `/owners`, `/review`, `/review-branch`, `/release-notes`, `/version-proposal`. `/monitoring-setup` + `/slo-setup` **(new)**. `/logging-strategy` server. `/audit` security/hygiene.&#x20;
153 | - **Gate**: Release Gate = canary ok, rollback tested.
154 | - **Outputs**: Release notes, dashboards, runbooks.
155 | - **Owners**: Dev, DevOps, SRE.
156 | 
157 | <!-- commands:start -->
158 | - `/audit` — Audit repository hygiene and suggest improvements.
159 | - `/explain-code` — Provide line-by-line explanations for a given file or diff.
160 | - `/monitoring-setup` — Bootstrap logs, metrics, and traces with dashboards per domain.
161 | - `/owners <path>` — Suggest likely owners or reviewers for the specified path.
162 | - `/pr-desc <context>` — Draft a PR description from the branch diff.
163 | - `/release-notes <git-range>` — Generate human-readable release notes from recent commits.
164 | - `/review <pattern>` — Review code matching a pattern and deliver actionable feedback.
165 | - `/review-branch` — Provide a high-level review of the current branch versus origin/main.
166 | - `/slo-setup` — Define Service Level Objectives, burn alerts, and runbooks.
167 | - `/version-proposal` — Propose the next semantic version based on commit history.
168 | <!-- commands:end -->
169 | 
170 | ### P8 Post-release Hardening
171 | 
172 | - **Purpose**: Stability and cleanup.
173 | - **Steps**: `/error-analysis`, `/fix`, `/refactor-suggestions`, `/file-modularity`, `/dead-code-scan`, `/cleanup-branches`. `/feature-flags` **(new)**.&#x20;
174 | - **Gate**: All Sev-1 fixed.
175 | - **Outputs**: Clean diff, flags in place.
176 | - **Owners**: Dev.
177 | 
178 | <!-- commands:start -->
179 | - `/cleanup-branches` — Recommend which local branches are safe to delete and which to keep.
180 | - `/dead-code-scan` — Identify likely dead or unused files and exports using static signals.
181 | - `/error-analysis` — Analyze error logs and enumerate likely root causes with fixes.
182 | - `/feature-flags <provider>` — Integrate a flag provider, wire the SDK, and enforce guardrails.
183 | - `/file-modularity` — Enforce smaller files and propose safe splits for giant files.
184 | - `/fix "<bug summary>"` — Propose a minimal, correct fix with diff-style patches.
185 | - `/refactor-suggestions` — Propose repo-wide refactoring opportunities after tests exist.
186 | <!-- commands:end -->
187 | 
188 | ### P9 Model Tactics (cross-cutting)
189 | 
190 | - **Purpose**: Optimize prompting/model choice.
191 | - **Steps**: `/model-strengths`, `/model-evaluation`, `/compare-outputs`, `/switch-model`.&#x20;
192 | - **Gate**: Model delta improves QoS.
193 | - **Owners**: Planner.
194 | 
195 | <!-- commands:start -->
196 | - _No catalog commands mapped to this phase._
197 | <!-- commands:end -->
198 | 
199 | ### 11) Evidence Log
200 | 
201 | - **Purpose**: _Document the goal for 11) Evidence Log._
202 | - **Steps**: _Outline the prompts and activities involved._
203 | - **Gate Criteria**: _Capture the exit checks before advancing._
204 | - **Outputs**: _List the deliverables for this phase._
205 | - **Owners**: _Assign accountable roles._
206 | 
207 | <!-- commands:start -->
208 | - `/content-generation` — Draft docs, blog posts, or marketing copy aligned with the codebase.
209 | <!-- commands:end -->
210 | 
211 | ### P0 Preflight Docs
212 | 
213 | - **Purpose**: _Document the goal for P0 Preflight Docs._
214 | - **Steps**: _Outline the prompts and activities involved._
215 | - **Gate Criteria**: _Capture the exit checks before advancing._
216 | - **Outputs**: _List the deliverables for this phase._
217 | - **Owners**: _Assign accountable roles._
218 | 
219 | <!-- commands:start -->
220 | - `/instruction-file` — Generate or update `cursor.rules`, `windsurf.rules`, or `claude.md` with project-specific instructions.
221 | <!-- commands:end -->
222 | 
223 | ### P9 Model Tactics
224 | 
225 | - **Purpose**: _Document the goal for P9 Model Tactics._
226 | - **Steps**: _Outline the prompts and activities involved._
227 | - **Gate Criteria**: _Capture the exit checks before advancing._
228 | - **Outputs**: _List the deliverables for this phase._
229 | - **Owners**: _Assign accountable roles._
230 | 
231 | <!-- commands:start -->
232 | - `/compare-outputs` — Run multiple models or tools on the same prompt and summarize best output.
233 | - `/model-evaluation` — Try a new model and compare outputs against a baseline.
234 | - `/model-strengths` — Choose model per task type.
235 | - `/switch-model` — Decide when to try a different AI backend and how to compare.
236 | <!-- commands:end -->
237 | 
238 | ### Reset Playbook
239 | 
240 | - **Purpose**: _Document the goal for Reset Playbook._
241 | - **Steps**: _Outline the prompts and activities involved._
242 | - **Gate Criteria**: _Capture the exit checks before advancing._
243 | - **Outputs**: _List the deliverables for this phase._
244 | - **Owners**: _Assign accountable roles._
245 | 
246 | <!-- commands:start -->
247 | - `/reset-strategy` — Decide when to hard reset and start clean to avoid layered bad diffs.
248 | <!-- commands:end -->
249 | 
250 | ### Support
251 | 
252 | - **Purpose**: _Document the goal for Support._
253 | - **Steps**: _Outline the prompts and activities involved._
254 | - **Gate Criteria**: _Capture the exit checks before advancing._
255 | - **Outputs**: _List the deliverables for this phase._
256 | - **Owners**: _Assign accountable roles._
257 | 
258 | <!-- commands:start -->
259 | - `/voice-input` — Support interaction from voice capture and convert to structured prompts.
260 | <!-- commands:end -->
261 | <!-- END GENERATED PHASES -->
262 | ## 6) Dev Loop Rules
263 | 
264 | Commit small. One concern per PR. Use clean-room finalize if diff grows. Reset when E2E red for >60m or design drift detected. Enforce branch policy via `/version-control-guide`.&#x20;
265 | 
266 | ## 7) Test Strategy
267 | 
268 | E2E first. Happy path before edge cases. Regression guards on changed areas and critical paths. Coverage targets: lines 80%, branches 60%, critical modules 90%. Use `/integration-test`, `/coverage-guide`, `/regression-guard`.&#x20;
269 | 
270 | ## 8) CI/CD Plan
271 | 
272 | Jobs: lint, typecheck, unit, build, e2e, package, deploy. Artifacts: build outputs, test logs, coverage, SBOM. Envs: preview, staging, prod. Rollback: pinned version + IaC plan. Use `/devops-automation` and `/iac-bootstrap`.&#x20;
273 | 
274 | ## 9) Observability & Logging Plan
275 | 
276 | Structured logs, metrics, traces. Dashboards by domain. Alerts on SLO burn. Client and server logging strategies via `/logging-strategy`.&#x20;
277 | 
278 | ## 10) Risk Register & Mitigations
279 | 
280 | Scope creep → Scope Gate. Flaky E2E → isolate and retry matrix. Secrets leakage → secrets manager, scans. Infra drift → IaC. Auth gaps → threat model.&#x20;
281 | 
282 | ## 11) Evidence Log
283 | 
284 | - Command catalog and flows: README table and Mermaid.&#x20;
285 | - Baseline precedence, Preflight, DocFetchReport, gates: AGENTS baseline.&#x20;
286 | 
287 | ## 12) Release Notes Checklist
288 | 
289 | Scope summary, changes by area, migration steps, breaking changes, version bump, commit range, contributors, links to dashboards. Use `/release-notes` and `/version-proposal`.&#x20;
290 | 
291 | ---
292 | 
293 | ### Missing prompts needed
294 | 
295 | - `/scaffold-fullstack` — generate repo, workspace, app, api, tests, CI seeds.
296 | - `/api-contract` — author initial OpenAPI/GraphQL contract from requirements.
297 | - `/openapi-generate` — codegen server and client from OpenAPI.
298 | - `/db-bootstrap` — pick DB, init migrations, local compose, seed scripts.
299 | - `/migration-plan` — write up/down plans with safety checks.
300 | - `/auth-scaffold` — OAuth/OIDC/email templates, routes, threat model.
301 | - `/e2e-runner-setup` — Playwright/Cypress config, fixtures, data sandbox.
302 | - `/env-setup` — `.env.example`, schema validation, per-env overrides.
303 | - `/secrets-manager-setup` — provision secret store, map app vars.
304 | - `/iac-bootstrap` — minimal IaC for chosen cloud, state, pipelines.
305 | - `/monitoring-setup` — logs/metrics/traces bootstrap.
306 | - `/slo-setup` — SLOs, alerts, dashboards.
307 | - `/feature-flags` — flag provider, SDK wiring, guardrails.
308 |   These integrate with existing commands and respect AGENTS gating.
309 | 
310 | ---
311 | 
312 | ## workflow\.mmd
313 | 
314 | ```mermaid
315 | flowchart TD
316 |   A["Preflight Docs (§A) AGENTS"] -->|DocFetchReport OK| B[/planning-process/]
317 |   B --> C[/scope-control/]
318 |   C --> D[/stack-evaluation/]
319 |   D --> E[/scaffold-fullstack/]
320 |   E --> F[/api-contract/]
321 |   F --> G[/openapi-generate/]
322 |   G --> H[/modular-architecture/]
323 |   H --> I[/db-bootstrap/]
324 |   I --> J[/migration-plan/]
325 |   J --> K[/auth-scaffold/]
326 |   K --> L[/e2e-runner-setup/]
327 |   L --> M[/integration-test/]
328 |   M --> N[/coverage-guide/]
329 |   N --> O[/regression-guard/]
330 |   O --> P[/version-control-guide/]
331 |   P --> Q[/devops-automation/]
332 |   Q --> R[/env-setup/]
333 |   R --> S[/secrets-manager-setup/]
334 |   S --> T[/iac-bootstrap/]
335 |   T --> U[/owners/]
336 |   U --> V[/review/]
337 |   V --> W[/review-branch/]
338 |   W --> X[/pr-desc/]
339 |   X --> Y{Gates}
340 |   Y -->|Scope Gate pass| Z1[proceed]
341 |   Y -->|Test Gate pass| Z2[proceed]
342 |   Y -->|Review Gate pass| Z3[proceed]
343 |   Z3 --> AA[/release-notes/]
344 |   AA --> AB[/version-proposal/]
345 |   AB --> AC{Release Gate}
346 |   AC -->|pass| AD[Deploy Staging]
347 |   AD --> AE[Canary + Health]
348 |   AE -->|ok| AF[Deploy Prod]
349 |   AE -->|fail| AR[Rollback]
350 |   AF --> AG[/monitoring-setup/]
351 |   AG --> AH[/slo-setup/]
352 |   AH --> AI[/logging-strategy/]
353 |   AI --> AJ[/error-analysis/]
354 |   AJ --> AK[/fix/]
355 |   AK --> AL[/refactor-suggestions/]
356 |   AL --> AM[/file-modularity/]
357 |   AM --> AN[/dead-code-scan/]
358 |   AN --> AO[/cleanup-branches/]
359 |   AF --> AP[/feature-flags/]
360 |   AF --> AQ[/model-strengths/]
361 |   AQ --> AR2[/model-evaluation/]
362 |   AR2 --> AS[/compare-outputs/]
363 |   AS --> AT[/switch-model/]
364 | ```
365 | 
366 | ---
367 | 
368 | ## Nodes & Edges list
369 | 
370 | **Nodes**: Preflight, planning-process, scope-control, stack-evaluation, scaffold-fullstack, api-contract, openapi-generate, modular-architecture, db-bootstrap, migration-plan, auth-scaffold, e2e-runner-setup, integration-test, coverage-guide, regression-guard, version-control-guide, devops-automation, env-setup, secrets-manager-setup, iac-bootstrap, owners, review, review-branch, pr-desc, Gates, release-notes, version-proposal, Deploy Staging, Canary + Health, Deploy Prod, Rollback, monitoring-setup, slo-setup, logging-strategy, error-analysis, fix, refactor-suggestions, file-modularity, dead-code-scan, cleanup-branches, feature-flags, model-strengths, model-evaluation, compare-outputs, switch-model.
371 | **Edges**: Preflight→planning-process→scope-control→stack-evaluation→scaffold-fullstack→api-contract→openapi-generate→modular-architecture→db-bootstrap→migration-plan→auth-scaffold→e2e-runner-setup→integration-test→coverage-guide→regression-guard→version-control-guide→devops-automation→env-setup→secrets-manager-setup→iac-bootstrap→owners→review→review-branch→pr-desc→Gates→release-notes→version-proposal→Deploy Staging→Canary + Health→Deploy Prod→monitoring-setup→slo-setup→logging-strategy→error-analysis→fix→refactor-suggestions→file-modularity→dead-code-scan→cleanup-branches and Deploy Prod→feature-flags and model-strengths→model-evaluation→compare-outputs→switch-model; Canary + Health→Rollback on fail.
372 | 
373 | ---
374 | 
375 | ## Gate checklists
376 | 
377 | ### Scope Gate
378 | 
379 | - Problem, users, Done criteria defined.
380 | - In/Out lists and Won’t do recorded.
381 | - Stack chosen and risks listed.
382 |   Evidence: `/planning-process`, `/scope-control`, `/stack-evaluation`.&#x20;
383 | 
384 | ### Test Gate
385 | 
386 | - E2E happy path green locally and in CI.
387 | - No unrelated file churn.
388 | - Regression guards added for changed modules.
389 |   Evidence: `/integration-test`, `/regression-guard`.&#x20;
390 | 
391 | ### Review Gate
392 | 
393 | - Clean diff per `/version-control-guide`.
394 | - PR reviewed via `/review` and `/review-branch`.
395 | - Owners assigned and approvals met.&#x20;
396 | 
397 | ### Release Gate
398 | 
399 | - Staging deploy passes checks.
400 | - Canary health metrics stable.
401 | - Rollback rehearsed and documented.
402 |   Evidence: `/devops-automation`, IaC, monitoring setup.&#x20;
403 | 
404 | ---
405 | 
406 | ## Reset Playbook
407 | 
408 | **When**: E2E red >60m, diff noisy, plan drift, large rebase pain, conflicting designs.
409 | **Command path**: `/reset-strategy` → propose clean slice. Create new branch from main, cherry-pick minimal commits, re-run Gate sequence.&#x20;
410 | **Data-loss warning**: Uncommitted local changes will be dropped if hard reset. Stash before reset.
411 | 
412 | ---
413 | 
414 | ## Model Eval Block
415 | 
416 | **When**: Contentious generation, flaky refactors, new model availability.
417 | **Steps**: `/model-strengths` → route candidates. `/model-evaluation` → baseline vs new. `/compare-outputs` → pick best. `/switch-model` → roll change with guardrails. Success = higher test pass rate or smaller diff with same tests.&#x20;
418 | 
419 | ## Support
420 | 
421 | **Purpose**: Cross-cutting helpers that smooth transitions between gated stages.
422 | **Steps**: `/voice-input` → turn transcripts into structured prompts. `/content-generation` → broadcast updates aligned with the Evidence Log.
423 | **Gate**: Clarify requests before triggering lifecycle prompts and keep documentation current with delivered work.
424 | 
425 | ---
426 | 
427 | **Notes**
428 | 
429 | - Baseline precedence and Preflight come from AGENTS baseline. Prompts are manual. No auto-invoke.&#x20;
430 | - Command catalog and many building blocks exist already; this plan wires them into a complete “from scratch” path and lists required new prompts.&#x20;
```

action-diagram.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Explain workflow triggers and dependencies as a diagram‑ready outline.
2 | 
3 | 1. Gather context by inspecting `.github/workflows`.
4 | 2. Explain workflow triggers and dependencies as a diagram‑ready outline.
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Explain workflow triggers and dependencies as a diagram‑ready outline.
10 | - Organize details under clear subheadings so contributors can scan quickly.
11 | - List nodes and edges to make diagram creation straightforward.
12 | - Highlight workflow triggers, failing jobs, and proposed fixes.
13 | 
14 | Example Input:
15 | (none – command runs without arguments)
16 | 
17 | Expected Output:
18 | 
19 | ## Nodes
20 | 
21 | - build
22 | - deploy
23 | 
24 | ## Edges
25 | 
26 | - push -> build
27 | - build -> deploy
```

adr-new.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Draft an Architecture Decision Record with pros/cons.
2 | 
3 | 1. Gather context by inspecting `README.md` for the project context.
4 | 2. Draft a concise ADR including Context, Decision, Status, Consequences. Title: <args>.
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Draft an Architecture Decision Record with pros/cons.
10 | - Highlight workflow triggers, failing jobs, and proposed fixes.
11 | - Document the evidence you used so maintainers can trust the conclusion.
12 | 
13 | Example Input:
14 | src/example.ts
15 | 
16 | Expected Output:
17 | 
18 | - Actionable summary aligned with the output section.
```

api-contract.md
```
1 | ---
2 | phase: "P2 App Scaffold & Contracts"
3 | gate: "Test Gate lite"
4 | status: "contract checked into repo with sample generation running cleanly."
5 | previous:
6 |   - "/scaffold-fullstack"
7 | next:
8 |   - "/openapi-generate"
9 |   - "/modular-architecture"
10 | ---
11 | 
12 | # API Contract
13 | 
14 | Trigger: /api-contract "<feature or domain>"
15 | 
16 | Purpose: Author an initial OpenAPI 3.1 or GraphQL SDL contract from requirements.
17 | 
18 | **Steps:**
19 | 
20 | 1. Parse inputs and existing docs. If REST, prefer OpenAPI 3.1 YAML; if GraphQL, produce SDL.
21 | 2. Define resources, operations, request/response schemas, error model, auth, and rate limit headers.
22 | 3. Add examples for each endpoint or type. Include pagination and filtering conventions.
23 | 4. Save to `apis/<domain>/openapi.yaml` or `apis/<domain>/schema.graphql`.
24 | 5. Emit changelog entry `docs/api/CHANGELOG.md` with rationale and breaking-change flags.
25 | 
26 | **Output format:**
27 | 
28 | - `Contract Path`, `Design Notes`, and a fenced code block with the spec body.
29 | 
30 | **Examples:**
31 | 
32 | - `/api-contract "accounts & auth"` → `apis/auth/openapi.yaml` with OAuth 2.1 flows.
33 | 
34 | **Notes:**
35 | 
36 | - Follow JSON:API style for REST unless caller specifies otherwise. Include `429` and `5xx` models.
37 | 
```

api-docs-local.md
```
1 | ---
2 | phase: "P2 App Scaffold & Contracts"
3 | gate: "Test Gate lite"
4 | status: "contracts cached locally for repeatable generation."
5 | previous:
6 |   - "/scaffold-fullstack"
7 | next:
8 |   - "/api-contract"
9 |   - "/openapi-generate"
10 | ---
11 | 
12 | # API Docs Local
13 | 
14 | Trigger: /api-docs-local
15 | 
16 | Purpose: Fetch API docs and store locally for offline, deterministic reference.
17 | 
18 | ## Steps
19 | 
20 | 1. Create `docs/apis/` directory.
21 | 2. For each provided URL or package, write retrieval commands (curl or `npm view` docs links). Do not fetch automatically without confirmation.
22 | 3. Add `DOCS.md` index linking local copies.
23 | 
24 | ## Output format
25 | 
26 | - Command list and file paths to place docs under `docs/apis/`.
27 | 
```

api-usage.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Show how an internal API is used across the codebase.
2 | 
3 | 1. Gather context by running `rg -n {{args}} . || grep -RIn {{args}} .`.
4 | 2. Summarize common usage patterns and potential misuses for the symbol.
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Show how an internal API is used across the codebase.
10 | - Organize details under clear subheadings so contributors can scan quickly.
11 | - Document the evidence you used so maintainers can trust the conclusion.
12 | 
13 | Example Input:
14 | HttpClient
15 | 
16 | Expected Output:
17 | 
18 | - Definition: src/network/httpClient.ts line 42
19 | - Key usages: services/userService.ts, hooks/useRequest.ts
```

audit.md
```
1 | ---
2 | phase: "P7 Release & Ops"
3 | gate: "Release Gate"
4 | status: "readiness criteria before shipping."
5 | previous:
6 |   - "/logging-strategy"
7 | next:
8 |   - "/error-analysis"
9 |   - "/fix"
10 | ---
11 | 
12 | # Audit
13 | 
14 | Trigger: /audit
15 | 
16 | Purpose: Audit repository hygiene and suggest improvements.
17 | 
18 | ## Steps
19 | 
20 | 1. Gather context by running `ls -la` for the top-level listing. Inspect `.editorconfig`, `.gitignore`, `.geminiignore`, `.eslintrc.cjs`, `.eslintrc.js`, `tsconfig.json`, and `pyproject.toml` if present to understand shared conventions.
21 | 2. Assess repository hygiene across documentation, testing, CI, linting, and security. Highlight gaps and existing automation.
22 | 3. Synthesize the findings into a prioritized checklist with recommended next steps.
23 | 
24 | ## Output format
25 | 
26 | - Begin with a concise summary that restates the goal: Audit repository hygiene and suggest improvements.
27 | - Offer prioritized, actionable recommendations with rationale.
28 | - Call out test coverage gaps and validation steps.
29 | - Highlight workflow triggers, failing jobs, and proposed fixes.
30 | 
31 | ## Example input
32 | 
33 | (none – command runs without arguments)
34 | 
35 | ## Expected output
36 | 
37 | - Structured report following the specified sections.
38 | 
```

auth-scaffold.md
```
1 | ---
2 | phase: "P3 Data & Auth"
3 | gate: "Migration dry-run"
4 | status: "auth flows threat-modeled and test accounts wired."
5 | previous:
6 |   - "/migration-plan"
7 | next:
8 |   - "/modular-architecture"
9 |   - "/ui-screenshots"
10 |   - "/e2e-runner-setup"
11 | ---
12 | 
13 | # Auth Scaffold
14 | 
15 | Trigger: /auth-scaffold <oauth|email|oidc>
16 | 
17 | Purpose: Scaffold auth flows, routes, storage, and a basic threat model.
18 | 
19 | **Steps:**
20 | 
21 | 1. Select provider (OAuth/OIDC/email) and persistence for sessions.
22 | 2. Generate routes: login, callback, logout, session refresh.
23 | 3. Add CSRF, state, PKCE where applicable. Include secure cookie flags.
24 | 4. Document threat model: replay, fixation, token leakage, SSRF on callbacks.
25 | 5. Wire to frontend with protected routes and user context.
26 | 
27 | **Output format:** route list, config keys, and mitigations table.
28 | 
29 | **Examples:** `/auth-scaffold oauth` → NextAuth/Passport/Custom adapter plan.
30 | 
31 | **Notes:** Never print real secrets. Use placeholders in `.env.example`.
32 | 
```

blame-summary.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Summarize authorship hotspots for a file using git blame.
2 | 
3 | 1. Gather context by running `git blame -w --line-porcelain {{args}} | sed -n 's/^author //p' | sort | uniq -c | sort -nr | sed -n '1,25p'` for the blame authors (top contributors first).
4 | 2. Given the blame summary below, identify ownership hotspots and potential reviewers.
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Summarize authorship hotspots for a file using git blame.
10 | - Organize details under clear subheadings so contributors can scan quickly.
11 | - Reference evidence from CODEOWNERS or git history for each owner suggestion.
12 | 
13 | Example Input:
14 | src/components/Button.tsx
15 | 
16 | Expected Output:
17 | 
18 | - Refactor proposal extracting shared styling hook with before/after snippet.
```

catalog.json
```
1 | {
2 |   "11-evidence-log": [
3 |     {
4 |       "phase": "11) Evidence Log",
5 |       "command": "/content-generation",
6 |       "title": "Content Generation",
7 |       "purpose": "Draft docs, blog posts, or marketing copy aligned with the codebase.",
8 |       "gate": "Evidence Log",
9 |       "status": "Ensure docs stay synced with current phase deliverables.",
10 |       "previous": [
11 |         "Stage-specific work just completed"
12 |       ],
13 |       "next": [
14 |         "/release-notes",
15 |         "/summary (if sharing updates)"
16 |       ],
17 |       "path": "content-generation.md"
18 |     }
19 |   ],
20 |   "p0-preflight-docs": [
21 |     {
22 |       "phase": "P0 Preflight Docs",
23 |       "command": "/docfetch-check",
24 |       "title": "DocFetch Preflight Check",
25 |       "purpose": "Enforce the documentation freshness gate before planning work begins. Run this guardrail to pull the latest references, update the DocFetchReport, and block further tasks until the report is OK.",
26 |       "gate": "DocFetchReport",
27 |       "status": "DocFetchReport.status is OK with sources captured before planning or coding.",
28 |       "previous": [
29 |         "Preflight discovery (AGENTS baseline)"
30 |       ],
31 |       "next": [
32 |         "/instruction-file",
33 |         "/planning-process"
34 |       ],
35 |       "path": "prompts/preflight/docfetch-check.md"
36 |     },
37 |     {
38 |       "phase": "P0 Preflight Docs",
39 |       "command": "/instruction-file",
40 |       "title": "Instruction File",
41 |       "purpose": "Generate or update `cursor.rules`, `windsurf.rules`, or `claude.md` with project-specific instructions.",
42 |       "gate": "DocFetchReport",
43 |       "status": "capture approved instructions before proceeding.",
44 |       "previous": [
45 |         "Preflight discovery (AGENTS baseline)"
46 |       ],
47 |       "next": [
48 |         "/planning-process",
49 |         "/scope-control"
50 |       ],
51 |       "path": "instruction-file.md"
52 |     },
53 |     {
54 |       "phase": "P0 Preflight Docs",
55 |       "command": "/system-instruction-editor",
56 |       "title": "System Instruction: Canonical Instruction File Editor",
57 |       "purpose": "Publish the canonical system instruction guardrail before work begins.",
58 |       "gate": "DocFetchReport",
59 |       "status": "Canonical instruction editor guardrail prepared for use.",
60 |       "previous": [
61 |         "/instruction-file"
62 |       ],
63 |       "next": [
64 |         "/planning-process",
65 |         "/scope-control"
66 |       ],
67 |       "path": "system-level-instruction-editor.md"
68 |     }
69 |   ],
70 |   "p1-plan-scope": [
71 |     {
72 |       "phase": "P1 Plan & Scope",
73 |       "command": "/planning-process",
74 |       "title": "Planning Process",
75 |       "purpose": "Draft, refine, and execute a feature plan with strict scope control and progress tracking.",
76 |       "gate": "Scope Gate",
77 |       "status": "confirm problem, users, Done criteria, and stack risks are logged.",
78 |       "previous": [
79 |         "Preflight Docs (AGENTS baseline)"
80 |       ],
81 |       "next": [
82 |         "/scope-control",
83 |         "/stack-evaluation"
84 |       ],
85 |       "path": "planning-process.md"
86 |     },
87 |     {
88 |       "phase": "P1 Plan & Scope",
89 |       "command": "/prototype-feature",
90 |       "title": "Prototype Feature",
91 |       "purpose": "Spin up a standalone prototype in a clean repo before merging into main.",
92 |       "gate": "Prototype review",
93 |       "status": "Validate spike outcomes before committing to scope.",
94 |       "previous": [
95 |         "/planning-process"
96 |       ],
97 |       "next": [
98 |         "/scaffold-fullstack",
99 |         "/api-contract"
100 |       ],
101 |       "path": "prototype-feature.md"
102 |     },
103 |     {
104 |       "phase": "P1 Plan & Scope",
105 |       "command": "/scope-control",
106 |       "title": "Scope Control",
107 |       "purpose": "Enforce explicit scope boundaries and maintain \"won't do\" and \"ideas for later\" lists.",
108 |       "gate": "Scope Gate",
109 |       "status": "Done criteria, scope lists, and stack choices are committed.",
110 |       "previous": [
111 |         "/planning-process"
112 |       ],
113 |       "next": [
114 |         "/stack-evaluation",
115 |         "/scaffold-fullstack"
116 |       ],
117 |       "path": "scope-control.md"
118 |     },
119 |     {
120 |       "phase": "P1 Plan & Scope",
121 |       "command": "/stack-evaluation",
122 |       "title": "Stack Evaluation",
123 |       "purpose": "Evaluate language/framework choices relative to AI familiarity and repo goals.",
124 |       "gate": "Scope Gate",
125 |       "status": "record recommended stack and top risks before building.",
126 |       "previous": [
127 |         "/scope-control"
128 |       ],
129 |       "next": [
130 |         "/scaffold-fullstack",
131 |         "/api-contract"
132 |       ],
133 |       "path": "stack-evaluation.md"
134 |     }
135 |   ],
136 |   "p2-app-scaffold-contracts": [
137 |     {
138 |       "phase": "P2 App Scaffold & Contracts",
139 |       "command": "/api-contract \"<feature or domain>\"",
140 |       "title": "API Contract",
141 |       "purpose": "Author an initial OpenAPI 3.1 or GraphQL SDL contract from requirements.",
142 |       "gate": "Test Gate lite",
143 |       "status": "contract checked into repo with sample generation running cleanly.",
144 |       "previous": [
145 |         "/scaffold-fullstack"
146 |       ],
147 |       "next": [
148 |         "/openapi-generate",
149 |         "/modular-architecture"
150 |       ],
151 |       "path": "api-contract.md"
152 |     },
153 |     {
154 |       "phase": "P2 App Scaffold & Contracts",
155 |       "command": "/api-docs-local",
156 |       "title": "API Docs Local",
157 |       "purpose": "Fetch API docs and store locally for offline, deterministic reference.",
158 |       "gate": "Test Gate lite",
159 |       "status": "contracts cached locally for repeatable generation.",
160 |       "previous": [
161 |         "/scaffold-fullstack"
162 |       ],
163 |       "next": [
164 |         "/api-contract",
165 |         "/openapi-generate"
166 |       ],
167 |       "path": "api-docs-local.md"
168 |     },
169 |     {
170 |       "phase": "P2 App Scaffold & Contracts",
171 |       "command": "/openapi-generate <server|client> <lang> <spec-path>",
172 |       "title": "OpenAPI Generate",
173 |       "purpose": "Generate server stubs or typed clients from an OpenAPI spec.",
174 |       "gate": "Test Gate lite",
175 |       "status": "generated code builds and CI checks cover the new scripts.",
176 |       "previous": [
177 |         "/api-contract"
178 |       ],
179 |       "next": [
180 |         "/modular-architecture",
181 |         "/db-bootstrap"
182 |       ],
183 |       "path": "openapi-generate.md"
184 |     },
185 |     {
186 |       "phase": "P2 App Scaffold & Contracts",
187 |       "command": "/prototype-feature",
188 |       "title": "Prototype Feature",
189 |       "purpose": "Spin up a standalone prototype in a clean repo before merging into main.",
190 |       "gate": "Prototype review",
191 |       "status": "Validate spike outcomes before committing to scope.",
192 |       "previous": [
193 |         "/planning-process"
194 |       ],
195 |       "next": [
196 |         "/scaffold-fullstack",
197 |         "/api-contract"
198 |       ],
199 |       "path": "prototype-feature.md"
200 |     },
201 |     {
202 |       "phase": "P2 App Scaffold & Contracts",
203 |       "command": "/reference-implementation",
204 |       "title": "Reference Implementation",
205 |       "purpose": "Mimic the style and API of a known working example.",
206 |       "gate": "Test Gate lite",
207 |       "status": "align new modules with proven patterns before deeper work.",
208 |       "previous": [
209 |         "/scaffold-fullstack",
210 |         "/api-contract"
211 |       ],
212 |       "next": [
213 |         "/modular-architecture",
214 |         "/openapi-generate"
215 |       ],
216 |       "path": "reference-implementation.md"
217 |     },
218 |     {
219 |       "phase": "P2 App Scaffold & Contracts",
220 |       "command": "/scaffold-fullstack <stack>",
221 |       "title": "Scaffold Full‑Stack App",
222 |       "purpose": "Create a minimal, production-ready monorepo template with app, API, tests, CI seeds, and infra stubs.",
223 |       "gate": "Test Gate lite",
224 |       "status": "ensure lint/build scripts execute on the generated scaffold.",
225 |       "previous": [
226 |         "/stack-evaluation"
227 |       ],
228 |       "next": [
229 |         "/api-contract",
230 |         "/openapi-generate",
231 |         "/modular-architecture"
232 |       ],
233 |       "path": "scaffold-fullstack.md"
234 |     }
235 |   ],
236 |   "p3-data-auth": [
237 |     {
238 |       "phase": "P3 Data & Auth",
239 |       "command": "/auth-scaffold <oauth|email|oidc>",
240 |       "title": "Auth Scaffold",
241 |       "purpose": "Scaffold auth flows, routes, storage, and a basic threat model.",
242 |       "gate": "Migration dry-run",
243 |       "status": "auth flows threat-modeled and test accounts wired.",
244 |       "previous": [
245 |         "/migration-plan"
246 |       ],
247 |       "next": [
248 |         "/modular-architecture",
249 |         "/ui-screenshots",
250 |         "/e2e-runner-setup"
251 |       ],
252 |       "path": "auth-scaffold.md"
253 |     },
254 |     {
255 |       "phase": "P3 Data & Auth",
256 |       "command": "/db-bootstrap <postgres|mysql|sqlite|mongodb>",
257 |       "title": "DB Bootstrap",
258 |       "purpose": "Pick a database, initialize migrations, local compose, and seed scripts.",
259 |       "gate": "Migration dry-run",
260 |       "status": "migrations apply/rollback cleanly with seeds populated.",
261 |       "previous": [
262 |         "/modular-architecture"
263 |       ],
264 |       "next": [
265 |         "/migration-plan",
266 |         "/auth-scaffold"
267 |       ],
268 |       "path": "db-bootstrap.md"
269 |     },
270 |     {
271 |       "phase": "P3 Data & Auth",
272 |       "command": "/migration-plan \"<change summary>\"",
273 |       "title": "Migration Plan",
274 |       "purpose": "Produce safe up/down migration steps with checks and rollback notes.",
275 |       "gate": "Migration dry-run",
276 |       "status": "validated rollback steps and safety checks documented.",
277 |       "previous": [
278 |         "/db-bootstrap"
279 |       ],
280 |       "next": [
281 |         "/auth-scaffold",
282 |         "/e2e-runner-setup"
283 |       ],
284 |       "path": "migration-plan.md"
285 |     }
286 |   ],
287 |   "p4-frontend-ux": [
288 |     {
289 |       "phase": "P4 Frontend UX",
290 |       "command": "/design-assets",
291 |       "title": "Design Assets",
292 |       "purpose": "Generate favicons and small design snippets from product brand.",
293 |       "gate": "Accessibility checks queued",
294 |       "status": "ensure assets support design review.",
295 |       "previous": [
296 |         "/modular-architecture"
297 |       ],
298 |       "next": [
299 |         "/ui-screenshots",
300 |         "/logging-strategy"
301 |       ],
302 |       "path": "design-assets.md"
303 |     },
304 |     {
305 |       "phase": "P4 Frontend UX",
306 |       "command": "/ui-screenshots",
307 |       "title": "UI Screenshots",
308 |       "purpose": "Analyze screenshots for UI bugs or inspiration and propose actionable UI changes.",
309 |       "gate": "Accessibility checks queued",
310 |       "status": "capture UX issues and backlog fixes.",
311 |       "previous": [
312 |         "/design-assets",
313 |         "/modular-architecture"
314 |       ],
315 |       "next": [
316 |         "/logging-strategy",
317 |         "/e2e-runner-setup"
318 |       ],
319 |       "path": "ui-screenshots.md"
320 |     }
321 |   ],
322 |   "p5-quality-gates-tests": [
323 |     {
324 |       "phase": "P5 Quality Gates & Tests",
325 |       "command": "/coverage-guide",
326 |       "title": "Coverage Guide",
327 |       "purpose": "Propose high-ROI tests to raise coverage using uncovered areas.",
328 |       "gate": "Test Gate",
329 |       "status": "coverage targets and regression guard plan recorded.",
330 |       "previous": [
331 |         "/integration-test"
332 |       ],
333 |       "next": [
334 |         "/regression-guard",
335 |         "/version-control-guide"
336 |       ],
337 |       "path": "coverage-guide.md"
338 |     },
339 |     {
340 |       "phase": "P5 Quality Gates & Tests",
341 |       "command": "/e2e-runner-setup <playwright|cypress>",
342 |       "title": "E2E Runner Setup",
343 |       "purpose": "Configure an end-to-end test runner with fixtures and a data sandbox.",
344 |       "gate": "Test Gate",
345 |       "status": "runner green locally and wired into CI before expanding coverage.",
346 |       "previous": [
347 |         "/auth-scaffold",
348 |         "/ui-screenshots"
349 |       ],
350 |       "next": [
351 |         "/integration-test",
352 |         "/coverage-guide"
353 |       ],
354 |       "path": "e2e-runner-setup.md"
355 |     },
356 |     {
357 |       "phase": "P5 Quality Gates & Tests",
358 |       "command": "/generate <source-file>",
359 |       "title": "Generate Unit Tests",
360 |       "purpose": "Generate unit tests for a given source file.",
361 |       "gate": "Test Gate",
362 |       "status": "targeted unit tests authored for the specified module.",
363 |       "previous": [
364 |         "/coverage-guide"
365 |       ],
366 |       "next": [
367 |         "/regression-guard"
368 |       ],
369 |       "path": "generate.md"
370 |     },
371 |     {
372 |       "phase": "P5 Quality Gates & Tests",
373 |       "command": "/integration-test",
374 |       "title": "Integration Test",
375 |       "purpose": "Generate E2E tests that simulate real user flows.",
376 |       "gate": "Test Gate",
377 |       "status": "happy path E2E must pass locally and in CI.",
378 |       "previous": [
379 |         "/e2e-runner-setup"
380 |       ],
381 |       "next": [
382 |         "/coverage-guide",
383 |         "/regression-guard"
384 |       ],
385 |       "path": "integration-test.md"
386 |     },
387 |     {
388 |       "phase": "P5 Quality Gates & Tests",
389 |       "command": "/regression-guard",
390 |       "title": "Regression Guard",
391 |       "purpose": "Detect unrelated changes and add tests to prevent regressions.",
392 |       "gate": "Test Gate",
393 |       "status": "regression coverage in place before CI hand-off.",
394 |       "previous": [
395 |         "/coverage-guide"
396 |       ],
397 |       "next": [
398 |         "/version-control-guide",
399 |         "/devops-automation"
400 |       ],
401 |       "path": "regression-guard.md"
402 |     }
403 |   ],
404 |   "p6-ci-cd-env": [
405 |     {
406 |       "phase": "P6 CI/CD & Env",
407 |       "command": "/devops-automation",
408 |       "title": "DevOps Automation",
409 |       "purpose": "Configure servers, DNS, SSL, CI/CD at a pragmatic level.",
410 |       "gate": "Review Gate",
411 |       "status": "CI pipeline codified, rollback steps rehearsed.",
412 |       "previous": [
413 |         "/version-control-guide"
414 |       ],
415 |       "next": [
416 |         "/env-setup",
417 |         "/secrets-manager-setup",
418 |         "/iac-bootstrap"
419 |       ],
420 |       "path": "devops-automation.md"
421 |     },
422 |     {
423 |       "phase": "P6 CI/CD & Env",
424 |       "command": "/env-setup",
425 |       "title": "Env Setup",
426 |       "purpose": "Create .env.example, runtime schema validation, and per-env overrides.",
427 |       "gate": "Review Gate",
428 |       "status": "environment schemas enforced and CI respects strict loading.",
429 |       "previous": [
430 |         "/devops-automation"
431 |       ],
432 |       "next": [
433 |         "/secrets-manager-setup",
434 |         "/iac-bootstrap"
435 |       ],
436 |       "path": "env-setup.md"
437 |     },
438 |     {
439 |       "phase": "P6 CI/CD & Env",
440 |       "command": "/iac-bootstrap <aws|gcp|azure|fly|render>",
441 |       "title": "IaC Bootstrap",
442 |       "purpose": "Create minimal Infrastructure-as-Code for the chosen platform plus CI hooks.",
443 |       "gate": "Review Gate",
444 |       "status": "IaC applied in staging with drift detection configured.",
445 |       "previous": [
446 |         "/secrets-manager-setup"
447 |       ],
448 |       "next": [
449 |         "/owners",
450 |         "/review"
451 |       ],
452 |       "path": "iac-bootstrap.md"
453 |     },
454 |     {
455 |       "phase": "P6 CI/CD & Env",
456 |       "command": "/secrets-manager-setup <provider>",
457 |       "title": "Secrets Manager Setup",
458 |       "purpose": "Provision a secrets store and map application variables to it.",
459 |       "gate": "Review Gate",
460 |       "status": "secret paths mapped and least-privilege policies drafted.",
461 |       "previous": [
462 |         "/env-setup"
463 |       ],
464 |       "next": [
465 |         "/iac-bootstrap",
466 |         "/owners"
467 |       ],
468 |       "path": "secrets-manager-setup.md"
469 |     },
470 |     {
471 |       "phase": "P6 CI/CD & Env",
472 |       "command": "/version-control-guide",
473 |       "title": "Version Control Guide",
474 |       "purpose": "Enforce clean incremental commits and clean-room re-implementation when finalizing.",
475 |       "gate": "Review Gate",
476 |       "status": "clean diff, CI green, and approvals ready.",
477 |       "previous": [
478 |         "/regression-guard"
479 |       ],
480 |       "next": [
481 |         "/devops-automation",
482 |         "/env-setup"
483 |       ],
484 |       "path": "version-control-guide.md"
485 |     },
486 |     {
487 |       "phase": "P6 CI/CD & Env",
488 |       "command": "commit",
489 |       "title": "Commit Message Assistant",
490 |       "purpose": "Generate a conventional, review-ready commit message from the currently staged changes.",
491 |       "gate": "Review Gate",
492 |       "status": "clean diff, CI green, and approvals ready.",
493 |       "previous": [
494 |         "/version-control-guide"
495 |       ],
496 |       "next": [
497 |         "/devops-automation",
498 |         "/env-setup"
499 |       ],
500 |       "path": "commit.md"
501 |     }
502 |   ],
503 |   "p7-release-ops": [
504 |     {
505 |       "phase": "P7 Release & Ops",
506 |       "command": "/audit",
507 |       "title": "Audit",
508 |       "purpose": "Audit repository hygiene and suggest improvements.",
509 |       "gate": "Release Gate",
510 |       "status": "readiness criteria before shipping.",
511 |       "previous": [
512 |         "/logging-strategy"
513 |       ],
514 |       "next": [
515 |         "/error-analysis",
516 |         "/fix"
517 |       ],
518 |       "path": "audit.md"
519 |     },
520 |     {
521 |       "phase": "P7 Release & Ops",
522 |       "command": "/explain-code",
523 |       "title": "Explain Code",
524 |       "purpose": "Provide line-by-line explanations for a given file or diff.",
525 |       "gate": "Review Gate",
526 |       "status": "Improve reviewer comprehension before approvals.",
527 |       "previous": [
528 |         "/owners",
529 |         "/review"
530 |       ],
531 |       "next": [
532 |         "/review-branch",
533 |         "/pr-desc"
534 |       ],
535 |       "path": "explain-code.md"
536 |     },
537 |     {
538 |       "phase": "P7 Release & Ops",
539 |       "command": "/monitoring-setup",
540 |       "title": "Monitoring Setup",
541 |       "purpose": "Bootstrap logs, metrics, and traces with dashboards per domain.",
542 |       "gate": "Release Gate",
543 |       "status": "observability baselines ready before rollout.",
544 |       "previous": [
545 |         "/version-proposal"
546 |       ],
547 |       "next": [
548 |         "/slo-setup",
549 |         "/logging-strategy"
550 |       ],
551 |       "path": "monitoring-setup.md"
552 |     },
553 |     {
554 |       "phase": "P7 Release & Ops",
555 |       "command": "/owners <path>",
556 |       "title": "Owners",
557 |       "purpose": "Suggest likely owners or reviewers for the specified path.",
558 |       "gate": "Review Gate",
559 |       "status": "confirm approvers and escalation paths before PR submission.",
560 |       "previous": [
561 |         "/iac-bootstrap"
562 |       ],
563 |       "next": [
564 |         "/review",
565 |         "/review-branch",
566 |         "/pr-desc"
567 |       ],
568 |       "path": "owners.md"
569 |     },
570 |     {
571 |       "phase": "P7 Release & Ops",
572 |       "command": "/pr-desc <context>",
573 |       "title": "PR Description",
574 |       "purpose": "Draft a PR description from the branch diff.",
575 |       "gate": "Review Gate",
576 |       "status": "PR narrative ready for approvals and release prep.",
577 |       "previous": [
578 |         "/review-branch"
579 |       ],
580 |       "next": [
581 |         "/release-notes",
582 |         "/version-proposal"
583 |       ],
584 |       "path": "pr-desc.md"
585 |     },
586 |     {
587 |       "phase": "P7 Release & Ops",
588 |       "command": "/release-notes <git-range>",
589 |       "title": "Release Notes",
590 |       "purpose": "Generate human-readable release notes from recent commits.",
591 |       "gate": "Release Gate",
592 |       "status": "notes compiled for staging review and production rollout.",
593 |       "previous": [
594 |         "/pr-desc"
595 |       ],
596 |       "next": [
597 |         "/version-proposal",
598 |         "/monitoring-setup"
599 |       ],
600 |       "path": "release-notes.md"
601 |     },
602 |     {
603 |       "phase": "P7 Release & Ops",
604 |       "command": "/review <pattern>",
605 |       "title": "Review",
606 |       "purpose": "Review code matching a pattern and deliver actionable feedback.",
607 |       "gate": "Review Gate",
608 |       "status": "peer review coverage met before merging.",
609 |       "previous": [
610 |         "/owners"
611 |       ],
612 |       "next": [
613 |         "/review-branch",
614 |         "/pr-desc"
615 |       ],
616 |       "path": "review.md"
617 |     },
618 |     {
619 |       "phase": "P7 Release & Ops",
620 |       "command": "/review-branch",
621 |       "title": "Review Branch",
622 |       "purpose": "Provide a high-level review of the current branch versus origin/main.",
623 |       "gate": "Review Gate",
624 |       "status": "branch scope validated before PR submission.",
625 |       "previous": [
626 |         "/review"
627 |       ],
628 |       "next": [
629 |         "/pr-desc",
630 |         "/release-notes"
631 |       ],
632 |       "path": "review-branch.md"
633 |     },
634 |     {
635 |       "phase": "P7 Release & Ops",
636 |       "command": "/slo-setup",
637 |       "title": "SLO Setup",
638 |       "purpose": "Define Service Level Objectives, burn alerts, and runbooks.",
639 |       "gate": "Release Gate",
640 |       "status": "SLOs and alerts reviewed before production rollout.",
641 |       "previous": [
642 |         "/monitoring-setup"
643 |       ],
644 |       "next": [
645 |         "/logging-strategy",
646 |         "/audit"
647 |       ],
648 |       "path": "slo-setup.md"
649 |     },
650 |     {
651 |       "phase": "P7 Release & Ops",
652 |       "command": "/version-proposal",
653 |       "title": "Version Proposal",
654 |       "purpose": "Propose the next semantic version based on commit history.",
655 |       "gate": "Release Gate",
656 |       "status": "version bump decision recorded before deployment.",
657 |       "previous": [
658 |         "/release-notes"
659 |       ],
660 |       "next": [
661 |         "/monitoring-setup",
662 |         "/slo-setup"
663 |       ],
664 |       "path": "version-proposal.md"
665 |     }
666 |   ],
667 |   "p8-post-release-hardening": [
668 |     {
669 |       "phase": "P8 Post-release Hardening",
670 |       "command": "/cleanup-branches",
671 |       "title": "Cleanup Branches",
672 |       "purpose": "Recommend which local branches are safe to delete and which to keep.",
673 |       "gate": "Post-release cleanup",
674 |       "status": "repo tidy with stale branches archived.",
675 |       "previous": [
676 |         "/dead-code-scan"
677 |       ],
678 |       "next": [
679 |         "/feature-flags",
680 |         "/model-strengths"
681 |       ],
682 |       "path": "cleanup-branches.md"
683 |     },
684 |     {
685 |       "phase": "P8 Post-release Hardening",
686 |       "command": "/dead-code-scan",
687 |       "title": "Dead Code Scan",
688 |       "purpose": "Identify likely dead or unused files and exports using static signals.",
689 |       "gate": "Post-release cleanup",
690 |       "status": "ensure code removals keep prod stable.",
691 |       "previous": [
692 |         "/file-modularity"
693 |       ],
694 |       "next": [
695 |         "/cleanup-branches",
696 |         "/feature-flags"
697 |       ],
698 |       "path": "dead-code-scan.md"
699 |     },
700 |     {
701 |       "phase": "P8 Post-release Hardening",
702 |       "command": "/error-analysis",
703 |       "title": "Error Analysis",
704 |       "purpose": "Analyze error logs and enumerate likely root causes with fixes.",
705 |       "gate": "Post-release cleanup",
706 |       "status": "Sev-1 incidents triaged with fixes scheduled.",
707 |       "previous": [
708 |         "/logging-strategy",
709 |         "/audit"
710 |       ],
711 |       "next": [
712 |         "/fix",
713 |         "/refactor-suggestions"
714 |       ],
715 |       "path": "error-analysis.md"
716 |     },
717 |     {
718 |       "phase": "P8 Post-release Hardening",
719 |       "command": "/feature-flags <provider>",
720 |       "title": "Feature Flags",
721 |       "purpose": "Integrate a flag provider, wire the SDK, and enforce guardrails.",
722 |       "gate": "Post-release cleanup",
723 |       "status": "guardrails added before toggling new flows.",
724 |       "previous": [
725 |         "/cleanup-branches"
726 |       ],
727 |       "next": [
728 |         "/model-strengths",
729 |         "/model-evaluation"
730 |       ],
731 |       "path": "feature-flags.md"
732 |     },
733 |     {
734 |       "phase": "P8 Post-release Hardening",
735 |       "command": "/file-modularity",
736 |       "title": "File Modularity",
737 |       "purpose": "Enforce smaller files and propose safe splits for giant files.",
738 |       "gate": "Post-release cleanup",
739 |       "status": "structure debt addressed without destabilizing prod.",
740 |       "previous": [
741 |         "/refactor-suggestions"
742 |       ],
743 |       "next": [
744 |         "/dead-code-scan",
745 |         "/cleanup-branches"
746 |       ],
747 |       "path": "file-modularity.md"
748 |     },
749 |     {
750 |       "phase": "P8 Post-release Hardening",
751 |       "command": "/fix \"<bug summary>\"",
752 |       "title": "Fix",
753 |       "purpose": "Propose a minimal, correct fix with diff-style patches.",
754 |       "gate": "Post-release cleanup",
755 |       "status": "validated fix with regression coverage before closing incident.",
756 |       "previous": [
757 |         "/error-analysis"
758 |       ],
759 |       "next": [
760 |         "/refactor-suggestions",
761 |         "/file-modularity"
762 |       ],
763 |       "path": "fix.md"
764 |     },
765 |     {
766 |       "phase": "P8 Post-release Hardening",
767 |       "command": "/refactor-suggestions",
768 |       "title": "Refactor Suggestions",
769 |       "purpose": "Propose repo-wide refactoring opportunities after tests exist.",
770 |       "gate": "Post-release cleanup",
771 |       "status": "plan high-leverage refactors once Sev-1 issues settle.",
772 |       "previous": [
773 |         "/fix"
774 |       ],
775 |       "next": [
776 |         "/file-modularity",
777 |         "/dead-code-scan"
778 |       ],
779 |       "path": "refactor-suggestions.md"
780 |     }
781 |   ],
782 |   "p9-model-tactics": [
783 |     {
784 |       "phase": "P9 Model Tactics",
785 |       "command": "/compare-outputs",
786 |       "title": "Compare Outputs",
787 |       "purpose": "Run multiple models or tools on the same prompt and summarize best output.",
788 |       "gate": "Model uplift",
789 |       "status": "comparative data compiled before switching defaults.",
790 |       "previous": [
791 |         "/model-evaluation"
792 |       ],
793 |       "next": [
794 |         "/switch-model"
795 |       ],
796 |       "path": "compare-outputs.md"
797 |     },
798 |     {
799 |       "phase": "P9 Model Tactics",
800 |       "command": "/model-evaluation",
801 |       "title": "Model Evaluation",
802 |       "purpose": "Try a new model and compare outputs against a baseline.",
803 |       "gate": "Model uplift",
804 |       "status": "experiments must beat baseline quality metrics.",
805 |       "previous": [
806 |         "/model-strengths"
807 |       ],
808 |       "next": [
809 |         "/compare-outputs",
810 |         "/switch-model"
811 |       ],
812 |       "path": "model-evaluation.md"
813 |     },
814 |     {
815 |       "phase": "P9 Model Tactics",
816 |       "command": "/model-strengths",
817 |       "title": "Model Strengths",
818 |       "purpose": "Choose model per task type.",
819 |       "gate": "Model uplift",
820 |       "status": "capture baseline routing before experimentation.",
821 |       "previous": [
822 |         "/feature-flags (optional)",
823 |         "Stage-specific blockers"
824 |       ],
825 |       "next": [
826 |         "/model-evaluation",
[TRUNCATED]
```

changed-files.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Summarize changed files between HEAD and origin/main.
2 | 
3 | 1. Gather context by running `git diff --name-status origin/main...HEAD`.
4 | 2. List and categorize changed files: added/modified/renamed/deleted. Call out risky changes.
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Summarize changed files between HEAD and origin/main.
10 | - Document the evidence you used so maintainers can trust the conclusion.
11 | 
12 | Example Input:
13 | (none – command runs without arguments)
14 | 
15 | Expected Output:
16 | 
17 | - Structured report following the specified sections.
```

check.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Check adherence to .editorconfig across the repo.
2 | 
3 | 1. Gather context by inspecting `.editorconfig`; running `git ls-files | sed -n '1,400p'`.
4 | 2. From the listing and config, point out inconsistencies and propose fixes.
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Check adherence to .editorconfig across the repo.
10 | - Offer prioritized, actionable recommendations with rationale.
11 | - Highlight workflow triggers, failing jobs, and proposed fixes.
12 | 
13 | Example Input:
14 | (none – command runs without arguments)
15 | 
16 | Expected Output:
17 | 
18 | - Structured report following the specified sections.
```

cleanup-branches.md
```
1 | ---
2 | phase: "P8 Post-release Hardening"
3 | gate: "Post-release cleanup"
4 | status: "repo tidy with stale branches archived."
5 | previous:
6 |   - "/dead-code-scan"
7 | next:
8 |   - "/feature-flags"
9 |   - "/model-strengths"
10 | ---
11 | 
12 | # Cleanup Branches
13 | 
14 | Trigger: /cleanup-branches
15 | 
16 | Purpose: Recommend which local branches are safe to delete and which to keep.
17 | 
18 | You are a CLI assistant focused on helping contributors with the task: Suggest safe local branch cleanup (merged/stale).
19 | 
20 | 1. Gather context by running `git branch --merged` for the merged into current upstream; running `git branch --no-merged` for the branches not merged; running `git for-each-ref --sort=-authordate --format='%(refname:short) — %(authordate:relative)' refs/heads` for the recently updated (last author dates).
21 | 2. Using the lists below, suggest local branches safe to delete and which to keep. Include commands to remove them if desired (DO NOT execute).
22 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
23 | 
24 | Output:
25 | 
26 | - Begin with a concise summary that restates the goal: Suggest safe local branch cleanup (merged/stale).
27 | - Document the evidence you used so maintainers can trust the conclusion.
28 | 
29 | Example Input:
30 | (none – command runs without arguments)
31 | 
32 | Expected Output:
33 | 
34 | - Structured report following the specified sections.
35 | 
```

commit.md
```
1 | ---
2 | phase: "P6 CI/CD & Env"
3 | gate: "Review Gate"
4 | status: "clean diff, CI green, and approvals ready."
5 | previous:
6 |   - "/version-control-guide"
7 | next:
8 |   - "/devops-automation"
9 |   - "/env-setup"
10 | ---
11 | 
12 | # Commit Message Assistant
13 | 
14 | Trigger: `commit`
15 | 
16 | Purpose: Generate a conventional, review-ready commit message from the currently staged changes.
17 | 
18 | Output: A finalized commit message with a 50–72 character imperative subject line, optional scope, and supporting body lines describing the rationale, evidence, and tests.
19 | 
20 | ## Steps
21 | 
22 | 1. Verify there is staged work with `git status --short` and stop with guidance if nothing is staged.
23 | 2. Inspect the staged diff with `git diff --staged` and identify the primary change type (feat, fix, chore, docs, refactor, etc.) and optional scope (e.g., package or module).
24 | 3. Draft a concise subject line in the form `<type>(<scope>): <imperative summary>` or `<type>: <imperative summary>` when no scope applies. Keep the line under 73 characters.
25 | 4. Capture essential details in the body as wrapped bullet points or paragraphs: what changed, why it was necessary, and any follow-up actions.
26 | 5. Document validation in a trailing section (e.g., `Tests:`) noting commands executed or why tests were skipped.
27 | 
28 | ## Example Output
29 | 
30 | ```
31 | fix(auth): prevent session expiration loop
32 | 
33 | - guard refresh flow against repeated 401 responses
34 | - add regression coverage for expired refresh tokens
35 | 
36 | Tests: npm test -- auth/session.test.ts
37 | ```
```

compare-outputs.md
```
1 | ---
2 | phase: "P9 Model Tactics"
3 | gate: "Model uplift"
4 | status: "comparative data compiled before switching defaults."
5 | previous:
6 |   - "/model-evaluation"
7 | next:
8 |   - "/switch-model"
9 | ---
10 | 
11 | # Compare Outputs
12 | 
13 | Trigger: /compare-outputs
14 | 
15 | Purpose: Run multiple models or tools on the same prompt and summarize best output.
16 | 
17 | ## Steps
18 | 
19 | 1. Define evaluation prompts and expected properties.
20 | 2. Record outputs from each model/tool with metadata.
21 | 3. Score using a rubric: correctness, compile/run success, edits required.
22 | 4. Recommend a winner and suggested settings.
23 | 
24 | ## Output format
25 | 
26 | - Matrix comparison and a one-paragraph decision.
27 | 
```

content-generation.md
```
1 | ---
2 | phase: "11) Evidence Log"
3 | gate: "Evidence Log"
4 | status: "Ensure docs stay synced with current phase deliverables."
5 | previous:
6 |   - "Stage-specific work just completed"
7 | next:
8 |   - "/release-notes"
9 |   - "/summary (if sharing updates)"
10 | ---
11 | 
12 | # Content Generation
13 | 
14 | Trigger: /content-generation
15 | 
16 | Purpose: Draft docs, blog posts, or marketing copy aligned with the codebase.
17 | 
18 | ## Steps
19 | 
20 | 1. Read repo README and recent CHANGELOG or commits.
21 | 2. Propose outlines for docs and posts.
22 | 3. Generate content with code snippets and usage examples.
23 | 
24 | ## Output format
25 | 
26 | - Markdown files with frontmatter and section headings.
27 | 
```

coverage-guide.md
```
1 | ---
2 | phase: "P5 Quality Gates & Tests"
3 | gate: "Test Gate"
4 | status: "coverage targets and regression guard plan recorded."
5 | previous:
6 |   - "/integration-test"
7 | next:
8 |   - "/regression-guard"
9 |   - "/version-control-guide"
10 | ---
11 | 
12 | # Coverage Guide
13 | 
14 | Trigger: /coverage-guide
15 | 
16 | Purpose: Propose high-ROI tests to raise coverage using uncovered areas.
17 | 
18 | You are a CLI assistant focused on helping contributors with the task: Suggest a plan to raise coverage based on uncovered areas.
19 | 
20 | 1. Gather context by running `find . -name 'coverage*' -type f -maxdepth 3 -print -exec head -n 40 {} \; 2>/dev/null` for the coverage hints; running `git ls-files | sed -n '1,400p'` for the repo map.
21 | 2. Using coverage artifacts (if available) and repository map, propose the highest‑ROI tests to add.
22 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
23 | 
24 | Output:
25 | 
26 | - Begin with a concise summary that restates the goal: Suggest a plan to raise coverage based on uncovered areas.
27 | - Offer prioritized, actionable recommendations with rationale.
28 | - Call out test coverage gaps and validation steps.
29 | 
30 | Example Input:
31 | (none – command runs without arguments)
32 | 
33 | Expected Output:
34 | 
35 | - Focus on src/auth/login.ts — 0% branch coverage; add error path test.
36 | 
```

cross-check.md
```
1 | # Conflict Resolver
2 | 
3 | Trigger: /cross-check
4 | 
5 | Purpose: Compare conflicting findings and decide which source prevails with rationale.
6 | 
7 | Steps:
8 | 
9 | 1. Accept a list of SourceIDs or URLs with short findings.
10 | 2. Evaluate publisher authority, recency, directness to primary data.
11 | 3. Select the prevailing source; note contradictions and rationale.
12 | 
13 | Output format:
14 | 
15 | ```
16 | ### Contradictions
17 | - {S2 vs S5 → rationale}
18 | 
19 | ### Prevails
20 | - {SourceID} because {reason}
21 | ```
22 | 
23 | Examples:
24 | 
25 | - Input: `/cross-check S2: blog vs S5: RFC`
26 | - Output: RFC prevails due to primary standard.
27 | 
28 | Notes:
29 | 
30 | - Always explain why one source prevails.
```

db-bootstrap.md
```
1 | ---
2 | phase: "P3 Data & Auth"
3 | gate: "Migration dry-run"
4 | status: "migrations apply/rollback cleanly with seeds populated."
5 | previous:
6 |   - "/modular-architecture"
7 | next:
8 |   - "/migration-plan"
9 |   - "/auth-scaffold"
10 | ---
11 | 
12 | # DB Bootstrap
13 | 
14 | Trigger: /db-bootstrap <postgres|mysql|sqlite|mongodb>
15 | 
16 | Purpose: Pick a database, initialize migrations, local compose, and seed scripts.
17 | 
18 | **Steps:**
19 | 
20 | 1. Create `db/compose.yaml` for local dev (skip for sqlite).
21 | 2. Choose ORM/driver (Prisma or Drizzle for SQL). Add migration config.
22 | 3. Create `prisma/schema.prisma` or `drizzle/*.ts` with baseline tables (users, sessions, audit_log).
23 | 4. Add `pnpm db:migrate`, `db:reset`, `db:seed` scripts. Write seed data for local admin user.
24 | 5. Update `.env.example` with `DATABASE_URL` and test connection script.
25 | 
26 | **Output format:** Migration plan list and generated file paths.
27 | 
28 | **Examples:** `/db-bootstrap postgres` → Prisma + Postgres docker-compose.
29 | 
30 | **Notes:** Avoid destructive defaults; provide `--preview-feature` warnings if relevant.
31 | 
```

dead-code-scan.md
```
1 | ---
2 | phase: "P8 Post-release Hardening"
3 | gate: "Post-release cleanup"
4 | status: "ensure code removals keep prod stable."
5 | previous:
6 |   - "/file-modularity"
7 | next:
8 |   - "/cleanup-branches"
9 |   - "/feature-flags"
10 | ---
11 | 
12 | # Dead Code Scan
13 | 
14 | Trigger: /dead-code-scan
15 | 
16 | Purpose: Identify likely dead or unused files and exports using static signals.
17 | 
18 | You are a CLI assistant focused on helping contributors with the task: List likely dead or unused files and exports (static signals).
19 | 
20 | 1. Gather context by running `rg -n "export |module.exports|exports\.|require\(|import " -g '!node_modules' .` for the file reference graph (best‑effort).
21 | 2. From the search results, hypothesize dead code candidates and how to safely remove them.
22 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
23 | 
24 | Output:
25 | 
26 | - Begin with a concise summary that restates the goal: List likely dead or unused files and exports (static signals).
27 | - Document the evidence you used so maintainers can trust the conclusion.
28 | 
29 | Example Input:
30 | (none – command runs without arguments)
31 | 
32 | Expected Output:
33 | 
34 | - Structured report following the specified sections.
35 | 
```

design-assets.md
```
1 | ---
2 | phase: "P4 Frontend UX"
3 | gate: "Accessibility checks queued"
4 | status: "ensure assets support design review."
5 | previous:
6 |   - "/modular-architecture"
7 | next:
8 |   - "/ui-screenshots"
9 |   - "/logging-strategy"
10 | ---
11 | 
12 | # Design Assets
13 | 
14 | Trigger: /design-assets
15 | 
16 | Purpose: Generate favicons and small design snippets from product brand.
17 | 
18 | ## Steps
19 | 
20 | 1. Extract brand colors and name from README or config.
21 | 2. Produce favicon set, social preview, and basic UI tokens.
22 | 3. Document asset locations and references.
23 | 
24 | ## Output format
25 | 
26 | - Asset checklist and generation commands.
27 | 
```

devops-automation.md
```
1 | ---
2 | phase: "P6 CI/CD & Env"
3 | gate: "Review Gate"
4 | status: "CI pipeline codified, rollback steps rehearsed."
5 | previous:
6 |   - "/version-control-guide"
7 | next:
8 |   - "/env-setup"
9 |   - "/secrets-manager-setup"
10 |   - "/iac-bootstrap"
11 | ---
12 | 
13 | # DevOps Automation
14 | 
15 | Trigger: /devops-automation
16 | 
17 | Purpose: Configure servers, DNS, SSL, CI/CD at a pragmatic level.
18 | 
19 | ## Steps
20 | 
21 | 1. Inspect repo for IaC or deploy scripts.
22 | 2. Generate Terraform or Docker Compose templates if missing.
23 | 3. Propose CI workflows for tests, builds, and deploys.
24 | 4. Provide runbooks for rollback.
25 | 
26 | ## Output format
27 | 
28 | - Infra plan with checkpoints and secrets placeholders.
29 | 
```

e2e-runner-setup.md
```
1 | ---
2 | phase: "P5 Quality Gates & Tests"
3 | gate: "Test Gate"
4 | status: "runner green locally and wired into CI before expanding coverage."
5 | previous:
6 |   - "/auth-scaffold"
7 |   - "/ui-screenshots"
8 | next:
9 |   - "/integration-test"
10 |   - "/coverage-guide"
11 | ---
12 | 
13 | # E2E Runner Setup
14 | 
15 | Trigger: /e2e-runner-setup <playwright|cypress>
16 | 
17 | Purpose: Configure an end-to-end test runner with fixtures and a data sandbox.
18 | 
19 | **Steps:**
20 | 
21 | 1. Install runner and add config with baseURL, retries, trace/videos on retry only.
22 | 2. Create fixtures for auth, db reset, and network stubs. Add `test:serve` script.
23 | 3. Provide CI job that boots services, runs E2E, uploads artifacts.
24 | 
25 | **Output format:** file list, scripts, and CI snippet fenced code block.
26 | 
27 | **Examples:** `/e2e-runner-setup playwright`.
28 | 
29 | **Notes:** Keep runs under 10 minutes locally; parallelize spec files.
30 | 
```

env-setup.md
```
1 | ---
2 | phase: "P6 CI/CD & Env"
3 | gate: "Review Gate"
4 | status: "environment schemas enforced and CI respects strict loading."
5 | previous:
6 |   - "/devops-automation"
7 | next:
8 |   - "/secrets-manager-setup"
9 |   - "/iac-bootstrap"
10 | ---
11 | 
12 | # Env Setup
13 | 
14 | Trigger: /env-setup
15 | 
16 | Purpose: Create .env.example, runtime schema validation, and per-env overrides.
17 | 
18 | **Steps:**
19 | 
20 | 1. Scan repo for `process.env` usage and collected keys.
21 | 2. Emit `.env.example` with comments and safe defaults.
22 | 3. Add runtime validation via `zod` or `envsafe` in `packages/config`.
23 | 4. Document `development`, `staging`, `production` precedence and loading order.
24 | 
25 | **Output format:** `.env.example` content block and `config/env.ts` snippet.
26 | 
27 | **Examples:** `/env-setup`.
28 | 
29 | **Notes:** Do not include real credentials. Enforce `STRICT_ENV=true` in CI.
30 | 
```

error-analysis.md
```
1 | ---
2 | phase: "P8 Post-release Hardening"
3 | gate: "Post-release cleanup"
4 | status: "Sev-1 incidents triaged with fixes scheduled."
5 | previous:
6 |   - "/logging-strategy"
7 |   - "/audit"
8 | next:
9 |   - "/fix"
10 |   - "/refactor-suggestions"
11 | ---
12 | 
13 | # Error Analysis
14 | 
15 | Trigger: /error-analysis
16 | 
17 | Purpose: Analyze error logs and enumerate likely root causes with fixes.
18 | 
19 | ## Steps
20 | 
21 | 1. Collect last test logs or application stack traces if present.
22 | 2. Cluster errors by symptom. For each cluster list 2–3 plausible causes.
23 | 3. Propose instrumentation or inputs to disambiguate.
24 | 4. Provide minimal patch suggestions and validation steps.
25 | 
26 | ## Output format
27 | 
28 | - Table: error → likely causes → next checks → candidate fix.
29 | 
30 | ## Examples
31 | 
32 | - "TypeError: x is not a function" → wrong import, circular dep, stale build.
33 | 
```

eslint-review.md
```
1 | 
2 | You are a CLI assistant focused on helping contributors with the task: Review ESLint config and suggest rule tweaks.
3 | 
4 | 1. Gather context by inspecting `.eslintrc.cjs`; inspecting `.eslintrc.js`; inspecting `package.json`.
5 | 2. Explain key rules, missing plugins, and performance considerations.
6 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
7 | 
8 | Output:
9 | 
10 | - Begin with a concise summary that restates the goal: Review ESLint config and suggest rule tweaks.
11 | - Organize details under clear subheadings so contributors can scan quickly.
12 | - Document the evidence you used so maintainers can trust the conclusion.
13 | 
14 | Example Input:
15 | (none – command runs without arguments)
16 | 
17 | Expected Output:
18 | 
19 | - Structured report following the specified sections.
```

evidence-capture.md
```
1 | # Evidence Logger
2 | 
3 | Trigger: /evidence-capture
4 | 
5 | Purpose: Capture sources for a specified claim with dates, ≤25-word quotes, findings, relevance, and confidence.
6 | 
7 | Steps:
8 | 
9 | 1. Read the claim text and optional URLs provided.
10 | 2. For each source, record metadata and a ≤25-word quote.
11 | 3. Add a brief Finding, Relevance (H/M/L), and Confidence (0.0–1.0).
12 | 
13 | Output format:
14 | 
15 | ```
16 | ### Evidence Log
17 | | SourceID | Title | Publisher | URL | PubDate | Accessed | Quote (≤25w) | Finding | Rel | Conf |
18 | |---|---|---|---|---|---|---|---|---|---|
19 | ```
20 | 
21 | Examples:
22 | 
23 | - Input: `/evidence-capture "Next.js 15 requires React 19 RC"` with official links.
24 | - Output: Evidence table entries with dates.
25 | 
26 | Notes:
27 | 
28 | - Mark missing PubDate as n/a. Prefer official documentation.
```

explain-code.md
```
1 | ---
2 | phase: "P7 Release & Ops"
3 | gate: "Review Gate"
4 | status: "Improve reviewer comprehension before approvals."
5 | previous:
6 |   - "/owners"
7 |   - "/review"
8 | next:
9 |   - "/review-branch"
10 |   - "/pr-desc"
11 | ---
12 | 
13 | # Explain Code
14 | 
15 | Trigger: /explain-code
16 | 
17 | Purpose: Provide line-by-line explanations for a given file or diff.
18 | 
19 | ## Steps
20 | 
21 | 1. Accept a file path or apply to staged diff.
22 | 2. Explain blocks with comments on purpose, inputs, outputs, and caveats.
23 | 3. Highlight risky assumptions and complexity hot spots.
24 | 
25 | ## Output format
26 | 
27 | - Annotated markdown with code fences and callouts.
28 | 
```

explain-failures.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Analyze recent test failures and propose fixes.
2 | 
3 | 1. Gather context by running `ls -1 test-results 2>/dev/null || echo 'no test-results/ directory'` for the recent test output (if present); running `find . -maxdepth 2 -name 'junit*.xml' -o -name 'TEST-*.xml' -o -name 'last-test.log' -print -exec tail -n 200 {} \; 2>/dev/null` for the recent test output (if present).
4 | 2. From the following logs, identify root causes and propose concrete fixes.
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Analyze recent test failures and propose fixes.
10 | - Offer prioritized, actionable recommendations with rationale.
11 | - Document the evidence you used so maintainers can trust the conclusion.
12 | 
13 | Example Input:
14 | (none – command runs without arguments)
15 | 
16 | Expected Output:
17 | 
18 | - Structured report following the specified sections.
```

explain-symbol.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Explain where and how a symbol is defined and used.
2 | 
3 | 1. Gather context by running `rg -n {{args}} . || grep -RIn {{args}} .` for the results.
4 | 2. Explain where and how a symbol is defined and used.
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Explain where and how a symbol is defined and used.
10 | - Organize details under clear subheadings so contributors can scan quickly.
11 | - Document the evidence you used so maintainers can trust the conclusion.
12 | 
13 | Example Input:
14 | HttpClient
15 | 
16 | Expected Output:
17 | 
18 | - Definition: src/network/httpClient.ts line 42
19 | - Key usages: services/userService.ts, hooks/useRequest.ts
```

feature-flags.md
```
1 | ---
2 | phase: "P8 Post-release Hardening"
3 | gate: "Post-release cleanup"
4 | status: "guardrails added before toggling new flows."
5 | previous:
6 |   - "/cleanup-branches"
7 | next:
8 |   - "/model-strengths"
9 |   - "/model-evaluation"
10 | ---
11 | 
12 | # Feature Flags
13 | 
14 | Trigger: /feature-flags <provider>
15 | 
16 | Purpose: Integrate a flag provider, wire the SDK, and enforce guardrails.
17 | 
18 | **Steps:**
19 | 
20 | 1. Select provider (LaunchDarkly, Unleash, Flagsmith, custom).
21 | 2. Add SDK init in web/api with bootstrap values and offline mode for dev.
22 | 3. Define flag naming and ownership. Add kill‑switch pattern and monitoring.
23 | 
24 | **Output format:** SDK snippet, example usage, and guardrail checklist.
25 | 
26 | **Examples:** `/feature-flags launchdarkly`.
27 | 
28 | **Notes:** Ensure flags are typed and expire with tickets.
29 | 
```

file-modularity.md
```
1 | ---
2 | phase: "P8 Post-release Hardening"
3 | gate: "Post-release cleanup"
4 | status: "structure debt addressed without destabilizing prod."
5 | previous:
6 |   - "/refactor-suggestions"
7 | next:
8 |   - "/dead-code-scan"
9 |   - "/cleanup-branches"
10 | ---
11 | 
12 | # File Modularity
13 | 
14 | Trigger: /file-modularity
15 | 
16 | Purpose: Enforce smaller files and propose safe splits for giant files.
17 | 
18 | ## Steps
19 | 
20 | 1. Find files over thresholds (e.g., >500 lines).
21 | 2. Suggest extraction targets: components, hooks, utilities, schemas.
22 | 3. Provide before/after examples and import updates.
23 | 
24 | ## Output format
25 | 
26 | - Refactor plan with patches for file splits.
27 | 
```

fix.md
```
1 | ---
2 | phase: "P8 Post-release Hardening"
3 | gate: "Post-release cleanup"
4 | status: "validated fix with regression coverage before closing incident."
5 | previous:
6 |   - "/error-analysis"
7 | next:
8 |   - "/refactor-suggestions"
9 |   - "/file-modularity"
10 | ---
11 | 
12 | # Fix
13 | 
14 | Trigger: /fix "<bug summary>"
15 | 
16 | Purpose: Propose a minimal, correct fix with diff-style patches.
17 | 
18 | You are a CLI assistant focused on helping contributors with the task: Propose a minimal, correct fix with patch hunks.
19 | 
20 | 1. Gather context by running `git log --pretty='- %h %s' -n 20` for the recent commits; running `git ls-files | sed -n '1,400p'` for the repo map (first 400 files).
21 | 2. Bug summary: <args>. Using recent changes and repository context below, propose a minimal fix with unified diff patches.
22 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
23 | 
24 | Output:
25 | 
26 | - Begin with a concise summary that restates the goal: Propose a minimal, correct fix with patch hunks.
27 | - Provide unified diff-style patches when recommending code changes.
28 | - Offer prioritized, actionable recommendations with rationale.
29 | 
30 | Example Input:
31 | Authentication failure after password reset
32 | 
33 | Expected Output:
34 | 
35 | ```
36 | diff
37 | - if (!user) return error;
38 | + if (!user) return { status: 401 };
39 | ```
40 | 
41 | Regression test: add case for missing user.
42 | 
```

gemini-map.md
```
1 | name: Gemini→Codex Mapper
2 | command: /gemini-map
3 | tags: migration, prompts, tooling
4 | scope: toml-to-codex
5 | 
6 | You are a translator that converts a Gemini CLI TOML command into a Codex prompt file.
7 | 
8 | Steps:
9 | 
10 | 1) Read TOML with `description` and `prompt`.
11 | 2) Extract the task, inputs, and outputs implied by the TOML.
12 | 3) Write a Codex prompt file ≤ 300 words:
13 | 
14 |     - Role line `You are ...`
15 |     - Numbered steps
16 |     - Output section
17 |     - Example input and expected output
18 |     - `Usage: /<command>` line
19 |     - YAML-like metadata at top
20 | 
21 | 4) Choose a short, hyphenated filename ≤ 32 chars.
22 | 5) Emit a ready-to-run bash snippet:
23 | `cat > ~/.codex/prompts/<filename>.md << 'EOF'` … `EOF`.
24 | 6) Do not include destructive commands or secrets.
25 | 
26 | Example input:
27 | 
28 | ```toml
29 | description = "Draft a PR description"
30 | prompt = "Create sections Summary, Context, Changes from diff stats"
31 | Expected output:
32 | 
33 | A pr-desc.md file with the structure above and a bash cat > block.
34 | 
35 | Usage: /gemini-map
```

generate.md
```
1 | ---
2 | phase: "P5 Quality Gates & Tests"
3 | gate: "Test Gate"
4 | status: "targeted unit tests authored for the specified module."
5 | previous:
6 |   - "/coverage-guide"
7 | next:
8 |   - "/regression-guard"
9 | ---
10 | 
11 | # Generate Unit Tests
12 | 
13 | Trigger: /generate <source-file>
14 | 
15 | Purpose: Generate unit tests for a given source file.
16 | 
17 | You are a CLI assistant focused on helping contributors with the task: Generate unit tests for a given source file.
18 | 
19 | ## Steps
20 | 
21 | 1. Inspect `package.json` to identify the unit test framework, runner scripts, and any helper utilities required for the suite.
22 | 2. Review the target source file with `sed -n '1,400p' {{args}}` to catalog exported members, branching logic, and error handling paths that must be exercised.
23 | 3. Outline the test file structure (location, naming, setup/teardown) and propose arrange/act/assert cases that cover happy paths, edge cases, and failure scenarios.
24 | 4. Provide guidance on implementing the tests and how to validate them locally (e.g., `npm test -- <pattern>` or framework-specific commands).
25 | 
26 | ## Output
27 | 
28 | - Begin with a concise summary that restates the goal: Generate unit tests for a given source file.
29 | - List the recommended test files, describe each test case, and highlight coverage gaps they close.
30 | - Call out the command(s) to run the new tests and any fixtures or mocks required.
31 | - Document the evidence you used (e.g., `package.json`, specific functions/branches in the source file) so maintainers can trust the conclusion.
32 | 
33 | ## Example
34 | 
35 | **Input**
36 | 
37 | ```
38 | src/components/Button.tsx
39 | ```
40 | 
41 | **Output**
42 | 
43 | - Summary: Author React Testing Library unit tests for `Button` to cover rendering, disabled behavior, and click handling.
44 | - Create `src/components/__tests__/Button.test.tsx` that:
45 |   - Renders the button label and asserts it matches `props.children`.
46 |   - Verifies `onClick` fires once when the button is enabled and is skipped when `disabled` is true.
47 |   - Confirms the `variant="primary"` branch applies the `btn-primary` class.
48 | - Validation: Run `npm test -- Button.test.tsx` to execute the suite.
49 | - Evidence: `package.json` (scripts.test uses Jest + RTL), component branches in `src/components/Button.tsx` (disabled guard, variant styling).
```

grep.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Recursive text search with ripgrep/grep injection.
2 | 
3 | 1. Gather context by running `rg -n {{args}} . || grep -RIn {{args}} .`.
4 | 2. Show matched lines with file paths and line numbers.
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Recursive text search with ripgrep/grep injection.
10 | - Document the evidence you used so maintainers can trust the conclusion.
11 | 
12 | Example Input:
13 | HttpClient
14 | 
15 | Expected Output:
16 | 
17 | - Usage cluster in src/network/* with note on inconsistent error handling.
```

iac-bootstrap.md
```
1 | ---
2 | phase: "P6 CI/CD & Env"
3 | gate: "Review Gate"
4 | status: "IaC applied in staging with drift detection configured."
5 | previous:
6 |   - "/secrets-manager-setup"
7 | next:
8 |   - "/owners"
9 |   - "/review"
10 | ---
11 | 
12 | # IaC Bootstrap
13 | 
14 | Trigger: /iac-bootstrap <aws|gcp|azure|fly|render>
15 | 
16 | Purpose: Create minimal Infrastructure-as-Code for the chosen platform plus CI hooks.
17 | 
18 | **Steps:**
19 | 
20 | 1. Select tool (Terraform, Pulumi). Initialize backend and state.
21 | 2. Define stacks for `preview`, `staging`, `prod`. Add outputs (URLs, connection strings).
22 | 3. Add CI jobs: plan on PR, apply on main with manual approval.
23 | 4. Document rollback and drift detection.
24 | 
25 | **Output format:** stack diagram, file list, CI snippets.
26 | 
27 | **Examples:** `/iac-bootstrap aws`.
28 | 
29 | **Notes:** Prefer least privilege IAM and remote state with locking.
30 | 
```

inspector.config.json
```
1 | {
2 |   "mcpServers": {
3 |     "codex-prompts": {
4 |       "type": "stdio",
5 |       "command": "node",
6 |       "args": ["dist/mcp/server.js", "--tasks", ".taskmaster/tasks/tasks.json", "--tag", "master"],
7 |       "cwd": "."
8 |     }
9 |   }
10 | }
```

instruction-file.md
```
1 | ---
2 | phase: "P0 Preflight Docs"
3 | gate: "DocFetchReport"
4 | status: "capture approved instructions before proceeding."
5 | previous:
6 |   - "Preflight discovery (AGENTS baseline)"
7 | next:
8 |   - "/planning-process"
9 |   - "/scope-control"
10 | ---
11 | 
12 | # Instruction File
13 | 
14 | Trigger: /instruction-file
15 | 
16 | Purpose: Generate or update `cursor.rules`, `windsurf.rules`, or `claude.md` with project-specific instructions.
17 | 
18 | ## Steps
19 | 
20 | 1. Scan repo for existing instruction files.
21 | 2. Compose sections: Context, Coding Standards, Review Rituals, Testing, Security, Limits.
22 | 3. Include "Reset and re-implement cleanly" guidance and scope control.
23 | 4. Write to chosen file and propose a commit message.
24 | 
25 | ## Output format
26 | 
27 | - Markdown instruction file with stable headings.
28 | 
```

integration-test.md
```
1 | ---
2 | phase: "P5 Quality Gates & Tests"
3 | gate: "Test Gate"
4 | status: "happy path E2E must pass locally and in CI."
5 | previous:
6 |   - "/e2e-runner-setup"
7 | next:
8 |   - "/coverage-guide"
9 |   - "/regression-guard"
10 | ---
11 | 
12 | # Integration Test
13 | 
14 | Trigger: /integration-test
15 | 
16 | Purpose: Generate E2E tests that simulate real user flows.
17 | 
18 | ## Steps
19 | 
20 | 1. Detect framework from `package.json` or repo (Playwright/Cypress/Vitest).
21 | 2. Identify critical path scenarios from `PLAN.md`.
22 | 3. Produce test files under `e2e/` with arrange/act/assert and selectors resilient to DOM changes.
23 | 4. Include login helpers and data setup. Add CI commands.
24 | 
25 | ## Output format
26 | 
27 | - Test files with comments and a README snippet on how to run them.
28 | 
29 | ## Examples
30 | 
31 | - Login, navigate to dashboard, create record, assert toast.
32 | 
33 | ## Notes
34 | 
35 | - Prefer data-test-id attributes. Avoid brittle CSS selectors.
36 | 
```

jest.config.ts
```
1 | /** @jest-config-loader ts-node */
2 | /** @jest-config-loader-options {"transpileOnly": true} */
3 | 
4 | import type {Config} from 'jest';
5 | 
6 | const config: Config = {
7 |   preset: 'ts-jest/presets/default-esm',
8 |   testEnvironment: 'node',
9 |   extensionsToTreatAsEsm: ['.ts'],
10 |   moduleNameMapper: {
11 |     '^(\\.{1,2}/.*)\\.js$': '$1'
12 |   },
13 |   roots: ['<rootDir>/src', '<rootDir>/test', '<rootDir>/tests'],
14 |   transform: {
15 |     '^.+\\.(ts|tsx)$': [
16 |       'ts-jest',
17 |       {
18 |         useESM: true,
19 |         tsconfig: 'tsconfig.json'
20 |       }
21 |     ]
22 |   }
23 | };
24 | 
25 | export default config;
```

logging-strategy.md
```
1 | phase: "P7 Release & Ops"
2 | gate: "Release Gate"
3 | status: "logging guardrails ready for canary/production checks; coordinate with P4 Frontend UX for client telemetry."
4 | previous:
5 | 
6 | - "/monitoring-setup"
7 | - "/slo-setup"
8 | next:
9 | - "/audit"
10 | - "/error-analysis"
11 | 
12 | ---
13 | 
14 | # Logging Strategy
15 | 
16 | Trigger: /logging-strategy
17 | 
18 | Purpose: Add or remove diagnostic logging cleanly with levels and privacy in mind.
19 | 
20 | ## Steps
21 | 
22 | 1. Identify hotspots from recent failures.
23 | 2. Insert structured logs with contexts and correlation IDs.
24 | 3. Remove noisy or PII-leaking logs.
25 | 4. Document log levels and sampling in `OBSERVABILITY.md`.
26 | 
27 | ## Output format
28 | 
29 | - Diff hunks and a short guideline section.
30 | 
```

migration-plan.md
```
1 | ---
2 | phase: "P3 Data & Auth"
3 | gate: "Migration dry-run"
4 | status: "validated rollback steps and safety checks documented."
5 | previous:
6 |   - "/db-bootstrap"
7 | next:
8 |   - "/auth-scaffold"
9 |   - "/e2e-runner-setup"
10 | ---
11 | 
12 | # Migration Plan
13 | 
14 | Trigger: /migration-plan "<change summary>"
15 | 
16 | Purpose: Produce safe up/down migration steps with checks and rollback notes.
17 | 
18 | **Steps:**
19 | 
20 | 1. Describe current vs target schema, include data volume and lock risk.
21 | 2. Plan: deploy empty columns, backfill, dual-write, cutover, cleanup.
22 | 3. Provide SQL snippets and PR checklist. Add `can_rollback: true|false` flag.
23 | 
24 | **Output format:** `Plan`, `SQL`, `Rollback`, `Checks` sections.
25 | 
26 | **Examples:** `/migration-plan "orders add status enum"`.
27 | 
28 | **Notes:** Include online migration strategies for large tables.
29 | 
```

model-evaluation.md
```
1 | ---
2 | phase: "P9 Model Tactics"
3 | gate: "Model uplift"
4 | status: "experiments must beat baseline quality metrics."
5 | previous:
6 |   - "/model-strengths"
7 | next:
8 |   - "/compare-outputs"
9 |   - "/switch-model"
10 | ---
11 | 
12 | # Model Evaluation
13 | 
14 | Trigger: /model-evaluation
15 | 
16 | Purpose: Try a new model and compare outputs against a baseline.
17 | 
18 | ## Steps
19 | 
20 | 1. Define a benchmark set from recent tasks.
21 | 2. Run candidates and collect outputs and metrics.
22 | 3. Analyze failures and summarize where each model excels.
23 | 
24 | ## Output format
25 | 
26 | - Summary table and recommendations to adopt or not.
27 | 
```

model-strengths.md
```
1 | ---
2 | phase: "P9 Model Tactics"
3 | gate: "Model uplift"
4 | status: "capture baseline routing before experimentation."
5 | previous:
6 |   - "/feature-flags (optional)"
7 |   - "Stage-specific blockers"
8 | next:
9 |   - "/model-evaluation"
10 |   - "/compare-outputs"
11 | ---
12 | 
13 | # Model Strengths
14 | 
15 | Trigger: /model-strengths
16 | 
17 | Purpose: Choose model per task type.
18 | 
19 | ## Steps
20 | 
21 | 1. Classify task: UI, API, data, testing, docs, refactor.
22 | 2. Map historical success by model.
23 | 3. Recommend routing rules and temperatures.
24 | 
25 | ## Output format
26 | 
27 | - Routing guide with examples.
28 | 
```

modular-architecture.md
```
1 | phase: "P2 App Scaffold & Contracts"
2 | gate: "Test Gate lite"
3 | status: "boundaries documented and lint/build scripts still pass; revisit during P4 Frontend UX for UI seams."
4 | previous:
5 | 
6 | - "/openapi-generate"
7 | next:
8 | - "/db-bootstrap"
9 | - "/ui-screenshots"
10 | - "/design-assets"
11 | 
12 | ---
13 | 
14 | # Modular Architecture
15 | 
16 | Trigger: /modular-architecture
17 | 
18 | Purpose: Enforce modular boundaries and clear external interfaces.
19 | 
20 | ## Steps
21 | 
22 | 1. Identify services/modules and their public contracts.
23 | 2. Flag cross-module imports and circular deps.
24 | 3. Propose boundaries, facades, and internal folders.
25 | 4. Add "contract tests" for public APIs.
26 | 
27 | ## Output format
28 | 
29 | - Diagram-ready list of modules and edges, plus diffs.
30 | 
```

monitoring-setup.md
```
1 | ---
2 | phase: "P7 Release & Ops"
3 | gate: "Release Gate"
4 | status: "observability baselines ready before rollout."
5 | previous:
6 |   - "/version-proposal"
7 | next:
8 |   - "/slo-setup"
9 |   - "/logging-strategy"
10 | ---
11 | 
12 | # Monitoring Setup
13 | 
14 | Trigger: /monitoring-setup
15 | 
16 | Purpose: Bootstrap logs, metrics, and traces with dashboards per domain.
17 | 
18 | **Steps:**
19 | 
20 | 1. Choose stack: OpenTelemetry → Prometheus/Grafana, or vendor.
21 | 2. Instrument web and api for request latency, error rate, throughput, and core domain metrics.
22 | 3. Provide default dashboards JSON and alert examples.
23 | 
24 | **Output format:** instrumentation checklist and dashboard links/paths.
25 | 
26 | **Examples:** `/monitoring-setup`.
27 | 
28 | **Notes:** Avoid high‑cardinality labels. Sample traces selectively in prod.
29 | 
```

openapi-generate.md
```
1 | ---
2 | phase: "P2 App Scaffold & Contracts"
3 | gate: "Test Gate lite"
4 | status: "generated code builds and CI checks cover the new scripts."
5 | previous:
6 |   - "/api-contract"
7 | next:
8 |   - "/modular-architecture"
9 |   - "/db-bootstrap"
10 | ---
11 | 
12 | # OpenAPI Generate
13 | 
14 | Trigger: /openapi-generate <server|client> <lang> <spec-path>
15 | 
16 | Purpose: Generate server stubs or typed clients from an OpenAPI spec.
17 | 
18 | **Steps:**
19 | 
20 | 1. Validate `<spec-path>`; fail with actionable errors.
21 | 2. For `server`, generate controllers, routers, validation, and error middleware into `apps/api`.
22 | 3. For `client`, generate a typed SDK into `packages/sdk` with fetch wrapper and retry/backoff.
23 | 4. Add `make generate-api` or `pnpm sdk:gen` scripts and CI step to verify no drift.
24 | 5. Produce a diff summary and TODO list for unimplemented handlers.
25 | 
26 | **Output format:** summary table of generated paths, scripts to add, and next actions.
27 | 
28 | **Examples:** `/openapi-generate client ts apis/auth/openapi.yaml`.
29 | 
30 | **Notes:** Prefer openapi-typescript + zod for TS clients when possible.
31 | 
```

owners.md
```
1 | ---
2 | phase: "P7 Release & Ops"
3 | gate: "Review Gate"
4 | status: "confirm approvers and escalation paths before PR submission."
5 | previous:
6 |   - "/iac-bootstrap"
7 | next:
8 |   - "/review"
9 |   - "/review-branch"
10 |   - "/pr-desc"
11 | ---
12 | 
13 | # Owners
14 | 
15 | Trigger: /owners <path>
16 | 
17 | Purpose: Suggest likely owners or reviewers for the specified path.
18 | 
19 | You are a CLI assistant focused on helping contributors with the task: Suggest likely owners/reviewers for a path.
20 | 
21 | 1. Gather context by inspecting `.github/CODEOWNERS` for the codeowners (if present); running `git log --pretty='- %an %ae: %s' -- {{args}} | sed -n '1,50p'` for the recent authors for the path.
22 | 2. Based on CODEOWNERS and git history, suggest owners.
23 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
24 | 
25 | Output:
26 | 
27 | - Begin with a concise summary that restates the goal: Suggest likely owners/reviewers for a path.
28 | - Reference evidence from CODEOWNERS or git history for each owner suggestion.
29 | - Document the evidence you used so maintainers can trust the conclusion.
30 | 
31 | Example Input:
32 | src/components/Button.tsx
33 | 
34 | Expected Output:
35 | 
36 | - Likely reviewers: @frontend-team (CODEOWNERS), @jane (last 5 commits).
37 | 
```

package.json
```
1 | {
2 |   "name": "prompts",
3 |   "private": false,
4 |   "type": "module",
5 |   "scripts": {
6 |     "build": "tsc --project tsconfig.build.json",
7 |     "build:catalog": "node --loader ts-node/esm scripts/build_catalog.ts",
8 |     "inspect": "npx @modelcontextprotocol/inspector --config inspector.config.json",
9 |     "prompts": "node --enable-source-maps dist/cli/main.js",
10 |     "start": "node dist/mcp/server.js --tasks .taskmaster/tasks/tasks.json --tag master",
11 |     "test": "npm run test:workflow && npm run test:jest",
12 |     "test:jest": "NODE_OPTIONS=--experimental-vm-modules jest --runInBand",
13 |     "test:planner": "npm run test:jest -- test/planner/Planner.test.ts",
14 |     "test:prompt-handler": "npm run test:jest -- src/tools/prompt-handler.test.ts",
15 |     "test:prompts": "npm run test:jest -- src/prompts/loader.test.ts",
16 |     "test:resources": "npm run test:jest -- test/integration/resources.test.ts",
17 |     "test:safety": "npm run test:jest -- src/utils/safety.test.ts",
18 |     "test:schemas": "npm run test:jest -- src/prompts/schema.test.ts",
19 |     "test:state": "npm run test:jest -- test/state/StateStore.test.ts",
20 |     "test:tools": "npm run test:jest -- test/integration/tools.test.ts",
21 |     "test:workflow": "node --loader ts-node/esm scripts/__tests__/workflow_sync.test.ts",
22 |     "validate:metadata": "node --loader ts-node/esm scripts/validate_metadata.ts",
23 |     "prepublishOnly": "npm run test && npm run build",
24 |     "noop": "node -e \"process.exit(0)\"",
25 |     "ci:pack-check": "node scripts/ci/verify-pack-contains.mjs"
26 |   },
27 |   "dependencies": {
28 |     "@modelcontextprotocol/sdk": "^1.17.5",
29 |     "ajv": "^6.12.6",
30 |     "commander": "^12.1.0",
31 |     "gray-matter": "^4.0.3",
32 |     "js-yaml": "^4.1.0",
33 |     "zod": "^3.25.76"
34 |   },
35 |   "devDependencies": {
36 |     "@types/jest": "^29.5.12",
37 |     "@types/js-yaml": "^4.0.9",
38 |     "@types/node": "^20.14.9",
39 |     "glob": "^10.3.10",
40 |     "jest": "^29.7.0",
41 |     "ts-node": "^10.9.2",
42 |     "ts-jest": "^29.1.1",
43 |     "typescript": "^5.4.0"
44 |   },
45 |   "mcpAllowScripts": [
46 |     "validate:metadata",
47 |     "build:catalog",
48 |     "noop",
49 |     "build",
50 |     "test:jest",
51 |     "lint"
52 |   ],
53 |   "bin": {
54 |     "prompts": "./bin/prompts"
55 |   },
56 |   "version": "0.1.0",
57 |   "files": [
58 |     "bin",
59 |     "dist",
60 |     "schemas",
61 |     "resources",
62 |     "prompts",
63 |     "README.md",
64 |     "WORKFLOW.md",
65 |     "catalog.json"
66 |   ]
67 | }
```

plan-delta.md
```
1 | # plan-delta
2 | 
3 | Trigger: /plan-delta
4 | 
5 | Purpose: Orchestrate mid-project planning deltas on an existing task graph with history preservation, lineage, and readiness recalculation.
6 | 
7 | Steps:
8 | 
9 | 1. Discover repository context:
10 |    1. Detect tasks file path: prefer `tasks.json`; else search `**/tasks.json`.
11 |    2. Detect latest plan doc: prefer `PRD.md` or `docs/PRD.md`; else `**/*(prd|spec|plan)*.md`.
12 | 2. Snapshot:
13 |    1. Create `./artifacts/` if missing.
14 |    2. Copy the current tasks file to `./artifacts/tasks-$(date +%Y%m%d-%H%M%S).json` using: `cp -f <tasks.json> ./artifacts/tasks-$(date +%Y%m%d-%H%M%S).json`.
15 | 3. Input collection:
16 |    1. Read new objectives, constraints, and findings from the user input or provided delta text.
17 |    2. Parse selection rules to choose mode: **Continue**, **Hybrid Rebaseline**, or **Full Rebaseline**.
18 | 4. Delta Doc generation:
19 |    1. Create `./artifacts/delta-$(date +%Y%m%d-%H%M%S).md` containing sections:
20 |       - Objectives (new)
21 |       - Constraints (new)
22 |       - Impacts
23 |       - Decisions
24 |       - Evidence log (sources, dates, links)
25 | 5. Task graph update:
26 |    1. Never alter historical states `done|in_progress|blocked` of existing tasks.
27 |    2. Do not reuse IDs. For any replaced task, set `superseded_by` on the old task and include its ID in the new task's `supersedes[]`.
28 |    3. Add `source_doc`, `lineage[]` on all new or changed tasks.
29 |    4. Create new tasks only for new or changed work. Link predecessors via `dependencies` or `relations`.
30 |    5. Keep deprecated tasks in graph with `status: "deprecated"` and a `reason`.
31 | 6. Graph maintenance:
32 |    1. Recompute dependency order and validate acyclicity.
33 |    2. Flag contradictions or invalidated edges as `blocked` with a machine-readable `blocked_reason`.
34 |    3. Bubble critical-path tasks to the active frontier by recomputing earliest-start and slack.
35 | 7. Readiness and selection:
36 |    1. Implement `ready/next()` over the graph: select tasks with all dependencies `done` and not `blocked`.
37 |    2. Produce a short readiness report grouped by `ready | blocked | deprecated`.
38 | 8. Outputs:
39 |    1. Write the updated tasks file in-place, preserving formatting where possible.
40 |    2. Persist the Delta Doc under `./artifacts/`.
41 |    3. Emit decision hooks: one line per change stating what it enables.
42 | 9. Termination:
43 |    - Stop when all deltas are merged and readiness recalculated, or when a prerequisite cannot be resolved with available evidence.
44 | 
45 | Output format:
46 | 
47 | - Produce three artifacts:
48 |   1. **Updated tasks file**: valid JSON. Preserve existing fields. Append only the new or changed tasks and relations. Do not mutate historical statuses.
49 |   2. **Delta document**: Markdown with the exact headings `# Delta`, `## Objectives`, `## Constraints`, `## Impacts`, `## Decisions`, `## Evidence`.
50 |   3. **Readiness report**: Plain text with sections `READY`, `BLOCKED`, `DEPRECATED`. Each item as `- <id> <title>`; blocked items add `[reason=<code>]`.
51 | - Print **Decision hooks** as lines starting with `HOOK: <id> enables <capability>`.
52 | 
53 | Examples:
54 | 
55 | - Input →
56 | 
57 |   ```
58 |   Mode: Continue
59 |   New objectives: add offline export for tasks
60 |   Constraints: no DB migrations
61 |   Findings: existing export lib supports JSON only
62 |   ```
63 | 
64 |   Output →
65 |   - Updated `tasks.json` with new task `T-342` { title: "Add CSV export", dependencies: ["T-120"], source_doc: "delta-20250921.md", lineage: ["T-120"], supersedes: [] }.
66 |   - `artifacts/delta-20250921-160500.md` populated with objectives, constraints, impacts, decisions, evidence.
67 |   - Readiness report lists `T-342` under READY if deps done.
68 | 
69 | - Input →
70 | 
71 |   ```
72 |   Mode: Hybrid Rebaseline
73 |   Changes: ~30% of scope affected by auth provider swap
74 |   ```
75 | 
76 |   Output →
77 |   - Minor-plan version bump recorded in Delta Doc.
78 |   - New tasks added for provider swap; prior tasks kept with `deprecated` or `blocked` and lineage links.
79 | 
80 | Notes:
81 | 
82 | - Never write outside the repo. Keep artifacts in `./artifacts/`.
83 | - Evidence log entries include `source`, `date`, `summary`, and optional `link`.
84 | - Selection rules: Continue (<20% change), Hybrid (20–40%), Full (>40% or goals/KPIs/architecture pivot).
85 | - If inputs are insufficient, emit a TERMINATION note with missing evidence keys.
```

planning-process.md
```
1 | ---
2 | phase: "P1 Plan & Scope"
3 | gate: "Scope Gate"
4 | status: "confirm problem, users, Done criteria, and stack risks are logged."
5 | previous:
6 |   - "Preflight Docs (AGENTS baseline)"
7 | next:
8 |   - "/scope-control"
9 |   - "/stack-evaluation"
10 | ---
11 | 
12 | # Planning Process
13 | 
14 | Trigger: /planning-process
15 | 
16 | Purpose: Draft, refine, and execute a feature plan with strict scope control and progress tracking.
17 | 
18 | ## Steps
19 | 
20 | 1. If no plan file exists, create `PLAN.md`. If it exists, load it.
21 | 2. Draft sections: **Goal**, **User Story**, **Milestones**, **Tasks**, **Won't do**, **Ideas for later**, **Validation**, **Risks**.
22 | 3. Trim bloat. Convert vague bullets into testable tasks with acceptance criteria.
23 | 4. Tag each task with an owner and estimate. Link to files or paths that will change.
24 | 5. Maintain two backlogs: **Won't do** (explicit non-goals) and **Ideas for later** (deferrable work).
25 | 6. Mark tasks done after tests pass. Append commit SHAs next to completed items.
26 | 7. After each milestone: run tests, update **Validation**, then commit `PLAN.md`.
27 | 
28 | ## Output format
29 | 
30 | - Update or create `PLAN.md` with the sections above.
31 | - Include a checklist for **Tasks**. Keep lines under 100 chars.
32 | 
33 | ## Examples
34 | **Input**: "Add OAuth login"
35 | 
36 | **Output**:
37 | 
38 | - Goal: Let users sign in with Google.
39 | - Tasks: [ ] add Google client, [ ] callback route, [ ] session, [ ] E2E test.
40 | - Won't do: org SSO.
41 | - Ideas for later: Apple login.
42 | 
43 | ## Notes
44 | 
45 | - Planning only. No code edits.
46 | - Assume a Git repo with test runner available.
47 | 
```

pr-desc.md
```
1 | ---
2 | phase: "P7 Release & Ops"
3 | gate: "Review Gate"
4 | status: "PR narrative ready for approvals and release prep."
5 | previous:
6 |   - "/review-branch"
7 | next:
8 |   - "/release-notes"
9 |   - "/version-proposal"
10 | ---
11 | 
12 | # PR Description
13 | 
14 | Trigger: /pr-desc <context>
15 | 
16 | Purpose: Draft a PR description from the branch diff.
17 | 
18 | You are a CLI assistant focused on helping contributors with the task: Draft a PR description from the branch diff.
19 | 
20 | 1. Gather context by running `git diff --name-status origin/main...HEAD` for the changed files (name + status); running `git diff --shortstat origin/main...HEAD` for the high‑level stats.
21 | 2. Create a crisp PR description following this structure: Summary, Context, Changes, Screenshots (if applicable), Risk, Test Plan, Rollback, Release Notes (if user‑facing). Base branch: origin/main User context: <args>.
22 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
23 | 
24 | Output:
25 | 
26 | - Begin with a concise summary that restates the goal: Draft a PR description from the branch diff.
27 | - Offer prioritized, actionable recommendations with rationale.
28 | - Call out test coverage gaps and validation steps.
29 | - Highlight workflow triggers, failing jobs, and proposed fixes.
30 | 
31 | Example Input:
32 | src/example.ts
33 | 
34 | Expected Output:
35 | 
36 | - Actionable summary aligned with the output section.
37 | 
```

prd-generator.md
```
1 | # PRD Generator
2 | Trigger: /prd-generate
3 | Purpose: Produce a complete `prd.txt` in the exact section order, headers, and tone of the inline example PRD using only the repository README and visible link texts.
4 | Steps:
5 | 
6 | 1. Read `README.md` at repo root; do not fetch external links.
7 | 2. Extract: product name, problem, target users, value, scope, constraints, features, flows, integrations, data, non-functional needs, risks.
8 | 3. If links exist, include their visible text or titles only as contextual hints.
9 | 4. Fill gaps with conservative assumptions to keep the PRD complete; collect assumptions for the Appendix.
10 | 5. Enforce strict structure identical to the example PRD’s top-level headers and order.
11 | 6. For each core feature, include What, Why, High-level How, and Acceptance criteria.
12 | 7. In Technical Architecture, document optional platform-specific features and required fallbacks; mirror related risks.
13 | 8. In Development Roadmap, group by phases (MVP and later); include acceptance criteria; exclude timelines.
14 | 9. In Logical Dependency Chain, order from foundations to visible value; keep items atomic.
15 | 10. Run an internal consistency check: features appear in roadmap; risks reflect platform and data concerns; all sections non-empty.
16 | 11. Output only the final `prd.txt` content starting with `# Overview` and ending with `# Appendix`.
17 | Output format:
18 | 
19 | - Plain text PRD starting with `# Overview` and ending with `# Appendix`.
20 | - No preamble, no postscript, no meta commentary.
21 | Notes:
22 | - Reject generation if `README.md` is missing.
23 | - Do not browse external sources.
24 | - Derived from example_prd.txt, extracted summaries only; secrets redacted.
```

prettier-adopt_Migration_report.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Plan a Prettier adoption or migration with minimal churn.
2 | 
3 | 1. Gather context by inspecting `package.json`; running `git ls-files '*.*' | sed -n '1,400p'`.
4 | 2. Given the files and package.json, propose a rollout plan and ignore patterns.
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Plan a Prettier adoption or migration with minimal churn.
10 | - Offer prioritized, actionable recommendations with rationale.
11 | - Document the evidence you used so maintainers can trust the conclusion.
12 | 
13 | Example Input:
14 | (none – command runs without arguments)
15 | 
16 | Expected Output:
17 | 
18 | - Structured report following the specified sections.
```

prototype-feature.md
```
1 | ---
2 | phase:
3 |   - "P1 Plan & Scope"
4 |   - "P2 App Scaffold & Contracts"
5 | gate: "Prototype review"
6 | status: "Validate spike outcomes before committing to scope."
7 | previous:
8 |   - "/planning-process"
9 | next:
10 |   - "/scaffold-fullstack"
11 |   - "/api-contract"
12 | ---
13 | 
14 | # Prototype Feature
15 | 
16 | Trigger: /prototype-feature
17 | 
18 | Purpose: Spin up a standalone prototype in a clean repo before merging into main.
19 | 
20 | ## Steps
21 | 
22 | 1. Create a scratch directory name suggestion and scaffolding commands.
23 | 2. Generate minimal app with only the feature and hardcoded data.
24 | 3. Add E2E test covering the prototype flow.
25 | 4. When validated, list the minimal patches to port back.
26 | 
27 | ## Output format
28 | 
29 | - Scaffold plan and migration notes.
30 | 
```

query-set.md
```
1 | # High-Yield Query Generator
2 | 
3 | Trigger: /query-set
4 | 
5 | Purpose: Generate 4–8 targeted web search queries with operators, entity variants, and recency filters for a given objective.
6 | 
7 | Steps:
8 | 
9 | 1. Restate the goal with entities and time window.
10 | 2. Produce queries using operators: site:, filetype:, inurl:, quotes, OR, date filters.
11 | 3. Include synonyms and common misspellings.
12 | 4. Mix intents: define, compare, integrate, configure, limitations, pricing, API, case study.
13 | 
14 | Output format:
15 | 
16 | ```
17 | ### Goal
18 | {1 sentence}
19 | 
20 | ### Query Set
21 | - {Q1}
22 | - {Q2}
23 | - … up to 8
24 | ```
25 | 
26 | Examples:
27 | 
28 | - Input: `/query-set "OpenAI Responses API streaming server-sent events" past year`
29 | - Output: Goal + 6–8 queries with operators.
30 | 
31 | Notes:
32 | 
33 | - No evidence logging here. Use /research-item to execute.
```

refactor-file.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Suggest targeted refactors for a single file.
2 | 
3 | 1. Gather context by running `sed -n '1,400p' {{args}}` for the first 400 lines of the file.
4 | 2. Suggest refactors that reduce complexity and improve readability without changing behavior. Provide before/after snippets.
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Suggest targeted refactors for a single file.
10 | - Include before/after snippets or diffs with commentary.
11 | - Document the evidence you used so maintainers can trust the conclusion.
12 | 
13 | Example Input:
14 | src/components/Button.tsx
15 | 
16 | Expected Output:
17 | 
18 | - Refactor proposal extracting shared styling hook with before/after snippet.
```

refactor-suggestions.md
```
1 | ---
2 | phase: "P8 Post-release Hardening"
3 | gate: "Post-release cleanup"
4 | status: "plan high-leverage refactors once Sev-1 issues settle."
5 | previous:
6 |   - "/fix"
7 | next:
8 |   - "/file-modularity"
9 |   - "/dead-code-scan"
10 | ---
11 | 
12 | # Refactor Suggestions
13 | 
14 | Trigger: /refactor-suggestions
15 | 
16 | Purpose: Propose repo-wide refactoring opportunities after tests exist.
17 | 
18 | ## Steps
19 | 
20 | 1. Map directory structure and large files.
21 | 2. Identify duplication, data clumps, and god objects.
22 | 3. Suggest phased refactors with safety checks and tests.
23 | 
24 | ## Output format
25 | 
26 | - Ranked list with owners and effort estimates.
27 | 
```

reference-implementation.md
```
1 | ---
2 | phase: "P2 App Scaffold & Contracts"
3 | gate: "Test Gate lite"
4 | status: "align new modules with proven patterns before deeper work."
5 | previous:
6 |   - "/scaffold-fullstack"
7 |   - "/api-contract"
8 | next:
9 |   - "/modular-architecture"
10 |   - "/openapi-generate"
11 | ---
12 | 
13 | # Reference Implementation
14 | 
15 | Trigger: /reference-implementation
16 | 
17 | Purpose: Mimic the style and API of a known working example.
18 | 
19 | ## Steps
20 | 
21 | 1. Accept a path or URL to an example. Extract its public API and patterns.
22 | 2. Map target module’s API to the reference.
23 | 3. Generate diffs that adopt the same structure and naming.
24 | 
25 | ## Output format
26 | 
27 | - Side-by-side API table and patch suggestions.
28 | 
```

regression-guard.md
```
1 | ---
2 | phase: "P5 Quality Gates & Tests"
3 | gate: "Test Gate"
4 | status: "regression coverage in place before CI hand-off."
5 | previous:
6 |   - "/coverage-guide"
7 | next:
8 |   - "/version-control-guide"
9 |   - "/devops-automation"
10 | ---
11 | 
12 | # Regression Guard
13 | 
14 | Trigger: /regression-guard
15 | 
16 | Purpose: Detect unrelated changes and add tests to prevent regressions.
17 | 
18 | ## Steps
19 | 
20 | 1. Run `git diff --name-status origin/main...HEAD` and highlight unrelated files.
21 | 2. Propose test cases that lock current behavior for touched modules.
22 | 3. Suggest CI checks to block large unrelated diffs.
23 | 
24 | ## Output format
25 | 
26 | - Report with file groups, risk notes, and test additions.
27 | 
28 | ## Notes
29 | 
30 | - Keep proposed tests minimal and focused.
31 | 
```

release-notes-prepare.md
```
1 | # Prepare Release Notes From CHANGELOG
2 | 
3 | Trigger: /release-notes-prepare
4 | 
5 | Purpose: Convert the latest CHANGELOG section into release notes suitable for GitHub Releases with the six-section layout.
6 | 
7 | Steps:
8 | 
9 | 1. Detect latest version heading and extract its section.
10 | 2. Normalize bullets to sentence fragments without trailing periods.
11 | 3. Add short highlights at top (3 bullets max) derived from Added/Changed.
12 | 4. Emit a "copy-ready" Markdown body.
13 | 
14 | Output format:
15 | 
16 | - Title line: `Release X.Y.Z — YYYY-MM-DD`
17 | - Highlights list
18 | - Six sections with bullets
19 | 
20 | Examples:
21 | Input → `/release-notes-prepare`
22 | Output →
23 | 
24 | ```
25 | Release 1.6.0 — 2025-09-22
26 | 
27 | **Highlights**
28 | - Custom roles and permissions
29 | - Faster cold starts
30 | 
31 | ### Added
32 | - Role-based access control
33 | ```
34 | 
35 | Notes:
36 | 
37 | - Strictly derived from `CHANGELOG.md`. Do not invent content.
38 | - If no version is found, fall back to Unreleased with a warning.
```

release-notes.md
```
1 | ---
2 | phase: "P7 Release & Ops"
3 | gate: "Release Gate"
4 | status: "notes compiled for staging review and production rollout."
5 | previous:
6 |   - "/pr-desc"
7 | next:
8 |   - "/version-proposal"
9 |   - "/monitoring-setup"
10 | ---
11 | 
12 | # Release Notes
13 | 
14 | Trigger: /release-notes <git-range>
15 | 
16 | Purpose: Generate human-readable release notes from recent commits.
17 | 
18 | You are a CLI assistant focused on helping contributors with the task: Generate human‑readable release notes from recent commits.
19 | 
20 | 1. Gather context by running `git log --pretty='* %s (%h) — %an' --no-merges {{args}}` for the commit log (no merges).
21 | 2. Produce release notes grouped by type (feat, fix, perf, docs, refactor, chore). Include a Highlights section and a full changelog list.
22 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
23 | 
24 | Output:
25 | 
26 | - Begin with a concise summary that restates the goal: Generate human‑readable release notes from recent commits.
27 | - Document the evidence you used so maintainers can trust the conclusion.
28 | 
29 | Example Input:
30 | src/example.ts
31 | 
32 | Expected Output:
33 | ## Features
34 | 
35 | - Add SSO login flow (PR #42)
36 | 
37 | ## Fixes
38 | 
39 | - Resolve logout crash (PR #57)
40 | 
```

research-batch.md
```
1 | # Conversation-Aware Research — Batch WBRO
2 | 
3 | Trigger: /research-batch
4 | 
5 | Purpose: Process a numbered work-breakdown list of objectives with carry-forward context across items and produce a roll-up summary.
6 | 
7 | Steps:
8 | 
9 | 1. Parse numbered WBRO items from the input after the trigger.
10 | 2. Before Item 1: list ≤5 bullets of starting context.
11 | 3. For each item i: execute the per-item workflow and include a Conversation State Update.
12 | 4. If blocked by prior gaps, emit **Dependency Blocked** with a minimal micro-query.
13 | 5. After all items: emit a Roll-up Summary with per-item status, enabled decisions, unresolved risks, and a domain-type count of sources.
14 | 
15 | Output format:
16 | 
17 | - Repeat the single-item format per item.
18 | - End with:
19 | 
20 | ```
21 | ## Roll-up Summary
22 | - Item {n}: {status} — decision enabled: {…}; risks: {…}
23 | - Sources by domain type: {gov, org, docs, blog, news}
24 | ```
25 | 
26 | Examples:
27 | 
28 | - Input: `/research-batch 1) Validate Next.js 15 stability. 2) Compare Bun vs Node for CI. 3) Licensing risks for MIT vs Apache-2.0.`
29 | - Output: Per-item sections plus roll-up.
30 | 
31 | Notes:
32 | 
33 | - Keep quotes ≤25 words. Prefer primary docs.
```

research-item.md
```
1 | # Conversation-Aware Research — Single Item
2 | 
3 | Trigger: /research-item
4 | 
5 | Purpose: Run the full per-item research workflow for one objective and return queries, evidence, synthesis, contradictions, gaps, decision hook, plus a conversation state update.
6 | 
7 | Steps:
8 | 
9 | 1. Read the objective text following the trigger.
10 | 2. Capture starting context if provided.
11 | 3. Apply the Process (per item): Goal, Assumptions, Query Set (4–8), Search Plan, Run & Capture, Cross-check, Synthesis, Gaps & Next, Decision Hook.
12 | 4. Track PubDate and Accessed (ISO) for every source; prefer primary docs.
13 | 5. Enforce quotes ≤25 words; mark inferences as "Inference".
14 | 
15 | Output format:
16 | 
17 | ```
18 | ## Item 1: {short title}
19 | 
20 | ### Goal
21 | {1 sentence}
22 | 
23 | ### Assumptions
24 | - {only if needed}
25 | 
26 | ### Query Set
27 | - {Q1}
28 | - {Q2}
29 | - {Q3}
30 | - {Q4–Q8}
31 | 
32 | ### Evidence Log
33 | | SourceID | Title | Publisher | URL | PubDate | Accessed | Quote (≤25w) | Finding | Rel | Conf |
34 | |---|---|---|---|---|---|---|---|---|---|
35 | 
36 | ### Synthesis
37 | - {claim with [S1,S3]}
38 | - {finding with [S2]}
39 | - {risk/edge with [S4]}
40 | 
41 | ### Contradictions
42 | - {S2 vs S5 → rationale}
43 | 
44 | ### Gaps & Next
45 | - {follow-up or test}
46 | 
47 | ### Decision Hook
48 | {one line}
49 | 
50 | ### Conversation State Update
51 | - New facts: {bullets}
52 | - Constraints learned: {bullets}
53 | - Entities normalized: {canonical forms}
54 | ```
55 | 
56 | Examples:
57 | 
58 | - Input: `/research-item Compare OpenAPI 3.1 tooling for Python clients in 2024; budget $0; prefer official docs.`
59 | - Output: As per format with SourceIDs and dates.
60 | 
61 | Notes:
62 | 
63 | - Safety: No personal data. Do not fabricate sources.
64 | - Provenance: Cite reputable sources; record n/a for missing PubDate.
```

reset-strategy.md
```
1 | ---
2 | phase: "Reset Playbook"
3 | gate: "Clean restart"
4 | status: "triggered when gate criteria stall for >60 minutes."
5 | previous:
6 |   - "Any blocked stage"
7 | next:
8 |   - "Restart with /planning-process then follow the gated flow"
9 | ---
10 | 
11 | # Reset Strategy
12 | 
13 | Trigger: /reset-strategy
14 | 
15 | Purpose: Decide when to hard reset and start clean to avoid layered bad diffs.
16 | 
17 | ## Steps
18 | 
19 | 1. Run: `git status -sb` and `git diff --stat` to assess churn.
20 | 2. If many unrelated edits or failing builds, propose: `git reset --hard HEAD` to discard working tree.
21 | 3. Save any valuable snippets to `scratch/` before reset.
22 | 4. Re-implement the minimal correct fix from a clean state.
23 | 
24 | ## Output format
25 | 
26 | - A short decision note and exact commands. Never execute resets automatically.
27 | 
28 | ## Examples
29 | 
30 | - Recommend reset after repeated failing refactors touching 15+ files.
31 | 
32 | ## Notes
33 | 
34 | - Warn about destructive nature. Require user confirmation.
35 | 
```

review-branch.md
```
1 | ---
2 | phase: "P7 Release & Ops"
3 | gate: "Review Gate"
4 | status: "branch scope validated before PR submission."
5 | previous:
6 |   - "/review"
7 | next:
8 |   - "/pr-desc"
9 |   - "/release-notes"
10 | ---
11 | 
12 | # Review Branch
13 | 
14 | Trigger: /review-branch
15 | 
16 | Purpose: Provide a high-level review of the current branch versus origin/main.
17 | 
18 | You are a CLI assistant focused on helping contributors with the task: Provide a high‑level review of the current branch vs origin/main.
19 | 
20 | 1. Gather context by running `git diff --stat origin/main...HEAD` for the diff stats; running `git diff origin/main...HEAD | sed -n '1,200p'` for the ```diff.
21 | 2. Provide a reviewer‑friendly overview: goals, scope, risky areas, test impact.
22 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
23 | 
24 | Output:
25 | 
26 | - Begin with a concise summary that restates the goal: Provide a high‑level review of the current branch vs origin/main.
27 | - Organize details under clear subheadings so contributors can scan quickly.
28 | - Call out test coverage gaps and validation steps.
29 | 
30 | Example Input:
31 | (none – command runs without arguments)
32 | 
33 | Expected Output:
34 | 
35 | - Structured report following the specified sections.
36 | 
```

review.md
```
1 | ---
2 | phase: "P7 Release & Ops"
3 | gate: "Review Gate"
4 | status: "peer review coverage met before merging."
5 | previous:
6 |   - "/owners"
7 | next:
8 |   - "/review-branch"
9 |   - "/pr-desc"
10 | ---
11 | 
12 | # Review
13 | 
14 | Trigger: /review <pattern>
15 | 
16 | Purpose: Review code matching a pattern and deliver actionable feedback.
17 | 
18 | You are a CLI assistant focused on helping contributors with the task: Review code matching a pattern and give actionable feedback.
19 | 
20 | 1. Gather context by running `rg -n {{args}} . || grep -RIn {{args}} .` for the search results for {{args}} (filename or regex).
21 | 2. Perform a thorough code review. Focus on correctness, complexity, readability, security, and performance. Provide concrete patch suggestions.
22 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
23 | 
24 | Output:
25 | 
26 | - Begin with a concise summary that restates the goal: Review code matching a pattern and give actionable feedback.
27 | - Provide unified diff-style patches when recommending code changes.
28 | - Organize details under clear subheadings so contributors can scan quickly.
29 | 
30 | Example Input:
31 | HttpClient
32 | 
33 | Expected Output:
34 | 
35 | - Usage cluster in src/network/* with note on inconsistent error handling.
36 | 
```

roll-up.md
```
1 | # Research Roll-up Summary
2 | 
3 | Trigger: /roll-up
4 | 
5 | Purpose: Summarize per-item statuses, enabled decisions, unresolved risks, and count sources by domain type.
6 | 
7 | Steps:
8 | 
9 | 1. Aggregate Conversation State Updates from prior items.
10 | 2. Produce per-item status lines and decisions.
11 | 3. Tally sources by domain type: gov, org, docs, blog, news, academic.
12 | 
13 | Output format:
14 | 
15 | ```
16 | ## Roll-up Summary
17 | - Item {n}: {status} — decision enabled: {…}; risks: {…}
18 | - Sources by domain type: {gov:X, org:Y, docs:Z, blog:A, news:B, academic:C}
19 | ```
20 | 
21 | Examples:
22 | 
23 | - Input: `/roll-up from items 1–3`
24 | - Output: Summary block as above.
25 | 
26 | Notes:
27 | 
28 | - Use counts derived from the Evidence Logs.
```

scaffold-fullstack.md
```
1 | ---
2 | phase: "P2 App Scaffold & Contracts"
3 | gate: "Test Gate lite"
4 | status: "ensure lint/build scripts execute on the generated scaffold."
5 | previous:
6 |   - "/stack-evaluation"
7 | next:
8 |   - "/api-contract"
9 |   - "/openapi-generate"
10 |   - "/modular-architecture"
11 | ---
12 | 
13 | # Scaffold Full‑Stack App
14 | 
15 | Trigger: /scaffold-fullstack <stack>
16 | 
17 | Purpose: Create a minimal, production-ready monorepo template with app, API, tests, CI seeds, and infra stubs.
18 | 
19 | **Steps:**
20 | 
21 | 1. Read repository context: `git rev-parse --is-inside-work-tree`.
22 | 2. If repo is empty, initialize: `git init -b main` and create `.editorconfig`, `.gitignore`, `README.md`.
23 | 3. For `<stack>` derive presets (examples):
24 |    - `ts-next-express-pg`: Next.js app, Express API, Prisma + PostgreSQL, Playwright, pnpm workspaces.
25 |    - `ts-vite-fastify-sqlite`: Vite + React app, Fastify API, Drizzle + SQLite.
26 | 4. Create workspace layout:
27 |    - root: `package.json` with `pnpm` workspaces, `tsconfig.base.json`, `eslint`, `prettier`.
28 |    - apps/web, apps/api, packages/ui, packages/config.
29 | 5. Add scripts:
30 |    - root: `dev`, `build`, `lint`, `typecheck`, `test`, `e2e`, `format`.
31 |    - web: Next/Vite scripts. api: dev with ts-node or tsx.
32 | 6. Seed CI files: `.github/workflows/ci.yml` with jobs [lint, typecheck, test, build, e2e] and artifact uploads.
33 | 7. Add example routes:
34 |    - web: `/health` page. api: `GET /health` returning `{ ok: true }`.
35 | 8. Write docs to `README.md`: how to run dev, test, build, and env variables.
36 | 9. Stage files, but do not commit. Output a tree and next commands.
37 | 
38 | **Output format:**
39 | 
40 | - Title line: `Scaffold created: <stack>`
41 | - Sections: `Repo Tree`, `Next Steps`, `CI Seeds`.
42 | - Include a fenced code block of the `tree` and sample scripts.
43 | 
44 | **Examples:**
45 | 
46 | - **Input:** `/scaffold-fullstack ts-next-express-pg`
47 |   **Output:** Summary + tree with `apps/web`, `apps/api`, `packages/ui`.
48 | - **Input:** `/scaffold-fullstack ts-vite-fastify-sqlite`
49 |   **Output:** Summary + tree + Drizzle config.
50 | 
51 | **Notes:**
52 | 
53 | - Assume pnpm and Node 20+. Do not run package installs automatically; propose commands instead.
54 | - Respect existing files; avoid overwriting without explicit confirmation.
55 | 
```

scope-control.md
```
1 | ---
2 | phase: "P1 Plan & Scope"
3 | gate: "Scope Gate"
4 | status: "Done criteria, scope lists, and stack choices are committed."
5 | previous:
6 |   - "/planning-process"
7 | next:
8 |   - "/stack-evaluation"
9 |   - "/scaffold-fullstack"
10 | ---
11 | 
12 | # Scope Control
13 | 
14 | Trigger: /scope-control
15 | 
16 | Purpose: Enforce explicit scope boundaries and maintain "won't do" and "ideas for later" lists.
17 | 
18 | ## Steps
19 | 
20 | 1. Parse `PLAN.md` or create it if absent.
21 | 2. For each open task, confirm linkage to the current milestone.
22 | 3. Detect off-scope items and move them to **Won't do** or **Ideas for later** with rationale.
23 | 4. Add a "Scope Gate" checklist before merging.
24 | 
25 | ## Output format
26 | 
27 | - Patch to `PLAN.md` showing changes in sections and checklists.
28 | 
29 | ## Examples
30 | Input: off-scope request "Add email templates" during OAuth feature.
31 | Output: Move to **Ideas for later** with reason "Not needed for OAuth MVP".
32 | 
33 | ## Notes
34 | 
35 | - Never add new scope without recording tradeoffs.
36 | 
```

slo-setup.md
```
1 | ---
2 | phase: "P7 Release & Ops"
3 | gate: "Release Gate"
4 | status: "SLOs and alerts reviewed before production rollout."
5 | previous:
6 |   - "/monitoring-setup"
7 | next:
8 |   - "/logging-strategy"
9 |   - "/audit"
10 | ---
11 | 
12 | # SLO Setup
13 | 
14 | Trigger: /slo-setup
15 | 
16 | Purpose: Define Service Level Objectives, burn alerts, and runbooks.
17 | 
18 | **Steps:**
19 | 
20 | 1. Choose SLI/metrics per user journey. Define SLO targets and error budgets.
21 | 2. Create burn alerts (fast/slow) and link to runbooks.
22 | 3. Add `SLO.md` with rationale and review cadence.
23 | 
24 | **Output format:** SLO table and alert rules snippet.
25 | 
26 | **Examples:** `/slo-setup`.
27 | 
28 | **Notes:** Tie SLOs to deploy gates and incident severity.
29 | 
```

stack-evaluation.md
```
1 | ---
2 | phase: "P1 Plan & Scope"
3 | gate: "Scope Gate"
4 | status: "record recommended stack and top risks before building."
5 | previous:
6 |   - "/scope-control"
7 | next:
8 |   - "/scaffold-fullstack"
9 |   - "/api-contract"
10 | ---
11 | 
12 | # Stack Evaluation
13 | 
14 | Trigger: /stack-evaluation
15 | 
16 | Purpose: Evaluate language/framework choices relative to AI familiarity and repo goals.
17 | 
18 | ## Steps
19 | 
20 | 1. Detect current stack and conventions.
21 | 2. List tradeoffs: maturity, tooling, available examples, hiring, and AI training coverage.
22 | 3. Recommend stay-or-switch with migration outline if switching.
23 | 
24 | ## Output format
25 | 
26 | - Decision memo with pros/cons and next steps.
27 | 
```

summary.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Produce a README‑level summary of the repo.
2 | 
3 | 1. Gather context by running `git ls-files | sed -n '1,400p'` for the repo map (first 400 files); inspecting `README.md` for the key docs if present; inspecting `docs` for the key docs if present.
4 | 2. Generate a high‑level summary (What, Why, How, Getting Started).
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Produce a README‑level summary of the repo.
10 | - Document the evidence you used so maintainers can trust the conclusion.
11 | 
12 | Example Input:
13 | (none – command runs without arguments)
14 | 
15 | Expected Output:
16 | 
17 | - Structured report following the specified sections.
```

switch-model.md
```
1 | ---
2 | phase: "P9 Model Tactics"
3 | gate: "Model uplift"
4 | status: "document rollback/guardrails before flipping defaults."
5 | previous:
6 |   - "/compare-outputs"
7 | next:
8 |   - "Return to the blocked stage (e.g., /integration-test) to apply learnings"
9 | ---
10 | 
11 | # Switch Model
12 | 
13 | Trigger: /switch-model
14 | 
15 | Purpose: Decide when to try a different AI backend and how to compare.
16 | 
17 | ## Steps
18 | 
19 | 1. Define task type: frontend codegen, backend reasoning, test writing, refactor.
20 | 2. Select candidate models and temperature/tooling options.
21 | 3. Run a fixed input suite and measure latency, compile success, and edits needed.
22 | 4. Recommend a model per task with rationale.
23 | 
24 | ## Output format
25 | 
26 | - Table: task → model → settings → win reason.
27 | 
```

system-level-instruction-editor.md
```
1 | ---
2 | phase: "P0 Preflight Docs"
3 | gate: "DocFetchReport"
4 | status: "Canonical instruction editor guardrail prepared for use."
5 | owner: "Prompts Team"
6 | date: "2024-09-01"
7 | previous:
8 |   - "/instruction-file"
9 | next:
10 |   - "/planning-process"
11 |   - "/scope-control"
12 | tags:
13 |   - "documentation"
14 |   - "preflight"
15 | ---
16 | 
17 | # System Instruction: Canonical Instruction File Editor
18 | 
19 | Trigger: /system-instruction-editor
20 | 
21 | Purpose: Publish the canonical system instruction guardrail before work begins.
22 | 
23 | ## Inputs
24 | 
25 | - Latest DocFetchReport summary and approvals.
26 | - Existing instruction artifacts (`cursor.rules`, `windsurf.rules`, `claude.md`).
27 | - Safety, legal, or policy updates provided by stakeholders.
28 | - Outstanding TODOs or follow-ups from prior instruction reviews.
29 | - Version control diffs for instruction-related files.
30 | 
31 | ## Steps
32 | 
33 | 1. Gather the current instruction artifacts and diff them against the repo baseline.
34 | 2. Capture required additions/removals from DocFetchReport or stakeholder feedback.
35 | 3. Update the canonical instruction file, keeping sections organized and annotated.
36 | 4. Flag any sections needing follow-up review or approvals.
37 | 5. Commit the updated instruction file and notify owners of changes.
```

tm-advance.md
```
1 | # Advance Task(s)
2 | 
3 | Trigger: /tm-advance
4 | 
5 | Purpose: For given task id(s), produce a concrete work plan, acceptance criteria, tests, and a Conventional Commits message to move status toward done.
6 | 
7 | Steps:
8 | 
9 | 1. Read tasks.json; resolve each provided id. If none provided, pick the top item from /tm-next.
10 | 2. For each task: restate title, goals, and related dependencies.
11 | 3. Draft a step-by-step plan with file touch-points and test hooks.
12 | 4. Provide a minimal commit plan and a Conventional Commits message with scope and short body.
13 | 5. List measurable acceptance criteria.
14 | 
15 | Output format:
16 | 
17 | - One section per task: "## <id> — <title>"
18 | - Subsections: Plan, Files, Tests, Acceptance, Commit Message (fenced), Risks.
19 | 
20 | Examples:
21 | 
22 | - Input: /tm-advance TM-42 TM-43
23 | - Output: structured sections with a commit message like `feat(parser): implement rule X`.
24 | 
25 | Notes:
26 | 
27 | - Do not mutate tasks.json. Emit proposed changes only.
```

tm-blockers.md
```
1 | # Blocker Diagnosis
2 | 
3 | Trigger: /tm-blockers
4 | 
5 | Purpose: Diagnose why a task is blocked and propose the shortest path to unblock it.
6 | 
7 | Steps:
8 | 
9 | 1. Load tasks.json and the target id.
10 | 2. Enumerate unmet dependencies and missing artifacts (tests, docs, approvals).
11 | 3. Classify each blocker: dependency, ambiguity, environment, CI, external.
12 | 4. Propose 1–3 minimal unblocking actions, each with owner, effort, and success check.
13 | 
14 | Output format:
15 | 
16 | - "# Blocker Report: <id>"
17 | - Tables: blockers (type | item | evidence), actions (step | owner | effort | success_criteria).
18 | 
19 | Examples:
20 | 
21 | - Input: /tm-blockers TM-17
22 | - Output: two tables and a short narrative under "Findings".
23 | 
24 | Notes:
25 | 
26 | - If the task is not actually blocked, state why and redirect to /tm-advance.
```

tm-ci.md
```
1 | # CI/Test Checklist from Tasks
2 | 
3 | Trigger: /tm-ci
4 | 
5 | Purpose: Derive a near-term CI and test checklist from ready and in-progress tasks.
6 | 
7 | Steps:
8 | 
9 | 1. Compute ready tasks (see /tm-next) and collect any testStrategy fields.
10 | 2. Group by component or tag if available; otherwise by path keywords in titles.
11 | 3. Propose CI jobs and test commands with approximate runtimes and gating rules.
12 | 4. Include a smoke-test matrix and minimal code coverage targets if relevant.
13 | 
14 | Output format:
15 | 
16 | - "# CI Plan"
17 | - Tables: jobs (name | trigger | commands | est_time) and tests (scope | command | expected_artifacts).
18 | - "## Risk Areas" bullets and "## Follow-ups".
19 | 
20 | Examples:
21 | 
22 | - Input: /tm-ci
23 | - Output: one CI plan with 3–8 jobs and a test table.
24 | 
25 | Notes:
26 | 
27 | - Non-binding guidance. Adapt to the repo’s actual CI system.
```

tm-delta.md
```
1 | # PRD → Tasks Delta
2 | 
3 | Trigger: /tm-delta
4 | 
5 | Purpose: Compare a PRD text against tasks.json and propose add/update/remove operations.
6 | 
7 | Steps:
8 | 
9 | 1. Accept PRD content pasted by the user or a path like ./prd.txt. If absent, output a short template asking for PRD input.
10 | 2. Extract objectives, constraints, deliverables, and milestones from the PRD.
11 | 3. Map them to existing tasks by fuzzy match on title and keywords; detect gaps.
12 | 4. Propose: new tasks, updates to titles/descriptions/priority, and deprecations.
13 | 
14 | Output format:
15 | 
16 | - "# Delta Summary"
17 | - Tables: adds | updates | removals.
18 | - "## JSON Patch" with an ordered list of operations: add/replace/remove.
19 | - "## Assumptions" and "## Open Questions".
20 | 
21 | Examples:
22 | 
23 | - Input: /tm-delta ./prd.txt
24 | - Output: tables with a small JSON Patch block.
25 | 
26 | Notes:
27 | 
28 | - Keep patches minimal and reversible. Flag any destructive changes explicitly.
```

tm-docs.md
```
1 | # Generate Status Docs
2 | 
3 | Trigger: /tm-docs
4 | 
5 | Purpose: Emit a project status document from tasks.json for README or STATUS.md.
6 | 
7 | Steps:
8 | 
9 | 1. Parse tasks.json; collect done, in_progress, blocked, and ready_next (per /tm-next logic).
10 | 2. Compose a concise narrative: current focus, recent wins, top risks.
11 | 3. Produce status boards for each status with id, title, and owner if present.
12 | 4. Add a 7-day changelog if timestamps exist; otherwise, summarize recent done items.
13 | 
14 | Output format:
15 | 
16 | - "# Project Status — <date>"
17 | - Sections: Summary, Ready Next, In Progress, Blocked, Done, Changelog.
18 | 
19 | Examples:
20 | 
21 | - Input: /tm-docs
22 | - Output: a single Markdown document suitable for commit as STATUS.md.
23 | 
24 | Notes:
25 | 
26 | - Avoid leaking secrets. Do not invent owners; omit unknown fields.
```

tm-next.md
```
1 | # Next Ready Tasks
2 | 
3 | Trigger: /tm-next
4 | 
5 | Purpose: List tasks that are ready to start now (no unmet dependencies), ordered by priority and dependency depth.
6 | 
7 | Steps:
8 | 
9 | 1. Load tasks.json and build a map of id → task.
10 | 2. A task is ready if status ∈ {pending, blocked} AND all dependencies are done.
11 | 3. Order by: priority desc, then shortest path length to completion, then title.
12 | 4. For each ready task, include why it is ready and the prerequisites satisfied.
13 | 
14 | Output format:
15 | 
16 | - "# Ready Now"
17 | - Table: id | title | priority | why_ready | prereqs
18 | - "## Notes" for tie-break rules and data gaps.
19 | 
20 | Examples:
21 | 
22 | - Input: /tm-next
23 | - Output: a table of 5–20 items. If none, say "No ready tasks" and list nearest-unblock candidates.
24 | 
25 | Notes:
26 | 
27 | - Treat missing or null priority as 0. If custom scales exist, describe them in Notes.
```

tm-overview.md
```
1 | # TaskMaster Overview
2 | 
3 | Trigger: /tm-overview
4 | 
5 | Purpose: Summarize the current TaskMaster tasks.json by status, priority, dependency health, and critical path to orient work.
6 | 
7 | Steps:
8 | 
9 | 1. Locate the active tasks.json at repo root or the path supplied in the user message. Do not modify it.
10 | 2. Parse fields: id, title, description, status, priority, dependencies, subtasks.
11 | 3. Compute counts per status and a table of top pending items by priority.
12 | 4. Detect dependency issues: cycles, missing ids, orphans (no deps and not depended on).
13 | 5. Approximate a critical path: longest dependency chain among pending→in_progress tasks.
14 | 
15 | Output format:
16 | 
17 | - "# Overview" then a bullets summary.
18 | - "## Totals" as a 4-column table: status | count | percent | notes.
19 | - "## Top Pending" table: id | title | priority | unblockers.
20 | - "## Critical Path" as an ordered list of ids with short titles.
21 | - "## Issues" list for cycles, missing references, duplicates.
22 | 
23 | Examples:
24 | 
25 | - Input (Codex TUI): /tm-overview
26 | - Output: tables and lists as specified. Keep to <= 200 lines.
27 | 
28 | Notes:
29 | 
30 | - Read-only. Assume statuses: pending | in_progress | blocked | done.
31 | - If tasks.json is missing or invalid, output an "## Errors" section with a concise diagnosis.
```

tm-refine.md
```
1 | # Refine Task into Subtasks
2 | 
3 | Trigger: /tm-refine
4 | 
5 | Purpose: Expand a vague or large task into actionable subtasks with clear acceptance criteria.
6 | 
7 | Steps:
8 | 
9 | 1. Load the task by id and analyze description for ambiguity and scope.
10 | 2. Propose 3–8 subtasks with titles, brief descriptions, and dependencies between them.
11 | 3. Define acceptance criteria per subtask using Given/When/Then or bullet checks.
12 | 4. Suggest test coverage and doc updates triggered by completion.
13 | 
14 | Output format:
15 | 
16 | - "# Refinement: <id>"
17 | - Subtasks as a Markdown table: id_suggested | title | depends_on | acceptance.
18 | - "## JSON Patch" fenced code of suggested additions suitable for tasks.json editing.
19 | 
20 | Examples:
21 | 
22 | - Input: /tm-refine TM-09
23 | - Output: table plus a minimal JSON Patch array.
24 | 
25 | Notes:
26 | 
27 | - Do not assume authority to change files; provide patches the user can apply.
```

todo-report.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Summarize TODO/FIXME/XXX annotations across the codebase.
2 | 
3 | 1. Gather context by running `rg -n "TODO|FIXME|XXX" -g '!node_modules' . || grep -RInE 'TODO|FIXME|XXX' .`.
4 | 2. Aggregate and group TODO/FIXME/XXX by area and priority. Propose a triage plan.
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Summarize TODO/FIXME/XXX annotations across the codebase.
10 | - Offer prioritized, actionable recommendations with rationale.
11 | - Organize details under clear subheadings so contributors can scan quickly.
12 | 
13 | Example Input:
14 | (none – command runs without arguments)
15 | 
16 | Expected Output:
17 | 
18 | - Group: Platform backlog — 4 TODOs referencing auth migration (owner: @platform).
```

todos.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Find and group TODO/FIXME annotations.
2 | 
3 | 1. Gather context by running `rg -n "TODO|FIXME" -g '!node_modules' . || grep -RInE 'TODO|FIXME' .`.
4 | 2. Find and group TODO/FIXME annotations.
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Find and group TODO/FIXME annotations.
10 | - Document the evidence you used so maintainers can trust the conclusion.
11 | 
12 | Example Input:
13 | (none – command runs without arguments)
14 | 
15 | Expected Output:
16 | 
17 | - Group: Platform backlog — 4 TODOs referencing auth migration (owner: @platform).
```

tsconfig-review.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Review tsconfig for correctness and DX.
2 | 
3 | 1. Gather context by inspecting `tsconfig.json`.
4 | 2. Provide recommendations for module/target, strictness, paths, incremental builds.
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Review tsconfig for correctness and DX.
10 | - Offer prioritized, actionable recommendations with rationale.
11 | - Document the evidence you used so maintainers can trust the conclusion.
12 | 
13 | Example Input:
14 | (none – command runs without arguments)
15 | 
16 | Expected Output:
17 | 
18 | - Structured report following the specified sections.
```

tsconfig.build.json
```
1 | {
2 |   "extends": "./tsconfig.json",
3 |   "compilerOptions": {
4 |     "target": "ES2022",
5 |     "module": "NodeNext",
6 |     "moduleResolution": "NodeNext",
7 |     "outDir": "./dist",
8 |     "rootDir": "./src",
9 |     "resolveJsonModule": true,
10 |     "types": ["node"],
11 |     "importHelpers": false,
12 |     "noEmit": false,
13 |     "allowImportingTsExtensions": false
14 |   },
15 |   "include": ["src/**/*.ts"],
16 |   "exclude": ["src/**/*.test.ts"]
17 | }
```

tsconfig.json
```
1 | {
2 |   "compilerOptions": {
3 |     "target": "ES2022",
4 |     "module": "NodeNext",
5 |     "moduleResolution": "NodeNext",
6 |     "esModuleInterop": true,
7 |     "forceConsistentCasingInFileNames": true,
8 |     "strict": true,
9 |     "isolatedModules": true,
10 |     "skipLibCheck": true,
11 |     "resolveJsonModule": true,
12 |     "types": ["node"],
13 |     "allowImportingTsExtensions": true
14 |   },
15 |   "ts-node": {
16 |     "esm": true,
17 |     "experimentalSpecifierResolution": "node"
18 |   },
19 |   "include": [
20 |     "scripts/**/*.ts",
21 |     "src/**/*.ts",
22 |     "test/**/*.ts",
23 |     "tests/**/*.ts"
24 |   ]
25 | }
```

ui-screenshots.md
```
1 | ---
2 | phase: "P4 Frontend UX"
3 | gate: "Accessibility checks queued"
4 | status: "capture UX issues and backlog fixes."
5 | previous:
6 |   - "/design-assets"
7 |   - "/modular-architecture"
8 | next:
9 |   - "/logging-strategy"
10 |   - "/e2e-runner-setup"
11 | ---
12 | 
13 | # UI Screenshots
14 | 
15 | Trigger: /ui-screenshots
16 | 
17 | Purpose: Analyze screenshots for UI bugs or inspiration and propose actionable UI changes.
18 | 
19 | ## Steps
20 | 
21 | 1. Accept screenshot paths or links.
22 | 2. Describe visual hierarchy, spacing, contrast, and alignment issues.
23 | 3. Output concrete CSS or component changes.
24 | 
25 | ## Output format
26 | 
27 | - Issue list and code snippets to fix visuals.
28 | 
```

update-changelog.md
```
1 | # Update CHANGELOG
2 | 
3 | Trigger: /update-changelog
4 | 
5 | Purpose: Generate a user-facing CHANGELOG entry for the latest merge range and insert under the correct version or Unreleased with the six standard sections.
6 | 
7 | Steps:
8 | 
9 | 1. Inspect repo state:
10 |    - Detect current branch and latest tag: `git describe --tags --abbrev=0`.
11 |    - Identify range: `${SINCE:-<latest-tag>}..HEAD`. If a merge commit hash or tag is provided, use that.
12 | 2. Collect changes:
13 |    - Prefer Conventional Commits in `git log --pretty=%s %b` over the range.
14 |    - Map commit types to sections: feat→Added, perf/refactor→Changed, deprecate→Deprecated, remove→Removed, fix→Fixed, security→Security.
15 |    - Merge PR titles: `git log --merges --pretty=%s` and include PR numbers.
16 | 3. De-dupe and rewrite:
17 |    - Collapse internal-only chatter. Use terse, user-facing wording. No file paths unless end-user relevant.
18 |    - Keep bullets short. One line each. Present tense. No trailing periods.
19 | 4. Emit Markdown snippet with the six sections. Omit empty sections.
20 | 5. Decide placement:
21 |    - If a release tag was created in this merge, use `## [X.Y.Z] - YYYY-MM-DD`.
22 |    - Else place under `## [Unreleased]`.
23 | 6. Provide a unified diff showing insertion into `CHANGELOG.md`. Do not run it; just output the patch.
24 | 
25 | Output format:
26 | 
27 | - Heading line with target section (Unreleased or version)
28 | - Six-section block in Markdown with only non-empty sections in order: Added, Changed, Deprecated, Removed, Fixed, Security
29 | - A short "Link references" block suggestion for `[Unreleased]` and new version comparison links
30 | - A unified diff (context 3) for `CHANGELOG.md`
31 | 
32 | Examples:
33 | Input →
34 | 
35 | ```
36 | /update-changelog since=v1.4.2 notes=include-prs
37 | ```
38 | 
39 | Output →
40 | 
41 | ```
42 | ## [Unreleased]
43 | ### Added
44 | - Export CSV from reports page (#482)
45 | 
46 | ### Changed
47 | - Speed up dashboard load times on first visit (#479)
48 | 
49 | ### Fixed
50 | - Resolve 500 error when saving profile with empty bio (#481)
51 | 
52 | [Unreleased]: https://github.com/OWNER/REPO/compare/v1.4.2...HEAD
53 | ```
54 | 
55 | Notes:
56 | 
57 | - Assumes git repository is available and tags follow SemVer.
58 | - Keep content end-user focused. Avoid internal file names and refactor notes.
59 | - If no Conventional Commits, infer section from message heuristics.
60 | - Do not include secrets or internal ticket links.
```

version-control-guide.md
```
1 | ---
2 | phase: "P6 CI/CD & Env"
3 | gate: "Review Gate"
4 | status: "clean diff, CI green, and approvals ready."
5 | previous:
6 |   - "/regression-guard"
7 | next:
8 |   - "/devops-automation"
9 |   - "/env-setup"
10 | ---
11 | 
12 | # Version Control Guide
13 | 
14 | Trigger: /version-control-guide
15 | 
16 | Purpose: Enforce clean incremental commits and clean-room re-implementation when finalizing.
17 | 
18 | ## Steps
19 | 
20 | 1. Start each feature from a clean branch: `git switch -c <feat>`.
21 | 2. Commit in vertical slices with passing tests: `git add -p && git commit`.
22 | 3. When solution is proven, recreate a minimal clean diff: stash or copy results, reset, then apply only the final changes.
23 | 4. Use `git revert` for bad commits instead of force-pushing shared branches.
24 | 
25 | ## Output format
26 | 
27 | - Checklist plus suggested commands for the current repo state.
28 | 
29 | ## Examples
30 | 
31 | - Convert messy spike into three commits: setup, feature, tests.
32 | 
33 | ## Notes
34 | 
35 | - Never modify remote branches without confirmation.
36 | 
```

version-proposal.md
```
1 | ---
2 | phase: "P7 Release & Ops"
3 | gate: "Release Gate"
4 | status: "version bump decision recorded before deployment."
5 | previous:
6 |   - "/release-notes"
7 | next:
8 |   - "/monitoring-setup"
9 |   - "/slo-setup"
10 | ---
11 | 
12 | # Version Proposal
13 | 
14 | Trigger: /version-proposal
15 | 
16 | Purpose: Propose the next semantic version based on commit history.
17 | 
18 | You are a CLI assistant focused on helping contributors with the task: Propose next version (major/minor/patch) from commit history.
19 | 
20 | 1. Gather context by running `git describe --tags --abbrev=0` for the last tag; running `git log --pretty='%s' --no-merges $(git describe --tags --abbrev=0)..HEAD` for the commits since last tag (no merges).
21 | 2. Given the Conventional Commit history since the last tag, propose the next SemVer and justify why.
22 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
23 | 
24 | Output:
25 | 
26 | - Begin with a concise summary that restates the goal: Propose next version (major/minor/patch) from commit history.
27 | - Offer prioritized, actionable recommendations with rationale.
28 | - Document the evidence you used so maintainers can trust the conclusion.
29 | 
30 | Example Input:
31 | (none – command runs without arguments)
32 | 
33 | Expected Output:
34 | 
35 | - Structured report following the specified sections.
36 | 
```

vibe-coders.md
```
1 | # YC Guide to Vibe Coding
2 | 
3 | ## Planning Process
4 | 
5 | - **Create a comprehensive plan**: Start by working with the AI to write a detailed implementation plan in a markdown file.
6 | - **Review and refine**: Delete unnecessary items, mark features as *won’t do* if too complex.
7 | - **Maintain scope control**: Keep a separate section for *ideas for later* to stay focused.
8 | - **Implement incrementally**: Work section by section rather than attempting to build everything at once.
9 | - **Track progress**: Have the AI mark sections as complete after successful implementation.
10 | - **Commit regularly**: Ensure each working section is committed to Git before moving to the next.
11 | 
12 | ---
13 | 
14 | ## Version Control Strategies
15 | 
16 | - **Use Git religiously**: Don’t rely solely on the AI tools’ revert functionality.
17 | - **Start clean**: Begin each new feature with a clean Git slate.
18 | - **Reset when stuck**: Use `git reset --hard HEAD` if the AI goes on a vision quest.
19 | - **Avoid cumulative problems**: Multiple failed attempts create layers of bad code.
20 | - **Clean implementation**: When you finally find a solution, reset and implement it cleanly.
21 | 
22 | ---
23 | 
24 | ## Testing Framework
25 | 
26 | - **Prioritize high-level tests**: Focus on end-to-end integration tests over unit tests.
27 | - **Simulate user behavior**: Test features by simulating someone clicking through the site/app.
28 | - **Catch regressions**: LLMs often make unnecessary changes to unrelated logic.
29 | - **Test before proceeding**: Ensure tests pass before moving to the next feature.
30 | - **Use tests as guardrails**: Some founders recommend starting with test cases to provide clear boundaries.
31 | 
32 | ---
33 | 
34 | ## Effective Bug Fixing
35 | 
36 | - **Leverage error messages**: Simply copy-pasting error messages is often enough for the AI.
37 | - **Analyze before coding**: Ask the AI to consider multiple possible causes.
38 | - **Reset after failures**: Start with a clean slate after each unsuccessful fix attempt.
39 | - **Implement logging**: Add strategic logging to better understand what’s happening.
40 | - **Switch models**: Try different AI models when one gets stuck.
41 | - **Clean implementation**: Once you identify the fix, reset and implement it on a clean codebase.
42 | 
43 | ---
44 | 
45 | ## AI Tool Optimization
46 | 
47 | - **Create instruction files**: Write detailed instructions for your AI in appropriate files (`cursor.rules`, `windsurf.rules`, `claude.md`).
48 | - **Local documentation**: Download API documentation to your project folder for accuracy.
49 | - **Use multiple tools**: Some founders run both Cursor and Windsurf simultaneously on the same project.
50 | - **Tool specialization**: Cursor is a bit faster for frontend work, while Windsurf thinks longer.
51 | - **Compare outputs**: Generate multiple solutions and pick the best one.
52 | 
53 | ---
54 | 
55 | ## Complex Feature Development
56 | 
57 | - **Create standalone prototypes**: Build complex features in a clean codebase first.
58 | - **Use reference implementations**: Point the AI to working examples to follow.
59 | - **Clear boundaries**: Maintain consistent external APIs while allowing internal changes.
60 | - **Modular architecture**: Service-based architectures with clear boundaries work better than monorepos.
61 | 
62 | ---
63 | 
64 | ## Tech Stack Considerations
65 | 
66 | - **Established frameworks excel**: Ruby on Rails works well due to 20 years of consistent conventions.
67 | - **Training data matters**: Newer languages like Rust or Elixir may have less training data.
68 | - **Modularity is key**: Small, modular files are easier for both humans and AIs to work with.
69 | - **Avoid large files**: Don’t have files that are thousands of lines long.
70 | 
71 | ---
72 | 
73 | ## Beyond Coding
74 | 
75 | - **DevOps automation**: Use AI for configuring servers, DNS, and hosting.
76 | - **Design assistance**: Generate favicons and other design elements.
77 | - **Content creation**: Draft documentation and marketing materials.
78 | - **Educational tool**: Ask the AI to explain implementations line by line.
79 | - **Use screenshots**: Share UI bugs or design inspiration visually.
80 | - **Voice input**: Tools like Aqua enable 140 words per minute input.
81 | 
82 | ---
83 | 
84 | ## Continuous Improvement
85 | 
86 | - **Regular refactoring**: Once tests are in place, refactor frequently.
87 | - **Identify opportunities**: Ask the AI to find refactoring candidates.
88 | - **Stay current**: Try every new model release.
89 | - **Recognize strengths**: Different models excel at different tasks.
```

voice-input.md
```
1 | ---
2 | phase: "Support"
3 | gate: "Support intake"
4 | status: "Clarify voice-derived requests before invoking gated prompts."
5 | previous:
6 |   - "Voice transcript capture"
7 | next:
8 |   - "Any stage-specific command (e.g., /planning-process)"
9 | ---
10 | 
11 | # Voice Input
12 | 
13 | Trigger: /voice-input
14 | 
15 | Purpose: Support interaction from voice capture and convert to structured prompts.
16 | 
17 | ## Steps
18 | 
19 | 1. Accept transcript text.
20 | 2. Normalize to tasks or commands for other prompts.
21 | 3. Preserve speaker intents and important entities.
22 | 
23 | ## Output format
24 | 
25 | - Cleaned command list ready to execute.
26 | 
```

workflow.mmd
```
1 | flowchart TD
2 |   subgraph phase_p0_preflight_docs["P0 Preflight Docs"]
3 |     cmd_instruction_file[//instruction-file/]
4 |   end
5 |   subgraph phase_p1_plan_scope["P1 Plan & Scope"]
6 |     cmd_planning_process[//planning-process/]
7 |     cmd_prototype_feature[//prototype-feature/]
8 |     cmd_scope_control[//scope-control/]
9 |     cmd_stack_evaluation[//stack-evaluation/]
10 |   end
11 |   subgraph phase_p2_app_scaffold_contracts["P2 App Scaffold & Contracts"]
12 |     cmd_api_contract___feature_or_domain__[//api-contract "<feature or domain>"/]
13 |     cmd_api_docs_local[//api-docs-local/]
14 |     cmd_openapi_generate__server_client___lang___spec_path_[//openapi-generate <server|client> <lang> <spec-path>/]
15 |     cmd_reference_implementation[//reference-implementation/]
16 |     cmd_scaffold_fullstack__stack_[//scaffold-fullstack <stack>/]
17 |   end
18 |   subgraph phase_p3_data_auth["P3 Data & Auth"]
19 |     cmd_auth_scaffold__oauth_email_oidc_[//auth-scaffold <oauth|email|oidc>/]
20 |     cmd_db_bootstrap__postgres_mysql_sqlite_mongodb_[//db-bootstrap <postgres|mysql|sqlite|mongodb>/]
21 |     cmd_migration_plan___change_summary__[//migration-plan "<change summary>"/]
22 |   end
23 |   subgraph phase_p4_frontend_ux["P4 Frontend UX"]
24 |     cmd_design_assets[//design-assets/]
25 |     cmd_ui_screenshots[//ui-screenshots/]
26 |   end
27 |   subgraph phase_p5_quality_gates_tests["P5 Quality Gates & Tests"]
28 |     cmd_coverage_guide[//coverage-guide/]
29 |     cmd_e2e_runner_setup__playwright_cypress_[//e2e-runner-setup <playwright|cypress>/]
30 |     cmd_generate__source_file_[//generate <source-file>/]
31 |     cmd_integration_test[//integration-test/]
32 |     cmd_regression_guard[//regression-guard/]
33 |   end
34 |   subgraph phase_p6_ci_cd_env["P6 CI/CD & Env"]
35 |     cmd_devops_automation[//devops-automation/]
36 |     cmd_env_setup[//env-setup/]
37 |     cmd_iac_bootstrap__aws_gcp_azure_fly_render_[//iac-bootstrap <aws|gcp|azure|fly|render>/]
38 |     cmd_secrets_manager_setup__provider_[//secrets-manager-setup <provider>/]
39 |     cmd_version_control_guide[//version-control-guide/]
40 |     cmd_commit[/commit/]
41 |   end
42 |   subgraph phase_p7_release_ops["P7 Release & Ops"]
43 |     cmd_audit[//audit/]
44 |     cmd_explain_code[//explain-code/]
45 |     cmd_monitoring_setup[//monitoring-setup/]
46 |     cmd_owners__path_[//owners <path>/]
47 |     cmd_pr_desc__context_[//pr-desc <context>/]
48 |     cmd_release_notes__git_range_[//release-notes <git-range>/]
49 |     cmd_review__pattern_[//review <pattern>/]
50 |     cmd_review_branch[//review-branch/]
51 |     cmd_slo_setup[//slo-setup/]
52 |     cmd_version_proposal[//version-proposal/]
53 |   end
54 |   subgraph phase_p8_post_release_hardening["P8 Post-release Hardening"]
55 |     cmd_cleanup_branches[//cleanup-branches/]
56 |     cmd_dead_code_scan[//dead-code-scan/]
57 |     cmd_error_analysis[//error-analysis/]
58 |     cmd_feature_flags__provider_[//feature-flags <provider>/]
59 |     cmd_file_modularity[//file-modularity/]
60 |     cmd_fix___bug_summary__[//fix "<bug summary>"/]
61 |     cmd_refactor_suggestions[//refactor-suggestions/]
62 |   end
63 |   subgraph phase_p9_model_tactics["P9 Model Tactics"]
64 |     cmd_compare_outputs[//compare-outputs/]
65 |     cmd_model_evaluation[//model-evaluation/]
66 |     cmd_model_strengths[//model-strengths/]
67 |     cmd_switch_model[//switch-model/]
68 |   end
69 |   subgraph phase_11_evidence_log["11) Evidence Log"]
70 |     cmd_content_generation[//content-generation/]
71 |   end
72 |   subgraph phase_reset_playbook["Reset Playbook"]
73 |     cmd_reset_strategy[//reset-strategy/]
74 |   end
75 |   subgraph phase_support["Support"]
76 |     cmd_voice_input[//voice-input/]
77 |   end
78 |   cmd_audit --> cmd_error_analysis
79 |   cmd_auth_scaffold__oauth_email_oidc_ --> cmd_ui_screenshots
80 |   cmd_cleanup_branches --> cmd_model_strengths
81 |   cmd_commit --> cmd_devops_automation
82 |   cmd_commit --> cmd_env_setup
83 |   cmd_compare_outputs --> cmd_switch_model
84 |   cmd_coverage_guide --> cmd_regression_guard
85 |   cmd_coverage_guide --> cmd_version_control_guide
86 |   cmd_dead_code_scan --> cmd_cleanup_branches
87 |   cmd_design_assets --> cmd_ui_screenshots
88 |   cmd_devops_automation --> cmd_env_setup
89 |   cmd_e2e_runner_setup__playwright_cypress_ --> cmd_coverage_guide
90 |   cmd_e2e_runner_setup__playwright_cypress_ --> cmd_integration_test
91 |   cmd_error_analysis --> cmd_refactor_suggestions
92 |   cmd_explain_code --> cmd_review_branch
93 |   cmd_feature_flags__provider_ --> cmd_model_evaluation
94 |   cmd_feature_flags__provider_ --> cmd_model_strengths
95 |   cmd_file_modularity --> cmd_cleanup_branches
96 |   cmd_file_modularity --> cmd_dead_code_scan
97 |   cmd_fix___bug_summary__ --> cmd_file_modularity
98 |   cmd_fix___bug_summary__ --> cmd_refactor_suggestions
99 |   cmd_generate__source_file_ --> cmd_regression_guard
100 |   cmd_instruction_file --> cmd_planning_process
101 |   cmd_instruction_file --> cmd_scope_control
102 |   cmd_integration_test --> cmd_coverage_guide
103 |   cmd_integration_test --> cmd_regression_guard
104 |   cmd_model_evaluation --> cmd_compare_outputs
105 |   cmd_model_evaluation --> cmd_switch_model
106 |   cmd_model_strengths --> cmd_compare_outputs
107 |   cmd_model_strengths --> cmd_model_evaluation
108 |   cmd_monitoring_setup --> cmd_slo_setup
109 |   cmd_owners__path_ --> cmd_review_branch
110 |   cmd_planning_process --> cmd_scope_control
111 |   cmd_planning_process --> cmd_stack_evaluation
112 |   cmd_pr_desc__context_ --> cmd_version_proposal
113 |   cmd_refactor_suggestions --> cmd_dead_code_scan
114 |   cmd_refactor_suggestions --> cmd_file_modularity
115 |   cmd_regression_guard --> cmd_devops_automation
116 |   cmd_regression_guard --> cmd_version_control_guide
117 |   cmd_release_notes__git_range_ --> cmd_monitoring_setup
118 |   cmd_release_notes__git_range_ --> cmd_version_proposal
119 |   cmd_review__pattern_ --> cmd_review_branch
120 |   cmd_scope_control --> cmd_stack_evaluation
121 |   cmd_slo_setup --> cmd_audit
122 |   cmd_version_control_guide --> cmd_devops_automation
123 |   cmd_version_control_guide --> cmd_env_setup
124 |   cmd_version_proposal --> cmd_monitoring_setup
125 |   cmd_version_proposal --> cmd_slo_setup
```

.gemini/settings.json
```
1 | {
2 | 	"mcpServers": {
3 | 		"task-master-ai": {
4 | 			"command": "npx",
5 | 			"args": ["-y", "--package=task-master-ai", "task-master-ai"],
6 | 			"env": {
7 | 				"ANTHROPIC_API_KEY": "YOUR_ANTHROPIC_API_KEY_HERE",
8 | 				"PERPLEXITY_API_KEY": "YOUR_PERPLEXITY_API_KEY_HERE",
9 | 				"OPENAI_API_KEY": "YOUR_OPENAI_KEY_HERE",
10 | 				"GOOGLE_API_KEY": "YOUR_GOOGLE_KEY_HERE",
11 | 				"XAI_API_KEY": "YOUR_XAI_KEY_HERE",
12 | 				"OPENROUTER_API_KEY": "YOUR_OPENROUTER_KEY_HERE",
13 | 				"MISTRAL_API_KEY": "YOUR_MISTRAL_KEY_HERE",
14 | 				"AZURE_OPENAI_API_KEY": "YOUR_AZURE_KEY_HERE",
15 | 				"OLLAMA_API_KEY": "YOUR_OLLAMA_API_KEY_HERE"
16 | 			}
17 | 		}
18 | 	}
19 | }
```

.taskmaster/AGENTS.md
```
1 | # Task Master AI - Agent Integration Guide
2 | 
3 | ## Essential Commands
4 | 
5 | ### Core Workflow Commands
6 | 
7 | ```bash
8 | # Project Setup
9 | task-master init                                    # Initialize Task Master in current project
10 | task-master parse-prd .taskmaster/docs/prd.txt      # Generate tasks from PRD document
11 | task-master models --setup                        # Configure AI models interactively
12 | 
13 | # Daily Development Workflow
14 | task-master list                                   # Show all tasks with status
15 | task-master next                                   # Get next available task to work on
16 | task-master show <id>                             # View detailed task information (e.g., task-master show 1.2)
17 | task-master set-status --id=<id> --status=done    # Mark task complete
18 | 
19 | # Task Management
20 | task-master add-task --prompt="description" --research        # Add new task with AI assistance
21 | task-master expand --id=<id> --research --force              # Break task into subtasks
22 | task-master update-task --id=<id> --prompt="changes"         # Update specific task
23 | task-master update --from=<id> --prompt="changes"            # Update multiple tasks from ID onwards
24 | task-master update-subtask --id=<id> --prompt="notes"        # Add implementation notes to subtask
25 | 
26 | # Analysis & Planning
27 | task-master analyze-complexity --research          # Analyze task complexity
28 | task-master complexity-report                      # View complexity analysis
29 | task-master expand --all --research               # Expand all eligible tasks
30 | 
31 | # Dependencies & Organization
32 | task-master add-dependency --id=<id> --depends-on=<id>       # Add task dependency
33 | task-master move --from=<id> --to=<id>                       # Reorganize task hierarchy
34 | task-master validate-dependencies                            # Check for dependency issues
35 | task-master generate                                         # Update task markdown files (usually auto-called)
36 | ```
37 | 
38 | ## Key Files & Project Structure
39 | 
40 | ### Core Files
41 | 
42 | - `.taskmaster/tasks/tasks.json` - Main task data file (auto-managed)
43 | - `.taskmaster/config.json` - AI model configuration (use `task-master models` to modify)
44 | - `.taskmaster/docs/prd.txt` - Product Requirements Document for parsing
45 | - `.taskmaster/tasks/*.txt` - Individual task files (auto-generated from tasks.json)
46 | - `.env` - API keys for CLI usage
47 | 
48 | ### Claude Code Integration Files
49 | 
50 | - `CLAUDE.md` - Auto-loaded context for Claude Code (this file)
51 | - `.claude/settings.json` - Claude Code tool allowlist and preferences
52 | - `.claude/commands/` - Custom slash commands for repeated workflows
53 | - `.mcp.json` - MCP server configuration (project-specific)
54 | 
55 | ### Directory Structure
56 | 
57 | ```
58 | project/
59 | ├── .taskmaster/
60 | │   ├── tasks/              # Task files directory
61 | │   │   ├── tasks.json      # Main task database
62 | │   │   ├── task-1.md      # Individual task files
63 | │   │   └── task-2.md
64 | │   ├── docs/              # Documentation directory
65 | │   │   ├── prd.txt        # Product requirements
66 | │   ├── reports/           # Analysis reports directory
67 | │   │   └── task-complexity-report.json
68 | │   ├── templates/         # Template files
69 | │   │   └── example_prd.txt  # Example PRD template
70 | │   └── config.json        # AI models & settings
71 | ├── .claude/
72 | │   ├── settings.json      # Claude Code configuration
73 | │   └── commands/         # Custom slash commands
74 | ├── .env                  # API keys
75 | ├── .mcp.json            # MCP configuration
76 | └── CLAUDE.md            # This file - auto-loaded by Claude Code
77 | ```
78 | 
79 | ## MCP Integration
80 | 
81 | Task Master provides an MCP server that Claude Code can connect to. Configure in `.mcp.json`:
82 | 
83 | ```json
84 | {
85 |   "mcpServers": {
86 |     "task-master-ai": {
87 |       "command": "npx",
88 |       "args": ["-y", "--package=task-master-ai", "task-master-ai"],
89 |       "env": {
90 |         "ANTHROPIC_API_KEY": "your_key_here",
91 |         "PERPLEXITY_API_KEY": "your_key_here",
92 |         "OPENAI_API_KEY": "OPENAI_API_KEY_HERE",
93 |         "GOOGLE_API_KEY": "GOOGLE_API_KEY_HERE",
94 |         "XAI_API_KEY": "XAI_API_KEY_HERE",
95 |         "OPENROUTER_API_KEY": "OPENROUTER_API_KEY_HERE",
96 |         "MISTRAL_API_KEY": "MISTRAL_API_KEY_HERE",
97 |         "AZURE_OPENAI_API_KEY": "AZURE_OPENAI_API_KEY_HERE",
98 |         "OLLAMA_API_KEY": "OLLAMA_API_KEY_HERE"
99 |       }
100 |     }
101 |   }
102 | }
103 | ```
104 | 
105 | ### Essential MCP Tools
106 | 
107 | ```javascript
108 | help; // = shows available taskmaster commands
109 | // Project setup
110 | initialize_project; // = task-master init
111 | parse_prd; // = task-master parse-prd
112 | 
113 | // Daily workflow
114 | get_tasks; // = task-master list
115 | next_task; // = task-master next
116 | get_task; // = task-master show <id>
117 | set_task_status; // = task-master set-status
118 | 
119 | // Task management
120 | add_task; // = task-master add-task
121 | expand_task; // = task-master expand
122 | update_task; // = task-master update-task
123 | update_subtask; // = task-master update-subtask
124 | update; // = task-master update
125 | 
126 | // Analysis
127 | analyze_project_complexity; // = task-master analyze-complexity
128 | complexity_report; // = task-master complexity-report
129 | ```
130 | 
131 | ## Claude Code Workflow Integration
132 | 
133 | ### Standard Development Workflow
134 | 
135 | #### 1. Project Initialization
136 | 
137 | ```bash
138 | # Initialize Task Master
139 | task-master init
140 | 
141 | # Create or obtain PRD, then parse it
142 | task-master parse-prd .taskmaster/docs/prd.txt
143 | 
144 | # Analyze complexity and expand tasks
145 | task-master analyze-complexity --research
146 | task-master expand --all --research
147 | ```
148 | 
149 | If tasks already exist, another PRD can be parsed (with new information only!) using parse-prd with --append flag. This will add the generated tasks to the existing list of tasks..
150 | 
151 | #### 2. Daily Development Loop
152 | 
153 | ```bash
154 | # Start each session
155 | task-master next                           # Find next available task
156 | task-master show <id>                     # Review task details
157 | 
158 | # During implementation, check in code context into the tasks and subtasks
159 | task-master update-subtask --id=<id> --prompt="implementation notes..."
160 | 
161 | # Complete tasks
162 | task-master set-status --id=<id> --status=done
163 | ```
164 | 
165 | #### 3. Multi-Claude Workflows
166 | 
167 | For complex projects, use multiple Claude Code sessions:
168 | 
169 | ```bash
170 | # Terminal 1: Main implementation
171 | cd project && claude
172 | 
173 | # Terminal 2: Testing and validation
174 | cd project-test-worktree && claude
175 | 
176 | # Terminal 3: Documentation updates
177 | cd project-docs-worktree && claude
178 | ```
179 | 
180 | ### Custom Slash Commands
181 | 
182 | Create `.claude/commands/taskmaster-next.md`:
183 | 
184 | ```markdown
185 | Find the next available Task Master task and show its details.
186 | 
187 | Steps:
188 | 
189 | 1. Run `task-master next` to get the next task
190 | 2. If a task is available, run `task-master show <id>` for full details
191 | 3. Provide a summary of what needs to be implemented
192 | 4. Suggest the first implementation step
193 | ```
194 | 
195 | Create `.claude/commands/taskmaster-complete.md`:
196 | 
197 | ```markdown
198 | Complete a Task Master task: $ARGUMENTS
199 | 
200 | Steps:
201 | 
202 | 1. Review the current task with `task-master show $ARGUMENTS`
203 | 2. Verify all implementation is complete
204 | 3. Run any tests related to this task
205 | 4. Mark as complete: `task-master set-status --id=$ARGUMENTS --status=done`
206 | 5. Show the next available task with `task-master next`
207 | ```
208 | 
209 | ## Tool Allowlist Recommendations
210 | 
211 | Add to `.claude/settings.json`:
212 | 
213 | ```json
214 | {
215 |   "allowedTools": [
216 |     "Edit",
217 |     "Bash(task-master *)",
218 |     "Bash(git commit:*)",
219 |     "Bash(git add:*)",
220 |     "Bash(npm run *)",
221 |     "mcp__task_master_ai__*"
222 |   ]
223 | }
224 | ```
225 | 
226 | ## Configuration & Setup
227 | 
228 | ### API Keys Required
229 | 
230 | At least **one** of these API keys must be configured:
231 | 
232 | - `ANTHROPIC_API_KEY` (Claude models) - **Recommended**
233 | - `PERPLEXITY_API_KEY` (Research features) - **Highly recommended**
234 | - `OPENAI_API_KEY` (GPT models)
235 | - `GOOGLE_API_KEY` (Gemini models)
236 | - `MISTRAL_API_KEY` (Mistral models)
237 | - `OPENROUTER_API_KEY` (Multiple models)
238 | - `XAI_API_KEY` (Grok models)
239 | 
240 | An API key is required for any provider used across any of the 3 roles defined in the `models` command.
241 | 
242 | ### Model Configuration
243 | 
244 | ```bash
245 | # Interactive setup (recommended)
246 | task-master models --setup
247 | 
248 | # Set specific models
249 | task-master models --set-main claude-3-5-sonnet-20241022
250 | task-master models --set-research perplexity-llama-3.1-sonar-large-128k-online
251 | task-master models --set-fallback gpt-4o-mini
252 | ```
253 | 
254 | ## Task Structure & IDs
255 | 
256 | ### Task ID Format
257 | 
258 | - Main tasks: `1`, `2`, `3`, etc.
259 | - Subtasks: `1.1`, `1.2`, `2.1`, etc.
260 | - Sub-subtasks: `1.1.1`, `1.1.2`, etc.
261 | 
262 | ### Task Status Values
263 | 
264 | - `pending` - Ready to work on
265 | - `in-progress` - Currently being worked on
266 | - `done` - Completed and verified
267 | - `deferred` - Postponed
268 | - `cancelled` - No longer needed
269 | - `blocked` - Waiting on external factors
270 | 
271 | ### Task Fields
272 | 
273 | ```json
274 | {
275 |   "id": "1.2",
276 |   "title": "Implement user authentication",
277 |   "description": "Set up JWT-based auth system",
278 |   "status": "pending",
279 |   "priority": "high",
280 |   "dependencies": ["1.1"],
281 |   "details": "Use bcrypt for hashing, JWT for tokens...",
282 |   "testStrategy": "Unit tests for auth functions, integration tests for login flow",
283 |   "subtasks": []
284 | }
285 | ```
286 | 
287 | ## Claude Code Best Practices with Task Master
288 | 
289 | ### Context Management
290 | 
291 | - Use `/clear` between different tasks to maintain focus
292 | - This CLAUDE.md file is automatically loaded for context
293 | - Use `task-master show <id>` to pull specific task context when needed
294 | 
295 | ### Iterative Implementation
296 | 
297 | 1. `task-master show <subtask-id>` - Understand requirements
298 | 2. Explore codebase and plan implementation
299 | 3. `task-master update-subtask --id=<id> --prompt="detailed plan"` - Log plan
300 | 4. `task-master set-status --id=<id> --status=in-progress` - Start work
301 | 5. Implement code following logged plan
302 | 6. `task-master update-subtask --id=<id> --prompt="what worked/didn't work"` - Log progress
303 | 7. `task-master set-status --id=<id> --status=done` - Complete task
304 | 
305 | ### Complex Workflows with Checklists
306 | 
307 | For large migrations or multi-step processes:
308 | 
309 | 1. Create a markdown PRD file describing the new changes: `touch task-migration-checklist.md` (prds can be .txt or .md)
310 | 2. Use Taskmaster to parse the new prd with `task-master parse-prd --append` (also available in MCP)
311 | 3. Use Taskmaster to expand the newly generated tasks into subtasks. Consdier using `analyze-complexity` with the correct --to and --from IDs (the new ids) to identify the ideal subtask amounts for each task. Then expand them.
312 | 4. Work through items systematically, checking them off as completed
313 | 5. Use `task-master update-subtask` to log progress on each task/subtask and/or updating/researching them before/during implementation if getting stuck
314 | 
315 | ### Git Integration
316 | 
317 | Task Master works well with `gh` CLI:
318 | 
319 | ```bash
320 | # Create PR for completed task
321 | gh pr create --title "Complete task 1.2: User authentication" --body "Implements JWT auth system as specified in task 1.2"
322 | 
323 | # Reference task in commits
324 | git commit -m "feat: implement JWT auth (task 1.2)"
325 | ```
326 | 
327 | ### Parallel Development with Git Worktrees
328 | 
329 | ```bash
330 | # Create worktrees for parallel task development
331 | git worktree add ../project-auth feature/auth-system
332 | git worktree add ../project-api feature/api-refactor
333 | 
334 | # Run Claude Code in each worktree
335 | cd ../project-auth && claude    # Terminal 1: Auth work
336 | cd ../project-api && claude     # Terminal 2: API work
337 | ```
338 | 
339 | ## Troubleshooting
340 | 
341 | ### AI Commands Failing
342 | 
343 | ```bash
344 | # Check API keys are configured
345 | cat .env                           # For CLI usage
346 | 
347 | # Verify model configuration
348 | task-master models
349 | 
350 | # Test with different model
351 | task-master models --set-fallback gpt-4o-mini
352 | ```
353 | 
354 | ### MCP Connection Issues
355 | 
356 | - Check `.mcp.json` configuration
357 | - Verify Node.js installation
358 | - Use `--mcp-debug` flag when starting Claude Code
359 | - Use CLI as fallback if MCP unavailable
360 | 
361 | ### Task File Sync Issues
362 | 
363 | ```bash
364 | # Regenerate task files from tasks.json
365 | task-master generate
366 | 
367 | # Fix dependency issues
368 | task-master fix-dependencies
369 | ```
370 | 
371 | DO NOT RE-INITIALIZE. That will not do anything beyond re-adding the same Taskmaster core files.
372 | 
373 | ## Important Notes
374 | 
375 | ### AI-Powered Operations
376 | 
377 | These commands make AI calls and may take up to a minute:
378 | 
379 | - `parse_prd` / `task-master parse-prd`
380 | - `analyze_project_complexity` / `task-master analyze-complexity`
381 | - `expand_task` / `task-master expand`
382 | - `expand_all` / `task-master expand --all`
383 | - `add_task` / `task-master add-task`
384 | - `update` / `task-master update`
385 | - `update_task` / `task-master update-task`
386 | - `update_subtask` / `task-master update-subtask`
387 | 
388 | ### File Management
389 | 
390 | - Never manually edit `tasks.json` - use commands instead
391 | - Never manually edit `.taskmaster/config.json` - use `task-master models`
392 | - Task markdown files in `tasks/` are auto-generated
393 | - Run `task-master generate` after manual changes to tasks.json
394 | 
395 | ### Claude Code Session Management
396 | 
397 | - Use `/clear` frequently to maintain focused context
398 | - Create custom slash commands for repeated Task Master workflows
399 | - Configure tool allowlist to streamline permissions
400 | - Use headless mode for automation: `claude -p "task-master next"`
401 | 
402 | ### Multi-Task Updates
403 | 
404 | - Use `update --from=<id>` to update multiple future tasks
405 | - Use `update-task --id=<id>` for single task updates
406 | - Use `update-subtask --id=<id>` for implementation logging
407 | 
408 | ### Research Mode
409 | 
410 | - Add `--research` flag for research-based AI enhancement
411 | - Requires a research model API key like Perplexity (`PERPLEXITY_API_KEY`) in environment
412 | - Provides more informed task creation and updates
413 | - Recommended for complex technical tasks
414 | 
415 | ---
416 | 
417 | _This guide ensures Claude Code has immediate access to Task Master's essential functionality for agentic development workflows._
```

.taskmaster/config.json
```
1 | {
2 |   "models": {
3 |     "main": {
4 |       "provider": "gemini-cli",
5 |       "modelId": "gemini-2.5-pro",
6 |       "maxTokens": 65536,
7 |       "temperature": 0.2
8 |     },
9 |     "research": {
10 |       "provider": "gemini-cli",
11 |       "modelId": "gemini-2.5-pro",
12 |       "maxTokens": 65536,
13 |       "temperature": 0.1
14 |     },
15 |     "fallback": {
16 |       "provider": "gemini-cli",
17 |       "modelId": "gemini-2.5-pro",
18 |       "maxTokens": 65536,
19 |       "temperature": 0.2
20 |     }
21 |   },
22 |   "global": {
23 |     "logLevel": "info",
24 |     "debug": false,
25 |     "defaultNumTasks": 10,
26 |     "defaultSubtasks": 5,
27 |     "defaultPriority": "medium",
28 |     "projectName": "Taskmaster",
29 |     "ollamaBaseURL": "http://localhost:11434/api",
30 |     "bedrockBaseURL": "https://bedrock.us-east-1.amazonaws.com",
31 |     "responseLanguage": "English",
32 |     "enableCodebaseAnalysis": true,
33 |     "defaultTag": "master",
34 |     "azureOpenaiBaseURL": "https://your-endpoint.openai.azure.com/",
35 |     "userId": "1234567890"
36 |   },
37 |   "claudeCode": {}
38 | }
```

.taskmaster/state.json
```
1 | {
2 |   "currentTag": "master",
3 |   "lastSwitched": "2025-09-18T03:26:17.935Z",
4 |   "branchTagMapping": {},
5 |   "migrationNoticeShown": true
6 | }
```

MCP/Ingest Task-Master schema.md
```
1 | Starting context:
2 | 
3 | - Goal: make `AcidicSoil/prompts` ingest Task-Master artifacts, run its own state engine, expose MCP + CLI, and plug into Mastra.
4 | - Time: 2025-09-21 America/Chicago. Facts must be current.
5 | - Constraints: prefer primary docs and repo READMEs; no repo cloning needed.
6 | - Output must include per-item query sets and evidence with dates.
7 | - Windows+WSL path note: use `/c/Users/user/...` when showing local paths.
8 | 
9 | ## Item 1: Ingest Task-Master and run `prompts` state engine
10 | 
11 | ### Goal
12 | 
13 | Confirm Task-Master `tasks.json` fields and “next” semantics so `prompts` can mirror schema 1:1 and compute readiness and updates.
14 | 
15 | ### Assumptions
16 | 
17 | - “Superset” means `prompts` can add fields but must preserve Task-Master names and types.
18 | 
19 | ### Query Set
20 | 
21 | - site\:docs.task-master.dev "Task Structure" tasks.json fields
22 | - site\:docs.task-master.dev "next" command semantics dependency readiness
23 | - site\:docs.task-master.dev MCP tools list “next\_task” or similar
24 | - site\:github.com eyaltoledano/claude-task-master tasks.json schema file or issue
25 | - "Task Master" complexity report JSON location
26 | - "Task Master" CLI "validate-dependencies" docs
27 | - site\:docs.task-master.dev "CLI Commands" task statuses
28 | - site\:docs.task-master.dev "Advanced Tasks" dependencies rules
29 | 
30 | ### Evidence Log
31 | 
32 | | SourceID | Title                                           | Publisher        | URL                                                                                                                            | PubDate    | Accessed   | Quote (≤25w)                                                                                                                                 | Finding                                          | Rel | Conf |
33 | | -------- | ----------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | --- | ---- |
34 | | S1.1     | Task Structure                                  | Task Master Docs | [https://docs.task-master.dev/capabilities/task-structure](https://docs.task-master.dev/capabilities/task-structure)           | n/a        | 2025-09-21 | “Tasks in tasks.json have the following structure: id, title, description, status, dependencies, priority, details, testStrategy, subtasks.” | Confirms exact field names and examples.         | H   | 0.95 |
35 | | S1.2     | Task Structure → Finding the Next Task          | Task Master Docs | [https://docs.task-master.dev/capabilities/task-structure](https://docs.task-master.dev/capabilities/task-structure)           | n/a        | 2025-09-21 | “Identifies tasks… with all dependencies satisfied. Prioritizes by priority, dependency count, and task ID.”                                 | Readiness and prioritization rules for `next`.   | H   | 0.9  |
36 | | S1.3     | MCP Tools                                       | Task Master Docs | [https://docs.task-master.dev/capabilities/mcp](https://docs.task-master.dev/capabilities/mcp)                                 | n/a        | 2025-09-21 | “MCP interface… exposes core functionalities as a set of tools… ‘next\_task’, ‘set\_task\_status’, …”                                        | Confirms MCP tool surface including next/status. | H   | 0.9  |
37 | | S1.4     | Improve documentation… Create tasks.schema.json | GitHub Issue     | [https://github.com/eyaltoledano/claude-task-master/issues/363](https://github.com/eyaltoledano/claude-task-master/issues/363) | 2025-04-30 | 2025-09-21 | “Create `tasks.schema.json` – a JSON Schema describing… `tasks.json`.”                                                                       | Evidence of schema formalization.                | M   | 0.7  |
38 | 
39 | ### Synthesis
40 | 
41 | - Task-Master defines `tasks.json` with fields: `id,title,description,status,dependencies,priority,details,testStrategy,subtasks`. Mirror names and types. \[S1.1]
42 | - `next` selects tasks whose dependencies are satisfied and orders by priority, dependency count, then ID. Encode same logic. \[S1.2]
43 | - MCP surface already includes next/status; parity tools in `prompts` are feasible. \[S1.3]
44 | - A JSON Schema exists or is planned; use it as baseline for superset `schemas/task.json`. \[S1.4]
45 | 
46 | ### Contradictions
47 | 
48 | - None material for fields; schema issue shows intent, not a final spec. Treat as advisory vs. canonical.
49 | 
50 | ### Gaps & Next
51 | 
52 | - Fetch a concrete `tasks.schema.json` once published; validate types and enums.
53 | - Confirm allowed `status` values set (pending, in\_progress, blocked, done) vs Task-Master (“pending”, “done”, “deferred”). Add mapping.
54 | 
55 | ### Decision Hook
56 | 
57 | Proceed to implement `schemas/task.json` superset and `next()` readiness identical to Task-Master.
58 | 
59 | ---
60 | 
61 | ## Item 2: Ship a CLI for shell use
62 | 
63 | ### Goal
64 | 
65 | Select a Node CLI framework and output options for `bin/prompts` with subcommands mapped to shared core.
66 | 
67 | ### Query Set
68 | 
69 | - commander.js GitHub README features and install
70 | - oclif docs introduction and commands API
71 | - oclif packaging/auto-update installers
72 | - Graphviz DOT language reference for `graph --format dot`
73 | - AI SDK or general Node CLI best practices flags/subcommands
74 | 
75 | ### Evidence Log
76 | 
77 | | SourceID | Title        | Publisher  | URL                                                                                      | PubDate    | Accessed   | Quote                                                                   | Finding                                 | Rel | Conf |
78 | | -------- | ------------ | ---------- | ---------------------------------------------------------------------------------------- | ---------- | ---------- | ----------------------------------------------------------------------- | --------------------------------------- | --- | ---- |
79 | | S2.1     | commander.js | GitHub     | [https://github.com/tj/commander.js](https://github.com/tj/commander.js)                 | n/a        | 2025-09-21 | “parsing the arguments… implements a help system.”                      | Commander fits thin CLIs.               | H   | 0.9  |
80 | | S2.2     | Introduction | oclif Docs | [https://oclif.github.io/docs/introduction/](https://oclif.github.io/docs/introduction/) | 2025-08-25 | 2025-09-21 | “framework for building command-line interfaces… capable of much more.” | oclif for larger CLIs.                  | H   | 0.85 |
81 | | S2.3     | Features     | oclif Docs | [https://oclif.github.io/docs/features](https://oclif.github.io/docs/features)           | 2025-08-25 | 2025-09-21 | “package your CLI into installers… auto-updatable.”                     | oclif supports installers/auto-update.  | M   | 0.8  |
82 | | S2.4     | DOT Language | Graphviz   | [https://graphviz.org/doc/info/lang.html](https://graphviz.org/doc/info/lang.html)       | 2024-09-28 | 2025-09-21 | “DOT assumes the UTF-8 character encoding.”                             | DOT reference for `graph --format dot`. | M   | 0.9  |
83 | 
84 | ### Synthesis
85 | 
86 | - Use **Commander** for a thin CLI that wraps shared core. Low overhead. \[S2.1]
87 | - If installers and plugin system become needs, migrate to **oclif**. \[S2.2–S2.3]
88 | - Output `graph --format dot` per Graphviz DOT spec. \[S2.4]
89 | 
90 | ### Contradictions
91 | 
92 | - None.
93 | 
94 | ### Gaps & Next
95 | 
96 | - Decide if Windows MSI/homebrew tap is required; if yes, favor oclif.
97 | 
98 | ### Decision Hook
99 | 
100 | Start with Commander now; keep code layout compatible with later oclif migration.
101 | 
102 | ---
103 | 
104 | ## Item 3: Wire Mastra as the agentic layer
105 | 
106 | ### Goal
107 | 
108 | Verify Mastra supports AI SDK providers and tool registration so `prompts` can expose tools to a Mastra agent.
109 | 
110 | ### Query Set
111 | 
112 | - mastra.ai docs “Using Vercel AI SDK”
113 | - Mastra examples for AI SDK v5 integration
114 | - Mastra blog post on AI SDK integration
115 | - Mastra model providers page
116 | 
117 | ### Evidence Log
118 | 
119 | | SourceID | Title                             | Publisher   | URL                                                                                                                | PubDate    | Accessed   | Quote                                                                         | Finding                         | Rel | Conf |
120 | | -------- | --------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------ | ---------- | ---------- | ----------------------------------------------------------------------------- | ------------------------------- | --- | ---- |
121 | | S3.1     | Using Vercel AI SDK               | Mastra Docs | [https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk](https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk)       | n/a        | 2025-09-21 | “Mastra integrates with Vercel’s AI SDK… specify any AI SDK-supported model.” | Confirms provider layer.        | H   | 0.9  |
122 | | S3.2     | Example: AI SDK v5 Integration    | Mastra Docs | [https://mastra.ai/examples/agents/ai-sdk-v5-integration](https://mastra.ai/examples/agents/ai-sdk-v5-integration) | n/a        | 2025-09-21 | “integrate Mastra agents with AI SDK v5… tool integration.”                   | Shows v5 interop pattern.       | H   | 0.9  |
123 | | S3.3     | Using Vercel’s AI SDK with Mastra | Mastra Blog | [https://mastra.ai/blog/using-ai-sdk-with-mastra](https://mastra.ai/blog/using-ai-sdk-with-mastra)                 | 2025-02-13 | 2025-09-21 | “built Mastra as a framework on top of the AI SDK.”                           | Architectural confirmation.     | M   | 0.85 |
124 | | S3.4     | Model Providers                   | Mastra Docs | [https://mastra.ai/docs/getting-started/model-providers](https://mastra.ai/docs/getting-started/model-providers)   | n/a        | 2025-09-21 | “AI SDK model providers are packages… install … for a different provider.”    | Provider installation guidance. | M   | 0.8  |
125 | 
126 | ### Synthesis
127 | 
128 | - Mastra layers on the Vercel AI SDK. It accepts any AI-SDK model provider. \[S3.1–S3.4]
129 | - Tools register on agents; wiring matches your `prompts-tools` plan. \[S3.2]
130 | 
131 | ### Contradictions
132 | 
133 | - None.
134 | 
135 | ### Gaps & Next
136 | 
137 | - Confirm Node version alignment (Mastra requires Node ≥18). Document in README.
138 | 
139 | ### Decision Hook
140 | 
141 | Implement `packages/prompts-tools` and register in a Mastra agent using AI-SDK providers.
142 | 
143 | ---
144 | 
145 | ## Item 4: Zero-cost model options for Mastra
146 | 
147 | ### Goal
148 | 
149 | List viable free or local providers for Mastra via AI SDK: Ollama and Gemini CLI.
150 | 
151 | ### Query Set
152 | 
153 | - ai-sdk.dev community providers: ollama
154 | - npm “ai-sdk-ollama” or “ollama-ai-provider”
155 | - Gemini CLI provider page on ai-sdk.dev
156 | - Gemini CLI provider GitHub readme
157 | 
158 | ### Evidence Log
159 | 
160 | | SourceID | Title                          | Publisher   | URL                                                                                                                        | PubDate    | Accessed   | Quote                                                                           | Finding                                  | Rel | Conf |
161 | | -------- | ------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | ------------------------------------------------------------------------------- | ---------------------------------------- | --- | ---- |
162 | | S4.1     | Community Providers: Ollama    | AI SDK Docs | [https://ai-sdk.dev/providers/community-providers/ollama](https://ai-sdk.dev/providers/community-providers/ollama)         | n/a        | 2025-09-21 | “Uses the official `ollama` npm package… Full TypeScript support.”              | Confirms Ollama provider exists.         | H   | 0.9  |
163 | | S4.2     | ai-sdk-ollama                  | npm         | [https://www.npmjs.com/package/ai-sdk-ollama](https://www.npmjs.com/package/ai-sdk-ollama)                                 | 2025-08-17 | 2025-09-21 | “provider for Ollama built on the official ollama package.”                     | Reinforces Ollama provider availability. | M   | 0.8  |
164 | | S4.3     | Gemini CLI Provider            | AI SDK Docs | [https://ai-sdk.dev/providers/community-providers/gemini-cli](https://ai-sdk.dev/providers/community-providers/gemini-cli) | n/a        | 2025-09-21 | “enables using Google’s Gemini models through… Gemini CLI.”                     | Confirms Gemini-CLI provider.            | H   | 0.9  |
165 | | S4.4     | AI SDK Provider for Gemini CLI | GitHub      | [https://github.com/ben-vargas/ai-sdk-provider-gemini-cli](https://github.com/ben-vargas/ai-sdk-provider-gemini-cli)       | 2025-07-22 | 2025-09-21 | “Compatible with AI SDK v5… OAuth authentication using Gemini CLI credentials.” | Auth and version specifics.              | H   | 0.9  |
166 | 
167 | ### Synthesis
168 | 
169 | - **Local**: Ollama community provider works with AI SDK; zero API keys. \[S4.1–S4.2]
170 | - **Free lane**: Gemini CLI community provider uses Gemini CLI creds; supports AI SDK v5. \[S4.3–S4.4]
171 | 
172 | ### Contradictions
173 | 
174 | - None.
175 | 
176 | ### Gaps & Next
177 | 
178 | - Model coverage varies; verify exact model names available via each provider at runtime.
179 | 
180 | ### Decision Hook
181 | 
182 | Ship two provider presets: `ollama` default, `gemini-cli` optional.
183 | 
184 | ---
185 | 
186 | ## Item 5: Are Codex and Gemini-CLI “providers”? What to do
187 | 
188 | ### Goal
189 | 
190 | Clarify provider status under AI SDK and integration path with `prompts`.
191 | 
192 | ### Query Set
193 | 
194 | - openai/codex README MCP config
195 | - Codex issues about transports (stdio vs SSE)
196 | - ai-sdk.dev Gemini CLI provider
197 | - Gemini CLI provider GitHub auth types
198 | 
199 | ### Evidence Log
200 | 
201 | | SourceID | Title                                        | Publisher    | URL                                                                                                                        | PubDate    | Accessed   | Quote                                                                       | Finding                             | Rel | Conf |
202 | | -------- | -------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | --------------------------------------------------------------------------- | ----------------------------------- | --- | ---- |
203 | | S5.1     | OpenAI Codex CLI README                      | GitHub       | [https://github.com/openai/codex](https://github.com/openai/codex)                                                         | 2025-09-18 | 2025-09-21 | “Enable by adding an `mcp_servers` section to your `~/.codex/config.toml`.” | Codex consumes MCP via config TOML. | H   | 0.95 |
204 | | S5.2     | Native SSE transport support for MCP servers | GitHub Issue | [https://github.com/openai/codex/issues/2129](https://github.com/openai/codex/issues/2129)                                 | 2025-08-10 | 2025-09-21 | “Currently, Codex only supports MCP servers that communicate over stdio.”   | Transport limitation.               | H   | 0.9  |
205 | | S5.3     | Community Providers: Gemini CLI              | AI SDK Docs  | [https://ai-sdk.dev/providers/community-providers/gemini-cli](https://ai-sdk.dev/providers/community-providers/gemini-cli) | n/a        | 2025-09-21 | “provider… using the Gemini CLI.”                                           | Gemini-CLI is an AI-SDK provider.   | H   | 0.9  |
206 | | S5.4     | AI SDK Provider for Gemini CLI               | GitHub       | [https://github.com/ben-vargas/ai-sdk-provider-gemini-cli](https://github.com/ben-vargas/ai-sdk-provider-gemini-cli)       | 2025-07-22 | 2025-09-21 | “authType: 'oauth-personal'… uses `~/.gemini/oauth_creds.json`.”            | Concrete auth config.               | H   | 0.9  |
207 | 
208 | ### Synthesis
209 | 
210 | - **Codex** is not an AI-SDK provider. It is an MCP client via `~/.codex/config.toml`. Stdio only per current issues. \[S5.1–S5.2]
211 | - **Gemini-CLI** is exposed as an AI-SDK community provider. Use it in Mastra. \[S5.3–S5.4]
212 | 
213 | ### Contradictions
214 | 
215 | - None.
216 | 
217 | ### Gaps & Next
218 | 
219 | - Codex may add non-stdio transports later; recheck before adding remote MCP servers.
220 | 
221 | ### Decision Hook
222 | 
223 | Treat Codex as an MCP client only; treat Gemini-CLI as an AI-SDK provider.
224 | 
225 | ---
226 | 
227 | ## Item 6: Exact touch points to add
228 | 
229 | ### Goal
230 | 
231 | Confirm concrete config for Codex and Gemini-CLI MCP hookup and provider wiring.
232 | 
233 | ### Query Set
234 | 
235 | - Codex README: `mcp_servers` key and config path
236 | - Codex community guides showing TOML key name
237 | - Gemini CLI settings.json MCP configuration docs
238 | - Gemini Code Assist docs on MCP config file location
239 | - Gemini CLI provider install and auth options
240 | 
241 | ### Evidence Log
242 | 
243 | | SourceID | Title                                   | Publisher    | URL                                                                                                                                                                  | PubDate    | Accessed   | Quote                                                                        | Finding                                       | Rel | Conf |
244 | | -------- | --------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | ---------------------------------------------------------------------------- | --------------------------------------------- | --- | ---- |
245 | | S6.1     | OpenAI Codex CLI README                 | GitHub       | [https://github.com/openai/codex](https://github.com/openai/codex)                                                                                                   | 2025-09-18 | 2025-09-21 | “add an `mcp_servers` section to your `~/.codex/config.toml`.”               | Confirms key + path.                          | H   | 0.95 |
246 | | S6.2     | Codex CLI guide (config.toml)           | Snyk Docs    | [https://docs.snyk.io/.../codex-cli-guide](https://docs.snyk.io/.../codex-cli-guide)                                                                                 | 2025-09-03 | 2025-09-21 | “Insert the following `mcpServers` configuration block…”                     | Shows example spelling variation in the wild. | M   | 0.6  |
247 | | S6.3     | Use agentic chat… Configure MCP servers | Google Cloud | [https://cloud.google.com/gemini/docs/codeassist/use-agentic-chat-pair-programmer](https://cloud.google.com/gemini/docs/codeassist/use-agentic-chat-pair-programmer) | n/a        | 2025-09-21 | “Open your Gemini settings JSON file, located at `~/.gemini/settings.json`.” | File location + `mcpServers` example.         | H   | 0.9  |
248 | | S6.4     | Gemini CLI Provider                     | AI SDK Docs  | [https://ai-sdk.dev/providers/community-providers/gemini-cli](https://ai-sdk.dev/providers/community-providers/gemini-cli)                                           | n/a        | 2025-09-21 | “enables using Google’s Gemini models through the… CLI.”                     | Provider wiring reference.                    | H   | 0.9  |
249 | | S6.5     | AI SDK Provider for Gemini CLI          | GitHub       | [https://github.com/ben-vargas/ai-sdk-provider-gemini-cli](https://github.com/ben-vargas/ai-sdk-provider-gemini-cli)                                                 | 2025-07-22 | 2025-09-21 | “createGeminiProvider({ authType: 'oauth-personal' })”                       | Auth options for provider.                    | H   | 0.9  |
250 | 
251 | ### Synthesis
252 | 
253 | - **Codex ↔ prompts MCP**: add `mcp_servers` in `~/.codex/config.toml`. Use `command="node"` and args to your built server path, e.g. `/c/Users/user/.../dist/mcp/server.js`. \[S6.1]
254 | - **Gemini-CLI ↔ MCP**: edit `~/.gemini/settings.json` and add `"mcpServers": { "prompts": { "command": "node", "args": [".../server.js"] } }`. \[S6.3]
255 | - **Mastra ↔ providers**: install and configure `ai-sdk-provider-gemini-cli` or an Ollama provider; select via AI SDK model factory. \[S6.4–S6.5]
256 | 
257 | ### Contradictions
258 | 
259 | - Codex examples in third-party docs sometimes use `mcpServers` vs `mcp_servers`. Prefer README canonical `mcp_servers`. \[S6.1–S6.2]
260 | 
261 | ### Gaps & Next
262 | 
263 | - Document Windows/WSL path conventions explicitly for your users.
264 | 
265 | ### Decision Hook
266 | 
267 | Publish copy-paste config snippets for both files with your server path placeholders.
268 | 
269 | ---
270 | 
271 | ## Item 7: Minimal migration plan for `prompts`
272 | 
273 | ### Goal
274 | 
275 | Sequence steps to reach ingest + MCP + CLI + Mastra tool consumption.
276 | 
277 | ### Query Set
278 | 
279 | - Task-Master Task Structure page for statuses and fields
280 | - MCP transports overview to select stdio
281 | - Mastra “Using Vercel AI SDK” to confirm provider abstraction
282 | - AI SDK community providers pages for Ollama and Gemini CLI
283 | - Codex README MCP config
284 | 
285 | ### Evidence Log
286 | 
287 | | SourceID | Title                       | Publisher        | URL                                                                                                                        | PubDate    | Accessed   | Quote                                                        | Finding                              | Rel | Conf |
288 | | -------- | --------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | ------------------------------------------------------------ | ------------------------------------ | --- | ---- |
289 | | S7.1     | Task Structure              | Task Master Docs | [https://docs.task-master.dev/capabilities/task-structure](https://docs.task-master.dev/capabilities/task-structure)       | n/a        | 2025-09-21 | “Tasks in tasks.json have the following structure…”          | Baseline schema.                     | H   | 0.95 |
290 | | S7.2     | Transports                  | MCP Docs         | [https://modelcontextprotocol.io/docs/concepts/transports](https://modelcontextprotocol.io/docs/concepts/transports)       | 2025-06-18 | 2025-09-21 | “two standard transport mechanisms… stdio… Streamable HTTP.” | Choose stdio for max client support. | H   | 0.9  |
291 | | S7.3     | Using Vercel AI SDK         | Mastra Docs      | [https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk](https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk)               | n/a        | 2025-09-21 | “Mastra integrates with Vercel’s AI SDK…”                    | Provider abstraction confirmed.      | H   | 0.9  |
292 | | S7.4     | Community Providers: Ollama | AI SDK Docs      | [https://ai-sdk.dev/providers/community-providers/ollama](https://ai-sdk.dev/providers/community-providers/ollama)         | n/a        | 2025-09-21 | “Uses the official `ollama` npm package…”                    | Local default.                       | M   | 0.9  |
293 | | S7.5     | Gemini CLI Provider         | AI SDK Docs      | [https://ai-sdk.dev/providers/community-providers/gemini-cli](https://ai-sdk.dev/providers/community-providers/gemini-cli) | n/a        | 2025-09-21 | “community provider… Gemini CLI.”                            | Optional free lane.                  | M   | 0.9  |
294 | | S7.6     | OpenAI Codex CLI README     | GitHub           | [https://github.com/openai/codex](https://github.com/openai/codex)                                                         | 2025-09-18 | 2025-09-21 | “add an `mcp_servers` section…”                              | Codex hookup.                        | H   | 0.95 |
295 | 
296 | ### Synthesis
297 | 
298 | - Step 1: Author `schemas/task.json` as superset of Task-Master. \[S7.1]
299 | - Step 2: Implement pure `graph.ts` and `update.ts`. \[S7.1]
300 | - Step 3: Expose MCP stdio server wrapping those functions. \[S7.2]
301 | - Step 4: Ship thin Commander CLI mapping to same functions. \[S2.1]
302 | - Step 5: Add Mastra example using AI SDK providers (Ollama default, Gemini CLI optional). \[S7.3–S7.5]
303 | - Step 6: Publish Codex and Gemini config snippets. \[S7.6, S6.3]
304 | 
305 | ### Contradictions
306 | 
307 | - None.
308 | 
309 | ### Gaps & Next
310 | 
311 | - Validate status name mapping (`deferred` vs `blocked`); provide conversion.
312 | 
313 | ### Decision Hook
314 | 
315 | Green-light implementation with stdio MCP as the common surface.
316 | 
317 | ---
318 | 
319 | ## Item 8: Free usage context for Gemini-CLI and limits
320 | 
321 | ### Goal
322 | 
323 | Validate the stated generous free limits for Gemini CLI preview and note variability.
324 | 
325 | ### Query Set
326 | 
327 | - The Verge coverage on Gemini CLI preview limits
328 | - Google codelab or official doc referencing free preview
329 | - Gemini CLI GitHub README general description
330 | 
331 | ### Evidence Log
332 | 
333 | | SourceID | Title                          | Publisher | URL                                                                                                                                                          | PubDate    | Accessed   | Quote                                                            | Finding                           | Rel | Conf |
334 | | -------- | ------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ---------- | ---------------------------------------------------------------- | --------------------------------- | --- | ---- |
335 | | S8.1     | Google is bringing Gemini CLI… | The Verge | [https://www.theverge.com/news/692517/google-gemini-cli-ai-agent-dev-terminal](https://www.theverge.com/news/692517/google-gemini-cli-ai-agent-dev-terminal) | 2025-06-25 | 2025-09-21 | “preview… free… usage limit of 60 rpm and 1,000 daily requests.” | Reports preview limits.           | H   | 0.75 |
[TRUNCATED]
```

MCP/PRDv2.md
```
1 | # Overview
2 | 
3 | A lightweight interop layer extends `AcidicSoil/prompts` to ingest Task‑Master artifacts, run an internal state engine, expose Model Context Protocol (MCP) tools over stdio, provide a thin CLI, and wire into Mastra via the Vercel AI SDK with zero‑cost provider presets. It targets developers who manage work with Task‑Master but want `prompts` to reason about readiness, advance workflow state, and serve multiple agentic clients (Codex, Gemini CLI, Mastra) without duplicating logic. It reduces friction by mirroring Task‑Master’s task schema, preserving source‑of‑truth files, and offering deterministic outputs suitable for CI.
4 | 
5 | # Core Features
6 | 
7 | ## 1) Task‑Master ingest adapter
8 | **What**: Parse `tasks.json` and map to `PromptsTask[]` using a superset schema that preserves Task‑Master field names and types.
9 | 
10 | **Why**: Zero‑loss ingestion enables consistent state reasoning and avoids vendor lock‑in.
11 | 
12 | **How**: `src/adapters/taskmaster/ingest.ts` validates against `schemas/task.json` (superset) and normalizes status values and dependency edges.
13 | 
14 | **Acceptance criteria (BDD)**
15 | Given a valid Task‑Master `tasks.json`
16 | When the adapter runs
17 | Then it produces `PromptsTask[]` with identical IDs, titles, descriptions, statuses, dependencies, priority, details, testStrategy, and subtasks
18 | And it records any non‑canonical statuses in a mapping report.
19 | 
20 | ## 2) Canonical task schema (superset)
21 | **What**: JSON Schema `schemas/task.json` that is a superset of Task‑Master’s fields.
22 | 
23 | **Why**: Type safety and forward compatibility.
24 | 
25 | **How**: Preserve names: `id,title,description,status,dependencies,priority,details,testStrategy,subtasks`. Add optional `labels, metadata, evidence, artifacts` fields.
26 | 
27 | **Acceptance criteria (BDD)**
28 | Given the schema
29 | When validating a canonical Task‑Master example
30 | Then validation passes without warnings
31 | And added optional fields remain optional.
32 | 
33 | ## 3) State engine parity with “next” semantics
34 | **What**: Pure functions `graph.computeReadiness()` and `update.advance()` that match Task‑Master readiness and ordering for the next task.
35 | 
36 | **Why**: Deterministic task selection across tools.
37 | 
38 | **How**: Identify tasks with all dependencies satisfied, order by priority, then dependency count, then ID. Support statuses `pending|in_progress|blocked|done` with mappable aliases.
39 | 
40 | **Acceptance criteria (BDD)**
41 | Given a task graph where some tasks’ dependencies are satisfied
42 | When `next()` runs
43 | Then it returns the highest‑priority ready task per documented tie‑break rules
44 | And never returns a task with unsatisfied dependencies.
45 | 
46 | ## 4) MCP stdio server for prompts tools
47 | **What**: Expose tools: `next_task`, `set_task_status`, `get_task`, `list_tasks`, `graph_export`.
48 | 
49 | **Why**: Let MCP clients (Codex, Gemini Code Assist) call shared logic.
50 | 
51 | **How**: Node process using stdio transport; JSON in/out; no side effects without explicit write flags.
52 | 
53 | **Acceptance criteria (BDD)**
54 | Given an MCP client connected over stdio
55 | When it calls `next_task`
56 | Then the server returns a single task payload consistent with the state engine
57 | And `set_task_status` changes are persisted only when write mode is enabled.
58 | 
59 | ## 5) Thin CLI
60 | **What**: `bin/prompts` with subcommands: `ingest`, `next`, `advance <id> <status>`, `graph --format dot|json`, `status`.
61 | 
62 | **Why**: Fast local use and CI suitability.
63 | 
64 | **How**: Commander‑based CLI that calls the same pure functions; outputs machine‑readable JSON by default and DOT for graphs.
65 | 
66 | **Acceptance criteria (BDD)**
67 | Given a repository containing `tasks.json`
68 | When `prompts next` runs
69 | Then it prints a single JSON object for the next task to stdout
70 | And exits with code 0.
71 | 
72 | ## 6) Mastra agent integration via AI SDK
73 | **What**: Register `prompts-tools` with a Mastra agent that uses AI SDK providers.
74 | 
75 | **Why**: Enable autonomous workflows that call `prompts` tools during planning and execution.
76 | 
77 | **How**: Package `packages/prompts-tools` exporting tool handlers; configure provider factory to select a model.
78 | 
79 | **Acceptance criteria (BDD)**
80 | Given a Mastra agent configured with `prompts-tools`
81 | When the agent plans a step requiring the next task
82 | Then it invokes `next_task` and incorporates the result into its plan without errors.
83 | 
84 | ## 7) Provider presets: Ollama (default) and Gemini CLI (optional)
85 | **What**: Two provider presets for Mastra via AI SDK: local Ollama by default; Gemini CLI as an optional free lane.
86 | 
87 | **Why**: Zero‑cost or local‑first operation.
88 | 
89 | **How**: Ship provider config examples and a runtime check that selects an available provider.
90 | 
91 | **Acceptance criteria (BDD)**
92 | Given no network access and Ollama installed
93 | When the agent initializes
94 | Then it selects the Ollama preset and runs a trivial health prompt successfully.
95 | 
96 | ## 8) Client touch points for Codex and Gemini
97 | **What**: Document configuration snippets to register the MCP stdio server with Codex and Gemini settings.
98 | 
99 | **Why**: Reduce setup friction.
100 | 
101 | **How**: Provide TOML/JSON snippet examples with placeholder paths; include Windows+WSL path examples using `/c/Users/user/...`.
102 | 
103 | **Acceptance criteria (BDD)**
104 | Given a user copies the provided snippets and updates the path
105 | When the client starts
106 | Then the client lists the `prompts` server as available
107 | And tool calls succeed over stdio.
108 | 
109 | ## 9) Optional artifact enrichment
110 | **What**: Non‑blocking readers for Task‑Master artifact files (e.g., complexity reports) to augment task metadata.
111 | 
112 | **Why**: Richer context without hard dependencies.
113 | 
114 | **How**: `src/artifacts/*` modules detect files and add derived fields under `metadata`.
115 | 
116 | **Acceptance criteria (BDD)**
117 | Given an artifacts directory is absent
118 | When enrichment runs
119 | Then ingestion still succeeds and `metadata` remains empty.
120 | 
121 | # User Experience
122 | 
123 | ## Personas
124 | 
125 | - Solo developer: wants quick “what’s next” and lightweight edits.
126 | - Team lead: needs deterministic ordering and exportable graphs for stand‑ups.
127 | - CI job: validates dependency integrity and fails fast on schema errors.
128 | 
129 | ## Key flows
130 | 
131 | - Ingest → Next → Advance: read `tasks.json`, choose next task, update status.
132 | - Agentic flow: Mastra agent calls MCP tools to unblock or plan.
133 | - Visualization: export DOT, render elsewhere.
134 | - Client setup: register MCP server in Codex or Gemini settings.
135 | 
136 | ## UI/UX considerations
137 | 
138 | - JSON first; human‑readable pretty‑print via `--pretty`.
139 | - Color‑safe CLI output; avoid reliance on ANSI by default.
140 | - Deterministic ordering for lists and logs.
141 | - Paths in examples use `/c/Users/user/...` for Windows+WSL.
142 | 
143 | ## Accessibility considerations
144 | 
145 | - No color‑only semantics; include symbols or keys.
146 | - TTY detection; fall back to plain text when non‑interactive.
147 | - Respect locale for number/date formatting in any summaries.
148 | 
149 | # Technical Architecture
150 | 
151 | ## System components
152 | 
153 | - Adapter: `src/adapters/taskmaster/ingest.ts`.
154 | - Schema: `schemas/task.json`.
155 | - State engine: `src/state/graph.ts`, `src/state/update.ts`.
156 | - MCP server: `src/mcp/server.ts` (stdio transport).
157 | - CLI: `bin/prompts` wired to core.
158 | - Mastra tools: `packages/prompts-tools`.
159 | - Provider presets: `src/providers/ollama.ts`, `src/providers/geminiCli.ts`.
160 | - Artifact readers: `src/artifacts/*`.
161 | 
162 | ## Data models
163 | 
164 | - Task: `{id, title, description, status, dependencies[], priority, details, testStrategy, subtasks[], labels?, metadata?, evidence?, artifacts?}`.
165 | - Status enum: `pending|in_progress|blocked|done` with alias map.
166 | - Graph: adjacency list plus computed readiness and ordering.
167 | 
168 | ## APIs and integrations
169 | 
170 | - MCP tools: `next_task`, `set_task_status`, `get_task`, `list_tasks`, `graph_export`.
171 | - CLI commands mirror MCP tools; outputs JSON or DOT.
172 | - Mastra integration registers tools; providers selected at runtime.
173 | 
174 | ## Infrastructure requirements
175 | 
176 | - Node ≥18; pnpm or npm.
177 | - No database; file I/O only.
178 | - Optional Graphviz for rendering; DOT export works without Graphviz.
179 | 
180 | ## Non‑functional requirements (NFRs)
181 | 
182 | - Determinism: identical inputs yield identical outputs.
183 | - Performance: `next_task` resolves in <100 ms for 5k tasks on a modern laptop.
184 | - Portability: runs on Windows (WSL), macOS, Linux.
185 | - Observability: `--verbose` flag emits structured logs to stderr.
186 | - Testability: unit tests for adapter, engine, and tools; golden files for examples.
187 | 
188 | ## Cross‑platform strategy
189 | 
190 | - Platform‑specific capabilities: use `/c/Users/user/...` in Windows+WSL docs; POSIX paths elsewhere.
191 | - Fallbacks:
192 |   - If Graphviz is unavailable, return DOT text even when `--format svg` is requested and emit a warning.
193 |   - If Ollama is missing, attempt Gemini CLI; if neither available, run a stub echo provider and warn.
194 |   - Normalize newlines on read/write to avoid CRLF issues.
195 | 
196 | **BDD fallback tests**
197 | Given Graphviz is not installed
198 | When `prompts graph --format svg` runs
199 | Then the command exits 0 and writes DOT to stdout with a warning to stderr.
200 | 
201 | Given Ollama is not installed and Gemini CLI is configured
202 | When the Mastra agent initializes
203 | Then provider selection chooses Gemini CLI and a health check succeeds.
204 | 
205 | Given neither provider is available
206 | When the Mastra agent initializes
207 | Then it selects the stub provider and logs an actionable warning.
208 | 
209 | ## Security and privacy considerations
210 | 
211 | - Sensitive inputs: task titles/descriptions may contain confidential work; avoid sending to remote models unless explicitly configured.
212 | - Default local‑first: no network calls without a chosen provider.
213 | - Secrets hygiene: do not log task payloads at `info`; redact IDs at `debug` unless `--unsafe-logs` is set by the user.
214 | 
215 | # Development Roadmap
216 | 
217 | ## MVP scope
218 | 
219 | - Superset schema and ingest adapter.
220 | - State engine with “next” parity and status mapping.
221 | - MCP stdio server exposing `next_task` and `set_task_status`.
222 | - CLI: `ingest`, `next`, `advance`, `graph --format dot`.
223 | - Provider presets: Ollama default, Gemini CLI optional with runtime selection.
224 | - Client touch points documented.
225 | 
226 | **MVP acceptance criteria (BDD)**
227 | Given a sample repo with `tasks.json`
228 | When the user runs `prompts next`
229 | Then the output matches the expected task per documented ordering.
230 | 
231 | Given an MCP client is connected
232 | When it invokes `next_task`
233 | Then it receives the same task as the CLI produced.
234 | 
235 | ## Future enhancements
236 | 
237 | - CLI migration path to oclif and installers.
238 | - Dependency validator and cycle detector.
239 | - Artifact enrichment modules for complexity and risk inputs.
240 | - Web viewer for DOT graphs.
241 | - Configurable status enums and custom ordering strategies.
242 | 
243 | **Enhancement acceptance criteria (BDD)**
244 | Given a graph with a cycle
245 | When the validator runs
246 | Then it reports the cycle with the minimal edge set and exits non‑zero.
247 | 
248 | # Logical Dependency Chain
249 | 
250 | 1. Define schema superset.
251 | 2. Implement adapter and unit tests.
252 | 3. Implement pure state engine and parity tests.
253 | 4. Expose MCP server over stdio.
254 | 5. Ship thin CLI wired to the same core.
255 | 6. Add Mastra tools and provider presets.
256 | 7. Document Codex and Gemini client setup.
257 | 8. Add artifact enrichment as optional modules.
258 | 
259 | # Risks and Mitigations
260 | 
261 | - Schema drift vs Task‑Master
262 |   - Likelihood: Medium
263 |   - Impact: High
264 |   - Mitigation: Keep a mirroring test suite against canonical examples; gate changes behind alias maps.
265 | 
266 | - Transport incompatibility (non‑stdio clients)
267 |   - Likelihood: Low
268 |   - Impact: Medium
269 |   - Mitigation: Standardize on stdio; evaluate additional transports only when required.
270 | 
271 | - Provider availability and free‑tier changes
272 |   - Likelihood: Medium
273 |   - Impact: Medium
274 |   - Mitigation: Default to local provider; include stub fallback; surface health checks.
275 | 
276 | - Windows/WSL path issues
277 |   - Likelihood: Medium
278 |   - Impact: Medium
279 |   - Mitigation: Normalize paths; document `/c/Users/user/...` conventions; test on WSL.
280 | 
281 | - Privacy leakage via remote providers
282 |   - Likelihood: Low
283 |   - Impact: High
284 |   - Mitigation: Opt‑in remote calls; redact logs; add data‑handling notice in docs.
285 | 
286 | # Appendix
287 | 
288 | ## Assumptions
289 | 
290 | - Task‑Master fields include `id,title,description,status,dependencies,priority,details,testStrategy,subtasks`.
291 | - Status values can be mapped into `pending|in_progress|blocked|done` without loss of meaning.
292 | - Node ≥18 is available across developer machines and CI.
293 | - Users may operate in Windows+WSL; examples use `/c/Users/user/...` paths.
294 | - Graphviz may not be installed; DOT output suffices as a universal exchange format.
295 | 
296 | ## Research findings and references (from provided material)
297 | 
298 | - “Task Structure” — confirms exact task fields and examples.
299 | - “Finding the Next Task” — defines readiness and ordering rules.
300 | - “MCP Tools” — lists next/status tool surface.
301 | - “Commander.js” vs “oclif” — trade‑offs for thin vs large CLIs.
302 | - “DOT Language” — baseline for graph exports.
303 | - “Using Vercel AI SDK” and “AI SDK v5 Integration” — Mastra integration path.
304 | - “Community Providers: Ollama” and “Gemini CLI Provider” — zero‑cost provider options.
305 | - “OpenAI Codex CLI README” — Codex consumes MCP via config; stdio only noted.
306 | - “Use agentic chat… Configure MCP servers” — Gemini settings JSON location and MCP section.
307 | - “Preview free limits” — free usage context reported; treat as variable.
308 | 
309 | ## Context notes (from link text)
310 | 
311 | - Task Structure — task fields and readiness
312 | - MCP Tools — tool surface and semantics
313 | - Commander.js — thin CLI utilities
314 | - oclif — installer‑friendly CLI framework
315 | - DOT Language — graph specification
316 | - Using Vercel AI SDK — Mastra provider abstraction
317 | - AI SDK v5 Integration — agent wiring example
318 | - Community Providers: Ollama — local provider
319 | - Gemini CLI Provider — optional free lane
320 | - OpenAI Codex CLI README — MCP client configuration
321 | - Configure MCP servers (Gemini) — settings file location and schema
322 | 
```

MCP/acidic_soil_prompts_integration_rollup_2025_09_21_america_chicago.md
```
1 | # Integration Plan: Task‑Master, MCP/CLI, and Mastra in `AcidicSoil/prompts`
2 | 
3 | > **Windows + WSL path note:** When showing local Windows paths, use `/c/Users/user/...` (WSL style) rather than `C:\\Users\\user\\...`.
4 | 
5 | ---
6 | 
7 | ## Contents
8 | 
9 | - [Integration Plan: Task‑Master, MCP/CLI, and Mastra in `AcidicSoil/prompts`](#integration-plan-taskmaster-mcpcli-and-mastra-in-acidicsoilprompts)
10 |   - [Contents](#contents)
11 |   - [Item 1: Ingest Task‑Master and run `prompts` state engine](#item-1-ingest-taskmaster-and-run-prompts-state-engine)
12 |   - [Item 2: Ship a CLI for shell use](#item-2-ship-a-cli-for-shell-use)
13 |   - [Item 3: Wire Mastra as the agentic layer](#item-3-wire-mastra-as-the-agentic-layer)
14 |   - [Item 4: Zero‑cost model options for Mastra](#item-4-zerocost-model-options-for-mastra)
15 |   - [Item 5: Are Codex and Gemini‑CLI “providers”? What to do](#item-5-are-codex-and-geminicli-providers-what-to-do)
16 |   - [Item 6: Exact touch points to add](#item-6-exact-touch-points-to-add)
17 |   - [Item 7: Minimal migration plan for `prompts`](#item-7-minimal-migration-plan-for-prompts)
18 |   - [Item 8: Gemini‑CLI free usage context](#item-8-geminicli-free-usage-context)
19 |   - [Roll‑up Summary](#rollup-summary)
20 |     - [Monitoring Note](#monitoring-note)
21 | 
22 | ---
23 | 
24 | ## Item 1: Ingest Task‑Master and run `prompts` state engine
25 | 
26 | **Goal**
27 | 
28 | Enable `AcidicSoil/prompts` to load Task‑Master artifacts and execute an equivalent state machine for task management. Match Task‑Master’s `tasks.json` schema and replicate the “next” logic.
29 | 
30 | **Assumptions**
31 | 
32 | - `prompts` may extend the schema (superset) but must preserve all Task‑Master field names and types.
33 | 
34 | <details><summary><strong>Query Set</strong></summary>
35 | 
36 | - site:docs.task-master.dev "Task Structure" tasks.json fields
37 | - site:docs.task-master.dev "next" command semantics dependency readiness
38 | - site:docs.task-master.dev MCP tools list “next_task” or similar
39 | - site:github.com eyaltoledano/claude-task-master tasks.json schema file or issue
40 | - "Task Master" complexity report JSON location
41 | - "Task Master" CLI "validate-dependencies" docs
42 | - site:docs.task-master.dev "CLI Commands" task statuses
43 | - site:docs.task-master.dev "Advanced Tasks" dependencies rules
44 | 
45 | </details>
46 | 
47 | <details><summary><strong>Evidence Log</strong></summary>
48 | 
49 | | SourceID | Title                                           | Publisher        | URL                                                                                                                            | PubDate    | Accessed   | Quote (≤25w)                                                                                                                                 | Finding                                          | Rel | Conf |
50 | | -------- | ----------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | --- | ---- |
51 | | S1.1     | Task Structure                                  | Task Master Docs | https://docs.task-master.dev/capabilities/task-structure                                                                       | n/a        | 2025-09-21 | “Tasks in tasks.json have the following structure: id, title, description, status, dependencies, priority, details, testStrategy, subtasks.” | Confirms exact field names and examples.         | H   | 0.95 |
52 | | S1.2     | Task Structure → Finding the Next Task          | Task Master Docs | https://docs.task-master.dev/capabilities/task-structure                                                                       | n/a        | 2025-09-21 | “Identifies tasks… with all dependencies satisfied. Prioritizes by priority, dependency count, and task ID.”                                 | Readiness and prioritization rules for `next`.   | H   | 0.9  |
53 | | S1.3     | MCP Tools                                       | Task Master Docs | https://docs.task-master.dev/capabilities/mcp                                                                                  | n/a        | 2025-09-21 | “MCP interface… exposes core functionalities as a set of tools… ‘next_task’, ‘set_task_status’, …”                                          | Confirms MCP tool surface including next/status. | H   | 0.9  |
54 | | S1.4     | Improve documentation… Create tasks.schema.json | GitHub Issue     | https://github.com/eyaltoledano/claude-task-master/issues/363                                                                  | 2025-04-30 | 2025-09-21 | “Create `tasks.schema.json` – a JSON Schema describing… `tasks.json`.”                                                                       | Evidence of schema formalization.                | M   | 0.7  |
55 | 
56 | </details>
57 | 
58 | **Synthesis**
59 | 
60 | - Task‑Master defines `tasks.json` with fields: `id, title, description, status, dependencies, priority, details, testStrategy, subtasks`.
61 | - `next` selects tasks whose dependencies are satisfied; orders by priority, dependency count, then ID.
62 | - MCP surface includes `next_task` and `set_task_status`; parity tools in `prompts` are feasible.
63 | - A formal JSON Schema is planned; use it as baseline for a superset `schemas/task.json`.
64 | 
65 | **Contradictions**
66 | 
67 | - None material; the schema issue shows intent, not final spec. Treat as advisory vs canonical.
68 | 
69 | **Gaps & Next**
70 | 
71 | - Confirm allowed `status` values (e.g., `pending`, `done`, `deferred`) and map to any `prompts` variants.
72 | - Fetch `tasks.schema.json` if/when published; validate types/enums.
73 | 
74 | **Decision Hook**
75 | 
76 | Proceed to implement `schemas/task.json` superset and `next()` readiness identical to Task‑Master.
77 | 
78 | ---
79 | 
80 | ## Item 2: Ship a CLI for shell use
81 | 
82 | **Goal**
83 | 
84 | Select a Node CLI framework and output options for `bin/prompts` with subcommands mapped to shared core.
85 | 
86 | <details><summary><strong>Query Set</strong></summary>
87 | 
88 | - commander.js GitHub README features and install
89 | - oclif docs introduction and commands API
90 | - oclif packaging/auto-update installers
91 | - Graphviz DOT language reference for `graph --format dot`
92 | - AI SDK or general Node CLI best practices flags/subcommands
93 | 
94 | </details>
95 | 
96 | <details><summary><strong>Evidence Log</strong></summary>
97 | 
98 | | SourceID | Title        | Publisher  | URL                                                                                      | PubDate    | Accessed   | Quote                                                                   | Finding                                 | Rel | Conf |
99 | | -------- | ------------ | ---------- | ---------------------------------------------------------------------------------------- | ---------- | ---------- | ----------------------------------------------------------------------- | --------------------------------------- | --- | ---- |
100 | | S2.1     | commander.js | GitHub     | https://github.com/tj/commander.js                                                       | n/a        | 2025-09-21 | “parsing the arguments… implements a help system.”                      | Commander fits thin CLIs.               | H   | 0.9  |
101 | | S2.2     | Introduction | oclif Docs | https://oclif.github.io/docs/introduction/                                               | 2025-08-25 | 2025-09-21 | “framework for building command-line interfaces… capable of much more.” | oclif for larger CLIs.                  | H   | 0.85 |
102 | | S2.3     | Features     | oclif Docs | https://oclif.github.io/docs/features                                                    | 2025-08-25 | 2025-09-21 | “package your CLI into installers… auto-updatable.”                     | oclif supports installers/auto-update.  | M   | 0.8  |
103 | | S2.4     | DOT Language | Graphviz   | https://graphviz.org/doc/info/lang.html                                                  | 2024-09-28 | 2025-09-21 | “DOT assumes the UTF-8 character encoding.”                             | DOT reference for `graph --format dot`. | M   | 0.9  |
104 | 
105 | </details>
106 | 
107 | **Synthesis**
108 | 
109 | - Use **Commander** for a thin CLI that wraps shared core; low overhead.
110 | - If installers and plugin system become needs, migrate to **oclif**.
111 | - Output `graph --format dot` per Graphviz DOT spec (UTF‑8).
112 | 
113 | **Decision Hook**
114 | 
115 | Start with Commander now; keep layout compatible with later oclif migration.
116 | 
117 | ---
118 | 
119 | ## Item 3: Wire Mastra as the agentic layer
120 | 
121 | **Goal**
122 | 
123 | Verify Mastra supports AI SDK providers and tool registration so `prompts` can expose tools to a Mastra agent.
124 | 
125 | <details><summary><strong>Query Set</strong></summary>
126 | 
127 | - mastra.ai docs “Using Vercel AI SDK”
128 | - Mastra examples for AI SDK v5 integration
129 | - Mastra blog post on AI SDK integration
130 | - Mastra model providers page
131 | 
132 | </details>
133 | 
134 | <details><summary><strong>Evidence Log</strong></summary>
135 | 
136 | | SourceID | Title                             | Publisher   | URL                                                                                                                | PubDate    | Accessed   | Quote                                                                         | Finding                         | Rel | Conf |
137 | | -------- | --------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------ | ---------- | ---------- | ----------------------------------------------------------------------------- | ------------------------------- | --- | ---- |
138 | | S3.1     | Using Vercel AI SDK               | Mastra Docs | https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk                                                               | n/a        | 2025-09-21 | “Mastra integrates with Vercel’s AI SDK… specify any AI SDK-supported model.” | Confirms provider layer.        | H   | 0.9  |
139 | | S3.2     | Example: AI SDK v5 Integration    | Mastra Docs | https://mastra.ai/examples/agents/ai-sdk-v5-integration                                                            | n/a        | 2025-09-21 | “integrate Mastra agents with AI SDK v5… tool integration.”                   | Shows v5 interop pattern.       | H   | 0.9  |
140 | | S3.3     | Using Vercel’s AI SDK with Mastra | Mastra Blog | https://mastra.ai/blog/using-ai-sdk-with-mastra                                                                     | 2025-02-13 | 2025-09-21 | “built Mastra as a framework on top of the AI SDK.”                           | Architectural confirmation.     | M   | 0.85 |
141 | | S3.4     | Model Providers                   | Mastra Docs | https://mastra.ai/docs/getting-started/model-providers                                                             | n/a        | 2025-09-21 | “AI SDK model providers are packages… install … for a different provider.”    | Provider installation guidance. | M   | 0.8  |
142 | 
143 | </details>
144 | 
145 | **Synthesis**
146 | 
147 | - Mastra layers on the **Vercel AI SDK** and accepts any AI‑SDK provider.
148 | - Tools register on agents; wiring matches the `prompts-tools` plan.
149 | 
150 | **Decision Hook**
151 | 
152 | Implement `packages/prompts-tools` and register in a Mastra agent using AI‑SDK providers.
153 | 
154 | ---
155 | 
156 | ## Item 4: Zero‑cost model options for Mastra
157 | 
158 | **Goal**
159 | 
160 | List viable free or local providers for Mastra via AI SDK: **Ollama** and **Gemini CLI**.
161 | 
162 | <details><summary><strong>Query Set</strong></summary>
163 | 
164 | - ai-sdk.dev community providers: ollama
165 | - npm “ai-sdk-ollama” or similar
166 | - Gemini CLI provider page on ai-sdk.dev
167 | - Gemini CLI provider GitHub readme
168 | 
169 | </details>
170 | 
171 | <details><summary><strong>Evidence Log</strong></summary>
172 | 
173 | | SourceID | Title                          | Publisher   | URL                                                                                                                        | PubDate    | Accessed   | Quote                                                                           | Finding                                  | Rel | Conf |
174 | | -------- | ------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | ------------------------------------------------------------------------------- | ---------------------------------------- | --- | ---- |
175 | | S4.1     | Community Providers: Ollama    | AI SDK Docs | https://ai-sdk.dev/providers/community-providers/ollama                                                                      | n/a        | 2025-09-21 | “Uses the official `ollama` npm package… Full TypeScript support.”              | Confirms Ollama provider exists.         | H   | 0.9  |
176 | | S4.2     | ai-sdk-ollama                  | npm         | https://www.npmjs.com/package/ai-sdk-ollama                                                                                | 2025-08-17 | 2025-09-21 | “provider for Ollama built on the official ollama package.”                     | Reinforces Ollama provider availability. | M   | 0.8  |
177 | | S4.3     | Gemini CLI Provider            | AI SDK Docs | https://ai-sdk.dev/providers/community-providers/gemini-cli                                                                  | n/a        | 2025-09-21 | “enables using Google’s Gemini models through… Gemini CLI.”                     | Confirms Gemini‑CLI provider.            | H   | 0.9  |
178 | | S4.4     | AI SDK Provider for Gemini CLI | GitHub      | https://github.com/ben-vargas/ai-sdk-provider-gemini-cli                                                                    | 2025-07-22 | 2025-09-21 | “Compatible with AI SDK v5… OAuth authentication using Gemini CLI credentials.” | Auth and version specifics.              | H   | 0.9  |
179 | 
180 | </details>
181 | 
182 | **Synthesis**
183 | 
184 | - **Local**: Ollama community provider works with AI SDK; zero API keys.
185 | - **Free lane**: Gemini CLI community provider uses Gemini CLI creds; supports AI SDK v5.
186 | 
187 | **Decision Hook**
188 | 
189 | Ship two provider presets: `ollama` default, `gemini-cli` optional.
190 | 
191 | ---
192 | 
193 | ## Item 5: Are Codex and Gemini‑CLI “providers”? What to do
194 | 
195 | **Goal**
196 | 
197 | Clarify provider status under AI SDK and integration path with `prompts`.
198 | 
199 | <details><summary><strong>Query Set</strong></summary>
200 | 
201 | - openai/codex README MCP config
202 | - Codex issues about transports (stdio vs SSE)
203 | - ai-sdk.dev Gemini CLI provider
204 | - Gemini CLI provider GitHub auth types
205 | 
206 | </details>
207 | 
208 | <details><summary><strong>Evidence Log</strong></summary>
209 | 
210 | | SourceID | Title                                        | Publisher    | URL                                                                                                                        | PubDate    | Accessed   | Quote                                                                       | Finding                             | Rel | Conf |
211 | | -------- | -------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | --------------------------------------------------------------------------- | ----------------------------------- | --- | ---- |
212 | | S5.1     | OpenAI Codex CLI README                      | GitHub       | https://github.com/openai/codex                                                                                            | 2025-09-18 | 2025-09-21 | “Enable by adding an `mcp_servers` section to your `~/.codex/config.toml`.” | Codex consumes MCP via config TOML. | H   | 0.95 |
213 | | S5.2     | Native SSE transport support for MCP servers | GitHub Issue | https://github.com/openai/codex/issues/2129                                                                                | 2025-08-10 | 2025-09-21 | “Currently, Codex only supports MCP servers that communicate over stdio.”   | Transport limitation.               | H   | 0.9  |
214 | | S5.3     | Community Providers: Gemini CLI              | AI SDK Docs  | https://ai-sdk.dev/providers/community-providers/gemini-cli                                                                  | n/a        | 2025-09-21 | “provider… using the Gemini CLI.”                                           | Gemini‑CLI is an AI‑SDK provider.   | H   | 0.9  |
215 | | S5.4     | AI SDK Provider for Gemini CLI               | GitHub       | https://github.com/ben-vargas/ai-sdk-provider-gemini-cli                                                                    | 2025-07-22 | 2025-09-21 | “authType: 'oauth-personal'… uses `~/.gemini/oauth_creds.json`.”            | Concrete auth config.               | H   | 0.9  |
216 | 
217 | </details>
218 | 
219 | **Synthesis**
220 | 
221 | - **Codex** is not an AI‑SDK provider. It is an **MCP client** via `~/.codex/config.toml`. Stdio only per current issues.
222 | - **Gemini‑CLI** is exposed as an AI‑SDK community provider (use in Mastra) and is also an MCP client (configure via settings.json).
223 | 
224 | **Decision Hook**
225 | 
226 | Treat Codex as an MCP client only; treat Gemini‑CLI as an AI‑SDK provider (for Mastra) and as an MCP client (for IDE use).
227 | 
228 | ---
229 | 
230 | ## Item 6: Exact touch points to add
231 | 
232 | **Goal**
233 | 
234 | Confirm concrete config for **Codex** and **Gemini‑CLI** MCP hookup and provider wiring.
235 | 
236 | <details><summary><strong>Query Set</strong></summary>
237 | 
238 | - Codex README: `mcp_servers` key and config path
239 | - Codex community guides showing TOML key name
240 | - Gemini settings.json MCP configuration docs
241 | - Gemini Code Assist docs on MCP config file location
242 | - Gemini CLI provider install and auth options
243 | 
244 | </details>
245 | 
246 | <details><summary><strong>Evidence Log</strong></summary>
247 | 
248 | | SourceID | Title                                   | Publisher    | URL                                                                                                                                                                  | PubDate    | Accessed   | Quote                                                                        | Finding                                       | Rel | Conf |
249 | | -------- | --------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | ---------------------------------------------------------------------------- | --------------------------------------------- | --- | ---- |
250 | | S6.1     | OpenAI Codex CLI README                 | GitHub       | https://github.com/openai/codex                                                                                                                                        | 2025-09-18 | 2025-09-21 | “add an `mcp_servers` section to your `~/.codex/config.toml`.”               | Confirms key + path.                          | H   | 0.95 |
251 | | S6.2     | Codex CLI guide (config.toml)           | Snyk Docs    | https://docs.snyk.io/.../codex-cli-guide                                                                                                                              | 2025-09-03 | 2025-09-21 | “Insert the following `mcpServers` configuration block…”                     | Shows example spelling variation in the wild. | M   | 0.6  |
252 | | S6.3     | Use agentic chat… Configure MCP servers | Google Cloud | https://cloud.google.com/gemini/docs/codeassist/use-agentic-chat-pair-programmer                                                                                      | n/a        | 2025-09-21 | “Open your Gemini settings JSON file, located at `~/.gemini/settings.json`.” | File location + `mcpServers` example.         | H   | 0.9  |
253 | | S6.4     | Gemini CLI Provider                     | AI SDK Docs  | https://ai-sdk.dev/providers/community-providers/gemini-cli                                                                                                           | n/a        | 2025-09-21 | “enables using Google’s Gemini models through the… CLI.”                     | Provider wiring reference.                    | H   | 0.9  |
254 | | S6.5     | AI SDK Provider for Gemini CLI          | GitHub       | https://github.com/ben-vargas/ai-sdk-provider-gemini-cli                                                                                                              | 2025-07-22 | 2025-09-21 | “createGeminiProvider({ authType: 'oauth-personal' })”                       | Auth options for provider.                    | H   | 0.9  |
255 | 
256 | </details>
257 | 
258 | **Synthesis**
259 | 
260 | - **Codex ↔ prompts MCP**: add `mcp_servers` in `~/.codex/config.toml`. Use `command="node"` and args to your built server path, e.g. `/c/Users/user/.../dist/mcp/server.js`.
261 | - **Gemini‑CLI ↔ MCP**: edit `~/.gemini/settings.json` and add `"mcpServers": { "prompts": { "command": "node", "args": [".../server.js"] } }`.
262 | - **Mastra ↔ providers**: install and configure `ai-sdk-provider-gemini-cli` or an Ollama provider; select via AI SDK model factory.
263 | 
264 | **Decision Hook**
265 | 
266 | Publish copy‑paste config snippets for both files with server path placeholders (include Windows/WSL path examples).
267 | 
268 | ---
269 | 
270 | ## Item 7: Minimal migration plan for `prompts`
271 | 
272 | **Goal**
273 | 
274 | Sequence steps to reach ingest + MCP + CLI + Mastra tool consumption.
275 | 
276 | <details><summary><strong>Query Set</strong></summary>
277 | 
278 | - Task‑Master Task Structure page for statuses and fields
279 | - MCP transports overview to select stdio
280 | - Mastra “Using Vercel AI SDK” to confirm provider abstraction
281 | - AI SDK community providers pages for Ollama and Gemini CLI
282 | - Codex README MCP config
283 | 
284 | </details>
285 | 
286 | <details><summary><strong>Evidence Log</strong></summary>
287 | 
288 | | SourceID | Title                       | Publisher        | URL                                                                                                                        | PubDate    | Accessed   | Quote                                                        | Finding                              | Rel | Conf |
289 | | -------- | --------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | ------------------------------------------------------------ | ------------------------------------ | --- | ---- |
290 | | S7.1     | Task Structure              | Task Master Docs | https://docs.task-master.dev/capabilities/task-structure                                                                     | n/a        | 2025-09-21 | “Tasks in tasks.json have the following structure…”          | Baseline schema.                     | H   | 0.95 |
291 | | S7.2     | Transports                  | MCP Docs         | https://modelcontextprotocol.io/docs/concepts/transports                                                                      | 2025-06-18 | 2025-09-21 | “two standard transport mechanisms… stdio… Streamable HTTP.” | Choose stdio for max client support. | H   | 0.9  |
292 | | S7.3     | Using Vercel AI SDK         | Mastra Docs      | https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk                                                                          | n/a        | 2025-09-21 | “Mastra integrates with Vercel’s AI SDK…”                    | Provider abstraction confirmed.      | H   | 0.9  |
293 | | S7.4     | Community Providers: Ollama | AI SDK Docs      | https://ai-sdk.dev/providers/community-providers/ollama                                                                        | n/a        | 2025-09-21 | “Uses the official `ollama` npm package…”                    | Local default.                       | M   | 0.9  |
294 | | S7.5     | Gemini CLI Provider         | AI SDK Docs      | https://ai-sdk.dev/providers/community-providers/gemini-cli                                                                    | n/a        | 2025-09-21 | “community provider… Gemini CLI.”                            | Optional free lane.                  | M   | 0.9  |
295 | | S7.6     | OpenAI Codex CLI README     | GitHub           | https://github.com/openai/codex                                                                                               | 2025-09-18 | 2025-09-21 | “add an `mcp_servers` section…”                              | Codex hookup.                        | H   | 0.95 |
296 | 
297 | </details>
298 | 
299 | **Synthesis (Step‑by‑step)**
300 | 
301 | 1. Author `schemas/task.json` as superset of Task‑Master.
302 | 2. Implement pure `graph.ts` and `update.ts` based on that schema.
303 | 3. Expose an **MCP stdio** server wrapping those functions.
304 | 4. Ship a thin **Commander** CLI mapping to the same functions.
305 | 5. Add a **Mastra example** using AI SDK providers (Ollama default, Gemini CLI optional).
306 | 6. Publish **Codex** and **Gemini** config snippets.
307 | 
308 | **Decision Hook**
309 | 
310 | Green‑light implementation with stdio MCP as the common surface.
311 | 
312 | ---
313 | 
314 | ## Item 8: Gemini‑CLI free usage context
315 | 
316 | **Goal**
317 | 
318 | Validate generous free limits for Gemini CLI preview and note variability.
319 | 
320 | <details><summary><strong>Query Set</strong></summary>
321 | 
322 | - The Verge coverage on Gemini CLI preview limits
323 | - Google codelab or official doc referencing free preview
324 | - Gemini CLI GitHub README general description
325 | 
326 | </details>
327 | 
328 | <details><summary><strong>Evidence Log</strong></summary>
329 | 
330 | | SourceID | Title                          | Publisher | URL                                                                                                                                                          | PubDate    | Accessed   | Quote                                                            | Finding                           | Rel | Conf |
331 | | -------- | ------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ---------- | ---------------------------------------------------------------- | --------------------------------- | --- | ---- |
332 | | S8.1     | Google is bringing Gemini CLI… | The Verge | https://www.theverge.com/news/692517/google-gemini-cli-ai-agent-dev-terminal                                                                                  | 2025-06-25 | 2025-09-21 | “preview… free… usage limit of 60 rpm and 1,000 daily requests.” | Reports preview limits.           | H   | 0.75 |
333 | | S8.2     | Gemini CLI                     | GitHub    | https://github.com/google-gemini/gemini-cli                                                                                                                   | n/a        | 2025-09-21 | “open-source AI agent… brings the power of Gemini… terminal.”    | Confirms project and positioning. | M   | 0.9  |
334 | 
335 | </details>
336 | 
337 | **Synthesis**
338 | 
339 | - Gemini CLI preview was free with high limits; limits may change. Treat as non‑contractual and re‑verify before publishing guarantees.
340 | 
341 | **Decision Hook**
342 | 
343 | Position Gemini‑CLI as “often zero‑cost for dev,” with a recheck step on limits.
344 | 
345 | ---
346 | 
347 | ## Roll‑up Summary
348 | 
349 | | Item                     | Status   | Decision enabled                                                    |
350 | | ------------------------ | -------- | ------------------------------------------------------------------- |
351 | | 1. Ingest + state engine | Complete | Build schema superset and readiness logic identical to Task‑Master. |
352 | | 2. CLI                   | Complete | Start with Commander; revisit oclif if installers needed.           |
353 | | 3. Mastra layer          | Complete | Register `prompts-tools` on Mastra agent using AI SDK.              |
354 | | 4. Zero-cost models      | Complete | Ship presets for Ollama and Gemini‑CLI.                             |
355 | | 5. Providers vs clients  | Complete | Codex = MCP client; Gemini‑CLI = AI‑SDK provider + MCP client.      |
356 | | 6. Touch points          | Complete | Publish Codex TOML + Gemini settings JSON snippets.                 |
[TRUNCATED]
```

artifacts/delta-20250921-173948.md
```
1 | # Delta
2 | Full Rebaseline mode selected for PRDv2 scope; legacy pending prompt-authoring tasks deprecated.
3 | 
4 | ## Objectives
5 | 
6 | - Mirror Task-Master semantics in prompts by adding ingest adapter, superset schema, and readiness parity engine.
7 | - Expose shared task logic over MCP stdio plus thin CLI with deterministic outputs ready for CI.
8 | - Integrate Mastra/AI SDK presets to guarantee zero-cost or local-first operation and document Codex/Gemini client touchpoints.
9 | - Provide optional artifact enrichment and secure logging without breaking existing workflows.
10 | 
11 | ## Constraints
12 | 
13 | - Node.js >= 18 with TypeScript strict mode; rely on file I/O only, no new services.
14 | - Deterministic outputs (<100 ms for `next_task` on 5k tasks) and portability across Windows/WSL, macOS, Linux.
15 | - Default local providers (Ollama) with Gemini CLI fallback; stub when neither is available.
16 | - No hard dependency on Graphviz or external providers; fallbacks must warn but not fail.
17 | 
18 | ## Impacts
19 | 
20 | - Tasks 9, 13-20 marked deprecated; superseded by new PRDv2 workstream covering ingest, state engine, CLI, Mastra integration, and docs.
21 | - Added twelve new tasks (25-36) scoped to PRDv2 deliverables with lineage pointers back to deprecated items.
22 | - Readiness recalculated under new plan; prior prompt-authoring pipeline removed from active frontier.
23 | - In-progress task 22 left unchanged per historical-state rule; flagged for follow-up in readiness report.
24 | 
25 | ## Decisions
26 | 
27 | - Adopted Full Rebaseline due to >40% scope change and new architectural components.
28 | - Centralized new work under single delta doc for lineage tracking and `source_doc` references.
29 | - Reused autogenerated PRD parse as provisional baseline, offsetting IDs to preserve history.
30 | - Deprecated legacy rate limiting and prompt authoring tasks instead of mutating completed history.
31 | 
32 | ## Evidence
33 | 
34 | - {"source": ".taskmaster/docs/PRDv2.md", "date": "2025-09-21", "summary": "Defines Task-Master ingest adapter, state engine parity, MCP tools, CLI, Mastra integration, provider presets, and artifact enrichment scope."}
35 | - {"source": "artifacts/parsed-PRDv2-tasks.json", "date": "2025-09-21", "summary": "Autogenerated tasks from PRDv2 used as baseline for new IDs."}
```

artifacts/parsed-PRDv2-tasks.json
```
1 | {
2 |   "master": {
3 |     "tasks": [
4 |       {
5 |         "id": 1,
6 |         "title": "Project Initialization and Scaffolding",
7 |         "description": "Set up a new Node.js project using pnpm or npm. Configure TypeScript, Jest for testing, and establish the basic directory structure required by the PRD.",
8 |         "details": "Initialize a `package.json`. Install `typescript`, `ts-node`, `@types/node`, `jest`, and `ts-jest` as dev dependencies. Create a `tsconfig.json` file with modern settings. Create the initial directory structure: `src/`, `schemas/`, `bin/`, `packages/`, `tests/`.",
9 |         "testStrategy": "Verify that `pnpm test` runs successfully and that a simple 'hello world' TypeScript file in `src/` can be compiled and executed.",
10 |         "priority": "high",
11 |         "dependencies": [],
12 |         "status": "pending",
13 |         "subtasks": []
14 |       },
15 |       {
16 |         "id": 2,
17 |         "title": "Define Canonical Task JSON Schema",
18 |         "description": "Create the canonical `task.json` schema file that acts as a superset of the Task-Master task definition, ensuring type safety and forward compatibility.",
19 |         "details": "Create the file `schemas/task.json`. It must include all Task-Master fields: `id, title, description, status, dependencies, priority, details, testStrategy, subtasks`. Add the new optional fields: `labels, metadata, evidence, artifacts`.",
20 |         "testStrategy": "Create a test that validates a canonical Task-Master task object against the schema, ensuring it passes. Create another test with the new optional fields to ensure it also passes. A test with a missing required field should fail.",
21 |         "priority": "high",
22 |         "dependencies": [
23 |           1
24 |         ],
25 |         "status": "pending",
26 |         "subtasks": []
27 |       },
28 |       {
29 |         "id": 3,
30 |         "title": "Implement Task-Master Ingest Adapter",
31 |         "description": "Create a module to read and parse a Task-Master `tasks.json` file, validate it against the canonical schema, and normalize it into an array of `PromptsTask` objects.",
32 |         "details": "Create `src/adapters/taskmaster/ingest.ts`. The main function will take a file path, read the JSON content, validate it using the schema from `schemas/task.json`, and map the data to an internal `PromptsTask[]` type. It should also handle mapping non-canonical status values and report them.",
33 |         "testStrategy": "BDD: Given a valid Task-Master `tasks.json`, when the adapter runs, then it produces `PromptsTask[]` with identical core fields and records any non-canonical statuses in a mapping report. Use golden files for testing.",
34 |         "priority": "high",
35 |         "dependencies": [
36 |           2
37 |         ],
38 |         "status": "pending",
39 |         "subtasks": []
40 |       },
41 |       {
42 |         "id": 4,
43 |         "title": "Implement State Engine: Readiness and 'next' Logic",
44 |         "description": "Develop the core state engine logic to determine task readiness and select the next task based on the specified ordering rules.",
45 |         "details": "Create `src/state/graph.ts`. Implement `computeReadiness(tasks)` to identify tasks where all dependencies are 'done'. Implement `next(tasks)` to filter for ready tasks and sort them by priority (desc), then dependency count (desc), then ID (asc), returning the top one.",
46 |         "testStrategy": "BDD: Given a task graph, when `next()` runs, then it returns the highest-priority ready task per tie-break rules and never returns a task with unsatisfied dependencies. Test cases should include multiple ready tasks with different priorities and tie-breaker scenarios.",
47 |         "priority": "high",
48 |         "dependencies": [
49 |           3
50 |         ],
51 |         "status": "pending",
52 |         "subtasks": []
53 |       },
54 |       {
55 |         "id": 5,
56 |         "title": "Implement State Engine: Status Update Logic",
57 |         "description": "Create a pure function to handle advancing a task's status within the in-memory state.",
58 |         "details": "Create `src/state/update.ts`. Implement `advance(tasks, id, newStatus)` which takes the current task array, a task ID, and a new status, and returns a new task array with the specified task's status updated. The function should be pure and not mutate the input array.",
59 |         "testStrategy": "Write unit tests to confirm that calling `advance` with a valid ID and status returns a new array with the correct task updated. Test that the original array remains unchanged.",
60 |         "priority": "high",
61 |         "dependencies": [
62 |           4
63 |         ],
64 |         "status": "pending",
65 |         "subtasks": []
66 |       },
67 |       {
68 |         "id": 6,
69 |         "title": "Implement MCP Stdio Server",
70 |         "description": "Expose the state engine's capabilities over stdio using the Model Context Protocol (MCP) for consumption by external agentic clients.",
71 |         "details": "Create `src/mcp/server.ts`. This Node.js script will listen for line-delimited JSON requests on stdin and write JSON responses to stdout. Implement handlers for `next_task`, `set_task_status`, `get_task`, `list_tasks`, and `graph_export`. The `set_task_status` handler must respect a write-mode flag to control persistence.",
72 |         "testStrategy": "BDD: Given an MCP client connected over stdio, when it calls `next_task`, then the server returns a single task payload. When it calls `set_task_status` without write mode, the underlying file is not changed.",
73 |         "priority": "medium",
74 |         "dependencies": [
75 |           5
76 |         ],
77 |         "status": "pending",
78 |         "subtasks": []
79 |       },
80 |       {
81 |         "id": 7,
82 |         "title": "Implement Thin CLI with Commander.js",
83 |         "description": "Build a command-line interface to provide fast, local access to the core features for developers and CI/CD pipelines.",
84 |         "details": "Create `bin/prompts` and use the `commander` library. Implement subcommands: `ingest`, `next`, `advance <id> <status>`, `graph --format dot|json`, and `status`. These commands will call the pure functions from the adapter and state engine. Default output should be machine-readable JSON.",
85 |         "testStrategy": "BDD: Given a repository containing `tasks.json`, when `prompts next` runs, then it prints a single JSON object for the next task to stdout and exits with code 0. Test graph command for both `dot` and `json` formats.",
86 |         "priority": "medium",
87 |         "dependencies": [
88 |           5
89 |         ],
90 |         "status": "pending",
91 |         "subtasks": []
92 |       },
93 |       {
94 |         "id": 8,
95 |         "title": "Create Mastra Tools Package for AI SDK",
96 |         "description": "Package the core logic as a set of tools compatible with the Vercel AI SDK to enable integration with Mastra agents.",
97 |         "details": "In the `packages/` directory, create a new package named `prompts-tools`. This package will export tool handlers (e.g., `next_task`, `set_task_status`) that wrap the core state engine functions in a format consumable by `generateObject` or similar AI SDK functions.",
98 |         "testStrategy": "BDD: Given a Mastra agent configured with `prompts-tools`, when the agent plans a step requiring the next task, then it successfully invokes the `next_task` tool and incorporates the result into its plan.",
99 |         "priority": "medium",
100 |         "dependencies": [
101 |           5
102 |         ],
103 |         "status": "pending",
104 |         "subtasks": []
105 |       },
106 |       {
107 |         "id": 9,
108 |         "title": "Implement Provider Presets and Fallback Logic",
109 |         "description": "Configure zero-cost and local-first provider presets for the Mastra integration, ensuring the system is functional out-of-the-box.",
110 |         "details": "Create provider configuration modules like `src/providers/ollama.ts` and `src/providers/geminiCli.ts`. Implement a runtime factory that checks for provider availability (e.g., Ollama server running) and selects one, defaulting to Ollama. If no primary providers are available, it should use a stub provider and log a warning.",
111 |         "testStrategy": "BDD: Given no network access and Ollama installed, the agent initializes with the Ollama preset. Given Ollama is unavailable but Gemini CLI is, it selects Gemini. Given neither is available, it selects the stub provider and logs a warning.",
112 |         "priority": "medium",
113 |         "dependencies": [
114 |           8
115 |         ],
116 |         "status": "pending",
117 |         "subtasks": []
118 |       },
119 |       {
120 |         "id": 10,
121 |         "title": "Document Client Configuration for Codex and Gemini",
122 |         "description": "Create clear documentation with copy-pasteable snippets to help users configure their agentic clients (Codex, Gemini) to use the MCP stdio server.",
123 |         "details": "Create a `docs/client_setup.md` file. Provide TOML and JSON configuration examples for registering the MCP server. Include placeholder paths and specific examples for Windows+WSL using the `/c/Users/user/...` format.",
124 |         "testStrategy": "BDD: Given a user copies the provided snippets and updates the path, when the client starts, then the client lists the `prompts` server as available and tool calls succeed over stdio. This will be verified by manual testing following the guide.",
125 |         "priority": "low",
126 |         "dependencies": [
127 |           6
128 |         ],
129 |         "status": "pending",
130 |         "subtasks": []
131 |       },
132 |       {
133 |         "id": 11,
134 |         "title": "Implement Optional Artifact Enrichment",
135 |         "description": "Add a non-blocking feature to enrich task data with metadata derived from artifact files, providing richer context without creating hard dependencies.",
136 |         "details": "Create a directory `src/artifacts/`. Implement modules that can detect and parse related artifact files (e.g., complexity reports). If files are found, add the derived data to the `metadata` field of the corresponding task. The entire enrichment process must not block or fail ingestion if artifacts are absent.",
137 |         "testStrategy": "BDD: Given an artifacts directory is absent, when ingestion runs, then it succeeds and the `metadata` field on tasks remains empty. Given a valid artifact file is present, the corresponding task is enriched with the correct metadata.",
138 |         "priority": "low",
139 |         "dependencies": [
140 |           3
141 |         ],
142 |         "status": "pending",
143 |         "subtasks": []
144 |       },
145 |       {
146 |         "id": 12,
147 |         "title": "Implement Observability and Secure Logging",
148 |         "description": "Add structured logging and security-conscious defaults to improve observability and prevent accidental leakage of sensitive information.",
149 |         "details": "Integrate a lightweight logging library. Add a `--verbose` flag to the CLI and a corresponding option for the server to emit structured logs to stderr. By default, log levels should not expose task content. Redact task IDs at `debug` level unless an `--unsafe-logs` flag is explicitly used.",
150 |         "testStrategy": "Verify that running a command without flags produces no verbose output. Running with `--verbose` produces structured logs on stderr. Check that task titles/descriptions are not present in default logs.",
151 |         "priority": "low",
152 |         "dependencies": [
153 |           7
154 |         ],
155 |         "status": "pending",
156 |         "subtasks": []
157 |       }
158 |     ],
159 |     "metadata": {
160 |       "created": "2025-09-21T22:38:15.570Z",
161 |       "updated": "2025-09-21T22:38:15.570Z",
162 |       "description": "Tasks for master context"
163 |     }
164 |   }
165 | }
```

artifacts/readiness-20250921-173948.txt
```
1 | READY
2 | - 25 Project Initialization and Scaffolding
3 | 
4 | BLOCKED
5 | - none
6 | 
7 | DEPRECATED
8 | - 9 Implement Token Bucket Rate Limiter Utility
9 | - 13 Author Planning Phase Prompts
10 | - 14 Author Scaffolding Phase Prompts
11 | - 15 Author Testing Phase Prompts
12 | - 16 Author Release Phase Prompts
13 | - 17 Author Post-Release Hardening Prompts
14 | - 18 Integrate and Test Full Metadata Workflow
15 | - 19 Document MCP Evolution Readiness in README
16 | - 20 Align export_task_list with Task Master backlog
```

artifacts/tasks-20250921-173701.json
```
1 | {
2 |   "master": {
3 |     "tasks": [
4 |       {
5 |         "id": 1,
6 |         "title": "Project Setup and Server Bootstrap",
7 |         "description": "Initialize a Node.js TypeScript project and set up the basic MCP server using stdio transport. This includes creating the main entry point, configuring graceful shutdown, and establishing structured NDJSON logging.",
8 |         "details": "Create a `package.json` with dependencies like `@modelcontextprotocol/sdk` and `typescript`. Set up `tsconfig.json` for compilation to `dist/`. Implement the main server file (`src/index.ts`) to instantiate `StdioServerTransport`, register server info (name, version), and handle SIGINT/SIGTERM for graceful shutdown. Implement a basic structured logger that outputs NDJSON.",
9 |         "testStrategy": "Manually start the server and connect with an MCP client like MCP Inspector. Verify that the server reports its name and version. Send a SIGINT signal and confirm the server logs a 'server_stop' message and exits cleanly.",
10 |         "priority": "high",
11 |         "dependencies": [],
12 |         "status": "done",
13 |         "subtasks": [
14 |           {
15 |             "id": 1,
16 |             "title": "Configure package.json and tsconfig.json",
17 |             "description": "Update the project's package.json to include necessary dependencies and scripts. Configure tsconfig.json to define the TypeScript compilation settings, ensuring output is directed to the dist/ directory.",
18 |             "dependencies": [],
19 |             "details": "In `package.json`, add `@modelcontextprotocol/sdk` to `dependencies`. Add `typescript`, `ts-node`, and `@types/node` to `devDependencies`. Add a `build` script (`\"tsc\"`) and a `start` script (`\"node dist/index.js\"`). In `tsconfig.json`, set `compilerOptions.outDir` to `./dist`, `rootDir` to `./src`, and ensure `moduleResolution` is `node`.",
20 |             "status": "done",
21 |             "testStrategy": ""
22 |           },
23 |           {
24 |             "id": 2,
25 |             "title": "Implement a Structured NDJSON Logger",
26 |             "description": "Create a simple logger in `src/logger.ts` that writes structured log messages to `stdout` in NDJSON (Newline Delimited JSON) format. This utility will be used for all server logging.",
27 |             "dependencies": [],
28 |             "details": "Implement a `Logger` class or object in `src/logger.ts` with `info`, `warn`, and `error` methods. Each method should accept a message and an optional metadata object. The output for each log entry must be a single-line JSON string containing a timestamp, log level, message, and any metadata, written to `process.stdout`.",
29 |             "status": "done",
30 |             "testStrategy": ""
31 |           },
32 |           {
33 |             "id": 3,
34 |             "title": "Bootstrap MCP Server with Stdio Transport",
35 |             "description": "In the main entry point `src/index.ts`, initialize the core server components by instantiating the MCP server and the standard I/O transport layer.",
36 |             "dependencies": [
37 |               "1.1",
38 |               "1.2"
39 |             ],
40 |             "details": "In `src/index.ts`, import the logger from `./logger.ts`. Import `MCPServer` and `StdioServerTransport` from `@modelcontextprotocol/sdk`. Inside a `main` async function, instantiate the logger, then the `StdioServerTransport`, and finally the `MCPServer`, passing the transport and logger to its constructor.",
41 |             "status": "done",
42 |             "testStrategy": ""
43 |           },
44 |           {
45 |             "id": 4,
46 |             "title": "Register Server Information and Start Listening",
47 |             "description": "Configure the server with its identity by registering its name and version, and then start the server to begin listening for client connections over stdio.",
48 |             "dependencies": [
49 |               "1.3"
50 |             ],
51 |             "details": "In the `main` function of `src/index.ts`, read the `version` from `package.json`. Call the `server.info.register()` method with a server name (e.g., \"MCP Reference Server\") and the version. After registration, call `server.start()` and log a confirmation message indicating the server is running.",
52 |             "status": "done",
53 |             "testStrategy": "After completing this subtask, run the `start` script. Use an MCP client like MCP Inspector to connect to the running process and verify that the server's name and version are correctly reported."
54 |           },
55 |           {
56 |             "id": 5,
57 |             "title": "Implement Graceful Shutdown and Top-Level Error Handling",
58 |             "description": "Add signal handlers in `src/index.ts` to ensure the server shuts down cleanly on SIGINT/SIGTERM signals and that any uncaught exceptions are logged before exiting.",
59 |             "dependencies": [
60 |               "1.3"
61 |             ],
62 |             "details": "Add listeners for `process.on('SIGINT', ...)` and `process.on('SIGTERM', ...)`. The handler should invoke `await server.stop()`, log a 'server_stop' message, and exit with `process.exit(0)`. Also, implement a `process.on('uncaughtException', ...)` handler to log the fatal error using the NDJSON logger before exiting with a non-zero status code.",
63 |             "status": "done",
64 |             "testStrategy": "With the server running, send a SIGINT signal (Ctrl+C). Verify that the 'server_stop' message is logged in NDJSON format and the process exits cleanly without an error code."
65 |           }
66 |         ]
67 |       },
68 |       {
69 |         "id": 2,
70 |         "title": "Implement Safety Control Utilities",
71 |         "description": "Create utility functions for redacting secrets in logs and capping payload sizes to prevent data leakage and excessive resource usage.",
72 |         "details": "Create a logging utility that wraps the base logger. This utility should scan log objects for keys matching the regex `/(key|secret|token)/i` and replace their values with `[redacted]`. Create a `capPayload` function that truncates strings larger than ~1 MB and appends a note like `[truncated N bytes]`. These utilities should be pure functions and easily testable.",
73 |         "testStrategy": "Unit test the redaction logic by passing objects with keys like `API_KEY` and `SECRET_TOKEN`. Unit test the `capPayload` function with strings smaller than, equal to, and larger than the 1 MB threshold to verify correct truncation and messaging.",
74 |         "priority": "high",
75 |         "dependencies": [
76 |           1
77 |         ],
78 |         "status": "done",
79 |         "subtasks": [
80 |           {
81 |             "id": 1,
82 |             "title": "Create `redactSecrets` Utility Function",
83 |             "description": "Implement a pure function to recursively scan an object and redact values for keys matching a specific regex.",
84 |             "dependencies": [],
85 |             "details": "In a new file, `src/utils/safety.ts`, create and export a pure function `redactSecrets(data: any)`. This function should recursively traverse any given object or array. If it encounters an object key that matches the case-insensitive regex `/(key|secret|token)/i`, it must replace the corresponding value with the string `[redacted]`. The function should handle nested objects and arrays without modifying the original input object (i.e., it should return a new, deep-cloned object).",
86 |             "status": "done",
87 |             "testStrategy": "This function will be tested in a subsequent subtask. Focus on a clean, recursive implementation."
88 |           },
89 |           {
90 |             "id": 2,
91 |             "title": "Create `capPayload` Utility Function",
92 |             "description": "Implement a pure function to truncate large strings to a specified maximum size.",
93 |             "dependencies": [],
94 |             "details": "In the same `src/utils/safety.ts` file, create and export a pure function `capPayload(payload: string, maxSize: number = 1024 * 1024)`. This function will check if the input string's size exceeds `maxSize`. If it does, the function should truncate the string to `maxSize` bytes and append a message indicating how many bytes were removed, e.g., `[truncated 42 bytes]`. If the string is within the limit, it should be returned unmodified.",
95 |             "status": "done",
96 |             "testStrategy": "Testing for this function will be defined in a separate subtask."
97 |           },
98 |           {
99 |             "id": 3,
100 |             "title": "Implement Unit Tests for `redactSecrets`",
101 |             "description": "Create a suite of unit tests to validate the behavior of the `redactSecrets` function.",
102 |             "dependencies": [
103 |               "2.1"
104 |             ],
105 |             "details": "In a new test file, `src/utils/safety.test.ts`, write comprehensive unit tests for the `redactSecrets` function. Test cases should include: an object with sensitive keys (`apiKey`, `SECRET_TOKEN`), a deeply nested object with sensitive keys, an array of objects, an object with no sensitive keys (to ensure it remains unchanged), and non-object inputs to ensure graceful handling.",
106 |             "status": "done",
107 |             "testStrategy": "Use a testing framework like Jest or Vitest. Assert that the original object is not mutated and that the returned object has the correct values redacted."
108 |           },
109 |           {
110 |             "id": 4,
111 |             "title": "Implement Unit Tests for `capPayload`",
112 |             "description": "Create a suite of unit tests to validate the behavior of the `capPayload` function.",
113 |             "dependencies": [
114 |               "2.2"
115 |             ],
116 |             "details": "In the `src/utils/safety.test.ts` file, add unit tests for the `capPayload` function. Cover the main scenarios: a string smaller than the 1MB threshold, a string larger than the threshold (verifying correct truncation and the appended message), and edge cases like an empty string or a string exactly at the threshold.",
117 |             "status": "done",
118 |             "testStrategy": "Verify both the returned string's content and its length to confirm the truncation logic is working as expected."
119 |           },
120 |           {
121 |             "id": 5,
122 |             "title": "Create and Integrate Secure Logger Wrapper",
123 |             "description": "Create a logging utility that wraps the base logger to automatically redact secrets from log objects.",
124 |             "dependencies": [
125 |               "2.1"
126 |             ],
127 |             "details": "Based on the existing logging implementation, create a secure logger wrapper. This wrapper will expose standard logging methods (e.g., `info`, `warn`, `error`). Before passing a log object to the base logger, it must first process the object with the `redactSecrets` function created in subtask 2.1. This ensures that no sensitive data is ever written to the logs. This new utility should be exported for use throughout the application.",
128 |             "status": "done",
129 |             "testStrategy": "Manually inspect log output after integrating the new logger in a test script or a single application entry point to confirm that objects containing keys like 'token' are correctly redacted."
130 |           }
131 |         ]
132 |       },
133 |       {
134 |         "id": 3,
135 |         "title": "Implement Resource Exposure",
136 |         "description": "Load prompt metadata from `resources/prompts.meta.yaml` and expose each prompt's Markdown file as a `file://` resource.",
137 |         "details": "On server startup, parse `prompts.meta.yaml`. For each entry, register a resource with the MCP server. The resource should have a human-friendly name (from the `title` field) and a `file://` URI pointing to the absolute path of the corresponding Markdown file. The resource content preview should be capped using the utility from task 2.",
138 |         "testStrategy": "Start the server and use an MCP client to list resources. Verify that each prompt from the metadata file is listed with the correct name and a valid `file://` URI. Check that reading an oversized resource returns truncated content.",
139 |         "priority": "high",
140 |         "dependencies": [
141 |           1,
142 |           2
143 |         ],
144 |         "status": "done",
145 |         "subtasks": [
146 |           {
147 |             "id": 1,
148 |             "title": "Create a utility to parse `prompts.meta.yaml`",
149 |             "description": "Add the `js-yaml` dependency to the project. Create a new utility function that reads the `resources/prompts.meta.yaml` file, parses its content, and returns a structured object. This function should handle potential file read or parsing errors gracefully.",
150 |             "dependencies": [],
151 |             "details": "Create a new file, e.g., `src/prompts/loader.ts`. Add a function `loadPromptMetadata()` that uses `fs.readFileSync` and `yaml.load`. Define a TypeScript interface for the expected structure of the YAML file (e.g., `{ prompts: [...] }`).",
152 |             "status": "done",
153 |             "testStrategy": "Add a unit test that uses a mock YAML file to ensure the parsing logic correctly converts YAML content to a JavaScript object."
154 |           },
155 |           {
156 |             "id": 2,
157 |             "title": "Implement logic to transform metadata into resource objects",
158 |             "description": "Create a function that takes the parsed prompt metadata, iterates through each prompt entry, and transforms it into a `Resource` object as expected by the MCP server. This includes resolving the file path to an absolute `file://` URI.",
159 |             "dependencies": [
160 |               "3.1"
161 |             ],
162 |             "details": "In `src/prompts/loader.ts`, create a function like `preparePromptResources(metadata)`. For each prompt, use the `path` module to resolve the relative file path from `prompts.meta.yaml` to an absolute path. Format the absolute path as a `file://` URI. The resulting object should conform to the `Resource` interface, which includes `name` (from `title`) and `uri`.",
163 |             "status": "done",
164 |             "testStrategy": "Unit test this transformation logic to ensure file paths are correctly resolved to absolute `file://` URIs on different operating systems."
165 |           },
166 |           {
167 |             "id": 3,
168 |             "title": "Generate and cap content previews for each resource",
169 |             "description": "Enhance the resource preparation logic to read the content of each prompt's Markdown file and generate a capped content preview using the utility from task 2.",
170 |             "dependencies": [
171 |               "3.2"
172 |             ],
173 |             "details": "Modify the function from the previous subtask. For each prompt, read the content of its Markdown file using `fs.readFileSync`. Import and use the `capContent` utility (assuming it's in `src/util/content.ts`) to truncate the file content. Add the resulting string to the `contentPreview` field of the `Resource` object.",
174 |             "status": "done",
175 |             "testStrategy": "Verify that a test resource with content larger than the cap is correctly truncated, and one with smaller content remains unchanged."
176 |           },
177 |           {
178 |             "id": 4,
179 |             "title": "Integrate resource registration into the server startup sequence",
180 |             "description": "In the main server entry point, call the new functions to load, prepare, and register the prompt resources with the MCP server instance after it has been initialized.",
181 |             "dependencies": [
182 |               "3.2",
183 |               "3.3"
184 |             ],
185 |             "details": "Modify `src/main.ts`. After the `MCPServer` instance is created, call the prompt loading and preparation functions. Iterate over the generated list of `Resource` objects and call `mcpServer.registerResource()` for each one. This should happen before the server starts listening for connections.",
186 |             "status": "done",
187 |             "testStrategy": "Manually run the server and check the startup logs for any errors related to resource registration."
188 |           },
189 |           {
190 |             "id": 5,
191 |             "title": "Add an integration test to validate resource exposure",
192 |             "description": "Create a new integration test that starts the server, uses an MCP client to request the list of all available resources, and validates that the prompts from `prompts.meta.yaml` are present with the correct details.",
193 |             "dependencies": [
194 |               "3.4"
195 |             ],
196 |             "details": "In a new test file, e.g., `test/integration/resource.test.ts`, write a test case that connects to the running server. It should call the `list_resources` tool. The test will then assert that the returned list contains entries corresponding to the prompts, verifying the `name`, `uri` (is a valid `file://` URI), and `contentPreview` (is a non-empty, capped string).",
197 |             "status": "done",
198 |             "testStrategy": "This subtask is the test itself. Ensure it covers at least two different prompts from the metadata file."
199 |           }
200 |         ]
201 |       },
202 |       {
203 |         "id": 4,
204 |         "title": "Implement Dynamic Prompt Tools",
205 |         "description": "Expose each prompt defined in `resources/prompts.meta.yaml` as a dynamically generated MCP tool.",
206 |         "details": "During server startup, iterate through the entries in `prompts.meta.yaml`. For each entry, dynamically register an MCP tool with an `id` matching the metadata. Generate input/output schemas based on the metadata. The tool's handler should read the corresponding Markdown file from `resources/prompts/`, append a rendered footer, and return the content, applying the payload cap from task 2.",
207 |         "testStrategy": "Use an MCP client to list tools and verify that a tool exists for each prompt in the metadata file. Invoke a tool and confirm the response contains the correct Markdown content. Test with a prompt file larger than 1 MB to ensure the response is truncated.",
208 |         "priority": "high",
209 |         "dependencies": [
210 |           2,
211 |           3
212 |         ],
213 |         "status": "done",
214 |         "subtasks": [
215 |           {
216 |             "id": 1,
217 |             "title": "Create a Utility to Load and Parse Prompt Metadata",
218 |             "description": "Implement a function that reads `resources/prompts.meta.yaml`, parses it, and returns a validated, typed array of prompt metadata objects. This will serve as the single source of truth for prompt definitions.",
219 |             "dependencies": [],
220 |             "details": "Create a new file `src/lib/prompt-loader.ts`. Add an exported function `loadPromptDefinitions()`. This function should use the `fs` module to read `resources/prompts.meta.yaml` and the `js-yaml` library to parse its content. Define a TypeScript interface for the prompt metadata structure (e.g., `PromptDefinition`) and ensure the parsed data conforms to this type before returning it. This utility will be called during server startup.",
221 |             "status": "done",
222 |             "testStrategy": "Add a unit test to verify that the function correctly parses a sample YAML string and returns the expected array of objects."
223 |           },
224 |           {
225 |             "id": 2,
226 |             "title": "Develop a Generic Handler for Prompt Tools",
227 |             "description": "Create a generic handler function that can be used by all dynamically generated prompt tools. The handler will be responsible for reading the prompt content, appending a footer, and applying the payload cap.",
228 |             "dependencies": [],
229 |             "details": "In a new file, e.g., `src/tools/prompt-handler.ts`, create a factory function `createPromptHandler(promptFilePath: string)`. This function should return an async `ToolHandler` function. The handler will read the file content from the provided `promptFilePath`, append a standard rendered footer (a simple string for now), and then apply the payload capping utility from Task 2 to the final content. The handler should return an object like `{ content: '...' }`.",
230 |             "status": "done",
231 |             "testStrategy": "Unit test the created handler to ensure it reads a file, appends the footer, and correctly truncates content that exceeds the payload cap."
232 |           },
233 |           {
234 |             "id": 3,
235 |             "title": "Implement Dynamic Schema Generation from Metadata",
236 |             "description": "Create a function that generates JSON schemas for a tool's input and output based on the `variables` defined in its metadata.",
237 |             "dependencies": [
238 |               "4.1"
239 |             ],
240 |             "details": "In a new utility file, e.g., `src/lib/schema-generator.ts`, create a function `generateSchemas(metadata: PromptDefinition)`. This function will generate the `inputSchema` by creating a JSON Schema `object` with `properties` corresponding to each item in the metadata's `variables` array. The `outputSchema` should be a static JSON Schema defining an object with a single string property named `content`.",
241 |             "status": "done",
242 |             "testStrategy": "Unit test the schema generator with sample prompt metadata to ensure it produces valid input and output JSON schemas."
243 |           },
244 |           {
245 |             "id": 4,
246 |             "title": "Integrate Dynamic Tool Registration into Server Startup",
247 |             "description": "Modify the server's startup sequence to iterate through the loaded prompt definitions and register an MCP tool for each one.",
248 |             "dependencies": [
249 |               "4.1",
250 |               "4.2",
251 |               "4.3"
252 |             ],
253 |             "details": "In the primary tool registration file (e.g., `src/tools/tool-registry.ts`), create a new async function `registerPromptTools(mcpServer: McpServer)`. This function will call `loadPromptDefinitions()` (from subtask 4.1). It will then loop through each definition, calling `generateSchemas()` (subtask 4.3) and `createPromptHandler()` (subtask 4.2) for each. Finally, it will construct the complete `ToolDefinition` object (with `id`, schemas, and handler) and register it using `mcpServer.registerTool()`. Call this new function from the main server entry point (`src/server.ts`) during initialization.",
254 |             "status": "done",
255 |             "testStrategy": "After implementation, manually start the server and check the logs or use an MCP client to confirm that tools corresponding to `prompts.meta.yaml` are being registered without errors."
256 |           },
257 |           {
258 |             "id": 5,
259 |             "title": "Add Integration Tests for Dynamic Prompt Tools",
260 |             "description": "Implement integration tests to verify that the dynamic tools are correctly exposed and functional through the MCP server.",
261 |             "dependencies": [
262 |               "4.4"
263 |             ],
264 |             "details": "In a new test file under `test/integration/`, write tests that use an MCP client to interact with the running server. One test should list all available tools and assert that a tool exists for each entry in `prompts.meta.yaml`. Another test should invoke a specific prompt tool and validate that the response body contains the expected markdown content. Add a final test using a large (>1MB) prompt file to ensure the response content is correctly truncated by the payload cap.",
265 |             "status": "done",
266 |             "testStrategy": "These are the validation tests themselves. Success is defined by all tests passing in the CI/CD pipeline."
267 |           }
268 |         ]
269 |       },
270 |       {
271 |         "id": 5,
272 |         "title": "Implement Atomic State Store",
273 |         "description": "Create a `StateStore` class to manage workflow state persistence in `.mcp/state.json` using atomic file writes.",
274 |         "details": "Implement a class responsible for reading and writing the `ProjectState` JSON object. The `save` method must be atomic to prevent corruption. This should be achieved by writing the new state to a temporary file in the `.mcp/` directory and then using an atomic `rename` operation to replace the existing `state.json`. The store should also handle creating the `.mcp/` directory if it doesn't exist.",
275 |         "testStrategy": "Write a test that simulates concurrent calls to the `save` method to ensure the final `state.json` file is always valid JSON and not a corrupted, partially written file. Verify that the directory is created if it's missing.",
276 |         "priority": "high",
277 |         "dependencies": [
278 |           1
279 |         ],
280 |         "status": "done",
281 |         "subtasks": [
282 |           {
283 |             "id": 1,
284 |             "title": "Create StateStore Class and Directory Initialization Logic",
285 |             "description": "Create the file `src/state/StateStore.ts` and define the `StateStore` class. The constructor should accept a project root path and ensure the `.mcp` directory exists.",
286 |             "dependencies": [],
287 |             "details": "Define the `StateStore` class in a new file `src/state/StateStore.ts`. The constructor will take `projectRoot: string`. It should define and store private properties for the paths to the `.mcp` directory, `state.json`, and a temporary file like `state.json.tmp`. Implement a private async method that is called by the constructor to create the `.mcp` directory using `fs.promises.mkdir(mcpDir, { recursive: true })`. This ensures all subsequent file operations have a valid directory to work in.",
288 |             "status": "done",
289 |             "testStrategy": "In a unit test, instantiate the class with a path to a temporary directory and assert that the `.mcp` subdirectory is created."
290 |           },
291 |           {
292 |             "id": 2,
293 |             "title": "Implement `load` Method to Read State from Disk",
294 |             "description": "Implement an asynchronous `load` method to read and parse `.mcp/state.json`. It should handle cases where the file doesn't exist by providing a default initial state.",
295 |             "dependencies": [
296 |               "5.1"
297 |             ],
298 |             "details": "Add a public async `load` method to the `StateStore` class. This method will attempt to read `.mcp/state.json` using `fs.promises.readFile`. If the file doesn't exist (catch the 'ENOENT' error), it should initialize a default `ProjectState` object: `{ completedTools: [], artifacts: {} }`. The loaded or default state should be stored in a private property (e.g., `_state`). The method should return the state.",
299 |             "status": "done",
300 |             "testStrategy": "Test that `load` returns the default state when `state.json` is missing. Create a mock `state.json` file and test that `load` correctly reads and parses its content."
301 |           },
302 |           {
[TRUNCATED]
```

bin/prompts
```
1 | #!/usr/bin/env node
2 | 
3 | import('../dist/cli/main.js');
```

docs/client_setup.md
```
1 | # Client Setup — Using the MCP Server from Codex and Gemini
2 | 
3 | This guide provides copy‑paste snippets to register the local MCP stdio server with common clients.
4 | 
5 | ## Prerequisites
6 | 
7 | - Build the project: `npm run build`
8 | - Start the server (read‑only by default):
9 | 
10 | ```bash
11 | node dist/mcp/server.js \
12 |   --tasks .taskmaster/tasks/tasks.json \
13 |   --tag master \
14 |   --write-enabled=false
15 | ```
16 | 
17 | Enable script execution only when ready (optional): add `--exec-enabled` to allow allowlisted scripts via workflow tools.
18 | 
19 | ## Codex CLI (`~/.codex/config.toml`)
20 | 
21 | ```toml
22 | [servers.prompts]
23 | command = "node"
24 | args = [
25 |   "/ABSOLUTE/PATH/TO/repo/dist/mcp/server.js",
26 |   "--tasks", "/ABSOLUTE/PATH/TO/repo/.taskmaster/tasks/tasks.json",
27 |   "--tag", "master",
28 |   # Optional gates
29 |   # "--write-enabled",
30 |   # "--exec-enabled"
31 | ]
32 | transport = "stdio"
33 | ```
34 | 
35 | WSL path example (Windows hosts): `/c/Users/<you>/code/prompts/dist/mcp/server.js`.
36 | 
37 | ## Gemini CLI (`~/.gemini/settings.json`)
38 | 
39 | ```json
40 | {
41 |   "servers": [
42 |     {
43 |       "name": "prompts",
44 |       "command": "node",
45 |       "args": [
46 |         "/ABSOLUTE/PATH/TO/repo/dist/mcp/server.js",
47 |         "--tasks", "/ABSOLUTE/PATH/TO/repo/.taskmaster/tasks/tasks.json",
48 |         "--tag", "master"
49 |       ],
50 |       "transport": "stdio"
51 |     }
52 |   ]
53 | }
54 | ```
55 | 
56 | ## Verifying the connection
57 | 
58 | From your client, list tools and call a read‑only method:
59 | 
60 | ```bash
61 | # Pseudocode — exact commands depend on the client
62 | mcp tools list --server prompts
63 | mcp tools call --server prompts --name next_task --args '{}'
64 | ```
65 | 
66 | You should receive a JSON result like `{ task, ready }`. If not, confirm the absolute paths above are correct.
67 | 
68 | ## Safety and execution
69 | 
70 | - The server is read‑only by default; `--write-enabled` must be set to persist status changes.
71 | - Script execution is disabled by default; add `--exec-enabled` to allow calling `workflow/run_script`, `workflow/run_task_action`, and domain wrappers. Scripts must also be listed in `package.json#mcpAllowScripts`.
72 | 
```

docs/mcp-cli.md
```
1 | # MCP Server & CLI Quick Reference
2 | 
3 | This guide covers the two primary ways to interact with the Task-Master aware workflow logic exposed from this repository: the Commander-based CLI and the stdio Model Context Protocol (MCP) server.
4 | 
5 | ## CLI Overview (`npm run prompts`)
6 | 
7 | The CLI wraps the same shared utilities as the MCP server. Every command accepts the common options listed below and emits machine-readable JSON (or DOT) so it can be scripted in CI or other tooling.
8 | 
9 | ### Common options
10 | 
11 | | Option | Default | Purpose |
12 | | ------ | ------- | ------- |
13 | | `--tasks <path>` | `.taskmaster/tasks/tasks.json` | Source Task-Master file to ingest. |
14 | | `--tag <tag>` | `master` | Named tag within `tasks.json` to load when using tagged files. |
15 | | `--write` | _unset_ | Enable persistence for commands that mutate state (currently `advance`). |
16 | | `--pretty` | _unset_ | Pretty-print JSON output for easier inspection. |
17 | 
18 | ### Commands
19 | 
20 | | Command | Description | Example |
21 | | ------- | ----------- | ------- |
22 | | `ingest` | Validate and normalize Task-Master data. Returns `{ tasks, report }`. | `npm run prompts -- ingest --pretty` |
23 | | `next` | Return the highest-priority ready task plus the ready queue. | `npm run prompts -- next` |
24 | | `advance <id> <status>` | Update a task status. Use `--write` to persist. | `npm run prompts -- advance 21 done --write` |
25 | | `graph [--format dot|json]` | Export dependency graph as JSON (default) or DOT text. | `npm run prompts -- graph --format dot` |
26 | | `status` | Summarise totals, ready tasks, and the current `next` pick. | `npm run prompts -- status --pretty` |
27 | 
28 | > **Tip:** All commands run in dry-run mode by default. Supplying `--write` is the only way to persist changes back to `tasks.json`.
29 | 
30 | ## MCP Server (`dist/mcp/server.js`)
31 | 
32 | The MCP server exposes the same domain logic over stdio so Codex, Gemini, Cursor, and other MCP-aware clients can consume it.
33 | 
34 | ### Launching the server
35 | 
36 | 1. Build the project: `npm run build`.
37 | 2. Start the server with stdio transport:
38 | 
39 |    ```bash
40 |    node dist/mcp/server.js \
41 |      --tasks /path/to/tasks.json \
42 |      --tag master \
43 |      --write=false
44 |    ```
45 | 
46 | 3. Register the process with your client as a Command (stdio) MCP server.
47 | 
48 | ### Tool surface
49 | 
50 | | Tool | Description | Notes |
51 | | ---- | ----------- | ----- |
52 | | `next_task` | Returns `{ task, ready }` using readiness rules. | Read-only. |
53 | | `list_tasks` | Returns `{ tasks }` as normalized by the ingest adapter. | Read-only. |
54 | | `get_task` | Returns `{ task }` for a numeric ID. | Read-only. |
55 | | `graph_export` | Returns `{ nodes }` for DOT graph generation. | Read-only. |
56 | | `set_task_status` | Returns `{ task, persisted }`. Persists only when server started with `--write=true`. | Mutating. |
57 | | `workflow/refresh_metadata` | Rebuilds catalog artifacts. | Matches CLI tooling. |
58 | | `workflow/export_task_list` | Emits curated task list for clients. | Matches CLI tooling. |
59 | | `workflow/advance_state` | Records tool completions into `.mcp/state.json`. | Mutating. |
60 | | `workflow/run_script` | Executes an allowlisted npm script. | Dry-run supported; gated for safety. |
61 | | `workflow/run_task_action` | Resolves `{script,args}` by task id (metadata or actions.json) and executes via `run_script`. | Dry-run supported; gated for safety. |
62 | | `workflow/run_tests` | Runs project tests via allowlisted script. | Wrapper around `run_script`. |
63 | | `workflow/run_build` | Runs project build via allowlisted script. | Wrapper around `run_script`. |
64 | | `workflow/run_lint` | Runs project lint via allowlisted script. | Wrapper around `run_script`. |
65 | 
66 | ### How this improves your workflow (use cases)
67 | 
68 | - Personal triage: ask for `next_task` to focus on the highest-value work that is actually unblocked.
69 | - Fast status hygiene: flip status with `set_task_status` right from your AI client; plans and dashboards stay accurate.
70 | - Planning visibility: `graph_export` and `workflow/export_task_list` power simple dashboards and dependency views.
71 | - Safer automation: default read-only mode lets agents explore without side effects; opt-in `--write=true` when ready.
72 | 
73 | ### End-to-end example (copy/paste)
74 | 
75 | 1. Start server (read-only):
76 | 
77 | ```bash
78 | node dist/mcp/server.js --tasks .taskmaster/tasks/tasks.json --tag master --write=false
79 | ```
80 | 
81 | 2. From your MCP client:
82 | 
83 | - Call `next_task` → returns `{ task, ready }`.
84 | - Do the work locally.
85 | 
86 | 3. Persist status (enable write mode):
87 | 
88 | ```bash
89 | node dist/mcp/server.js --tasks .taskmaster/tasks/tasks.json --tag master --write=true
90 | ```
91 | 
92 | - Call `set_task_status` with the chosen `id` and status (e.g., `done`).
93 | - Optionally call `workflow/advance_state` to attach artifacts or notes.
94 | 
95 | 4. Re-plan and visualize:
96 | 
97 | - Call `graph_export` for `{ nodes }` (render DOT in your tooling if desired).
98 | - Call `workflow/export_task_list` to feed a lightweight dashboard.
99 | 
100 | ### Troubleshooting / FAQ
101 | 
102 | - Schema not found when embedding: the server resolves `schemas/task.json` relative to the module/package by default. You can also pass an absolute override via the ingest options (programmatic) or ensure the packaged `schemas/` directory ships with your distribution (it does in this repo).
103 | - Write mode: you’ll see `persisted: false` until the server is launched with `--write=true`.
104 | - Logging: protocol JSON uses stdout; logs are emitted to stderr. If your client shows garbled output, ensure stdout isn’t mixed with logs.
105 | 
106 | ### Client configuration snippets
107 | 
108 | **Codex CLI (`~/.codex/config.toml`):**
109 | 
110 | ```toml
111 | [servers.prompts]
112 | command = "node"
113 | args = [
114 |   "/path/to/repo/dist/mcp/server.js",
115 |   "--tasks", "/path/to/tasks.json",
116 |   "--tag", "master",
117 |   "--exec-enabled" # Optional: enable execution of allowlisted scripts
118 | ]
119 | transport = "stdio"
120 | ```
121 | 
122 | **Gemini CLI (`~/.gemini/settings.json`):**
123 | 
124 | ```json
125 | {
126 |   "servers": [
127 |     {
128 |       "name": "prompts",
129 |       "command": "node",
130 |       "args": [
131 |         "/path/to/repo/dist/mcp/server.js",
132 |         "--tasks",
133 |         "/path/to/tasks.json",
134 |         "--tag",
135 |         "master",
136 |         "--exec-enabled" // Optional: enable execution of allowlisted scripts
137 |       ]
138 |     }
139 |   ]
140 | }
141 | ```
142 | 
143 | > Replace `/path/to/repo` with the absolute path to your checkout. On Windows via WSL use the `/c/Users/<you>/...` format expected by many MCP clients.
144 | 
145 | ### Write-mode safety
146 | 
147 | - `--write=false` (default) guarantees no filesystem mutations; MCP clients can explore tasks safely.
148 | - Setting `--write=true` enables `set_task_status` and `workflow/advance_state` to persist changes. Use in controlled environments only.
149 | 
150 | ### Execution and gating
151 | 
152 | - Execution of local scripts is disabled by default to avoid side effects.
153 | - Two layers of safety must be satisfied:
154 |   - Allowlist: scripts must appear in `package.json#mcpAllowScripts`.
155 |   - Exec gate: either set environment `PROMPTS_EXEC_ALLOW=1` or launch the server with `--exec-enabled`.
156 | - Most execution tools support `dryRun: true` so you can preview the exact command before allowing live runs.
157 | - Actions by task id: `workflow/run_task_action` looks for `{ metadata.action: {script,args} }` on a task or in an `actions.json` mapping (keyed by task id) and dispatches through the same safe path.
158 | 
159 | #### actions.json format (for run_task_action)
160 | 
161 | `workflow/run_task_action` can resolve a task’s execution action from either the task’s own metadata or from a repo-level mapping file. The default mapping file name is `actions.json` (relative to the server’s working directory); you can override the path by passing the optional `actionsPath` input.
162 | 
163 | Schema and example:
164 | 
165 | ```json
166 | {
167 |   "<taskId>": {
168 |     "script": "<npm-script-name>",
169 |     "args": ["optional", "args"]
170 |   }
171 | }
172 | ```
173 | 
174 | Example `examples/actions.json`:
175 | 
176 | ```json
177 | {
178 |   "37": { "script": "noop" },
179 |   "41": { "script": "build" },
180 |   "42": { "script": "test:jest", "args": ["-t", "agent-smoke"] }
181 | }
182 | ```
183 | 
184 | Notes:
185 | 
186 | - Keys are task ids as strings; values provide the npm `script` to run and optional `args`.
187 | - Task-local override: if a task has `metadata.action = { script, args }`, that wins over `actions.json`.
188 | - Safety still applies: the referenced scripts must be listed under `package.json#mcpAllowScripts`, and execution requires the `--exec-enabled` flag (or `PROMPTS_EXEC_ALLOW=1`).
189 | 
190 | ## Keeping docs in sync
191 | 
192 | Whenever the CLI or MCP surface changes:
193 | 
194 | 1. Update this reference and the relevant sections in `README.md`.
195 | 2. Regenerate any examples if argument defaults change.
196 | 3. Re-run `npm run test:jest` to ensure the action-layer tests still cover the updated behaviour.
```

docs/observability.md
```
1 | # Observability & Secure Logging
2 | 
3 | This project emits structured NDJSON logs to stderr. By default, sensitive fields in log metadata are redacted (keys matching `/key|secret|token/i`).
4 | 
5 | ## CLI flags
6 | 
7 | - `--verbose`: emit start/end markers and additional structured diagnostics on stderr.
8 | - `--unsafe-logs`: disable metadata redaction (not recommended).
9 | 
10 | Example:
11 | 
12 | ```bash
13 | prompts next --verbose --tasks .taskmaster/tasks/tasks.json --tag master
14 | ```
15 | 
16 | ## Server flags
17 | 
18 | The MCP server supports the same concepts:
19 | 
20 | - `--verbose`: emits a `verbose_mode_enabled` line on startup.
21 | - `--unsafe-logs`: disables redaction when creating the secure logger.
22 | 
23 | Example:
24 | 
25 | ```bash
26 | node dist/mcp/server.js --tasks .taskmaster/tasks/tasks.json --tag master --verbose
27 | ```
28 | 
29 | ## Redaction notes
30 | 
31 | - Redaction only touches log metadata objects; the log message string is not altered.
32 | - Avoid logging full task payloads. Prefer lightweight identifiers or summaries.
33 | - Use `--unsafe-logs` only for local debugging with care.
34 | 
```

examples/actions.json
```
1 | {
2 |   "37": { "script": "noop" },
3 |   "41": { "script": "build" },
4 |   "42": { "script": "test:jest", "args": ["-t", "agent-smoke"] }
5 | }
```

examples/agent-demo.md
```
1 | # Agent Demo — Daily Flow with MCP Tools
2 | 
3 | This example shows how a lightweight agent (or script) can wire `@prompts/tools` and the MCP server/CLI logic into a daily loop.
4 | 
5 | ## Why
6 | 
7 | - Always know what to do next (dependency-aware).
8 | - Close the loop quickly with status updates.
9 | - Keep dashboards and teammates in sync via shared logic.
10 | 
11 | ## Minimal agent pseudo-code
12 | 
13 | ```ts
14 | import { createPromptsTools, NextTaskInput, SetTaskStatusInput } from '@prompts/tools';
15 | import { TaskService } from '../src/mcp/task-service.ts';
16 | 
17 | const service = new TaskService({ tasksPath: '.taskmaster/tasks/tasks.json', tag: 'master', writeEnabled: true });
18 | await service.load();
19 | 
20 | const tools = createPromptsTools({
21 |   service: {
22 |     list: () => service.list(),
23 |     next: () => service.next(),
24 |     graph: () => service.graph(),
25 |     setStatus: (id, status) => service.setStatus(id, status),
26 |   },
27 | });
28 | 
29 | // 1) Plan next step
30 | const { task } = await tools.nextTask.run(NextTaskInput.parse({}));
31 | if (!task) process.exit(0);
32 | 
33 | // 2) Execute your change (omitted)
34 | 
35 | // 3) Record completion
36 | await tools.setTaskStatus.run(SetTaskStatusInput.parse({ id: task.id, status: 'done' }));
37 | 
38 | // 4) Re-plan (loop)
39 | ```
40 | 
41 | ## MCP client tips
42 | 
43 | - Start server read-only for exploration: `node dist/mcp/server.js --write=false`.
44 | - Switch to `--write=true` when you’re ready to persist `set_task_status` or `workflow/advance_state` changes.
45 | - For executing local scripts safely, prefer `workflow/run_task_action`:
46 |   - Map `{script,args}` via task metadata or `actions.json` keyed by task id.
47 |   - Preview with `dryRun: true`.
48 |   - Enable live runs by launching with `--exec-enabled` (or setting `PROMPTS_EXEC_ALLOW=1`).
49 | - Use `graph_export` and `workflow/export_task_list` to power dashboards or PR annotations.
```

packages/.gitkeep
```
```

resources/default-graph.json
```
1 | {
2 |   "nodes": [
3 |     {
4 |       "id": "instruction-file",
5 |       "title": "Instruction File",
6 |       "phase": 0,
7 |       "dependsOn": [],
8 |       "requiresArtifacts": []
9 |     },
10 |     {
11 |       "id": "planning-process",
12 |       "title": "Planning Process",
13 |       "phase": 1,
14 |       "dependsOn": ["instruction-file"],
15 |       "requiresArtifacts": []
16 |     },
17 |     {
18 |       "id": "scope-control",
19 |       "title": "Scope Control",
20 |       "phase": 1,
21 |       "dependsOn": ["planning-process"],
22 |       "requiresArtifacts": []
23 |     },
24 |     {
25 |       "id": "integration-test",
26 |       "title": "Integration Test",
27 |       "phase": 5,
28 |       "dependsOn": ["scope-control"],
29 |       "requiresArtifacts": []
30 |     },
31 |     {
32 |       "id": "regression-guard",
33 |       "title": "Regression Guard",
34 |       "phase": 5,
35 |       "dependsOn": ["integration-test"],
36 |       "requiresArtifacts": ["test_results"]
37 |     },
38 |     {
39 |       "id": "release-notes",
40 |       "title": "Release Notes",
41 |       "phase": 7,
42 |       "dependsOn": ["regression-guard"],
43 |       "requiresArtifacts": ["release_notes_context"]
44 |     }
45 |   ]
46 | }
```

resources/prompts.meta.yaml
```
1 | # Prompt metadata used by the MCP server to expose prompt resources and tools.
2 | # Each entry maps a markdown playbook to its display metadata and prerequisites.
3 | - id: instruction-file
4 |   title: "Instruction File"
5 |   description: "Generate or update project instruction guardrails before any planning work."
6 |   path: "instruction-file.md"
7 |   phase: "P0 Preflight Docs"
8 |   gate: "DocFetchReport"
9 |   tags:
10 |     - preflight
11 |     - documentation
12 |   dependsOn: []
13 |   variables: []
14 | 
15 | - id: planning-process
16 |   title: "Planning Process"
17 |   description: "Draft and refine PLAN.md with goals, milestones, and validation steps."
18 |   path: "planning-process.md"
19 |   phase: "P1 Plan & Scope"
20 |   gate: "Scope Gate"
21 |   tags:
22 |     - planning
23 |     - scope
24 |   dependsOn:
25 |     - instruction-file
26 |   variables: []
27 | 
28 | - id: scope-control
29 |   title: "Scope Control"
30 |   description: "Enforce scope boundaries and keep Won't Do and Ideas for later lists current."
31 |   path: "scope-control.md"
32 |   phase: "P1 Plan & Scope"
33 |   gate: "Scope Gate"
34 |   tags:
35 |     - planning
36 |     - scope
37 |   dependsOn:
38 |     - planning-process
39 |   variables: []
40 | 
41 | - id: integration-test
42 |   title: "Integration Test"
43 |   description: "Author end-to-end tests for the critical happy path before merging."
44 |   path: "integration-test.md"
45 |   phase: "P5 Quality Gates & Tests"
46 |   gate: "Test Gate"
47 |   tags:
48 |     - testing
49 |     - quality
50 |   dependsOn:
51 |     - scope-control
52 |   variables: []
53 | 
54 | - id: regression-guard
55 |   title: "Regression Guard"
56 |   description: "Detect unrelated diffs and add regression coverage before hand-off."
57 |   path: "regression-guard.md"
58 |   phase: "P5 Quality Gates & Tests"
59 |   gate: "Test Gate"
60 |   tags:
61 |     - testing
62 |     - quality
63 |   dependsOn:
64 |     - integration-test
65 |   variables: []
66 | 
67 | - id: release-notes
68 |   title: "Release Notes"
69 |   description: "Summarize recent commits into human-readable release notes grouped by type."
70 |   path: "release-notes.md"
71 |   phase: "P7 Release & Ops"
72 |   gate: "Release Gate"
73 |   tags:
74 |     - release
75 |     - communication
76 |   dependsOn:
77 |     - regression-guard
78 |   variables:
79 |     - name: range
80 |       description: "Git commit range or revision selector passed to git log."
81 |       type: string
82 |       required: false
```

schemas/.gitkeep
```
```

schemas/task.json
```
1 | {
2 |   "$schema": "http://json-schema.org/draft-07/schema#",
3 |   "$id": "https://acidosoil.github.io/prompts/schemas/task.json",
4 |   "title": "Prompts Task",
5 |   "description": "Superset schema for Task-Master tasks with optional Prompts-specific metadata.",
6 |   "type": "object",
7 |   "additionalProperties": false,
8 |   "required": [
9 |     "id",
10 |     "title",
11 |     "description",
12 |     "status",
13 |     "dependencies",
14 |     "priority",
15 |     "details",
16 |     "testStrategy",
17 |     "subtasks"
18 |   ],
19 |   "properties": {
20 |     "id": {
21 |       "description": "Task identifier that must remain identical to Task-Master IDs.",
22 |       "type": "integer",
23 |       "minimum": 1
24 |     },
25 |     "title": {
26 |       "type": "string",
27 |       "minLength": 1
28 |     },
29 |     "description": {
30 |       "type": "string"
31 |     },
32 |     "details": {
33 |       "type": "string"
34 |     },
35 |     "testStrategy": {
36 |       "type": "string"
37 |     },
38 |     "status": {
39 |       "description": "Current task status using Task-Master canonical values and supported aliases.",
40 |       "type": "string",
41 |       "enum": [
42 |         "pending",
43 |         "in_progress",
44 |         "in-progress",
45 |         "blocked",
46 |         "done",
47 |         "deprecated"
48 |       ]
49 |     },
50 |     "priority": {
51 |       "description": "Task execution priority.",
52 |       "type": "string",
53 |       "enum": ["high", "medium", "low"]
54 |     },
55 |     "dependencies": {
56 |       "description": "List of prerequisite task IDs.",
57 |       "type": "array",
58 |       "items": {
59 |         "type": "integer",
60 |         "minimum": 1
61 |       },
62 |       "default": []
63 |     },
64 |     "subtasks": {
65 |       "type": "array",
66 |       "items": {"$ref": "#/definitions/Subtask"},
67 |       "default": []
68 |     },
69 |     "labels": {
70 |       "description": "Optional tags preserved for Prompts-specific metadata.",
71 |       "type": "array",
72 |       "items": {"type": "string"},
73 |       "default": []
74 |     },
75 |     "metadata": {
76 |       "description": "Flexible key/value metadata captured during ingestion.",
77 |       "type": "object",
78 |       "additionalProperties": true
79 |     },
80 |     "evidence": {
81 |       "description": "Evidence entries supporting task decisions.",
82 |       "type": "array",
83 |       "items": {
84 |         "oneOf": [
85 |           {"type": "string"},
86 |           {
87 |             "type": "object",
88 |             "additionalProperties": false,
89 |             "properties": {
90 |               "source": {"type": "string"},
91 |               "summary": {"type": "string"},
92 |               "date": {"type": "string", "format": "date"},
93 |               "link": {"type": "string", "format": "uri"}
94 |             }
95 |           }
96 |         ]
97 |       }
98 |     },
99 |     "artifacts": {
100 |       "description": "Artifacts attached to the task (files, reports, etc.).",
101 |       "type": "array",
102 |       "items": {
103 |         "oneOf": [
104 |           {"type": "string"},
105 |           {
106 |             "type": "object",
107 |             "additionalProperties": false,
108 |             "properties": {
109 |               "name": {"type": "string"},
110 |               "path": {"type": "string"},
111 |               "type": {"type": "string"}
112 |             },
113 |             "required": ["name"]
114 |           }
115 |         ]
116 |       }
117 |     },
118 |     "source_doc": {
119 |       "description": "Document path that introduced or last updated the task.",
120 |       "type": "string"
121 |     },
122 |     "lineage": {
123 |       "description": "Origin task IDs that this task derives from.",
124 |       "type": "array",
125 |       "items": {"type": "integer", "minimum": 1},
126 |       "default": []
127 |     },
128 |     "supersedes": {
129 |       "description": "Tasks replaced by this item.",
130 |       "type": "array",
131 |       "items": {"type": "integer", "minimum": 1},
132 |       "default": []
133 |     },
134 |     "superseded_by": {
135 |       "description": "Tasks that supersede this one.",
136 |       "type": "array",
137 |       "items": {"type": "integer", "minimum": 1},
138 |       "default": []
139 |     },
140 |     "reason": {
141 |       "description": "Human-readable explanation for deprecated/blocked states.",
142 |       "type": "string"
143 |     }
144 |   },
145 |   "definitions": {
146 |     "Subtask": {
147 |       "type": "object",
148 |       "additionalProperties": false,
149 |       "required": ["id", "title"],
150 |       "properties": {
151 |         "id": {
152 |           "type": "integer",
153 |           "minimum": 1
154 |         },
155 |         "title": {
156 |           "type": "string",
157 |           "minLength": 1
158 |         },
159 |         "description": {"type": "string"},
160 |         "details": {"type": "string"},
161 |         "testStrategy": {"type": "string"},
162 |         "status": {
163 |           "type": "string",
164 |           "enum": [
165 |             "pending",
166 |             "in_progress",
167 |             "in-progress",
168 |             "blocked",
169 |             "done",
170 |             "deprecated"
171 |           ]
172 |         },
173 |         "parentTaskId": {"type": "integer", "minimum": 1},
174 |         "dependencies": {
175 |           "type": "array",
176 |           "items": {
177 |             "oneOf": [
178 |               {"type": "integer", "minimum": 1},
179 |               {"type": "string", "pattern": "^\\d+(\\.\\d+)?$"}
180 |             ]
181 |           },
182 |           "default": []
183 |         }
184 |       }
185 |     }
186 |   }
187 | }
```

scripts/build_catalog.ts
```
1 | import { promises as fs } from 'fs';
2 | import path from 'path';
3 | import { fileURLToPath } from 'url';
4 | 
5 | import type { MetadataValue } from './front_matter.ts';
6 | import { parseFrontMatter } from './front_matter.ts';
7 | import { collectMarkdownFiles, loadPhases } from './markdown_utils.ts';
8 | import type { PromptCatalog, PromptCatalogEntry } from './catalog_types.ts';
9 | import { normalizePhaseLabel } from './catalog_types.ts';
10 | import { writeFileAtomic } from './file_utils.ts';
11 | import { generateDocs, synchronizeWorkflowDoc } from './generate_docs.ts';
12 | 
13 | const moduleDir = path.dirname(fileURLToPath(import.meta.url));
14 | 
15 | type PromptMetadata = Record<string, MetadataValue | undefined> & {
16 |   phase?: MetadataValue;
17 |   gate?: MetadataValue;
18 |   status?: MetadataValue;
19 |   previous?: MetadataValue;
20 |   next?: MetadataValue;
21 | };
22 | 
23 | interface MissingPhaseRecord {
24 |   label: string;
25 |   files: Set<string>;
26 | }
27 | 
28 | async function main(): Promise<void> {
29 |   const args = new Set(process.argv.slice(2));
30 |   const updateWorkflow = args.has('--update-workflow');
31 |   const repoRoot = path.resolve(moduleDir, '..');
32 |   const workflowPath = path.join(repoRoot, 'WORKFLOW.md');
33 |   let validPhases = await loadPhases(workflowPath);
34 |   let normalizedPhaseLookup = buildNormalizedPhaseSet(validPhases);
35 |   const markdownFiles = await collectMarkdownFiles(repoRoot);
36 | 
37 |   const phaseBuckets = new Map<string, PromptCatalogEntry[]>();
38 |   const commandIndex = new Map<string, string>();
39 |   const errors: string[] = [];
40 |   const missingPhases = new Map<string, MissingPhaseRecord>();
41 | 
42 |   for (const filePath of markdownFiles) {
43 |     const relativePath = path.relative(repoRoot, filePath);
44 |     const content = await fs.readFile(filePath, 'utf8');
45 |     const parsed = parseFrontMatter(content);
46 |     if (!parsed) {
47 |       continue;
48 |     }
49 | 
50 |     const metadata = parsed.metadata as PromptMetadata;
51 |     const metadataErrors: string[] = [];
52 | 
53 |     const phases = extractPhases(metadata.phase, relativePath, metadataErrors);
54 |     const gate = extractString(metadata.gate, 'gate', relativePath, metadataErrors);
55 |     const status = extractString(metadata.status, 'status', relativePath, metadataErrors);
56 |     const previous = extractStringArray(metadata.previous, 'previous', relativePath, metadataErrors);
57 |     const next = extractStringArray(metadata.next, 'next', relativePath, metadataErrors);
58 | 
59 |     if (metadataErrors.length > 0) {
60 |       errors.push(...metadataErrors);
61 |       continue;
62 |     }
63 | 
64 |     const body = content.slice(parsed.endOffset);
65 |     const title = extractTitle(body, relativePath);
66 |     const command = extractCommand(body, relativePath);
67 |     const purpose = extractPurpose(body) ?? '';
68 | 
69 |     registerCommand(commandIndex, command, relativePath, errors);
70 | 
71 |     for (const phaseLabel of phases) {
72 |       const normalizedPhase = normalizePhaseLabel(phaseLabel);
73 |       if (!phaseExists(normalizedPhase, normalizedPhaseLookup)) {
74 |         const existing = missingPhases.get(normalizedPhase);
75 |         if (existing) {
76 |           existing.files.add(relativePath);
77 |         } else {
78 |           missingPhases.set(normalizedPhase, { label: phaseLabel, files: new Set([relativePath]) });
79 |         }
80 |         if (!updateWorkflow) {
81 |           errors.push(`${relativePath}: phase "${phaseLabel}" not found in WORKFLOW.md.`);
82 |         }
83 |       }
84 | 
85 |       const entry: PromptCatalogEntry = {
86 |         phase: phaseLabel,
87 |         command,
88 |         title,
89 |         purpose,
90 |         gate,
91 |         status,
92 |         previous,
93 |         next,
94 |         path: relativePath,
95 |       };
96 |       const bucket = phaseBuckets.get(normalizedPhase);
97 |       if (bucket) {
98 |         bucket.push(entry);
99 |       } else {
100 |         phaseBuckets.set(normalizedPhase, [entry]);
101 |       }
102 |     }
103 |   }
104 | 
105 |   const { catalog: ordered, sortedKeys } = buildOrderedCatalog(phaseBuckets);
106 | 
107 |   if (updateWorkflow && missingPhases.size > 0) {
108 |     const workflowUpdated = await synchronizeWorkflowDoc(repoRoot, ordered);
109 |     if (workflowUpdated) {
110 |       console.log('Inserted missing phases into WORKFLOW.md before catalog generation.');
111 |     }
112 |     validPhases = await loadPhases(workflowPath);
113 |     normalizedPhaseLookup = buildNormalizedPhaseSet(validPhases);
114 |     for (const [normalized, record] of missingPhases) {
115 |       if (phaseExists(normalized, normalizedPhaseLookup)) {
116 |         continue;
117 |       }
118 |       const files = Array.from(record.files).sort();
119 |       errors.push(
120 |         `Phase "${record.label}" referenced in ${files.join(', ')} is missing from WORKFLOW.md after synchronization.`,
121 |       );
122 |     }
123 |   }
124 | 
125 |   if (errors.length > 0) {
126 |     console.error('Failed to build catalog:\n');
127 |     for (const error of errors) {
128 |       console.error(`- ${error}`);
129 |     }
130 |     process.exitCode = 1;
131 |     return;
132 |   }
133 | 
134 |   const catalogPath = path.join(repoRoot, 'catalog.json');
135 |   const catalogPayload = `${JSON.stringify(ordered, null, 2)}\n`;
136 |   const catalogUpdated = await writeFileAtomic(catalogPath, catalogPayload);
137 |   if (catalogUpdated) {
138 |     console.log(`Wrote catalog with ${sortedKeys.length} phase group(s) to ${catalogPath}`);
139 |   } else {
140 |     console.log(`Catalog already up to date at ${catalogPath}`);
141 |   }
142 | 
143 |   await generateDocs(repoRoot, ordered, { updateWorkflow });
144 | }
145 | 
146 | function buildOrderedCatalog(
147 |   buckets: Map<string, PromptCatalogEntry[]>,
148 | ): { catalog: PromptCatalog; sortedKeys: string[] } {
149 |   const sortedKeys = Array.from(buckets.keys()).sort((a, b) => a.localeCompare(b));
150 |   const catalog: PromptCatalog = {};
151 |   for (const key of sortedKeys) {
152 |     const prompts = buckets.get(key);
153 |     if (!prompts) {
154 |       continue;
155 |     }
156 |     catalog[key] = prompts.slice().sort((a, b) => a.command.localeCompare(b.command));
157 |   }
158 |   return { catalog, sortedKeys: Object.keys(catalog) };
159 | }
160 | 
161 | function extractPhases(
162 |   value: MetadataValue | undefined,
163 |   file: string,
164 |   errors: string[],
165 | ): string[] {
166 |   if (value === undefined) {
167 |     errors.push(`${file}: missing required field "phase".`);
168 |     return [];
169 |   }
170 |   const raw = Array.isArray(value) ? value : [value];
171 |   if (raw.length === 0) {
172 |     errors.push(`${file}: "phase" must contain at least one entry.`);
173 |     return [];
174 |   }
175 |   const phases: string[] = [];
176 |   for (const item of raw) {
177 |     if (typeof item !== 'string' || item.trim() === '') {
178 |       errors.push(`${file}: "phase" contains an invalid value.`);
179 |       continue;
180 |     }
181 |     phases.push(item.trim());
182 |   }
183 |   return phases;
184 | }
185 | 
186 | function extractString(
187 |   value: MetadataValue | undefined,
188 |   field: string,
189 |   file: string,
190 |   errors: string[],
191 | ): string {
192 |   if (typeof value !== 'string' || value.trim() === '') {
193 |     errors.push(`${file}: missing or empty "${field}".`);
194 |     return '';
195 |   }
196 |   return value.trim();
197 | }
198 | 
199 | function extractStringArray(
200 |   value: MetadataValue | undefined,
201 |   field: string,
202 |   file: string,
203 |   errors: string[],
204 | ): string[] {
205 |   if (!Array.isArray(value) || value.length === 0) {
206 |     errors.push(`${file}: "${field}" must be a non-empty array.`);
207 |     return [];
208 |   }
209 |   const result: string[] = [];
210 |   for (const item of value) {
211 |     if (typeof item !== 'string' || item.trim() === '') {
212 |       errors.push(`${file}: "${field}" contains an invalid entry.`);
213 |       continue;
214 |     }
215 |     result.push(item.trim());
216 |   }
217 |   return result;
218 | }
219 | 
220 | function extractTitle(body: string, file: string): string {
221 |   const headingMatch = body.match(/^#\s+(.+)$/m);
222 |   if (headingMatch) {
223 |     return headingMatch[1].trim();
224 |   }
225 |   const base = path.basename(file, path.extname(file));
226 |   const words = base.split(/[-_]+/).filter(Boolean);
227 |   if (words.length === 0) {
228 |     return base;
229 |   }
230 |   return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
231 | }
232 | 
233 | function extractCommand(body: string, file: string): string {
234 |   const command = extractField(body, 'Trigger');
235 |   if (command) {
236 |     return command;
237 |   }
238 |   const fallback = path.basename(file, path.extname(file));
239 |   return `/${fallback}`;
240 | }
241 | 
242 | function extractPurpose(body: string): string | null {
243 |   return extractField(body, 'Purpose');
244 | }
245 | 
246 | function extractField(body: string, label: string): string | null {
247 |   const lines = body.split(/\r?\n/);
248 |   const target = `${label.toLowerCase()}:`;
249 |   for (const rawLine of lines) {
250 |     const trimmed = rawLine.trim();
251 |     if (!trimmed) {
252 |       continue;
253 |     }
254 |     const sanitized = trimmed.replace(/\*\*/g, '').replace(/__/g, '');
255 |     if (!sanitized.toLowerCase().startsWith(target)) {
256 |       continue;
257 |     }
258 |     const value = sanitized.slice(target.length).trim();
259 |     return stripFormatting(value);
260 |   }
261 |   return null;
262 | }
263 | 
264 | function stripFormatting(value: string): string {
265 |   let result = value.trim();
266 |   if ((result.startsWith('`') && result.endsWith('`')) || (result.startsWith('"') && result.endsWith('"'))) {
267 |     result = result.slice(1, -1).trim();
268 |   }
269 |   if (result.startsWith("'") && result.endsWith("'")) {
270 |     result = result.slice(1, -1).trim();
271 |   }
272 |   return result;
273 | }
274 | 
275 | function registerCommand(
276 |   commandIndex: Map<string, string>,
277 |   command: string,
278 |   file: string,
279 |   errors: string[],
280 | ): void {
281 |   const existing = commandIndex.get(command);
282 |   if (existing && existing !== file) {
283 |     errors.push(`Duplicate command "${command}" found in ${existing} and ${file}.`);
284 |     return;
285 |   }
286 |   commandIndex.set(command, file);
287 | }
288 | 
289 | function buildNormalizedPhaseSet(phases: Set<string>): Set<string> {
290 |   const normalized = new Set<string>();
291 |   for (const phase of phases) {
292 |     const key = normalizePhaseLabel(phase);
293 |     if (key) {
294 |       normalized.add(key);
295 |     }
296 |   }
297 |   return normalized;
298 | }
299 | 
300 | function phaseExists(normalizedPhase: string, normalizedPhases: Set<string>): boolean {
301 |   if (!normalizedPhase) {
302 |     return false;
303 |   }
304 |   return normalizedPhases.has(normalizedPhase);
305 | }
306 | 
307 | main().catch((error) => {
308 |   console.error('Failed to build catalog.');
309 |   console.error(error);
310 |   process.exitCode = 1;
311 | });
```

scripts/catalog_types.ts
```
1 | export interface PromptCatalogEntry {
2 |   phase: string;
3 |   command: string;
4 |   title: string;
5 |   purpose: string;
6 |   gate: string;
7 |   status: string;
8 |   previous: string[];
9 |   next: string[];
10 |   path: string;
11 | }
12 | 
13 | export type PromptCatalog = Record<string, PromptCatalogEntry[]>;
14 | 
15 | export function normalizePhaseLabel(phase: string): string {
16 |   return phase
17 |     .trim()
18 |     .toLowerCase()
19 |     .replace(/[^a-z0-9]+/g, '-')
20 |     .replace(/-+/g, '-')
21 |     .replace(/^-|-$/g, '');
22 | }
```

scripts/file_utils.ts
```
1 | import { promises as fs } from 'fs';
2 | import path from 'path';
3 | 
4 | export async function writeFileAtomic(filePath: string, contents: string): Promise<boolean> {
5 |   const existing = await readFileIfExists(filePath);
6 |   if (existing === contents) {
7 |     return false;
8 |   }
9 | 
10 |   const dir = path.dirname(filePath);
11 |   const base = path.basename(filePath);
12 |   const tempPath = path.join(dir, `.${base}.${process.pid}.${Date.now()}.tmp`);
13 | 
14 |   try {
15 |     await fs.writeFile(tempPath, contents, 'utf8');
16 |     await fs.rename(tempPath, filePath);
17 |   } catch (error) {
18 |     await cleanupTempFile(tempPath);
19 |     throw error;
20 |   }
21 | 
22 |   return true;
23 | }
24 | 
25 | async function readFileIfExists(filePath: string): Promise<string | null> {
26 |   try {
27 |     return await fs.readFile(filePath, 'utf8');
28 |   } catch (error) {
29 |     if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
30 |       return null;
31 |     }
32 |     throw error;
33 |   }
34 | }
35 | 
36 | async function cleanupTempFile(tempPath: string): Promise<void> {
37 |   try {
38 |     await fs.unlink(tempPath);
39 |   } catch (error) {
40 |     if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
41 |       throw error;
42 |     }
43 |   }
44 | }
```

scripts/front_matter.ts
```
1 | export {
2 |   ensureArray,
3 |   formatFrontMatter,
4 |   parseFrontMatter,
5 |   type FrontMatterRecord,
6 |   type MetadataValue,
7 |   type ParsedFrontMatter,
8 |   type Scalar,
9 | } from '../src/utils/front_matter.ts';
```

scripts/generate_docs.ts
```
1 | import { promises as fs } from 'fs';
2 | import path from 'path';
3 | 
4 | import type { PromptCatalog, PromptCatalogEntry } from './catalog_types.ts';
5 | import { normalizePhaseLabel } from './catalog_types.ts';
6 | import { writeFileAtomic } from './file_utils.ts';
7 | 
8 | interface GenerateDocsOptions {
9 |   updateWorkflow: boolean;
10 | }
11 | 
12 | interface CrossEntry {
13 |   command: string;
14 |   stageTieIn: string;
15 |   purpose: string;
16 | }
17 | 
18 | const PHASE_BLOCK_BEGIN = '<!-- BEGIN GENERATED PHASES -->';
19 | const PHASE_BLOCK_END = '<!-- END GENERATED PHASES -->';
20 | const COMMANDS_BLOCK_BEGIN = '<!-- commands:start -->';
21 | const COMMANDS_BLOCK_END = '<!-- commands:end -->';
22 | 
23 | interface PhaseSectionSnapshot {
24 |   headingLine: string;
25 |   normalizedKey: string;
26 |   manualLines: string[];
27 | }
28 | 
29 | export async function generateDocs(
30 |   repoRoot: string,
31 |   catalog: PromptCatalog,
32 |   options: GenerateDocsOptions,
33 | ): Promise<void> {
34 |   const readmeUpdated = await updateReadme(repoRoot, catalog);
35 |   if (readmeUpdated) {
36 |     console.log('Updated README.md metadata tables.');
37 |   } else {
38 |     console.log('README.md metadata tables already match catalog.json.');
39 |   }
40 | 
41 |   if (options.updateWorkflow) {
42 |     const workflowDocUpdated = await synchronizeWorkflowDoc(repoRoot, catalog);
43 |     if (workflowDocUpdated) {
44 |       console.log('Synchronized WORKFLOW.md phase catalog.');
45 |     } else {
46 |       console.log('WORKFLOW.md already matches the generated phase catalog.');
47 |     }
48 | 
49 |     const workflowUpdated = await regenerateWorkflow(repoRoot, catalog);
50 |     if (workflowUpdated) {
51 |       console.log('Regenerated workflow.mmd from catalog graph.');
52 |     } else {
53 |       console.log('workflow.mmd already up to date with catalog graph.');
54 |     }
55 |   } else {
56 |     console.log('Skipped workflow.mmd regeneration (pass --update-workflow to enable).');
57 |   }
58 | }
59 | 
60 | export async function synchronizeWorkflowDoc(repoRoot: string, catalog: PromptCatalog): Promise<boolean> {
61 |   const workflowPath = path.join(repoRoot, 'WORKFLOW.md');
62 |   const original = await fs.readFile(workflowPath, 'utf8');
63 |   const lines = original.split(/\r?\n/);
64 | 
65 |   const blockStartIndex = lines.findIndex((line) => line.trim() === PHASE_BLOCK_BEGIN);
66 |   const blockEndIndex = lines.findIndex((line) => line.trim() === PHASE_BLOCK_END);
67 |   if (blockStartIndex === -1 || blockEndIndex === -1 || blockEndIndex <= blockStartIndex) {
68 |     throw new Error('WORKFLOW.md is missing generated phase markers.');
69 |   }
70 | 
71 |   const blockLines = lines.slice(blockStartIndex + 1, blockEndIndex);
72 |   const existingSections = parsePhaseSections(blockLines);
73 |   const manualLookup = new Map<string, PhaseSectionSnapshot>();
74 |   for (const section of existingSections) {
75 |     manualLookup.set(section.normalizedKey, section);
76 |   }
77 | 
78 |   const existingOrder = existingSections.map((section) => section.normalizedKey);
79 |   const catalogKeys = Object.keys(catalog);
80 |   const newKeys = catalogKeys.filter((key) => !manualLookup.has(key)).sort((a, b) => comparePhaseKeys(a, b));
81 |   const orderedKeys = [...existingOrder, ...newKeys];
82 | 
83 |   const renderedBlock: string[] = [];
84 |   for (const key of orderedKeys) {
85 |     const snapshot = manualLookup.get(key);
86 |     const bucket = catalog[key] ?? [];
87 |     const headingLine = snapshot?.headingLine ?? `### ${resolvePhaseHeading(key, bucket)}`;
88 |     const manualLines = snapshot?.manualLines ?? createManualStub(resolvePhaseHeading(key, bucket));
89 |     const commandLines = buildCommandLines(bucket);
90 | 
91 |     if (renderedBlock.length > 0) {
92 |       renderedBlock.push('');
93 |     }
94 | 
95 |     renderedBlock.push(headingLine);
96 |     renderedBlock.push('');
97 |     if (manualLines.length > 0) {
98 |       renderedBlock.push(...manualLines);
99 |       if (manualLines[manualLines.length - 1].trim() !== '') {
100 |         renderedBlock.push('');
101 |       }
102 |     }
103 | 
104 |     renderedBlock.push(COMMANDS_BLOCK_BEGIN);
105 |     renderedBlock.push(...commandLines);
106 |     renderedBlock.push(COMMANDS_BLOCK_END);
107 |   }
108 | 
109 |   while (renderedBlock.length > 0 && renderedBlock[renderedBlock.length - 1].trim() === '') {
110 |     renderedBlock.pop();
111 |   }
112 | 
113 |   const replacement = [PHASE_BLOCK_BEGIN, ...renderedBlock, PHASE_BLOCK_END];
114 |   const nextLines = [...lines];
115 |   nextLines.splice(blockStartIndex, blockEndIndex - blockStartIndex + 1, ...replacement);
116 |   const updatedContent = ensureTrailingNewline(nextLines.join('\n'));
117 |   const normalizedOriginal = ensureTrailingNewline(lines.join('\n'));
118 |   if (updatedContent === normalizedOriginal) {
119 |     return false;
120 |   }
121 |   await writeFileAtomic(workflowPath, updatedContent);
122 |   return true;
123 | }
124 | 
125 | async function updateReadme(repoRoot: string, catalog: PromptCatalog): Promise<boolean> {
126 |   const readmePath = path.join(repoRoot, 'README.md');
127 |   const original = await fs.readFile(readmePath, 'utf8');
128 |   const lines = original.split(/\r?\n/);
129 |   const usedPhases = new Set<string>();
130 |   let modified = false;
131 |   let crossHeadingIndex: number | null = null;
132 | 
133 |   for (let index = 0; index < lines.length; index++) {
134 |     const line = lines[index];
135 |     if (!line.startsWith('### [')) {
136 |       continue;
137 |     }
138 |     const headingLabel = extractHeadingLabel(line);
139 |     if (!headingLabel) {
140 |       continue;
141 |     }
142 |     if (headingLabel === 'Reset Playbook') {
143 |       crossHeadingIndex = index;
144 |       continue;
145 |     }
146 |     if (!/^P\d+/i.test(headingLabel)) {
147 |       continue;
148 |     }
149 |     const normalized = normalizePhaseLabel(headingLabel);
150 |     usedPhases.add(normalized);
151 |     const entries = catalog[normalized];
152 |     if (!entries) {
153 |       throw new Error(`README.md references phase "${headingLabel}" but catalog.json has no entries.`);
154 |     }
155 |     const bounds = locateTableBounds(lines, index + 1);
156 |     const tableLines = buildPhaseTable(entries);
157 |     if (!tableEquals(lines.slice(bounds.start, bounds.end), tableLines)) {
158 |       lines.splice(bounds.start, bounds.end - bounds.start, ...tableLines);
159 |       modified = true;
160 |     }
161 |   }
162 | 
163 |   if (crossHeadingIndex !== null) {
164 |     const bounds = locateTableBounds(lines, crossHeadingIndex + 1);
165 |     const crossEntries = collectCrossEntries(catalog, usedPhases);
166 |     const tableLines = buildCrossTable(crossEntries);
167 |     if (!tableEquals(lines.slice(bounds.start, bounds.end), tableLines)) {
168 |       lines.splice(bounds.start, bounds.end - bounds.start, ...tableLines);
169 |       modified = true;
170 |     }
171 |   }
172 | 
173 |   if (!modified) {
174 |     return false;
175 |   }
176 | 
177 |   const updatedContent = ensureTrailingNewline(lines.join('\n'));
178 |   await writeFileAtomic(readmePath, updatedContent);
179 |   return true;
180 | }
181 | 
182 | function extractHeadingLabel(line: string): string | null {
183 |   const bracketStart = line.indexOf('[');
184 |   const bracketEnd = line.indexOf('](', bracketStart);
185 |   if (bracketStart === -1 || bracketEnd === -1) {
186 |     return null;
187 |   }
188 |   return line.slice(bracketStart + 1, bracketEnd);
189 | }
190 | 
191 | function locateTableBounds(lines: string[], startIndex: number): { start: number; end: number } {
192 |   let start = startIndex;
193 |   while (start < lines.length && lines[start].trim() === '') {
194 |     start++;
195 |   }
196 |   let end = start;
197 |   while (end < lines.length && lines[end].trim().startsWith('|')) {
198 |     end++;
199 |   }
200 |   return { start, end };
201 | }
202 | 
203 | function buildPhaseTable(entries: PromptCatalogEntry[]): string[] {
204 |   const rows = entries
205 |     .slice()
206 |     .sort((a, b) => a.command.localeCompare(b.command))
207 |     .map((entry) => `| ${escapeCell(entry.command)} | ${escapeCell(entry.purpose)} |`);
208 |   return ['| Command | What it does |', '| --- | --- |', ...rows];
209 | }
210 | 
211 | function collectCrossEntries(
212 |   catalog: PromptCatalog,
213 |   usedPhases: Set<string>,
214 | ): CrossEntry[] {
215 |   const entries: CrossEntry[] = [];
216 |   const seen = new Set<string>();
217 |   for (const [normalized, bucket] of Object.entries(catalog)) {
218 |     if (usedPhases.has(normalized)) {
219 |       continue;
220 |     }
221 |     for (const entry of bucket) {
222 |       const key = `${entry.command}::${entry.phase}`;
223 |       if (seen.has(key)) {
224 |         continue;
225 |       }
226 |       seen.add(key);
227 |       entries.push({
228 |         command: entry.command,
229 |         stageTieIn: entry.phase,
230 |         purpose: entry.purpose,
231 |       });
232 |     }
233 |   }
234 |   entries.sort((a, b) => {
235 |     const stage = a.stageTieIn.localeCompare(b.stageTieIn);
236 |     if (stage !== 0) {
237 |       return stage;
238 |     }
239 |     return a.command.localeCompare(b.command);
240 |   });
241 |   return entries;
242 | }
243 | 
244 | function buildCrossTable(entries: CrossEntry[]): string[] {
245 |   const rows = entries.map(
246 |     (entry) => `| ${escapeCell(entry.command)} | ${escapeCell(entry.stageTieIn)} | ${escapeCell(entry.purpose)} |`,
247 |   );
248 |   return ['| Command | Stage tie-in | What it does |', '| --- | --- | --- |', ...rows];
249 | }
250 | 
251 | function escapeCell(value: string): string {
252 |   return value.replace(/\|/g, '\\|');
253 | }
254 | 
255 | function tableEquals(existing: string[], replacement: string[]): boolean {
256 |   if (existing.length !== replacement.length) {
257 |     return false;
258 |   }
259 |   for (let index = 0; index < existing.length; index++) {
260 |     if (existing[index] !== replacement[index]) {
261 |       return false;
262 |     }
263 |   }
264 |   return true;
265 | }
266 | 
267 | function ensureTrailingNewline(content: string): string {
268 |   return content.endsWith('\n') ? content : `${content}\n`;
269 | }
270 | 
271 | export async function regenerateWorkflow(repoRoot: string, catalog: PromptCatalog): Promise<boolean> {
272 |   const workflowPath = path.join(repoRoot, 'workflow.mmd');
273 |   const lines = buildWorkflowGraph(catalog);
274 |   const payload = ensureTrailingNewline(lines.join('\n'));
275 |   return writeFileAtomic(workflowPath, payload);
276 | }
277 | 
278 | function buildWorkflowGraph(catalog: PromptCatalog): string[] {
279 |   const phaseKeys = Object.keys(catalog);
280 |   const numbered = phaseKeys
281 |     .filter((key) => /^p\d/.test(key))
282 |     .sort((a, b) => comparePhaseKeys(a, b));
283 |   const nonNumbered = phaseKeys.filter((key) => !/^p\d/.test(key)).sort();
284 |   const orderedKeys = [...numbered, ...nonNumbered];
285 | 
286 |   const commandAssignments = new Map<string, string>();
287 |   const commandLookup = new Map<string, PromptCatalogEntry>();
288 |   const phaseLabels = new Map<string, string>();
289 | 
290 |   for (const key of orderedKeys) {
291 |     const bucket = catalog[key] ?? [];
292 |     if (bucket.length > 0) {
293 |       phaseLabels.set(key, bucket[0].phase);
294 |     }
295 |     for (const entry of bucket) {
296 |       if (!commandLookup.has(entry.command)) {
297 |         commandLookup.set(entry.command, entry);
298 |         commandAssignments.set(entry.command, key);
299 |       }
300 |     }
301 |   }
302 | 
303 |   const lines: string[] = ['flowchart TD'];
304 |   for (const key of numbered) {
305 |     lines.push(...renderPhaseSubgraph(key, phaseLabels.get(key) ?? key, commandAssignments));
306 |   }
307 | 
308 |   const crossPhaseNodes: string[] = [];
309 |   for (const key of nonNumbered) {
310 |     crossPhaseNodes.push(...renderPhaseSubgraph(key, phaseLabels.get(key) ?? key, commandAssignments));
311 |   }
312 |   if (crossPhaseNodes.length > 0) {
313 |     lines.push(...crossPhaseNodes);
314 |   }
315 | 
316 |   const edges = buildEdges(commandLookup);
317 |   lines.push(...edges);
318 |   return lines;
319 | }
320 | 
321 | function renderPhaseSubgraph(
322 |   phaseKey: string,
323 |   label: string,
324 |   commandAssignments: Map<string, string>,
325 | ): string[] {
326 |   const commands: string[] = [];
327 |   for (const [command, assignedPhase] of commandAssignments.entries()) {
328 |     if (assignedPhase !== phaseKey) {
329 |       continue;
330 |     }
331 |     commands.push(command);
332 |   }
333 |   if (commands.length === 0) {
334 |     return [];
335 |   }
336 |   commands.sort((a, b) => a.localeCompare(b));
337 |   const lines: string[] = [];
338 |   const phaseId = toPhaseId(phaseKey);
339 |   lines.push(`  subgraph ${phaseId}["${escapeLabel(label)}"]`);
340 |   for (const command of commands) {
341 |     const nodeId = toCommandId(command);
342 |     lines.push(`    ${nodeId}[/${command}/]`);
343 |   }
344 |   lines.push('  end');
345 |   return lines;
346 | }
347 | 
348 | function buildEdges(commandLookup: Map<string, PromptCatalogEntry>): string[] {
349 |   const edges: string[] = [];
350 |   const seen = new Set<string>();
351 |   for (const entry of commandLookup.values()) {
352 |     const sourceId = toCommandId(entry.command);
353 |     for (const nextCommand of entry.next) {
354 |       const targetEntry = commandLookup.get(nextCommand);
355 |       if (!targetEntry) {
356 |         continue;
357 |       }
358 |       const targetId = toCommandId(targetEntry.command);
359 |       const key = `${sourceId}->${targetId}`;
360 |       if (seen.has(key)) {
361 |         continue;
362 |       }
363 |       seen.add(key);
364 |       edges.push(`  ${sourceId} --> ${targetId}`);
365 |     }
366 |   }
367 |   return edges.sort((a, b) => a.localeCompare(b));
368 | }
369 | 
370 | function toPhaseId(phaseKey: string): string {
371 |   return `phase_${phaseKey.replace(/[^a-z0-9]/g, '_')}`;
372 | }
373 | 
374 | function toCommandId(command: string): string {
375 |   const stripped = command.replace(/^\//, '');
376 |   const normalized = stripped.replace(/[^a-z0-9]/gi, '_');
377 |   return `cmd_${normalized}`;
378 | }
379 | 
380 | function escapeLabel(label: string): string {
381 |   return label.replace(/"/g, '\\"');
382 | }
383 | 
384 | function comparePhaseKeys(a: string, b: string): number {
385 |   const numberA = extractPhaseNumber(a);
386 |   const numberB = extractPhaseNumber(b);
387 |   if (numberA !== null && numberB !== null && numberA !== numberB) {
388 |     return numberA - numberB;
389 |   }
390 |   return a.localeCompare(b);
391 | }
392 | 
393 | function extractPhaseNumber(key: string): number | null {
394 |   const match = key.match(/^p(\d+)/);
395 |   if (!match) {
396 |     return null;
397 |   }
398 |   return Number.parseInt(match[1], 10);
399 | }
400 | 
401 | function parsePhaseSections(lines: string[]): PhaseSectionSnapshot[] {
402 |   const sections: PhaseSectionSnapshot[] = [];
403 |   let current: PhaseSectionSnapshot | null = null;
404 |   let manualBuffer: string[] = [];
405 |   let inCommands = false;
406 | 
407 |   const flush = (): void => {
408 |     if (!current) {
409 |       return;
410 |     }
411 |     current.manualLines = trimBlankEdges(manualBuffer);
412 |     sections.push(current);
413 |     current = null;
414 |     manualBuffer = [];
415 |   };
416 | 
417 |   for (const line of lines) {
418 |     if (line.trim().startsWith('### ')) {
419 |       flush();
420 |       const headingLine = line.trimStart();
421 |       const heading = headingLine.replace(/^###\s+/, '').trim();
422 |       current = {
423 |         headingLine,
424 |         normalizedKey: normalizePhaseLabel(heading),
425 |         manualLines: [],
426 |       };
427 |       inCommands = false;
428 |       manualBuffer = [];
429 |       continue;
430 |     }
431 | 
432 |     if (!current) {
433 |       continue;
434 |     }
435 | 
436 |     const trimmed = line.trim();
437 |     if (trimmed === COMMANDS_BLOCK_BEGIN) {
438 |       inCommands = true;
439 |       continue;
440 |     }
441 |     if (trimmed === COMMANDS_BLOCK_END) {
442 |       inCommands = false;
443 |       continue;
444 |     }
445 | 
446 |     if (!inCommands) {
447 |       manualBuffer.push(line);
448 |     }
449 |   }
450 | 
451 |   flush();
452 |   return sections;
453 | }
454 | 
455 | function trimBlankEdges(lines: string[]): string[] {
456 |   let start = 0;
457 |   let end = lines.length;
458 |   while (start < end && lines[start].trim() === '') {
459 |     start += 1;
460 |   }
461 |   while (end > start && lines[end - 1].trim() === '') {
462 |     end -= 1;
463 |   }
464 |   return lines.slice(start, end);
465 | }
466 | 
467 | function resolvePhaseHeading(key: string, bucket: PromptCatalogEntry[]): string {
468 |   if (bucket.length > 0) {
469 |     return bucket[0].phase;
470 |   }
471 |   const segments = key.split('-').filter(Boolean);
472 |   if (segments.length === 0) {
473 |     return key;
474 |   }
475 |   return segments
476 |     .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
477 |     .join(' ');
478 | }
479 | 
480 | function createManualStub(label: string): string[] {
481 |   const trimmed = label.trim();
482 |   return [
483 |     `- **Purpose**: _Document the goal for ${trimmed}._`,
484 |     '- **Steps**: _Outline the prompts and activities involved._',
485 |     '- **Gate Criteria**: _Capture the exit checks before advancing._',
486 |     '- **Outputs**: _List the deliverables for this phase._',
487 |     '- **Owners**: _Assign accountable roles._',
488 |   ];
489 | }
490 | 
491 | function buildCommandLines(entries: PromptCatalogEntry[]): string[] {
492 |   if (entries.length === 0) {
493 |     return ['- _No catalog commands mapped to this phase._'];
494 |   }
495 |   return entries
496 |     .slice()
497 |     .sort((a, b) => a.command.localeCompare(b.command))
498 |     .map((entry) => {
499 |       const purpose = entry.purpose.trim();
500 |       return purpose ? `- \`${entry.command}\` — ${purpose}` : `- \`${entry.command}\``;
501 |     });
502 | }
```

scripts/markdown_utils.ts
```
1 | import path from 'path';
2 | 
3 | import { glob } from 'glob';
4 | 
5 | import { loadPhases as loadWorkflowPhases } from '../src/utils/markdown.ts';
6 | 
7 | const DEFAULT_IGNORE = [
8 |   '**/node_modules/**',
9 |   '**/.git/**',
10 |   '**/.taskmaster/**',
11 |   '**/.github/**',
12 |   '**/dist/**',
13 | ];
14 | 
15 | export async function collectMarkdownFiles(rootDir: string): Promise<string[]> {
16 |   const matches = await glob('**/*.md', {
17 |     cwd: rootDir,
18 |     ignore: DEFAULT_IGNORE,
19 |     nodir: true,
20 |     absolute: true,
21 |   });
22 |   return matches.map((match) => path.resolve(match));
23 | }
24 | 
25 | export { loadWorkflowPhases as loadPhases };
```

scripts/validate_metadata.ts
```
1 | import { promises as fs } from 'fs';
2 | import path from 'path';
3 | import { fileURLToPath } from 'url';
4 | 
5 | import { z } from 'zod';
6 | import { load as loadYaml } from 'js-yaml';
7 | 
8 | import { parseFrontMatter } from './front_matter.ts';
9 | import { collectMarkdownFiles, loadPhases } from './markdown_utils.ts';
10 | 
11 | const moduleDir = path.dirname(fileURLToPath(import.meta.url));
12 | const CUSTOM_ROOT_ENV = 'PROMPTS_VALIDATION_ROOT';
13 | 
14 | const stringField = z.string().trim().min(1, 'value must be a non-empty string');
15 | const stringArray = z.array(stringField).nonempty('must contain at least one entry');
16 | const stringOrArray = z.union([stringField, stringArray]);
17 | 
18 | const metadataSchema = z
19 |   .object({
20 |     phase: stringOrArray,
21 |     gate: stringField,
22 |     status: stringField,
23 |     previous: stringArray,
24 |     next: stringArray,
25 |     tags: z.array(stringField).optional(),
26 |   })
27 |   .passthrough();
28 | 
29 | async function main(): Promise<void> {
30 |   const customRoot = process.env[CUSTOM_ROOT_ENV];
31 |   const repoRoot = customRoot ? path.resolve(customRoot) : path.resolve(moduleDir, '..');
32 |   const workflowPath = path.join(repoRoot, 'WORKFLOW.md');
33 |   const validPhases = await loadPhases(workflowPath);
34 |   const markdownFiles = await collectMarkdownFiles(repoRoot);
35 |   const trackedPaths = await loadTrackedMarkdownPaths(repoRoot);
36 |   const useTrackedFilter = trackedPaths.size > 0;
37 |   const promptsPrefix = `prompts${path.sep}`;
38 | 
39 |   const errors: string[] = [];
40 |   let validatedFiles = 0;
41 | 
42 |   for (const filePath of markdownFiles) {
43 |     const relativePath = path.relative(repoRoot, filePath);
44 |     const normalizedRelative = normalizeRelativePath(relativePath);
45 |     const shouldValidate =
46 |       normalizedRelative.startsWith(promptsPrefix) || !useTrackedFilter || trackedPaths.has(normalizedRelative);
47 |     if (!shouldValidate) {
48 |       continue;
49 |     }
50 |     const content = await fs.readFile(filePath, 'utf8');
51 |     const parsed = parseFrontMatter(content);
52 |     if (!parsed) {
53 |       errors.push(`${relativePath}: missing YAML front matter`);
54 |       continue;
55 |     }
56 | 
57 |     validatedFiles += 1;
58 | 
59 |     const validation = metadataSchema.safeParse(parsed.metadata);
60 |     if (!validation.success) {
61 |       for (const issue of validation.error.issues) {
62 |         const location = issue.path.length > 0 ? issue.path.join('.') : 'front matter';
63 |         errors.push(`${relativePath}: ${location} ${issue.message}`);
64 |       }
65 |       continue;
66 |     }
67 | 
68 |     const metadata = validation.data;
69 |     const phases = toArray(metadata.phase);
70 |     const missingPhases = findMissingPhases(phases, validPhases);
71 |     if (missingPhases.length > 0) {
72 |       errors.push(
73 |         `${relativePath}: phase value(s) not found in WORKFLOW.md headings: ${missingPhases.join(', ')}.`,
74 |       );
75 |     }
76 |   }
77 | 
78 |   if (errors.length > 0) {
79 |     console.error('Metadata validation failed:\n');
80 |     for (const error of errors) {
81 |       console.error(`- ${error}`);
82 |     }
83 |     process.exitCode = 1;
84 |     return;
85 |   }
86 | 
87 |   console.log(`Metadata validated for ${validatedFiles} file(s).`);
88 | }
89 | 
90 | function toArray(input: z.infer<typeof stringOrArray>): string[] {
91 |   return Array.isArray(input) ? input : [input];
92 | }
93 | 
94 | function findMissingPhases(phases: string[], validPhases: Set<string>): string[] {
95 |   if (phases.length === 0) {
96 |     return [];
97 |   }
98 |   const headings = Array.from(validPhases).map((heading) => heading.toLowerCase());
99 |   const missing: string[] = [];
100 |   for (const phase of phases) {
101 |     const normalized = phase.toLowerCase();
102 |     const found = headings.some((heading) => heading.includes(normalized));
103 |     if (!found) {
104 |       missing.push(phase);
105 |     }
106 |   }
107 |   return missing;
108 | }
109 | 
110 | async function loadTrackedMarkdownPaths(repoRoot: string): Promise<Set<string>> {
111 |   const tracked = new Set<string>();
112 |   await appendCatalogPaths(repoRoot, tracked);
113 |   await appendMetadataPaths(repoRoot, tracked);
114 |   return tracked;
115 | }
116 | 
117 | async function appendCatalogPaths(repoRoot: string, tracked: Set<string>): Promise<void> {
118 |   const catalogPath = path.join(repoRoot, 'catalog.json');
119 |   try {
120 |     const raw = await fs.readFile(catalogPath, 'utf8');
121 |     const catalog = JSON.parse(raw) as Record<string, unknown>;
122 |     for (const value of Object.values(catalog)) {
123 |       if (!Array.isArray(value)) {
124 |         continue;
125 |       }
126 |       for (const entry of value) {
127 |         if (isPlainObject(entry) && typeof entry.path === 'string') {
128 |           tracked.add(normalizeRelativePath(entry.path));
129 |         }
130 |       }
131 |     }
132 |   } catch (error) {
133 |     if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
134 |       console.warn(`Failed to read catalog.json: ${(error as Error).message}`);
135 |     }
136 |   }
137 | }
138 | 
139 | async function appendMetadataPaths(repoRoot: string, tracked: Set<string>): Promise<void> {
140 |   const metadataPath = path.join(repoRoot, 'resources', 'prompts.meta.yaml');
141 |   try {
142 |     const raw = await fs.readFile(metadataPath, 'utf8');
143 |     const parsed = loadYaml(raw);
144 |     if (!Array.isArray(parsed)) {
145 |       return;
146 |     }
147 |     for (const entry of parsed) {
148 |       if (isPlainObject(entry) && typeof entry.path === 'string') {
149 |         tracked.add(normalizeRelativePath(entry.path));
150 |       }
151 |     }
152 |   } catch (error) {
153 |     if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
154 |       console.warn(`Failed to read prompts.meta.yaml: ${(error as Error).message}`);
155 |     }
156 |   }
157 | }
158 | 
159 | function normalizeRelativePath(filePath: string): string {
160 |   const normalized = path.normalize(filePath);
161 |   if (normalized.startsWith(`.${path.sep}`)) {
162 |     return normalized.slice(2);
163 |   }
164 |   return normalized;
165 | }
166 | 
167 | function isPlainObject(value: unknown): value is Record<string, unknown> {
168 |   return !!value && typeof value === 'object' && !Array.isArray(value);
169 | }
170 | 
171 | main().catch((error) => {
172 |   console.error('Failed to validate metadata.');
173 |   console.error(error);
174 |   process.exitCode = 1;
175 | });
```

src/logger.ts
```
1 | import { redactSecrets } from "./utils/safety.js";
2 | 
3 | export type LogLevel = "info" | "warn" | "error";
4 | 
5 | export interface LogMetadata {
6 |   [key: string]: unknown;
7 | }
8 | 
9 | export interface LogEntry {
10 |   timestamp: string;
11 |   level: LogLevel;
12 |   message: string;
13 |   metadata?: LogMetadata;
14 | }
15 | 
16 | const ERROR_KEYS: Array<keyof Error> = ["name", "message", "stack", "cause"];
17 | 
18 | const sanitizeValue = (value: unknown): unknown => {
19 |   if (value instanceof Error) {
20 |     const errorPayload: Record<string, unknown> = {};
21 |     for (const key of ERROR_KEYS) {
22 |       const data = (value as Error)[key];
23 |       if (data !== undefined) {
24 |         errorPayload[key] = data;
25 |       }
26 |     }
27 |     return errorPayload;
28 |   }
29 | 
30 |   if (Array.isArray(value)) {
31 |     return value.map((item) => sanitizeValue(item));
32 |   }
33 | 
34 |   if (value && typeof value === "object") {
35 |     const input = value as Record<string, unknown>;
36 |     const result: Record<string, unknown> = {};
37 |     for (const [key, nestedValue] of Object.entries(input)) {
38 |       if (nestedValue !== undefined) {
39 |         result[key] = sanitizeValue(nestedValue);
40 |       }
41 |     }
42 |     return result;
43 |   }
44 | 
45 |   return value;
46 | };
47 | 
48 | const prepareMetadata = (metadata?: LogMetadata): LogMetadata | undefined => {
49 |   if (!metadata) {
50 |     return undefined;
51 |   }
52 | 
53 |   const sanitized: LogMetadata = {};
54 |   for (const [key, value] of Object.entries(metadata)) {
55 |     if (value !== undefined) {
56 |       sanitized[key] = sanitizeValue(value);
57 |     }
58 |   }
59 | 
60 |   return Object.keys(sanitized).length > 0 ? sanitized : undefined;
61 | };
62 | 
63 | export class Logger {
64 |   private readonly stream: NodeJS.WriteStream;
65 | 
66 |   constructor(stream: NodeJS.WriteStream = process.stderr) {
67 |     this.stream = stream;
68 |   }
69 | 
70 |   private write(level: LogLevel, message: string, metadata?: LogMetadata): void {
71 |     const entry: LogEntry = {
72 |       timestamp: new Date().toISOString(),
73 |       level,
74 |       message,
75 |     };
76 | 
77 |     const sanitizedMetadata = prepareMetadata(metadata);
78 |     if (sanitizedMetadata) {
79 |       entry.metadata = sanitizedMetadata;
80 |     }
81 | 
82 |     this.stream.write(`${JSON.stringify(entry)}\n`);
83 |   }
84 | 
85 |   info(message: string, metadata?: LogMetadata): void {
86 |     this.write("info", message, metadata);
87 |   }
88 | 
89 |   warn(message: string, metadata?: LogMetadata): void {
90 |     this.write("warn", message, metadata);
91 |   }
92 | 
93 |   error(message: string, metadata?: LogMetadata): void {
94 |     this.write("error", message, metadata);
95 |   }
96 | }
97 | 
98 | export const logger = new Logger(process.stderr);
99 | 
100 | const redactMetadata = (metadata?: LogMetadata): LogMetadata | undefined => {
101 |   if (!metadata) {
102 |     return undefined;
103 |   }
104 | 
105 |   return prepareMetadata(redactSecrets(metadata) as LogMetadata);
106 | };
107 | 
108 | export type SecureLogger = Pick<Logger, "info" | "warn" | "error">;
109 | 
110 | export const createSecureLogger = (baseLogger: Logger, options: { unsafe?: boolean } = {}): SecureLogger => ({
111 |   info(message, metadata) {
112 |     baseLogger.info(message, options.unsafe ? prepareMetadata(metadata) : redactMetadata(metadata));
113 |   },
114 |   warn(message, metadata) {
115 |     baseLogger.warn(message, options.unsafe ? prepareMetadata(metadata) : redactMetadata(metadata));
116 |   },
117 |   error(message, metadata) {
118 |     baseLogger.error(message, options.unsafe ? prepareMetadata(metadata) : redactMetadata(metadata));
119 |   },
120 | });
121 | 
122 | export const secureLogger = createSecureLogger(logger);
```

src/planner.ts
```
1 | import { readFileSync } from 'node:fs';
2 | import { resolve } from 'node:path';
3 | 
4 | import type { GraphDocument, GraphNode } from './types.js';
5 | import type { StateStore } from './state/StateStore.js';
6 | 
7 | const isRecord = (value: unknown): value is Record<string, unknown> =>
8 |   !!value && typeof value === 'object';
9 | 
10 | const normaliseNode = (value: unknown, index: number): GraphNode => {
11 |   if (!isRecord(value)) {
12 |     throw new TypeError(`Graph node at index ${index} must be an object.`);
13 |   }
14 | 
15 |   const {
16 |     id,
17 |     title,
18 |     phase,
19 |     dependsOn = [],
20 |     requiresArtifacts = [],
21 |   } = value as Partial<GraphNode>;
22 | 
23 |   if (typeof id !== 'string' || id.length === 0) {
24 |     throw new TypeError(`Graph node at index ${index} is missing a string id.`);
25 |   }
26 | 
27 |   if (typeof title !== 'string' || title.length === 0) {
28 |     throw new TypeError(`Graph node "${id}" is missing a string title.`);
29 |   }
30 | 
31 |   if (typeof phase !== 'number' || Number.isNaN(phase)) {
32 |     throw new TypeError(`Graph node "${id}" must declare a numeric phase.`);
33 |   }
34 | 
35 |   const deps = Array.isArray(dependsOn) ? dependsOn.map(String) : [];
36 |   const requiredArtifacts = Array.isArray(requiresArtifacts)
37 |     ? requiresArtifacts.map(String)
38 |     : [];
39 | 
40 |   return {
41 |     id,
42 |     title,
43 |     phase,
44 |     dependsOn: deps,
45 |     requiresArtifacts: requiredArtifacts,
46 |   } satisfies GraphNode;
47 | };
48 | 
49 | const normaliseDocument = (value: unknown): GraphDocument => {
50 |   if (!isRecord(value)) {
51 |     throw new TypeError('Graph document must be an object.');
52 |   }
53 | 
54 |   const nodes = Array.isArray(value.nodes) ? value.nodes.map(normaliseNode) : [];
55 | 
56 |   if (nodes.length === 0) {
57 |     throw new TypeError('Graph document must include at least one node.');
58 |   }
59 | 
60 |   return { nodes } satisfies GraphDocument;
61 | };
62 | 
63 | export class Planner {
64 |   private readonly graph: GraphNode[];
65 |   private readonly stateStore: StateStore;
66 | 
67 |   constructor(graphPath: string, stateStore: StateStore) {
68 |     const absoluteGraphPath = resolve(graphPath);
69 |     const fileContent = readFileSync(absoluteGraphPath, 'utf8');
70 |     const document = normaliseDocument(JSON.parse(fileContent));
71 | 
72 |     this.graph = document.nodes;
73 |     this.stateStore = stateStore;
74 |   }
75 | 
76 |   private areDependenciesMet(node: GraphNode): boolean {
77 |     const completed = this.stateStore.getCompletedToolIds();
78 |     return node.dependsOn.every((dependency) => completed.has(dependency));
79 |   }
80 | 
81 |   private areArtifactsAvailable(node: GraphNode): boolean {
82 |     const artifacts = this.stateStore.getAvailableArtifacts();
83 |     return node.requiresArtifacts.every((artifact) => artifacts.has(artifact));
84 |   }
85 | 
86 |   suggestNextCalls(): GraphNode[] {
87 |     const completed = this.stateStore.getCompletedToolIds();
88 | 
89 |     return this.graph
90 |       .filter((node) => {
91 |         if (completed.has(node.id)) {
92 |           return false;
93 |         }
94 | 
95 |         if (!this.areDependenciesMet(node)) {
96 |           return false;
97 |         }
98 | 
99 |         if (!this.areArtifactsAvailable(node)) {
100 |           return false;
101 |         }
102 | 
103 |         return true;
104 |       })
105 |       .sort((a, b) => a.phase - b.phase || a.id.localeCompare(b.id));
106 |   }
107 | }
```

src/server.ts
```
1 | import { createRequire } from "node:module";
2 | import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
3 | import type { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
4 | import { secureLogger } from "./logger.js";
5 | 
6 | const require = createRequire(import.meta.url);
7 | const packageJson = require("../package.json") as { version?: string };
8 | 
9 | const SERVER_NAME = "Proactive Workflow Assistant MCP";
10 | 
11 | export const createServer = () => {
12 |   const server = new McpServer({
13 |     name: SERVER_NAME,
14 |     version: packageJson.version ?? "0.0.0",
15 |   });
16 |   return server;
17 | };
18 | 
19 | export const connectServer = async (
20 |   server: McpServer,
21 |   transport: StdioServerTransport,
22 | ): Promise<void> => {
23 |   await server.connect(transport);
24 |   secureLogger.info("server_started", {
25 |     transport: "stdio",
26 |     server: SERVER_NAME,
27 |     version: packageJson.version,
28 |   });
29 | };
30 | 
```

src/types.ts
```
1 | export interface GraphNode {
2 |   id: string;
3 |   title: string;
4 |   phase: number;
5 |   dependsOn: string[];
6 |   requiresArtifacts: string[];
7 | }
8 | 
9 | export interface GraphDocument {
10 |   nodes: GraphNode[];
11 | }
```

tests/.gitkeep
```
```

.github/workflows/pack-contents.yml
```
1 | name: Pack contents check
2 | 
3 | on:
4 |   push:
5 |     branches: [ main ]
6 |   pull_request:
7 | 
8 | jobs:
9 |   pack:
10 |     runs-on: ubuntu-latest
11 |     steps:
12 |       - name: Checkout
13 |         uses: actions/checkout@v4
14 | 
15 |       - name: Setup Node.js
16 |         uses: actions/setup-node@v4
17 |         with:
18 |           node-version: '20'
19 |           cache: 'npm'
20 | 
21 |       - name: Install deps
22 |         run: npm ci
23 | 
24 |       - name: Build
25 |         run: npm run build
26 | 
27 |       - name: Verify package contents (schemas + server)
28 |         env:
29 |           npm_config_cache: ${{ runner.temp }}/npm-cache
30 |         run: npm run ci:pack-check
31 | 
```

.taskmaster/docs/PRDv2.md
```
1 | # Overview
2 | 
3 | A lightweight interop layer extends `AcidicSoil/prompts` to ingest Task‑Master artifacts, run an internal state engine, expose Model Context Protocol (MCP) tools over stdio, provide a thin CLI, and wire into Mastra via the Vercel AI SDK with zero‑cost provider presets. It targets developers who manage work with Task‑Master but want `prompts` to reason about readiness, advance workflow state, and serve multiple agentic clients (Codex, Gemini CLI, Mastra) without duplicating logic. It reduces friction by mirroring Task‑Master’s task schema, preserving source‑of‑truth files, and offering deterministic outputs suitable for CI.
4 | 
5 | # Core Features
6 | 
7 | ## 1) Task‑Master ingest adapter
8 | **What**: Parse `tasks.json` and map to `PromptsTask[]` using a superset schema that preserves Task‑Master field names and types.
9 | 
10 | **Why**: Zero‑loss ingestion enables consistent state reasoning and avoids vendor lock‑in.
11 | 
12 | **How**: `src/adapters/taskmaster/ingest.ts` validates against `schemas/task.json` (superset) and normalizes status values and dependency edges.
13 | 
14 | **Acceptance criteria (BDD)**
15 | Given a valid Task‑Master `tasks.json`
16 | When the adapter runs
17 | Then it produces `PromptsTask[]` with identical IDs, titles, descriptions, statuses, dependencies, priority, details, testStrategy, and subtasks
18 | And it records any non‑canonical statuses in a mapping report.
19 | 
20 | ## 2) Canonical task schema (superset)
21 | **What**: JSON Schema `schemas/task.json` that is a superset of Task‑Master’s fields.
22 | 
23 | **Why**: Type safety and forward compatibility.
24 | 
25 | **How**: Preserve names: `id,title,description,status,dependencies,priority,details,testStrategy,subtasks`. Add optional `labels, metadata, evidence, artifacts` fields.
26 | 
27 | **Acceptance criteria (BDD)**
28 | Given the schema
29 | When validating a canonical Task‑Master example
30 | Then validation passes without warnings
31 | And added optional fields remain optional.
32 | 
33 | ## 3) State engine parity with “next” semantics
34 | **What**: Pure functions `graph.computeReadiness()` and `update.advance()` that match Task‑Master readiness and ordering for the next task.
35 | 
36 | **Why**: Deterministic task selection across tools.
37 | 
38 | **How**: Identify tasks with all dependencies satisfied, order by priority, then dependency count, then ID. Support statuses `pending|in_progress|blocked|done` with mappable aliases.
39 | 
40 | **Acceptance criteria (BDD)**
41 | Given a task graph where some tasks’ dependencies are satisfied
42 | When `next()` runs
43 | Then it returns the highest‑priority ready task per documented tie‑break rules
44 | And never returns a task with unsatisfied dependencies.
45 | 
46 | ## 4) MCP stdio server for prompts tools
47 | **What**: Expose tools: `next_task`, `set_task_status`, `get_task`, `list_tasks`, `graph_export`.
48 | 
49 | **Why**: Let MCP clients (Codex, Gemini Code Assist) call shared logic.
50 | 
51 | **How**: Node process using stdio transport; JSON in/out; no side effects without explicit write flags.
52 | 
53 | **Acceptance criteria (BDD)**
54 | Given an MCP client connected over stdio
55 | When it calls `next_task`
56 | Then the server returns a single task payload consistent with the state engine
57 | And `set_task_status` changes are persisted only when write mode is enabled.
58 | 
59 | ## 5) Thin CLI
60 | **What**: `bin/prompts` with subcommands: `ingest`, `next`, `advance <id> <status>`, `graph --format dot|json`, `status`.
61 | 
62 | **Why**: Fast local use and CI suitability.
63 | 
64 | **How**: Commander‑based CLI that calls the same pure functions; outputs machine‑readable JSON by default and DOT for graphs.
65 | 
66 | **Acceptance criteria (BDD)**
67 | Given a repository containing `tasks.json`
68 | When `prompts next` runs
69 | Then it prints a single JSON object for the next task to stdout
70 | And exits with code 0.
71 | 
72 | ## 6) Mastra agent integration via AI SDK
73 | **What**: Register `prompts-tools` with a Mastra agent that uses AI SDK providers.
74 | 
75 | **Why**: Enable autonomous workflows that call `prompts` tools during planning and execution.
76 | 
77 | **How**: Package `packages/prompts-tools` exporting tool handlers; configure provider factory to select a model.
78 | 
79 | **Acceptance criteria (BDD)**
80 | Given a Mastra agent configured with `prompts-tools`
81 | When the agent plans a step requiring the next task
82 | Then it invokes `next_task` and incorporates the result into its plan without errors.
83 | 
84 | ## 7) Provider presets: Ollama (default) and Gemini CLI (optional)
85 | **What**: Two provider presets for Mastra via AI SDK: local Ollama by default; Gemini CLI as an optional free lane.
86 | 
87 | **Why**: Zero‑cost or local‑first operation.
88 | 
89 | **How**: Ship provider config examples and a runtime check that selects an available provider.
90 | 
91 | **Acceptance criteria (BDD)**
92 | Given no network access and Ollama installed
93 | When the agent initializes
94 | Then it selects the Ollama preset and runs a trivial health prompt successfully.
95 | 
96 | ## 8) Client touch points for Codex and Gemini
97 | **What**: Document configuration snippets to register the MCP stdio server with Codex and Gemini settings.
98 | 
99 | **Why**: Reduce setup friction.
100 | 
101 | **How**: Provide TOML/JSON snippet examples with placeholder paths; include Windows+WSL path examples using `/c/Users/user/...`.
102 | 
103 | **Acceptance criteria (BDD)**
104 | Given a user copies the provided snippets and updates the path
105 | When the client starts
106 | Then the client lists the `prompts` server as available
107 | And tool calls succeed over stdio.
108 | 
109 | ## 9) Optional artifact enrichment
110 | **What**: Non‑blocking readers for Task‑Master artifact files (e.g., complexity reports) to augment task metadata.
111 | 
112 | **Why**: Richer context without hard dependencies.
113 | 
114 | **How**: `src/artifacts/*` modules detect files and add derived fields under `metadata`.
115 | 
116 | **Acceptance criteria (BDD)**
117 | Given an artifacts directory is absent
118 | When enrichment runs
119 | Then ingestion still succeeds and `metadata` remains empty.
120 | 
121 | # User Experience
122 | 
123 | ## Personas
124 | 
125 | - Solo developer: wants quick “what’s next” and lightweight edits.
126 | - Team lead: needs deterministic ordering and exportable graphs for stand‑ups.
127 | - CI job: validates dependency integrity and fails fast on schema errors.
128 | 
129 | ## Key flows
130 | 
131 | - Ingest → Next → Advance: read `tasks.json`, choose next task, update status.
132 | - Agentic flow: Mastra agent calls MCP tools to unblock or plan.
133 | - Visualization: export DOT, render elsewhere.
134 | - Client setup: register MCP server in Codex or Gemini settings.
135 | 
136 | ## UI/UX considerations
137 | 
138 | - JSON first; human‑readable pretty‑print via `--pretty`.
139 | - Color‑safe CLI output; avoid reliance on ANSI by default.
140 | - Deterministic ordering for lists and logs.
141 | - Paths in examples use `/c/Users/user/...` for Windows+WSL.
142 | 
143 | ## Accessibility considerations
144 | 
145 | - No color‑only semantics; include symbols or keys.
146 | - TTY detection; fall back to plain text when non‑interactive.
147 | - Respect locale for number/date formatting in any summaries.
148 | 
149 | # Technical Architecture
150 | 
151 | ## System components
152 | 
153 | - Adapter: `src/adapters/taskmaster/ingest.ts`.
154 | - Schema: `schemas/task.json`.
155 | - State engine: `src/state/graph.ts`, `src/state/update.ts`.
156 | - MCP server: `src/mcp/server.ts` (stdio transport).
157 | - CLI: `bin/prompts` wired to core.
158 | - Mastra tools: `packages/prompts-tools`.
159 | - Provider presets: `src/providers/ollama.ts`, `src/providers/geminiCli.ts`.
160 | - Artifact readers: `src/artifacts/*`.
161 | 
162 | ## Data models
163 | 
164 | - Task: `{id, title, description, status, dependencies[], priority, details, testStrategy, subtasks[], labels?, metadata?, evidence?, artifacts?}`.
165 | - Status enum: `pending|in_progress|blocked|done` with alias map.
166 | - Graph: adjacency list plus computed readiness and ordering.
167 | 
168 | ## APIs and integrations
169 | 
170 | - MCP tools: `next_task`, `set_task_status`, `get_task`, `list_tasks`, `graph_export`.
171 | - CLI commands mirror MCP tools; outputs JSON or DOT.
172 | - Mastra integration registers tools; providers selected at runtime.
173 | 
174 | ## Infrastructure requirements
175 | 
176 | - Node ≥18; pnpm or npm.
177 | - No database; file I/O only.
178 | - Optional Graphviz for rendering; DOT export works without Graphviz.
179 | 
180 | ## Non‑functional requirements (NFRs)
181 | 
182 | - Determinism: identical inputs yield identical outputs.
183 | - Performance: `next_task` resolves in <100 ms for 5k tasks on a modern laptop.
184 | - Portability: runs on Windows (WSL), macOS, Linux.
185 | - Observability: `--verbose` flag emits structured logs to stderr.
186 | - Testability: unit tests for adapter, engine, and tools; golden files for examples.
187 | 
188 | ## Cross‑platform strategy
189 | 
190 | - Platform‑specific capabilities: use `/c/Users/user/...` in Windows+WSL docs; POSIX paths elsewhere.
191 | - Fallbacks:
192 |   - If Graphviz is unavailable, return DOT text even when `--format svg` is requested and emit a warning.
193 |   - If Ollama is missing, attempt Gemini CLI; if neither available, run a stub echo provider and warn.
194 |   - Normalize newlines on read/write to avoid CRLF issues.
195 | 
196 | **BDD fallback tests**
197 | Given Graphviz is not installed
198 | When `prompts graph --format svg` runs
199 | Then the command exits 0 and writes DOT to stdout with a warning to stderr.
200 | 
201 | Given Ollama is not installed and Gemini CLI is configured
202 | When the Mastra agent initializes
203 | Then provider selection chooses Gemini CLI and a health check succeeds.
204 | 
205 | Given neither provider is available
206 | When the Mastra agent initializes
207 | Then it selects the stub provider and logs an actionable warning.
208 | 
209 | ## Security and privacy considerations
210 | 
211 | - Sensitive inputs: task titles/descriptions may contain confidential work; avoid sending to remote models unless explicitly configured.
212 | - Default local‑first: no network calls without a chosen provider.
213 | - Secrets hygiene: do not log task payloads at `info`; redact IDs at `debug` unless `--unsafe-logs` is set by the user.
214 | 
215 | # Development Roadmap
216 | 
217 | ## MVP scope
218 | 
219 | - Superset schema and ingest adapter.
220 | - State engine with “next” parity and status mapping.
221 | - MCP stdio server exposing `next_task` and `set_task_status`.
222 | - CLI: `ingest`, `next`, `advance`, `graph --format dot`.
223 | - Provider presets: Ollama default, Gemini CLI optional with runtime selection.
224 | - Client touch points documented.
225 | 
226 | **MVP acceptance criteria (BDD)**
227 | Given a sample repo with `tasks.json`
228 | When the user runs `prompts next`
229 | Then the output matches the expected task per documented ordering.
230 | 
231 | Given an MCP client is connected
232 | When it invokes `next_task`
233 | Then it receives the same task as the CLI produced.
234 | 
235 | ## Future enhancements
236 | 
237 | - CLI migration path to oclif and installers.
238 | - Dependency validator and cycle detector.
239 | - Artifact enrichment modules for complexity and risk inputs.
240 | - Web viewer for DOT graphs.
241 | - Configurable status enums and custom ordering strategies.
242 | 
243 | **Enhancement acceptance criteria (BDD)**
244 | Given a graph with a cycle
245 | When the validator runs
246 | Then it reports the cycle with the minimal edge set and exits non‑zero.
247 | 
248 | # Logical Dependency Chain
249 | 
250 | 1. Define schema superset.
251 | 2. Implement adapter and unit tests.
252 | 3. Implement pure state engine and parity tests.
253 | 4. Expose MCP server over stdio.
254 | 5. Ship thin CLI wired to the same core.
255 | 6. Add Mastra tools and provider presets.
256 | 7. Document Codex and Gemini client setup.
257 | 8. Add artifact enrichment as optional modules.
258 | 
259 | # Risks and Mitigations
260 | 
261 | - Schema drift vs Task‑Master
262 |   - Likelihood: Medium
263 |   - Impact: High
264 |   - Mitigation: Keep a mirroring test suite against canonical examples; gate changes behind alias maps.
265 | 
266 | - Transport incompatibility (non‑stdio clients)
267 |   - Likelihood: Low
268 |   - Impact: Medium
269 |   - Mitigation: Standardize on stdio; evaluate additional transports only when required.
270 | 
271 | - Provider availability and free‑tier changes
272 |   - Likelihood: Medium
273 |   - Impact: Medium
274 |   - Mitigation: Default to local provider; include stub fallback; surface health checks.
275 | 
276 | - Windows/WSL path issues
277 |   - Likelihood: Medium
278 |   - Impact: Medium
279 |   - Mitigation: Normalize paths; document `/c/Users/user/...` conventions; test on WSL.
280 | 
281 | - Privacy leakage via remote providers
282 |   - Likelihood: Low
283 |   - Impact: High
284 |   - Mitigation: Opt‑in remote calls; redact logs; add data‑handling notice in docs.
285 | 
286 | # Appendix
287 | 
288 | ## Assumptions
289 | 
290 | - Task‑Master fields include `id,title,description,status,dependencies,priority,details,testStrategy,subtasks`.
291 | - Status values can be mapped into `pending|in_progress|blocked|done` without loss of meaning.
292 | - Node ≥18 is available across developer machines and CI.
293 | - Users may operate in Windows+WSL; examples use `/c/Users/user/...` paths.
294 | - Graphviz may not be installed; DOT output suffices as a universal exchange format.
295 | 
296 | ## Research findings and references (from provided material)
297 | 
298 | - “Task Structure” — confirms exact task fields and examples.
299 | - “Finding the Next Task” — defines readiness and ordering rules.
300 | - “MCP Tools” — lists next/status tool surface.
301 | - “Commander.js” vs “oclif” — trade‑offs for thin vs large CLIs.
302 | - “DOT Language” — baseline for graph exports.
303 | - “Using Vercel AI SDK” and “AI SDK v5 Integration” — Mastra integration path.
304 | - “Community Providers: Ollama” and “Gemini CLI Provider” — zero‑cost provider options.
305 | - “OpenAI Codex CLI README” — Codex consumes MCP via config; stdio only noted.
306 | - “Use agentic chat… Configure MCP servers” — Gemini settings JSON location and MCP section.
307 | - “Preview free limits” — free usage context reported; treat as variable.
308 | 
309 | ## Context notes (from link text)
310 | 
311 | - Task Structure — task fields and readiness
312 | - MCP Tools — tool surface and semantics
313 | - Commander.js — thin CLI utilities
314 | - oclif — installer‑friendly CLI framework
315 | - DOT Language — graph specification
316 | - Using Vercel AI SDK — Mastra provider abstraction
317 | - AI SDK v5 Integration — agent wiring example
318 | - Community Providers: Ollama — local provider
319 | - Gemini CLI Provider — optional free lane
320 | - OpenAI Codex CLI README — MCP client configuration
321 | - Configure MCP servers (Gemini) — settings file location and schema
322 | 
```

.taskmaster/docs/prd.txt
```
1 | # Overview  
2 | Codex Prompts — Vibe Coding Additions is a curated Codex CLI prompt pack that solves the problem of inconsistent engineering workflows by packaging YC-inspired vibe-coding playbooks. It targets Codex CLI individual contributors, staff leads, and prompt librarians who need deterministic guidance for planning, testing, and release gates without creating prompts from scratch. The pack delivers value by enforcing DocFetch preflight discipline, keeping lifecycle prompts discoverable, and preparing teams for machine-coordination automation.
3 | 
4 | # Core Features  
5 | - **DocFetch Preflight Guardrails**
6 |   - What: Slash-command prompts that enforce completion of DocFetchReport before any planning or coding advances.
7 |   - Why: Prevents teams from skipping P0 documentation gates highlighted in README and WORKFLOW guidance.
8 |   - High-level How: Bundle `/instruction-file` and related prompts that call DocFetch tooling, validate status, and surface remediation steps when sources are missing.
9 |   - Acceptance criteria: Running the preflight prompt yields an OK DocFetchReport or a clear remediation path without manual editing.
10 | - **Lifecycle Prompt Library**
11 |   - What: Phase-indexed prompts spanning planning, scaffolding, testing, release, post-release hardening, and model tactics.
12 |   - Why: Keeps contributors aligned with the WORKFLOW cadence and reduces drift between plan and execution.
13 |   - High-level How: Maintain markdown prompts with YAML front matter, catalog.json metadata, and README tables for discoverability.
14 |   - Acceptance criteria: Each phase table lists at least one functioning trigger, and catalog.json plus README tables remain synchronized after validation.
15 | - **Prompt Metadata Automation**
16 |   - What: TypeScript tooling that validates front matter and rebuilds catalog.json and README tables via npm scripts.
17 |   - Why: Ensures prompt metadata stays trustworthy, enabling deterministic automation.
18 |   - High-level How: Ship scripts under `scripts/**/*.ts` executed with `ts-node` using the repo’s strict `tsconfig.json` (ES2020 target, CommonJS modules, `strict: true`).
19 |   - Acceptance criteria: After any prompt edit, `npm run validate:metadata` and `npm run build:catalog` complete without errors and update artifacts.
20 | - **MCP Evolution Readiness**
21 |   - What: Documentation outlining how to expose the prompt pack as an MCP server with typed inputs, DocFetch event signals, and external triggers.
22 |   - Why: Future-proofs the catalog for machine coordination while leaving today’s manual workflow intact.
23 |   - High-level How: Capture architecture in README Future enhancements, detail automation hooks, and specify manual fallbacks when MCP is unavailable.
24 |   - Acceptance criteria: README Future enhancements section describes MCP capabilities and explicitly notes manual fallback paths.
25 | 
26 | # User Experience  
27 | - Personas: Codex CLI ICs executing daily work, prompt librarians curating guardrails, release managers verifying gate completion.
28 | - Key flows: Install repo into `~/.codex/prompts`; run DocFetch guard prompts before plans; invoke phase-aligned slash commands throughout delivery; execute validation/build scripts after prompt edits to refresh metadata.
29 | - UI/UX considerations: Slash commands remain discoverable through README tables; prompts keep tone directive and concise; outputs remind users of gate status and recommended next steps.
30 | 
31 | # Technical Architecture  
32 | - Components: Markdown prompt files with YAML front matter, catalog.json metadata store, TypeScript scripts under `scripts/**/*.ts`, and local node_modules for deterministic execution.
33 | - Data model: catalog.json and README tables act as authoritative metadata with no external persistence; prompts reference internal docs such as WORKFLOW.md.
34 | - Integrations: DocFetch tooling, Codex CLI slash-command resolver, optional future MCP server for typed prompt invocation.
35 | - Non-functional needs: Deterministic CLI interactions, reproducible catalog builds, strict TypeScript compilation to catch metadata errors early, and offline-friendly execution (no external fetch beyond documentation retrieval).
36 | - Optional platform-specific feature: MCP server to host prompts with DocFetch signal exposure; fallback requires manual slash commands and local scripts to remain fully functional.
37 | 
38 | # Development Roadmap  
39 | - **MVP Phase**
40 |   - Scope: Deliver DocFetch Preflight Guardrails, Lifecycle Prompt Library, and Prompt Metadata Automation.
41 |   - Acceptance criteria: Prompts run end-to-end, DocFetch enforcement blocks when sources are stale, validation/build scripts succeed and update metadata artifacts.
42 | - **Post-MVP Enhancements**
43 |   - Scope: Implement MCP Evolution Readiness and document automation hooks.
44 |   - Acceptance criteria: README Future enhancements details the MCP architecture, optional tooling is outlined, and manual workflows remain documented and working.
45 | 
46 | # Logical Dependency Chain  
47 | 1. Establish repo structure and baseline documentation (README, WORKFLOW).
48 | 2. Author prompts with correct YAML metadata.
49 | 3. Ensure Node/TypeScript tooling runs locally (`npm run validate:metadata`, `npm run build:catalog`).
50 | 4. Enforce DocFetch preflight prompts across workflows.
51 | 5. Publish lifecycle prompts covering all phases.
52 | 6. Document MCP automation path while preserving manual usability.
53 | 
54 | # Risks and Mitigations  
55 | - DocFetch misuse: Users might bypass preflight guardrails. Mitigation: Embed DocFetch reminders and remediation steps directly inside P0 prompts.
56 | - Metadata drift: Catalog or README tables could desync. Mitigation: Require validation/build scripts locally and via CI checks.
57 | - CLI compatibility changes: Codex CLI updates may alter slash-command behavior. Mitigation: Maintain troubleshooting guidance in README and monitor release notes.
58 | - TypeScript dependency issues: Tooling relies on strict TypeScript configuration. Mitigation: Pin `strict: true`, ES2020 target, CommonJS modules, and audit dependencies periodically.
59 | - MCP roadmap uncertainty: Automation timeline may shift. Mitigation: Treat MCP features as optional enhancements with manual fallback documented.
60 | 
61 | # Appendix  
62 | Assumptions:
63 | - Codex CLI resolves prompts placed in `~/.codex/prompts` without additional configuration.
64 | - Teams can run Node LTS locally to execute validation and catalog scripts.
65 | - No external data stores or APIs are required beyond internal documentation.
66 | - MCP server work proceeds only when roadmap resources align; manual prompts remain the primary workflow until then.
67 | References: README.md, WORKFLOW.md, scripts/validate_metadata.ts, scripts/build_catalog.ts, tsconfig.json.
```

.taskmaster/reports/task-complexity-report.json
```
1 | {
2 | 	"meta": {
3 | 		"generatedAt": "2025-09-21T22:54:40.875Z",
4 | 		"tasksAnalyzed": 13,
5 | 		"totalTasks": 36,
6 | 		"analysisCount": 13,
7 | 		"thresholdScore": 5,
8 | 		"projectName": "Taskmaster",
9 | 		"usedResearch": true
10 | 	},
11 | 	"complexityAnalysis": [
12 | 		{
13 | 			"taskId": 22,
14 | 			"taskTitle": "Document CLI Distribution and Usage Lifecycle",
15 | 			"complexityScore": 3,
16 | 			"recommendedSubtasks": 4,
17 | 			"expansionPrompt": "1. **Configuration**: Modify `package.json` to add the `bin` field mapping `prompts-cli` to `dist/bin/cli.js`, add `dist` to the `files` array, and add a `prepublishOnly` script set to `npm run test && npm run build`. \n2. **Shebang**: Add `#!/usr/bin/env node` to the top of the main CLI source file (likely `src/bin/cli.ts` or similar).\n3. **Documentation**: Create a new 'CLI Distribution and Usage' section in `README.md`. Document the four required areas: 'Prepare for Publishing' (referencing the `package.json` changes), 'Local Development Workflow' (detailing `npm link`), 'Publishing to npm' (including the `prepublishOnly` script), and 'End-User Installation and Usage'. Provide clear, copy-pasteable commands for each step.",
18 | 			"reasoning": "This task is primarily documentation and configuration. The codebase analysis reveals that the required changes are localized to `package.json`, `README.md`, and the addition of a single line (shebang) to the CLI entry point. There is no complex algorithmic work involved. The complexity score of 3 reflects the need to touch multiple files and write clear, verifiable instructions for a multi-step developer workflow (`npm link`, `npm publish`), which is more involved than a simple code change but is not fundamentally difficult."
19 | 		},
20 | 		{
21 | 			"taskId": 25,
22 | 			"taskTitle": "Project Initialization and Scaffolding",
23 | 			"complexityScore": 2,
24 | 			"recommendedSubtasks": 2,
25 | 			"expansionPrompt": "1. **Initialize Project**: Run `pnpm init`. Install dev dependencies: `pnpm add -D typescript ts-node @types/node jest ts-jest`. \n2. **Configure TypeScript**: Create `tsconfig.json` with `\"target\": \"ES2022\"`, `\"module\": \"NodeNext\"`, `\"moduleResolution\": \"NodeNext\"`, `\"outDir\": \"./dist\"`, `\"rootDir\": \"./src\"`, and `\"strict\": true`. \n3. **Configure Jest**: Create `jest.config.js` with the `ts-jest` preset. \n4. **Create Directories**: Create the following empty directories: `src`, `schemas`, `bin`, `packages`, `tests`.",
26 | 			"reasoning": "This is a standard, greenfield setup task. It involves running a series of well-known commands and creating configuration files from templates. The status is 'in-progress', but a codebase analysis shows these foundational files and directories do not yet exist. The complexity is low (2) because it follows a standard recipe with no custom logic or problem-solving required. It's a foundational step but mechanically simple. Breaking it into 'dependency installation' and 'config file creation' is a logical split."
27 | 		},
28 | 		{
29 | 			"taskId": 26,
30 | 			"taskTitle": "Define Canonical Task JSON Schema",
31 | 			"complexityScore": 2,
32 | 			"recommendedSubtasks": 1,
33 | 			"expansionPrompt": "Create the file `schemas/task.json`. In this file, define a JSON Schema object. Set `$schema` to `\"http://json-schema.org/draft-07/schema#\"`. The schema `type` should be `\"object\"`. Define properties for all fields listed in the description (`id`, `title`, etc.). Mark the original Task-Master fields (`id`, `title`, `description`, `status`, `dependencies`, `priority`) as `required`. The new fields (`labels`, `metadata`, etc.) should be optional. Ensure `subtasks` is defined as an array of objects.",
34 | 			"reasoning": "This task involves creating a single, declarative JSON file. The structure and fields are explicitly defined in the task description. The complexity (2) comes from needing to know the correct JSON Schema syntax for defining types, properties, and the `required` array. It is not algorithmic and is a self-contained, atomic unit of work, hence 1 subtask is sufficient."
35 | 		},
36 | 		{
37 | 			"taskId": 27,
38 | 			"taskTitle": "Implement Task-Master Ingest Adapter",
39 | 			"complexityScore": 4,
40 | 			"recommendedSubtasks": 3,
41 | 			"expansionPrompt": "1. **Setup**: Create `src/adapters/taskmaster/ingest.ts`. Install `ajv` (`pnpm add ajv`). Define the internal `PromptsTask` type in a new file `src/types.ts`, mirroring the schema from Task 26.\n2. **Implementation**: In `ingest.ts`, create a main function that accepts a file path. Use Node's `fs` module to read and parse the JSON file. Instantiate `ajv` and use it to validate the parsed data against the schema from `schemas/task.json`. If valid, map the data to `PromptsTask[]`. Handle status value normalization. The function should be asynchronous and return the task array.\n3. **Testing**: Create `tests/adapters/ingest.test.ts`. Write Jest tests using a sample `tasks.json` file. Test for successful parsing, schema validation failure on an invalid file, and correct mapping of data.",
42 | 			"reasoning": "This task is the first piece of real application logic. It involves file I/O, data parsing, integration with a validation library (`ajv`), and data transformation (mapping to an internal type). Codebase analysis shows no existing adapters or validation patterns, so this is greenfield development. The complexity score of 4 reflects the need to orchestrate these multiple steps into a single, robust function. It can be broken down into defining the types, implementing the core logic, and writing tests."
43 | 		},
44 | 		{
45 | 			"taskId": 28,
46 | 			"taskTitle": "Implement State Engine: Readiness and 'next' Logic",
47 | 			"complexityScore": 5,
48 | 			"recommendedSubtasks": 3,
49 | 			"expansionPrompt": "1. **Setup**: Create `src/state/graph.ts` and import the `PromptsTask` type.\n2. **Readiness Logic**: Implement `computeReadiness(tasks: PromptsTask[]): PromptsTask[]`. Inside, first create a `Map<number, string>` of task IDs to their statuses for efficient lookups. Then, filter the input `tasks` array, returning only those where all `dependencies` exist in the map with a status of 'done'.\n3. **'next' Logic**: Implement `next(tasks: PromptsTask[]): PromptsTask | null`. This function should first call `computeReadiness` to get the pool of available tasks. Then, sort this pool using a multi-level sort: priority descending (map 'high' to 3, 'medium' to 2, 'low' to 1), then by the number of tasks that depend on it (dependency count) descending, and finally by task ID ascending. Return the first element of the sorted array, or null if empty.",
50 | 			"reasoning": "This is the core algorithmic task of the project. It involves graph traversal logic (dependency checking) and a complex multi-key sort. The complexity (5) is justified because the implementation must be correct and reasonably efficient, especially the dependency checking part, which can be slow if not implemented with a lookup map. This is a greenfield implementation of a non-trivial algorithm. It naturally splits into implementing the readiness filter, the 'next' sorter, and comprehensive tests."
51 | 		},
52 | 		{
53 | 			"taskId": 29,
54 | 			"taskTitle": "Implement State Engine: Status Update Logic",
55 | 			"complexityScore": 1,
56 | 			"recommendedSubtasks": 1,
57 | 			"expansionPrompt": "Create the file `src/state/update.ts`. Import the `PromptsTask` type. Implement and export a pure function `advance(tasks: PromptsTask[], id: number, newStatus: string): PromptsTask[]`. The implementation should use `tasks.map()` to iterate over the array. For the task where `task.id` matches the `id` parameter, return a new object using the spread syntax `{ ...task, status: newStatus }`. For all other tasks, return the original task object. Add a unit test in `tests/state/update.test.ts` to verify that the correct task is updated and that the original input array is not mutated.",
58 | 			"reasoning": "This task requires implementing a pure function for an immutable update, which is a standard pattern in modern JavaScript/TypeScript. The implementation is a single line of code using `Array.prototype.map`. Codebase analysis confirms no existing state update logic exists, but the pattern is universal. The complexity is minimal (1), as it's a simple, self-contained function with no external dependencies or complex algorithms. It is an atomic operation."
59 | 		},
60 | 		{
61 | 			"taskId": 30,
62 | 			"taskTitle": "Implement MCP Stdio Server",
63 | 			"complexityScore": 6,
64 | 			"recommendedSubtasks": 4,
65 | 			"expansionPrompt": "1. **Server Shell**: Create `src/mcp/server.ts`. Use Node's `readline` module to create an interface that reads from `process.stdin` line by line.\n2. **State Management**: The server should load tasks from a file on startup using the ingest adapter (Task 27) and hold the task array in memory.\n3. **Request Loop**: In the `readline` 'line' event handler, parse the incoming line as JSON. Use a `switch` statement or a handler map based on the request's `method` property.\n4. **Handlers**: Implement handlers for `next_task` (calls `next` from Task 28), `set_task_status` (calls `advance` from Task 29 and updates the in-memory state), `get_task`, `list_tasks`, and `graph_export`. Each handler should construct a JSON response object and write it to `process.stdout` as a string followed by a newline. Implement the write-mode flag logic for `set_task_status`.",
66 | 			"reasoning": "This task involves building a small, protocol-specific server that runs as a persistent process. It's not just a simple script. It requires managing an event loop (`readline`), handling I/O streams, managing in-memory state, and dispatching requests. The complexity (6) comes from orchestrating these components, implementing the line-delimited JSON protocol correctly, and integrating the previously built state-engine functions into a live server context. This is a significant piece of infrastructure for the project."
67 | 		},
68 | 		{
69 | 			"taskId": 31,
70 | 			"taskTitle": "Implement Thin CLI with Commander.js",
71 | 			"complexityScore": 4,
72 | 			"recommendedSubtasks": 4,
73 | 			"expansionPrompt": "1. **Setup**: Create `src/bin/cli.ts`. Add `#!/usr/bin/env node`. Install `commander` (`pnpm add commander`). Set up the main `program` object.\n2. **Read-only Commands**: Add commands for `next`, `status`, and `graph`. Each command's action handler should load tasks using the ingest adapter, call the appropriate state engine function (e.g., `next()`), and print the result to the console as a JSON string using `JSON.stringify`.\n3. **Write Command**: Add the `advance <id> <status>` command. Its action handler should load tasks, call the `advance()` function, and then write the *entire updated task list* back to the source file, overwriting it.\n4. **Graph Command**: For the `graph` command, add an option `--format <type>` (defaulting to `json`). If `json`, output the task graph. If `dot`, transform the task graph into the DOT language format for Graphviz.",
74 | 			"reasoning": "This task involves wiring up the core logic to a user-facing CLI using a framework. Codebase analysis shows `commander` is not yet a dependency. The complexity (4) is not in the core logic (which is already written), but in setting up the command structure, parsing arguments, handling file I/O for both reading and writing state, and formatting output correctly for multiple commands. It touches many parts of the system (ingest, state, file system) and requires careful implementation of the command actions."
75 | 		},
76 | 		{
77 | 			"taskId": 32,
78 | 			"taskTitle": "Create Mastra Tools Package for AI SDK",
79 | 			"complexityScore": 4,
80 | 			"recommendedSubtasks": 3,
81 | 			"expansionPrompt": "1. **Package Setup**: Create a new directory `packages/prompts-tools`. Inside, create a `package.json` defining the package name and its dependencies (e.g., `zod`, Vercel AI SDK). Configure the root `pnpm-workspace.yaml` to include `packages/*`.\n2. **Tool Definitions**: Create `packages/prompts-tools/src/index.ts`. Import the state engine functions (`next`, `advance`) from the main project. For each function, create a tool definition compatible with the Vercel AI SDK's `generateObject`. Use `zod` to define the `parameters` schema (e.g., `z.object({ id: z.number(), status: z.string() })` for `set_task_status`).\n3. **Tool Handlers**: The `execute` property of each tool should be an async function that calls the corresponding state engine function and returns the result. Export all tool definitions from the main `index.ts` file.",
82 | 			"reasoning": "This is an integration task that requires knowledge of a specific third-party library (Vercel AI SDK) and monorepo project structure. The complexity (4) arises from creating a new, separately published package, managing its dependencies, and wrapping the existing core logic in the specific adapter format required by the AI SDK, including schema definitions with `zod`. While the core logic is simple, the packaging and adapter boilerplate add a moderate level of effort."
83 | 		},
84 | 		{
85 | 			"taskId": 33,
86 | 			"taskTitle": "Implement Provider Presets and Fallback Logic",
87 | 			"complexityScore": 6,
88 | 			"recommendedSubtasks": 4,
89 | 			"expansionPrompt": "1. **Provider Interface**: Create `src/providers/interface.ts`. Define a `LLMProvider` interface with a method like `generate(prompt: string): Promise<string>`.\n2. **Implementations**: Create `src/providers/ollama.ts`, `src/providers/geminiCli.ts`, and `src/providers/stub.ts`, each exporting a class that implements the `LLMProvider` interface. The `stub` provider should return a hardcoded warning message.\n3. **Availability Checks**: The Ollama provider's constructor or a static method should check for server availability by making a `fetch` call to the Ollama health endpoint. The Gemini provider should check for the CLI tool's existence in the system PATH.\n4. **Factory**: Create `src/providers/factory.ts`. Implement an async function `getProvider()` that attempts to instantiate providers in a preferred order (e.g., Ollama, then Gemini). It should use `try/catch` blocks around each instantiation. Return the first one that succeeds, and if all fail, return an instance of the `StubProvider`.",
90 | 			"reasoning": "This task introduces a significant new abstraction layer (the Provider interface) and deals with the complexities of runtime environment detection and external service interaction. The complexity (6) is high because it involves designing an abstraction, implementing multiple versions of it, and creating a factory with fallback logic that must gracefully handle failures (like network errors or missing executables). This is a robust piece of infrastructure, not a simple function call."
91 | 		},
92 | 		{
93 | 			"taskId": 34,
94 | 			"taskTitle": "Document Client Configuration for Codex and Gemini",
95 | 			"complexityScore": 2,
96 | 			"recommendedSubtasks": 2,
97 | 			"expansionPrompt": "1. **File Creation**: Create a new file at `docs/client_setup.md`.\n2. **Content Structure**: Add a main heading 'Client Configuration'. Create two sub-sections: 'Codex Client Setup' and 'Gemini Client Setup'.\n3. **Configuration Snippets**: In each section, provide a brief explanation and then a copy-pasteable code block for the client's configuration file. Provide examples in both TOML and JSON formats. The configuration must show how to register the MCP stdio server as a tool or command source.\n4. **Path Examples**: Use a clear placeholder like `</path/to/your/project>` for the command path. Crucially, add a note and a specific example for Windows Subsystem for Linux (WSL) users, showing the `/mnt/c/Users/...` path format.",
98 | 			"reasoning": "This is a straightforward documentation task. Codebase analysis shows no existing `docs` directory, so it's a net-new file. The complexity is low (2) because it involves writing clear technical instructions and providing configuration examples, not writing code. The main effort is ensuring the examples are correct, clear, and account for common edge cases like WSL paths. It can be split into creating the doc and then populating the content for each client."
99 | 		},
100 | 		{
101 | 			"taskId": 35,
102 | 			"title": "Implement Optional Artifact Enrichment",
103 | 			"complexityScore": 4,
104 | 			"recommendedSubtasks": 3,
105 | 			"expansionPrompt": "1. **Enrichment Module**: Create a new directory `src/enrichment`. Inside, create `index.ts` which exports a main async function `enrichTasks(tasks: PromptsTask[]): Promise<PromptsTask[]>`. This function will orchestrate all enrichment steps.\n2. **Artifact Parser**: Create `src/enrichment/complexity.ts`. It should export a function that, given a task, checks for a corresponding artifact file (e.g., `artifacts/task-22-complexity.json`), reads it, and parses its content. This function must be wrapped in a `try-catch` block to handle missing files or parse errors gracefully, returning the original task on failure.\n3. **Integration**: Modify the `ingest` adapter from Task 27. After the initial list of tasks is parsed and validated, call the main `enrichTasks` function, passing the task list to it. The enrichment must be non-blocking; the ingest process must succeed even if all enrichment fails. The final, enriched list of tasks should be the return value of the ingest function.",
106 | 			"reasoning": "This task requires modifying the existing `ingest` pipeline to add an optional, fault-tolerant step. The complexity (4) comes from the need to design this process to be non-blocking and modular. It involves file system logic, data parsing, and carefully modifying an existing critical path (ingestion) without introducing fragility. The logic must handle errors gracefully so that missing artifacts don't break the entire application. This is more complex than a simple function, as it involves architectural considerations for extensibility and robustness."
107 | 		},
108 | 		{
109 | 			"taskId": 36,
110 | 			"title": "Implement Observability and Secure Logging",
111 | 			"complexityScore": 5,
112 | 			"recommendedSubtasks": 4,
113 | 			"expansionPrompt": "1. **Library and Setup**: Install a structured logging library like `pino` (`pnpm add pino`). Create `src/logging.ts`. In this file, create a factory function `createLogger(options)` that initializes and returns a `pino` logger instance.\n2. **Secure Defaults**: Configure the default logger to have a `redact` option for paths like `*.title`, `*.description`, and `*.details` to prevent logging sensitive task content. The log level should default to `info`.\n3. **CLI Integration**: Modify the CLI entry point (Task 31). Add global `--verbose` and `--unsafe-logs` flags using `commander`. Based on these flags, call `createLogger` with appropriate options (e.g., `level: 'debug'` for verbose, empty `redact` array for unsafe) and pass the logger instance to the command handlers.\n4. **Server Integration**: Modify the MCP server (Task 30) to accept similar flags or environment variables to configure its logger instance, ensuring all server output is structured and secure by default.",
114 | 			"reasoning": "This is a cross-cutting concern that touches multiple parts of the application (CLI, server). The complexity (5) is not just in adding a library, but in implementing the security-conscious defaults. The redaction logic requires a deep understanding of the logger's API and the application's data structures. Propagating the logger instance and its configuration based on runtime flags through the application adds another layer of complexity. It's a foundational infrastructure task that requires careful design."
115 | 		}
116 | 	]
117 | }
```

.taskmaster/tasks/task_001.txt
```
1 | # Task ID: 1
2 | # Title: Project Setup and Server Bootstrap
3 | # Status: done
4 | # Dependencies: None
5 | # Priority: high
6 | # Description: Initialize a Node.js TypeScript project and set up the basic MCP server using stdio transport. This includes creating the main entry point, configuring graceful shutdown, and establishing structured NDJSON logging.
7 | # Details:
8 | Create a `package.json` with dependencies like `@modelcontextprotocol/sdk` and `typescript`. Set up `tsconfig.json` for compilation to `dist/`. Implement the main server file (`src/index.ts`) to instantiate `StdioServerTransport`, register server info (name, version), and handle SIGINT/SIGTERM for graceful shutdown. Implement a basic structured logger that outputs NDJSON.
9 | 
10 | # Test Strategy:
11 | Manually start the server and connect with an MCP client like MCP Inspector. Verify that the server reports its name and version. Send a SIGINT signal and confirm the server logs a 'server_stop' message and exits cleanly.
12 | 
13 | # Subtasks:
14 | ## 1. Configure package.json and tsconfig.json [done]
15 | ### Dependencies: None
16 | ### Description: Update the project's package.json to include necessary dependencies and scripts. Configure tsconfig.json to define the TypeScript compilation settings, ensuring output is directed to the dist/ directory.
17 | ### Details:
18 | In `package.json`, add `@modelcontextprotocol/sdk` to `dependencies`. Add `typescript`, `ts-node`, and `@types/node` to `devDependencies`. Add a `build` script (`"tsc"`) and a `start` script (`"node dist/index.js"`). In `tsconfig.json`, set `compilerOptions.outDir` to `./dist`, `rootDir` to `./src`, and ensure `moduleResolution` is `node`.
19 | 
20 | ## 2. Implement a Structured NDJSON Logger [done]
21 | ### Dependencies: None
22 | ### Description: Create a simple logger in `src/logger.ts` that writes structured log messages to `stdout` in NDJSON (Newline Delimited JSON) format. This utility will be used for all server logging.
23 | ### Details:
24 | Implement a `Logger` class or object in `src/logger.ts` with `info`, `warn`, and `error` methods. Each method should accept a message and an optional metadata object. The output for each log entry must be a single-line JSON string containing a timestamp, log level, message, and any metadata, written to `process.stdout`.
25 | 
26 | ## 3. Bootstrap MCP Server with Stdio Transport [done]
27 | ### Dependencies: 1.1, 1.2
28 | ### Description: In the main entry point `src/index.ts`, initialize the core server components by instantiating the MCP server and the standard I/O transport layer.
29 | ### Details:
30 | In `src/index.ts`, import the logger from `./logger.ts`. Import `MCPServer` and `StdioServerTransport` from `@modelcontextprotocol/sdk`. Inside a `main` async function, instantiate the logger, then the `StdioServerTransport`, and finally the `MCPServer`, passing the transport and logger to its constructor.
31 | 
32 | ## 4. Register Server Information and Start Listening [done]
33 | ### Dependencies: 1.3
34 | ### Description: Configure the server with its identity by registering its name and version, and then start the server to begin listening for client connections over stdio.
35 | ### Details:
36 | In the `main` function of `src/index.ts`, read the `version` from `package.json`. Call the `server.info.register()` method with a server name (e.g., "MCP Reference Server") and the version. After registration, call `server.start()` and log a confirmation message indicating the server is running.
37 | 
38 | ## 5. Implement Graceful Shutdown and Top-Level Error Handling [done]
39 | ### Dependencies: 1.3
40 | ### Description: Add signal handlers in `src/index.ts` to ensure the server shuts down cleanly on SIGINT/SIGTERM signals and that any uncaught exceptions are logged before exiting.
41 | ### Details:
42 | Add listeners for `process.on('SIGINT', ...)` and `process.on('SIGTERM', ...)`. The handler should invoke `await server.stop()`, log a 'server_stop' message, and exit with `process.exit(0)`. Also, implement a `process.on('uncaughtException', ...)` handler to log the fatal error using the NDJSON logger before exiting with a non-zero status code.
43 | 
```

.taskmaster/tasks/task_002.txt
```
1 | # Task ID: 2
2 | # Title: Implement Safety Control Utilities
3 | # Status: done
4 | # Dependencies: 1
5 | # Priority: high
6 | # Description: Create utility functions for redacting secrets in logs and capping payload sizes to prevent data leakage and excessive resource usage.
7 | # Details:
8 | Create a logging utility that wraps the base logger. This utility should scan log objects for keys matching the regex `/(key|secret|token)/i` and replace their values with `[redacted]`. Create a `capPayload` function that truncates strings larger than ~1 MB and appends a note like `[truncated N bytes]`. These utilities should be pure functions and easily testable.
9 | 
10 | # Test Strategy:
11 | Unit test the redaction logic by passing objects with keys like `API_KEY` and `SECRET_TOKEN`. Unit test the `capPayload` function with strings smaller than, equal to, and larger than the 1 MB threshold to verify correct truncation and messaging.
12 | 
13 | # Subtasks:
14 | ## 1. Create `redactSecrets` Utility Function [done]
15 | ### Dependencies: None
16 | ### Description: Implement a pure function to recursively scan an object and redact values for keys matching a specific regex.
17 | ### Details:
18 | In a new file, `src/utils/safety.ts`, create and export a pure function `redactSecrets(data: any)`. This function should recursively traverse any given object or array. If it encounters an object key that matches the case-insensitive regex `/(key|secret|token)/i`, it must replace the corresponding value with the string `[redacted]`. The function should handle nested objects and arrays without modifying the original input object (i.e., it should return a new, deep-cloned object).
19 | 
20 | ## 2. Create `capPayload` Utility Function [done]
21 | ### Dependencies: None
22 | ### Description: Implement a pure function to truncate large strings to a specified maximum size.
23 | ### Details:
24 | In the same `src/utils/safety.ts` file, create and export a pure function `capPayload(payload: string, maxSize: number = 1024 * 1024)`. This function will check if the input string's size exceeds `maxSize`. If it does, the function should truncate the string to `maxSize` bytes and append a message indicating how many bytes were removed, e.g., `[truncated 42 bytes]`. If the string is within the limit, it should be returned unmodified.
25 | 
26 | ## 3. Implement Unit Tests for `redactSecrets` [done]
27 | ### Dependencies: 2.1
28 | ### Description: Create a suite of unit tests to validate the behavior of the `redactSecrets` function.
29 | ### Details:
30 | In a new test file, `src/utils/safety.test.ts`, write comprehensive unit tests for the `redactSecrets` function. Test cases should include: an object with sensitive keys (`apiKey`, `SECRET_TOKEN`), a deeply nested object with sensitive keys, an array of objects, an object with no sensitive keys (to ensure it remains unchanged), and non-object inputs to ensure graceful handling.
31 | 
32 | ## 4. Implement Unit Tests for `capPayload` [done]
33 | ### Dependencies: 2.2
34 | ### Description: Create a suite of unit tests to validate the behavior of the `capPayload` function.
35 | ### Details:
36 | In the `src/utils/safety.test.ts` file, add unit tests for the `capPayload` function. Cover the main scenarios: a string smaller than the 1MB threshold, a string larger than the threshold (verifying correct truncation and the appended message), and edge cases like an empty string or a string exactly at the threshold.
37 | 
38 | ## 5. Create and Integrate Secure Logger Wrapper [done]
39 | ### Dependencies: 2.1
40 | ### Description: Create a logging utility that wraps the base logger to automatically redact secrets from log objects.
41 | ### Details:
42 | Based on the existing logging implementation, create a secure logger wrapper. This wrapper will expose standard logging methods (e.g., `info`, `warn`, `error`). Before passing a log object to the base logger, it must first process the object with the `redactSecrets` function created in subtask 2.1. This ensures that no sensitive data is ever written to the logs. This new utility should be exported for use throughout the application.
43 | 
```

.taskmaster/tasks/task_003.txt
```
1 | # Task ID: 3
2 | # Title: Implement Resource Exposure
3 | # Status: done
4 | # Dependencies: 1, 2
5 | # Priority: high
6 | # Description: Load prompt metadata from `resources/prompts.meta.yaml` and expose each prompt's Markdown file as a `file://` resource.
7 | # Details:
8 | On server startup, parse `prompts.meta.yaml`. For each entry, register a resource with the MCP server. The resource should have a human-friendly name (from the `title` field) and a `file://` URI pointing to the absolute path of the corresponding Markdown file. The resource content preview should be capped using the utility from task 2.
9 | 
10 | # Test Strategy:
11 | Start the server and use an MCP client to list resources. Verify that each prompt from the metadata file is listed with the correct name and a valid `file://` URI. Check that reading an oversized resource returns truncated content.
12 | 
13 | # Subtasks:
14 | ## 1. Create a utility to parse `prompts.meta.yaml` [done]
15 | ### Dependencies: None
16 | ### Description: Add the `js-yaml` dependency to the project. Create a new utility function that reads the `resources/prompts.meta.yaml` file, parses its content, and returns a structured object. This function should handle potential file read or parsing errors gracefully.
17 | ### Details:
18 | Create a new file, e.g., `src/prompts/loader.ts`. Add a function `loadPromptMetadata()` that uses `fs.readFileSync` and `yaml.load`. Define a TypeScript interface for the expected structure of the YAML file (e.g., `{ prompts: [...] }`).
19 | 
20 | ## 2. Implement logic to transform metadata into resource objects [done]
21 | ### Dependencies: 3.1
22 | ### Description: Create a function that takes the parsed prompt metadata, iterates through each prompt entry, and transforms it into a `Resource` object as expected by the MCP server. This includes resolving the file path to an absolute `file://` URI.
23 | ### Details:
24 | In `src/prompts/loader.ts`, create a function like `preparePromptResources(metadata)`. For each prompt, use the `path` module to resolve the relative file path from `prompts.meta.yaml` to an absolute path. Format the absolute path as a `file://` URI. The resulting object should conform to the `Resource` interface, which includes `name` (from `title`) and `uri`.
25 | 
26 | ## 3. Generate and cap content previews for each resource [done]
27 | ### Dependencies: 3.2
28 | ### Description: Enhance the resource preparation logic to read the content of each prompt's Markdown file and generate a capped content preview using the utility from task 2.
29 | ### Details:
30 | Modify the function from the previous subtask. For each prompt, read the content of its Markdown file using `fs.readFileSync`. Import and use the `capContent` utility (assuming it's in `src/util/content.ts`) to truncate the file content. Add the resulting string to the `contentPreview` field of the `Resource` object.
31 | 
32 | ## 4. Integrate resource registration into the server startup sequence [done]
33 | ### Dependencies: 3.2, 3.3
34 | ### Description: In the main server entry point, call the new functions to load, prepare, and register the prompt resources with the MCP server instance after it has been initialized.
35 | ### Details:
36 | Modify `src/main.ts`. After the `MCPServer` instance is created, call the prompt loading and preparation functions. Iterate over the generated list of `Resource` objects and call `mcpServer.registerResource()` for each one. This should happen before the server starts listening for connections.
37 | 
38 | ## 5. Add an integration test to validate resource exposure [done]
39 | ### Dependencies: 3.4
40 | ### Description: Create a new integration test that starts the server, uses an MCP client to request the list of all available resources, and validates that the prompts from `prompts.meta.yaml` are present with the correct details.
41 | ### Details:
42 | In a new test file, e.g., `test/integration/resource.test.ts`, write a test case that connects to the running server. It should call the `list_resources` tool. The test will then assert that the returned list contains entries corresponding to the prompts, verifying the `name`, `uri` (is a valid `file://` URI), and `contentPreview` (is a non-empty, capped string).
43 | 
```

.taskmaster/tasks/task_004.txt
```
1 | # Task ID: 4
2 | # Title: Implement Dynamic Prompt Tools
3 | # Status: done
4 | # Dependencies: 2, 3
5 | # Priority: high
6 | # Description: Expose each prompt defined in `resources/prompts.meta.yaml` as a dynamically generated MCP tool.
7 | # Details:
8 | During server startup, iterate through the entries in `prompts.meta.yaml`. For each entry, dynamically register an MCP tool with an `id` matching the metadata. Generate input/output schemas based on the metadata. The tool's handler should read the corresponding Markdown file from `resources/prompts/`, append a rendered footer, and return the content, applying the payload cap from task 2.
9 | 
10 | # Test Strategy:
11 | Use an MCP client to list tools and verify that a tool exists for each prompt in the metadata file. Invoke a tool and confirm the response contains the correct Markdown content. Test with a prompt file larger than 1 MB to ensure the response is truncated.
12 | 
13 | # Subtasks:
14 | ## 1. Create a Utility to Load and Parse Prompt Metadata [done]
15 | ### Dependencies: None
16 | ### Description: Implement a function that reads `resources/prompts.meta.yaml`, parses it, and returns a validated, typed array of prompt metadata objects. This will serve as the single source of truth for prompt definitions.
17 | ### Details:
18 | Create a new file `src/lib/prompt-loader.ts`. Add an exported function `loadPromptDefinitions()`. This function should use the `fs` module to read `resources/prompts.meta.yaml` and the `js-yaml` library to parse its content. Define a TypeScript interface for the prompt metadata structure (e.g., `PromptDefinition`) and ensure the parsed data conforms to this type before returning it. This utility will be called during server startup.
19 | 
20 | ## 2. Develop a Generic Handler for Prompt Tools [done]
21 | ### Dependencies: None
22 | ### Description: Create a generic handler function that can be used by all dynamically generated prompt tools. The handler will be responsible for reading the prompt content, appending a footer, and applying the payload cap.
23 | ### Details:
24 | In a new file, e.g., `src/tools/prompt-handler.ts`, create a factory function `createPromptHandler(promptFilePath: string)`. This function should return an async `ToolHandler` function. The handler will read the file content from the provided `promptFilePath`, append a standard rendered footer (a simple string for now), and then apply the payload capping utility from Task 2 to the final content. The handler should return an object like `{ content: '...' }`.
25 | 
26 | ## 3. Implement Dynamic Schema Generation from Metadata [done]
27 | ### Dependencies: 4.1
28 | ### Description: Create a function that generates JSON schemas for a tool's input and output based on the `variables` defined in its metadata.
29 | ### Details:
30 | In a new utility file, e.g., `src/lib/schema-generator.ts`, create a function `generateSchemas(metadata: PromptDefinition)`. This function will generate the `inputSchema` by creating a JSON Schema `object` with `properties` corresponding to each item in the metadata's `variables` array. The `outputSchema` should be a static JSON Schema defining an object with a single string property named `content`.
31 | 
32 | ## 4. Integrate Dynamic Tool Registration into Server Startup [done]
33 | ### Dependencies: 4.1, 4.2, 4.3
34 | ### Description: Modify the server's startup sequence to iterate through the loaded prompt definitions and register an MCP tool for each one.
35 | ### Details:
36 | In the primary tool registration file (e.g., `src/tools/tool-registry.ts`), create a new async function `registerPromptTools(mcpServer: McpServer)`. This function will call `loadPromptDefinitions()` (from subtask 4.1). It will then loop through each definition, calling `generateSchemas()` (subtask 4.3) and `createPromptHandler()` (subtask 4.2) for each. Finally, it will construct the complete `ToolDefinition` object (with `id`, schemas, and handler) and register it using `mcpServer.registerTool()`. Call this new function from the main server entry point (`src/server.ts`) during initialization.
37 | 
38 | ## 5. Add Integration Tests for Dynamic Prompt Tools [done]
39 | ### Dependencies: 4.4
40 | ### Description: Implement integration tests to verify that the dynamic tools are correctly exposed and functional through the MCP server.
41 | ### Details:
42 | In a new test file under `test/integration/`, write tests that use an MCP client to interact with the running server. One test should list all available tools and assert that a tool exists for each entry in `prompts.meta.yaml`. Another test should invoke a specific prompt tool and validate that the response body contains the expected markdown content. Add a final test using a large (>1MB) prompt file to ensure the response content is correctly truncated by the payload cap.
43 | 
```

.taskmaster/tasks/task_005.txt
```
1 | # Task ID: 5
2 | # Title: Implement Atomic State Store
3 | # Status: done
4 | # Dependencies: 1
5 | # Priority: high
6 | # Description: Create a `StateStore` class to manage workflow state persistence in `.mcp/state.json` using atomic file writes.
7 | # Details:
8 | Implement a class responsible for reading and writing the `ProjectState` JSON object. The `save` method must be atomic to prevent corruption. This should be achieved by writing the new state to a temporary file in the `.mcp/` directory and then using an atomic `rename` operation to replace the existing `state.json`. The store should also handle creating the `.mcp/` directory if it doesn't exist.
9 | 
10 | # Test Strategy:
11 | Write a test that simulates concurrent calls to the `save` method to ensure the final `state.json` file is always valid JSON and not a corrupted, partially written file. Verify that the directory is created if it's missing.
12 | 
13 | # Subtasks:
14 | ## 1. Create StateStore Class and Directory Initialization Logic [done]
15 | ### Dependencies: None
16 | ### Description: Create the file `src/state/StateStore.ts` and define the `StateStore` class. The constructor should accept a project root path and ensure the `.mcp` directory exists.
17 | ### Details:
18 | Define the `StateStore` class in a new file `src/state/StateStore.ts`. The constructor will take `projectRoot: string`. It should define and store private properties for the paths to the `.mcp` directory, `state.json`, and a temporary file like `state.json.tmp`. Implement a private async method that is called by the constructor to create the `.mcp` directory using `fs.promises.mkdir(mcpDir, { recursive: true })`. This ensures all subsequent file operations have a valid directory to work in.
19 | 
20 | ## 2. Implement `load` Method to Read State from Disk [done]
21 | ### Dependencies: 5.1
22 | ### Description: Implement an asynchronous `load` method to read and parse `.mcp/state.json`. It should handle cases where the file doesn't exist by providing a default initial state.
23 | ### Details:
24 | Add a public async `load` method to the `StateStore` class. This method will attempt to read `.mcp/state.json` using `fs.promises.readFile`. If the file doesn't exist (catch the 'ENOENT' error), it should initialize a default `ProjectState` object: `{ completedTools: [], artifacts: {} }`. The loaded or default state should be stored in a private property (e.g., `_state`). The method should return the state.
25 | 
26 | ## 3. Implement In-Memory State Accessors and Mutators [done]
27 | ### Dependencies: 5.1
28 | ### Description: Add methods to get the current state and to update it in memory, specifically by recording the completion of a tool. This prepares the store for use by other components like the `advance_state` tool.
29 | ### Details:
30 | Based on the `ProjectState` interface in `src/state/ProjectState.ts`, add a public getter `getState(): ProjectState` that returns a deep copy of the internal `_state` to prevent outside mutation. Also, add a public method `recordCompletion(completion: ToolCompletion)` which updates the internal `_state` by adding the new completion record to the `completedTools` array and merging the new artifacts into the top-level `artifacts` map.
31 | 
32 | ## 4. Implement Atomic `save` Method Using a Temporary File and Rename [done]
33 | ### Dependencies: 5.3
34 | ### Description: Implement the `save` method to atomically persist the current in-memory state to `.mcp/state.json`.
35 | ### Details:
36 | Create a public async `save` method. This method will take the current in-memory state from the `_state` property, stringify it with `JSON.stringify`, and write it to the temporary file path (`.mcp/state.json.tmp`) using `fs.promises.writeFile`. Upon successful write, it will use `fs.promises.rename` to atomically move the temporary file to the final `state.json` path, overwriting any existing file. This two-step process prevents file corruption.
37 | 
38 | ## 5. Create Comprehensive Unit Tests for StateStore [done]
39 | ### Dependencies: 5.1, 5.2, 5.3, 5.4
40 | ### Description: Develop a suite of unit tests in `test/state/StateStore.test.ts` to validate all public methods and behaviors of the `StateStore` class.
41 | ### Details:
42 | Using a testing framework like Jest and a temporary file system utility, create a test file for the `StateStore`. The tests should cover: 1. Directory creation on instantiation. 2. Loading from a non-existent file. 3. Correctly saving state via `recordCompletion` and `save`. 4. Correctly loading a previously saved state. 5. Ensure the `getState` method returns a value-identical but not reference-identical object.
43 | 
```

.taskmaster/tasks/task_006.txt
```
1 | # Task ID: 6
2 | # Title: Implement Planner `suggest_next_calls` Tool
3 | # Status: done
4 | # Dependencies: 4, 5
5 | # Priority: high
6 | # Description: Implement the `suggest_next_calls` tool to rank and suggest runnable tools based on DAG dependencies and available artifacts.
7 | # Details:
8 | Create a `Planner` class that loads `resources/default-graph.json` and the current state from the `StateStore`. Implement the logic for the `suggest_next_calls` tool. This logic should compute which nodes in the DAG are 'ready' by checking if their `dependsOn` nodes are complete and their `requiresArtifacts` are present in the state. Return a ranked list of candidates, sorted by `phase` and then `id`.
9 | 
10 | # Test Strategy:
11 | Unit test the planner logic. Given an empty state, verify it returns `discover_research`. Simulate the completion of `discover_research` with a `research_summary` artifact and verify `define_prd` is now suggested. Test that a node with unmet artifact requirements is not returned.
12 | 
13 | # Subtasks:
14 | ## 1. Create Planner Class and Load `default-graph.json` [done]
15 | ### Dependencies: None
16 | ### Description: Create a new file `src/planner.ts` and define a `Planner` class. The constructor should read `resources/default-graph.json`, parse it, and store the graph nodes in a private member. Also, define the necessary types for graph nodes in `src/types.ts`.
17 | ### Details:
18 | The class should have a private field `private graph: { nodes: any[] }`. The constructor will use `fs.readFileSync` and `JSON.parse` to load the graph data. The path to the graph file should be passed into the constructor. Add a `GraphNode` type definition to `src/types.ts` to represent the structure of nodes in the JSON file.
19 | 
20 | ## 2. Integrate `StateStore` into the `Planner` Class [done]
21 | ### Dependencies: 6.1
22 | ### Description: Modify the `Planner` class to accept a `StateStore` instance in its constructor. Store the `StateStore` instance as a private member to allow access to the current project state for subsequent logic.
23 | ### Details:
24 | Update the `Planner` constructor signature to accept an instance of `StateStore` (from Task 5). Store the passed `stateStore` in a `private readonly stateStore: StateStore` field. This will be used by other methods to query the project's state.
25 | 
26 | ## 3. Implement `dependsOn` Completion Check in `Planner` [done]
27 | ### Dependencies: 6.2
28 | ### Description: Create a private helper method within the `Planner` class, e.g., `areDependenciesMet(node: GraphNode): boolean`. This method should check if all task IDs listed in the node's `dependsOn` array are present in the list of completed tools from the `StateStore`.
29 | ### Details:
30 | The method will get the set of completed tool IDs from `this.stateStore.getCompletedToolIds()`. It will then iterate through the input node's `dependsOn` array and return `false` if any dependency ID is not in the completed set. If the `dependsOn` array is empty or all dependencies are met, it returns `true`.
31 | 
32 | ## 4. Implement `requiresArtifacts` Availability Check in `Planner` [done]
33 | ### Dependencies: 6.2
34 | ### Description: Create a private helper method, e.g., `areArtifactsAvailable(node: GraphNode): boolean`. This method should check if all artifacts listed in the node's `requiresArtifacts` array are available in the current state via the `StateStore`.
35 | ### Details:
36 | The method will get the set of available artifact names from `this.stateStore.getAvailableArtifacts()`. It will then iterate through the input node's `requiresArtifacts` array and return `false` if any required artifact is not in the available set. If `requiresArtifacts` is empty or all are available, it returns `true`.
37 | 
38 | ## 5. Implement `suggest_next_calls` to Filter and Rank Ready Nodes [done]
39 | ### Dependencies: 6.3, 6.4
40 | ### Description: Implement the public `suggest_next_calls` method. This method will iterate through all graph nodes, filter out already completed nodes, and use the `areDependenciesMet` and `areArtifactsAvailable` helpers to find 'ready' nodes. Finally, it will sort the ready nodes by `phase` (ascending) and then by `id` (alphabetical) before returning them.
41 | ### Details:
42 | The method should first get the list of completed tool IDs from the state. Then, it will `filter` the graph nodes based on three conditions: 1) The node's ID is not in the completed list. 2) `this.areDependenciesMet(node)` is true. 3) `this.areArtifactsAvailable(node)` is true. The resulting array of nodes should then be sorted using a custom comparator for `phase` then `id`.
43 | 
```

.taskmaster/tasks/task_007.txt
```
1 | # Task ID: 7
2 | # Title: Implement `advance_state` Tool
3 | # Status: done
4 | # Dependencies: 5, 6
5 | # Priority: high
6 | # Description: Create the `advance_state` MCP tool to mark a tool as complete and record its outputs and artifacts in the state file.
7 | # Details:
8 | Register a new MCP tool named `advance_state`. Its handler will accept a tool `id`, `outputs`, and a list of `artifacts`. The handler will call a `recordCompletion` method on the `StateStore` instance, which updates the in-memory state by adding the completed tool and merging the new artifacts. The handler then triggers the `StateStore` to save the updated state to disk. It should return `{ ok: true }` and the path to the state file on success.
9 | 
10 | # Test Strategy:
11 | Call `advance_state` with a valid tool ID and artifact mapping. Inspect the resulting `.mcp/state.json` file to confirm it contains the new completion record with a timestamp, outputs, and the correct artifact paths.
12 | 
13 | # Subtasks:
14 | ## 1. Implement `recordCompletion` Method in `StateStore` [done]
15 | ### Dependencies: None
16 | ### Description: Add a new public method `recordCompletion` to the `StateStore` class in `src/state/state-store.ts`. This method will accept a tool `id`, `outputs`, and a list of `artifacts`. It should create a `ToolCompletion` object with a new timestamp, add it to the `completedTools` map, and merge the new artifacts into the main `artifacts` map within the in-memory `ProjectState` object.
17 | ### Details:
18 | The method signature should be `recordCompletion(id: string, outputs: Record<string, any>, artifacts: Artifact[])`. It should not call `save()` itself; that responsibility will lie with the tool handler. The new artifacts should overwrite any existing artifacts with the same name. This method directly modifies the in-memory state managed by the `StateStore` instance.
19 | 
20 | ## 2. Define `advance_state` Tool and Zod Input Schema [done]
21 | ### Dependencies: None
22 | ### Description: Create a new file `src/tools/definitions/advance-state.ts`. In this file, define and export the Zod schema for the `advance_state` tool's input, which includes a string `id`, a `z.record(z.any())` for `outputs`, and an array of `artifact` objects for `artifacts`. Also, define the `McpTool` object with the name `advance_state`, a suitable description, and a reference to the schema.
23 | ### Details:
24 | The artifact schema within the input array should validate `source`, `name`, and `uri` as strings, consistent with the `Artifact` type in `src/state/state-types.ts`. The main tool object will be exported to be used for registration later. The handler function can be a placeholder for now.
25 | 
26 | ## 3. Implement `advance_state` Handler to Call `recordCompletion` [done]
27 | ### Dependencies: 7.1, 7.2
28 | ### Description: In `src/tools/definitions/advance-state.ts`, implement the body of the `handler` function for the `advance_state` tool. The handler will use the `stateStore` from its context to call the `recordCompletion` method, passing the validated `id`, `outputs`, and `artifacts` from its input.
29 | ### Details:
30 | The handler will receive `context: McpToolContext` and `input: { id: string, ... }`. It should destructure these arguments and call `context.stateStore.recordCompletion(input.id, input.outputs, input.artifacts)`. The handler function should be marked as `async`.
31 | 
32 | ## 4. Add State Persistence and Success Response to `advance_state` Handler [done]
33 | ### Dependencies: 7.3
34 | ### Description: Extend the `advance_state` handler in `src/tools/definitions/advance-state.ts`. After calling `recordCompletion`, the handler must call `await context.stateStore.save()` to persist the updated state to disk. On success, it should return an object `{ ok: true, statePath: <path_to_state.json> }`.
35 | ### Details:
36 | The `save()` method on `StateStore` is asynchronous and must be awaited. The path to the state file can be retrieved from a property on the `stateStore` instance (e.g., `context.stateStore.statePath`). This completes the core logic of the tool.
37 | 
38 | ## 5. Register `advance_state` Tool with the MCP Server [done]
39 | ### Dependencies: 7.2
40 | ### Description: Import the `advance_state` tool definition from `src/tools/definitions/advance-state.ts` into the main tool registration location (likely `src/mcp/mcp-server.ts` or a dedicated tool loading module). Register the tool with the `ToolRegistry` instance so it becomes available to the MCP server.
41 | ### Details:
42 | Locate the code block where other tools are registered, which is typically in the `McpServer` constructor or an initialization method. Add a line like `this.toolRegistry.registerTool(advanceStateTool);` to include the new tool in the server's list of available tools.
43 | 
```

.taskmaster/tasks/task_008.txt
```
1 | # Task ID: 8
2 | # Title: Implement `export_task_list` Tool
3 | # Status: done
4 | # Dependencies: 3
5 | # Priority: medium
6 | # Description: Create the `export_task_list` tool to emit a compact task list for interoperability with external systems.
7 | # Details:
8 | Register a new MCP tool named `export_task_list`. The handler will read `resources/prompts.meta.yaml` and map its contents to a JSON array. Each element in the array should contain `id`, `title`, `dependsOn`, and a default `status: 'pending'`. This provides a simple, structured view of the entire workflow.
9 | 
10 | # Test Strategy:
11 | Call the `export_task_list` tool. Validate that the returned JSON array contains an entry for every prompt defined in the metadata file and that the `id`, `title`, and `dependsOn` fields correctly match the source data.
12 | 
13 | # Subtasks:
14 | ## 1. Create `export_task_list` Tool Skeleton [done]
15 | ### Dependencies: None
16 | ### Description: Create the file `src/tools/export_task_list.ts` and define the basic structure for the new tool, including the factory function `createExportTaskListTool` and a placeholder implementation.
17 | ### Details:
18 | Following the existing pattern in `src/tools`, create a new file for the `export_task_list` tool. It should export a factory function that returns a `Tool` object with the name 'export_task_list', a clear description, an empty input schema, and a handler that currently returns an empty array. This establishes the boilerplate for the tool.
19 | 
20 | ## 2. Implement YAML File Reading and Parsing [done]
21 | ### Dependencies: 8.1
22 | ### Description: Update the `export_task_list` tool handler to read and parse the `resources/prompts.meta.yaml` file.
23 | ### Details:
24 | Use the `fs` module to read the contents of `resources/prompts.meta.yaml`. Add the `js-yaml` library as a dependency if it's not already part of the project. Use the library to parse the YAML content into a JavaScript array of objects. Implement basic error handling for file-not-found scenarios.
25 | 
26 | ## 3. Map Parsed YAML to the Specified JSON Array Format [done]
27 | ### Dependencies: 8.2
28 | ### Description: Transform the parsed data from `prompts.meta.yaml` into the final JSON array structure required by the task.
29 | ### Details:
30 | Within the tool's handler, iterate over the array of parsed prompt objects. For each object, create a new object containing the `id`, `title`, and `dependsOn` fields from the source. Add a `status` field with a default value of 'pending'. The handler should return this newly created array.
31 | 
32 | ## 4. Register the Tool with the MCP Server [done]
33 | ### Dependencies: 8.1
34 | ### Description: Integrate the newly created `export_task_list` tool into the main application by registering it with the MCP server on startup.
35 | ### Details:
36 | In `src/main.ts`, import the `createExportTaskListTool` factory function. In the main server initialization block, call the factory and pass the resulting tool object to the `server.registerTool()` method. This will make the tool available via the MCP.
37 | 
38 | ## 5. Create an Integration Test for the `export_task_list` Tool [done]
39 | ### Dependencies: 8.3, 8.4
40 | ### Description: Write a test that invokes the complete `export_task_list` tool and validates its output against a known `prompts.meta.yaml` file.
41 | ### Details:
42 | Create a test file `src/tools/export_task_list.test.ts`. The test should execute the tool's handler. It should use a test-specific version of `prompts.meta.yaml` to ensure a stable test environment. The test will assert that the returned JSON array correctly reflects the contents of the test YAML file, verifying the entire flow from file reading to data transformation.
43 | 
```

.taskmaster/tasks/task_009.txt
```
1 | # Task ID: 9
2 | # Title: Implement Token Bucket Rate Limiter Utility
3 | # Status: pending
4 | # Dependencies: 1
5 | # Priority: low
6 | # Description: Provide a `TokenBucket` utility for rate limiting, intended for future use with external HTTP integrations.
7 | # Details:
8 | Create a `TokenBucket` class with a constructor that accepts `capacity` and `refillPerSec`. Implement a `take(count)` method that decrements the token count. If not enough tokens are available, the method should asynchronously wait for the required number of tokens to be refilled before resolving. This is a foundational component for future safety controls.
9 | 
10 | # Test Strategy:
11 | Unit test the `TokenBucket`. Verify that calling `take(1)` when the bucket is empty causes a delay approximately equal to `1 / refillPerSec`. Test that taking the full capacity immediately depletes the tokens and that they recover over time as expected.
12 | 
13 | # Subtasks:
14 | ## 1. Create `TokenBucket.ts` with Class Skeleton and Constructor [pending]
15 | ### Dependencies: None
16 | ### Description: Create the file `src/utils/TokenBucket.ts`. Define the `TokenBucket` class with a constructor that accepts `capacity` and `refillPerSec`. Initialize class properties for `capacity`, `refillPerSec`, `tokens`, and `lastRefillTime`.
17 | ### Details:
18 | This subtask establishes the foundational file and class structure. The constructor should initialize `this.tokens` to `this.capacity` and `this.lastRefillTime` to the current time (`Date.now()`). Also, create the corresponding test file `tests/TokenBucket.test.ts` with a placeholder test suite.
19 | 
20 | ## 2. Implement Private `_refill` Method for Token Replenishment [pending]
21 | ### Dependencies: 9.1
22 | ### Description: Implement a private helper method, `_refill()`, inside the `TokenBucket` class. This method will calculate the number of new tokens to add based on the time elapsed since `lastRefillTime` and the `refillPerSec` rate.
23 | ### Details:
24 | The `_refill` method should calculate elapsed time since the last refill, determine the number of tokens to add, and update `this.lastRefillTime` to the current time. It must ensure that the number of tokens does not exceed the `capacity`. This isolates the core state update logic.
25 | 
26 | ## 3. Implement Synchronous Path for `take(count)` Method [pending]
27 | ### Dependencies: 9.2
28 | ### Description: Implement the `take(count)` method. It should first call the `_refill()` method to ensure the token count is up-to-date. Then, it should handle the synchronous case where sufficient tokens are available.
29 | ### Details:
30 | The `take` method will be `async`. After calling `_refill()`, if `this.tokens >= count`, the method should decrement `this.tokens` by `count` and resolve immediately. This covers the 'happy path' where no waiting is necessary.
31 | 
32 | ## 4. Implement Asynchronous Waiting Logic in `take(count)` [pending]
33 | ### Dependencies: 9.3
34 | ### Description: Enhance the `take(count)` method to handle cases where there are insufficient tokens. The method should calculate the necessary delay until enough tokens are available and wait asynchronously before proceeding.
35 | ### Details:
36 | When `this.tokens < count`, calculate the `tokensNeeded` and the `waitTime` in milliseconds. Use `new Promise(resolve => setTimeout(resolve, waitTime))` to pause execution. After the delay, recursively call `this.take(count)` to re-evaluate and consume the tokens.
37 | 
38 | ## 5. Write Comprehensive Unit Tests in `tests/TokenBucket.test.ts` [pending]
39 | ### Dependencies: 9.4
40 | ### Description: Implement unit tests in `tests/TokenBucket.test.ts` to validate the `TokenBucket` functionality, including asynchronous behavior.
41 | ### Details:
42 | Tests should cover: 1. Initial state (full bucket). 2. Immediate depletion of tokens. 3. Correct asynchronous delay when taking from an empty bucket. 4. Gradual refill over time. Use a testing framework like Jest with fake timers to control time during tests and make assertions on wait times.
43 | 
```

.taskmaster/tasks/task_010.txt
```
1 | # Task ID: 10
2 | # Title: Implement Prompt Metadata Validation Script
3 | # Status: done
4 | # Dependencies: None
5 | # Priority: high
6 | # Description: Flesh out the `scripts/validate_metadata.ts` script to parse YAML front matter from all markdown prompt files and validate it against a strict schema.
7 | # Details:
8 | The script must be executed via `npm run validate:metadata`. It should read all `.md` files in the prompts directory, extract the YAML front matter, and ensure required fields (e.g., `id`, `title`, `phase`, `description`) are present and correctly typed. The script should exit with a non-zero code if validation fails, logging clear error messages about which file and field are invalid. This aligns with the 'Prompt Metadata Automation' feature and is a prerequisite for building the catalog.
9 | 
10 | # Test Strategy:
11 | Create a temporary valid prompt file and an invalid one (e.g., missing a required field). Run the script against them. Verify the script passes for the valid file and fails with a descriptive error for the invalid one. Ensure it correctly handles various data types.
12 | 
13 | # Subtasks:
14 | ## 1. Add Dependencies and Configure `validate:metadata` NPM Script [done]
15 | ### Dependencies: None
16 | ### Description: Add `zod`, `gray-matter`, and `glob` as development dependencies to `package.json`. Ensure the `validate:metadata` script in `package.json` is correctly configured to execute `scripts/validate_metadata.ts` using `ts-node`.
17 | ### Details:
18 | This foundational step ensures all required tools are available before writing the core logic. The command should be `npm install zod gray-matter glob --save-dev`. The script should be `"validate:metadata": "ts-node scripts/validate_metadata.ts"`.
19 | 
20 | ## 2. Define Prompt Metadata Schema using Zod [done]
21 | ### Dependencies: 10.1
22 | ### Description: In `scripts/validate_metadata.ts`, define a strict Zod schema for the prompt's YAML front matter. The schema must enforce the presence and correct types for `id` (string), `title` (string), `phase` (number), and `description` (string).
23 | ### Details:
24 | Create a `const promptMetadataSchema = z.object({...})`. This schema will be the single source of truth for metadata validation and should be placed at the top of the script file for clarity.
25 | 
26 | ## 3. Implement File Discovery for Prompt Markdown Files [done]
27 | ### Dependencies: 10.1
28 | ### Description: In `scripts/validate_metadata.ts`, use the `glob` library to implement a function that finds and returns a list of all `.md` file paths within the `prompts/` directory and its subdirectories.
29 | ### Details:
30 | The function should asynchronously find all files matching the pattern `prompts/**/*.md`. This isolates the file system interaction from the parsing and validation logic. The main script function will await the result of this discovery.
31 | 
32 | ## 4. Implement Main Loop to Parse and Validate Front Matter [done]
33 | ### Dependencies: 10.2, 10.3
34 | ### Description: Create the main execution logic in `scripts/validate_metadata.ts`. This logic should iterate through the file paths discovered in subtask 3, read each file's content, use `gray-matter` to parse the YAML front matter, and then validate the resulting object against the Zod schema defined in subtask 2.
35 | ### Details:
36 | This subtask ties together file discovery, parsing, and validation. It will form the core of the script's functionality. Use `fs.readFileSync` to get file content and `matter()` from `gray-matter` to extract the `data` object for validation.
37 | 
38 | ## 5. Implement Error Reporting and Non-Zero Exit Code on Failure [done]
39 | ### Dependencies: 10.4
40 | ### Description: Enhance the validation loop to handle validation failures. When a file's metadata is invalid, log a clear error message to the console specifying the file path and the nature of the validation error. The script must exit with `process.exit(1)` if any validation errors are found.
41 | ### Details:
42 | Use a `try...catch` block around the Zod `safeParse` method. If the parse result is not successful, format the `ZodError` into a user-friendly message. Track a global error flag or a count of errors to determine the final exit code after checking all files.
43 | 
```

.taskmaster/tasks/task_011.txt
```
1 | # Task ID: 11
2 | # Title: Implement Catalog and README Build Script
3 | # Status: done
4 | # Dependencies: 10
5 | # Priority: high
6 | # Description: Develop the `scripts/build_catalog.ts` script to automatically generate `catalog.json` and update the prompt tables in `README.md` based on the metadata from all prompt files.
7 | # Details:
8 | This script, run via `npm run build:catalog`, will consume the validated metadata from all `.md` prompt files. It will then generate a `catalog.json` file containing an array of all prompt metadata objects. Concurrently, it will parse `README.md`, find placeholder tags, and inject updated markdown tables, ensuring the README stays synchronized with the prompt library. This fulfills a core requirement of 'Prompt Metadata Automation'.
9 | 
10 | # Test Strategy:
11 | After creating a few sample prompts, run the script. Check that `catalog.json` is created or updated correctly. Inspect `README.md` to confirm the prompt tables are accurately regenerated. Verify that running the script a second time without changes results in no file modifications.
12 | 
13 | # Subtasks:
14 | ## 1. Create a Utility to Discover All Prompt Markdown Files [done]
15 | ### Dependencies: None
16 | ### Description: Within the new `scripts/build_catalog.ts` file, implement a utility function that finds all prompt markdown files. This function will use a glob pattern to recursively search the `prompts/` directory for all files ending in `.md` and return an array of their full paths.
17 | ### Details:
18 | This is the initial step for gathering the source files. A library like `glob` or `fast-glob` should be added as a dev dependency to handle the file system traversal. The function should be designed to be reusable within the script.
19 | 
20 | ## 2. Implement a Parser to Extract and Validate Prompt Front-Matter [done]
21 | ### Dependencies: 11.1
22 | ### Description: Create a function that accepts a file path, reads the markdown file's content, and parses its YAML front-matter using the `gray-matter` library. The extracted metadata object should then be validated against a predefined schema to ensure it contains all required fields (e.g., id, title, description).
23 | ### Details:
24 | This function is critical for consuming the prompt files discovered in the previous subtask. A validation library like `zod` should be used to define and enforce the metadata structure. The function should throw a clear error or log a warning if a file is missing front-matter or if the metadata is invalid.
25 | 
26 | ## 3. Develop Main Script Logic to Aggregate Metadata from All Prompts [done]
27 | ### Dependencies: 11.1, 11.2
28 | ### Description: Implement the main execution logic in `scripts/build_catalog.ts`. This logic will use the discovery utility (11.1) to get all prompt file paths, then iterate through them, calling the parser (11.2) on each. All successfully parsed and validated metadata objects should be collected into a single in-memory array.
29 | ### Details:
30 | This subtask orchestrates the data collection process. The main function should handle errors from the parsing step by logging the problematic file and continuing, ensuring that one bad file doesn't halt the entire process. The final result is a complete, in-memory representation of the prompt catalog.
31 | 
32 | ## 4. Implement `catalog.json` Generation from Aggregated Metadata [done]
33 | ### Dependencies: 11.3
34 | ### Description: Create a function that takes the aggregated array of prompt metadata (from 11.3), sorts it by prompt ID, serializes it into a human-readable JSON string, and writes it to the `catalog.json` file in the project root.
35 | ### Details:
36 | This function is responsible for the first major output of the script. It should use `JSON.stringify` with an indentation setting for pretty-printing. The file write operation should overwrite the existing `catalog.json` to ensure it's always up-to-date.
37 | 
38 | ## 5. Implement README.md Update with Auto-Generated Prompt Table [done]
39 | ### Dependencies: 11.3
40 | ### Description: Develop a function that generates a Markdown table from the aggregated prompt metadata. This function must then read `README.md`, find the `<!-- PROMPT_TABLE_START -->` and `<!-- PROMPT_TABLE_END -->` comment tags, and replace all content between them with the newly generated table.
41 | ### Details:
42 | This function ensures the project's documentation stays synchronized with the prompt library. The table should include columns for ID, Title, and Description. The file update logic must be precise, likely using a regular expression, to avoid modifying any other part of the `README.md` file.
43 | 
```

.taskmaster/tasks/task_012.txt
```
1 | # Task ID: 12
2 | # Title: Create DocFetch Preflight Guardrail Prompt
3 | # Status: done
4 | # Dependencies: 11
5 | # Priority: high
6 | # Description: Author the primary slash-command prompt that enforces the DocFetch preflight check before planning or coding can proceed.
7 | # Details:
8 | Create a markdown prompt file (e.g., `prompts/preflight/docfetch-check.md`) with appropriate YAML front matter. The prompt's content should instruct the user on how to run the DocFetch tooling, validate the status of the `DocFetchReport`, and provide clear, actionable remediation steps if documentation sources are missing or stale. This directly implements the 'DocFetch Preflight Guardrails' feature.
9 | 
10 | # Test Strategy:
11 | Execute the prompt via the Codex CLI. Verify that its output clearly states the success criteria (an OK DocFetchReport) and provides a clear remediation path for failure cases. Ensure the prompt's metadata is correctly processed by the validation and build scripts.
12 | 
13 | # Subtasks:
14 | ## 1. Create `docfetch-check.md` and Define YAML Front Matter [done]
15 | ### Dependencies: None
16 | ### Description: Create the markdown file for the DocFetch preflight prompt and add the necessary YAML front matter to define its metadata, following the structure suggested in the task description.
17 | ### Details:
18 | Create the file at `prompts/preflight/docfetch-check.md`. Based on the parent task and similar prompts, the YAML front matter should include `id`, `title`, `description`, and `phase: preflight`. This establishes the prompt's identity within the system and associates it with the preflight check phase of the workflow.
19 | 
20 | ## 2. Draft Introduction Explaining the DocFetch Check's Purpose [done]
21 | ### Dependencies: 12.1
22 | ### Description: Write the introductory section of the prompt that explains to the user why the DocFetch preflight check is a necessary guardrail before proceeding with planning or coding.
23 | ### Details:
24 | In `prompts/preflight/docfetch-check.md`, add a section below the front matter. This content should clearly explain that planning and coding require up-to-date project context from documentation, and that the DocFetch tool is designed to validate this context automatically.
25 | 
26 | ## 3. Add Instructions for Executing the DocFetch Tool [done]
27 | ### Dependencies: 12.2
28 | ### Description: Add a section to the prompt detailing the specific command(s) required to run the DocFetch tool and generate the `DocFetchReport`.
29 | ### Details:
30 | In `prompts/preflight/docfetch-check.md`, create a clear, user-friendly section titled 'How to Run the Check'. Provide the exact command-line instruction to trigger the documentation fetching and analysis process. Use markdown code blocks for the command to make it easy to copy and paste.
31 | 
32 | ## 4. Document How to Interpret the `DocFetchReport` [done]
33 | ### Dependencies: 12.3
34 | ### Description: Add content that guides the user on how to find and interpret the `DocFetchReport` to determine if the check passed or failed.
35 | ### Details:
36 | In `prompts/preflight/docfetch-check.md`, add a section explaining where the `DocFetchReport` is located (e.g., `.codex/reports/docfetch-report.json`). Describe what a successful report looks like (e.g., `status: 'OK'`) versus what a failure looks like (e.g., `status: 'STALE'`, `missingSources: [...]`). This section is crucial for user self-service.
37 | 
38 | ## 5. Author Remediation Steps for Failed DocFetch Checks [done]
39 | ### Dependencies: 12.4
40 | ### Description: Write the final section of the prompt, providing clear, actionable steps to resolve a failed DocFetch check based on the report's findings.
41 | ### Details:
42 | In `prompts/preflight/docfetch-check.md`, create a 'Remediation Steps' or 'What to Do If It Fails' section. This should provide specific instructions for different failure scenarios, such as how to add missing documentation paths to the project's configuration file or how to force-refresh stale sources before re-running the DocFetch tool.
43 | 
```

.taskmaster/tasks/task_013.txt
```
1 | # Task ID: 13
2 | # Title: Author Planning Phase Prompts
3 | # Status: pending
4 | # Dependencies: 11
5 | # Priority: medium
6 | # Description: Create at least one slash-command prompt for the 'planning' phase of the development lifecycle.
7 | # Details:
8 | As part of the 'Lifecycle Prompt Library', author a markdown prompt with YAML front matter indicating `phase: planning`. The prompt should guide a user through a planning activity, such as breaking down a feature or defining acceptance criteria, consistent with the `WORKFLOW.md` document.
9 | 
10 | # Test Strategy:
11 | Run the prompt and check that its output is directive, concise, and aligns with the planning stage. Verify its metadata is correctly added to `catalog.json` and the `README.md` tables after running the build scripts.
12 | 
13 | # Subtasks:
14 | ## 1. Research Planning Phase Requirements in WORKFLOW.md [pending]
15 | ### Dependencies: None
16 | ### Description: Analyze the 'Planning' section of WORKFLOW.md to understand the key activities, such as feature breakdown and defining acceptance criteria. This research will define the scope and purpose of the new planning prompt.
17 | ### Details:
18 | Read the WORKFLOW.md file to identify the specific goals and outputs expected during the planning phase of the development lifecycle. This will ensure the prompt aligns with the established process.
19 | 
20 | ## 2. Create Initial Draft of `feature-breakdown.md` Prompt [pending]
21 | ### Dependencies: 13.1
22 | ### Description: Create a new markdown file at `src/prompts/commands/planning/feature-breakdown.md`. Draft the initial version of the prompt's instructional text to guide a user through breaking down a feature into actionable tasks.
23 | ### Details:
24 | Based on the research from the previous subtask, write the main body of the prompt. The text should instruct the AI on how to analyze a feature request and output a structured plan.
25 | 
26 | ## 3. Add YAML Front Matter to `feature-breakdown.md` [pending]
27 | ### Dependencies: 13.2
28 | ### Description: Add the required YAML front matter to the `src/prompts/commands/planning/feature-breakdown.md` file. This includes a `title`, `description`, and `phase: planning`.
29 | ### Details:
30 | The front matter is critical for the prompt to be recognized by the system. The title should be actionable, like 'Feature Breakdown', and the description should clearly state its purpose. The `phase` must be set to `planning`.
31 | 
32 | ## 4. Refine and Test the Feature Breakdown Prompt [pending]
33 | ### Dependencies: 13.3
34 | ### Description: Iteratively test the `feature-breakdown.md` prompt by running it with a sample feature description. Refine the prompt's text to ensure the output is structured, clear, and consistently provides actionable subtasks and acceptance criteria.
35 | ### Details:
36 | This step involves practical testing of the prompt's effectiveness. The goal is to fine-tune the instructions until the AI's output reliably meets the standards defined in WORKFLOW.md for the planning phase.
37 | 
38 | ## 5. Run Build Scripts and Verify Prompt Integration [pending]
39 | ### Dependencies: 13.4
40 | ### Description: Execute the project's build scripts to update the prompt catalog and documentation. Verify that the new 'Feature Breakdown' prompt is correctly added to `catalog.json` and the relevant tables in `README.md`.
41 | ### Details:
42 | The final step is to ensure the new prompt is properly integrated into the project's ecosystem. This involves running any scripts responsible for cataloging and documenting available prompts.
43 | 
```

.taskmaster/tasks/task_014.txt
```
1 | # Task ID: 14
2 | # Title: Author Scaffolding Phase Prompts
3 | # Status: pending
4 | # Dependencies: 11
5 | # Priority: medium
6 | # Description: Create at least one slash-command prompt for the 'scaffolding' phase of the development lifecycle.
7 | # Details:
8 | As part of the 'Lifecycle Prompt Library', author a markdown prompt with YAML front matter indicating `phase: scaffolding`. The prompt should assist a developer in generating boilerplate code, setting up file structures, or creating initial components based on a plan.
9 | 
10 | # Test Strategy:
11 | Run the prompt and check that its output helps accelerate initial code creation. Verify its metadata is correctly added to `catalog.json` and the `README.md` tables after running the build scripts.
12 | 
13 | # Subtasks:
14 | ## 1. Define Scope for '/scaffold-component' Prompt [pending]
15 | ### Dependencies: None
16 | ### Description: Define the specific scope and target for the new scaffolding prompt. Decide on the component type, language, and framework to be scaffolded, as recommended by the complexity report. This initial definition will guide the subsequent implementation.
17 | ### Details:
18 | Based on the complexity report's recommendation, the target will be a React functional component using TypeScript. Document the expected inputs (e.g., component name, list of props) and the desired output structure (e.g., a single `.tsx` file with boilerplate code, prop types, and basic JSX). This definition serves as the design document for the prompt.
19 | 
20 | ## 2. Create 'scaffold-component.md' with YAML Frontmatter [pending]
21 | ### Dependencies: 14.1
22 | ### Description: Create the new prompt file at 'prompts/library/scaffolding/scaffold-component.md' and add the YAML frontmatter based on the scope defined in the previous subtask.
23 | ### Details:
24 | Create the file `prompts/library/scaffolding/scaffold-component.md`. The YAML frontmatter should include `title: Scaffold Component`, `description`, `author`, `tags: ["scaffolding", "react", "typescript", "component"]`, and `phase: scaffolding`. The description should clearly state that it generates a React functional component with TypeScript.
25 | 
26 | ## 3. Write the Main Prompt Body for '/scaffold-component' [pending]
27 | ### Dependencies: 14.2
28 | ### Description: Write the main body of the prompt in 'scaffold-component.md'. This section should contain the core instructions for the AI on how to generate the component.
29 | ### Details:
30 | In the markdown file, add 'System' and 'Instructions' sections. The instructions should guide the AI to: 1. Accept a component name and a list of props as input. 2. Generate a TypeScript interface for the props. 3. Create a React functional component using the provided name and props interface. 4. Include basic JSX structure. 5. Return the output as a single, formatted code block.
31 | 
32 | ## 4. Add a Detailed Example to 'scaffold-component.md' [pending]
33 | ### Dependencies: 14.3
34 | ### Description: Add a comprehensive 'Example' section to the 'scaffold-component.md' prompt file to demonstrate its usage and expected output.
35 | ### Details:
36 | Append an '## Example' section to the markdown file. The example should show a sample user request (e.g., `/scaffold-component name:UserProfile props:name:string,age:number`) and the corresponding complete AI response, including the generated `.tsx` code for the `UserProfile` component.
37 | 
38 | ## 5. Test and Verify '/scaffold-component' Prompt Integration [pending]
39 | ### Dependencies: 14.4
40 | ### Description: Test the completed prompt by running it in a development environment. Verify the generated code is correct and that the prompt is correctly integrated into the project's documentation.
41 | ### Details:
42 | Execute the `/scaffold-component` prompt with the example inputs. Check if the output is a valid React/TypeScript component. After confirming functionality, run the project's build scripts. Verify that the new prompt is added to the `catalog.json` file and appears in the appropriate table in the `README.md`.
43 | 
```

.taskmaster/tasks/task_015.txt
```
1 | # Task ID: 15
2 | # Title: Author Testing Phase Prompts
3 | # Status: pending
4 | # Dependencies: 11
5 | # Priority: medium
6 | # Description: Create at least one slash-command prompt for the 'testing' phase of the development lifecycle.
7 | # Details:
8 | As part of the 'Lifecycle Prompt Library', author a markdown prompt with YAML front matter indicating `phase: testing`. The prompt should guide a developer in writing unit tests, integration tests, or generating test case tables.
9 | 
10 | # Test Strategy:
11 | Run the prompt and confirm its output provides useful guidance for creating tests. Verify its metadata is correctly added to `catalog.json` and the `README.md` tables after running the build scripts.
12 | 
13 | # Subtasks:
14 | ## 1. Create initial prompt file for test case generation [pending]
15 | ### Dependencies: None
16 | ### Description: Following the pattern observed in `prompts/lifecycle/`, create the initial markdown file for the test case generation prompt.
17 | ### Details:
18 | Create a new file at `prompts/lifecycle/testing-generate-cases.md`. Add the standard YAML front matter including `name: /test/generate-cases`, a suitable `description`, and `phase: testing`. The main body of the prompt can be a placeholder for now.
19 | 
20 | ## 2. Develop prompt content for generating test case tables in 'testing-generate-cases.md' [pending]
21 | ### Dependencies: 15.1
22 | ### Description: Flesh out the markdown content for the `testing-generate-cases.md` prompt to guide an AI in creating structured test case tables.
23 | ### Details:
24 | In the file `prompts/lifecycle/testing-generate-cases.md`, write a detailed prompt that instructs the AI to analyze user stories, requirements, or code snippets and produce a markdown table of test cases. The table should include columns for Test ID, Description, Steps, Expected Result, and Type (e.g., Happy Path, Edge Case, Error).
25 | 
26 | ## 3. Create and author the 'write-unit-tests' prompt [pending]
27 | ### Dependencies: None
28 | ### Description: Create a new, self-contained prompt file dedicated to generating unit tests for a specific function or module.
29 | ### Details:
30 | Create the file `prompts/lifecycle/testing-unit-tests.md`. Add YAML front matter with `name: /test/unit-tests`, a description, and `phase: testing`. The prompt content should guide the AI to write unit tests for a provided code snippet, including instructions on mocking dependencies and asserting expected outcomes using a common testing framework like Jest or Pytest.
31 | 
32 | ## 4. Create and author the 'write-integration-tests' prompt [pending]
33 | ### Dependencies: None
34 | ### Description: Create a new, self-contained prompt file for generating integration tests between multiple components.
35 | ### Details:
36 | Create the file `prompts/lifecycle/testing-integration-tests.md`. Add YAML front matter with `name: /test/integration-tests`, a description, and `phase: testing`. The prompt content should instruct the AI to write tests that verify the interaction, data flow, and contract between two or more specified components or services.
37 | 
38 | ## 5. Run build scripts and verify all new testing prompts in catalog [pending]
39 | ### Dependencies: 15.2, 15.3, 15.4
40 | ### Description: After the three new testing prompts are authored, run the build process to update the prompt catalog and documentation, and verify their inclusion.
41 | ### Details:
42 | Execute the `npm run build:prompts` script (or equivalent build script). Check the generated `prompts/catalog.json` file to ensure the three new prompts (`/test/generate-cases`, `/test/unit-tests`, `/test/integration-tests`) are present with correct metadata. Also, verify they are listed in the appropriate table in the main `README.md`.
43 | 
```

.taskmaster/tasks/task_016.txt
```
1 | # Task ID: 16
2 | # Title: Author Release Phase Prompts
3 | # Status: pending
4 | # Dependencies: 11
5 | # Priority: medium
6 | # Description: Create at least one slash-command prompt for the 'release' phase of the development lifecycle.
7 | # Details:
8 | As part of the 'Lifecycle Prompt Library', author a markdown prompt with YAML front matter indicating `phase: release`. The prompt should assist with release-gating activities like generating release notes, creating a changelog, or verifying final checks.
9 | 
10 | # Test Strategy:
11 | Run the prompt and check that its output supports pre-release activities. Verify its metadata is correctly added to `catalog.json` and the `README.md` tables after running the build scripts.
12 | 
13 | # Subtasks:
14 | ## 1. Create /generate-release-notes prompt file with initial YAML front matter [pending]
15 | ### Dependencies: None
16 | ### Description: Based on the analysis of existing prompts, create a new markdown file at `prompts/library/release/generate-release-notes.md`. Populate this file with the initial YAML front matter, including `title`, `description`, and `phase: release`.
17 | ### Details:
18 | The file should be created in the `prompts/library/release/` directory. The YAML front matter should define the prompt's metadata. For example:
19 | ---
20 | title: Generate Release Notes
21 | description: Creates a draft of release notes or a changelog from git history and guides through pre-release checks.
22 | phase: release
23 | ---
24 | 
25 | ## 2. Draft the initial prompt logic to gather raw data for release notes [pending]
26 | ### Dependencies: 16.1
27 | ### Description: Following the guidance from the task complexity report, write the first part of the prompt. This section should instruct the AI on how to gather the raw data needed for release notes, such as by requesting the user to provide `git log` output between two release tags.
28 | ### Details:
29 | Edit `prompts/library/release/generate-release-notes.md`. The prompt should ask the user to provide a list of commits or a git log. It should set the context for the AI to act as a release manager.
30 | 
31 | ## 3. Refine the prompt to format raw data into structured release notes [pending]
32 | ### Dependencies: 16.2
33 | ### Description: Enhance the prompt to process the raw input from the previous step. It should include instructions for categorizing commits (e.g., 'Features', 'Bug Fixes', 'Documentation') and formatting the output into a clean, markdown-formatted changelog.
34 | ### Details:
35 | Update `prompts/library/release/generate-release-notes.md`. Add instructions for the AI to parse the provided commit messages, group them by type (e.g., using conventional commit prefixes like 'feat:', 'fix:'), and generate structured markdown output.
36 | 
37 | ## 4. Incorporate a pre-release checklist into the prompt [pending]
38 | ### Dependencies: 16.3
39 | ### Description: As recommended by the complexity report's expansion plan, add a final section to the prompt. This section should guide the user through a series of pre-release verification checks to ensure release readiness.
40 | ### Details:
41 | Append a new section to `prompts/library/release/generate-release-notes.md`. This part of the prompt should generate a checklist for the user, including items like: 'Have version numbers been bumped?', 'Have all automated tests passed?', 'Is the documentation updated?'.
42 | 
43 | ## 5. Build and verify the /generate-release-notes prompt integration [pending]
44 | ### Dependencies: 16.4
45 | ### Description: Execute the project's build scripts to update the prompt catalog and documentation. Verify that the new `/generate-release-notes` prompt is correctly integrated into the system.
46 | ### Details:
47 | Run the `npm run build:prompts` command (or equivalent build script). After the script completes, inspect the generated `catalog.json` file to ensure it contains an entry for the new prompt. Also, check the `README.md` file to confirm the prompt appears in the 'Release' phase table.
48 | 
```

.taskmaster/tasks/task_017.txt
```
1 | # Task ID: 17
2 | # Title: Author Post-Release Hardening Prompts
3 | # Status: pending
4 | # Dependencies: 11
5 | # Priority: medium
6 | # Description: Create at least one slash-command prompt for the 'post-release' phase of the development lifecycle.
7 | # Details:
8 | As part of the 'Lifecycle Prompt Library', author a markdown prompt with YAML front matter indicating `phase: post-release`. The prompt could guide a user in creating a post-mortem document, identifying areas for technical debt repayment, or hardening a feature based on initial feedback.
9 | 
10 | # Test Strategy:
11 | Run the prompt and confirm its output is relevant to post-release activities. Verify its metadata is correctly added to `catalog.json` and the `README.md` tables after running the build scripts.
12 | 
13 | # Subtasks:
14 | ## 1. Define Scope and Goal for Post-Mortem Prompt [pending]
15 | ### Dependencies: None
16 | ### Description: Brainstorm and select a specific post-release activity for the new prompt. Settle on creating a 'post-mortem analysis' prompt to guide users in documenting and learning from a release cycle.
17 | ### Details:
18 | Based on the parent task, decide on a concrete topic for the post-release prompt. The chosen topic is 'post-mortem analysis'. Define the prompt's primary goal: to help a user generate a structured post-mortem document by asking targeted questions about the release process, what went well, what didn't, and action items for improvement.
19 | 
20 | ## 2. Create 'conduct-post-mortem.md' and YAML Front Matter [pending]
21 | ### Dependencies: 17.1
22 | ### Description: Create the new markdown file for the post-mortem prompt in the correct directory and add the required YAML front matter.
23 | ### Details:
24 | Create a new file at `prompts/lifecycle/post-release/conduct-post-mortem.md`. In this file, add the YAML front matter with the following keys: `name` set to `/conduct-post-mortem`, `description` summarizing its purpose, and `phase` set to `post-release`. This establishes the prompt's metadata for the build system.
25 | 
26 | ## 3. Author System Prompt and Instructions for Post-Mortem Analysis [pending]
27 | ### Dependencies: 17.2
28 | ### Description: Write the system prompt and detailed instructions within 'conduct-post-mortem.md' that define the AI's role and the structure of the post-mortem.
29 | ### Details:
30 | In `prompts/lifecycle/post-release/conduct-post-mortem.md`, write the `# System Prompt` section. Define the AI's persona as an experienced project lead facilitating a blameless post-mortem. Under an `# Instructions` section, outline the steps the AI should take, such as asking for a summary of the release, what went well, what could be improved, and key learnings. The structure should encourage a comprehensive and constructive analysis.
31 | 
32 | ## 4. Author User Prompt and Finalize 'conduct-post-mortem.md' Content [pending]
33 | ### Dependencies: 17.3
34 | ### Description: Complete the prompt by adding the user prompt section and refining the overall content for clarity and effectiveness.
35 | ### Details:
36 | In `prompts/lifecycle/post-release/conduct-post-mortem.md`, add the `# User Prompt` section. This section should include placeholders like `{{user_input}}` for the user to provide context about the project or release they want to analyze. Review and refine the entire prompt file for grammar, clarity, and flow.
37 | 
38 | ## 5. Verify Prompt Integration via Build Scripts [pending]
39 | ### Dependencies: 17.4
40 | ### Description: Run the project's build scripts and verify that the new '/conduct-post-mortem' prompt is correctly added to 'catalog.json' and the 'README.md' documentation.
41 | ### Details:
42 | Execute the build script responsible for updating the prompt catalog (e.g., `npm run build:prompts`). After the script completes, inspect the `catalog.json` file to ensure an entry for `/conduct-post-mortem` exists with the correct metadata. Also, check the `README.md` file to confirm the prompt is listed in the appropriate table for the 'post-release' phase.
43 | 
```

.taskmaster/tasks/task_018.txt
```
1 | # Task ID: 18
2 | # Title: Integrate and Test Full Metadata Workflow
3 | # Status: pending
4 | # Dependencies: 12, 13, 14, 15, 16, 17
5 | # Priority: high
6 | # Description: Perform an end-to-end test of the metadata automation by editing a prompt, running validation, and rebuilding the catalog and README.
7 | # Details:
8 | This task verifies that the core automation loop is robust. Make a change to a prompt's YAML front matter (e.g., edit its title). Run `npm run validate:metadata` and confirm it passes. Then run `npm run build:catalog`. Verify that `catalog.json` and the `README.md` tables reflect the change. This satisfies the acceptance criteria for 'Prompt Metadata Automation'.
9 | 
10 | # Test Strategy:
11 | Follow the steps in the details. Introduce an invalid change to a prompt's metadata and confirm `npm run validate:metadata` fails as expected. Fix the error and confirm both scripts succeed and update the artifacts correctly.
12 | 
13 | # Subtasks:
14 | ## 1. Create Test Branch for Metadata Workflow Verification [pending]
15 | ### Dependencies: None
16 | ### Description: Set up a dedicated git branch to isolate the end-to-end testing of the metadata workflow, as recommended by the task expansion plan.
17 | ### Details:
18 | Create a new git branch named `test/metadata-workflow` from the current main branch. This ensures that the main branch remains clean during the test cycle and provides an isolated environment for making and reverting changes.
19 | 
20 | ## 2. Execute 'Happy Path' Test: Modify Metadata and Run Build [pending]
21 | ### Dependencies: 18.1
22 | ### Description: Perform a 'happy path' test by modifying a prompt's metadata, running validation and build scripts, and committing the successful changes.
23 | ### Details:
24 | On the `test/metadata-workflow` branch, edit the `title` in the YAML front matter of `prompts/1-analyze-issue.md`. Run `npm run validate:metadata` and confirm it passes. Then, run `npm run build:catalog` to update `catalog.json` and `README.md`. Commit all modified files to the branch.
25 | 
26 | ## 3. Verify Artifacts After 'Happy Path' Build [pending]
27 | ### Dependencies: 18.2
28 | ### Description: Inspect `catalog.json` and `README.md` to confirm that the changes from the 'happy path' test were correctly applied.
29 | ### Details:
30 | After the successful build in the previous subtask, manually review `catalog.json` to ensure the `title` for prompt ID 1 has been updated. Also, check the prompt table within `README.md` to verify the new title is correctly reflected there.
31 | 
32 | ## 4. Execute 'Failure Path' Test: Introduce Invalid Metadata [pending]
33 | ### Dependencies: 18.3
34 | ### Description: Test the validation logic by intentionally introducing an invalid change to a prompt's metadata and confirming that the validation script fails as expected.
35 | ### Details:
36 | On the `test/metadata-workflow` branch, edit `prompts/1-analyze-issue.md` again. Remove the `version` field from the YAML front matter. Run `npm run validate:metadata` and confirm that the script exits with a non-zero status code and logs a Zod validation error. Document the specific error message for verification. Do not commit this invalid change.
37 | 
38 | ## 5. Revert Invalid Change, Re-run Build, and Finalize Test [pending]
39 | ### Dependencies: 18.4
40 | ### Description: Revert the invalid metadata change, re-run the build process to ensure the system returns to a valid state, and finalize the end-to-end test.
41 | ### Details:
42 | Revert the change made to `prompts/1-analyze-issue.md` in the previous step by restoring the `version` field. Re-run `npm run validate:metadata` to confirm it passes. This concludes the E2E test, leaving the branch in a clean state with the successful 'happy path' changes.
43 | 
```

.taskmaster/tasks/task_019.txt
```
1 | # Task ID: 19
2 | # Title: Document MCP Evolution Readiness in README
3 | # Status: pending
4 | # Dependencies: 18
5 | # Priority: low
6 | # Description: Update the `README.md` to include the 'Future enhancements' section detailing the MCP evolution path.
7 | # Details:
8 | Fulfill the 'MCP Evolution Readiness' requirement by adding a new section to the `README.md`. This section should describe the future-state architecture where the prompt pack is exposed as an MCP server with typed inputs and DocFetch event signals. Crucially, it must also specify the manual fallback paths (using slash commands) that remain functional if MCP is not available.
9 | 
10 | # Test Strategy:
11 | Review the `README.md` file after modification. Confirm the new 'Future enhancements' section exists and contains the required architectural details and a clear statement about the manual fallback workflow, as per the PRD's acceptance criteria.
12 | 
13 | # Subtasks:
14 | ## 1. Add 'Future Enhancements' Section to README.md [pending]
15 | ### Dependencies: None
16 | ### Description: Edit the `README.md` file to add a new level-two heading titled '## Future Enhancements'. This section will serve as the container for the MCP evolution documentation.
17 | ### Details:
18 | Locate the appropriate position in `README.md`, likely after the 'Usage' or 'Prompt Catalog' section, and insert the new markdown heading `## Future Enhancements` to create the designated area for the new content.
19 | 
20 | ## 2. Draft the Core MCP Server Vision [pending]
21 | ### Dependencies: 19.1
22 | ### Description: Under the new 'Future Enhancements' heading, write the primary description of the future-state architecture. This text should explain that the prompt pack will evolve to be exposed as a standalone MCP (Meta-prompt Communication Protocol) server.
23 | ### Details:
24 | Describe the high-level goal: transitioning from a static collection of prompts to a dynamic service. Mention that this aligns with a more robust, service-oriented architecture for interacting with prompts.
25 | 
26 | ## 3. Detail Typed Inputs and DocFetch Event Signals [pending]
27 | ### Dependencies: 19.2
28 | ### Description: Expand on the MCP server vision by detailing its key technical features. Specifically, describe how the server will utilize typed inputs for prompts and emit DocFetch event signals.
29 | ### Details:
30 | Explain that typed inputs will provide a structured and validated way to invoke prompts, replacing free-form text. Describe how DocFetch event signals will allow the server to communicate its state and requirements regarding documentation freshness to other development tools.
31 | 
32 | ## 4. Document the Manual Slash Command Fallback Path [pending]
33 | ### Dependencies: 19.3
34 | ### Description: Add a paragraph to the 'Future Enhancements' section that explicitly states the manual fallback mechanism. This must clarify that the current slash command interface will remain functional.
35 | ### Details:
36 | This is a critical requirement. The text must reassure users that even if the MCP server is not available or integrated, the prompts can still be used via the existing, simpler slash command workflow. This ensures backward compatibility and usability in diverse environments.
37 | 
38 | ## 5. Review and Finalize MCP Evolution Section [pending]
39 | ### Dependencies: 19.4
40 | ### Description: Perform a comprehensive review of the entire 'Future Enhancements' section. Check for clarity, consistency in tone with the rest of the `README.md`, and ensure all requirements from the parent task are fully met.
41 | ### Details:
42 | Read through the newly added section from the perspective of a new developer. Ensure the evolution path is easy to understand, the technical terms are used correctly, and the fallback mechanism is clearly highlighted. Correct any typos or grammatical errors.
43 | 
```

.taskmaster/tasks/task_020.txt
```
1 | # Task ID: 20
2 | # Title: Align export_task_list with Task Master backlog
3 | # Status: pending
4 | # Dependencies: 8
5 | # Priority: high
6 | # Description: Update the workflow MCP tool so it reads Task Master AI's tasks.json output, preserving dependencies, statuses, and subtask hierarchy for external agents.
7 | # Details:
8 | Refactor `workflow/export_task_list` to parse `.taskmaster/tasks/tasks.json` using the existing Zod infrastructure. The tool should flatten subtasks into parent/child arrays, propagate Task Master status values, and include metadata tying each result back to the originating task ID. Update integration tests to cover Task Master sourced data and document the new behaviour in the MCP integration brief.
9 | 
10 | # Test Strategy:
11 | Add unit coverage for the new parser and extend `test/integration/tools.test.ts` to assert Task Master sourced results. Run `npm run test:tools` and `npm run test:state` to confirm no regressions.
12 | 
13 | # Subtasks:
14 | ## 1. Implement Task Master tasks parser [pending]
15 | ### Dependencies: None
16 | ### Description: Create a loader that reads `.taskmaster/tasks/tasks.json`, validates structure with Zod, and returns normalized tasks including subtasks and dependencies.
17 | ### Details:
18 | Prefer a pure function that accepts a JSON object so tests can inject fixtures. Match Task Master status strings exactly (e.g., pending, in-progress, done).
19 | 
20 | ## 2. Wire parser into workflow/export_task_list [pending]
21 | ### Dependencies: 20.1
22 | ### Description: Replace the prompts metadata source with the new Task Master parser, ensuring structured results include parent-child relationships and status propagation.
23 | ### Details:
24 | Return payload should include `source: 'task-master'` and maintain the schema expected by existing clients (id, title, dependsOn, status).
25 | 
26 | ## 3. Document behaviour and update automation [pending]
27 | ### Dependencies: 20.2
28 | ### Description: Refresh MCP documentation (integration brief, README) and ensure `workflow/refresh_metadata` guidance covers Task Master sourced tasks.
29 | ### Details:
30 | Note any manual fallback commands and confirm DocFetchReport call-outs where applicable.
31 | 
```

.taskmaster/tasks/task_021.txt
```
1 | # Task ID: 21
2 | # Title: Provide CLI surface for prompts workflow
3 | # Status: done
4 | # Dependencies: 8, 20
5 | # Priority: medium
6 | # Description: Create a Node.js CLI entry point that mirrors the MCP server capabilities (list prompts, refresh metadata, export task list, advance state) so users can operate without Task Master or an MCP client.
7 | # Details:
8 | Implement a `bin/prompts.js` (or TypeScript equivalent) that wraps metadata validation, catalog rebuilds, prompt listing, and workflow exports. Ensure commands can backfill tasks from prompt metadata when Task Master is unavailable. Document usage in the integration brief and README, and wire npm scripts so the CLI is easily invoked (e.g., `npm run prompts -- list`).
9 | 
10 | # Test Strategy:
11 | Add unit tests for command handlers and run through an integration smoke test exercising list/refresh/export flows. Reuse existing test suites where possible.
12 | 
13 | # Subtasks:
14 | ## 1. Scaffold CLI command surface [done]
15 | ### Dependencies: None
16 | ### Description: Introduce a CLI scaffold (e.g., Commander or native argument parsing) with commands for list, refresh, and export.
17 | ### Details:
18 | Ensure stdout emits human-readable output while `--json` preserves structured payloads.
19 | 
20 | ## 2. Wire workflow commands to existing scripts [done]
21 | ### Dependencies: 21.1
22 | ### Description: Hook CLI commands into metadata validation, catalog rebuild, and export_task_list backfill logic.
23 | ### Details:
24 | Reuse the same utilities that power MCP tools to avoid drift.
25 | 
26 | ## 3. Document CLI usage and fallback flows [done]
27 | ### Dependencies: 21.2
28 | ### Description: Update the integration brief and README to show CLI-based workflows, including Task Master independent flows.
29 | ### Details:
30 | Include examples for backfilling tasks and refreshing metadata without MCP clients.
31 | 
```

.taskmaster/tasks/task_022.txt
```
1 | # Task ID: 22
2 | # Title: Document CLI Distribution and Usage Lifecycle
3 | # Status: in-progress
4 | # Dependencies: 21
5 | # Priority: medium
6 | # Description: Create comprehensive documentation in the README.md for publishing the Node.js CLI to npm and for end-user installation and usage, based on the CLI created in Task 21.
7 | # Details:
8 | A new section, titled 'CLI Distribution and Usage', should be added to the main `README.md`. This section must provide clear guidance for developers on the entire lifecycle of the CLI tool.
9 | 
10 | 1.  **Prepare for Publishing:**
11 |     *   Confirm the `bin` field in `package.json` correctly maps a command name (e.g., `prompts-cli`) to the compiled JavaScript entry point (e.g., `dist/bin/prompts.js`).
12 |     *   Ensure the main CLI source file (likely `src/bin/prompts.ts` or similar from Task 21) includes a shebang at the very top: `#!/usr/bin/env node`.
13 |     *   Add or verify the `files` array in `package.json` to include `"dist"`, `"README.md"`, and other necessary assets, ensuring no source or test files are published.
14 | 
15 | 2.  **Local Development Workflow:**
16 |     *   Document the `npm link` process for testing the CLI globally without publishing. The steps are: `npm run build` (to compile TypeScript), followed by `npm link`.
17 |     *   Provide an example of how to test the linked command (e.g., `prompts-cli list`).
18 |     *   Include instructions for `npm unlink` to remove the local symlink.
19 | 
20 | 3.  **Publishing to npm:**
21 |     *   Outline the standard procedure: `npm login`, version bumping with `npm version <patch|minor|major>`, and publishing with `npm publish`.
22 |     *   Recommend adding a `prepublishOnly` script to `package.json` that runs the build and test scripts (`npm run test && npm run build`) to prevent accidental publishing of broken code.
23 | 
24 | 4.  **End-User Installation and Usage:**
25 |     *   Provide the command for global installation: `npm install -g <package-name>`.
26 |     *   Show a basic usage example, referencing the commands implemented in Task 21, such as `prompts-cli list` and `prompts-cli refresh`.
27 | 
28 | # Test Strategy:
29 | 1. Review the `README.md` file to confirm the new 'CLI Distribution and Usage' section is present and covers all points from the implementation details.
30 | 2. Manually execute the documented local development workflow: run `npm run build`, then `npm link`. Open a new terminal session and execute one of the CLI commands (e.g., `prompts-cli list`). Confirm it works as expected. Run `npm unlink` and verify the command is no longer available.
31 | 3. Inspect `package.json` to ensure the `bin`, `files`, and recommended `prepublishOnly` script are correctly configured.
32 | 4. Check the primary CLI source file (e.g., `src/bin/prompts.ts`) to verify the `#!/usr/bin/env node` shebang is present.
33 | 
34 | # Subtasks:
35 | ## 1. Capture local CLI build smoke test [pending]
36 | ### Dependencies: None
37 | ### Description: Write the guidance for building the CLI (`npm run build` / `node dist/cli/main.js`) and verifying command output locally before any linking. Definition of done: instructions mention rebuilding after changes and checking the command via Node directly.
38 | ### Details:
39 | 
40 | 
41 | ## 2. Document npm link workflow for local testing [pending]
42 | ### Dependencies: None
43 | ### Description: Detail the two-step `npm link` process (global link from CLI project, then link into a sample consumer) plus cleanup commands. Definition of done: guidance covers shortcut usage, unlinking, and cautions about re-running after rebuilds.
44 | ### Details:
45 | 
46 | 
47 | ## 3. Outline publish preparation checklist [pending]
48 | ### Dependencies: None
49 | ### Description: Capture the pre-publish steps: package.json metadata review, `npm version` bump, `npm pack` inspection, optional dry run, and scoped package access flags. Definition of done: checklist references provenance/OTP considerations and stresses not to overwrite versions.
50 | ### Details:
51 | 
52 | 
53 | ## 4. Describe global install and maintenance guidance [pending]
54 | ### Dependencies: None
55 | ### Description: Add instructions for publishing (`npm publish`), global installation (`npm install -g`), updates, and uninstall paths for end users. Definition of done: notes include verifying README on npm, recommending `npm update -g`, and documenting uninstall commands.
56 | ### Details:
57 | 
58 | 
```

.taskmaster/tasks/task_023.txt
```
1 | # Task ID: 23
2 | # Title: Execute and Verify CLI Distribution Workflow
3 | # Status: done
4 | # Dependencies: 21, 22
5 | # Priority: high
6 | # Description: Execute the end-to-end CLI distribution workflow documented in Task 22, performing all steps locally to validate the instructions and ensure the package is ready for a real npm publish.
7 | # Details:
8 | This task involves a full dry-run of the CLI publishing and installation lifecycle to prove the documentation from Task 22 is accurate and the package is configured correctly. Follow the 'CLI Distribution and Usage' section of README.md.
9 | 
10 | 1.  **Build the Project:** Start by ensuring the project compiles correctly. Run `npm run build`. This should create the distributable JavaScript files in the `dist/` directory, including the CLI entry point at `dist/bin/prompts.js`.
11 | 
12 | 2.  **Local Development Simulation (`npm link`):**
13 |     *   Execute `npm link` in the project root. This will create a global symlink to your local project, making the `prompts-cli` command (as defined in `package.json`'s `bin` field) available system-wide.
14 |     *   Open a new terminal session (to ensure the path is updated) and run `prompts-cli --version` and `prompts-cli list`. Confirm they execute without errors.
15 |     *   When finished, run `npm unlink` to remove the symlink.
16 | 
17 | 3.  **Package Validation (`npm pack`):**
18 |     *   Run `npm pack`. This command creates a gzipped tarball (`.tgz`) just as it would for publishing. This is a critical step to verify that the `files` array in `package.json` is correct and that no sensitive or unnecessary files (like `src/` or `.env`) are included.
19 | 
20 | 4.  **Publish Simulation (`npm publish --dry-run`):**
21 |     *   Execute `npm publish --dry-run`. This will perform all the pre-publish checks and show a summary of the package contents that would be uploaded to the npm registry, without actually publishing.
22 | 
23 | 5.  **Local Installation Test:**
24 |     *   Create a new empty directory outside of the project (e.g., `~/cli-test`).
25 |     *   From within that new directory, install the package from the tarball created in step 3: `npm install /path/to/project/your-package-name-1.0.0.tgz`.
26 |     *   Verify you can run the command via `./node_modules/.bin/prompts-cli`.
27 | 
28 | 6.  **Global Installation Test:**
29 |     *   Run `npm install -g /path/to/project/your-package-name-1.0.0.tgz` to simulate a global install for an end-user.
30 |     *   Open a new terminal and execute `prompts-cli list` to confirm it works globally.
31 |     *   Clean up by running `npm uninstall -g <package-name>`.
32 | 
33 | 7.  **Documentation Feedback:** If any of these steps fail or the instructions in `README.md` are unclear, update the documentation as part of this task.
34 | 
35 | # Test Strategy:
36 | The successful completion of this task is the test itself. To verify:
37 | 1. Confirm that `npm link` followed by running `prompts-cli list` in a new shell session executes successfully.
38 | 2. Inspect the contents of the tarball generated by `npm pack` to ensure it only contains production files (`dist`, `package.json`, `README.md`, etc.) and not source files (`src`).
39 | 3. Review the output of `npm publish --dry-run` to confirm there are no errors and the file list is correct.
40 | 4. Provide evidence that installing the package tarball (both locally to a new project and globally with `-g`) results in a functioning CLI.
41 | 5. If any documentation changes were required, they must be included in the final pull request. If no changes were needed, a comment confirming the successful validation of all documented steps is required.
42 | 
43 | # Subtasks:
44 | ## 1. Run local build and direct CLI smoke tests [done]
45 | ### Dependencies: None
46 | ### Description: Execute `npm run build` and invoke the CLI via `node dist/cli/main.js` for representative commands to confirm local output matches expectations. Capture results and note any issues.
47 | ### Details:
48 | <info added on 2025-09-20T19:37:08.621Z>
49 | 2025-09-20T19:36:58Z — Performed a prerequisite check to validate the build artifact before linking.
50 | - Ran `npm run build` (`tsc`), which completed successfully.
51 | - Directly invoked the compiled CLI entry point `dist/cli/main.js` to smoke test the primary commands (`--help`, `list`, `export`).
52 | - All commands returned the expected output, confirming the local build is valid and ready for the `npm link` test.
53 | </info added on 2025-09-20T19:37:08.621Z>
54 | 
55 | ## 2. Validate npm link workflow [done]
56 | ### Dependencies: None
57 | ### Description: Use `npm link` to create a global symlink for the CLI, link it into a sample consumer project, exercise key commands, and then clean up with `npm unlink`. Record commands and outcomes.
58 | ### Details:
59 | <info added on 2025-09-20T19:39:18.009Z>
60 | Validated the `npm link` workflow using a local prefix to avoid global permission issues: `npm_config_prefix="$(pwd)/tmp/npm-global" npm link`.
61 | 
62 | To test, a temporary consumer app was created and the package was linked into it (`npm link prompts`). The CLI was successfully exercised via the temporary bin path: `tmp/npm-global/bin/prompts list --json`. The setup was then torn down with `npm unlink` in both the consumer and source directories.
63 | 
64 | **Note:** A key finding is that the linked CLI currently must be run from the project's root directory for its resource files (e.g., `prompts.meta.yaml`) to resolve correctly, as it uses paths relative to the current working directory rather than the script's own location.
65 | </info added on 2025-09-20T19:39:18.009Z>
66 | 
67 | ## 3. Perform publish prep dry run [done]
68 | ### Dependencies: None
69 | ### Description: Review package metadata, bump a prerelease version (or note skipped), run `npm pack` to inspect the tarball, and document provenance/OTP requirements without publishing. Summarize readiness in notes.
70 | ### Details:
71 | <info added on 2025-09-20T19:40:19.038Z>
72 | 2025-09-20T19:42:21Z — Performed a dry run of the packaging process using `npm pack --dry-run`. The command failed as expected because the `package.json` file is currently marked `"private": true` and lacks a `version` property.
73 | 
74 | To prepare for publishing, the following changes are required in `package.json`:
75 | 1.  Set `"private": false`.
76 | 2.  Initialize a semantic version, for example by running `npm version 0.1.0 --no-git-tag-version`.
77 | 
78 | Also noted that the final publish command will be `npm publish --provenance --access public`, which will require OTP authentication. No package tarball was generated.
79 | </info added on 2025-09-20T19:40:19.038Z>
80 | 
81 | ## 4. Plan global publish and support steps [done]
82 | ### Dependencies: None
83 | ### Description: Outline the exact `npm publish` command (with flags), post-publish verification on npmjs.com, global installation instructions for users, and update/rollback procedures. Hold actual publish until approvals allow.
84 | ### Details:
85 | <info added on 2025-09-20T19:41:04.909Z>
86 | []
87 | </info added on 2025-09-20T19:41:04.909Z>
88 | <info added on 2025-09-20T19:41:29.593Z>
89 | Drafted release plan:
90 | 
91 | -   **Pre-Publish:**
92 |     -   Update `package.json`: Add a `version` field (e.g., `1.0.0`) and remove the `"private": true` field to allow publishing.
93 | -   **Publish Command:**
94 |     -   From the repository root, execute: `npm publish --provenance --access public`
95 |     -   Note: This will require a One-Time Password (OTP) from an authenticator app.
96 | -   **Post-Publish Verification:**
97 |     -   Check the package page on npmjs.com (e.g., `https://www.npmjs.com/package/prompts`) to confirm the README is rendered correctly and package metadata (version, license, etc.) is accurate.
98 |     -   Verify the published version from the command line: `npm view prompts version`.
99 |     -   If necessary, add additional distribution tags (e.g., `npm dist-tag add prompts@<version> beta`).
100 | -   **User Installation & Usage Guidance:**
101 |     -   **Install:** `npm install -g prompts`
102 |     -   **Update:** `npm update -g prompts`
103 |     -   **Uninstall:** `npm uninstall -g prompts`
104 | -   **Support and Rollback Plan:**
105 |     -   **Standard Rollback:** To revert users to a previous stable version, use `npm dist-tag add prompts@<stable-version> latest`.
106 |     -   **Emergency Unpublish:** Only if a critical issue is found within 24 hours of publishing, use `npm unpublish prompts@<bad-version>`. This is a destructive action and should be avoided if possible due to its impact on the ecosystem.
107 | 
108 | This plan has been captured for execution upon approval. No publish action has been taken yet.
109 | </info added on 2025-09-20T19:41:29.593Z>
110 | 
```

.taskmaster/tasks/task_024.txt
```
1 | # Task ID: 24
2 | # Title: Finalize npm Publish Readiness
3 | # Status: pending
4 | # Dependencies: 23
5 | # Priority: high
6 | # Description: Prepare the package for its initial npm release by updating package.json, removing the private flag, setting a version, and running final pre-flight checks.
7 | # Details:
8 | This task involves the final steps to make the package publishable to the public npm registry. It builds upon the dry-run validation performed in Task 23.
9 | 
10 | 1. **Update `package.json`:**
11 |    - Open `package.json`.
12 |    - Remove the line `"private": true`.
13 |    - Set the `"version"` field to `"0.1.0"` for the initial release.
14 |    - Briefly review other metadata fields like `description`, `repository`, `license`, and `keywords` for accuracy.
15 | 
16 | 2. **Clean and Rebuild:**
17 |    - Ensure a clean build environment by removing previous artifacts: `rm -rf dist/` and `rm -f *.tgz`.
18 |    - Re-run the production build process: `npm run build`.
19 | 
20 | 3. **Final Packaging Validation:**
21 |    - Generate the final package tarball locally: `npm pack`.
22 |    - Inspect the contents of the generated `.tgz` file (e.g., `tar -tvf prompts-cli-0.1.0.tgz`) to confirm it only contains production-necessary files (`package.json`, `README.md`, the `dist/` directory, etc.) and excludes source code (`src/`) or development configurations (`tsconfig.json`).
23 | 
24 | 4. **Pre-Publish Check:**
25 |    - Authenticate with npm using `npm login`.
26 |    - Perform a final check using npm's dry-run feature: `npm publish --dry-run`. This will simulate the publish process and report the exact files being included without actually releasing the package.
27 | 
28 | # Test Strategy:
29 | 1. After editing `package.json`, use `grep` or `cat` to confirm that the `"private": true` line is removed and the `"version"` is set to `"0.1.0"`.
30 | 2. Run `npm pack` and inspect the resulting tarball's contents using `tar -tvf *.tgz`. Verify that the file list matches expectations for a production package (no `src` folder, no `tsconfig.json`).
31 | 3. Execute `npm publish --dry-run`. The test passes if the command completes successfully and the output lists the expected package contents without any errors or warnings about missing files or authentication issues.
32 | 
33 | # Subtasks:
34 | ## 1. Update package.json for publishability [pending]
35 | ### Dependencies: None
36 | ### Description: Set "private": false and add an initial version (e.g., 0.1.0) using npm version or direct edit, keeping semver formatting.
37 | ### Details:
38 | 
39 | 
40 | ## 2. Re-run packaging validation [pending]
41 | ### Dependencies: None
42 | ### Description: Execute `npm pack --dry-run` (or `npm pack`) and inspect output tarball contents to ensure readiness.
43 | ### Details:
44 | 
45 | 
46 | ## 3. Prepare publish runbook update [pending]
47 | ### Dependencies: None
48 | ### Description: Revise the release checklist with final commands, note provenance/OTP steps, and capture next actions once approvals land.
49 | ### Details:
50 | 
51 | 
```

.taskmaster/tasks/tasks.json
```
1 | {
2 |   "master": {
3 |     "tasks": [
4 |       {
5 |         "id": 1,
6 |         "title": "Project Setup and Server Bootstrap",
7 |         "description": "Initialize a Node.js TypeScript project and set up the basic MCP server using stdio transport. This includes creating the main entry point, configuring graceful shutdown, and establishing structured NDJSON logging.",
8 |         "details": "Create a `package.json` with dependencies like `@modelcontextprotocol/sdk` and `typescript`. Set up `tsconfig.json` for compilation to `dist/`. Implement the main server file (`src/index.ts`) to instantiate `StdioServerTransport`, register server info (name, version), and handle SIGINT/SIGTERM for graceful shutdown. Implement a basic structured logger that outputs NDJSON.",
9 |         "testStrategy": "Manually start the server and connect with an MCP client like MCP Inspector. Verify that the server reports its name and version. Send a SIGINT signal and confirm the server logs a 'server_stop' message and exits cleanly.",
10 |         "priority": "high",
11 |         "dependencies": [],
12 |         "status": "done",
13 |         "subtasks": [
14 |           {
15 |             "id": 1,
16 |             "title": "Configure package.json and tsconfig.json",
17 |             "description": "Update the project's package.json to include necessary dependencies and scripts. Configure tsconfig.json to define the TypeScript compilation settings, ensuring output is directed to the dist/ directory.",
18 |             "dependencies": [],
19 |             "details": "In `package.json`, add `@modelcontextprotocol/sdk` to `dependencies`. Add `typescript`, `ts-node`, and `@types/node` to `devDependencies`. Add a `build` script (`\"tsc\"`) and a `start` script (`\"node dist/index.js\"`). In `tsconfig.json`, set `compilerOptions.outDir` to `./dist`, `rootDir` to `./src`, and ensure `moduleResolution` is `node`.",
20 |             "status": "done",
21 |             "testStrategy": ""
22 |           },
23 |           {
24 |             "id": 2,
25 |             "title": "Implement a Structured NDJSON Logger",
26 |             "description": "Create a simple logger in `src/logger.ts` that writes structured log messages to `stdout` in NDJSON (Newline Delimited JSON) format. This utility will be used for all server logging.",
27 |             "dependencies": [],
28 |             "details": "Implement a `Logger` class or object in `src/logger.ts` with `info`, `warn`, and `error` methods. Each method should accept a message and an optional metadata object. The output for each log entry must be a single-line JSON string containing a timestamp, log level, message, and any metadata, written to `process.stdout`.",
29 |             "status": "done",
30 |             "testStrategy": ""
31 |           },
32 |           {
33 |             "id": 3,
34 |             "title": "Bootstrap MCP Server with Stdio Transport",
35 |             "description": "In the main entry point `src/index.ts`, initialize the core server components by instantiating the MCP server and the standard I/O transport layer.",
36 |             "dependencies": [
37 |               "1.1",
38 |               "1.2"
39 |             ],
40 |             "details": "In `src/index.ts`, import the logger from `./logger.ts`. Import `MCPServer` and `StdioServerTransport` from `@modelcontextprotocol/sdk`. Inside a `main` async function, instantiate the logger, then the `StdioServerTransport`, and finally the `MCPServer`, passing the transport and logger to its constructor.",
41 |             "status": "done",
42 |             "testStrategy": ""
43 |           },
44 |           {
45 |             "id": 4,
46 |             "title": "Register Server Information and Start Listening",
47 |             "description": "Configure the server with its identity by registering its name and version, and then start the server to begin listening for client connections over stdio.",
48 |             "dependencies": [
49 |               "1.3"
50 |             ],
51 |             "details": "In the `main` function of `src/index.ts`, read the `version` from `package.json`. Call the `server.info.register()` method with a server name (e.g., \"MCP Reference Server\") and the version. After registration, call `server.start()` and log a confirmation message indicating the server is running.",
52 |             "status": "done",
53 |             "testStrategy": "After completing this subtask, run the `start` script. Use an MCP client like MCP Inspector to connect to the running process and verify that the server's name and version are correctly reported."
54 |           },
55 |           {
56 |             "id": 5,
57 |             "title": "Implement Graceful Shutdown and Top-Level Error Handling",
58 |             "description": "Add signal handlers in `src/index.ts` to ensure the server shuts down cleanly on SIGINT/SIGTERM signals and that any uncaught exceptions are logged before exiting.",
59 |             "dependencies": [
60 |               "1.3"
61 |             ],
62 |             "details": "Add listeners for `process.on('SIGINT', ...)` and `process.on('SIGTERM', ...)`. The handler should invoke `await server.stop()`, log a 'server_stop' message, and exit with `process.exit(0)`. Also, implement a `process.on('uncaughtException', ...)` handler to log the fatal error using the NDJSON logger before exiting with a non-zero status code.",
63 |             "status": "done",
64 |             "testStrategy": "With the server running, send a SIGINT signal (Ctrl+C). Verify that the 'server_stop' message is logged in NDJSON format and the process exits cleanly without an error code."
65 |           }
66 |         ]
67 |       },
68 |       {
69 |         "id": 37,
70 |         "title": "Wire Execution Loop and Action Mapping",
71 |         "description": "Enable full-loop automation by mapping tasks to executable actions and expanding MCP execution tools.",
72 |         "details": "Map tasks to scripts (or actions.json), extend workflow tools to resolve actions by task id, add domain-runner tools (tests, lint, build), and introduce a server flag to mirror exec enablement.",
73 |         "testStrategy": "Integration test that picks the next task, resolves an action, runs it in dry-run, then executes in gated mode and marks status done.",
74 |         "priority": "medium",
75 |         "dependencies": [
76 |           32
77 |         ],
78 |         "status": "done",
79 |         "subtasks": [
80 |           {
81 |             "id": 1,
82 |             "title": "Add action mapping for tasks",
83 |             "description": "Allow tasks to declare { action: { script, args } } in metadata or a new actions.json; extend run_script to look up by task id.",
84 |             "dependencies": [
85 |               32
86 |             ],
87 |             "details": "Teach the adapter to read per-task action metadata. If not present, look into actions.json keyed by task id. Provide a new MCP tool workflow/run_task_action that resolves and dispatches to run_script.",
88 |             "status": "pending",
89 |             "testStrategy": "Fixture with a task containing action metadata; verify dry-run shows correct command; enable exec and assert ok exit code for a harmless script."
90 |           },
91 |           {
92 |             "id": 2,
93 |             "title": "Add domain execution tools",
94 |             "description": "Register first-class tools for common domains: workflow/run_tests, workflow/run_lint, workflow/run_build, each with Zod schemas.",
95 |             "dependencies": [
96 |               "37.1"
97 |             ],
98 |             "details": "Wrap package scripts like test, lint, build. Tools should support dryRun, timeoutMs, and surface structured results { ok, exitCode, output }.",
99 |             "status": "pending",
100 |             "testStrategy": "Unit tests for each tool's dryRun; integration test for a no-op or trivial command that always succeeds."
101 |           },
102 |           {
103 |             "id": 3,
104 |             "title": "Exec flag parity",
105 |             "description": "Add a --exec-enabled server flag that mirrors PROMPTS_EXEC_ALLOW for controlled execution via MCP.",
106 |             "dependencies": [
107 |               "37.1"
108 |             ],
109 |             "details": "Server parses --exec-enabled and sets PROMPTS_EXEC_ALLOW=1 internally when true; logs a warning banner. Document in docs/mcp-cli.md.",
110 |             "status": "pending",
111 |             "testStrategy": "Server boot test verifying the flag toggles execution state and that run_script is permitted only when enabled."
112 |           },
113 |           {
114 |             "id": 4,
115 |             "title": "Full-loop automation test",
116 |             "description": "Agent-style test: next_task → resolve action → dry-run → live run (gated) → set_task_status done → graph_export.",
117 |             "dependencies": [
118 |               "37.1",
119 |               "37.2",
120 |               "37.3"
121 |             ],
122 |             "details": "Leverage examples/agent-demo.md flow; ensure the loop completes and persists status.",
123 |             "status": "pending",
124 |             "testStrategy": "Integration test under test/integration that exercises the entire loop with a harmless script."
125 |           }
126 |         ]
127 |       },
128 |       {
129 |         "id": 2,
130 |         "title": "Implement Safety Control Utilities",
131 |         "description": "Create utility functions for redacting secrets in logs and capping payload sizes to prevent data leakage and excessive resource usage.",
132 |         "details": "Create a logging utility that wraps the base logger. This utility should scan log objects for keys matching the regex `/(key|secret|token)/i` and replace their values with `[redacted]`. Create a `capPayload` function that truncates strings larger than ~1 MB and appends a note like `[truncated N bytes]`. These utilities should be pure functions and easily testable.",
133 |         "testStrategy": "Unit test the redaction logic by passing objects with keys like `API_KEY` and `SECRET_TOKEN`. Unit test the `capPayload` function with strings smaller than, equal to, and larger than the 1 MB threshold to verify correct truncation and messaging.",
134 |         "priority": "high",
135 |         "dependencies": [
136 |           1
137 |         ],
138 |         "status": "done",
139 |         "subtasks": [
140 |           {
141 |             "id": 1,
142 |             "title": "Create `redactSecrets` Utility Function",
143 |             "description": "Implement a pure function to recursively scan an object and redact values for keys matching a specific regex.",
144 |             "dependencies": [],
145 |             "details": "In a new file, `src/utils/safety.ts`, create and export a pure function `redactSecrets(data: any)`. This function should recursively traverse any given object or array. If it encounters an object key that matches the case-insensitive regex `/(key|secret|token)/i`, it must replace the corresponding value with the string `[redacted]`. The function should handle nested objects and arrays without modifying the original input object (i.e., it should return a new, deep-cloned object).",
146 |             "status": "done",
147 |             "testStrategy": "This function will be tested in a subsequent subtask. Focus on a clean, recursive implementation."
148 |           },
149 |           {
150 |             "id": 2,
151 |             "title": "Create `capPayload` Utility Function",
152 |             "description": "Implement a pure function to truncate large strings to a specified maximum size.",
153 |             "dependencies": [],
154 |             "details": "In the same `src/utils/safety.ts` file, create and export a pure function `capPayload(payload: string, maxSize: number = 1024 * 1024)`. This function will check if the input string's size exceeds `maxSize`. If it does, the function should truncate the string to `maxSize` bytes and append a message indicating how many bytes were removed, e.g., `[truncated 42 bytes]`. If the string is within the limit, it should be returned unmodified.",
155 |             "status": "done",
156 |             "testStrategy": "Testing for this function will be defined in a separate subtask."
157 |           },
158 |           {
159 |             "id": 3,
160 |             "title": "Implement Unit Tests for `redactSecrets`",
161 |             "description": "Create a suite of unit tests to validate the behavior of the `redactSecrets` function.",
162 |             "dependencies": [
163 |               "2.1"
164 |             ],
165 |             "details": "In a new test file, `src/utils/safety.test.ts`, write comprehensive unit tests for the `redactSecrets` function. Test cases should include: an object with sensitive keys (`apiKey`, `SECRET_TOKEN`), a deeply nested object with sensitive keys, an array of objects, an object with no sensitive keys (to ensure it remains unchanged), and non-object inputs to ensure graceful handling.",
166 |             "status": "done",
167 |             "testStrategy": "Use a testing framework like Jest or Vitest. Assert that the original object is not mutated and that the returned object has the correct values redacted."
168 |           },
169 |           {
170 |             "id": 4,
171 |             "title": "Implement Unit Tests for `capPayload`",
172 |             "description": "Create a suite of unit tests to validate the behavior of the `capPayload` function.",
173 |             "dependencies": [
174 |               "2.2"
175 |             ],
176 |             "details": "In the `src/utils/safety.test.ts` file, add unit tests for the `capPayload` function. Cover the main scenarios: a string smaller than the 1MB threshold, a string larger than the threshold (verifying correct truncation and the appended message), and edge cases like an empty string or a string exactly at the threshold.",
177 |             "status": "done",
178 |             "testStrategy": "Verify both the returned string's content and its length to confirm the truncation logic is working as expected."
179 |           },
180 |           {
181 |             "id": 5,
182 |             "title": "Create and Integrate Secure Logger Wrapper",
183 |             "description": "Create a logging utility that wraps the base logger to automatically redact secrets from log objects.",
184 |             "dependencies": [
185 |               "2.1"
186 |             ],
187 |             "details": "Based on the existing logging implementation, create a secure logger wrapper. This wrapper will expose standard logging methods (e.g., `info`, `warn`, `error`). Before passing a log object to the base logger, it must first process the object with the `redactSecrets` function created in subtask 2.1. This ensures that no sensitive data is ever written to the logs. This new utility should be exported for use throughout the application.",
188 |             "status": "done",
189 |             "testStrategy": "Manually inspect log output after integrating the new logger in a test script or a single application entry point to confirm that objects containing keys like 'token' are correctly redacted."
190 |           }
191 |         ]
192 |       },
193 |       {
194 |         "id": 3,
195 |         "title": "Implement Resource Exposure",
196 |         "description": "Load prompt metadata from `resources/prompts.meta.yaml` and expose each prompt's Markdown file as a `file://` resource.",
197 |         "details": "On server startup, parse `prompts.meta.yaml`. For each entry, register a resource with the MCP server. The resource should have a human-friendly name (from the `title` field) and a `file://` URI pointing to the absolute path of the corresponding Markdown file. The resource content preview should be capped using the utility from task 2.",
198 |         "testStrategy": "Start the server and use an MCP client to list resources. Verify that each prompt from the metadata file is listed with the correct name and a valid `file://` URI. Check that reading an oversized resource returns truncated content.",
199 |         "priority": "high",
200 |         "dependencies": [
201 |           1,
202 |           2
203 |         ],
204 |         "status": "done",
205 |         "subtasks": [
206 |           {
207 |             "id": 1,
208 |             "title": "Create a utility to parse `prompts.meta.yaml`",
209 |             "description": "Add the `js-yaml` dependency to the project. Create a new utility function that reads the `resources/prompts.meta.yaml` file, parses its content, and returns a structured object. This function should handle potential file read or parsing errors gracefully.",
210 |             "dependencies": [],
211 |             "details": "Create a new file, e.g., `src/prompts/loader.ts`. Add a function `loadPromptMetadata()` that uses `fs.readFileSync` and `yaml.load`. Define a TypeScript interface for the expected structure of the YAML file (e.g., `{ prompts: [...] }`).",
212 |             "status": "done",
213 |             "testStrategy": "Add a unit test that uses a mock YAML file to ensure the parsing logic correctly converts YAML content to a JavaScript object."
214 |           },
215 |           {
216 |             "id": 2,
217 |             "title": "Implement logic to transform metadata into resource objects",
218 |             "description": "Create a function that takes the parsed prompt metadata, iterates through each prompt entry, and transforms it into a `Resource` object as expected by the MCP server. This includes resolving the file path to an absolute `file://` URI.",
219 |             "dependencies": [
220 |               "3.1"
221 |             ],
222 |             "details": "In `src/prompts/loader.ts`, create a function like `preparePromptResources(metadata)`. For each prompt, use the `path` module to resolve the relative file path from `prompts.meta.yaml` to an absolute path. Format the absolute path as a `file://` URI. The resulting object should conform to the `Resource` interface, which includes `name` (from `title`) and `uri`.",
223 |             "status": "done",
224 |             "testStrategy": "Unit test this transformation logic to ensure file paths are correctly resolved to absolute `file://` URIs on different operating systems."
225 |           },
226 |           {
227 |             "id": 3,
228 |             "title": "Generate and cap content previews for each resource",
229 |             "description": "Enhance the resource preparation logic to read the content of each prompt's Markdown file and generate a capped content preview using the utility from task 2.",
230 |             "dependencies": [
231 |               "3.2"
232 |             ],
233 |             "details": "Modify the function from the previous subtask. For each prompt, read the content of its Markdown file using `fs.readFileSync`. Import and use the `capContent` utility (assuming it's in `src/util/content.ts`) to truncate the file content. Add the resulting string to the `contentPreview` field of the `Resource` object.",
234 |             "status": "done",
235 |             "testStrategy": "Verify that a test resource with content larger than the cap is correctly truncated, and one with smaller content remains unchanged."
236 |           },
237 |           {
238 |             "id": 4,
239 |             "title": "Integrate resource registration into the server startup sequence",
240 |             "description": "In the main server entry point, call the new functions to load, prepare, and register the prompt resources with the MCP server instance after it has been initialized.",
241 |             "dependencies": [
242 |               "3.2",
243 |               "3.3"
244 |             ],
245 |             "details": "Modify `src/main.ts`. After the `MCPServer` instance is created, call the prompt loading and preparation functions. Iterate over the generated list of `Resource` objects and call `mcpServer.registerResource()` for each one. This should happen before the server starts listening for connections.",
246 |             "status": "done",
247 |             "testStrategy": "Manually run the server and check the startup logs for any errors related to resource registration."
248 |           },
249 |           {
250 |             "id": 5,
251 |             "title": "Add an integration test to validate resource exposure",
252 |             "description": "Create a new integration test that starts the server, uses an MCP client to request the list of all available resources, and validates that the prompts from `prompts.meta.yaml` are present with the correct details.",
253 |             "dependencies": [
254 |               "3.4"
255 |             ],
256 |             "details": "In a new test file, e.g., `test/integration/resource.test.ts`, write a test case that connects to the running server. It should call the `list_resources` tool. The test will then assert that the returned list contains entries corresponding to the prompts, verifying the `name`, `uri` (is a valid `file://` URI), and `contentPreview` (is a non-empty, capped string).",
257 |             "status": "done",
258 |             "testStrategy": "This subtask is the test itself. Ensure it covers at least two different prompts from the metadata file."
259 |           }
260 |         ]
261 |       },
262 |       {
263 |         "id": 4,
264 |         "title": "Implement Dynamic Prompt Tools",
265 |         "description": "Expose each prompt defined in `resources/prompts.meta.yaml` as a dynamically generated MCP tool.",
266 |         "details": "During server startup, iterate through the entries in `prompts.meta.yaml`. For each entry, dynamically register an MCP tool with an `id` matching the metadata. Generate input/output schemas based on the metadata. The tool's handler should read the corresponding Markdown file from `resources/prompts/`, append a rendered footer, and return the content, applying the payload cap from task 2.",
267 |         "testStrategy": "Use an MCP client to list tools and verify that a tool exists for each prompt in the metadata file. Invoke a tool and confirm the response contains the correct Markdown content. Test with a prompt file larger than 1 MB to ensure the response is truncated.",
268 |         "priority": "high",
269 |         "dependencies": [
270 |           2,
271 |           3
272 |         ],
273 |         "status": "done",
274 |         "subtasks": [
275 |           {
276 |             "id": 1,
277 |             "title": "Create a Utility to Load and Parse Prompt Metadata",
278 |             "description": "Implement a function that reads `resources/prompts.meta.yaml`, parses it, and returns a validated, typed array of prompt metadata objects. This will serve as the single source of truth for prompt definitions.",
279 |             "dependencies": [],
280 |             "details": "Create a new file `src/lib/prompt-loader.ts`. Add an exported function `loadPromptDefinitions()`. This function should use the `fs` module to read `resources/prompts.meta.yaml` and the `js-yaml` library to parse its content. Define a TypeScript interface for the prompt metadata structure (e.g., `PromptDefinition`) and ensure the parsed data conforms to this type before returning it. This utility will be called during server startup.",
281 |             "status": "done",
282 |             "testStrategy": "Add a unit test to verify that the function correctly parses a sample YAML string and returns the expected array of objects."
283 |           },
284 |           {
285 |             "id": 2,
286 |             "title": "Develop a Generic Handler for Prompt Tools",
287 |             "description": "Create a generic handler function that can be used by all dynamically generated prompt tools. The handler will be responsible for reading the prompt content, appending a footer, and applying the payload cap.",
288 |             "dependencies": [],
289 |             "details": "In a new file, e.g., `src/tools/prompt-handler.ts`, create a factory function `createPromptHandler(promptFilePath: string)`. This function should return an async `ToolHandler` function. The handler will read the file content from the provided `promptFilePath`, append a standard rendered footer (a simple string for now), and then apply the payload capping utility from Task 2 to the final content. The handler should return an object like `{ content: '...' }`.",
290 |             "status": "done",
291 |             "testStrategy": "Unit test the created handler to ensure it reads a file, appends the footer, and correctly truncates content that exceeds the payload cap."
292 |           },
293 |           {
294 |             "id": 3,
295 |             "title": "Implement Dynamic Schema Generation from Metadata",
296 |             "description": "Create a function that generates JSON schemas for a tool's input and output based on the `variables` defined in its metadata.",
297 |             "dependencies": [
298 |               "4.1"
299 |             ],
300 |             "details": "In a new utility file, e.g., `src/lib/schema-generator.ts`, create a function `generateSchemas(metadata: PromptDefinition)`. This function will generate the `inputSchema` by creating a JSON Schema `object` with `properties` corresponding to each item in the metadata's `variables` array. The `outputSchema` should be a static JSON Schema defining an object with a single string property named `content`.",
301 |             "status": "done",
302 |             "testStrategy": "Unit test the schema generator with sample prompt metadata to ensure it produces valid input and output JSON schemas."
303 |           },
304 |           {
305 |             "id": 4,
306 |             "title": "Integrate Dynamic Tool Registration into Server Startup",
307 |             "description": "Modify the server's startup sequence to iterate through the loaded prompt definitions and register an MCP tool for each one.",
308 |             "dependencies": [
309 |               "4.1",
310 |               "4.2",
311 |               "4.3"
312 |             ],
313 |             "details": "In the primary tool registration file (e.g., `src/tools/tool-registry.ts`), create a new async function `registerPromptTools(mcpServer: McpServer)`. This function will call `loadPromptDefinitions()` (from subtask 4.1). It will then loop through each definition, calling `generateSchemas()` (subtask 4.3) and `createPromptHandler()` (subtask 4.2) for each. Finally, it will construct the complete `ToolDefinition` object (with `id`, schemas, and handler) and register it using `mcpServer.registerTool()`. Call this new function from the main server entry point (`src/server.ts`) during initialization.",
314 |             "status": "done",
315 |             "testStrategy": "After implementation, manually start the server and check the logs or use an MCP client to confirm that tools corresponding to `prompts.meta.yaml` are being registered without errors."
316 |           },
317 |           {
318 |             "id": 5,
319 |             "title": "Add Integration Tests for Dynamic Prompt Tools",
320 |             "description": "Implement integration tests to verify that the dynamic tools are correctly exposed and functional through the MCP server.",
321 |             "dependencies": [
322 |               "4.4"
323 |             ],
324 |             "details": "In a new test file under `test/integration/`, write tests that use an MCP client to interact with the running server. One test should list all available tools and assert that a tool exists for each entry in `prompts.meta.yaml`. Another test should invoke a specific prompt tool and validate that the response body contains the expected markdown content. Add a final test using a large (>1MB) prompt file to ensure the response content is correctly truncated by the payload cap.",
325 |             "status": "done",
[TRUNCATED]
```

.taskmaster/templates/example_prd.txt
```
1 | <context>
2 | # Overview  
3 | [Provide a high-level overview of your product here. Explain what problem it solves, who it's for, and why it's valuable.]
4 | 
5 | # Core Features  
6 | [List and describe the main features of your product. For each feature, include:
7 | - What it does
8 | - Why it's important
9 | - How it works at a high level]
10 | 
11 | # User Experience  
12 | [Describe the user journey and experience. Include:
13 | - User personas
14 | - Key user flows
15 | - UI/UX considerations]
16 | </context>
17 | <PRD>
18 | # Technical Architecture  
19 | [Outline the technical implementation details:
20 | - System components
21 | - Data models
22 | - APIs and integrations
23 | - Infrastructure requirements]
24 | 
25 | # Development Roadmap  
26 | [Break down the development process into phases:
27 | - MVP requirements
28 | - Future enhancements
29 | - Do not think about timelines whatsoever -- all that matters is scope and detailing exactly what needs to be build in each phase so it can later be cut up into tasks]
30 | 
31 | # Logical Dependency Chain
32 | [Define the logical order of development:
33 | - Which features need to be built first (foundation)
34 | - Getting as quickly as possible to something usable/visible front end that works
35 | - Properly pacing and scoping each feature so it is atomic but can also be built upon and improved as development approaches]
36 | 
37 | # Risks and Mitigations  
38 | [Identify potential risks and how they'll be addressed:
39 | - Technical challenges
40 | - Figuring out the MVP that we can build upon
41 | - Resource constraints]
42 | 
43 | # Appendix  
44 | [Include any additional information:
45 | - Research findings
46 | - Technical specifications]
47 | </PRD>
```

packages/prompts-tools/package.json
```
1 | {
2 |   "name": "@prompts/tools",
3 |   "version": "0.1.0",
4 |   "type": "module",
5 |   "private": true,
6 |   "main": "dist/index.js",
7 |   "types": "dist/index.d.ts",
8 |   "exports": {
9 |     ".": {
10 |       "import": "./dist/index.js",
11 |       "types": "./dist/index.d.ts"
12 |     }
13 |   },
14 |   "scripts": {
15 |     "build": "tsc -p tsconfig.json"
16 |   }
17 | }
18 | 
```

packages/prompts-tools/tsconfig.json
```
1 | {
2 |   "extends": "../../tsconfig.json",
3 |   "compilerOptions": {
4 |     "outDir": "./dist",
5 |     "rootDir": "./src",
6 |     "declaration": true,
7 |     "emitDeclarationOnly": false,
8 |     "allowImportingTsExtensions": false,
9 |     "composite": false
10 |   },
11 |   "include": ["src/**/*.ts"]
12 | }
```

prompts/preflight/docfetch-check.md
```
1 | ---
2 | phase: "P0 Preflight Docs"
3 | gate: "DocFetchReport"
4 | status: "DocFetchReport.status is OK with sources captured before planning or coding."
5 | previous:
6 |   - "Preflight discovery (AGENTS baseline)"
7 | next:
8 |   - "/instruction-file"
9 |   - "/planning-process"
10 | ---
11 | 
12 | # DocFetch Preflight Check
13 | 
14 | Trigger: /docfetch-check
15 | 
16 | Purpose: Enforce the documentation freshness gate before planning work begins. Run this guardrail to pull the latest references, update the DocFetchReport, and block further tasks until the report is OK.
17 | 
18 | ## Why this matters
19 | 
20 | - Keeps lifecycle prompts aligned with the newest official docs, SDK notes, and workflow rule-packs.
21 | - Prevents stale guidance from sneaking into planning or implementation tasks.
22 | - Records doc coverage in `DocFetchReport` so reviewers can audit what sources were considered.
23 | 
24 | ## Steps
25 | 
26 | 1. **Prepare the workspace**
27 |    - Ensure you are at the repo root (`/home/user/.codex/prompts`).
28 |    - Review `AGENTS.md` for any newly added rule-packs that might need fresh docs.
29 | 2. **Identify the doc set**
30 |    - Note the tech stack elements you will touch (frameworks, SDKs, infra). For each, pick the primary doc provider (contex7-mcp first, gitmcp as fallback).
31 | 3. **Fetch docs via MCP**
32 |    - For each library/tool:
33 | 
34 |      ```bash
35 |      # Example using contex7-mcp via CLI helper (adjust topic per dependency)
36 |      docfetch contex7-mcp "<library-id>" --topic "<focus-topic>"
37 |      ```
38 | 
39 |    - When contex7-mcp fails, retry with gitmcp:
40 | 
41 |      ```bash
42 |      docfetch gitmcp "owner/repo" --path docs --topic "<focus-topic>"
43 |      ```
44 | 
45 |    - Capture timestamps, tool calls, and URLs; you will paste them into the report.
46 | 4. **Run local metadata checks**
47 |    - Keep prompt metadata synchronized before recording the report:
48 | 
49 |      ```bash
50 |      npm run validate:metadata
51 |      npm run build:catalog
52 |      ```
53 | 
54 |    - Fix any validation errors before proceeding.
55 | 5. **Update `DocFetchReport`**
56 |    - Open (or create) `.docfetch/DocFetchReport.json`.
57 |    - Record for each fetch:
58 |      - `tool` (e.g., `contex7-mcp`)
59 |      - `query` or URL
60 |      - `time_utc` when fetched
61 |      - Key guidance or insights
62 |    - Set `status` to `"OK"` only when every required area has at least one up-to-date source. Use `"Docs Missing"` or `"Stale"` if coverage is incomplete.
63 | 6. **Capture gaps and follow-ups**
64 |    - If any source could not be retrieved, list it under `DocFetchReport.gaps`. Include remediation notes (e.g., "Retry gitmcp once service resumes").
65 | 7. **Validate the gate**
66 |    - Confirm `DocFetchReport.status == "OK"`.
67 |    - Paste a short summary in your working notes or PR description detailing what changed.
68 | 
69 | ## Outcome checklist
70 | 
71 | - [ ] `DocFetchReport.status` is `"OK"`.
72 | - [ ] All new tool/library areas touched by upcoming work have documented sources.
73 | - [ ] `DocFetchReport.tools_called[]` reflects every MCP lookup.
74 | - [ ] `DocFetchReport.key_guidance[]` links each source to how it informs planned changes.
75 | - [ ] Any unresolved gaps are logged under `DocFetchReport.gaps` with an action plan.
76 | 
77 | ## Remediation if the gate fails
78 | 
79 | - **Missing sources:** Re-run docfetch with fallback providers. If still missing, escalate in the report and block downstream tasks until resolved.
80 | - **Stale report:** Repeat the fetch sequence; update timestamps and guidance. Do not proceed with planning on a stale report.
81 | - **Validation errors:** Address metadata/catalog issues (`npm run validate:metadata`, `npm run build:catalog`) before re-attempting DocFetch.
82 | - **Infrastructure outages:** Mark `DocFetchReport.status` as `"Docs Missing"`, include outage details, and schedule a re-check within 24 hours.
83 | 
84 | Only move forward with planning (`/instruction-file`, `/planning-process`) after this checklist is satisfied and `DocFetchReport` shows a clean `"OK"` state.
```

scripts/__tests__/validate_metadata.test.ts
```
1 | import { strict as assert } from 'node:assert';
2 | import { spawn } from 'node:child_process';
3 | import { promises as fs } from 'node:fs';
4 | import os from 'node:os';
5 | import path from 'node:path';
6 | import { fileURLToPath } from 'node:url';
7 | 
8 | async function main(): Promise<void> {
9 |   const moduleDir = path.dirname(fileURLToPath(import.meta.url));
10 |   const projectRoot = path.resolve(moduleDir, '..', '..');
11 |   const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'metadata-validator-'));
12 |   const repoRoot = path.join(tmpRoot, 'repo');
13 |   await fs.mkdir(repoRoot, { recursive: true });
14 |   await fs.mkdir(path.join(repoRoot, 'prompts'), { recursive: true });
15 | 
16 |   const workflowContent = `---\ntitle: Workflow\n---\n# Workflow\n\n## P0 Preflight Docs\n`;
17 |   await fs.writeFile(path.join(repoRoot, 'WORKFLOW.md'), workflowContent, 'utf8');
18 | 
19 |   const promptPath = path.join(repoRoot, 'prompts', 'example.md');
20 |   await fs.writeFile(promptPath, '# Example Prompt\n', 'utf8');
21 | 
22 |   const scriptPath = path.join(projectRoot, 'scripts', 'validate_metadata.ts');
23 |   const child = spawn(
24 |     process.execPath,
25 |     ['--loader', 'ts-node/esm', scriptPath],
26 |     {
27 |       cwd: projectRoot,
28 |       env: {
29 |         ...process.env,
30 |         PROMPTS_VALIDATION_ROOT: repoRoot,
31 |       },
32 |     },
33 |   );
34 | 
35 |   const stderrChunks: string[] = [];
36 |   const stdoutChunks: string[] = [];
37 |   child.stderr?.setEncoding('utf8');
38 |   child.stderr?.on('data', (chunk) => {
39 |     stderrChunks.push(chunk);
40 |   });
41 |   child.stdout?.setEncoding('utf8');
42 |   child.stdout?.on('data', (chunk) => {
43 |     stdoutChunks.push(chunk);
44 |   });
45 | 
46 |   const exitCode: number = await new Promise((resolve, reject) => {
47 |     child.on('error', reject);
48 |     child.on('close', (code) => {
49 |       resolve(code ?? 0);
50 |     });
51 |   });
52 | 
53 |   const stderrOutput = stderrChunks.join('');
54 |   assert.strictEqual(exitCode, 1, 'expected validator to exit with failure');
55 |   assert.ok(
56 |     stderrOutput.includes('prompts/example.md: missing YAML front matter'),
57 |     `expected missing front matter error, received: ${stderrOutput || stdoutChunks.join('')}`,
58 |   );
59 | 
60 |   console.log('validate metadata missing front matter test passed.');
61 | }
62 | 
63 | main().catch((error) => {
64 |   console.error(error);
65 |   process.exitCode = 1;
66 | });
```

scripts/__tests__/workflow_sync.test.ts
```
1 | import { strict as assert } from 'node:assert';
2 | import { promises as fs } from 'node:fs';
3 | import os from 'node:os';
4 | import path from 'node:path';
5 | 
6 | import type { PromptCatalog } from '../catalog_types.ts';
7 | import { regenerateWorkflow, synchronizeWorkflowDoc } from '../generate_docs.ts';
8 | 
9 | async function main(): Promise<void> {
10 |   const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'workflow-sync-'));
11 |   const repoRoot = path.join(tmpRoot, 'repo');
12 |   await fs.mkdir(repoRoot, { recursive: true });
13 | 
14 |   const workflowPath = path.join(repoRoot, 'WORKFLOW.md');
15 |   const workflowGraphPath = path.join(repoRoot, 'workflow.mmd');
16 | 
17 |   const initialWorkflow = `# Workflow\n\n## 5) Phases\n\n${'<!-- BEGIN GENERATED PHASES -->'}\n### P0 Preflight Docs (Blocking)\n\n- **Purpose**: Placeholder.\n${'<!-- commands:start -->'}\n- _No catalog commands mapped to this phase._\n${'<!-- commands:end -->'}\n${'<!-- END GENERATED PHASES -->'}\n`;
18 |   await fs.writeFile(workflowPath, initialWorkflow, 'utf8');
19 |   await fs.writeFile(workflowGraphPath, 'flowchart TD\n', 'utf8');
20 | 
21 |   const catalogBefore: PromptCatalog = {
22 |     'p0-preflight-docs-blocking': [
23 |       {
24 |         phase: 'P0 Preflight Docs (Blocking)',
25 |         command: '/alpha',
26 |         title: 'Alpha',
27 |         purpose: 'Initial command.',
28 |         gate: 'Gate',
29 |         status: 'Stable',
30 |         previous: [],
31 |         next: [],
32 |         path: 'prompts/alpha.md',
33 |       },
34 |     ],
35 |   };
36 | 
37 |   await synchronizeWorkflowDoc(repoRoot, catalogBefore);
38 |   await regenerateWorkflow(repoRoot, catalogBefore);
39 | 
40 |   let workflow = await fs.readFile(workflowPath, 'utf8');
41 |   assert.ok(workflow.includes('`/alpha`'), 'expected initial command in workflow doc');
42 |   let mermaid = await fs.readFile(workflowGraphPath, 'utf8');
43 |   assert.ok(mermaid.includes('/alpha/'), 'expected initial command in workflow graph');
44 | 
45 |   const catalogAfter: PromptCatalog = {
46 |     'p0-preflight-docs-blocking': [
47 |       {
48 |         phase: 'P0 Preflight Docs (Blocking)',
49 |         command: '/beta',
50 |         title: 'Beta',
51 |         purpose: 'Renamed command.',
52 |         gate: 'Gate',
53 |         status: 'Stable',
54 |         previous: [],
55 |         next: [],
56 |         path: 'prompts/alpha.md',
57 |       },
58 |     ],
59 |   };
60 | 
61 |   await synchronizeWorkflowDoc(repoRoot, catalogAfter);
62 |   await regenerateWorkflow(repoRoot, catalogAfter);
63 | 
64 |   workflow = await fs.readFile(workflowPath, 'utf8');
65 |   assert.ok(workflow.includes('`/beta`'), 'expected renamed command in workflow doc');
66 |   assert.ok(!workflow.includes('`/alpha`'), 'expected original command removed from workflow doc');
67 | 
68 |   mermaid = await fs.readFile(workflowGraphPath, 'utf8');
69 |   assert.ok(mermaid.includes('/beta/'), 'expected renamed command in workflow graph');
70 |   assert.ok(!mermaid.includes('/alpha/'), 'expected original command removed from workflow graph');
71 | 
72 |   console.log('workflow sync regression test passed.');
73 | }
74 | 
75 | main().catch((error) => {
76 |   console.error(error);
77 |   process.exitCode = 1;
78 | });
```

scripts/ci/verify-pack-contains.mjs
```
1 | #!/usr/bin/env node
2 | import { mkdtempSync, rmSync } from 'node:fs';
3 | import { tmpdir } from 'node:os';
4 | import { join } from 'node:path';
5 | import { spawnSync } from 'node:child_process';
6 | 
7 | function fail(msg) {
8 |   console.error(`pack-verify: ${msg}`);
9 |   process.exit(1);
10 | }
11 | 
12 | const cacheDir = mkdtempSync(join(tmpdir(), 'npm-cache-'));
13 | try {
14 |   const result = spawnSync('npm', ['pack', '--json', '--dry-run'], {
15 |     env: { ...process.env, npm_config_cache: cacheDir },
16 |     encoding: 'utf8',
17 |     stdio: ['ignore', 'pipe', 'pipe'],
18 |   });
19 | 
20 |   if (result.status !== 0) {
21 |     console.error(result.stderr || '');
22 |     fail(`npm pack failed with code ${result.status}`);
23 |   }
24 | 
25 |   let json;
26 |   try {
27 |     json = JSON.parse(result.stdout);
28 |   } catch (e) {
29 |     console.error(result.stdout);
30 |     fail('unable to parse npm pack --json output');
31 |   }
32 | 
33 |   const entry = Array.isArray(json) ? json[0] : json;
34 |   const files = entry && Array.isArray(entry.files) ? entry.files : [];
35 |   if (!files.length) {
36 |     fail('no files reported by npm pack');
37 |   }
38 | 
39 |   const hasSchemas = files.some((f) => typeof f.path === 'string' && f.path.startsWith('schemas/'));
40 |   const hasServer = files.some((f) => typeof f.path === 'string' && f.path === 'dist/mcp/server.js');
41 | 
42 |   if (!hasSchemas) {
43 |     fail('schemas/ directory is missing from package contents');
44 |   }
45 |   if (!hasServer) {
46 |     fail('dist/mcp/server.js is missing from package contents');
47 |   }
48 | 
49 |   console.log('pack-verify: OK — schemas/ and dist/mcp/server.js present');
50 | } finally {
51 |   try { rmSync(cacheDir, { recursive: true, force: true }); } catch {}
52 | }
53 | 
```

src/cli/actions.ts
```
1 | import { resolve } from 'node:path';
2 | 
3 | import { ingestTasks } from '../adapters/taskmaster/ingest.js';
4 | import { TaskService, computeReadyTasks } from '../mcp/task-service.js';
5 | import type {
6 |   CanonicalTaskStatus,
7 |   PromptsTask,
8 |   TaskPriority
9 | } from '../types/prompts-task.js';
10 | 
11 | export interface TaskLocatorOptions {
12 |   tasksPath: string;
13 |   tag: string;
14 |   cwd?: string;
15 | }
16 | 
17 | export interface ServiceOptions extends TaskLocatorOptions {
18 |   writeEnabled: boolean;
19 | }
20 | 
21 | export interface NextTaskResult {
22 |   task: PromptsTask | null;
23 |   ready: PromptsTask[];
24 | }
25 | 
26 | export interface GraphExport {
27 |   nodes: GraphNode[];
28 | }
29 | 
30 | export interface GraphNode {
31 |   id: number;
32 |   title: string;
33 |   status: CanonicalTaskStatus;
34 |   priority: TaskPriority;
35 |   dependencies: number[];
36 | }
37 | 
38 | const LF = '\n';
39 | 
40 | const resolveTasksPath = ({ tasksPath, cwd }: TaskLocatorOptions): string =>
41 |   resolve(cwd ?? process.cwd(), tasksPath);
42 | 
43 | export const loadIngest = async (options: TaskLocatorOptions) =>
44 |   ingestTasks(resolveTasksPath(options), { tag: options.tag });
45 | 
46 | export const createTaskService = async (options: ServiceOptions): Promise<TaskService> => {
47 |   const service = new TaskService({
48 |     tasksPath: resolveTasksPath(options),
49 |     tag: options.tag,
50 |     writeEnabled: options.writeEnabled
51 |   });
52 |   await service.load();
53 |   return service;
54 | };
55 | 
56 | export const runNext = async (options: TaskLocatorOptions): Promise<NextTaskResult> => {
57 |   const service = await createTaskService({ ...options, writeEnabled: false });
58 |   const tasks = service.list();
59 |   return {
60 |     task: service.next(),
61 |     ready: computeReadyTasks(tasks)
62 |   };
63 | };
64 | 
65 | export const runAdvance = async (
66 |   options: TaskLocatorOptions,
67 |   id: number,
68 |   status: CanonicalTaskStatus,
69 |   writeEnabled: boolean,
70 | ) => {
71 |   const service = await createTaskService({ ...options, writeEnabled });
72 |   return service.setStatus(id, status);
73 | };
74 | 
75 | export const runGraph = async (options: TaskLocatorOptions): Promise<GraphExport> => {
76 |   const service = await createTaskService({ ...options, writeEnabled: false });
77 |   return service.graph() as GraphExport;
78 | };
79 | 
80 | export const summarizeStatuses = (tasks: PromptsTask[]): Record<CanonicalTaskStatus, number> =>
81 |   tasks.reduce<Record<CanonicalTaskStatus, number>>(
82 |     (totals, task) => {
83 |       totals[task.status] = (totals[task.status] ?? 0) + 1;
84 |       return totals;
85 |     },
86 |     {
87 |       pending: 0,
88 |       in_progress: 0,
89 |       blocked: 0,
90 |       done: 0,
91 |       deprecated: 0
92 |     },
93 |   );
94 | 
95 | export const formatGraphDot = (nodes: GraphNode[]): string => {
96 |   const lines: string[] = ['digraph TaskGraph {', '  rankdir=LR;', '  node [shape=box];'];
97 | 
98 |   for (const node of nodes) {
99 |     const escapedTitle = node.title.replaceAll('"', '\\"');
100 |     const label = `#${node.id}: ${escapedTitle}`;
101 |     lines.push(
102 |       `  "${node.id}" [label="${label}\\nstatus=${node.status}\\npriority=${node.priority}"];`
103 |     );
104 |   }
105 | 
106 |   for (const node of nodes) {
107 |     for (const dependency of node.dependencies) {
108 |       lines.push(`  "${dependency}" -> "${node.id}";`);
109 |     }
110 |   }
111 | 
112 |   lines.push('}');
113 |   return lines.join(LF);
114 | };
115 | 
116 | export const buildStatusSummary = async (options: TaskLocatorOptions) => {
117 |   const service = await createTaskService({ ...options, writeEnabled: false });
118 |   const tasks = service.list();
119 |   const ready = computeReadyTasks(tasks);
120 |   const next = service.next();
121 | 
122 |   return {
123 |     summary: summarizeStatuses(tasks),
124 |     next: next ? { id: next.id, title: next.title } : null,
125 |     ready: ready.map((task) => ({ id: task.id, title: task.title })),
126 |     total: tasks.length
127 |   };
128 | };
```

src/cli/main.ts
```
1 | #!/usr/bin/env node
2 | import { spawn } from 'node:child_process';
3 | import { promises as fs } from 'node:fs';
4 | import path from 'node:path';
5 | import { createInterface } from 'node:readline/promises';
6 | import { stdin as input, stdout as output } from 'node:process';
7 | import { createRequire } from 'node:module';
8 | 
9 | import { Command } from 'commander';
10 | import { dump as dumpYaml, load as loadYaml } from 'js-yaml';
11 | 
12 | import { TaskIngestError, TaskValidationError } from '../adapters/taskmaster/ingest.js';
13 | import {
14 |   buildStatusSummary,
15 |   formatGraphDot,
16 |   loadIngest,
17 |   runAdvance,
18 |   runGraph,
19 |   runNext,
20 |   type GraphNode,
21 |   type TaskLocatorOptions
22 | } from './actions.js';
23 | import { STATUS_ALIASES, type CanonicalTaskStatus } from '../types/prompts-task.js';
24 | import {
25 |   ensureArray,
26 |   formatFrontMatter,
27 |   parseFrontMatter,
28 |   type FrontMatterRecord,
29 | } from '../utils/front_matter.js';
30 | import { extractTitleFromMarkdown, loadPhases } from '../utils/markdown.js';
31 | 
32 | const require = createRequire(import.meta.url);
33 | const packageJson = require('../../package.json') as { version?: string };
34 | 
35 | interface GlobalCliOptions {
36 |   tasks: string;
37 |   tag: string;
38 |   write?: boolean;
39 |   pretty?: boolean;
40 | }
41 | 
42 | const DEFAULT_TASKS_PATH = '.taskmaster/tasks/tasks.json';
43 | 
44 | const program = new Command();
45 | program
46 |   .name('prompts')
47 |   .description('Task-Master companion CLI for prompts workflows')
48 |   .version(packageJson.version ?? '0.0.0')
49 |   .option('--tasks <path>', 'Path to Task-Master tasks.json file', DEFAULT_TASKS_PATH)
50 |   .option('--tag <tag>', 'Tagged task list to load', 'master')
51 |   .option('--write', 'Enable write mode for commands that persist changes')
52 |   .option('--pretty', 'Pretty-print JSON output')
53 |   .option('--verbose', 'Emit structured logs to stderr')
54 |   .option('--unsafe-logs', 'Disable metadata redaction (not recommended)');
55 | 
56 | const getGlobalOptions = (): GlobalCliOptions => program.optsWithGlobals<GlobalCliOptions>();
57 | 
58 | const stringify = (value: unknown, pretty?: boolean): string =>
59 |   JSON.stringify(value, null, pretty ? 2 : undefined) ?? 'null';
60 | 
61 | const printJson = (value: unknown, pretty?: boolean): void => {
62 |   console.log(stringify(value, pretty));
63 | };
64 | 
65 | const parseTaskId = (raw: string): number => {
66 |   const value = Number.parseInt(raw, 10);
67 |   if (!Number.isInteger(value) || value < 1) {
68 |     throw new Error('Task id must be a positive integer.');
69 |   }
70 |   return value;
71 | };
72 | 
73 | const parseStatus = (raw: string): CanonicalTaskStatus => {
74 |   const key = raw.trim().toLowerCase();
75 |   const canonical = STATUS_ALIASES[key];
76 |   if (!canonical) {
77 |     throw new Error(`Unsupported status value: ${raw}`);
78 |   }
79 |   return canonical;
80 | };
81 | 
82 | const isRecord = (value: unknown): value is Record<string, unknown> =>
83 |   !!value && typeof value === 'object';
84 | 
85 | const printError = (error: unknown): void => {
86 |   if (error instanceof TaskValidationError) {
87 |     console.error(`Validation failed: ${error.message}`);
88 |     if (isRecord(error.context) && Array.isArray(error.context.errors)) {
89 |       for (const issue of error.context.errors as { message?: string }[]) {
90 |         if (issue && typeof issue.message === 'string') {
91 |           console.error(`- ${issue.message}`);
92 |         }
93 |       }
94 |     }
95 |     return;
96 |   }
97 | 
98 |   if (error instanceof TaskIngestError) {
99 |     console.error(error.message);
100 |     if (error.context) {
101 |       console.error(stringify(error.context, true));
102 |     }
103 |     return;
104 |   }
105 | 
106 |   console.error(error instanceof Error ? error.message : String(error));
107 | };
108 | 
109 | import { createSecureLogger, logger as baseLogger } from '../logger.js';
110 | const withCliErrors = async (runner: () => Promise<void>): Promise<void> => {
111 |   try {
112 |     const opts = getGlobalOptions() as any;
113 |     const cliLogger = createSecureLogger(baseLogger, { unsafe: Boolean(opts.unsafeLogs) });
114 |     if (opts.verbose) cliLogger.info('cli_start');
115 |     await runner();
116 |     if (opts.verbose) cliLogger.info('cli_end');
117 |   } catch (error) {
118 |     printError(error);
119 |     process.exitCode = 1;
120 |   }
121 | };
122 | 
123 | const toLocatorOptions = (options: GlobalCliOptions): TaskLocatorOptions => ({
124 |   tasksPath: options.tasks,
125 |   tag: options.tag,
126 |   cwd: process.cwd()
127 | });
128 | 
129 | program
130 |   .command('ingest')
131 |   .description('Validate and normalize Task-Master tasks into the canonical schema.')
132 |   .action(async () => {
133 |     await withCliErrors(async () => {
134 |       const options = getGlobalOptions();
135 |       const result = await loadIngest(toLocatorOptions(options));
136 |       printJson(
137 |         {
138 |           tasks: result.tasks,
139 |           report: result.report
140 |         },
141 |         options.pretty
142 |       );
143 |     });
144 |   });
145 | 
146 | program
147 |   .command('next')
148 |   .description('Select the next ready task based on dependency and priority rules.')
149 |   .action(async () => {
150 |     await withCliErrors(async () => {
151 |       const options = getGlobalOptions();
152 |       const { task, ready } = await runNext(toLocatorOptions(options));
153 | 
154 |       printJson(
155 |         {
156 |           task,
157 |           ready
158 |         },
159 |         options.pretty
160 |       );
161 |     });
162 |   });
163 | 
164 | program
165 |   .command('advance')
166 |   .description('Update a task\'s status. Persists only when --write is supplied.')
167 |   .argument('<id>', 'Task identifier to update.')
168 |   .argument('<status>', 'New status (canonical name or supported alias).')
169 |   .action(async (id: string, status: string) => {
170 |     await withCliErrors(async () => {
171 |       const options = getGlobalOptions();
172 |       const taskId = parseTaskId(id);
173 |       const canonicalStatus = parseStatus(status);
174 |       const result = await runAdvance(toLocatorOptions(options), taskId, canonicalStatus, Boolean(options.write));
175 | 
176 |       printJson(
177 |         {
178 |           task: result.task,
179 |           persisted: result.persisted
180 |         },
181 |         options.pretty
182 |       );
183 |     });
184 |   });
185 | 
186 | program
187 |   .command('graph')
188 |   .description('Export the task dependency graph as JSON or DOT.')
189 |   .option('--format <format>', 'Output format: json or dot', 'json')
190 |   .action(async (commandOptions: { format: string }) => {
191 |     await withCliErrors(async () => {
192 |       const options = getGlobalOptions();
193 |       const graph = await runGraph(toLocatorOptions(options));
194 |       const format = (commandOptions.format ?? 'json').toLowerCase();
195 | 
196 |       if (format === 'json') {
197 |         printJson(graph, options.pretty);
198 |         return;
199 |       }
200 | 
201 |       if (format === 'dot') {
202 |         console.log(formatGraphDot(graph.nodes as GraphNode[]));
203 |         return;
204 |       }
205 | 
206 |       throw new Error(`Unsupported graph format: ${commandOptions.format}`);
207 |     });
208 |   });
209 | 
210 | program
211 |   .command('scaffold')
212 |   .description('Scaffold metadata, catalog entries, and docs for a prompt slug.')
213 |   .argument('<slug>', 'Prompt slug relative to the prompts directory')
214 |   .option('--fix <path>', 'Override the markdown file path to update')
215 |   .action(async (slug: string, commandOptions: { fix?: string }) => {
216 |     await withCliErrors(async () => {
217 |       const repoRoot = await findRepoRoot(process.cwd());
218 |       const promptFile = await resolvePromptFile(repoRoot, slug, commandOptions.fix);
219 |       const workflowPath = path.join(repoRoot, 'WORKFLOW.md');
220 |       const validPhases = await loadPhases(workflowPath);
221 | 
222 |       const original = await fs.readFile(promptFile.absolute, 'utf8');
223 |       const parsed = parseFrontMatter(original);
224 |       const baseMetadata: FrontMatterRecord = parsed ? { ...parsed.metadata } : {};
225 |       const body = original.slice(parsed?.endOffset ?? 0);
226 | 
227 |       const scaffold = await collectMetadataInteractively(baseMetadata, validPhases, slug);
228 |       const updatedMetadata: FrontMatterRecord = {
229 |         ...baseMetadata,
230 |         phase: scaffold.phases.length === 1 ? scaffold.phases[0] : scaffold.phases,
231 |         gate: scaffold.gate,
232 |         status: scaffold.status,
233 |         previous: scaffold.previous,
234 |         next: scaffold.next,
235 |       };
236 | 
237 |       const frontMatterBlock = formatFrontMatter(updatedMetadata);
238 |       const bodyWithoutLeadingBreak = body.replace(/^\r?\n/, '');
239 |       const updatedContent = `${frontMatterBlock}${bodyWithoutLeadingBreak}`;
240 |       if (updatedContent !== original) {
241 |         await fs.writeFile(promptFile.absolute, updatedContent, 'utf8');
242 |         console.log(`Updated ${promptFile.relative}`);
243 |       } else {
244 |         console.log(`No changes required for ${promptFile.relative}`);
245 |       }
246 | 
247 |       const title = extractTitleFromMarkdown(bodyWithoutLeadingBreak, promptFile.relative);
248 |       const primaryPhase = scaffold.phases[0] ?? '';
249 |       const metadataUpdated = await updatePromptMetadataFile(repoRoot, {
250 |         id: slugToId(slug),
251 |         title,
252 |         path: promptFile.relative,
253 |         phase: primaryPhase,
254 |         gate: scaffold.gate,
255 |       });
256 |       if (metadataUpdated) {
257 |         console.log('Updated resources/prompts.meta.yaml');
258 |       }
259 | 
260 |       const missingPhases = scaffold.phases.filter((phase) => !phaseExists(phase, validPhases));
261 |       if (missingPhases.length > 0) {
262 |         console.log(
263 |           `Phase(s) ${missingPhases.join(', ')} not found in WORKFLOW.md. Running catalog build with --update-workflow.`,
264 |         );
265 |       }
266 | 
267 |       await runValidationScripts(repoRoot, missingPhases.length > 0);
268 |     });
269 |   });
270 | 
271 | program
272 |   .command('status')
273 |   .description('Summarize task statuses and readiness information.')
274 |   .action(async () => {
275 |     await withCliErrors(async () => {
276 |       const options = getGlobalOptions();
277 |       const summary = await buildStatusSummary(toLocatorOptions(options));
278 |       printJson(summary, options.pretty);
279 |     });
280 |   });
281 | 
282 | type PromptInterface = ReturnType<typeof createInterface>;
283 | 
284 | interface PromptFileInfo {
285 |   absolute: string;
286 |   relative: string;
287 | }
288 | 
289 | interface PromptMetadataUpdate {
290 |   id: string;
291 |   title: string;
292 |   path: string;
293 |   phase: string;
294 |   gate: string;
295 | }
296 | 
297 | interface ScaffoldMetadata {
298 |   phases: string[];
299 |   gate: string;
300 |   status: string;
301 |   previous: string[];
302 |   next: string[];
303 | }
304 | 
305 | async function findRepoRoot(start: string): Promise<string> {
306 |   let current = path.resolve(start);
307 |   const { root } = path.parse(current);
308 |   while (true) {
309 |     const candidate = path.join(current, 'package.json');
310 |     try {
311 |       await fs.access(candidate);
312 |       return current;
313 |     } catch {
314 |       if (current === root) {
315 |         throw new Error('Unable to locate repository root. Run this command from within the project.');
316 |       }
317 |       current = path.dirname(current);
318 |     }
319 |   }
320 | }
321 | 
322 | async function resolvePromptFile(repoRoot: string, slug: string, overridePath?: string): Promise<PromptFileInfo> {
323 |   const targetPath = overridePath
324 |     ? path.resolve(repoRoot, overridePath)
325 |     : path.resolve(repoRoot, 'prompts', ensureMarkdownExtension(slug));
326 | 
327 |   const relative = path.relative(repoRoot, targetPath);
328 |   if (relative.startsWith('..') || path.isAbsolute(relative)) {
329 |     throw new Error('Prompt file must reside inside the repository.');
330 |   }
331 | 
332 |   try {
333 |     const stats = await fs.stat(targetPath);
334 |     if (!stats.isFile()) {
335 |       throw new Error(`Expected ${targetPath} to be a file.`);
336 |     }
337 |   } catch (error) {
338 |     if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
339 |       throw new Error(`Unable to locate prompt markdown at ${targetPath}.`);
340 |     }
341 |     throw error;
342 |   }
343 | 
344 |   return {
345 |     absolute: targetPath,
346 |     relative: toPosixPath(relative),
347 |   };
348 | }
349 | 
350 | async function collectMetadataInteractively(
351 |   metadata: FrontMatterRecord,
352 |   validPhases: Set<string>,
353 |   slug: string,
354 | ): Promise<ScaffoldMetadata> {
355 |   const rl = createInterface({ input, output });
356 |   try {
357 |     console.log(`\nScaffolding metadata for ${slug}`);
358 |     if (validPhases.size > 0) {
359 |       const phasesList = Array.from(validPhases).sort((a, b) => a.localeCompare(b));
360 |       console.log(`Available phases: ${phasesList.join(', ')}`);
361 |     }
362 |     console.log('Enter comma-separated lists for multi-value fields. Press enter to keep defaults.');
363 | 
364 |     const phases = await promptForPhases(rl, ensureArray(metadata.phase), validPhases);
365 |     const gate = await promptForString(rl, 'Gate', typeof metadata.gate === 'string' ? metadata.gate : undefined);
366 |     const status = await promptForString(
367 |       rl,
368 |       'Status',
369 |       typeof metadata.status === 'string' ? metadata.status : undefined,
370 |     );
371 |     const previous = await promptForList(rl, 'Previous commands', ensureArray(metadata.previous));
372 |     const next = await promptForList(rl, 'Next commands', ensureArray(metadata.next));
373 | 
374 |     return { phases, gate, status, previous, next };
375 |   } finally {
376 |     rl.close();
377 |   }
378 | }
379 | 
380 | async function promptForPhases(
381 |   rl: PromptInterface,
382 |   defaults: string[],
383 |   validPhases: Set<string>,
384 | ): Promise<string[]> {
385 |   while (true) {
386 |     const promptLabel = defaults.length > 0 ? `Phase [${defaults.join(', ')}]` : 'Phase';
387 |     const answer = (await rl.question(`${promptLabel}: `)).trim();
388 |     const raw = answer.length > 0 ? answer : defaults.join(',');
389 |     const values = raw
390 |       .split(',')
391 |       .map((value) => value.trim())
392 |       .filter((value) => value.length > 0);
393 |     if (values.length === 0) {
394 |       console.log('Phase is required.');
395 |       continue;
396 |     }
397 |     const missing = values.filter((phase) => !phaseExists(phase, validPhases));
398 |     if (missing.length > 0) {
399 |       console.log(`Warning: phase(s) ${missing.join(', ')} not present in WORKFLOW.md.`);
400 |     }
401 |     return values;
402 |   }
403 | }
404 | 
405 | async function promptForString(
406 |   rl: PromptInterface,
407 |   label: string,
408 |   defaultValue?: string,
409 | ): Promise<string> {
410 |   while (true) {
411 |     const promptLabel = defaultValue ? `${label} [${defaultValue}]` : label;
412 |     const answer = (await rl.question(`${promptLabel}: `)).trim();
413 |     if (answer.length > 0) {
414 |       return answer;
415 |     }
416 |     if (defaultValue && defaultValue.trim().length > 0) {
417 |       return defaultValue.trim();
418 |     }
419 |     console.log(`${label} is required.`);
420 |   }
421 | }
422 | 
423 | async function promptForList(rl: PromptInterface, label: string, defaults: string[]): Promise<string[]> {
424 |   while (true) {
425 |     const promptLabel = defaults.length > 0 ? `${label} [${defaults.join(', ')}]` : label;
426 |     const answer = (await rl.question(`${promptLabel}: `)).trim();
427 |     const raw = answer.length > 0 ? answer : defaults.join(',');
428 |     const values = raw
429 |       .split(',')
430 |       .map((value) => value.trim())
431 |       .filter((value) => value.length > 0);
432 |     if (values.length === 0) {
433 |       console.log(`${label} must include at least one entry.`);
434 |       continue;
435 |     }
436 |     return values;
437 |   }
438 | }
439 | 
440 | function phaseExists(phase: string, validPhases: Set<string>): boolean {
441 |   if (validPhases.size === 0) {
442 |     return true;
443 |   }
444 |   const normalized = phase.trim().toLowerCase();
445 |   return Array.from(validPhases).some((heading) => heading.toLowerCase().includes(normalized));
446 | }
447 | 
448 | function slugToId(slug: string): string {
449 |   const withoutExtension = slug.replace(/\.md$/i, '');
450 |   const segments = withoutExtension.split(/[\\/]+/).filter((segment) => segment.length > 0);
451 |   const rawId = segments.join('-').replace(/[^a-zA-Z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
452 |   const normalized = rawId.length > 0 ? rawId : slug.replace(/[^a-zA-Z0-9-]+/g, '-');
453 |   return normalized.toLowerCase();
454 | }
455 | 
456 | async function updatePromptMetadataFile(repoRoot: string, update: PromptMetadataUpdate): Promise<boolean> {
457 |   const metadataPath = path.join(repoRoot, 'resources', 'prompts.meta.yaml');
458 |   const original = await fs.readFile(metadataPath, 'utf8');
459 |   const { header, rest } = splitLeadingComments(original);
460 |   const parsed = rest.trim().length > 0 ? loadYaml(rest) : [];
461 |   if (parsed !== undefined && !Array.isArray(parsed)) {
462 |     throw new Error('Prompt metadata file must contain a YAML array.');
463 |   }
464 | 
465 |   const entries = Array.isArray(parsed) ? (parsed as Record<string, unknown>[]) : [];
466 |   let index = entries.findIndex((entry) => isPlainObject(entry) && entry.id === update.id);
467 |   if (index === -1) {
468 |     entries.push({});
469 |     index = entries.length - 1;
470 |   }
471 | 
472 |   const normalized = normalizeMetadataEntry(entries[index], update);
473 |   entries[index] = normalized;
474 |   entries.sort((a, b) => String(a.id).localeCompare(String(b.id)));
475 | 
476 |   const orderedEntries = entries.map(orderMetadataEntry);
477 |   const serialized = dumpYaml(orderedEntries, {
478 |     lineWidth: 120,
479 |     noRefs: true,
480 |     sortKeys: false,
481 |     quotingType: '"',
482 |   }).trimEnd();
483 | 
484 |   const headerSection = header;
485 |   const bodySection = serialized.length > 0 ? `${serialized}\n` : '';
486 |   const nextContent = `${headerSection}${bodySection}`;
487 | 
488 |   if (nextContent === original) {
489 |     return false;
490 |   }
491 | 
492 |   await fs.writeFile(metadataPath, nextContent, 'utf8');
493 |   return true;
494 | }
495 | 
496 | async function runValidationScripts(repoRoot: string, updateWorkflow: boolean): Promise<void> {
497 |   await runNpmScript(repoRoot, 'validate:metadata');
498 |   const buildArgs = updateWorkflow ? ['--', '--update-workflow'] : [];
499 |   await runNpmScript(repoRoot, 'build:catalog', buildArgs);
500 | }
501 | 
502 | async function runNpmScript(repoRoot: string, script: string, extraArgs: string[] = []): Promise<void> {
503 |   const commandArgs = ['run', script, ...extraArgs];
504 |   await new Promise<void>((resolve, reject) => {
505 |     const child = spawn('npm', commandArgs, {
506 |       cwd: repoRoot,
507 |       stdio: 'inherit',
508 |     });
509 |     child.on('error', reject);
510 |     child.on('close', (code) => {
511 |       if (code === 0) {
512 |         resolve();
513 |       } else {
514 |         reject(new Error(`npm run ${script} exited with code ${code}`));
515 |       }
516 |     });
517 |   });
518 | }
519 | 
520 | function splitLeadingComments(content: string): { header: string; rest: string } {
521 |   const match = content.match(/^(?:#.*\r?\n)*/);
522 |   const header = match ? match[0] : '';
523 |   const rest = content.slice(header.length);
524 |   return { header, rest };
525 | }
526 | 
527 | function normalizeMetadataEntry(
528 |   existing: unknown,
529 |   update: PromptMetadataUpdate,
530 | ): Record<string, unknown> {
531 |   const base = isPlainObject(existing) ? { ...existing } : {};
532 |   base.id = update.id;
533 |   base.title = update.title;
534 |   base.path = toPosixPath(update.path);
535 |   base.phase = update.phase;
536 |   base.gate = update.gate;
537 |   if (typeof base.description !== 'string') {
538 |     base.description = '';
539 |   }
540 |   base.tags = normalizeStringArray(base.tags);
541 |   base.dependsOn = normalizeStringArray(base.dependsOn);
542 |   base.variables = Array.isArray(base.variables) ? base.variables : [];
543 |   return base;
544 | }
545 | 
546 | function orderMetadataEntry(entry: Record<string, unknown>): Record<string, unknown> {
547 |   const ordered: Record<string, unknown> = {};
548 |   const priority = ['id', 'title', 'description', 'path', 'phase', 'gate', 'tags', 'dependsOn', 'variables'];
549 |   for (const key of priority) {
550 |     if (entry[key] !== undefined) {
551 |       ordered[key] = entry[key];
552 |     }
553 |   }
554 |   for (const [key, value] of Object.entries(entry)) {
555 |     if (ordered[key] !== undefined) {
556 |       continue;
557 |     }
558 |     ordered[key] = value;
559 |   }
560 |   return ordered;
561 | }
562 | 
563 | function normalizeStringArray(value: unknown): string[] {
564 |   if (!Array.isArray(value)) {
565 |     return [];
566 |   }
567 |   return value
568 |     .map((item) => (typeof item === 'string' ? item : String(item)))
569 |     .map((item) => item.trim())
570 |     .filter((item) => item.length > 0);
571 | }
572 | 
573 | function isPlainObject(value: unknown): value is Record<string, any> {
574 |   return !!value && typeof value === 'object' && !Array.isArray(value);
575 | }
576 | 
577 | function toPosixPath(filePath: string): string {
578 |   return filePath.split(path.sep).join('/');
579 | }
580 | 
581 | function ensureMarkdownExtension(slug: string): string {
582 |   return slug.endsWith('.md') ? slug : `${slug}.md`;
583 | }
584 | 
585 | program
586 |   .command('help', { isDefault: false })
587 |   .description('Display CLI help information.')
588 |   .action(() => {
589 |     program.help();
590 |   });
591 | 
592 | program.parseAsync(process.argv).catch((error) => {
593 |   printError(error);
594 |   process.exitCode = 1;
595 | });
```

src/enrichment/index.ts
```
1 | import type { PromptsTask } from '../types/prompts-task.js';
2 | import { readFile } from 'node:fs/promises';
3 | import { join } from 'node:path';
4 | 
5 | export interface EnrichmentWarning { message: string }
6 | 
7 | export interface EnrichmentResult {
8 |   tasks: PromptsTask[];
9 |   warnings: EnrichmentWarning[];
10 | }
11 | 
12 | type Enricher = (tasks: PromptsTask[], projectRoot: string) => Promise<{ tasks: PromptsTask[]; warnings: EnrichmentWarning[] }>;
13 | 
14 | async function enrichWithComplexity(tasks: PromptsTask[], projectRoot: string) {
15 |   const warnings: EnrichmentWarning[] = [];
16 |   const out = tasks.map(t => ({ ...t, metadata: t.metadata ? { ...t.metadata } : undefined }));
17 |   try {
18 |     const path = join(projectRoot, 'artifacts', 'complexity.json');
19 |     const raw = await readFile(path, 'utf8');
20 |     const table = JSON.parse(raw) as Record<string, unknown>;
21 |     for (const task of out) {
22 |       const key = String(task.id);
23 |       if (Object.prototype.hasOwnProperty.call(table, key)) {
24 |         const entry = (table as Record<string, unknown>)[key];
25 |         const meta = task.metadata ?? (task.metadata = {});
26 |         (meta as Record<string, unknown>).enrichment = {
27 |           ...(meta as Record<string, unknown>).enrichment as Record<string, unknown> | undefined,
28 |           complexity: entry,
29 |         };
30 |       }
31 |     }
32 |   } catch (err) {
33 |     warnings.push({ message: `complexity enrichment skipped: ${(err as Error).message}` });
34 |   }
35 |   return { tasks: out, warnings };
36 | }
37 | 
38 | const ENRICHERS: Enricher[] = [enrichWithComplexity];
39 | 
40 | export async function enrichTasks(tasks: PromptsTask[], projectRoot: string): Promise<EnrichmentResult> {
41 |   let current = tasks.map((t) => ({ ...t, subtasks: t.subtasks.map(s => ({ ...s })) }));
42 |   const warnings: EnrichmentWarning[] = [];
43 |   for (const enricher of ENRICHERS) {
44 |     try {
45 |       const res = await enricher(current, projectRoot);
46 |       current = res.tasks;
47 |       warnings.push(...res.warnings);
48 |     } catch (err) {
49 |       warnings.push({ message: `enricher failed: ${(err as Error).message}` });
50 |     }
51 |   }
52 |   return { tasks: current, warnings };
53 | }
54 | 
```

src/mcp/server.ts
```
1 | #!/usr/bin/env node
2 | // (no require needed)
3 | import { resolve } from 'node:path';
4 | import process from 'node:process';
5 | import { pathToFileURL } from 'node:url';
6 | 
7 | import { Command } from 'commander';
8 | import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
9 | 
10 | import { createSecureLogger, logger as baseLogger } from '../logger.js';
11 | import { TaskService } from './task-service.js';
12 | import { StateStore } from '../state/StateStore.js';
13 | import { createServer, connectServer } from '../server.js';
14 | import { registerAllTools } from '../tools/index.js';
15 | 
16 | 
17 | export interface TaskServerOptions {
18 |   tasksPath: string;
19 |   tag: string;
20 |   writeEnabled: boolean;
21 | }
22 | 
23 | export interface StartServerOptions extends TaskServerOptions {
24 |   transport?: StdioServerTransport;
25 | }
26 | 
27 | const secureLogger = createSecureLogger(baseLogger);
28 | 
29 | export const createTaskService = (options: TaskServerOptions): TaskService => {
30 |   return new TaskService({
31 |     tasksPath: options.tasksPath,
32 |     tag: options.tag,
33 |     writeEnabled: options.writeEnabled
34 |   });
35 | };
36 | 
37 | export const startServer = async (options: StartServerOptions): Promise<{ server: ReturnType<typeof createServer>; transport: StdioServerTransport }> => {
38 |   const transport = options.transport ?? new StdioServerTransport();
39 | 
40 |   const service = createTaskService(options);
41 |   await service.load();
42 | 
43 |   const server = createServer();
44 | 
45 |   // Initialize StateStore for workflow tools
46 |   const stateStore = new StateStore(process.cwd());
47 |   await stateStore.load();
48 | 
49 |   // Register all tools from a single hub
50 |   await registerAllTools(server, secureLogger, { service, stateStore });
51 | 
52 |   transport.onerror = (error) => {
53 |     secureLogger.error('transport_error', { error });
54 |   };
55 | 
56 |   transport.onclose = () => {
57 |     secureLogger.info('transport_closed');
58 |   };
59 | 
60 |   await connectServer(server, transport);
61 | 
62 |   secureLogger.info('server_started', {
63 |     tasksPath: options.tasksPath,
64 |     tag: options.tag,
65 |     writeEnabled: options.writeEnabled
66 |   });
67 | 
68 |   const shutdown = async (signal: string): Promise<void> => {
69 |     secureLogger.info('server_shutdown_signal', { signal });
70 |     try {
71 |       await server.close();
72 |       await transport.close();
73 |     } catch (error) {
74 |       secureLogger.error('server_shutdown_error', { error });
75 |     } finally {
76 |       process.exit(0);
77 |     }
78 |   };
79 | 
80 |   process.on('SIGINT', () => {
81 |     void shutdown('SIGINT');
82 |   });
83 |   process.on('SIGTERM', () => {
84 |     void shutdown('SIGTERM');
85 |   });
86 | 
87 |   process.on('uncaughtException', (error) => {
88 |     secureLogger.error('uncaught_exception', { error });
89 |     void shutdown('uncaughtException');
90 |   });
91 | 
92 |   process.on('unhandledRejection', (reason) => {
93 |     secureLogger.error('unhandled_rejection', { reason });
94 |     void shutdown('unhandledRejection');
95 |   });
96 | 
97 |   return { server, transport };
98 | };
99 | 
100 | const buildCli = (): Command => {
101 |   const program = new Command();
102 | 
103 |   program
104 |     .name('prompts-mcp-server')
105 |     .description('Expose task management helpers over the Model Context Protocol stdio transport.')
106 |     .option('--tasks <path>', 'Path to Task-Master tasks.json', '.taskmaster/tasks/tasks.json')
107 |     .option('--tag <tag>', 'Task-Master tag to load', 'master')
108 |     .option('--write-enabled', 'Persist task status changes to disk', false)
109 |     .option('--exec-enabled', 'Enable execution of allowlisted scripts via workflow tools', false)
110 |     .option('--verbose', 'Emit verbose structured logs to stderr', false)
111 |     .option('--unsafe-logs', 'Disable metadata redaction (not recommended)', false);
112 | 
113 |   return program;
114 | };
115 | 
116 | const runCli = async (): Promise<void> => {
117 |   const program = buildCli();
118 |   const parsed = program.parse(process.argv);
119 |   const opts = parsed.opts<{ tasks: string; tag: string; writeEnabled: boolean; verbose?: boolean; unsafeLogs?: boolean }>();
120 | 
121 |   const tasksPath = resolve(process.cwd(), opts.tasks);
122 | 
123 |   try {
124 |     if (parsed.opts<{ execEnabled?: boolean }>().execEnabled) {
125 |       process.env.PROMPTS_EXEC_ALLOW = '1';
126 |       secureLogger.warn('exec_enabled', { via: '--exec-enabled' });
127 |     }
128 |     if (opts.verbose) {
129 |       secureLogger.info('verbose_mode_enabled');
130 |     }
131 |     await startServer({
132 |       tasksPath,
133 |       tag: opts.tag,
134 |       writeEnabled: Boolean(opts.writeEnabled)
135 |     });
136 |   } catch (error) {
137 |     secureLogger.error('server_start_failed', { error });
138 |     process.exitCode = 1;
139 |   }
140 | };
141 | 
142 | const entryUrl = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : undefined;
143 | 
144 | if (entryUrl === import.meta.url) {
145 |   void runCli();
146 | }
```

src/mcp/task-service.d.ts
```
1 | import { type CanonicalTaskStatus, type PromptsTask, type TaskPriority } from '../types/prompts-task.js';
2 | export interface TaskRepositoryOptions {
3 |     tasksPath: string;
4 |     tag: string;
5 | }
6 | interface GraphNode {
7 |     id: number;
8 |     title: string;
9 |     status: CanonicalTaskStatus;
10 |     priority: TaskPriority;
11 |     dependencies: number[];
12 | }
13 | export interface TaskServiceOptions extends TaskRepositoryOptions {
14 |     writeEnabled: boolean;
15 | }
16 | export interface SetTaskStatusResult {
17 |     task: PromptsTask;
18 |     persisted: boolean;
19 | }
20 | export declare class TaskService {
21 |     private readonly repository;
22 |     private readonly writeEnabled;
23 |     constructor(options: TaskServiceOptions);
24 |     load(): Promise<void>;
25 |     list(): PromptsTask[];
26 |     get(id: number): PromptsTask | undefined;
27 |     next(): PromptsTask | null;
28 |     graph(): {
29 |         nodes: GraphNode[];
30 |     };
31 |     setStatus(id: number, status: CanonicalTaskStatus): Promise<SetTaskStatusResult>;
32 | }
33 | export declare const computeReadyTasks: (tasks: PromptsTask[]) => PromptsTask[];
34 | export {};
```

src/mcp/task-service.js
```
1 | import { readFile, writeFile, rename, unlink } from 'node:fs/promises';
2 | import { resolve } from 'node:path';
3 | import { ingestTasks, TaskIngestError, TaskValidationError } from '../adapters/taskmaster/ingest.js';
4 | import { computeReadiness, next as selectNext } from '../state/graph.js';
5 | import { advance } from '../state/update.js';
6 | const ensureArray = (value, errorMessage) => {
7 |     if (!Array.isArray(value)) {
8 |         throw new TaskIngestError(errorMessage, { value });
9 |     }
10 |     return value;
11 | };
12 | const isRecord = (value) => !!value && typeof value === 'object';
13 | class TaskRepository {
14 |     tasksPath;
15 |     tag;
16 |     rawDocument = null;
17 |     rawTasks = [];
18 |     rawTaskById = new Map();
19 |     tasks = [];
20 |     constructor(options) {
21 |         this.tasksPath = resolve(options.tasksPath);
22 |         this.tag = options.tag;
23 |     }
24 |     async load() {
25 |         const raw = await readFile(this.tasksPath, 'utf8');
26 |         this.rawDocument = JSON.parse(raw);
27 |         this.rawTasks = this.extractRawTasks(this.rawDocument);
28 |         this.rawTaskById = new Map();
29 |         for (const entry of this.rawTasks) {
30 |             const id = entry.id;
31 |             if (typeof id === 'number' && Number.isInteger(id)) {
32 |                 this.rawTaskById.set(id, entry);
33 |             }
34 |         }
35 |         const { tasks } = await ingestTasks(this.tasksPath, { tag: this.tag });
36 |         this.tasks = tasks;
37 |     }
38 |     list() {
39 |         return this.tasks.map((task) => ({ ...task, subtasks: task.subtasks.map((subtask) => ({ ...subtask })) }));
40 |     }
41 |     getById(id) {
42 |         return this.tasks.find((task) => task.id === id);
43 |     }
44 |     getNext() {
45 |         return selectNext(this.tasks);
46 |     }
47 |     getGraph() {
48 |         return this.tasks.map((task) => ({
49 |             id: task.id,
50 |             title: task.title,
51 |             status: task.status,
52 |             priority: task.priority,
53 |             dependencies: [...task.dependencies]
54 |         }));
55 |     }
56 |     applyStatusUpdate(id, status) {
57 |         this.tasks = advance(this.tasks, id, status);
58 |         const updated = this.getById(id);
59 |         if (!updated) {
60 |             throw new Error(`Task ${id} missing after update`);
61 |         }
62 |         const raw = this.rawTaskById.get(id);
63 |         if (raw) {
64 |             raw.status = status;
65 |         }
66 |         return updated;
67 |     }
68 |     async persist() {
69 |         if (!this.rawDocument) {
70 |             throw new Error('Task repository not loaded.');
71 |         }
72 |         const payload = `${JSON.stringify(this.rawDocument, null, 2)}\n`;
73 |         const tempPath = `${this.tasksPath}.${Date.now()}.tmp`;
74 |         await writeFile(tempPath, payload, 'utf8');
75 |         try {
76 |             await rename(tempPath, this.tasksPath);
77 |         }
78 |         catch (error) {
79 |             await unlink(tempPath).catch(() => {
80 |                 /* ignore */
81 |             });
82 |             throw error;
83 |         }
84 |     }
85 |     extractRawTasks(document) {
86 |         if (Array.isArray(document)) {
87 |             return ensureArray(document, 'tasks.json root must be an array for legacy format');
88 |         }
89 |         if (!isRecord(document)) {
90 |             throw new TaskIngestError('tasks.json must be an object or array at the root', { document });
91 |         }
92 |         const tagEntry = document[this.tag];
93 |         if (Array.isArray(tagEntry)) {
94 |             return ensureArray(tagEntry, 'Tag entry must be an array of tasks.');
95 |         }
96 |         if (isRecord(tagEntry)) {
97 |             const tasks = tagEntry.tasks;
98 |             const taskArray = ensureArray(tasks, 'Tag entry must contain a tasks array.');
99 |             return taskArray;
100 |         }
101 |         const tasks = document.tasks;
102 |         if (Array.isArray(tasks)) {
103 |             return ensureArray(tasks, 'Root tasks entry must be an array.');
104 |         }
105 |         throw new TaskIngestError('Unable to locate tasks array in tasks.json', {
106 |             keys: Object.keys(document)
107 |         });
108 |     }
109 | }
110 | export class TaskService {
111 |     repository;
112 |     writeEnabled;
113 |     constructor(options) {
114 |         this.repository = new TaskRepository(options);
115 |         this.writeEnabled = options.writeEnabled;
116 |     }
117 |     async load() {
118 |         await this.repository.load();
119 |     }
120 |     list() {
121 |         return this.repository.list();
122 |     }
123 |     get(id) {
124 |         return this.repository.getById(id);
125 |     }
126 |     next() {
127 |         return this.repository.getNext();
128 |     }
129 |     graph() {
130 |         return { nodes: this.repository.getGraph() };
131 |     }
132 |     async setStatus(id, status) {
133 |         if (!this.writeEnabled) {
134 |             const task = this.repository.getById(id);
135 |             if (!task) {
136 |                 throw new TaskValidationError(`Task with id ${id} not found`, {
137 |                     taskId: id,
138 |                     errors: []
139 |                 });
140 |             }
141 |             return { task, persisted: false };
142 |         }
143 |         const updated = this.repository.applyStatusUpdate(id, status);
144 |         await this.repository.persist();
145 |         return { task: updated, persisted: true };
146 |     }
147 | }
148 | export const computeReadyTasks = (tasks) => computeReadiness(tasks);
```

src/mcp/task-service.ts
```
1 | import { readFile, writeFile, rename, unlink } from 'node:fs/promises';
2 | import { dirname, resolve } from 'node:path';
3 | 
4 | import {
5 |   type CanonicalTaskStatus,
6 |   type PromptsTask,
7 |   type TaskPriority
8 | } from '../types/prompts-task.js';
9 | import {
10 |   ingestTasks,
11 |   TaskIngestError,
12 |   TaskValidationError
13 | } from '../adapters/taskmaster/ingest.js';
14 | import { computeReadiness, next as selectNext } from '../state/graph.js';
15 | import { advance } from '../state/update.js';
16 | 
17 | export interface TaskRepositoryOptions {
18 |   tasksPath: string;
19 |   tag: string;
20 | }
21 | 
22 | type RawDocument = Record<string, unknown> | unknown[];
23 | 
24 | interface GraphNode {
25 |   id: number;
26 |   title: string;
27 |   status: CanonicalTaskStatus;
28 |   priority: TaskPriority;
29 |   dependencies: number[];
30 | }
31 | 
32 | const ensureArray = <T>(value: unknown, errorMessage: string): T[] => {
33 |   if (!Array.isArray(value)) {
34 |     throw new TaskIngestError(errorMessage, { value });
35 |   }
36 |   return value as T[];
37 | };
38 | 
39 | const isRecord = (value: unknown): value is Record<string, unknown> =>
40 |   !!value && typeof value === 'object';
41 | 
42 | class TaskRepository {
43 |   private readonly tasksPath: string;
44 |   private readonly tag: string;
45 |   private rawDocument: RawDocument | null = null;
46 |   private rawTasks: Record<string, unknown>[] = [];
47 |   private rawTaskById = new Map<number, Record<string, unknown>>();
48 |   private tasks: PromptsTask[] = [];
49 | 
50 |   constructor(options: TaskRepositoryOptions) {
51 |     this.tasksPath = resolve(options.tasksPath);
52 |     this.tag = options.tag;
53 |   }
54 | 
55 |   async load(): Promise<void> {
56 |     const raw = await readFile(this.tasksPath, 'utf8');
57 |     this.rawDocument = JSON.parse(raw) as RawDocument;
58 |     this.rawTasks = this.extractRawTasks(this.rawDocument);
59 |     this.rawTaskById = new Map();
60 | 
61 |     for (const entry of this.rawTasks) {
62 |       const id = entry.id;
63 |       if (typeof id === 'number' && Number.isInteger(id)) {
64 |         this.rawTaskById.set(id, entry);
65 |       }
66 |     }
67 | 
68 |     const { tasks } = await ingestTasks(this.tasksPath, { tag: this.tag });
69 |     this.tasks = tasks;
70 |   }
71 | 
72 |   list(): PromptsTask[] {
73 |     return this.tasks.map((task) => ({ ...task, subtasks: task.subtasks.map((subtask) => ({ ...subtask })) }));
74 |   }
75 | 
76 |   getById(id: number): PromptsTask | undefined {
77 |     return this.tasks.find((task) => task.id === id);
78 |   }
79 | 
80 |   getNext(): PromptsTask | null {
81 |     return selectNext(this.tasks);
82 |   }
83 | 
84 |   getGraph(): GraphNode[] {
85 |     return this.tasks.map((task) => ({
86 |       id: task.id,
87 |       title: task.title,
88 |       status: task.status,
89 |       priority: task.priority,
90 |       dependencies: [...task.dependencies]
91 |     }));
92 |   }
93 | 
94 |   applyStatusUpdate(id: number, status: CanonicalTaskStatus): PromptsTask {
95 |     this.tasks = advance(this.tasks, id, status);
96 |     const updated = this.getById(id);
97 |     if (!updated) {
98 |       throw new Error(`Task ${id} missing after update`);
99 |     }
100 | 
101 |     const raw = this.rawTaskById.get(id);
102 |     if (raw) {
103 |       raw.status = status;
104 |     }
105 | 
106 |     return updated;
107 |   }
108 | 
109 |   async persist(): Promise<void> {
110 |     if (!this.rawDocument) {
111 |       throw new Error('Task repository not loaded.');
112 |     }
113 | 
114 |     const payload = `${JSON.stringify(this.rawDocument, null, 2)}\n`;
115 |     const tempPath = `${this.tasksPath}.${Date.now()}.tmp`;
116 | 
117 |     await writeFile(tempPath, payload, 'utf8');
118 | 
119 |     try {
120 |       await rename(tempPath, this.tasksPath);
121 |     } catch (error) {
122 |       await unlink(tempPath).catch(() => {
123 |         /* ignore */
124 |       });
125 |       throw error;
126 |     }
127 |   }
128 | 
129 |   private extractRawTasks(document: RawDocument): Record<string, unknown>[] {
130 |     if (Array.isArray(document)) {
131 |       return ensureArray<Record<string, unknown>>(document, 'tasks.json root must be an array for legacy format');
132 |     }
133 | 
134 |     if (!isRecord(document)) {
135 |       throw new TaskIngestError('tasks.json must be an object or array at the root', { document });
136 |     }
137 | 
138 |     const tagEntry = document[this.tag];
139 |     if (Array.isArray(tagEntry)) {
140 |       return ensureArray<Record<string, unknown>>(tagEntry, 'Tag entry must be an array of tasks.');
141 |     }
142 | 
143 |     if (isRecord(tagEntry)) {
144 |       const tasks = tagEntry.tasks;
145 |       const taskArray = ensureArray<Record<string, unknown>>(tasks, 'Tag entry must contain a tasks array.');
146 |       return taskArray;
147 |     }
148 | 
149 |     const tasks = document.tasks;
150 |     if (Array.isArray(tasks)) {
151 |       return ensureArray<Record<string, unknown>>(tasks, 'Root tasks entry must be an array.');
152 |     }
153 | 
154 |     throw new TaskIngestError('Unable to locate tasks array in tasks.json', {
155 |       keys: Object.keys(document)
156 |     });
157 |   }
158 | }
159 | 
160 | export interface TaskServiceOptions extends TaskRepositoryOptions {
161 |   writeEnabled: boolean;
162 | }
163 | 
164 | export interface SetTaskStatusResult {
165 |   task: PromptsTask;
166 |   persisted: boolean;
167 | }
168 | 
169 | export class TaskService {
170 |   private readonly repository: TaskRepository;
171 |   private readonly writeEnabled: boolean;
172 | 
173 |   constructor(options: TaskServiceOptions) {
174 |     this.repository = new TaskRepository(options);
175 |     this.writeEnabled = options.writeEnabled;
176 |   }
177 | 
178 |   async load(): Promise<void> {
179 |     await this.repository.load();
180 |   }
181 | 
182 |   list(): PromptsTask[] {
183 |     return this.repository.list();
184 |   }
185 | 
186 |   get(id: number): PromptsTask | undefined {
187 |     return this.repository.getById(id);
188 |   }
189 | 
190 |   next(): PromptsTask | null {
191 |     return this.repository.getNext();
192 |   }
193 | 
194 |   graph(): { nodes: GraphNode[] } {
195 |     return { nodes: this.repository.getGraph() };
196 |   }
197 | 
198 |   async setStatus(id: number, status: CanonicalTaskStatus): Promise<SetTaskStatusResult> {
199 |     if (!this.writeEnabled) {
200 |       const task = this.repository.getById(id);
201 |       if (!task) {
202 |         throw new TaskValidationError(`Task with id ${id} not found`, {
203 |           taskId: id,
204 |           errors: []
205 |         });
206 |       }
207 |       return { task, persisted: false };
208 |     }
209 | 
210 |     const updated = this.repository.applyStatusUpdate(id, status);
211 |     await this.repository.persist();
212 |     return { task: updated, persisted: true };
213 |   }
214 | }
215 | 
216 | export const computeReadyTasks = (tasks: PromptsTask[]): PromptsTask[] => computeReadiness(tasks);
```

src/prompts/loader.test.ts
```
1 | import { strict as assert } from "node:assert";
2 | import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
3 | import path from "node:path";
4 | import os from "node:os";
5 | 
6 | import { describe, test } from "@jest/globals";
7 | 
8 | import { loadPromptMetadata, preparePromptResources } from "./loader.ts";
9 | 
10 | const FIXTURE_MARKDOWN = `# Sample Prompt\n\nContent body.\n`;
11 | 
12 | const createFixture = () => {
13 |   const tempDir = mkdtempSync(path.join(os.tmpdir(), "prompt-meta-"));
14 |   const markdownPath = path.join(tempDir, "sample.md");
15 |   writeFileSync(markdownPath, FIXTURE_MARKDOWN, "utf8");
16 | 
17 |   const metadataPath = path.join(tempDir, "prompts.meta.yaml");
18 |   writeFileSync(
19 |     metadataPath,
20 |     `- id: sample\n  title: Sample Prompt\n  description: Example description\n  path: sample.md\n  phase: P0\n  gate: Test Gate\n  tags:\n    - alpha\n    - beta\n  dependsOn: []\n  variables:\n    - name: input\n      description: Optional input\n      type: string\n      required: false\n`,
21 |     "utf8",
22 |   );
23 | 
24 |   return { tempDir, metadataPath };
25 | };
26 | 
27 | describe("prompt loader", () => {
28 |   test("loads metadata and prepares prompt resources", () => {
29 |     const { tempDir, metadataPath } = createFixture();
30 |     try {
31 |       const metadata = loadPromptMetadata({ metadataPath, baseDir: tempDir });
32 |       assert.equal(metadata.length, 1);
33 |       const definition = metadata[0];
34 |       assert.equal(definition.id, "sample");
35 |       assert.equal(definition.title, "Sample Prompt");
36 |       assert.equal(definition.description, "Example description");
37 |       assert.equal(definition.path, "sample.md");
38 |       assert.deepEqual(definition.tags, ["alpha", "beta"]);
39 |       assert.deepEqual(definition.dependsOn, []);
40 |       assert.deepEqual(definition.variables, [
41 |         {
42 |           name: "input",
43 |           description: "Optional input",
44 |           type: "string",
45 |           required: false,
46 |         },
47 |       ]);
48 | 
49 |       const resources = preparePromptResources(metadata, {
50 |         baseDir: tempDir,
51 |         previewLimit: 10,
52 |       });
53 |       assert.equal(resources.length, 1);
54 |       const resource = resources[0];
55 |       assert.match(resource.uri, /^file:\/\//);
56 |       assert.equal(resource.metadata.name, "sample");
57 |       assert.equal(resource.metadata.title, "Sample Prompt");
58 |       assert.equal(resource.metadata.mimeType, "text/markdown");
59 |       const meta = resource.metadata._meta as Record<string, unknown>;
60 |       assert.ok(meta);
61 |       assert.equal(typeof meta.contentPreview, "string");
62 |       assert.ok((meta.contentPreview as string).length > 0);
63 |     } finally {
64 |       rmSync(tempDir, { recursive: true, force: true });
65 |     }
66 |   });
67 | });
```

src/prompts/loader.ts
```
1 | import { readFileSync } from "node:fs";
2 | import path from "node:path";
3 | import { pathToFileURL } from "node:url";
4 | 
5 | import yaml from "js-yaml";
6 | 
7 | import { capPayload } from "../utils/safety.js";
8 | 
9 | export interface PromptVariable {
10 |   name: string;
11 |   description?: string;
12 |   type?: string;
13 |   required?: boolean;
14 | }
15 | 
16 | export interface PromptDefinition {
17 |   id: string;
18 |   title: string;
19 |   description?: string;
20 |   path: string;
21 |   phase?: string;
22 |   gate?: string;
23 |   tags?: string[];
24 |   dependsOn?: string[];
25 |   variables?: PromptVariable[];
26 | }
27 | 
28 | export interface PromptResource {
29 |   id: string;
30 |   uri: string;
31 |   filePath: string;
32 |   metadata: {
33 |     name: string;
34 |     title?: string;
35 |     description?: string;
36 |     mimeType: string;
37 |     _meta?: Record<string, unknown>;
38 |   };
39 | }
40 | 
41 | export interface LoadPromptMetadataOptions {
42 |   metadataPath?: string;
43 |   baseDir?: string;
44 | }
45 | 
46 | export interface PreparePromptResourcesOptions {
47 |   baseDir?: string;
48 |   previewLimit?: number;
49 | }
50 | 
51 | const DEFAULT_METADATA_RELATIVE_PATH = path.join("resources", "prompts.meta.yaml");
52 | const DEFAULT_PREVIEW_LIMIT = 4 * 1024; // 4 KiB for list previews.
53 | 
54 | const isRecord = (input: unknown): input is Record<string, unknown> => {
55 |   return typeof input === "object" && input !== null;
56 | };
57 | 
58 | const asStringArray = (value: unknown, fieldName: string): string[] => {
59 |   if (value === undefined) {
60 |     return [];
61 |   }
62 |   if (!Array.isArray(value)) {
63 |     throw new Error(`Expected \"${fieldName}\" to be an array of strings.`);
64 |   }
65 |   const result: string[] = [];
66 |   for (const entry of value) {
67 |     if (typeof entry !== "string" || entry.trim() === "") {
68 |       throw new Error(`Expected \"${fieldName}\" to contain non-empty strings.`);
69 |     }
70 |     result.push(entry.trim());
71 |   }
72 |   return result;
73 | };
74 | 
75 | const asVariableArray = (value: unknown): PromptVariable[] => {
76 |   if (value === undefined) {
77 |     return [];
78 |   }
79 |   if (!Array.isArray(value)) {
80 |     throw new Error("Expected \"variables\" to be an array of objects.");
81 |   }
82 |   return value.map((item, index) => {
83 |     if (!isRecord(item)) {
84 |       throw new Error(`Expected variable at index ${index} to be an object.`);
85 |     }
86 |     const { name, description, type, required } = item;
87 |     if (typeof name !== "string" || name.trim() === "") {
88 |       throw new Error(`Variable at index ${index} is missing a valid \"name\".`);
89 |     }
90 |     if (description !== undefined && typeof description !== "string") {
91 |       throw new Error(`Variable \"${name}\" has an invalid description.`);
92 |     }
93 |     if (type !== undefined && typeof type !== "string") {
94 |       throw new Error(`Variable \"${name}\" has an invalid type.`);
95 |     }
96 |     if (required !== undefined && typeof required !== "boolean") {
97 |       throw new Error(`Variable \"${name}\" has an invalid required flag.`);
98 |     }
99 |     return {
100 |       name: name.trim(),
101 |       description: description?.trim(),
102 |       type: type?.trim(),
103 |       required,
104 |     } satisfies PromptVariable;
105 |   });
106 | };
107 | 
108 | const resolveMetadataPath = ({ metadataPath, baseDir }: LoadPromptMetadataOptions = {}): string => {
109 |   const cwd = baseDir ?? process.cwd();
110 |   const relativePath = metadataPath ?? DEFAULT_METADATA_RELATIVE_PATH;
111 |   return path.isAbsolute(relativePath) ? relativePath : path.resolve(cwd, relativePath);
112 | };
113 | 
114 | export function loadPromptMetadata(options: LoadPromptMetadataOptions = {}): PromptDefinition[] {
115 |   const absolutePath = resolveMetadataPath(options);
116 |   let raw: string;
117 |   try {
118 |     raw = readFileSync(absolutePath, "utf8");
119 |   } catch (error) {
120 |     throw new Error(`Failed to read prompt metadata at ${absolutePath}: ${(error as Error).message}`);
121 |   }
122 | 
123 |   let parsed: unknown;
124 |   try {
125 |     parsed = yaml.load(raw);
126 |   } catch (error) {
127 |     throw new Error(`Failed to parse prompt metadata at ${absolutePath}: ${(error as Error).message}`);
128 |   }
129 | 
130 |   if (!Array.isArray(parsed)) {
131 |     throw new Error("Prompt metadata file must contain a top-level array.");
132 |   }
133 | 
134 |   return parsed.map((entry, index) => {
135 |     if (!isRecord(entry)) {
136 |       throw new Error(`Prompt metadata entry at index ${index} is not an object.`);
137 |     }
138 | 
139 |     const { id, title, description, path: filePath, phase, gate, tags, dependsOn, variables } = entry;
140 | 
141 |     if (typeof id !== "string" || id.trim() === "") {
142 |       throw new Error(`Prompt metadata entry at index ${index} is missing an \"id\".`);
143 |     }
144 |     if (typeof title !== "string" || title.trim() === "") {
145 |       throw new Error(`Prompt metadata entry \"${id}\" is missing a \"title\".`);
146 |     }
147 |     if (typeof filePath !== "string" || filePath.trim() === "") {
148 |       throw new Error(`Prompt metadata entry \"${id}\" is missing a \"path\" to the markdown file.`);
149 |     }
150 | 
151 |     return {
152 |       id: id.trim(),
153 |       title: title.trim(),
154 |       description: typeof description === "string" ? description.trim() : undefined,
155 |       path: filePath.trim(),
156 |       phase: typeof phase === "string" ? phase.trim() : undefined,
157 |       gate: typeof gate === "string" ? gate.trim() : undefined,
158 |       tags: asStringArray(tags, "tags"),
159 |       dependsOn: asStringArray(dependsOn, "dependsOn"),
160 |       variables: asVariableArray(variables),
161 |     } satisfies PromptDefinition;
162 |   });
163 | }
164 | 
165 | export const loadPromptDefinitions = loadPromptMetadata;
166 | 
167 | export function preparePromptResources(
168 |   definitions: PromptDefinition[],
169 |   options: PreparePromptResourcesOptions = {},
170 | ): PromptResource[] {
171 |   const baseDir = options.baseDir ?? process.cwd();
172 |   const previewLimit = options.previewLimit ?? DEFAULT_PREVIEW_LIMIT;
173 | 
174 |   return definitions.map((definition) => {
175 |     const absolutePath = path.isAbsolute(definition.path)
176 |       ? definition.path
177 |       : path.resolve(baseDir, definition.path);
178 | 
179 |     let previewText: string;
180 |     try {
181 |       const fileContent = readFileSync(absolutePath, "utf8");
182 |       previewText = capPayload(fileContent, previewLimit);
183 |     } catch (error) {
184 |       throw new Error(`Failed to read prompt file for \"${definition.id}\": ${(error as Error).message}`);
185 |     }
186 | 
187 |     const uri = pathToFileURL(absolutePath).href;
188 | 
189 |     return {
190 |       id: definition.id,
191 |       uri,
192 |       filePath: absolutePath,
193 |       metadata: {
194 |         name: definition.id,
195 |         title: definition.title,
196 |         description: definition.description,
197 |         mimeType: "text/markdown",
198 |         _meta: {
199 |           contentPreview: previewText,
200 |           phase: definition.phase,
201 |           gate: definition.gate,
202 |           tags: definition.tags,
203 |           dependsOn: definition.dependsOn,
204 |         },
205 |       },
206 |     } satisfies PromptResource;
207 |   });
208 | }
```

src/prompts/register.ts
```
1 | import { readFile } from "node:fs/promises";
2 | 
3 | import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
4 | 
5 | import { capPayload } from "../utils/safety.js";
6 | import { SecureLogger } from "../logger.js";
7 | import {
8 |   loadPromptMetadata,
9 |   loadPromptDefinitions,
10 |   preparePromptResources,
11 |   LoadPromptMetadataOptions,
12 |   PreparePromptResourcesOptions,
13 |   PromptDefinition,
14 | } from "./loader.js";
15 | import { createPromptToolHandler, DEFAULT_TOOL_PAYLOAD_LIMIT } from "../tools/prompt-handler.js";
16 | import { generateToolSchemas } from "./schema.js";
17 | 
18 | export interface RegisterPromptResourcesOptions
19 |   extends LoadPromptMetadataOptions,
20 |     PreparePromptResourcesOptions {
21 |   payloadLimit?: number;
22 | }
23 | 
24 | const DEFAULT_PAYLOAD_LIMIT = 1024 * 1024; // 1 MiB cap to satisfy MCP spec guidance.
25 | 
26 | export interface RegisterPromptToolsOptions extends LoadPromptMetadataOptions {
27 |   payloadLimit?: number;
28 |   baseDir?: string;
29 | }
30 | 
31 | export async function registerPromptResources(
32 |   server: McpServer,
33 |   logger: SecureLogger,
34 |   options: RegisterPromptResourcesOptions = {},
35 | ): Promise<void> {
36 |   const definitions = resolveDefinitions(logger, options, loadPromptMetadata);
37 | 
38 |   if (definitions.length === 0) {
39 |     logger.warn("prompt_metadata_empty", {
40 |       metadataPath: options.metadataPath,
41 |     });
42 |     return;
43 |   }
44 | 
45 |   let resources;
46 |   try {
47 |     resources = preparePromptResources(definitions, {
48 |       baseDir: options.baseDir,
49 |       previewLimit: options.previewLimit,
50 |     });
51 |   } catch (error) {
52 |     logger.error("prompt_resource_prepare_failed", { error });
53 |     throw error;
54 |   }
55 | 
56 |   const payloadLimit = options.payloadLimit ?? DEFAULT_PAYLOAD_LIMIT;
57 | 
58 |   for (const resource of resources) {
59 |     server.registerResource(
60 |       resource.id,
61 |       resource.uri,
62 |       resource.metadata,
63 |       async (uri) => {
64 |         try {
65 |           const rawContent = await readFile(resource.filePath, "utf8");
66 |           const text = capPayload(rawContent, payloadLimit);
67 |           return {
68 |             contents: [
69 |               {
70 |                 uri: uri.href,
71 |                 mimeType: resource.metadata.mimeType,
72 |                 text,
73 |               },
74 |             ],
75 |           };
76 |         } catch (error) {
77 |           logger.error("prompt_resource_read_failed", {
78 |             resourceId: resource.id,
79 |             filePath: resource.filePath,
80 |             error,
81 |           });
82 |           throw error;
83 |         }
84 |       },
85 |     );
86 |   }
87 | 
88 |   logger.info("prompt_resources_registered", {
89 |     count: resources.length,
90 |   });
91 | }
92 | 
93 | const resolveDefinitions = (
94 |   logger: SecureLogger,
95 |   options: LoadPromptMetadataOptions,
96 |   loader: (opts: LoadPromptMetadataOptions) => PromptDefinition[],
97 | ) => {
98 |   try {
99 |     return loader(options);
100 |   } catch (error) {
101 |     logger.error("prompt_metadata_load_failed", { error });
102 |     throw error;
103 |   }
104 | };
105 | 
106 | export async function registerPromptTools(
107 |   server: McpServer,
108 |   logger: SecureLogger,
109 |   options: RegisterPromptToolsOptions = {},
110 | ): Promise<void> {
111 |   const definitions = resolveDefinitions(logger, options, loadPromptDefinitions);
112 | 
113 |   if (definitions.length === 0) {
114 |     logger.warn("prompt_metadata_empty", {
115 |       metadataPath: options.metadataPath,
116 |     });
117 |     return;
118 |   }
119 | 
120 |   const fileRoot = options.baseDir ?? process.cwd();
121 |   const payloadLimit = options.payloadLimit ?? DEFAULT_TOOL_PAYLOAD_LIMIT;
122 |   const registered: string[] = [];
123 | 
124 |   for (const definition of definitions) {
125 |     const { input, output } = generateToolSchemas(definition);
126 |     const handler = createPromptToolHandler(definition, fileRoot, {
127 |       payloadLimit,
128 |     });
129 | 
130 |     server.registerTool(
131 |       definition.id,
132 |       {
133 |         title: definition.title,
134 |         description: definition.description,
135 |         inputSchema: input,
136 |         outputSchema: output,
137 |         annotations: {
138 |           title: definition.title,
139 |           readOnlyHint: true,
140 |           openWorldHint: false,
141 |           idempotentHint: true,
142 |         },
143 |       },
144 |       async (args) => handler(args ?? {}),
145 |     );
146 | 
147 |     registered.push(definition.id);
148 |   }
149 | 
150 |   logger.info("prompt_tools_registered", {
151 |     count: registered.length,
152 |   });
153 | }
```

src/prompts/schema.test.ts
```
1 | import { strict as assert } from "node:assert";
2 | 
3 | import { describe, test } from "@jest/globals";
4 | import { z } from "zod";
5 | 
6 | import { generateToolSchemas } from "./schema.ts";
7 | import { PromptDefinition } from "./loader.ts";
8 | 
9 | const definition: PromptDefinition = {
10 |   id: "release-notes",
11 |   title: "Release Notes",
12 |   description: "Summarize commits",
13 |   path: "release-notes.md",
14 |   variables: [
15 |     { name: "range", type: "string", description: "Git range", required: false },
16 |     { name: "limit", type: "number", description: "Max entries", required: true },
17 |     { name: "includeDocs", type: "boolean", description: "Include docs", required: false },
18 |   ],
19 | };
20 | 
21 | describe("generateToolSchemas", () => {
22 |   test("builds zod schemas for inputs and outputs", () => {
23 |     const schemas = generateToolSchemas(definition);
24 |     assert.ok(schemas.output.content);
25 |     assert.equal(typeof schemas.output.content.parse("hello"), "string");
26 |     assert.ok(schemas.input);
27 |     const inputObject = schemas.input ?? {};
28 |     const inputSchema = z.object(inputObject);
29 |     const parsed = inputSchema.safeParse({ limit: 10 });
30 |     assert.ok(parsed.success, `Expected schema to parse input: ${parsed.error?.toString()}`);
31 |     assert.equal(parsed.data.limit, 10);
32 |     assert.equal(parsed.data.range, undefined);
33 |   });
34 | });
```

src/prompts/schema.ts
```
1 | import { z, ZodRawShape } from "zod";
2 | 
3 | import { PromptDefinition, PromptVariable } from "./loader.js";
4 | 
5 | export interface ToolSchemas {
6 |   input: ZodRawShape | undefined;
7 |   output: ZodRawShape;
8 | }
9 | 
10 | const VARIABLE_TYPE_MAP: Record<string, () => z.ZodTypeAny> = {
11 |   string: () => z.string(),
12 |   number: () => z.number(),
13 |   boolean: () => z.boolean(),
14 | };
15 | 
16 | const createSchemaForVariable = (variable: PromptVariable) => {
17 |   const factory = VARIABLE_TYPE_MAP[variable.type ?? "string"] ?? VARIABLE_TYPE_MAP.string;
18 |   const schema = factory();
19 |   const described = variable.description ? schema.describe(variable.description) : schema;
20 |   return variable.required === false ? described.optional() : described;
21 | };
22 | 
23 | export const generateToolSchemas = (definition: PromptDefinition): ToolSchemas => {
24 |   const variables = definition.variables ?? [];
25 |   const input: ZodRawShape | undefined = variables.length
26 |     ? variables.reduce<ZodRawShape>((shape, variable) => {
27 |         shape[variable.name] = createSchemaForVariable(variable);
28 |         return shape;
29 |       }, {})
30 |     : undefined;
31 | 
32 |   const output: ZodRawShape = {
33 |     content: z.string(),
34 |   };
35 | 
36 |   return { input, output };
37 | };
```

src/providers/factory.ts
```
1 | import { LLMProvider } from './interface.js';
2 | import { OllamaProvider } from './ollama.js';
3 | import { GeminiCliProvider } from './geminiCli.js';
4 | import { StubProvider } from './stub.js';
5 | 
6 | export const getProvider = async (): Promise<LLMProvider> => {
7 |   const candidates: LLMProvider[] = [new OllamaProvider(), new GeminiCliProvider()];
8 |   for (const p of candidates) {
9 |     try {
10 |       if (await p.ping()) return p;
11 |     } catch {
12 |       // ignore and continue
13 |     }
14 |   }
15 |   return new StubProvider();
16 | };
```

src/providers/geminiCli.ts
```
1 | import { spawnSync } from 'node:child_process';
2 | import { LLMProvider, DependencyMissingError } from './interface.js';
3 | 
4 | export class GeminiCliProvider implements LLMProvider {
5 |   name = 'gemini-cli';
6 | 
7 |   async ping(): Promise<boolean> {
8 |       const cmd = process.env.GEMINI_CLI ?? 'gemini';
9 |       const res = spawnSync(cmd, ['--help'], { stdio: 'ignore' });
10 |       return res.status === 0; // treat non-zero as unavailable
11 |   }
12 | 
13 |   async generate(_prompt: string): Promise<string> {
14 |     throw new DependencyMissingError('Gemini CLI generate not implemented for this repo.');
15 |   }
16 | }
```

src/providers/interface.ts
```
1 | export class ProviderError extends Error {}
2 | export class ProviderUnavailableError extends ProviderError {}
3 | export class DependencyMissingError extends ProviderError {}
4 | 
5 | export interface GenerateOptions {
6 |   maxTokens?: number;
7 |   temperature?: number;
8 | }
9 | 
10 | export interface LLMProvider {
11 |   name: string;
12 |   ping(): Promise<boolean>;
13 |   generate(prompt: string, options?: GenerateOptions): Promise<string>;
14 | }
15 | 
```

src/providers/ollama.ts
```
1 | import { LLMProvider, ProviderUnavailableError } from './interface.js';
2 | 
3 | export class OllamaProvider implements LLMProvider {
4 |   name = 'ollama';
5 | 
6 |   async ping(): Promise<boolean> {
7 |     const controller = new AbortController();
8 |     const t = setTimeout(() => controller.abort(), 500);
9 |     try {
10 |       const res = await fetch('http://127.0.0.1:11434/api/tags', {
11 |         method: 'GET',
12 |         cache: 'no-store',
13 |         signal: controller.signal,
14 |       });
15 |       return res.ok;
16 |     } catch {
17 |       return false;
18 |     } finally {
19 |       clearTimeout(t);
20 |     }
21 |   }
22 | 
23 |   async generate(_prompt: string): Promise<string> {
24 |     throw new ProviderUnavailableError('Ollama generate not wired in this project.');
25 |   }
26 | }
```

src/providers/stub.ts
```
1 | import { LLMProvider } from './interface.js';
2 | 
3 | export class StubProvider implements LLMProvider {
4 |   name = 'stub';
5 |   async ping(): Promise<boolean> { return true; }
6 |   async generate(prompt: string): Promise<string> {
7 |     return `STUB: ${prompt.slice(0, 32)}`;
8 |   }
9 | }
```

src/state/ProjectState.ts
```
1 | import type { Artifact, ToolCompletion } from './state-types.js';
2 | 
3 | export interface ProjectState {
4 |   completedTools: ToolCompletion[];
5 |   artifacts: Record<string, Artifact>;
6 | }
7 | 
8 | export const createInitialProjectState = (): ProjectState => ({
9 |   completedTools: [],
10 |   artifacts: {},
11 | });
12 | 
13 | const isRecord = (value: unknown): value is Record<string, unknown> =>
14 |   !!value && typeof value === 'object';
15 | 
16 | const sanitizeArtifactMap = (raw: unknown): Record<string, Artifact> => {
17 |   if (!isRecord(raw)) {
18 |     throw new TypeError('State artifacts payload must be an object.');
19 |   }
20 | 
21 |   const entries = Object.entries(raw).map(([key, value]) => {
22 |     if (!isRecord(value)) {
23 |       throw new TypeError(`Artifact entry ${key} must be an object.`);
24 |     }
25 | 
26 |     const { name, source, uri } = value as Partial<Artifact>;
27 | 
28 |     if (typeof name !== 'string' || typeof source !== 'string' || typeof uri !== 'string') {
29 |       throw new TypeError(`Artifact entry ${key} missing required fields.`);
30 |     }
31 | 
32 |     const artifact: Artifact = { name, source, uri };
33 |     return [key, artifact] as const;
34 |   });
35 | 
36 |   return Object.fromEntries(entries);
37 | };
38 | 
39 | const sanitizeCompletions = (raw: unknown): ToolCompletion[] => {
40 |   if (!Array.isArray(raw)) {
41 |     throw new TypeError('State completedTools payload must be an array.');
42 |   }
43 | 
44 |   return raw.map((entry, index) => {
45 |     if (!isRecord(entry)) {
46 |       throw new TypeError(`Completion entry at index ${index} must be an object.`);
47 |     }
48 | 
49 |     const { id, completedAt, outputs, artifacts } = entry as Partial<ToolCompletion>;
50 | 
51 |     if (typeof id !== 'string' || typeof completedAt !== 'string') {
52 |       throw new TypeError(`Completion entry at index ${index} missing required fields.`);
53 |     }
54 | 
55 |     const safeOutputs = isRecord(outputs) ? (outputs as Record<string, unknown>) : {};
56 |     const safeArtifacts = Array.isArray(artifacts)
57 |       ? artifacts.map((artifact, artifactIndex) => {
58 |           if (!isRecord(artifact)) {
59 |             throw new TypeError(
60 |               `Artifact entry at completion ${index}, position ${artifactIndex} must be an object.`,
61 |             );
62 |           }
63 | 
64 |           const { name, source, uri } = artifact as Partial<Artifact>;
65 | 
66 |           if (typeof name !== 'string' || typeof source !== 'string' || typeof uri !== 'string') {
67 |             throw new TypeError(
68 |               `Artifact entry at completion ${index}, position ${artifactIndex} missing required fields.`,
69 |             );
70 |           }
71 | 
72 |           return { name, source, uri } as Artifact;
73 |         })
74 |       : [];
75 | 
76 |     const completion: ToolCompletion = {
77 |       id,
78 |       completedAt,
79 |       outputs: safeOutputs,
80 |       artifacts: safeArtifacts,
81 |     };
82 | 
83 |     return completion;
84 |   });
85 | };
86 | 
87 | export const coerceProjectState = (payload: unknown): ProjectState => {
88 |   if (!isRecord(payload)) {
89 |     throw new TypeError('State payload must be an object.');
90 |   }
91 | 
92 |   return {
93 |     completedTools: sanitizeCompletions(payload.completedTools),
94 |     artifacts: sanitizeArtifactMap(payload.artifacts),
95 |   };
96 | };
97 | 
98 | export type { Artifact, ToolCompletion } from './state-types.js';
```

src/state/StateStore.ts
```
1 | import { rename, writeFile, readFile, mkdir, unlink } from 'node:fs/promises';
2 | import { randomUUID } from 'node:crypto';
3 | import { join } from 'node:path';
4 | 
5 | import {
6 |   coerceProjectState,
7 |   createInitialProjectState,
8 |   type Artifact,
9 |   type ProjectState,
10 |   type ToolCompletion,
11 | } from './ProjectState.js';
12 | 
13 | const LF = '\n';
14 | 
15 | const clone = <T>(value: T): T =>
16 |   typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
17 | 
18 | const isErrno = (error: unknown): error is NodeJS.ErrnoException =>
19 |   !!error && typeof error === 'object' && 'code' in error;
20 | 
21 | export class StateStore {
22 |   private readonly mcpDir: string;
23 |   readonly statePath: string;
24 |   private state: ProjectState = createInitialProjectState();
25 |   private ensurePromise?: Promise<void>;
26 | 
27 |   constructor(private readonly projectRoot: string) {
28 |     this.mcpDir = join(projectRoot, '.mcp');
29 |     this.statePath = join(this.mcpDir, 'state.json');
30 |   }
31 | 
32 |   private async ensureStorage(): Promise<void> {
33 |     if (!this.ensurePromise) {
34 |       this.ensurePromise = mkdir(this.mcpDir, { recursive: true }).then(() => undefined);
35 |     }
36 | 
37 |     try {
38 |       await this.ensurePromise;
39 |     } catch (error) {
40 |       this.ensurePromise = undefined;
41 |       throw error;
42 |     }
43 |   }
44 | 
45 |   async load(): Promise<ProjectState> {
46 |     await this.ensureStorage();
47 | 
48 |     try {
49 |       const raw = await readFile(this.statePath, 'utf8');
50 |       this.state = coerceProjectState(JSON.parse(raw));
51 |     } catch (error) {
52 |       if (isErrno(error) && error.code === 'ENOENT') {
53 |         this.state = createInitialProjectState();
54 |       } else if (error instanceof SyntaxError) {
55 |         throw new Error(`State file at ${this.statePath} is not valid JSON: ${error.message}`);
56 |       } else {
57 |         throw error;
58 |       }
59 |     }
60 | 
61 |     return this.getState();
62 |   }
63 | 
64 |   getState(): ProjectState {
65 |     return clone(this.state);
66 |   }
67 | 
68 |   getCompletedToolIds(): Set<string> {
69 |     return new Set(this.state.completedTools.map((completion) => completion.id));
70 |   }
71 | 
72 |   getAvailableArtifacts(): Set<string> {
73 |     return new Set(Object.keys(this.state.artifacts));
74 |   }
75 | 
76 |   recordCompletion(id: string, outputs: Record<string, unknown>, artifacts: Artifact[]): void {
77 |     const completion: ToolCompletion = {
78 |       id,
79 |       completedAt: new Date().toISOString(),
80 |       outputs: clone(outputs ?? {}),
81 |       artifacts: artifacts.map((artifact) => ({ ...artifact })),
82 |     };
83 | 
84 |     this.state.completedTools = [
85 |       ...this.state.completedTools.filter((existing) => existing.id !== id),
86 |       completion,
87 |     ];
88 | 
89 |     for (const artifact of artifacts) {
90 |       this.state.artifacts[artifact.name] = { ...artifact };
91 |     }
92 |   }
93 | 
94 |   async save(): Promise<void> {
95 |     await this.ensureStorage();
96 | 
97 |     const payload = `${JSON.stringify(this.state, null, 2)}${LF}`;
98 | 
99 |     const tempPath = join(this.mcpDir, `state-${randomUUID()}.json.tmp`);
100 | 
101 |     await writeFile(tempPath, payload, 'utf8');
102 | 
103 |     try {
104 |       await rename(tempPath, this.statePath);
105 |     } catch (error) {
106 |       await this.safeUnlink(tempPath);
107 |       throw error;
108 |     } finally {
109 |       await this.safeUnlink(tempPath);
110 |     }
111 |   }
112 | 
113 |   private async safeUnlink(path: string): Promise<void> {
114 |     try {
115 |       await unlink(path);
116 |     } catch (error) {
117 |       if (!isErrno(error) || error.code !== 'ENOENT') {
118 |         throw error;
119 |       }
120 |     }
121 |   }
122 | }
```

src/state/graph.d.ts
```
1 | import type { CanonicalTaskStatus, PromptsTask } from '../types/prompts-task.js';
2 | export declare const READY_STATUSES: ReadonlySet<CanonicalTaskStatus>;
3 | export declare const SATISFIED_DEPENDENCY_STATUSES: ReadonlySet<CanonicalTaskStatus>;
4 | export declare const computeReadiness: (tasks: PromptsTask[]) => PromptsTask[];
5 | export declare const next: (tasks: PromptsTask[]) => PromptsTask | null;
```

src/state/graph.js
```
1 | export const READY_STATUSES = new Set(['pending']);
2 | export const SATISFIED_DEPENDENCY_STATUSES = new Set([
3 |     'done',
4 |     'deprecated',
5 | ]);
6 | const buildStatusMap = (tasks) => {
7 |     const map = new Map();
8 |     for (const task of tasks) {
9 |         map.set(task.id, task.status);
10 |     }
11 |     return map;
12 | };
13 | const dependenciesSatisfied = (task, statusById) => {
14 |     for (const depId of task.dependencies) {
15 |         if (!Number.isInteger(depId) || depId < 1) {
16 |             return false;
17 |         }
18 |         if (depId === task.id) {
19 |             return false;
20 |         }
21 |         const dependencyStatus = statusById.get(depId);
22 |         if (!dependencyStatus || !SATISFIED_DEPENDENCY_STATUSES.has(dependencyStatus)) {
23 |             return false;
24 |         }
25 |     }
26 |     return true;
27 | };
28 | export const computeReadiness = (tasks) => {
29 |     const statusById = buildStatusMap(tasks);
30 |     return tasks.filter((task) => {
31 |         if (!READY_STATUSES.has(task.status)) {
32 |             return false;
33 |         }
34 |         return dependenciesSatisfied(task, statusById);
35 |     });
36 | };
37 | const PRIORITY_ORDER = {
38 |     high: 3,
39 |     medium: 2,
40 |     low: 1,
41 | };
42 | const buildDependentsCount = (tasks) => {
43 |     const counts = new Map();
44 |     for (const task of tasks) {
45 |         counts.set(task.id, 0);
46 |     }
47 |     for (const task of tasks) {
48 |         for (const dependency of task.dependencies) {
49 |             if (!Number.isInteger(dependency)) {
50 |                 continue;
51 |             }
52 |             counts.set(dependency, (counts.get(dependency) ?? 0) + 1);
53 |         }
54 |     }
55 |     return counts;
56 | };
57 | export const next = (tasks) => {
58 |     const ready = computeReadiness(tasks);
59 |     if (ready.length === 0) {
60 |         return null;
61 |     }
62 |     const dependentsCount = buildDependentsCount(tasks);
63 |     const sorted = [...ready].sort((a, b) => {
64 |         const priorityDelta = (PRIORITY_ORDER[b.priority] ?? 0) - (PRIORITY_ORDER[a.priority] ?? 0);
65 |         if (priorityDelta !== 0) {
66 |             return priorityDelta;
67 |         }
68 |         const dependentsDelta = (dependentsCount.get(b.id) ?? 0) - (dependentsCount.get(a.id) ?? 0);
69 |         if (dependentsDelta !== 0) {
70 |             return dependentsDelta;
71 |         }
72 |         return a.id - b.id;
73 |     });
74 |     return sorted[0] ?? null;
75 | };
```

src/state/graph.ts
```
1 | import type { CanonicalTaskStatus, PromptsTask, TaskPriority } from '../types/prompts-task.js';
2 | 
3 | export const READY_STATUSES: ReadonlySet<CanonicalTaskStatus> = new Set(['pending']);
4 | export const SATISFIED_DEPENDENCY_STATUSES: ReadonlySet<CanonicalTaskStatus> = new Set([
5 |   'done',
6 |   'deprecated',
7 | ]);
8 | 
9 | const buildStatusMap = (tasks: PromptsTask[]): Map<number, CanonicalTaskStatus> => {
10 |   const map = new Map<number, CanonicalTaskStatus>();
11 |   for (const task of tasks) {
12 |     map.set(task.id, task.status);
13 |   }
14 |   return map;
15 | };
16 | 
17 | const dependenciesSatisfied = (
18 |   task: PromptsTask,
19 |   statusById: Map<number, CanonicalTaskStatus>,
20 | ): boolean => {
21 |   for (const depId of task.dependencies) {
22 |     if (!Number.isInteger(depId) || depId < 1) {
23 |       return false;
24 |     }
25 |     if (depId === task.id) {
26 |       return false;
27 |     }
28 |     const dependencyStatus = statusById.get(depId);
29 |     if (!dependencyStatus || !SATISFIED_DEPENDENCY_STATUSES.has(dependencyStatus)) {
30 |       return false;
31 |     }
32 |   }
33 |   return true;
34 | };
35 | 
36 | export const computeReadiness = (tasks: PromptsTask[]): PromptsTask[] => {
37 |   const statusById = buildStatusMap(tasks);
38 | 
39 |   return tasks.filter((task) => {
40 |     if (!READY_STATUSES.has(task.status)) {
41 |       return false;
42 |     }
43 |     return dependenciesSatisfied(task, statusById);
44 |   });
45 | };
46 | 
47 | const PRIORITY_ORDER: Record<TaskPriority, number> = {
48 |   high: 3,
49 |   medium: 2,
50 |   low: 1,
51 | };
52 | 
53 | const buildDependentsCount = (tasks: PromptsTask[]): Map<number, number> => {
54 |   const counts = new Map<number, number>();
55 |   for (const task of tasks) {
56 |     counts.set(task.id, 0);
57 |   }
58 |   for (const task of tasks) {
59 |     for (const dependency of task.dependencies) {
60 |       if (!Number.isInteger(dependency)) {
61 |         continue;
62 |       }
63 |       counts.set(dependency, (counts.get(dependency) ?? 0) + 1);
64 |     }
65 |   }
66 |   return counts;
67 | };
68 | 
69 | export const next = (tasks: PromptsTask[]): PromptsTask | null => {
70 |   const ready = computeReadiness(tasks);
71 |   if (ready.length === 0) {
72 |     return null;
73 |   }
74 | 
75 |   const dependentsCount = buildDependentsCount(tasks);
76 | 
77 |   const sorted = [...ready].sort((a, b) => {
78 |     const priorityDelta = (PRIORITY_ORDER[b.priority] ?? 0) - (PRIORITY_ORDER[a.priority] ?? 0);
79 |     if (priorityDelta !== 0) {
80 |       return priorityDelta;
81 |     }
82 | 
83 |     const dependentsDelta = (dependentsCount.get(b.id) ?? 0) - (dependentsCount.get(a.id) ?? 0);
84 |     if (dependentsDelta !== 0) {
85 |       return dependentsDelta;
86 |     }
87 | 
88 |     return a.id - b.id;
89 |   });
90 | 
91 |   return sorted[0] ?? null;
92 | };
```

src/state/state-types.ts
```
1 | /** Artifact metadata captured when a tool finishes. */
2 | export interface Artifact {
3 |   name: string;
4 |   source: string;
5 |   uri: string;
6 | }
7 | 
8 | /**
9 |  * Snapshot describing a single tool completion event along with any
10 |  * produced artifacts and structured outputs.
11 |  */
12 | export interface ToolCompletion {
13 |   id: string;
14 |   completedAt: string;
15 |   outputs: Record<string, unknown>;
16 |   artifacts: Artifact[];
17 | }
```

src/state/update.d.ts
```
1 | import type { CanonicalTaskStatus, PromptsTask } from '../types/prompts-task.js';
2 | export declare const advance: (tasks: readonly PromptsTask[], taskId: number, newStatus: CanonicalTaskStatus) => PromptsTask[];
3 | export type { PromptsTask } from '../types/prompts-task.js';
```

src/state/update.js
```
1 | const VALID_STATUSES = new Set([
2 |     'pending',
3 |     'in_progress',
4 |     'blocked',
5 |     'done',
6 |     'deprecated',
7 | ]);
8 | const cloneTask = (task) => ({ ...task });
9 | export const advance = (tasks, taskId, newStatus) => {
10 |     if (!Array.isArray(tasks)) {
11 |         throw new TypeError('Tasks collection must be an array.');
12 |     }
13 |     if (!Number.isInteger(taskId) || taskId < 1) {
14 |         throw new RangeError('Task id must be a positive integer.');
15 |     }
16 |     if (!VALID_STATUSES.has(newStatus)) {
17 |         throw new RangeError('New status must be a canonical Task-Master status value.');
18 |     }
19 |     let updated = false;
20 |     const nextTasks = tasks.map((task) => {
21 |         if (task.id !== taskId) {
22 |             return task;
23 |         }
24 |         updated = true;
25 |         if (task.status === newStatus) {
26 |             return cloneTask(task);
27 |         }
28 |         return {
29 |             ...task,
30 |             status: newStatus,
31 |         };
32 |     });
33 |     if (!updated) {
34 |         throw new Error(`Task with id ${taskId} was not found.`);
35 |     }
36 |     return nextTasks;
37 | };
```

src/state/update.ts
```
1 | import type { CanonicalTaskStatus, PromptsTask } from '../types/prompts-task.js';
2 | 
3 | const VALID_STATUSES: ReadonlySet<CanonicalTaskStatus> = new Set([
4 |   'pending',
5 |   'in_progress',
6 |   'blocked',
7 |   'done',
8 |   'deprecated',
9 | ]);
10 | 
11 | const cloneTask = (task: PromptsTask): PromptsTask => ({ ...task });
12 | 
13 | export const advance = (
14 |   tasks: readonly PromptsTask[],
15 |   taskId: number,
16 |   newStatus: CanonicalTaskStatus,
17 | ): PromptsTask[] => {
18 |   if (!Array.isArray(tasks)) {
19 |     throw new TypeError('Tasks collection must be an array.');
20 |   }
21 |   if (!Number.isInteger(taskId) || taskId < 1) {
22 |     throw new RangeError('Task id must be a positive integer.');
23 |   }
24 |   if (!VALID_STATUSES.has(newStatus)) {
25 |     throw new RangeError('New status must be a canonical Task-Master status value.');
26 |   }
27 | 
28 |   let updated = false;
29 | 
30 |   const nextTasks = tasks.map((task) => {
31 |     if (task.id !== taskId) {
32 |       return task;
33 |     }
34 | 
35 |     updated = true;
36 | 
37 |     if (task.status === newStatus) {
38 |       return cloneTask(task);
39 |     }
40 | 
41 |     return {
42 |       ...task,
43 |       status: newStatus,
44 |     } satisfies PromptsTask;
45 |   });
46 | 
47 |   if (!updated) {
48 |     throw new Error(`Task with id ${taskId} was not found.`);
49 |   }
50 | 
51 |   return nextTasks;
52 | };
53 | 
54 | export type { PromptsTask } from '../types/prompts-task.js';
```

src/tools/index.ts
```
1 | import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
2 | import type { SecureLogger } from '../logger.js';
3 | 
4 | import { registerPromptResources, registerPromptTools } from '../prompts/register.js';
5 | import { registerWorkflowTools } from './register.js';
6 | import { registerTaskTools } from './task-tools.js';
7 | import type { TaskService } from '../mcp/task-service.js';
8 | import type { StateStore } from '../state/StateStore.js';
9 | 
10 | export interface RegisterAllToolsOptions {
11 |   service: TaskService;
12 |   stateStore: StateStore;
13 | }
14 | 
15 | export const registerAllTools = async (
16 |   server: McpServer,
17 |   logger: SecureLogger,
18 |   { service, stateStore }: RegisterAllToolsOptions,
19 | ): Promise<void> => {
20 |   // Prompts: resources + tool wrappers generated from metadata
21 |   await registerPromptResources(server, logger, { baseDir: process.cwd() });
22 |   await registerPromptTools(server, logger, { baseDir: process.cwd() });
23 | 
24 |   // Workflow tools (advance_state, export_task_list, refresh_metadata, run_task_action, runners)
25 |   registerWorkflowTools(server, logger, { stateStore, service });
26 | 
27 |   // Task tools (list, next, set_status, etc.)
28 |   registerTaskTools(server, { service, logger });
29 | };
```

src/tools/prompt-handler.test.ts
```
1 | import { strict as assert } from "node:assert";
2 | import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
3 | import path from "node:path";
4 | import os from "node:os";
5 | 
6 | import { describe, test } from "@jest/globals";
7 | 
8 | import { createPromptToolHandler } from "./prompt-handler.ts";
9 | import { PromptDefinition } from "../prompts/loader.ts";
10 | 
11 | const definition: PromptDefinition = {
12 |   id: "sample",
13 |   title: "Sample Prompt",
14 |   description: "Test prompt",
15 |   path: "prompt.md",
16 |   dependsOn: [],
17 |   tags: [],
18 | };
19 | 
20 | describe("createPromptToolHandler", () => {
21 |   test("renders prompt content with footer and respects payload limit", async () => {
22 |     const tempDir = mkdtempSync(path.join(os.tmpdir(), "prompt-handler-"));
23 |     const promptPath = path.join(tempDir, "prompt.md");
24 |     writeFileSync(promptPath, "Line 1\nLine 2\n", "utf8");
25 | 
26 |     try {
27 |       const handler = createPromptToolHandler(definition, tempDir, {
28 |         payloadLimit: 64,
29 |         footerTemplate: "\n-- {id} --",
30 |       });
31 | 
32 |       const result = await handler({} as any);
33 |       assert.equal(result.isError, undefined);
34 |       const [content] = result.content ?? [];
35 |       assert.ok(content && content.type === "text");
36 |       const text = content.text;
37 |       assert.ok(text.includes("Line 1"));
38 |       assert.ok(text.includes("-- sample --"));
39 |       assert.ok(Buffer.byteLength(text, "utf8") <= 64);
40 |     } finally {
41 |       rmSync(tempDir, { recursive: true, force: true });
42 |     }
43 |   });
44 | });
```

src/tools/prompt-handler.ts
```
1 | import { readFile } from "node:fs/promises";
2 | import path from "node:path";
3 | 
4 | import { capPayload } from "../utils/safety.js";
5 | import { PromptDefinition } from "../prompts/loader.js";
6 | 
7 | const FOOTER = "\n\n---\n_Served via MCP prompt tool._";
8 | 
9 | export interface PromptHandlerOptions {
10 |   payloadLimit?: number;
11 |   footerTemplate?: string;
12 | }
13 | 
14 | export const DEFAULT_TOOL_PAYLOAD_LIMIT = 1024 * 1024;
15 | 
16 | const renderFooter = (template: string, definition: PromptDefinition): string => {
17 |   return template.replaceAll("{id}", definition.id).replaceAll("{title}", definition.title);
18 | };
19 | 
20 | export interface PromptToolResult extends Record<string, unknown> {
21 |   content: Array<{ type: "text"; text: string }>;
22 |   isError?: boolean;
23 | }
24 | 
25 | export type PromptToolHandler = (args: Record<string, unknown>) => Promise<PromptToolResult>;
26 | 
27 | export const createPromptToolHandler = (
28 |   definition: PromptDefinition,
29 |   fileRoot: string,
30 |   options: PromptHandlerOptions = {},
31 | ) => {
32 |   const payloadLimit = options.payloadLimit ?? DEFAULT_TOOL_PAYLOAD_LIMIT;
33 |   const footerTemplate = options.footerTemplate ?? FOOTER;
34 |   const absolutePath = path.isAbsolute(definition.path)
35 |     ? definition.path
36 |     : path.resolve(fileRoot, definition.path);
37 | 
38 |   const handler: PromptToolHandler = async () => {
39 |     let rawContent: string;
40 |     try {
41 |       rawContent = await readFile(absolutePath, "utf8");
42 |     } catch (error) {
43 |       return {
44 |         isError: true,
45 |         content: [
46 |           {
47 |             type: "text",
48 |             text: `Failed to read prompt file at ${absolutePath}: ${(error as Error).message}`,
49 |           },
50 |         ],
51 |       };
52 |     }
53 | 
54 |     const footer = renderFooter(footerTemplate, definition);
55 |     const text = capPayload(`${rawContent}${footer}`, payloadLimit);
56 | 
57 |     return {
58 |       content: [
59 |         {
60 |           type: "text",
61 |           text,
62 |         },
63 |       ],
64 |       structuredContent: {
65 |         content: text,
66 |       },
67 |     };
68 |   };
69 | 
70 |   return handler;
71 | };
```

src/tools/register.ts
```
1 | import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
2 | import { z } from 'zod';
3 | 
4 | import type { SecureLogger } from '../logger.js';
5 | import type { StateStore } from '../state/StateStore.js';
6 | import { createAdvanceStateTool } from './definitions/advance-state.js';
7 | import { createRunScriptTool } from './definitions/run-script.js';
8 | import { createRunTaskActionTool } from './definitions/run-task-action.js';
9 | import { createRunTestsTool, createRunBuildTool, createRunLintTool } from './definitions/run-domain.js';
10 | import { createExportTaskListTool } from './definitions/export-task-list.js';
11 | import { createRefreshMetadataTool } from './definitions/refresh-metadata.js';
12 | 
13 | interface RegisterWorkflowToolsOptions {
14 |   stateStore: StateStore;
15 |   service?: import('../mcp/task-service.js').TaskService;
16 | }
17 | 
18 | const formatIssues = (issues: z.ZodIssue[]): string =>
19 |   issues
20 |     .map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
21 |     .join('\n');
22 | 
23 | export const registerWorkflowTools = (
24 |   server: McpServer,
25 |   logger: SecureLogger,
26 |   options: RegisterWorkflowToolsOptions,
27 | ): void => {
28 |   const refreshMetadata = createRefreshMetadataTool();
29 |   const exportTaskList = createExportTaskListTool();
30 |   const advanceState = createAdvanceStateTool(options.stateStore);
31 |   const runScript = createRunScriptTool();
32 |   const runTaskAction = options.service ? createRunTaskActionTool(options.service) : null;
33 |   const runTests = createRunTestsTool();
34 |   const runBuild = createRunBuildTool();
35 |   const runLint = createRunLintTool();
36 | 
37 |   server.registerTool(
38 |     exportTaskList.name,
39 |     {
40 |       title: exportTaskList.title,
41 |       description: exportTaskList.description,
42 |       inputSchema: exportTaskList.inputSchema.shape,
43 |       annotations: {
44 |         idempotentHint: true,
45 |       },
46 |     },
47 |     async () => {
48 |       try {
49 |         const result = await exportTaskList.handler();
50 |         logger.info('export_task_list_completed', { count: result.tasks.length });
51 |         return {
52 |           content: [
53 |             {
54 |               type: 'text',
55 |               text: `Exported ${result.tasks.length} tasks.`,
56 |             },
57 |           ],
58 |           structuredResult: result,
59 |         };
60 |       } catch (error) {
61 |         logger.error('export_task_list_failed', { error });
62 |         return {
63 |           isError: true,
64 |           content: [
65 |             {
66 |               type: 'text',
67 |               text: `Failed to export task list: ${(error as Error).message}`,
68 |             },
69 |           ],
70 |         };
71 |       }
72 |     },
73 |   );
74 | 
75 |   if (runTaskAction) {
76 |     server.registerTool(
77 |       runTaskAction.name,
78 |       {
79 |         title: runTaskAction.title,
80 |         description: runTaskAction.description,
81 |         inputSchema: runTaskAction.inputSchema.shape,
82 |         annotations: {
83 |           idempotentHint: false,
84 |         },
85 |       },
86 |       async (rawArgs) => {
87 |         const result = await runTaskAction.handler(rawArgs ?? {});
88 |         return {
89 |           isError: result.isError,
90 |           content: [
91 |             { type: 'text', text: result.summary },
92 |           ],
93 |           structuredResult: result,
94 |         };
95 |       },
96 |     );
97 |   }
98 | 
99 |   server.registerTool(
100 |     runScript.name,
101 |     {
102 |       title: runScript.title,
103 |       description: runScript.description,
104 |       inputSchema: runScript.inputSchema.shape,
105 |       annotations: {
106 |         idempotentHint: false,
107 |       },
108 |     },
109 |     async (rawArgs) => {
110 |       const result: any = await runScript.handler(rawArgs ?? {});
111 |       return {
112 |         isError: Boolean(result.isError),
113 |         content: [
114 |           { type: 'text', text: String(result.summary) },
115 |         ],
116 |         structuredResult: result,
117 |       };
118 |     },
119 |   );
120 | 
121 |   // Domain runners
122 |   for (const tool of [runTests, runBuild, runLint]) {
123 |     server.registerTool(
124 |       tool.name,
125 |       {
126 |         title: tool.title,
127 |         description: tool.description,
128 |         inputSchema: tool.inputSchema.shape,
129 |         annotations: { idempotentHint: false },
130 |       },
131 |       async (rawArgs) => {
132 |         const result = await tool.handler(rawArgs ?? {});
133 |         return {
134 |           isError: (result as any).isError,
135 |           content: [{ type: 'text', text: String((result as any).summary) }],
136 |           structuredResult: result,
137 |         };
138 |       },
139 |     );
140 |   }
141 | 
142 |   server.registerTool(
143 |     refreshMetadata.name,
144 |     {
145 |       title: refreshMetadata.title,
146 |       description: refreshMetadata.description,
147 |       inputSchema: refreshMetadata.inputSchema.shape,
148 |       annotations: {
149 |         idempotentHint: false,
150 |       },
151 |     },
152 |     async (rawArgs) => {
153 |       const parseResult = refreshMetadata.inputSchema.safeParse(rawArgs ?? {});
154 | 
155 |       if (!parseResult.success) {
156 |         const message = formatIssues(parseResult.error.issues);
157 |         logger.warn('refresh_metadata_invalid_input', {
158 |           issues: parseResult.error.flatten(),
159 |         });
160 | 
161 |         return {
162 |           isError: true,
163 |           content: [
164 |             {
165 |               type: 'text',
166 |               text: `refresh_metadata input validation failed:\n${message}`,
167 |             },
168 |           ],
169 |         };
170 |       }
171 | 
172 |       try {
173 |         const result = await refreshMetadata.handler(parseResult.data);
174 |         logger.info('refresh_metadata_completed', {
175 |           updateWorkflow: parseResult.data.updateWorkflow,
176 |         });
177 | 
178 |         return {
179 |           content: [
180 |             {
181 |               type: 'text',
182 |               text: result.summary,
183 |             },
184 |           ],
185 |           structuredResult: result,
186 |         };
187 |       } catch (error) {
188 |         logger.error('refresh_metadata_failed', { error });
189 |         return {
190 |           isError: true,
191 |           content: [
192 |             {
193 |               type: 'text',
194 |               text: `Failed to refresh metadata: ${(error as Error).message}`,
195 |             },
196 |           ],
197 |         };
198 |       }
199 |     },
200 |   );
201 | 
202 |   server.registerTool(
203 |     advanceState.name,
204 |     {
205 |       title: advanceState.title,
206 |       description: advanceState.description,
207 |       inputSchema: advanceState.inputSchema.shape,
208 |       annotations: {
209 |         idempotentHint: false,
210 |       },
211 |     },
212 |     async (rawArgs) => {
213 |       const parseResult = advanceState.inputSchema.safeParse(rawArgs ?? {});
214 | 
215 |       if (!parseResult.success) {
216 |         const message = formatIssues(parseResult.error.issues);
217 |         logger.warn('advance_state_invalid_input', {
218 |           issues: parseResult.error.flatten(),
219 |         });
220 | 
221 |         return {
222 |           isError: true,
223 |           content: [
224 |             {
225 |               type: 'text',
226 |               text: `advance_state input validation failed:\n${message}`,
227 |             },
228 |           ],
229 |         };
230 |       }
231 | 
232 |       const result = await advanceState.handler(parseResult.data);
233 | 
234 |       logger.info('advance_state_recorded', {
235 |         id: parseResult.data.id,
236 |         artifactCount: parseResult.data.artifacts.length,
237 |       });
238 | 
239 |       return {
240 |         content: [
241 |           {
242 |             type: 'text',
243 |             text: `Recorded completion for ${parseResult.data.id}.`,
244 |           },
245 |         ],
246 |         structuredResult: result,
247 |       };
248 |     },
249 |   );
250 | 
251 |   const tools = [refreshMetadata.name, exportTaskList.name, advanceState.name, runScript.name, runTests.name, runBuild.name, runLint.name];
252 |   if (runTaskAction) tools.push(runTaskAction.name);
253 |   logger.info('workflow_tools_registered', {
254 |     count: tools.length,
255 |     tools,
256 |   });
257 | };
```

src/tools/task-tools.ts
```
1 | import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
2 | import { z } from 'zod';
3 | 
4 | import type { SecureLogger } from '../logger.js';
5 | import type { TaskService, SetTaskStatusResult } from '../mcp/task-service.js';
6 | import { computeReadyTasks } from '../mcp/task-service.js';
7 | 
8 | const statusSchema = z.enum(['pending', 'in_progress', 'blocked', 'done', 'deprecated']);
9 | 
10 | const idSchema = z.number().int().positive();
11 | 
12 | const serializeTask = (task: unknown): unknown => JSON.parse(JSON.stringify(task));
13 | 
14 | interface ToolDefinition {
15 |   name: string;
16 |   title: string;
17 |   description: string;
18 |   inputSchema: z.ZodTypeAny;
19 |   handler: (args?: unknown) => Promise<{
20 |     content: string;
21 |     structuredResult?: unknown;
22 |     isError?: boolean;
23 |   }>;
24 | }
25 | 
26 | const buildTextContent = (message: string) => [{ type: 'text' as const, text: message }];
27 | 
28 | export interface RegisterTaskToolsOptions {
29 |   service: TaskService;
30 |   logger: SecureLogger;
31 | }
32 | 
33 | export const buildTaskToolDefinitions = ({
34 |   service,
35 |   logger
36 | }: RegisterTaskToolsOptions): ToolDefinition[] => {
37 |   const emptyInput = z.object({}).strict();
38 | 
39 |   const nextTaskTool: ToolDefinition = {
40 |     name: 'next_task',
41 |     title: 'Next task',
42 |     description: 'Return the highest-priority ready task based on dependency satisfaction and tie-break rules.',
43 |     inputSchema: emptyInput,
44 |     handler: async () => {
45 |       const task = service.next();
46 |       if (!task) {
47 |         logger.info('next_task_empty');
48 |         return {
49 |           content: 'No ready tasks. All dependencies may be incomplete.',
50 |           structuredResult: { task: null, ready: [] }
51 |         };
52 |       }
53 | 
54 |       const readyList = computeReadyTasks(service.list());
55 | 
56 |       logger.info('next_task_selected', { id: task.id, title: task.title });
57 |       return {
58 |         content: `Next ready task: #${task.id} – ${task.title}`,
59 |         structuredResult: {
60 |           task: serializeTask(task),
61 |           ready: readyList.map((ready) => serializeTask(ready))
62 |         }
63 |       };
64 |     }
65 |   };
66 | 
67 |   const getTaskTool: ToolDefinition = {
68 |     name: 'get_task',
69 |     title: 'Get task by id',
70 |     description: 'Return a single task, including subtasks, for the given numeric id.',
71 |     inputSchema: z.object({ id: idSchema }).strict(),
72 |     handler: async (rawArgs) => {
73 |       const parseResult = getTaskTool.inputSchema.safeParse(rawArgs ?? {});
74 |       if (!parseResult.success) {
75 |         const message = parseResult.error.issues.map((issue) => issue.message).join('\n');
76 |         logger.warn('get_task_invalid_input', { issues: parseResult.error.flatten() });
77 |         return {
78 |           content: `Invalid input for get_task:\n${message}`,
79 |           isError: true
80 |         };
81 |       }
82 | 
83 |       const task = service.get(parseResult.data.id);
84 |       if (!task) {
85 |         logger.warn('get_task_not_found', { id: parseResult.data.id });
86 |         return {
87 |           content: `Task ${parseResult.data.id} was not found.`,
88 |           isError: true
89 |         };
90 |       }
91 | 
92 |       return {
93 |         content: `Task ${task.id}: ${task.title}`,
94 |         structuredResult: { task: serializeTask(task) }
95 |       };
96 |     }
97 |   };
98 | 
99 |   const listTasksTool: ToolDefinition = {
100 |     name: 'list_tasks',
101 |     title: 'List all tasks',
102 |     description: 'Return the full canonical task list with statuses and dependencies.',
103 |     inputSchema: emptyInput,
104 |     handler: async () => {
105 |       const tasks = service.list();
106 |       logger.info('list_tasks', { count: tasks.length });
107 |       return {
108 |         content: `Returned ${tasks.length} tasks.`,
109 |         structuredResult: { tasks: tasks.map((task) => serializeTask(task)) }
110 |       };
111 |     }
112 |   };
113 | 
114 |   const graphExportTool: ToolDefinition = {
115 |     name: 'graph_export',
116 |     title: 'Export task dependency graph',
117 |     description: 'Return nodes suitable for graph visualisation, including dependencies and status.',
118 |     inputSchema: emptyInput,
119 |     handler: async () => {
120 |       const graph = service.graph();
121 |       logger.info('graph_export', { count: graph.nodes.length });
122 |       return {
123 |         content: `Exported ${graph.nodes.length} graph nodes.`,
124 |         structuredResult: graph
125 |       };
126 |     }
127 |   };
128 | 
129 |   const setTaskStatusTool: ToolDefinition = {
130 |     name: 'set_task_status',
131 |     title: 'Update task status',
132 |     description:
133 |       'Update the canonical status for a task. Persistence occurs only when the server write mode is enabled.',
134 |     inputSchema: z
135 |       .object({
136 |         id: idSchema,
137 |         status: statusSchema
138 |       })
139 |       .strict(),
140 |     handler: async (rawArgs) => {
141 |       const parseResult = setTaskStatusTool.inputSchema.safeParse(rawArgs ?? {});
142 |       if (!parseResult.success) {
143 |         const message = parseResult.error.issues.map((issue) => issue.message).join('\n');
144 |         logger.warn('set_task_status_invalid_input', { issues: parseResult.error.flatten() });
145 |         return {
146 |           content: `Invalid input for set_task_status:\n${message}`,
147 |           isError: true
148 |         };
149 |       }
150 | 
151 |       let result: SetTaskStatusResult;
152 |       try {
153 |         result = await service.setStatus(parseResult.data.id, parseResult.data.status);
154 |       } catch (error) {
155 |         logger.error('set_task_status_failed', { error, id: parseResult.data.id });
156 |         return {
157 |           content: `Failed to update task ${parseResult.data.id}: ${(error as Error).message}`,
158 |           isError: true
159 |         };
160 |       }
161 | 
162 |       logger.info('set_task_status_completed', {
163 |         id: result.task.id,
164 |         status: result.task.status,
165 |         persisted: result.persisted
166 |       });
167 | 
168 |       const message = result.persisted
169 |         ? `Task ${result.task.id} status updated to ${result.task.status}.`
170 |         : `Write mode disabled. Task ${result.task.id} remains ${result.task.status}.`;
171 | 
172 |       return {
173 |         content: message,
174 |         structuredResult: {
175 |           task: serializeTask(result.task),
176 |           persisted: result.persisted
177 |         }
178 |       };
179 |     }
180 |   };
181 | 
182 |   return [nextTaskTool, getTaskTool, listTasksTool, graphExportTool, setTaskStatusTool];
183 | };
184 | 
185 | export const registerTaskTools = (server: McpServer, options: RegisterTaskToolsOptions): void => {
186 |   const tools = buildTaskToolDefinitions(options);
187 | 
188 |   for (const tool of tools) {
189 |     const schema = tool.inputSchema as z.ZodObject<any> | undefined;
190 | 
191 |     server.registerTool(
192 |       tool.name,
193 |       {
194 |         title: tool.title,
195 |         description: tool.description,
196 |         inputSchema: schema ? schema.shape : {},
197 |         annotations: {
198 |           idempotentHint: tool.name === 'set_task_status' ? false : true
199 |         }
200 |       },
201 |       async (rawArgs: unknown) => {
202 |         const result = await tool.handler(rawArgs);
203 |         return {
204 |           content: buildTextContent(result.content),
205 |           structuredResult: result.structuredResult,
206 |           isError: result.isError
207 |         };
208 |       }
209 |     );
210 |   }
211 | };
212 | 
```

src/types/prompts-task.d.ts
```
1 | export type TaskPriority = 'high' | 'medium' | 'low';
2 | export type CanonicalTaskStatus = 'pending' | 'in_progress' | 'blocked' | 'done' | 'deprecated';
3 | export interface StatusAliasMap {
4 |     readonly [alias: string]: CanonicalTaskStatus;
5 | }
6 | export declare const STATUS_ALIASES: StatusAliasMap;
7 | export interface PromptsArtifactReference {
8 |     name: string;
9 |     path?: string;
10 |     type?: string;
11 | }
12 | export interface PromptsEvidenceReference {
13 |     source?: string;
14 |     summary?: string;
15 |     date?: string;
16 |     link?: string;
17 | }
18 | export interface PromptsSubtask {
19 |     id: number;
20 |     title: string;
21 |     description?: string;
22 |     details?: string;
23 |     testStrategy?: string;
24 |     status: CanonicalTaskStatus;
25 |     parentTaskId?: number;
26 |     dependencies?: Array<number | string>;
27 | }
28 | export interface PromptsTask {
29 |     id: number;
30 |     title: string;
31 |     description: string;
32 |     status: CanonicalTaskStatus;
33 |     dependencies: number[];
34 |     priority: TaskPriority;
35 |     details: string;
36 |     testStrategy: string;
37 |     subtasks: PromptsSubtask[];
38 |     labels?: string[];
39 |     metadata?: Record<string, unknown>;
40 |     evidence?: Array<string | PromptsEvidenceReference>;
41 |     artifacts?: Array<string | PromptsArtifactReference>;
42 |     source_doc?: string;
43 |     lineage?: number[];
44 |     supersedes?: number[];
45 |     superseded_by?: number[];
46 |     reason?: string;
47 | }
48 | export interface StatusNormalizationEntry {
49 |     entity: 'task' | 'subtask';
50 |     taskId: number;
51 |     subtaskId?: number;
52 |     from: string;
53 |     to: CanonicalTaskStatus;
54 | }
55 | export interface StatusNormalizationReport {
56 |     total: number;
57 |     remapped: StatusNormalizationEntry[];
58 | }
59 | export interface IngestOptions {
60 |     /**
61 |      * Optional tag to extract from Task-Master tagged task files. Defaults to "master".
62 |      */
63 |     tag?: string;
64 | }
65 | export interface IngestResult {
66 |     tasks: PromptsTask[];
67 |     report: StatusNormalizationReport;
68 | }
```

src/types/prompts-task.js
```
1 | export const STATUS_ALIASES = {
2 |     pending: 'pending',
3 |     todo: 'pending',
4 |     backlog: 'pending',
5 |     ready: 'pending',
6 |     'in-progress': 'in_progress',
7 |     in_progress: 'in_progress',
8 |     started: 'in_progress',
9 |     doing: 'in_progress',
10 |     blocked: 'blocked',
11 |     deferred: 'blocked',
12 |     impeded: 'blocked',
13 |     done: 'done',
14 |     completed: 'done',
15 |     complete: 'done',
16 |     shipped: 'done',
17 |     review: 'in_progress',
18 |     deprecated: 'deprecated',
19 |     retired: 'deprecated',
20 |     cancelled: 'deprecated',
21 |     canceled: 'deprecated'
22 | };
```

src/types/prompts-task.ts
```
1 | export type TaskPriority = 'high' | 'medium' | 'low';
2 | export type CanonicalTaskStatus = 'pending' | 'in_progress' | 'blocked' | 'done' | 'deprecated';
3 | 
4 | export interface StatusAliasMap {
5 |   readonly [alias: string]: CanonicalTaskStatus;
6 | }
7 | 
8 | export const STATUS_ALIASES: StatusAliasMap = {
9 |   pending: 'pending',
10 |   todo: 'pending',
11 |   backlog: 'pending',
12 |   ready: 'pending',
13 |   'in-progress': 'in_progress',
14 |   in_progress: 'in_progress',
15 |   started: 'in_progress',
16 |   doing: 'in_progress',
17 |   blocked: 'blocked',
18 |   deferred: 'blocked',
19 |   impeded: 'blocked',
20 |   done: 'done',
21 |   completed: 'done',
22 |   complete: 'done',
23 |   shipped: 'done',
24 |   review: 'in_progress',
25 |   deprecated: 'deprecated',
26 |   retired: 'deprecated',
27 |   cancelled: 'deprecated',
28 |   canceled: 'deprecated'
29 | } as const;
30 | 
31 | export interface PromptsArtifactReference {
32 |   name: string;
33 |   path?: string;
34 |   type?: string;
35 | }
36 | 
37 | export interface PromptsEvidenceReference {
38 |   source?: string;
39 |   summary?: string;
40 |   date?: string;
41 |   link?: string;
42 | }
43 | 
44 | export interface PromptsSubtask {
45 |   id: number;
46 |   title: string;
47 |   description?: string;
48 |   details?: string;
49 |   testStrategy?: string;
50 |   status: CanonicalTaskStatus;
51 |   parentTaskId?: number;
52 |   dependencies?: Array<number | string>;
53 | }
54 | 
55 | export interface PromptsTask {
56 |   id: number;
57 |   title: string;
58 |   description: string;
59 |   status: CanonicalTaskStatus;
60 |   dependencies: number[];
61 |   priority: TaskPriority;
62 |   details: string;
63 |   testStrategy: string;
64 |   subtasks: PromptsSubtask[];
65 |   labels?: string[];
66 |   metadata?: Record<string, unknown>;
67 |   evidence?: Array<string | PromptsEvidenceReference>;
68 |   artifacts?: Array<string | PromptsArtifactReference>;
69 |   source_doc?: string;
70 |   lineage?: number[];
71 |   supersedes?: number[];
72 |   superseded_by?: number[];
73 |   reason?: string;
74 | }
75 | 
76 | export interface StatusNormalizationEntry {
77 |   entity: 'task' | 'subtask';
78 |   taskId: number;
79 |   subtaskId?: number;
80 |   from: string;
81 |   to: CanonicalTaskStatus;
82 | }
83 | 
84 | export interface StatusNormalizationReport {
85 |   total: number;
86 |   remapped: StatusNormalizationEntry[];
87 | }
88 | 
89 | export interface IngestOptions {
90 |   /**
91 |    * Optional tag to extract from Task-Master tagged task files. Defaults to "master".
92 |    */
93 |   tag?: string;
94 |   /**
95 |    * Optional absolute path to a tasks JSON Schema file. When omitted, the loader
96 |    * resolves the schema relative to the installed module/package location.
97 |    */
98 |   schemaPath?: string;
99 | }
100 | 
101 | export interface IngestResult {
102 |   tasks: PromptsTask[];
103 |   report: StatusNormalizationReport;
104 | }
```

src/utils/front_matter.ts
```
1 | import matter from 'gray-matter';
2 | 
3 | export type Scalar = string;
4 | export type MetadataValue = Scalar | Scalar[];
5 | 
6 | export interface ParsedFrontMatter {
7 |   metadata: Record<string, MetadataValue>;
8 |   endOffset: number;
9 | }
10 | 
11 | export type FrontMatterRecord = Record<string, MetadataValue | undefined>;
12 | 
13 | const FRONT_MATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
14 | 
15 | export function parseFrontMatter(content: string): ParsedFrontMatter | null {
16 |   if (!content.startsWith('---')) {
17 |     return null;
18 |   }
19 | 
20 |   const match = content.match(FRONT_MATTER_PATTERN);
21 |   if (!match) {
22 |     throw new Error('Front matter missing closing delimiter.');
23 |   }
24 | 
25 |   const parsed = matter(content, { excerpt: false });
26 |   const metadata = normalizeMetadata(parsed.data);
27 | 
28 |   return {
29 |     metadata,
30 |     endOffset: match[0].length,
31 |   };
32 | }
33 | 
34 | export function ensureArray(value: MetadataValue | undefined): string[] {
35 |   if (value === undefined) {
36 |     return [];
37 |   }
38 |   if (Array.isArray(value)) {
39 |     return value.map((entry) => entry.trim()).filter((entry) => entry.length > 0);
40 |   }
41 |   const trimmed = value.trim();
42 |   return trimmed.length > 0 ? [trimmed] : [];
43 | }
44 | 
45 | export function formatFrontMatter(
46 |   metadata: FrontMatterRecord,
47 |   preferredOrder: string[] = ['phase', 'gate', 'status', 'previous', 'next'],
48 | ): string {
49 |   const normalizedEntries: [string, MetadataValue][] = [];
50 |   for (const [key, value] of Object.entries(metadata)) {
51 |     if (value === undefined || value === null) {
52 |       continue;
53 |     }
54 |     if (Array.isArray(value)) {
55 |       const items = value.map((item) => item.trim()).filter((item) => item.length > 0);
56 |       normalizedEntries.push([key, items]);
57 |     } else {
58 |       const trimmed = value.trim();
59 |       if (trimmed.length === 0) {
60 |         continue;
61 |       }
62 |       normalizedEntries.push([key, trimmed]);
63 |     }
64 |   }
65 | 
66 |   const orderedKeys = new Set<string>();
67 |   for (const key of preferredOrder) {
68 |     if (normalizedEntries.some(([entryKey]) => entryKey === key)) {
69 |       orderedKeys.add(key);
70 |     }
71 |   }
72 |   for (const [key] of normalizedEntries) {
73 |     if (!orderedKeys.has(key)) {
74 |       orderedKeys.add(key);
75 |     }
76 |   }
77 | 
78 |   const lines: string[] = ['---'];
79 |   for (const key of orderedKeys) {
80 |     const entry = normalizedEntries.find(([entryKey]) => entryKey === key);
81 |     if (!entry) {
82 |       continue;
83 |     }
84 |     const [, value] = entry;
85 |     if (Array.isArray(value)) {
86 |       if (value.length === 0) {
87 |         lines.push(`${key}: []`);
88 |         continue;
89 |       }
90 |       lines.push(`${key}:`);
91 |       for (const item of value) {
92 |         lines.push(`  - ${JSON.stringify(item)}`);
93 |       }
94 |     } else {
95 |       lines.push(`${key}: ${JSON.stringify(value)}`);
96 |     }
97 |   }
98 | 
99 |   lines.push('---', '');
100 |   return `${lines.join('\n')}\n`;
101 | }
102 | 
103 | function normalizeMetadata(raw: unknown): Record<string, MetadataValue> {
104 |   if (raw === null || typeof raw !== 'object') {
105 |     return {};
106 |   }
107 | 
108 |   const entries = Object.entries(raw as Record<string, unknown>);
109 |   const normalized: Record<string, MetadataValue> = {};
110 | 
111 |   for (const [key, value] of entries) {
112 |     if (value === undefined || value === null) {
113 |       continue;
114 |     }
115 |     if (Array.isArray(value)) {
116 |       normalized[key] = value.map((item) => stringify(item)).filter((item) => item.length > 0);
117 |     } else {
118 |       const stringValue = stringify(value);
119 |       if (stringValue.length > 0) {
120 |         normalized[key] = stringValue;
121 |       }
122 |     }
123 |   }
124 | 
125 |   return normalized;
126 | }
127 | 
128 | function stringify(input: unknown): string {
129 |   if (typeof input === 'string') {
130 |     return input.trim();
131 |   }
132 |   return String(input).trim();
133 | }
```

src/utils/markdown.ts
```
1 | import { promises as fs } from 'node:fs';
2 | import path from 'node:path';
3 | 
4 | export async function loadPhases(workflowPath: string): Promise<Set<string>> {
5 |   const content = await fs.readFile(workflowPath, 'utf8');
6 |   const headingRegex = /^(##|###)\s+(.+)$/gm;
7 |   const phases = new Set<string>();
8 |   let match: RegExpExecArray | null;
9 |   while ((match = headingRegex.exec(content)) !== null) {
10 |     phases.add(match[2].trim());
11 |   }
12 |   return phases;
13 | }
14 | 
15 | export function extractTitleFromMarkdown(body: string, filePath: string): string {
16 |   const headingMatch = body.match(/^#\s+(.+)$/m);
17 |   if (headingMatch) {
18 |     return headingMatch[1].trim();
19 |   }
20 |   const base = path.basename(filePath, path.extname(filePath));
21 |   const words = base.split(/[-_]+/).filter(Boolean);
22 |   if (words.length === 0) {
23 |     return base;
24 |   }
25 |   return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
26 | }
```

src/utils/safety.test.ts
```
1 | import { strict as assert } from "node:assert";
2 | 
3 | import { describe, test } from "@jest/globals";
4 | 
5 | import { capPayload, redactSecrets } from "./safety.ts";
6 | 
7 | describe("safety utilities", () => {
8 |   test("redactSecrets removes sensitive fields without mutating input", () => {
9 |     const sensitiveInput = {
10 |       apiKey: "12345",
11 |       nested: {
12 |         SECRET_TOKEN: "abcd",
13 |       },
14 |       safe: "value",
15 |     };
16 | 
17 |     const sensitiveResult = redactSecrets(sensitiveInput) as typeof sensitiveInput;
18 |     assert.notStrictEqual(sensitiveResult, sensitiveInput);
19 |     assert.equal(sensitiveResult.apiKey, "[redacted]");
20 |     assert.equal(sensitiveResult.nested.SECRET_TOKEN, "[redacted]");
21 |     assert.equal(sensitiveResult.safe, "value");
22 |     assert.equal(sensitiveInput.apiKey, "12345");
23 |     assert.equal(sensitiveInput.nested.SECRET_TOKEN, "abcd");
24 | 
25 |     const arrayInput = [
26 |       { token: "secret" },
27 |       {
28 |         list: [
29 |           { key: "value" },
30 |           { inner: { authToken: "hidden" } },
31 |         ],
32 |       },
33 |     ];
34 |     const arrayResult = redactSecrets(arrayInput) as typeof arrayInput;
35 |     const firstItem = arrayResult[0] as unknown as Record<string, string>;
36 |     assert.equal(firstItem.token, "[redacted]");
37 |     const nestedWrapper = arrayResult[1] as unknown as { list: Array<Record<string, any>> };
38 |     const nestedList = nestedWrapper.list;
39 |     assert.equal(nestedList[0].key, "[redacted]");
40 |     const inner = nestedList[1].inner as Record<string, string>;
41 |     assert.equal(inner.authToken, "[redacted]");
42 |     const originalFirst = arrayInput[0] as unknown as Record<string, string>;
43 |     assert.equal(originalFirst.token, "secret");
44 | 
45 |     assert.equal(redactSecrets("plain"), "plain");
46 |     assert.equal(redactSecrets(42), 42);
47 |   });
48 | 
49 |   test("capPayload truncates payloads with trailing metadata", () => {
50 |     const smallPayload = "small";
51 |     assert.equal(capPayload(smallPayload, 10), smallPayload);
52 | 
53 |     const payload = "a".repeat(200);
54 |     const limit = 64;
55 |     const truncated = capPayload(payload, limit);
56 |     assert.equal(Buffer.byteLength(truncated, "utf8"), limit);
57 |     const truncatedNote = truncated.match(/\[truncated (\d+) bytes\]$/);
58 |     assert.ok(truncatedNote);
59 |     const truncatedCount = Number(truncatedNote?.[1] ?? "0");
60 |     assert.ok(truncatedCount > 0);
61 | 
62 |     const snowman = "\u2603";
63 |     const multiByte = snowman.repeat(10);
64 |     const multiLimit = 26;
65 |     const capped = capPayload(multiByte, multiLimit);
66 |     const noteMatch = capped.match(/\[truncated (\d+) bytes\]$/);
67 |     assert.ok(noteMatch);
68 |     assert.ok(Buffer.byteLength(capped, "utf8") <= multiLimit);
69 |     const multiCount = Number(noteMatch?.[1] ?? "0");
70 |     assert.ok(multiCount > 0);
71 | 
72 |     const tinyLimit = 8;
73 |     const tiny = capPayload(payload, tinyLimit);
74 |     assert.ok(Buffer.byteLength(tiny, "utf8") <= tinyLimit);
75 | 
76 |     const preciseLimit = 40;
77 |     const precisePayload = "b".repeat(preciseLimit + 15);
78 |     const preciseResult = capPayload(precisePayload, preciseLimit);
79 |     assert.equal(Buffer.byteLength(preciseResult, "utf8"), preciseLimit);
80 |     const preciseMatch = preciseResult.match(/\[truncated (\d+) bytes\]$/);
81 |     assert.ok(preciseMatch);
82 |     const truncatedBytesMeasured = Number(preciseMatch?.[1] ?? "0");
83 |     const prefix = preciseResult.slice(0, preciseResult.length - (preciseMatch?.[0].length ?? 0));
84 |     const prefixBytes = Buffer.byteLength(prefix, "utf8");
85 |     const expectedTruncated = Buffer.byteLength(precisePayload, "utf8") - prefixBytes;
86 |     assert.equal(truncatedBytesMeasured, expectedTruncated);
87 |   });
88 | });
```

src/utils/safety.ts
```
1 | const SENSITIVE_KEY_PATTERN = /(key|secret|token)/i;
2 | 
3 | const REDACTED_VALUE = "[redacted]";
4 | 
5 | export type Redactable = unknown;
6 | 
7 | const isPlainObject = (value: unknown): value is Record<string, unknown> => {
8 |   return (
9 |     typeof value === "object" &&
10 |     value !== null &&
11 |     Object.getPrototypeOf(value) === Object.prototype
12 |   );
13 | };
14 | 
15 | const cloneArrayWithRedaction = (input: unknown[]): unknown[] => {
16 |   return input.map((item) => redactSecrets(item));
17 | };
18 | 
19 | const cloneObjectWithRedaction = (input: Record<string, unknown>): Record<string, unknown> => {
20 |   const result: Record<string, unknown> = {};
21 | 
22 |   for (const [key, value] of Object.entries(input)) {
23 |     if (SENSITIVE_KEY_PATTERN.test(key)) {
24 |       result[key] = REDACTED_VALUE;
25 |       continue;
26 |     }
27 | 
28 |     result[key] = redactSecrets(value);
29 |   }
30 | 
31 |   return result;
32 | };
33 | 
34 | export function redactSecrets<T extends Redactable>(data: T): T {
35 |   if (Array.isArray(data)) {
36 |     return cloneArrayWithRedaction(data) as unknown as T;
37 |   }
38 | 
39 |   if (isPlainObject(data)) {
40 |     return cloneObjectWithRedaction(data) as unknown as T;
41 |   }
42 | 
43 |   return data;
44 | }
45 | 
46 | const formatTruncationMessage = (bytesRemoved: number): string => {
47 |   return `[truncated ${bytesRemoved} bytes]`;
48 | };
49 | 
50 | const utf8ByteLength = (value: string): number => Buffer.byteLength(value, "utf8");
51 | 
52 | const decodeUtf8Safely = (input: Buffer): { buffer: Buffer; text: string } => {
53 |   let current = input;
54 |   const decoder = new TextDecoder("utf-8", { fatal: true });
55 | 
56 |   while (current.length > 0) {
57 |     try {
58 |       const text = decoder.decode(current);
59 |       return { buffer: current, text };
60 |     } catch {
61 |       current = current.subarray(0, current.length - 1);
62 |     }
63 |   }
64 | 
65 |   return { buffer: Buffer.alloc(0), text: "" };
66 | };
67 | 
68 | const clampSuffixToLimit = (suffix: string, limit: number): string => {
69 |   if (limit <= 0) {
70 |     return "";
71 |   }
72 | 
73 |   let result = suffix;
74 |   while (utf8ByteLength(result) > limit && result.length > 0) {
75 |     result = result.slice(0, result.length - 1);
76 |   }
77 | 
78 |   return result;
79 | };
80 | 
81 | export function capPayload(payload: string, maxSize: number = 1024 * 1024): string {
82 |   if (maxSize <= 0) {
83 |     return "";
84 |   }
85 | 
86 |   const payloadBytes = utf8ByteLength(payload);
87 |   if (payloadBytes <= maxSize) {
88 |     return payload;
89 |   }
90 | 
91 |   const buffer = Buffer.from(payload, "utf8");
92 |   let targetLength = Math.min(maxSize, buffer.length);
93 | 
94 |   while (targetLength >= 0) {
95 |     const { buffer: validBuffer, text: truncatedText } = decodeUtf8Safely(buffer.subarray(0, targetLength));
96 |     const truncatedBytes = payloadBytes - validBuffer.length;
97 |     const suffix = formatTruncationMessage(truncatedBytes);
98 |     const suffixBytes = utf8ByteLength(suffix);
99 | 
100 |     if (suffixBytes > maxSize) {
101 |       return clampSuffixToLimit(suffix, maxSize);
102 |     }
103 | 
104 |     const allowedPrefixBytes = maxSize - suffixBytes;
105 |     if (allowedPrefixBytes <= 0) {
106 |       return clampSuffixToLimit(suffix, maxSize);
107 |     }
108 | 
109 |     if (validBuffer.length <= allowedPrefixBytes) {
110 |       return `${truncatedText}${suffix}`;
111 |     }
112 | 
113 |     targetLength = Math.min(allowedPrefixBytes, validBuffer.length - 1);
114 |   }
115 | 
116 |   const fallbackSuffix = formatTruncationMessage(payloadBytes);
117 |   return clampSuffixToLimit(fallbackSuffix, maxSize);
118 | }
```

test/adapters/enrichment.test.ts
```
1 | import { describe, expect, test } from '@jest/globals';
2 | import { enrichTasks } from '../../src/enrichment/index.ts';
3 | 
4 | describe('enrichment pipeline', () => {
5 |   test('does not mutate tasks and swallows missing artifacts', async () => {
6 |     const tasks = [
7 |       { id: 1, title: 'T1', description: '', status: 'pending', dependencies: [], priority: 'low', details: '', testStrategy: '', subtasks: [] },
8 |     ];
9 |     const res = await enrichTasks(tasks as any, process.cwd());
10 |     expect(res.tasks).not.toBe(tasks);
11 |     expect(res.tasks[0].metadata?.enrichment?.complexity).toBeUndefined();
12 |     expect(Array.isArray(res.warnings)).toBe(true);
13 |   });
14 | });
15 | 
```

test/adapters/ingest.schema-path.test.ts
```
1 | import { chdir, cwd } from 'node:process';
2 | import { mkdtemp, rm } from 'node:fs/promises';
3 | import { tmpdir } from 'node:os';
4 | import { join, resolve } from 'node:path';
5 | 
6 | import { describe, expect, test, afterEach, beforeEach } from '@jest/globals';
7 | 
8 | import { ingestTasks } from '../../src/adapters/taskmaster/ingest.ts';
9 | 
10 | const FIXTURE = resolve('tests/fixtures/taskmaster/simple-tasks.json');
11 | 
12 | describe('ingest schema resolution', () => {
13 |   const originalCwd = cwd();
14 |   let sandbox = '';
15 | 
16 |   beforeEach(async () => {
17 |     sandbox = await mkdtemp(join(tmpdir(), 'ingest-cwd-sandbox-'));
18 |     chdir(sandbox);
19 |   });
20 | 
21 |   afterEach(async () => {
22 |     chdir(originalCwd);
23 |     if (sandbox) {
24 |       await rm(sandbox, { recursive: true, force: true });
25 |       sandbox = '';
26 |     }
27 |   });
28 | 
29 |   test('ingestTasks works when CWD is not repo root', async () => {
30 |     const { tasks, report } = await ingestTasks(FIXTURE, { tag: 'master' });
31 |     expect(Array.isArray(tasks)).toBe(true);
32 |     expect(report).toHaveProperty('total');
33 |     expect(tasks.length).toBeGreaterThan(0);
34 |   });
35 | });
36 | 
```

test/cli/prompts-cli.test.ts
```
1 | import { mkdtemp, copyFile, readFile, rm } from 'node:fs/promises';
2 | import { tmpdir } from 'node:os';
3 | import { join, dirname, resolve } from 'node:path';
4 | import { fileURLToPath } from 'node:url';
5 | 
6 | import { describe, expect, test, beforeEach, afterEach } from '@jest/globals';
7 | 
8 | import {
9 |   buildStatusSummary,
10 |   formatGraphDot,
11 |   loadIngest,
12 |   runAdvance,
13 |   runGraph,
14 |   runNext,
15 |   type TaskLocatorOptions
16 | } from '../../src/cli/actions.ts';
17 | import type { CanonicalTaskStatus } from '../../src/types/prompts-task.js';
18 | 
19 | const __filename = fileURLToPath(import.meta.url);
20 | const __dirname = dirname(__filename);
21 | const ROOT_DIR = resolve(__dirname, '..', '..');
22 | const FIXTURE_DIR = resolve(__dirname, '../../tests/fixtures/taskmaster');
23 | const SIMPLE_FIXTURE = join(FIXTURE_DIR, 'simple-tasks.json');
24 | 
25 | const toLocator = (tasksPath: string): TaskLocatorOptions => ({
26 |   tasksPath,
27 |   tag: 'master',
28 |   cwd: ROOT_DIR
29 | });
30 | 
31 | describe('prompts CLI actions', () => {
32 |   let tempDir: string;
33 |   let tempTasksPath: string;
34 | 
35 |   beforeEach(async () => {
36 |     tempDir = await mkdtemp(join(tmpdir(), 'prompts-cli-'));
37 |     tempTasksPath = join(tempDir, 'tasks.json');
38 |     await copyFile(SIMPLE_FIXTURE, tempTasksPath);
39 |   });
40 | 
41 |   afterEach(async () => {
42 |     await rm(tempDir, { recursive: true, force: true });
43 |   });
44 | 
45 |   test('loadIngest parses tasks and returns normalization report', async () => {
46 |     const result = await loadIngest(toLocator(SIMPLE_FIXTURE));
47 |     expect(result.tasks).toHaveLength(2);
48 |     expect(result.report.total).toBe(2);
49 |   });
50 | 
51 |   test('runNext returns ready task snapshot', async () => {
52 |     const result = await runNext(toLocator(SIMPLE_FIXTURE));
53 |     expect(result.task?.id).toBe(1);
54 |     expect(result.ready).toHaveLength(1);
55 |   });
56 | 
57 |   test('runGraph exports nodes and formatGraphDot renders DOT output', async () => {
58 |     const graph = await runGraph(toLocator(SIMPLE_FIXTURE));
59 |     expect(graph.nodes).toHaveLength(2);
60 |     const dot = formatGraphDot(graph.nodes);
61 |     expect(dot.startsWith('digraph TaskGraph {')).toBe(true);
62 |     expect(dot.includes('"1"')).toBe(true);
63 |   });
64 | 
65 |   test('buildStatusSummary reports counts, ready list, and next task', async () => {
66 |     const summary = await buildStatusSummary(toLocator(SIMPLE_FIXTURE));
67 |     expect(summary.total).toBe(2);
68 |     expect(summary.summary.pending).toBeGreaterThanOrEqual(1);
69 |     expect(summary.next?.id).toBe(1);
70 |     expect(Array.isArray(summary.ready)).toBe(true);
71 |   });
72 | 
73 |   test('runAdvance honours write toggle and leaves file untouched without persistence', async () => {
74 |     const status: CanonicalTaskStatus = 'done';
75 |     const result = await runAdvance(toLocator(tempTasksPath), 1, status, false);
76 |     expect(result.persisted).toBe(false);
77 |     expect(result.task.status).toBe('pending');
78 | 
79 |     const fileContent = await readFile(tempTasksPath, 'utf8');
80 |     const document = JSON.parse(fileContent) as { master: { tasks: Array<{ status: string }> } };
81 |     expect(document.master.tasks[0]?.status).toBe('pending');
82 |   });
83 | });
```

test/integration/agent-smoke.test.ts
```
1 | import { mkdtemp, copyFile, rm } from 'node:fs/promises';
2 | import { tmpdir } from 'node:os';
3 | import { join, dirname, resolve } from 'node:path';
4 | import { fileURLToPath } from 'node:url';
5 | 
6 | import { describe, expect, test, afterEach } from '@jest/globals';
7 | 
8 | import { TaskService } from '../../src/mcp/task-service.ts';
9 | import {
10 |   createPromptsTools,
11 |   NextTaskInput,
12 |   SetTaskStatusInput,
13 |   GraphExportInput,
14 | } from '../../packages/prompts-tools/src/index.ts';
15 | 
16 | const __filename = fileURLToPath(import.meta.url);
17 | const __dirname = dirname(__filename);
18 | 
19 | const FIXTURE_DIR = resolve(__dirname, '../../tests/fixtures/taskmaster');
20 | const SIMPLE_FIXTURE = join(FIXTURE_DIR, 'simple-tasks.json');
21 | 
22 | const createTempService = async (writeEnabled: boolean) => {
23 |   const dir = await mkdtemp(join(tmpdir(), 'agent-smoke-'));
24 |   const tasksPath = join(dir, 'tasks.json');
25 |   await copyFile(SIMPLE_FIXTURE, tasksPath);
26 |   const service = new TaskService({ tasksPath, tag: 'master', writeEnabled });
27 |   await service.load();
28 |   return { dir, service };
29 | };
30 | 
31 | describe('Agent demo smoke test', () => {
32 |   let tempDir = '';
33 | 
34 |   afterEach(async () => {
35 |     if (tempDir) {
36 |       await rm(tempDir, { recursive: true, force: true });
37 |       tempDir = '';
38 |     }
39 |   });
40 | 
41 |   test('agent plans via next_task and completes with set_task_status, then inspects graph', async () => {
42 |     const temp = await createTempService(true); // enable persistence for status updates
43 |     tempDir = temp.dir;
44 | 
45 |     // Prime context: expose a minimal Task API and create tool adapters
46 |     const tools = createPromptsTools({
47 |       service: {
48 |         list: () => temp.service.list(),
49 |         next: () => temp.service.next(),
50 |         graph: () => temp.service.graph(),
51 |         setStatus: (id, status) => temp.service.setStatus(id, status),
52 |       },
53 |     });
54 | 
55 |     // "Agent" step 1: discover the next task
56 |     const nextArgs = NextTaskInput.parse({});
57 |     const nextResult = await tools.nextTask.run(nextArgs);
58 |     expect(nextResult).toHaveProperty('task');
59 |     const task = nextResult.task as { id?: number; title?: string } | null;
60 |     expect(task && typeof task.id === 'number').toBe(true);
61 | 
62 |     // "Agent" step 2: mark it done
63 |     const setArgs = SetTaskStatusInput.parse({ id: task!.id as number, status: 'done' });
64 |     const setResult = await tools.setTaskStatus.run(setArgs);
65 |     expect(setResult.persisted).toBe(true);
66 |     const updated = setResult.task as { status?: string };
67 |     expect(updated.status).toBe('done');
68 | 
69 |     // "Agent" step 3: inspect graph to confirm consistency
70 |     const graphArgs = GraphExportInput.parse({});
71 |     const graph = await tools.graphExport.run(graphArgs);
72 |     expect(Array.isArray(graph.nodes)).toBe(true);
73 |     expect(graph.nodes.length).toBeGreaterThan(0);
74 |   });
75 | });
76 | 
```

test/integration/loop-execution.test.ts
```
1 | import { mkdtemp, rm, writeFile } from 'node:fs/promises';
2 | import { tmpdir } from 'node:os';
3 | import { join } from 'node:path';
4 | 
5 | import { describe, expect, test, afterEach } from '@jest/globals';
6 | 
7 | import { TaskService } from '../../src/mcp/task-service.ts';
8 | import { createRunTaskActionTool } from '../../src/tools/definitions/run-task-action.ts';
9 | 
10 | describe('Full-loop execution (task action)', () => {
11 |   let tempDir = '';
12 | 
13 |   afterEach(async () => {
14 |     if (tempDir) {
15 |       await rm(tempDir, { recursive: true, force: true });
16 |       tempDir = '';
17 |     }
18 |   });
19 | 
20 |   test('resolve action -> dry-run -> live run (gated)', async () => {
21 |     const service = new TaskService({ tasksPath: '.taskmaster/tasks/tasks.json', tag: 'master', writeEnabled: true });
22 |     await service.load();
23 | 
24 |     // Pick a ready task (use the new execution wiring task 37)
25 |     const taskId = 37;
26 | 
27 |     // Create a temp actions file mapping task 37 to a harmless, allowed script
28 |     tempDir = await mkdtemp(join(tmpdir(), 'actions-'));
29 |     const actionsPath = join(tempDir, 'actions.json');
30 |     await writeFile(actionsPath, JSON.stringify({ "37": { script: "noop" } }, null, 2), 'utf8');
31 | 
32 |     const tool = createRunTaskActionTool(service);
33 | 
34 |     // Dry run first (does not require exec enable)
35 |     const dry = await tool.handler({ taskId, actionsPath, dryRun: true });
36 |     expect(dry.isError).toBe(false);
37 |     expect(String(dry.summary)).toContain('DRY RUN: npm run --silent noop');
38 | 
39 |     // Live run gated by env flag
40 |     process.env.PROMPTS_EXEC_ALLOW = '1';
41 |     const live = await tool.handler({ taskId, actionsPath, dryRun: false, timeoutMs: 60_000 });
42 |     expect(live.isError).toBe(false);
43 |     expect(live.ok).toBe(true);
44 |   });
45 | });
```

test/integration/resources.test.ts
```
1 | import { strict as assert } from "node:assert";
2 | 
3 | import { describe, test } from "@jest/globals";
4 | import { Client } from "@modelcontextprotocol/sdk/client/index.js";
5 | import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
6 | 
7 | import { secureLogger } from "../../src/logger.ts";
8 | import { createServer } from "../../src/server.ts";
9 | import { registerPromptResources } from "../../src/prompts/register.ts";
10 | 
11 | describe("prompt resources registration", () => {
12 |   test("MCP server exposes prompt resources", async () => {
13 |     const server = createServer();
14 |     await registerPromptResources(server, secureLogger);
15 | 
16 |     const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
17 | 
18 |     await server.connect(serverTransport);
19 | 
20 |     const client = new Client({
21 |       name: "resource-test-client",
22 |       version: "1.0.0",
23 |     });
24 | 
25 |     await client.connect(clientTransport);
26 | 
27 |     try {
28 |       const result = await client.listResources();
29 |       const resourceNames = result.resources.map((resource) => resource.name);
30 | 
31 |       const expected = [
32 |         "instruction-file",
33 |         "planning-process",
34 |         "scope-control",
35 |         "integration-test",
36 |         "regression-guard",
37 |         "release-notes",
38 |       ];
39 | 
40 |       for (const name of expected) {
41 |         assert.ok(resourceNames.includes(name), `Expected resource ${name} to be registered`);
42 |       }
43 | 
44 |       const releaseNotes = result.resources.find((resource) => resource.name === "release-notes");
45 |       assert.ok(releaseNotes);
46 |       assert.equal(releaseNotes?.uri.startsWith("file://"), true);
47 |       const meta = (releaseNotes?._meta ?? {}) as Record<string, unknown>;
48 |       assert.equal(typeof meta.contentPreview, "string");
49 |       assert.equal(meta.phase, "P7 Release & Ops");
50 |     } finally {
51 |       await client.close();
52 |       await server.close();
53 |       await clientTransport.close();
54 |       await serverTransport.close();
55 |     }
56 |   });
57 | });
```

test/integration/run-lint.test.ts
```
1 | import { describe, expect, test } from '@jest/globals';
2 | import { createRunLintTool } from '../../src/tools/definitions/run-domain.ts';
3 | 
4 | describe('workflow/run_lint', () => {
5 |   test('dry-run returns the expected command summary', async () => {
6 |     const tool = createRunLintTool();
7 |     const res: any = await tool.handler({ dryRun: true });
8 |     expect(res.isError).toBe(false);
9 |     expect(String(res.summary)).toMatch(/npm run --silent lint/);
10 |   });
11 | 
12 |   test('live run is gated by PROMPTS_EXEC_ALLOW and returns disabled error', async () => {
13 |     const tool = createRunLintTool();
14 |     const res: any = await tool.handler({ dryRun: false });
15 |     expect(res.isError).toBe(true);
16 |     expect(String(res.summary)).toMatch(/Execution disabled/);
17 |   });
18 | });
19 | 
```

test/integration/run-script.error-event.test.ts
```
1 | import { describe, expect, test } from '@jest/globals';
2 | 
3 | import { createRunScriptTool } from '../../src/tools/definitions/run-script.ts';
4 | 
5 | describe('workflow/run_script error handling', () => {
6 |   test('resolves on spawn error when npm is not found', async () => {
7 |     // Enable execution path to reach spawn
8 |     process.env.PROMPTS_EXEC_ALLOW = '1';
9 | 
10 |     const originalPath = process.env.PATH;
11 |     try {
12 |       process.env.PATH = '';
13 |       const tool = createRunScriptTool();
14 |       const result = await tool.handler({ script: 'validate:metadata', dryRun: false, timeoutMs: 2000 });
15 |       expect(result.isError).toBe(true);
16 |       expect(String(result.summary)).toMatch(/Failed to start process|ENOENT/);
17 |     } finally {
18 |       process.env.PATH = originalPath;
19 |       delete process.env.PROMPTS_EXEC_ALLOW;
20 |     }
21 |   });
22 | });
23 | 
```

test/integration/run-script.live-enabled.test.ts
```
1 | import { describe, expect, test } from '@jest/globals';
2 | 
3 | import { createRunScriptTool } from '../../src/tools/definitions/run-script.ts';
4 | 
5 | describe('workflow/run_script live execution (gated)', () => {
6 |   test('executes allowlisted noop when PROMPTS_EXEC_ALLOW=1', async () => {
7 |     const prev = process.env.PROMPTS_EXEC_ALLOW;
8 |     process.env.PROMPTS_EXEC_ALLOW = '1';
9 |     try {
10 |       const tool = createRunScriptTool();
11 |       const result: any = await tool.handler({ script: 'noop', dryRun: false, timeoutMs: 2000 });
12 |       expect(result.isError).toBe(false);
13 |       expect(result.ok).toBe(true);
14 |       expect(result.exitCode).toBe(0);
15 |       expect(String(result.summary)).toMatch(/Exited with code 0/);
16 |     } finally {
17 |       if (prev === undefined) delete process.env.PROMPTS_EXEC_ALLOW; else process.env.PROMPTS_EXEC_ALLOW = prev;
18 |     }
19 |   });
20 | });
21 | 
```

test/integration/run-script.test.ts
```
1 | import { describe, expect, test } from '@jest/globals';
2 | 
3 | import { createRunScriptTool } from '../../src/tools/definitions/run-script.ts';
4 | 
5 | describe('workflow/run_script tool', () => {
6 |   test('rejects when execution is disabled', async () => {
7 |     delete process.env.PROMPTS_EXEC_ALLOW;
8 |     const tool = createRunScriptTool();
9 |     const result = await tool.handler({ script: 'validate:metadata', dryRun: false, timeoutMs: 2000 });
10 |     expect(result.isError).toBe(true);
11 |   });
12 | 
13 |   test('runs in dry-run mode and lists command', async () => {
14 |     const tool = createRunScriptTool();
15 |     const result = await tool.handler({ script: 'validate:metadata', dryRun: true });
16 |     expect(result.isError).toBe(false);
17 |     expect(String(result.summary)).toContain('npm run --silent validate:metadata');
18 |   });
19 | });
20 | 
```

test/integration/run-task-action.error-cases.test.ts
```
1 | import { mkdtemp, writeFile, rm, cp } from 'node:fs/promises';
2 | import { tmpdir } from 'node:os';
3 | import { join } from 'node:path';
4 | 
5 | import { describe, expect, test, afterEach } from '@jest/globals';
6 | 
7 | import { TaskService } from '../../src/mcp/task-service.ts';
8 | import { createRunTaskActionTool } from '../../src/tools/definitions/run-task-action.ts';
9 | 
10 | const createTempService = async (doc: unknown) => {
11 |   const dir = await mkdtemp(join(tmpdir(), 'run-task-action-err-'));
12 |   const tasksPath = join(dir, 'tasks.json');
13 |   await writeFile(tasksPath, JSON.stringify(doc, null, 2), 'utf8');
14 |   const service = new TaskService({ tasksPath, tag: 'master', writeEnabled: false });
15 |   await service.load();
16 |   return { dir, service } as const;
17 | };
18 | 
19 | describe('workflow/run_task_action error cases', () => {
20 |   let tempDir = '';
21 | 
22 |   afterEach(async () => {
23 |     if (tempDir) {
24 |       await rm(tempDir, { recursive: true, force: true });
25 |       tempDir = '';
26 |     }
27 |   });
28 | 
29 |   test('returns error when no mapping exists (no metadata, no actions.json)', async () => {
30 |     const doc = {
31 |       master: {
32 |         tasks: [
33 |           {
34 |             id: 1,
35 |             title: 'T1',
36 |             description: '',
37 |             status: 'pending',
38 |             dependencies: [],
39 |             priority: 'medium',
40 |             details: '',
41 |             testStrategy: '',
42 |             subtasks: [],
43 |           },
44 |         ],
45 |       },
46 |     };
47 |     const temp = await createTempService(doc);
48 |     tempDir = temp.dir;
49 | 
50 |     const tool = createRunTaskActionTool(temp.service);
51 |     const res = await tool.handler({ taskId: 1, dryRun: true });
52 |     expect(res.isError).toBe(true);
53 |     expect(String(res.summary)).toMatch(/No action mapped/i);
54 |   });
55 | 
56 |   test('ignores invalid actions.json and returns a clear error', async () => {
57 |     const doc = {
58 |       master: {
59 |         tasks: [
60 |           {
61 |             id: 2,
62 |             title: 'T2',
63 |             description: '',
64 |             status: 'pending',
65 |             dependencies: [],
66 |             priority: 'low',
67 |             details: '',
68 |             testStrategy: '',
69 |             subtasks: [],
70 |           },
71 |         ],
72 |       },
73 |     };
74 |     const temp = await createTempService(doc);
75 |     tempDir = temp.dir;
76 |     const badPath = join(temp.dir, 'actions.bad.json');
77 |     await writeFile(badPath, '{"oops": ', 'utf8'); // intentionally invalid JSON
78 | 
79 |     const tool = createRunTaskActionTool(temp.service);
80 |     const res = await tool.handler({ taskId: 2, actionsPath: badPath, dryRun: true });
81 |     expect(res.isError).toBe(true);
82 |     expect(String(res.summary)).toMatch(/No action mapped/i);
83 |   });
84 | 
85 |   test('falls back to actions.json when metadata.action is malformed', async () => {
86 |     const doc = {
87 |       master: {
88 |         tasks: [
89 |           {
90 |             id: 3,
91 |             title: 'T3',
92 |             description: '',
93 |             status: 'pending',
94 |             dependencies: [],
95 |             priority: 'medium',
96 |             details: '',
97 |             testStrategy: '',
98 |             subtasks: [],
99 |             metadata: { action: { script: 123, args: 'nope' } }, // malformed
100 |           },
101 |         ],
102 |       },
103 |     } as any;
104 |     const temp = await createTempService(doc);
105 |     tempDir = temp.dir;
106 | 
107 |     // Provide a valid mapping via actions.json
108 |     const actionsPath = join(temp.dir, 'actions.json');
109 |     await writeFile(actionsPath, JSON.stringify({ '3': { script: 'noop' } }, null, 2), 'utf8');
110 | 
111 |     const tool = createRunTaskActionTool(temp.service);
112 |     const res = await tool.handler({ taskId: 3, actionsPath, dryRun: true });
113 |     expect(res.isError).toBe(false);
114 |     expect(String(res.summary)).toMatch(/DRY RUN: npm run --silent noop/);
115 |   });
116 | });
```

test/integration/server-advertises.test.ts
```
1 | import { strict as assert } from 'node:assert';
2 | import { describe, test } from '@jest/globals';
3 | import { Client } from '@modelcontextprotocol/sdk/client/index.js';
4 | import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
5 | 
6 | import { secureLogger } from '../../src/logger.ts';
7 | import { createServer } from '../../src/server.ts';
8 | import { registerAllTools } from '../../src/tools/index.ts';
9 | import { TaskService } from '../../src/mcp/task-service.ts';
10 | import { StateStore } from '../../src/state/StateStore.ts';
11 | 
12 | describe('server advertises unified toolset', () => {
13 |   test('lists prompt, workflow, and task tools without duplicates', async () => {
14 |     const server = createServer();
15 | 
16 |     const service = new TaskService({
17 |       tasksPath: '.taskmaster/tasks/tasks.json',
18 |       tag: 'master',
19 |       writeEnabled: false,
20 |     });
21 |     await service.load();
22 | 
23 |     const stateStore = new StateStore(process.cwd());
24 |     await stateStore.load();
25 | 
26 |     await registerAllTools(server, secureLogger, { service, stateStore });
27 | 
28 |     const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
29 |     await server.connect(serverTransport);
30 | 
31 |     const client = new Client({ name: 'advertise-client', version: '1.0.0' });
32 |     await client.connect(clientTransport);
33 | 
34 |     try {
35 |       const tools = await client.listTools();
36 |       const names = tools.tools.map((t) => t.name);
37 | 
38 |       // Expect at least a few known tools from each domain
39 |       for (const expected of [
40 |         'instruction-file', // prompt tool
41 |         'refresh_metadata', // workflow tool
42 |         'export_task_list', // workflow tool
43 |         'next_task', // task tool
44 |         'list_tasks', // task tool
45 |         'workflow/run_task_action',
46 |         'workflow/run_tests',
47 |         'workflow/run_build',
48 |         'workflow/run_lint',
49 |       ]) {
50 |         assert.ok(names.includes(expected), `expected tool ${expected}`);
51 |       }
52 | 
53 |       // No duplicates
54 |       const unique = new Set(names);
55 |       assert.equal(unique.size, names.length, 'expected unique tool names');
56 |     } finally {
57 |       await client.close();
58 |       await server.close();
59 |       await clientTransport.close();
60 |       await serverTransport.close();
61 |     }
62 |   });
63 | });
```

test/integration/tools.test.ts
```
1 | import { strict as assert } from "node:assert";
2 | import { mkdtemp, rm } from "node:fs/promises";
3 | import { tmpdir } from "node:os";
4 | import { join } from "node:path";
5 | 
6 | import { describe, test } from "@jest/globals";
7 | import { Client } from "@modelcontextprotocol/sdk/client/index.js";
8 | import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
9 | 
10 | import { secureLogger } from "../../src/logger.ts";
11 | import { createServer } from "../../src/server.ts";
12 | import { registerPromptResources, registerPromptTools } from "../../src/prompts/register.ts";
13 | import { StateStore } from "../../src/state/StateStore.ts";
14 | import { registerWorkflowTools } from "../../src/tools/register.ts";
15 | 
16 | describe("prompt and workflow tools", () => {
17 |   test("register tools and serve content over MCP", async () => {
18 |     const server = createServer();
19 |     await registerPromptResources(server, secureLogger, { baseDir: process.cwd() });
20 |     await registerPromptTools(server, secureLogger, { baseDir: process.cwd() });
21 | 
22 |     const projectRoot = await mkdtemp(join(tmpdir(), "mcp-tools-"));
23 |     const stateStore = new StateStore(projectRoot);
24 |     await stateStore.load();
25 |     registerWorkflowTools(server, secureLogger, { stateStore });
26 | 
27 |     const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
28 |     await server.connect(serverTransport);
29 | 
30 |     const client = new Client({
31 |       name: "tool-test-client",
32 |       version: "1.0.0",
33 |     });
34 |     await client.connect(clientTransport);
35 | 
36 |     try {
37 |       const tools = await client.listTools();
38 |       const toolNames = tools.tools.map((tool) => tool.name);
39 |       for (const expected of [
40 |         "instruction-file",
41 |         "planning-process",
42 |         "scope-control",
43 |         "integration-test",
44 |         "regression-guard",
45 |         "release-notes",
46 |         "refresh_metadata",
47 |         "export_task_list",
48 |       ]) {
49 |         assert.ok(toolNames.includes(expected), `Expected tool ${expected}`);
50 |       }
51 | 
52 |       const result = await client.callTool({
53 |         name: "instruction-file",
54 |         arguments: {},
55 |       });
56 |       const contentItems = Array.isArray(result.content) ? result.content : [];
57 |       const [content] = contentItems;
58 |       assert.ok(content && content.type === "text");
59 |       const text = content.text;
60 |       assert.ok(text.includes("Instruction File"));
61 |       assert.ok(text.includes("Served via MCP prompt tool"));
62 | 
63 |       const advanceResult = await client.callTool({
64 |         name: "advance_state",
65 |         arguments: {
66 |           id: "instruction-file",
67 |           outputs: { status: "ok" },
68 |           artifacts: [
69 |             {
70 |               name: "release_notes_context",
71 |               source: "advance_state",
72 |               uri: "file://context.json",
73 |             },
74 |           ],
75 |         },
76 |       });
77 | 
78 |       const advanceContent = Array.isArray(advanceResult.content) ? advanceResult.content[0] : undefined;
79 |       assert.ok(advanceContent && advanceContent.type === "text");
80 |       assert.ok(advanceContent.text.includes("Recorded completion"));
81 | 
82 |       const state = stateStore.getState();
83 |       assert.equal(state.completedTools.length, 1);
84 |       assert.equal(state.completedTools[0].id, "instruction-file");
85 |       assert.equal(state.artifacts.release_notes_context.uri, "file://context.json");
86 | 
87 |       const exportResult = await client.callTool({
88 |         name: "export_task_list",
89 |         arguments: {},
90 |       });
91 |       const exportStructured = exportResult.structuredResult as Record<string, unknown>;
92 |       assert.ok(exportStructured && exportStructured.ok === true, "expected ok result from export_task_list");
93 |       const tasks = Array.isArray(exportStructured.tasks) ? exportStructured.tasks : [];
94 |       assert.ok(tasks.length > 0, "expected tasks from export_task_list");
95 |       const task = tasks.find((item) => (item as { id?: string }).id === "instruction-file");
96 |       assert.ok(task, "expected instruction-file task in export");
97 | 
98 |       const refreshResult = await client.callTool({
99 |         name: "refresh_metadata",
100 |         arguments: {},
101 |       });
102 |       const refreshContent = Array.isArray(refreshResult.content) ? refreshResult.content[0] : undefined;
103 |       assert.ok(refreshContent && refreshContent.type === "text");
104 |       assert.ok(refreshContent.text.includes("Metadata validated"));
105 |     } finally {
106 |       await client.close();
107 |       await server.close();
108 |       await clientTransport.close();
109 |       await serverTransport.close();
110 |       await rm(projectRoot, { recursive: true, force: true });
111 |     }
112 |   });
113 | });
```

test/mastra/prompts-tools.test.ts
```
1 | import { mkdtemp, copyFile, rm } from 'node:fs/promises';
2 | import { tmpdir } from 'node:os';
3 | import { join, dirname, resolve } from 'node:path';
4 | import { fileURLToPath } from 'node:url';
5 | 
6 | import { describe, expect, test, afterEach } from '@jest/globals';
7 | 
8 | import { TaskService } from '../../src/mcp/task-service.ts';
9 | import { createPromptsTools } from '../../packages/prompts-tools/src/index.ts';
10 | 
11 | const __filename = fileURLToPath(import.meta.url);
12 | const __dirname = dirname(__filename);
13 | 
14 | const FIXTURE_DIR = resolve(__dirname, '../../tests/fixtures/taskmaster');
15 | const SIMPLE_FIXTURE = join(FIXTURE_DIR, 'simple-tasks.json');
16 | 
17 | const createTempService = async (writeEnabled: boolean) => {
18 |   const dir = await mkdtemp(join(tmpdir(), 'prompts-tools-'));
19 |   const tasksPath = join(dir, 'tasks.json');
20 |   await copyFile(SIMPLE_FIXTURE, tasksPath);
21 |   const service = new TaskService({ tasksPath, tag: 'master', writeEnabled });
22 |   await service.load();
23 |   return { dir, service };
24 | };
25 | 
26 | describe('@prompts/tools adapters', () => {
27 |   let tempDir = '';
28 | 
29 |   afterEach(async () => {
30 |     if (tempDir) {
31 |       await rm(tempDir, { recursive: true, force: true });
32 |       tempDir = '';
33 |     }
34 |   });
35 | 
36 |   test('next_task and graph_export run with expected shapes', async () => {
37 |     const temp = await createTempService(false);
38 |     tempDir = temp.dir;
39 |     const tools = createPromptsTools({
40 |       service: {
41 |         list: () => temp.service.list(),
42 |         next: () => temp.service.next(),
43 |         graph: () => temp.service.graph(),
44 |         setStatus: (id, status) => temp.service.setStatus(id, status)
45 |       }
46 |     });
47 | 
48 |     const next = await tools.nextTask.run({});
49 |     expect(next).toHaveProperty('task');
50 |     expect(Array.isArray(next.ready)).toBe(true);
51 | 
52 |     const graph = await tools.graphExport.run({});
53 |     expect(Array.isArray(graph.nodes)).toBe(true);
54 |   });
55 | 
56 |   test('set_task_status respects persistence flag', async () => {
57 |     const temp = await createTempService(false);
58 |     tempDir = temp.dir;
59 |     const tools = createPromptsTools({
60 |       service: {
61 |         list: () => temp.service.list(),
62 |         next: () => temp.service.next(),
63 |         graph: () => temp.service.graph(),
64 |         setStatus: (id, status) => temp.service.setStatus(id, status)
65 |       }
66 |     });
67 | 
68 |     const ro = await tools.setTaskStatus.run({ id: 1, status: 'done' });
69 |     expect(ro.persisted).toBe(false);
70 |   });
71 | });
```

test/mcp/task-service.test.ts
```
1 | import { mkdtemp, copyFile, rm, readFile } from 'node:fs/promises';
2 | import { tmpdir } from 'node:os';
3 | import { join, dirname, resolve } from 'node:path';
4 | import { fileURLToPath } from 'node:url';
5 | 
6 | import { describe, expect, test, beforeEach, afterEach } from '@jest/globals';
7 | 
8 | import { TaskService } from '../../src/mcp/task-service.ts';
9 | 
10 | const __filename = fileURLToPath(import.meta.url);
11 | const __dirname = dirname(__filename);
12 | 
13 | const FIXTURE_DIR = resolve(__dirname, '../../tests/fixtures/taskmaster');
14 | const SIMPLE_FIXTURE = join(FIXTURE_DIR, 'simple-tasks.json');
15 | 
16 | const createTempTasksFile = async (): Promise<{ dir: string; path: string }> => {
17 |   const dir = await mkdtemp(join(tmpdir(), 'task-service-'));
18 |   const path = join(dir, 'tasks.json');
19 |   await copyFile(SIMPLE_FIXTURE, path);
20 |   return { dir, path };
21 | };
22 | 
23 | describe('TaskService', () => {
24 |   let tempDir: string;
25 |   let tasksPath: string;
26 | 
27 |   beforeEach(async () => {
28 |     const temp = await createTempTasksFile();
29 |     tempDir = temp.dir;
30 |     tasksPath = temp.path;
31 |   });
32 | 
33 |   afterEach(async () => {
34 |     await rm(tempDir, { recursive: true, force: true });
35 |   });
36 | 
37 |   const createService = async (writeEnabled: boolean) => {
38 |     const service = new TaskService({
39 |       tasksPath,
40 |       tag: 'master',
41 |       writeEnabled
42 |     });
43 |     await service.load();
44 |     return service;
45 |   };
46 | 
47 |   test('lists tasks and computes next task', async () => {
48 |     const service = await createService(false);
49 |     const tasks = service.list();
50 |     expect(tasks).toHaveLength(2);
51 |     expect(tasks[0]?.title).toBe('Initial work');
52 | 
53 |     const next = service.next();
54 |     expect(next?.id).toBe(1);
55 |   });
56 | 
57 |   test('returns graph export nodes', async () => {
58 |     const service = await createService(false);
59 |     const graph = service.graph();
60 |     expect(graph.nodes).toHaveLength(2);
61 |     expect(graph.nodes[1]).toMatchObject({ id: 2, dependencies: [1] });
62 |   });
63 | 
64 |   test('setStatus respects read-only mode', async () => {
65 |     const service = await createService(false);
66 |     const result = await service.setStatus(1, 'done');
67 | 
68 |     expect(result.persisted).toBe(false);
69 |     expect(result.task.status).toBe('pending');
70 | 
71 |     const file = await readFile(tasksPath, 'utf8');
72 |     const document = JSON.parse(file);
73 |     expect(document.master.tasks[0].status).toBe('pending');
74 |   });
75 | 
76 |   test('setStatus persists when write mode enabled', async () => {
77 |     const service = await createService(true);
78 |     const result = await service.setStatus(1, 'done');
79 | 
80 |     expect(result.persisted).toBe(true);
81 |     expect(result.task.status).toBe('done');
82 | 
83 |     const file = await readFile(tasksPath, 'utf8');
84 |     const document = JSON.parse(file);
85 |     expect(document.master.tasks[0].status).toBe('done');
86 |   });
87 | });
```

test/mcp/task-tools.test.ts
```
1 | import { mkdtemp, copyFile, rm } from 'node:fs/promises';
2 | import { tmpdir } from 'node:os';
3 | import { join, dirname, resolve } from 'node:path';
4 | import { fileURLToPath } from 'node:url';
5 | 
6 | import { describe, expect, test, beforeEach, afterEach } from '@jest/globals';
7 | 
8 | import { buildTaskToolDefinitions } from '../../src/tools/task-tools.ts';
9 | import { TaskService } from '../../src/mcp/task-service.ts';
10 | import { createSecureLogger, logger as baseLogger } from '../../src/logger.ts';
11 | 
12 | const secureLogger = createSecureLogger(baseLogger);
13 | 
14 | const __filename = fileURLToPath(import.meta.url);
15 | const __dirname = dirname(__filename);
16 | 
17 | const FIXTURE_DIR = resolve(__dirname, '../../tests/fixtures/taskmaster');
18 | const SIMPLE_FIXTURE = join(FIXTURE_DIR, 'simple-tasks.json');
19 | 
20 | const createTempService = async (writeEnabled: boolean) => {
21 |   const dir = await mkdtemp(join(tmpdir(), 'task-tools-'));
22 |   const tasksPath = join(dir, 'tasks.json');
23 |   await copyFile(SIMPLE_FIXTURE, tasksPath);
24 |   const service = new TaskService({ tasksPath, tag: 'master', writeEnabled });
25 |   await service.load();
26 |   return { dir, service };
27 | };
28 | 
29 | describe('task tools', () => {
30 |   let tempDir: string;
31 | 
32 |   afterEach(async () => {
33 |     if (tempDir) {
34 |       await rm(tempDir, { recursive: true, force: true });
35 |       tempDir = '';
36 |     }
37 |   });
38 | 
39 |   const getTool = (tools: ReturnType<typeof buildTaskToolDefinitions>, name: string) =>
40 |     tools.find((tool) => tool.name === name);
41 | 
42 |   test('next_task returns ready task payload', async () => {
43 |     const temp = await createTempService(false);
44 |     tempDir = temp.dir;
45 | 
46 |     const tools = buildTaskToolDefinitions({ service: temp.service, logger: secureLogger });
47 |     const nextTaskTool = getTool(tools, 'next_task');
48 |     expect(nextTaskTool).toBeDefined();
49 | 
50 |     const result = await nextTaskTool!.handler();
51 |     expect(result.structuredResult).toMatchObject({ task: { id: 1 } });
52 | 
53 |     const listTool = getTool(tools, 'list_tasks');
54 |     expect(listTool).toBeDefined();
55 |     const listResult = await listTool!.handler();
56 |     expect(listResult.structuredResult).toMatchObject({ tasks: expect.any(Array) });
57 | 
58 |     const getToolHandler = getTool(tools, 'get_task');
59 |     expect(getToolHandler).toBeDefined();
60 |     const getResult = await getToolHandler!.handler({ id: 1 });
61 |     expect(getResult.structuredResult).toMatchObject({ task: { id: 1 } });
62 | 
63 |     const graphTool = getTool(tools, 'graph_export');
64 |     expect(graphTool).toBeDefined();
65 |     const graphResult = await graphTool!.handler();
66 |     expect(graphResult.structuredResult).toMatchObject({ nodes: expect.any(Array) });
67 |   });
68 | 
69 |   test('set_task_status honours write mode switch', async () => {
70 |     const temp = await createTempService(false);
71 |     tempDir = temp.dir;
72 | 
73 |     const tools = buildTaskToolDefinitions({ service: temp.service, logger: secureLogger });
74 |     const setStatusTool = tools.find((tool) => tool.name === 'set_task_status');
75 |     expect(setStatusTool).toBeDefined();
76 | 
77 |     const readOnlyResult = await setStatusTool!.handler({ id: 1, status: 'done' });
78 |     expect(readOnlyResult.structuredResult).toMatchObject({ persisted: false });
79 | 
80 |     // Recreate with write mode enabled to ensure persistence is allowed.
81 |     await rm(tempDir, { recursive: true, force: true });
82 |     const writable = await createTempService(true);
83 |     tempDir = writable.dir;
84 |     const writableTools = buildTaskToolDefinitions({ service: writable.service, logger: secureLogger });
85 |     const writableSetStatus = writableTools.find((tool) => tool.name === 'set_task_status');
86 |     const writeResult = await writableSetStatus!.handler({ id: 1, status: 'done' });
87 |     expect(writeResult.structuredResult).toMatchObject({ persisted: true, task: { status: 'done' } });
88 |   });
89 | });
```

test/planner/Planner.test.ts
```
1 | import { strict as assert } from 'node:assert';
2 | import { mkdir, rm, writeFile } from 'node:fs/promises';
3 | import { randomUUID } from 'node:crypto';
4 | import { join } from 'node:path';
5 | 
6 | import { describe, test, beforeAll, afterAll } from '@jest/globals';
7 | 
8 | import { Planner } from '../../src/planner.ts';
9 | import { StateStore } from '../../src/state/StateStore.ts';
10 | 
11 | const ARTIFACT_ROOT = join(process.cwd(), 'artifacts', 'test', 'planner');
12 | const DEFAULT_GRAPH_PATH = join(process.cwd(), 'resources', 'default-graph.json');
13 | 
14 | const createTempProjectRoot = async () => {
15 |   const dir = join(ARTIFACT_ROOT, `run-${Date.now()}-${randomUUID()}`);
16 |   await mkdir(dir, { recursive: true });
17 |   return dir;
18 | };
19 | 
20 | beforeAll(async () => {
21 |   await mkdir(ARTIFACT_ROOT, { recursive: true });
22 | });
23 | 
24 | afterAll(async () => {
25 |   await rm(ARTIFACT_ROOT, { recursive: true, force: true });
26 | });
27 | 
28 | describe('Planner', () => {
29 |   test('suggests next calls as tasks complete', async () => {
30 |     const projectRoot = await createTempProjectRoot();
31 | 
32 |     try {
33 |       const store = new StateStore(projectRoot);
34 |       await store.load();
35 |       const planner = new Planner(DEFAULT_GRAPH_PATH, store);
36 | 
37 |       const nextIds = () => planner.suggestNextCalls().map((node) => node.id);
38 | 
39 |       assert.deepEqual(nextIds(), ['instruction-file']);
40 | 
41 |       store.recordCompletion('instruction-file', {}, []);
42 |       assert.deepEqual(nextIds(), ['planning-process']);
43 | 
44 |       store.recordCompletion('planning-process', {}, []);
45 |       assert.deepEqual(nextIds(), ['scope-control']);
46 | 
47 |       store.recordCompletion('scope-control', {}, []);
48 |       assert.deepEqual(nextIds(), ['integration-test']);
49 | 
50 |       store.recordCompletion('integration-test', { status: 'draft' }, []);
51 |       assert.deepEqual(nextIds(), []);
52 | 
53 |       store.recordCompletion('integration-test', { status: 'ready' }, [
54 |         {
55 |           name: 'test_results',
56 |           source: 'integration-test',
57 |           uri: 'file://tests.json',
58 |         },
59 |       ]);
60 |       assert.deepEqual(nextIds(), ['regression-guard']);
61 | 
62 |       store.recordCompletion('regression-guard', { status: 'pending' }, []);
63 |       assert.deepEqual(nextIds(), []);
64 | 
65 |       store.recordCompletion('regression-guard', { status: 'complete' }, [
66 |         {
67 |           name: 'release_notes_context',
68 |           source: 'regression-guard',
69 |           uri: 'file://release-notes.md',
70 |         },
71 |       ]);
72 |       assert.deepEqual(nextIds(), ['release-notes']);
73 |     } finally {
74 |       await rm(projectRoot, { recursive: true, force: true });
75 |     }
76 |   });
77 | 
78 |   test('orders suggestions by phase and id', async () => {
79 |     const projectRoot = await createTempProjectRoot();
80 |     const customGraphPath = join(projectRoot, 'custom-graph.json');
81 | 
82 |     try {
83 |       await writeFile(
84 |         customGraphPath,
85 |         JSON.stringify(
86 |           {
87 |             nodes: [
88 |               {
89 |                 id: 'b-task',
90 |                 title: 'B Task',
91 |                 phase: 2,
92 |                 dependsOn: [],
93 |                 requiresArtifacts: [],
94 |               },
95 |               {
96 |                 id: 'a-task',
97 |                 title: 'A Task',
98 |                 phase: 2,
99 |                 dependsOn: [],
100 |                 requiresArtifacts: [],
101 |               },
102 |               {
103 |                 id: 'c-task',
104 |                 title: 'C Task',
105 |                 phase: 1,
106 |                 dependsOn: [],
107 |                 requiresArtifacts: [],
108 |               },
109 |             ],
110 |           },
111 |           null,
112 |           2,
113 |         ),
114 |         'utf8',
115 |       );
116 | 
117 |       const store = new StateStore(projectRoot);
118 |       await store.load();
119 | 
120 |       const planner = new Planner(customGraphPath, store);
121 |       const suggestions = planner.suggestNextCalls().map((node) => node.id);
122 |       assert.deepEqual(suggestions, ['c-task', 'a-task', 'b-task']);
123 |     } finally {
124 |       await rm(projectRoot, { recursive: true, force: true });
125 |     }
126 |   });
127 | });
```

test/providers/factory.test.ts
```
1 | import { describe, expect, test, afterEach, jest } from '@jest/globals';
2 | 
3 | import { getProvider } from '../../src/providers/factory.ts';
4 | 
5 | const realFetch = global.fetch;
6 | 
7 | describe('provider factory', () => {
8 |   afterEach(() => {
9 |     global.fetch = realFetch as any;
10 |     // cannot easily restore spawnSync; tests avoid modifying it directly
11 |   });
12 | 
13 |   test('selects Ollama when health endpoint is OK', async () => {
14 |     global.fetch = (async () => ({ ok: true })) as any;
15 |     const p = await getProvider();
16 |     expect(p.name).toBe('ollama');
17 |   });
18 | 
19 |   test('falls back to gemini when Ollama unavailable', async () => {
20 |     global.fetch = (async () => { throw new Error('offline'); }) as any;
21 |     const originalCli = process.env.GEMINI_CLI;
22 |     try {
23 |       // Use a ubiquitous success command to simulate CLI presence
24 |       process.env.GEMINI_CLI = 'true';
25 |       const p = await getProvider();
26 |       expect(p.name).toBe('gemini-cli');
27 |     } finally {
28 |       if (originalCli === undefined) delete process.env.GEMINI_CLI; else process.env.GEMINI_CLI = originalCli;
29 |     }
30 |   });
31 | 
32 |   test('uses stub when none available', async () => {
33 |     global.fetch = (async () => { throw new Error('offline'); }) as any;
34 |     const originalPath = process.env.PATH;
35 |     const originalCli = process.env.GEMINI_CLI;
36 |     try {
37 |       process.env.PATH = '';
38 |       process.env.GEMINI_CLI = '/definitely_not_found_cmd_xyz';
39 |       const p = await getProvider();
40 |       expect(p.name).toBe('stub');
41 |     } finally {
42 |       process.env.PATH = originalPath;
43 |       if (originalCli === undefined) delete process.env.GEMINI_CLI; else process.env.GEMINI_CLI = originalCli;
44 |     }
45 |   });
46 | });
```

test/state/StateStore.test.ts
```
1 | import { strict as assert } from 'node:assert';
2 | import { mkdir, rm, stat, readFile } from 'node:fs/promises';
3 | import { randomUUID } from 'node:crypto';
4 | import { join, dirname } from 'node:path';
5 | 
6 | import { describe, test, beforeAll, afterAll } from '@jest/globals';
7 | 
8 | import { StateStore } from '../../src/state/StateStore.ts';
9 | import { createInitialProjectState } from '../../src/state/ProjectState.ts';
10 | 
11 | const TEST_ARTIFACT_ROOT = join(process.cwd(), 'artifacts', 'test', 'state-store');
12 | 
13 | const createTempProjectRoot = async (): Promise<string> => {
14 |   const dir = join(TEST_ARTIFACT_ROOT, `run-${Date.now()}-${randomUUID()}`);
15 |   await mkdir(dir, { recursive: true });
16 |   return dir;
17 | };
18 | 
19 | const ensureDirectoryExists = async (path: string): Promise<boolean> => {
20 |   try {
21 |     const stats = await stat(path);
22 |     return stats.isDirectory();
23 |   } catch (error) {
24 |     return false;
25 |   }
26 | };
27 | 
28 | beforeAll(async () => {
29 |   await mkdir(TEST_ARTIFACT_ROOT, { recursive: true });
30 | });
31 | 
32 | afterAll(async () => {
33 |   await rm(TEST_ARTIFACT_ROOT, { recursive: true, force: true });
34 | });
35 | 
36 | describe('StateStore', () => {
37 |   test('records completions and persists state to disk', async () => {
38 |     const root = await createTempProjectRoot();
39 | 
40 |     try {
41 |       const store = new StateStore(root);
42 | 
43 |       const initial = await store.load();
44 |       const expected = createInitialProjectState();
45 |       assert.equal(initial.completedTools.length, expected.completedTools.length);
46 |       assert.equal(Object.keys(initial.artifacts).length, Object.keys(expected.artifacts).length);
47 | 
48 |       const mcpDirectory = join(root, '.mcp');
49 |       assert.ok(await ensureDirectoryExists(mcpDirectory));
50 | 
51 |       store.recordCompletion(
52 |         'discover_research',
53 |         { summary: 'done' },
54 |         [
55 |           {
56 |             name: 'research_summary',
57 |             source: 'discover_research',
58 |             uri: 'file://summary.md',
59 |           },
60 |         ],
61 |       );
62 | 
63 |       const afterFirst = store.getState();
64 |       assert.equal(afterFirst.completedTools.length, 1);
65 |       assert.equal(afterFirst.completedTools[0].id, 'discover_research');
66 |       assert.equal(afterFirst.artifacts.research_summary.name, 'research_summary');
67 | 
68 |       store.recordCompletion(
69 |         'discover_research',
70 |         { summary: 'updated' },
71 |         [
72 |           {
73 |             name: 'research_summary',
74 |             source: 'discover_research',
75 |             uri: 'file://updated.md',
76 |           },
77 |         ],
78 |       );
79 | 
80 |       const ids = store.getCompletedToolIds();
81 |       assert.ok(ids.has('discover_research'));
82 |       assert.equal(ids.size, 1);
83 | 
84 |       const availableArtifacts = store.getAvailableArtifacts();
85 |       assert.ok(availableArtifacts.has('research_summary'));
86 | 
87 |       await Promise.all([store.save(), store.save(), store.save()]);
88 | 
89 |       const persisted = JSON.parse(await readFile(store.statePath, 'utf8'));
90 |       assert.equal(persisted.completedTools.length, 1);
91 |       assert.equal(persisted.completedTools[0].outputs.summary, 'updated');
92 |       assert.equal(persisted.artifacts.research_summary.uri, 'file://updated.md');
93 | 
94 |       const secondStore = new StateStore(root);
95 |       const loadedAgain = await secondStore.load();
96 |       assert.equal(loadedAgain.completedTools.length, 1);
97 |       assert.equal(loadedAgain.completedTools[0].outputs.summary, 'updated');
98 | 
99 |       const tmpPath = `${store.statePath}.tmp`;
100 |       assert.strictEqual(await ensureDirectoryExists(dirname(tmpPath)), true);
101 |       try {
102 |         await stat(tmpPath);
103 |         assert.fail('temporary state file should not persist after rename');
104 |       } catch (error) {
105 |         if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
106 |           throw error;
107 |         }
108 |       }
109 |     } finally {
110 |       await rm(root, { recursive: true, force: true });
111 |     }
112 |   });
113 | });
```

test/state/update.test.ts
```
1 | import { describe, expect, test } from '@jest/globals';
2 | 
3 | import { advance } from '../../src/state/update.ts';
4 | import type { CanonicalTaskStatus, PromptsTask } from '../../src/types/prompts-task.ts';
5 | 
6 | const createTask = (overrides: Partial<PromptsTask> & { id: number }): PromptsTask => ({
7 |   id: overrides.id,
8 |   title: overrides.title ?? `Task ${overrides.id}`,
9 |   description: overrides.description ?? '',
10 |   status: overrides.status ?? 'pending',
11 |   dependencies: overrides.dependencies ?? [],
12 |   priority: overrides.priority ?? 'medium',
13 |   details: overrides.details ?? '',
14 |   testStrategy: overrides.testStrategy ?? '',
15 |   subtasks: overrides.subtasks ?? [],
16 |   labels: overrides.labels,
17 |   metadata: overrides.metadata,
18 |   evidence: overrides.evidence,
19 |   artifacts: overrides.artifacts,
20 |   source_doc: overrides.source_doc,
21 |   lineage: overrides.lineage,
22 |   supersedes: overrides.supersedes,
23 |   superseded_by: overrides.superseded_by,
24 |   reason: overrides.reason,
25 | });
26 | 
27 | describe('advance', () => {
28 |   test('updates target task status without mutating input', () => {
29 |     const tasks: PromptsTask[] = [
30 |       createTask({ id: 1, status: 'pending' }),
31 |       createTask({ id: 2, status: 'in_progress' }),
32 |     ];
33 | 
34 |     const nextTasks = advance(tasks, 2, 'done');
35 | 
36 |     expect(nextTasks).not.toBe(tasks);
37 |     expect(tasks[1].status).toBe('in_progress');
38 |     expect(nextTasks[1].status).toBe('done');
39 |     expect(nextTasks[1]).not.toBe(tasks[1]);
40 |     expect(nextTasks[0]).toBe(tasks[0]);
41 |   });
42 | 
43 |   test('clones target task even when status is unchanged', () => {
44 |     const tasks: PromptsTask[] = [createTask({ id: 1, status: 'pending' })];
45 | 
46 |     const nextTasks = advance(tasks, 1, 'pending');
47 | 
48 |     expect(nextTasks).not.toBe(tasks);
49 |     expect(nextTasks[0]).not.toBe(tasks[0]);
50 |     expect(nextTasks[0].status).toBe('pending');
51 |   });
52 | 
53 |   test('throws when task id is not found', () => {
54 |     const tasks: PromptsTask[] = [createTask({ id: 1 })];
55 | 
56 |     expect(() => advance(tasks, 99, 'done')).toThrow('Task with id 99 was not found.');
57 |   });
58 | 
59 |   test('throws when status is invalid', () => {
60 |     const tasks: PromptsTask[] = [createTask({ id: 1 })];
61 | 
62 |     expect(() => advance(tasks, 1, 'invalid' as CanonicalTaskStatus)).toThrow(RangeError);
63 |   });
64 | 
65 |   test('throws when tasks argument is not an array', () => {
66 |     expect(() => advance(null as unknown as PromptsTask[], 1, 'pending')).toThrow(TypeError);
67 |   });
68 | });
```

tests/adapters/ingest.test.ts
```
1 | import { dirname, join, resolve } from 'node:path';
2 | import { fileURLToPath } from 'node:url';
3 | 
4 | import { describe, expect, test } from '@jest/globals';
5 | 
6 | import {
7 |   ingestTasks,
8 |   TaskIngestError,
9 |   TaskValidationError
10 | } from '../../src/adapters/taskmaster/ingest.ts';
11 | 
12 | const __filename = fileURLToPath(import.meta.url);
13 | const __dirname = dirname(__filename);
14 | const FIXTURES_DIR = resolve(__dirname, '../fixtures/taskmaster');
15 | 
16 | describe('Task-Master ingest adapter', () => {
17 |   test('normalizes aliased statuses and records report entries', async () => {
18 |     const fixture = join(FIXTURES_DIR, 'tagged-tasks.json');
19 | 
20 |     const { tasks, report } = await ingestTasks(fixture);
21 | 
22 |     expect(tasks).toHaveLength(2);
23 | 
24 |     const [first, second] = tasks;
25 |     expect(first.status).toBe('pending');
26 |     expect(first.priority).toBe('high');
27 |     expect(first.subtasks).toHaveLength(1);
28 |     expect(first.subtasks[0]?.status).toBe('in_progress');
29 | 
30 |     expect(second.status).toBe('blocked');
31 | 
32 |     expect(report.total).toBe(2);
33 |     expect(report.remapped).toEqual(
34 |       expect.arrayContaining([
35 |         expect.objectContaining({ entity: 'task', taskId: 1, from: 'todo', to: 'pending' }),
36 |         expect.objectContaining({ entity: 'task', taskId: 2, from: 'deferred', to: 'blocked' }),
37 |         expect.objectContaining({ entity: 'subtask', taskId: 1, subtaskId: 1, from: 'in-progress', to: 'in_progress' })
38 |       ])
39 |     );
40 |   });
41 | 
42 |   test('defaults missing subtask statuses to pending', async () => {
43 |     const { tasks } = await ingestTasks(join(FIXTURES_DIR, 'subtask-missing-status.json'));
44 |     const [task] = tasks;
45 |     expect(task?.subtasks).toHaveLength(1);
46 |     expect(task?.subtasks[0]?.status).toBe('pending');
47 |   });
48 | 
49 |   test('supports legacy root-level task arrays', async () => {
50 |     const { tasks } = await ingestTasks(join(FIXTURES_DIR, 'legacy-tasks.json'));
51 |     expect(tasks).toHaveLength(1);
52 |     expect(tasks[0]).toMatchObject({ id: 1, title: 'Legacy format task', status: 'pending' });
53 |   });
54 | 
55 |   test('throws TaskValidationError when schema validation fails', async () => {
56 |     await expect(ingestTasks(join(FIXTURES_DIR, 'invalid-missing-fields.json'))).rejects.toBeInstanceOf(
57 |       TaskValidationError
58 |     );
59 |   });
60 | 
61 |   test('throws TaskIngestError when tag is missing', async () => {
62 |     await expect(
63 |       ingestTasks(join(FIXTURES_DIR, 'tagged-tasks.json'), { tag: 'non-existent' })
64 |     ).rejects.toBeInstanceOf(TaskIngestError);
65 |   });
66 | });
```

docs/llms.txt/E2B/llms-ctx-full.txt
```
1 | <project title="Mcp Server" summary="The E2B MCP server enables users to run code in a sandboxed environment within the Claude Desktop app, providing code interpretation capabilities through the E2B Sandbox. The project aims to offer a server implementation that supports both JavaScript and Python, allowing developers to execute code securely and efficiently in a controlled environment.">**Remember:**
2 | - MCP server
3 | - Code interpreter
4 | - Sandboxed execution
5 | - JavaScript/Python support
6 | - Claude Desktop integration
7 | - Server-side code execution<docs><doc title="README" desc="overview and usage."># Changesets
8 | 
9 | To add changeset run:
10 | 
11 | ```bash
12 | npx changeset
13 | ```
14 | 
15 | in the root of the project. This will create a new changeset in the `.changeset` folder.</doc></docs><examples><doc title="README" desc="overview."><!doctype html>
16 | <html>
17 | <head>
18 |     <title>Example Domain</title>
19 | 
20 |     <meta charset="utf-8" />
21 |     <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
22 |     <meta name="viewport" content="width=device-width, initial-scale=1" />
23 |     <style type="text/css">
24 |     body {
25 |         background-color: #f0f0f2;
26 |         margin: 0;
27 |         padding: 0;
28 |         font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
29 |         
30 |     }
31 |     div {
32 |         width: 600px;
33 |         margin: 5em auto;
34 |         padding: 2em;
35 |         background-color: #fdfdff;
36 |         border-radius: 0.5em;
37 |         box-shadow: 2px 3px 7px 2px rgba(0,0,0,0.02);
38 |     }
39 |     a:link, a:visited {
40 |         color: #38488f;
41 |         text-decoration: none;
42 |     }
43 |     @media (max-width: 700px) {
44 |         div {
45 |             margin: 0 auto;
46 |             width: auto;
47 |         }
48 |     }
49 |     </style>    
50 | </head>
51 | 
52 | <body>
53 | <div>
54 |     <h1>Example Domain</h1>
55 |     <p>This domain is for use in illustrative examples in documents. You may use this
56 |     domain in literature without prior coordination or asking for permission.</p>
57 |     <p><a href="https://www.iana.org/domains/example">More information...</a></p>
58 | </div>
59 | </body>
60 | </html></doc></examples><optional><doc title="License" desc="optional reading.">                                 Apache License
61 |                            Version 2.0, January 2004
62 |                         http://www.apache.org/licenses/
63 | 
64 |    TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION
65 | 
66 |    1. Definitions.
67 | 
68 |       "License" shall mean the terms and conditions for use, reproduction,
69 |       and distribution as defined by Sections 1 through 9 of this document.
70 | 
71 |       "Licensor" shall mean the copyright owner or entity authorized by
72 |       the copyright owner that is granting the License.
73 | 
74 |       "Legal Entity" shall mean the union of the acting entity and all
75 |       other entities that control, are controlled by, or are under common
76 |       control with that entity. For the purposes of this definition,
77 |       "control" means (i) the power, direct or indirect, to cause the
78 |       direction or management of such entity, whether by contract or
79 |       otherwise, or (ii) ownership of fifty percent (50%) or more of the
80 |       outstanding shares, or (iii) beneficial ownership of such entity.
81 | 
82 |       "You" (or "Your") shall mean an individual or Legal Entity
83 |       exercising permissions granted by this License.
84 | 
85 |       "Source" form shall mean the preferred form for making modifications,
86 |       including but not limited to software source code, documentation
87 |       source, and configuration files.
88 | 
89 |       "Object" form shall mean any form resulting from mechanical
90 |       transformation or translation of a Source form, including but
91 |       not limited to compiled object code, generated documentation,
92 |       and conversions to other media types.
93 | 
94 |       "Work" shall mean the work of authorship, whether in Source or
95 |       Object form, made available under the License, as indicated by a
96 |       copyright notice that is included in or attached to the work
97 |       (an example is provided in the Appendix below).
98 | 
99 |       "Derivative Works" shall mean any work, whether in Source or Object
100 |       form, that is based on (or derived from) the Work and for which the
101 |       editorial revisions, annotations, elaborations, or other modifications
102 |       represent, as a whole, an original work of authorship. For the purposes
103 |       of this License, Derivative Works shall not include works that remain
104 |       separable from, or merely link (or bind by name) to the interfaces of,
105 |       the Work and Derivative Works thereof.
106 | 
107 |       "Contribution" shall mean any work of authorship, including
108 |       the original version of the Work and any modifications or additions
109 |       to that Work or Derivative Works thereof, that is intentionally
110 |       submitted to Licensor for inclusion in the Work by the copyright owner
111 |       or by an individual or Legal Entity authorized to submit on behalf of
112 |       the copyright owner. For the purposes of this definition, "submitted"
113 |       means any form of electronic, verbal, or written communication sent
114 |       to the Licensor or its representatives, including but not limited to
115 |       communication on electronic mailing lists, source code control systems,
116 |       and issue tracking systems that are managed by, or on behalf of, the
117 |       Licensor for the purpose of discussing and improving the Work, but
118 |       excluding communication that is conspicuously marked or otherwise
119 |       designated in writing by the copyright owner as "Not a Contribution."
120 | 
121 |       "Contributor" shall mean Licensor and any individual or Legal Entity
122 |       on behalf of whom a Contribution has been received by Licensor and
123 |       subsequently incorporated within the Work.
124 | 
125 |    2. Grant of Copyright License. Subject to the terms and conditions of
126 |       this License, each Contributor hereby grants to You a perpetual,
127 |       worldwide, non-exclusive, no-charge, royalty-free, irrevocable
128 |       copyright license to reproduce, prepare Derivative Works of,
129 |       publicly display, publicly perform, sublicense, and distribute the
130 |       Work and such Derivative Works in Source or Object form.
131 | 
132 |    3. Grant of Patent License. Subject to the terms and conditions of
133 |       this License, each Contributor hereby grants to You a perpetual,
134 |       worldwide, non-exclusive, no-charge, royalty-free, irrevocable
135 |       (except as stated in this section) patent license to make, have made,
136 |       use, offer to sell, sell, import, and otherwise transfer the Work,
137 |       where such license applies only to those patent claims licensable
138 |       by such Contributor that are necessarily infringed by their
139 |       Contribution(s) alone or by combination of their Contribution(s)
140 |       with the Work to which such Contribution(s) was submitted. If You
141 |       institute patent litigation against any entity (including a
142 |       cross-claim or counterclaim in a lawsuit) alleging that the Work
143 |       or a Contribution incorporated within the Work constitutes direct
144 |       or contributory patent infringement, then any patent licenses
145 |       granted to You under this License for that Work shall terminate
146 |       as of the date such litigation is filed.
147 | 
148 |    4. Redistribution. You may reproduce and distribute copies of the
149 |       Work or Derivative Works thereof in any medium, with or without
150 |       modifications, and in Source or Object form, provided that You
151 |       meet the following conditions:
152 | 
153 |       (a) You must give any other recipients of the Work or
154 |           Derivative Works a copy of this License; and
155 | 
156 |       (b) You must cause any modified files to carry prominent notices
157 |           stating that You changed the files; and
158 | 
159 |       (c) You must retain, in the Source form of any Derivative Works
160 |           that You distribute, all copyright, patent, trademark, and
161 |           attribution notices from the Source form of the Work,
162 |           excluding those notices that do not pertain to any part of
163 |           the Derivative Works; and
164 | 
165 |       (d) If the Work includes a "NOTICE" text file as part of its
166 |           distribution, then any Derivative Works that You distribute must
167 |           include a readable copy of the attribution notices contained
168 |           within such NOTICE file, excluding those notices that do not
169 |           pertain to any part of the Derivative Works, in at least one
170 |           of the following places: within a NOTICE text file distributed
171 |           as part of the Derivative Works; within the Source form or
172 |           documentation, if provided along with the Derivative Works; or,
173 |           within a display generated by the Derivative Works, if and
174 |           wherever such third-party notices normally appear. The contents
175 |           of the NOTICE file are for informational purposes only and
176 |           do not modify the License. You may add Your own attribution
177 |           notices within Derivative Works that You distribute, alongside
178 |           or as an addendum to the NOTICE text from the Work, provided
179 |           that such additional attribution notices cannot be construed
180 |           as modifying the License.
181 | 
182 |       You may add Your own copyright statement to Your modifications and
183 |       may provide additional or different license terms and conditions
184 |       for use, reproduction, or distribution of Your modifications, or
185 |       for any such Derivative Works as a whole, provided Your use,
186 |       reproduction, and distribution of the Work otherwise complies with
187 |       the conditions stated in this License.
188 | 
189 |    5. Submission of Contributions. Unless You explicitly state otherwise,
190 |       any Contribution intentionally submitted for inclusion in the Work
191 |       by You to the Licensor shall be under the terms and conditions of
192 |       this License, without any additional terms or conditions.
193 |       Notwithstanding the above, nothing herein shall supersede or modify
194 |       the terms of any separate license agreement you may have executed
195 |       with Licensor regarding such Contributions.
196 | 
197 |    6. Trademarks. This License does not grant permission to use the trade
198 |       names, trademarks, service marks, or product names of the Licensor,
199 |       except as required for reasonable and customary use in describing the
200 |       origin of the Work and reproducing the content of the NOTICE file.
201 | 
202 |    7. Disclaimer of Warranty. Unless required by applicable law or
203 |       agreed to in writing, Licensor provides the Work (and each
204 |       Contributor provides its Contributions) on an "AS IS" BASIS,
205 |       WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
206 |       implied, including, without limitation, any warranties or conditions
207 |       of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
208 |       PARTICULAR PURPOSE. You are solely responsible for determining the
209 |       appropriateness of using or redistributing the Work and assume any
210 |       risks associated with Your exercise of permissions under this License.
211 | 
212 |    8. Limitation of Liability. In no event and under no legal theory,
213 |       whether in tort (including negligence), contract, or otherwise,
214 |       unless required by applicable law (such as deliberate and grossly
215 |       negligent acts) or agreed to in writing, shall any Contributor be
216 |       liable to You for damages, including any direct, indirect, special,
217 |       incidental, or consequential damages of any character arising as a
218 |       result of this License or out of the use or inability to use the
219 |       Work (including but not limited to damages for loss of goodwill,
220 |       work stoppage, computer failure or malfunction, or any and all
221 |       other commercial damages or losses), even if such Contributor
222 |       has been advised of the possibility of such damages.
223 | 
224 |    9. Accepting Warranty or Additional Liability. While redistributing
225 |       the Work or Derivative Works thereof, You may choose to offer,
226 |       and charge a fee for, acceptance of support, warranty, indemnity,
227 |       or other liability obligations and/or rights consistent with this
228 |       License. However, in accepting such obligations, You may act only
229 |       on Your own behalf and on Your sole responsibility, not on behalf
230 |       of any other Contributor, and only if You agree to indemnify,
231 |       defend, and hold each Contributor harmless for any liability
232 |       incurred by, or claims asserted against, such Contributor by reason
233 |       of your accepting any such warranty or additional liability.
234 | 
235 |    END OF TERMS AND CONDITIONS
236 | 
237 |    APPENDIX: How to apply the Apache License to your work.
238 | 
239 |       To apply the Apache License to your work, attach the following
240 |       boilerplate notice, with the fields enclosed by brackets "[]"
241 |       replaced with your own identifying information. (Don't include
242 |       the brackets!)  The text should be enclosed in the appropriate
243 |       comment syntax for the file format. We also recommend that a
244 |       file or class name and description of purpose be included on the
245 |       same "printed page" as the copyright notice for easier
246 |       identification within third-party archives.
247 | 
248 |    Copyright 2023 FoundryLabs, Inc.
249 | 
250 |    Licensed under the Apache License, Version 2.0 (the "License");
251 |    you may not use this file except in compliance with the License.
252 |    You may obtain a copy of the License at
253 | 
254 |        http://www.apache.org/licenses/LICENSE-2.0
255 | 
256 |    Unless required by applicable law or agreed to in writing, software
257 |    distributed under the License is distributed on an "AS IS" BASIS,
258 |    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
259 |    See the License for the specific language governing permissions and
260 |    limitations under the License.</doc></optional></project>
```

packages/prompts-tools/src/index.ts
```
1 | import { z } from 'zod';
2 | 
3 | export const StatusEnum = z.enum(['pending', 'in_progress', 'blocked', 'done', 'deprecated']);
4 | 
5 | export const NextTaskInput = z.object({}).strict();
6 | export const SetTaskStatusInput = z
7 |   .object({ id: z.number().int().positive(), status: StatusEnum })
8 |   .strict();
9 | export const GraphExportInput = z.object({}).strict();
10 | 
11 | export interface ToolHandler<I extends z.ZodTypeAny, O> {
12 |   name: string;
13 |   input: I;
14 |   run: (args: z.infer<I>) => Promise<O>;
15 | }
16 | 
17 | export interface TaskApi {
18 |   list(): unknown[];
19 |   next(): unknown | null;
20 |   graph(): { nodes: unknown[] };
21 |   setStatus(id: number, status: z.infer<typeof StatusEnum>): Promise<{ task: unknown; persisted: boolean }>;
22 | }
23 | 
24 | export interface CreatePromptsToolsOptions {
25 |   service: TaskApi;
26 | }
27 | 
28 | export const createPromptsTools = ({ service }: CreatePromptsToolsOptions) => {
29 |   const nextTask: ToolHandler<typeof NextTaskInput, { task: unknown; ready: unknown[] }> = {
30 |     name: 'next_task',
31 |     input: NextTaskInput,
32 |     run: async () => {
33 |       const task = service.next();
34 |       // Consumers can precompute and pass via list(); keeping simple here
35 |       const ready = service.list();
36 |       return {
37 |         task: task ? JSON.parse(JSON.stringify(task)) : null,
38 |         ready: ready.map((t) => JSON.parse(JSON.stringify(t)))
39 |       };
40 |     }
41 |   };
42 | 
43 |   const setTaskStatus: ToolHandler<
44 |     typeof SetTaskStatusInput,
45 |     { task: unknown; persisted: boolean }
46 |   > = {
47 |     name: 'set_task_status',
48 |     input: SetTaskStatusInput,
49 |     run: async (args) => {
50 |       return service.setStatus(args.id, args.status);
51 |     }
52 |   };
53 | 
54 |   const graphExport: ToolHandler<typeof GraphExportInput, { nodes: unknown[] }> = {
55 |     name: 'graph_export',
56 |     input: GraphExportInput,
57 |     run: async () => service.graph()
58 |   };
59 | 
60 |   return { nextTask, setTaskStatus, graphExport };
61 | };
```

src/adapters/taskmaster/ingest.d.ts
```
1 | import type { ErrorObject } from 'ajv';
2 | import { type IngestOptions, type IngestResult } from '../../types/prompts-task.js';
3 | export declare class TaskIngestError extends Error {
4 |     readonly context?: Record<string, unknown> | undefined;
5 |     constructor(message: string, context?: Record<string, unknown> | undefined);
6 | }
7 | export declare class TaskValidationError extends TaskIngestError {
8 |     constructor(message: string, context: {
9 |         taskId: number;
10 |         errors: ErrorObject[];
11 |     });
12 | }
13 | export declare function ingestTasks(filePath: string, options?: IngestOptions): Promise<IngestResult>;
```

src/adapters/taskmaster/ingest.js
```
1 | import { readFile } from 'node:fs/promises';
2 | import { resolve } from 'node:path';
3 | import Ajv from 'ajv';
4 | import { STATUS_ALIASES } from '../../types/prompts-task.js';
5 | export class TaskIngestError extends Error {
6 |     context;
7 |     constructor(message, context) {
8 |         super(message);
9 |         this.context = context;
10 |         this.name = 'TaskIngestError';
11 |     }
12 | }
13 | export class TaskValidationError extends TaskIngestError {
14 |     constructor(message, context) {
15 |         super(message, context);
16 |         this.name = 'TaskValidationError';
17 |     }
18 | }
19 | const DEFAULT_SCHEMA_PATH = resolve(process.cwd(), 'schemas/task.json');
20 | const DEFAULT_SUBTASK_STATUS = 'pending';
21 | const ajv = new Ajv({
22 |     allErrors: true,
23 |     jsonPointers: true
24 | });
25 | let validatorCache = null;
26 | let cachedSchemaPath = null;
27 | async function getValidator(schemaPath) {
28 |     if (validatorCache && cachedSchemaPath === schemaPath) {
29 |         return validatorCache;
30 |     }
31 |     const schemaRaw = await readFile(schemaPath, 'utf8');
32 |     const schemaJson = JSON.parse(schemaRaw);
33 |     const validator = ajv.compile(schemaJson);
34 |     validatorCache = validator;
35 |     cachedSchemaPath = schemaPath;
36 |     return validator;
37 | }
38 | function coerceTaskPriority(value, taskId) {
39 |     if (typeof value !== 'string') {
40 |         throw new TaskIngestError('Task priority must be a string', { taskId, value });
41 |     }
42 |     const normalized = value.toLowerCase();
43 |     if (normalized === 'high' || normalized === 'medium' || normalized === 'low') {
44 |         return normalized;
45 |     }
46 |     throw new TaskIngestError('Task priority is not recognised', { taskId, value });
47 | }
48 | function normalizeStatus(rawStatus, entity, ids, report) {
49 |     if (typeof rawStatus !== 'string' || rawStatus.trim().length === 0) {
50 |         throw new TaskIngestError('Status must be a non-empty string', { entity, ...ids, rawStatus });
51 |     }
52 |     const key = rawStatus.trim().toLowerCase();
53 |     const canonical = STATUS_ALIASES[key];
54 |     if (!canonical) {
55 |         throw new TaskIngestError('Encountered unsupported status value', { entity, ...ids, rawStatus });
56 |     }
57 |     if (canonical !== rawStatus) {
58 |         report.remapped.push({ entity, from: rawStatus, to: canonical, ...ids });
59 |     }
60 |     return canonical;
61 | }
62 | function extractTasksFromDocument(doc, tag) {
63 |     if (!doc || typeof doc !== 'object') {
64 |         throw new TaskIngestError('tasks.json must contain an object at the root');
65 |     }
66 |     if (Array.isArray(doc.tasks)) {
67 |         return doc.tasks;
68 |     }
69 |     const tagged = doc;
70 |     const tagEntry = tagged[tag];
71 |     if (!tagEntry || typeof tagEntry !== 'object') {
72 |         throw new TaskIngestError('Requested tag was not found in tasks.json', { tag });
73 |     }
74 |     const tasks = tagEntry.tasks;
75 |     if (!Array.isArray(tasks)) {
76 |         throw new TaskIngestError('Tag entry must include a tasks array', { tag });
77 |     }
78 |     return tasks;
79 | }
80 | function coerceDependencies(value, taskId) {
81 |     if (value === undefined) {
82 |         return [];
83 |     }
84 |     if (!Array.isArray(value)) {
85 |         throw new TaskIngestError('Task dependencies must be an array', { taskId, value });
86 |     }
87 |     return value.map((entry, index) => {
88 |         if (typeof entry === 'number' && Number.isInteger(entry) && entry > 0) {
89 |             return entry;
90 |         }
91 |         if (typeof entry === 'string' && /^\d+$/.test(entry.trim())) {
92 |             return Number.parseInt(entry.trim(), 10);
93 |         }
94 |         throw new TaskIngestError('Task dependency must be a positive integer', {
95 |             taskId,
96 |             value: entry,
97 |             index
98 |         });
99 |     });
100 | }
101 | function sanitizeString(value, context, fallback) {
102 |     if (typeof value === 'string') {
103 |         return value;
104 |     }
105 |     if ((value === undefined || value === null) && fallback !== undefined) {
106 |         return fallback;
107 |     }
108 |     throw new TaskIngestError('Expected a string value', { ...context, value });
109 | }
110 | function buildRequiredError(field) {
111 |     return {
112 |         dataPath: '',
113 |         schemaPath: '#/required',
114 |         keyword: 'required',
115 |         params: { missingProperty: field },
116 |         message: `must have required property '${field}'`
117 |     };
118 | }
119 | function requireString(record, field, ids) {
120 |     const value = record[field];
121 |     if (typeof value === 'string') {
122 |         return value;
123 |     }
124 |     throw new TaskValidationError(`Task missing required string property \"${field}\"`, {
125 |         taskId: ids.taskId,
126 |         errors: [buildRequiredError(field)]
127 |     });
128 | }
129 | function sanitizeStringArray(value) {
130 |     if (value === undefined) {
131 |         return undefined;
132 |     }
133 |     if (!Array.isArray(value)) {
134 |         throw new TaskIngestError('Expected an array of strings', { value });
135 |     }
136 |     const result = value.map((entry, index) => {
137 |         if (typeof entry !== 'string') {
138 |             throw new TaskIngestError('Array entry must be a string', { value: entry, index });
139 |         }
140 |         return entry;
141 |     });
142 |     return result;
143 | }
144 | function sanitizeNumberArray(value, context) {
145 |     if (value === undefined) {
146 |         return undefined;
147 |     }
148 |     if (!Array.isArray(value)) {
149 |         throw new TaskIngestError('Expected an array of numbers', { ...context, value });
150 |     }
151 |     return value.map((entry, index) => {
152 |         if (typeof entry !== 'number' || !Number.isInteger(entry) || entry < 1) {
153 |             throw new TaskIngestError('Array entry must be a positive integer', { ...context, entry, index });
154 |         }
155 |         return entry;
156 |     });
157 | }
158 | function sanitizeArtifacts(value, context) {
159 |     if (value === undefined) {
160 |         return undefined;
161 |     }
162 |     if (!Array.isArray(value)) {
163 |         throw new TaskIngestError('Artifacts must be provided as an array', { ...context, value });
164 |     }
165 |     return value.map((entry, index) => {
166 |         if (typeof entry === 'string') {
167 |             return entry;
168 |         }
169 |         if (!entry || typeof entry !== 'object') {
170 |             throw new TaskIngestError('Artifact entry must be a string or object', { ...context, entry, index });
171 |         }
172 |         const record = entry;
173 |         const name = sanitizeString(record.name, { ...context, index, field: 'name' });
174 |         const path = record.path === undefined ? undefined : sanitizeString(record.path, { ...context, index, field: 'path' });
175 |         const type = record.type === undefined ? undefined : sanitizeString(record.type, { ...context, index, field: 'type' });
176 |         return {
177 |             name,
178 |             path,
179 |             type
180 |         };
181 |     });
182 | }
183 | function sanitizeSubtaskDependencies(value, context) {
184 |     if (value === undefined) {
185 |         return undefined;
186 |     }
187 |     if (!Array.isArray(value)) {
188 |         throw new TaskIngestError('Subtask dependencies must be an array', { ...context, value });
189 |     }
190 |     return value.map((entry, index) => {
191 |         if (typeof entry === 'number' && Number.isInteger(entry) && entry > 0) {
192 |             return entry;
193 |         }
194 |         if (typeof entry === 'string' && entry.trim().length > 0) {
195 |             return entry;
196 |         }
197 |         throw new TaskIngestError('Subtask dependency must be a positive integer or task reference', {
198 |             ...context,
199 |             entry,
200 |             index
201 |         });
202 |     });
203 | }
204 | function normalizeSubtasks(rawSubtasks, taskId, report) {
205 |     if (rawSubtasks === undefined) {
206 |         return [];
207 |     }
208 |     if (!Array.isArray(rawSubtasks)) {
209 |         throw new TaskIngestError('Subtasks must be provided as an array', { taskId, rawSubtasks });
210 |     }
211 |     return rawSubtasks.map((raw, index) => {
212 |         if (!raw || typeof raw !== 'object') {
213 |             throw new TaskIngestError('Subtask entries must be objects', { taskId, index, raw });
214 |         }
215 |         const record = raw;
216 |         const subtaskId = record.id;
217 |         if (typeof subtaskId !== 'number' || !Number.isInteger(subtaskId) || subtaskId < 1) {
218 |             throw new TaskIngestError('Subtask id must be a positive integer', { taskId, index, subtaskId });
219 |         }
220 |         const status = record.status === undefined
221 |             ? DEFAULT_SUBTASK_STATUS
222 |             : normalizeStatus(record.status, 'subtask', { taskId, subtaskId }, report);
223 |         return {
224 |             id: subtaskId,
225 |             title: requireString(record, 'title', { taskId, subtaskId }),
226 |             description: record.description === undefined ? undefined : sanitizeString(record.description, { taskId, subtaskId }),
227 |             details: record.details === undefined ? undefined : sanitizeString(record.details, { taskId, subtaskId }),
228 |             testStrategy: record.testStrategy === undefined ? undefined : sanitizeString(record.testStrategy, { taskId, subtaskId }),
229 |             status,
230 |             parentTaskId: record.parentTaskId === undefined ? undefined : record.parentTaskId,
231 |             dependencies: sanitizeSubtaskDependencies(record.dependencies, { taskId, subtaskId })
232 |         };
233 |     });
234 | }
235 | function normalizeTask(rawTask, report) {
236 |     const taskId = rawTask.id;
237 |     if (typeof taskId !== 'number' || !Number.isInteger(taskId) || taskId < 1) {
238 |         throw new TaskIngestError('Task id must be a positive integer', { taskId });
239 |     }
240 |     const status = normalizeStatus(rawTask.status, 'task', { taskId }, report);
241 |     const dependencies = coerceDependencies(rawTask.dependencies, taskId);
242 |     const subtasks = normalizeSubtasks(rawTask.subtasks, taskId, report);
243 |     const task = {
244 |         id: taskId,
245 |         title: requireString(rawTask, 'title', { taskId }),
246 |         description: requireString(rawTask, 'description', { taskId }),
247 |         status,
248 |         dependencies,
249 |         priority: coerceTaskPriority(rawTask.priority, taskId),
250 |         details: requireString(rawTask, 'details', { taskId }),
251 |         testStrategy: requireString(rawTask, 'testStrategy', { taskId }),
252 |         subtasks,
253 |         labels: sanitizeStringArray(rawTask.labels),
254 |         metadata: rawTask.metadata && typeof rawTask.metadata === 'object' && !Array.isArray(rawTask.metadata)
255 |             ? rawTask.metadata
256 |             : undefined,
257 |         evidence: Array.isArray(rawTask.evidence) ? rawTask.evidence : undefined,
258 |         artifacts: sanitizeArtifacts(rawTask.artifacts, { taskId }),
259 |         source_doc: rawTask.source_doc === undefined ? undefined : sanitizeString(rawTask.source_doc, { taskId }),
260 |         lineage: sanitizeNumberArray(rawTask.lineage, { taskId, field: 'lineage' }),
261 |         supersedes: sanitizeNumberArray(rawTask.supersedes, { taskId, field: 'supersedes' }),
262 |         superseded_by: sanitizeNumberArray(rawTask.superseded_by, { taskId, field: 'superseded_by' }),
263 |         reason: rawTask.reason === undefined ? undefined : sanitizeString(rawTask.reason, { taskId })
264 |     };
265 |     return task;
266 | }
267 | function canonicaliseTasks(rawTasks) {
268 |     const report = {
269 |         total: rawTasks.length,
270 |         remapped: []
271 |     };
272 |     const tasks = rawTasks.map((raw) => normalizeTask(raw, report));
273 |     return { tasks, report };
274 | }
275 | export async function ingestTasks(filePath, options = {}) {
276 |     const tag = options.tag ?? 'master';
277 |     const schemaPath = DEFAULT_SCHEMA_PATH;
278 |     const rawFile = await readFile(filePath, 'utf8');
279 |     let parsed;
280 |     try {
281 |         parsed = JSON.parse(rawFile);
282 |     }
283 |     catch (error) {
284 |         throw new TaskIngestError('Failed to parse tasks.json', { cause: error });
285 |     }
286 |     const rawTasks = extractTasksFromDocument(parsed, tag);
287 |     const { tasks, report } = canonicaliseTasks(rawTasks);
288 |     const validator = await getValidator(schemaPath);
289 |     for (const task of tasks) {
290 |         const valid = validator(task);
291 |         if (!valid) {
292 |             throw new TaskValidationError('Task failed schema validation', {
293 |                 taskId: task.id,
294 |                 errors: validator.errors ?? []
295 |             });
296 |         }
297 |     }
298 |     return { tasks, report };
299 | }
```

src/adapters/taskmaster/ingest.ts
```
1 | import { access, readFile } from 'node:fs/promises';
2 | import { dirname, join, resolve } from 'node:path';
3 | import { fileURLToPath } from 'node:url';
4 | 
5 | import Ajv from 'ajv';
6 | import type { ValidateFunction, ErrorObject } from 'ajv';
7 | 
8 | import {
9 |   STATUS_ALIASES,
10 |   type CanonicalTaskStatus,
11 |   type IngestOptions,
12 |   type IngestResult,
13 |   type PromptsSubtask,
14 |   type PromptsTask,
15 |   type PromptsArtifactReference,
16 |   type StatusNormalizationEntry,
17 |   type StatusNormalizationReport,
18 |   type TaskPriority
19 | } from '../../types/prompts-task.js';
20 | import { enrichTasks } from '../../enrichment/index.js';
21 | 
22 | export class TaskIngestError extends Error {
23 |   constructor(message: string, readonly context?: Record<string, unknown>) {
24 |     super(message);
25 |     this.name = 'TaskIngestError';
26 |   }
27 | }
28 | 
29 | export class TaskValidationError extends TaskIngestError {
30 |   constructor(message: string, context: { taskId: number; errors: ErrorObject[] }) {
31 |     super(message, context);
32 |     this.name = 'TaskValidationError';
33 |   }
34 | }
35 | 
36 | async function resolveDefaultSchemaPath(): Promise<string> {
37 |   // 1) Try module-relative path for source layout (src/... -> ../../.. to repo root)
38 |   const moduleDir = dirname(fileURLToPath(import.meta.url));
39 |   const srcRelative = resolve(moduleDir, '../../../schemas/task.json');
40 |   try {
41 |     await access(srcRelative);
42 |     return srcRelative;
43 |   } catch {}
44 | 
45 |   // 2) Walk up to package root and use schemas/task.json next to package.json
46 |   let dir: string | undefined = moduleDir;
47 |   for (let i = 0; i < 6 && dir; i++) {
48 |     try {
49 |       await access(join(dir, 'package.json'));
50 |       const candidate = join(dir, 'schemas', 'task.json');
51 |       await access(candidate);
52 |       return candidate;
53 |     } catch {
54 |       const parent = dirname(dir);
55 |       dir = parent !== dir ? parent : undefined;
56 |     }
57 |   }
58 | 
59 |   // 3) Fallback to CWD-based resolution (legacy behavior)
60 |   return resolve(process.cwd(), 'schemas/task.json');
61 | }
62 | const DEFAULT_SUBTASK_STATUS: CanonicalTaskStatus = 'pending';
63 | const ajv = new Ajv({
64 |   allErrors: true,
65 |   jsonPointers: true
66 | });
67 | 
68 | let validatorCache: ValidateFunction | null = null;
69 | let cachedSchemaPath: string | null = null;
70 | 
71 | async function getValidator(schemaPath: string): Promise<ValidateFunction> {
72 |   if (validatorCache && cachedSchemaPath === schemaPath) {
73 |     return validatorCache;
74 |   }
75 | 
76 |   const schemaRaw = await readFile(schemaPath, 'utf8');
77 |   const schemaJson = JSON.parse(schemaRaw) as unknown;
78 |   const validator = ajv.compile(schemaJson as object) as ValidateFunction;
79 |   validatorCache = validator;
80 |   cachedSchemaPath = schemaPath;
81 |   return validator;
82 | }
83 | 
84 | function coerceTaskPriority(value: unknown, taskId: number): TaskPriority {
85 |   if (typeof value !== 'string') {
86 |     throw new TaskIngestError('Task priority must be a string', { taskId, value });
87 |   }
88 |   const normalized = value.toLowerCase();
89 |   if (normalized === 'high' || normalized === 'medium' || normalized === 'low') {
90 |     return normalized;
91 |   }
92 |   throw new TaskIngestError('Task priority is not recognised', { taskId, value });
93 | }
94 | 
95 | function normalizeStatus(
96 |   rawStatus: unknown,
97 |   entity: 'task' | 'subtask',
98 |   ids: { taskId: number; subtaskId?: number },
99 |   report: StatusNormalizationReport
100 | ): CanonicalTaskStatus {
101 |   if (typeof rawStatus !== 'string' || rawStatus.trim().length === 0) {
102 |     throw new TaskIngestError('Status must be a non-empty string', { entity, ...ids, rawStatus });
103 |   }
104 | 
105 |   const key = rawStatus.trim().toLowerCase();
106 |   const canonical = STATUS_ALIASES[key];
107 |   if (!canonical) {
108 |     throw new TaskIngestError('Encountered unsupported status value', { entity, ...ids, rawStatus });
109 |   }
110 | 
111 |   if (canonical !== rawStatus) {
112 |     report.remapped.push({ entity, from: rawStatus, to: canonical, ...ids });
113 |   }
114 | 
115 |   return canonical;
116 | }
117 | 
118 | interface RawTaskDocument {
119 |   tasks: unknown;
120 | }
121 | 
122 | type RawTask = Record<string, unknown>;
123 | 
124 | function extractTasksFromDocument(doc: unknown, tag: string): RawTask[] {
125 |   if (!doc || typeof doc !== 'object') {
126 |     throw new TaskIngestError('tasks.json must contain an object at the root');
127 |   }
128 | 
129 |   if (Array.isArray((doc as RawTaskDocument).tasks)) {
130 |     return (doc as RawTaskDocument).tasks as RawTask[];
131 |   }
132 | 
133 |   const tagged = doc as Record<string, unknown>;
134 |   const tagEntry = tagged[tag];
135 |   if (!tagEntry || typeof tagEntry !== 'object') {
136 |     throw new TaskIngestError('Requested tag was not found in tasks.json', { tag });
137 |   }
138 |   const tasks = (tagEntry as RawTaskDocument).tasks;
139 |   if (!Array.isArray(tasks)) {
140 |     throw new TaskIngestError('Tag entry must include a tasks array', { tag });
141 |   }
142 |   return tasks as RawTask[];
143 | }
144 | 
145 | function coerceDependencies(value: unknown, taskId: number): number[] {
146 |   if (value === undefined) {
147 |     return [];
148 |   }
149 |   if (!Array.isArray(value)) {
150 |     throw new TaskIngestError('Task dependencies must be an array', { taskId, value });
151 |   }
152 |   return value.map((entry, index) => {
153 |     if (typeof entry === 'number' && Number.isInteger(entry) && entry > 0) {
154 |       return entry;
155 |     }
156 |     if (typeof entry === 'string' && /^\d+$/.test(entry.trim())) {
157 |       return Number.parseInt(entry.trim(), 10);
158 |     }
159 |     throw new TaskIngestError('Task dependency must be a positive integer', {
160 |       taskId,
161 |       value: entry,
162 |       index
163 |     });
164 |   });
165 | }
166 | 
167 | function sanitizeString(value: unknown, context?: Record<string, unknown>, fallback?: string): string {
168 |   if (typeof value === 'string') {
169 |     return value;
170 |   }
171 |   if ((value === undefined || value === null) && fallback !== undefined) {
172 |     return fallback;
173 |   }
174 |   throw new TaskIngestError('Expected a string value', { ...context, value });
175 | }
176 | 
177 | function buildRequiredError(field: string): ErrorObject {
178 |   return {
179 |     dataPath: '',
180 |     schemaPath: '#/required',
181 |     keyword: 'required',
182 |     params: { missingProperty: field },
183 |     message: `must have required property '${field}'`
184 |   };
185 | }
186 | 
187 | function requireString(
188 |   record: RawTask,
189 |   field: string,
190 |   ids: { taskId: number; subtaskId?: number }
191 | ): string {
192 |   const value = record[field];
193 |   if (typeof value === 'string') {
194 |     return value;
195 |   }
196 |   throw new TaskValidationError(`Task missing required string property \"${field}\"`, {
197 |     taskId: ids.taskId,
198 |     errors: [buildRequiredError(field)]
199 |   });
200 | }
201 | 
202 | function sanitizeStringArray(value: unknown): string[] | undefined {
203 |   if (value === undefined) {
204 |     return undefined;
205 |   }
206 |   if (!Array.isArray(value)) {
207 |     throw new TaskIngestError('Expected an array of strings', { value });
208 |   }
209 |   const result = value.map((entry, index) => {
210 |     if (typeof entry !== 'string') {
211 |       throw new TaskIngestError('Array entry must be a string', { value: entry, index });
212 |     }
213 |     return entry;
214 |   });
215 |   return result;
216 | }
217 | 
218 | function sanitizeNumberArray(value: unknown, context: Record<string, unknown>): number[] | undefined {
219 |   if (value === undefined) {
220 |     return undefined;
221 |   }
222 |   if (!Array.isArray(value)) {
223 |     throw new TaskIngestError('Expected an array of numbers', { ...context, value });
224 |   }
225 |   return value.map((entry, index) => {
226 |     if (typeof entry !== 'number' || !Number.isInteger(entry) || entry < 1) {
227 |       throw new TaskIngestError('Array entry must be a positive integer', { ...context, entry, index });
228 |     }
229 |     return entry;
230 |   });
231 | }
232 | 
233 | function sanitizeArtifacts(
234 |   value: unknown,
235 |   context: { taskId: number; subtaskId?: number }
236 | ): Array<string | PromptsArtifactReference> | undefined {
237 |   if (value === undefined) {
238 |     return undefined;
239 |   }
240 |   if (!Array.isArray(value)) {
241 |     throw new TaskIngestError('Artifacts must be provided as an array', { ...context, value });
242 |   }
243 | 
244 |   return value.map((entry, index) => {
245 |     if (typeof entry === 'string') {
246 |       return entry;
247 |     }
248 | 
249 |     if (!entry || typeof entry !== 'object') {
250 |       throw new TaskIngestError('Artifact entry must be a string or object', { ...context, entry, index });
251 |     }
252 | 
253 |     const record = entry as Record<string, unknown>;
254 |     const name = sanitizeString(record.name, { ...context, index, field: 'name' });
255 |     const path = record.path === undefined ? undefined : sanitizeString(record.path, { ...context, index, field: 'path' });
256 |     const type = record.type === undefined ? undefined : sanitizeString(record.type, { ...context, index, field: 'type' });
257 | 
258 |     return {
259 |       name,
260 |       path,
261 |       type
262 |     } satisfies PromptsArtifactReference;
263 |   });
264 | }
265 | 
266 | function sanitizeSubtaskDependencies(value: unknown, context: Record<string, unknown>): Array<number | string> | undefined {
267 |   if (value === undefined) {
268 |     return undefined;
269 |   }
270 |   if (!Array.isArray(value)) {
271 |     throw new TaskIngestError('Subtask dependencies must be an array', { ...context, value });
272 |   }
273 |   return value.map((entry, index) => {
274 |     if (typeof entry === 'number' && Number.isInteger(entry) && entry > 0) {
275 |       return entry;
276 |     }
277 |     if (typeof entry === 'string' && entry.trim().length > 0) {
278 |       return entry;
279 |     }
280 |     throw new TaskIngestError('Subtask dependency must be a positive integer or task reference', {
281 |       ...context,
282 |       entry,
283 |       index
284 |     });
285 |   });
286 | }
287 | 
288 | function normalizeSubtasks(
289 |   rawSubtasks: unknown,
290 |   taskId: number,
291 |   report: StatusNormalizationReport
292 | ): PromptsSubtask[] {
293 |   if (rawSubtasks === undefined) {
294 |     return [];
295 |   }
296 |   if (!Array.isArray(rawSubtasks)) {
297 |     throw new TaskIngestError('Subtasks must be provided as an array', { taskId, rawSubtasks });
298 |   }
299 | 
300 |   return rawSubtasks.map((raw, index) => {
301 |     if (!raw || typeof raw !== 'object') {
302 |       throw new TaskIngestError('Subtask entries must be objects', { taskId, index, raw });
303 |     }
304 | 
305 |     const record = raw as RawTask;
306 |     const subtaskId = record.id;
307 |     if (typeof subtaskId !== 'number' || !Number.isInteger(subtaskId) || subtaskId < 1) {
308 |       throw new TaskIngestError('Subtask id must be a positive integer', { taskId, index, subtaskId });
309 |     }
310 | 
311 |     const status =
312 |       record.status === undefined
313 |         ? DEFAULT_SUBTASK_STATUS
314 |         : normalizeStatus(record.status, 'subtask', { taskId, subtaskId }, report);
315 | 
316 |     return {
317 |       id: subtaskId,
318 |       title: requireString(record, 'title', { taskId, subtaskId }),
319 |       description: record.description === undefined ? undefined : sanitizeString(record.description, { taskId, subtaskId }),
320 |       details: record.details === undefined ? undefined : sanitizeString(record.details, { taskId, subtaskId }),
321 |       testStrategy: record.testStrategy === undefined ? undefined : sanitizeString(record.testStrategy, { taskId, subtaskId }),
322 |       status,
323 |       parentTaskId: record.parentTaskId === undefined ? undefined : (record.parentTaskId as number),
324 |       dependencies: sanitizeSubtaskDependencies(record.dependencies, { taskId, subtaskId })
325 |     } satisfies PromptsSubtask;
326 |   });
327 | }
328 | 
329 | function normalizeTask(rawTask: RawTask, report: StatusNormalizationReport): PromptsTask {
330 |   const taskId = rawTask.id;
331 |   if (typeof taskId !== 'number' || !Number.isInteger(taskId) || taskId < 1) {
332 |     throw new TaskIngestError('Task id must be a positive integer', { taskId });
333 |   }
334 | 
335 |   const status = normalizeStatus(rawTask.status, 'task', { taskId }, report);
336 |   const dependencies = coerceDependencies(rawTask.dependencies, taskId);
337 |   const subtasks = normalizeSubtasks(rawTask.subtasks, taskId, report);
338 | 
339 |   const task: PromptsTask = {
340 |     id: taskId,
341 |     title: requireString(rawTask, 'title', { taskId }),
342 |     description: requireString(rawTask, 'description', { taskId }),
343 |     status,
344 |     dependencies,
345 |     priority: coerceTaskPriority(rawTask.priority, taskId),
346 |     details: requireString(rawTask, 'details', { taskId }),
347 |     testStrategy: requireString(rawTask, 'testStrategy', { taskId }),
348 |     subtasks,
349 |     labels: sanitizeStringArray(rawTask.labels),
350 |     metadata:
351 |       rawTask.metadata && typeof rawTask.metadata === 'object' && !Array.isArray(rawTask.metadata)
352 |         ? (rawTask.metadata as Record<string, unknown>)
353 |         : undefined,
354 |     evidence: Array.isArray(rawTask.evidence) ? (rawTask.evidence as Array<string | Record<string, unknown>>) : undefined,
355 |     artifacts: sanitizeArtifacts(rawTask.artifacts, { taskId }),
356 |     source_doc: rawTask.source_doc === undefined ? undefined : sanitizeString(rawTask.source_doc, { taskId }),
357 |     lineage: sanitizeNumberArray(rawTask.lineage, { taskId, field: 'lineage' }),
358 |     supersedes: sanitizeNumberArray(rawTask.supersedes, { taskId, field: 'supersedes' }),
359 |     superseded_by: sanitizeNumberArray(rawTask.superseded_by, { taskId, field: 'superseded_by' }),
360 |     reason: rawTask.reason === undefined ? undefined : sanitizeString(rawTask.reason, { taskId })
361 |   };
362 | 
363 |   return task;
364 | }
365 | 
366 | function canonicaliseTasks(rawTasks: RawTask[]): { tasks: PromptsTask[]; report: StatusNormalizationReport } {
367 |   const report: StatusNormalizationReport = {
368 |     total: rawTasks.length,
369 |     remapped: []
370 |   };
371 |   const tasks = rawTasks.map((raw) => normalizeTask(raw, report));
372 |   return { tasks, report };
373 | }
374 | 
375 | export async function ingestTasks(
376 |   filePath: string,
377 |   options: IngestOptions = {}
378 | ): Promise<IngestResult> {
379 |   const tag = options.tag ?? 'master';
380 |   const schemaPath = options.schemaPath ?? (await resolveDefaultSchemaPath());
381 | 
382 |   const rawFile = await readFile(filePath, 'utf8');
383 |   let parsed: unknown;
384 |   try {
385 |     parsed = JSON.parse(rawFile);
386 |   } catch (error) {
387 |     throw new TaskIngestError('Failed to parse tasks.json', { cause: error });
388 |   }
389 | 
390 |   const rawTasks = extractTasksFromDocument(parsed, tag);
391 |   const { tasks, report } = canonicaliseTasks(rawTasks);
392 | 
393 |   // Optional enrichment step; non-blocking by design
394 |   const enriched = await enrichTasks(tasks, process.cwd());
395 |   const finalTasks = enriched.tasks;
396 | 
397 |   const validator = await getValidator(schemaPath);
398 |   for (const task of finalTasks) {
399 |     const valid = validator(task);
400 |     if (!valid) {
401 |       throw new TaskValidationError('Task failed schema validation', {
402 |         taskId: task.id,
403 |         errors: validator.errors ?? []
404 |       });
405 |     }
406 |   }
407 | 
408 |   return { tasks: finalTasks, report } satisfies IngestResult;
409 | }
```

src/tools/definitions/advance-state.ts
```
1 | import { z } from 'zod';
2 | 
3 | import type { Artifact } from '../../state/state-types.js';
4 | import type { StateStore } from '../../state/StateStore.js';
5 | 
6 | const artifactSchema = z.object({
7 |   name: z.string().min(1, 'Artifact name is required'),
8 |   source: z.string().min(1, 'Artifact source is required'),
9 |   uri: z.string().min(1, 'Artifact uri is required'),
10 | });
11 | 
12 | export const advanceStateInputSchema = z
13 |   .object({
14 |     id: z.string().min(1, 'Tool id is required'),
15 |     outputs: z.record(z.any()).default({}),
16 |     artifacts: z.array(artifactSchema).default([]),
17 |   })
18 |   .strict();
19 | 
20 | export type AdvanceStateInput = z.infer<typeof advanceStateInputSchema>;
21 | 
22 | export interface AdvanceStateResult {
23 |   ok: true;
24 |   statePath: string;
25 | }
26 | 
27 | export interface AdvanceStateTool {
28 |   name: string;
29 |   title: string;
30 |   description: string;
31 |   inputSchema: typeof advanceStateInputSchema;
32 |   handler: (input: AdvanceStateInput) => Promise<AdvanceStateResult>;
33 | }
34 | 
35 | export const createAdvanceStateTool = (stateStore: StateStore): AdvanceStateTool => ({
36 |   name: 'advance_state',
37 |   title: 'Advance Workflow State',
38 |   description:
39 |     'Record a completed workflow tool, capture its outputs, and persist any produced artifacts.',
40 |   inputSchema: advanceStateInputSchema,
41 |   handler: async (input) => {
42 |     const { id, outputs, artifacts } = input;
43 | 
44 |     stateStore.recordCompletion(id, outputs, artifacts as Artifact[]);
45 |     await stateStore.save();
46 | 
47 |     return {
48 |       ok: true,
49 |       statePath: stateStore.statePath,
50 |     } satisfies AdvanceStateResult;
51 |   },
52 | });
```

src/tools/definitions/export-task-list.ts
```
1 | import { promises as fs } from 'node:fs';
2 | import path from 'node:path';
3 | 
4 | import yaml from 'js-yaml';
5 | import { z } from 'zod';
6 | 
7 | const metadataEntrySchema = z
8 |   .object({
9 |     id: z.string().min(1, 'id is required'),
10 |     title: z.string().min(1, 'title is required'),
11 |     dependsOn: z.array(z.string()).optional().default([]),
12 |   })
13 |   .passthrough();
14 | 
15 | const metadataArraySchema = z.array(metadataEntrySchema);
16 | 
17 | export interface ExportedTask {
18 |   id: string;
19 |   title: string;
20 |   dependsOn: string[];
21 |   status: 'pending';
22 | }
23 | 
24 | export interface ExportTaskListResult {
25 |   ok: true;
26 |   tasks: ExportedTask[];
27 | }
28 | 
29 | export interface ExportTaskListTool {
30 |   name: string;
31 |   title: string;
32 |   description: string;
33 |   inputSchema: z.ZodObject<Record<string, never>>;
34 |   handler: () => Promise<ExportTaskListResult>;
35 | }
36 | 
37 | const METADATA_FILE = path.join(process.cwd(), 'resources', 'prompts.meta.yaml');
38 | 
39 | const loadMetadata = async (): Promise<ExportedTask[]> => {
40 |   const raw = await fs.readFile(METADATA_FILE, 'utf8');
41 |   const parsed = yaml.load(raw);
42 |   const entries = metadataArraySchema.parse(parsed ?? []);
43 |   return entries.map((entry) => ({
44 |     id: entry.id,
45 |     title: entry.title,
46 |     dependsOn: entry.dependsOn ?? [],
47 |     status: 'pending' as const,
48 |   }));
49 | };
50 | 
51 | const emptySchema = z.object({}).strict();
52 | 
53 | export const createExportTaskListTool = (): ExportTaskListTool => ({
54 |   name: 'export_task_list',
55 |   title: 'Export Task List',
56 |   description: 'Expose prompts.meta.yaml as a normalized task list for external systems.',
57 |   inputSchema: emptySchema,
58 |   handler: async () => {
59 |     const tasks = await loadMetadata();
60 |     return {
61 |       ok: true,
62 |       tasks,
63 |     } satisfies ExportTaskListResult;
64 |   },
65 | });
```

src/tools/definitions/refresh-metadata.ts
```
1 | import { spawn } from 'node:child_process';
2 | 
3 | import { z } from 'zod';
4 | 
5 | export const refreshMetadataInputSchema = z
6 |   .object({
7 |     updateWorkflow: z.boolean().default(false),
8 |   })
9 |   .strict();
10 | 
11 | export type RefreshMetadataInput = z.infer<typeof refreshMetadataInputSchema>;
12 | 
13 | export interface RefreshMetadataResult {
14 |   ok: true;
15 |   summary: string;
16 |   steps: Array<{
17 |     command: string;
18 |     args: string[];
19 |     stdout: string;
20 |     stderr: string;
21 |   }>;
22 | }
23 | 
24 | export type RefreshMetadataError = CommandError;
25 | 
26 | export interface RefreshMetadataTool {
27 |   name: string;
28 |   title: string;
29 |   description: string;
30 |   inputSchema: typeof refreshMetadataInputSchema;
31 |   handler: (input: RefreshMetadataInput) => Promise<RefreshMetadataResult>;
32 | }
33 | 
34 | interface RunCommandResult {
35 |   stdout: string;
36 |   stderr: string;
37 | }
38 | 
39 | interface CommandError extends Error {
40 |   stdout: string;
41 |   stderr: string;
42 |   exitCode: number | null;
43 | }
44 | 
45 | const runCommand = async (command: string, args: string[]): Promise<RunCommandResult> => {
46 |   return await new Promise<RunCommandResult>((resolve, reject) => {
47 |     const child = spawn(command, args, {
48 |       cwd: process.cwd(),
49 |       env: process.env,
50 |     });
51 | 
52 |     let stdout = '';
53 |     let stderr = '';
54 | 
55 |     child.stdout.on('data', (data) => {
56 |       stdout += data.toString();
57 |     });
58 | 
59 |     child.stderr.on('data', (data) => {
60 |       stderr += data.toString();
61 |     });
62 | 
63 |     child.on('error', (error) => {
64 |       reject(error);
65 |     });
66 | 
67 |     child.on('close', (code) => {
68 |       if (code === 0) {
69 |         resolve({ stdout, stderr });
70 |       } else {
71 |         const error = new Error(
72 |           `${command} ${args.join(' ')} exited with code ${code}`,
73 |         ) as CommandError;
74 |         error.stdout = stdout;
75 |         error.stderr = stderr;
76 |         error.exitCode = code;
77 |         reject(error);
78 |       }
79 |     });
80 |   });
81 | };
82 | 
83 | export const createRefreshMetadataTool = (): RefreshMetadataTool => ({
84 |   name: 'refresh_metadata',
85 |   title: 'Refresh Prompt Metadata and Catalog',
86 |   description:
87 |     'Run npm scripts to validate prompt metadata and rebuild catalog/README artifacts, optionally updating WORKFLOW.md.',
88 |   inputSchema: refreshMetadataInputSchema,
89 |   handler: async ({ updateWorkflow }) => {
90 |     const steps: RefreshMetadataResult['steps'] = [];
91 | 
92 |     const validateResult = await runCommand('npm', ['run', 'validate:metadata']);
93 |     steps.push({
94 |       command: 'npm',
95 |       args: ['run', 'validate:metadata'],
96 |       stdout: validateResult.stdout,
97 |       stderr: validateResult.stderr,
98 |     });
99 | 
100 |     const buildArgs = ['run', 'build:catalog'];
101 |     if (updateWorkflow) {
102 |       buildArgs.push('--', '--update-workflow');
103 |     }
104 |     const buildResult = await runCommand('npm', buildArgs);
105 |     steps.push({
106 |       command: 'npm',
107 |       args: buildArgs,
108 |       stdout: buildResult.stdout,
109 |       stderr: buildResult.stderr,
110 |     });
111 | 
112 |     const summary = updateWorkflow
113 |       ? 'Metadata validated and catalog/README/WORKFLOW regenerated.'
114 |       : 'Metadata validated and catalog/README regenerated.';
115 | 
116 |     return {
117 |       ok: true,
118 |       summary,
119 |       steps,
120 |     } satisfies RefreshMetadataResult;
121 |   },
122 | });
```

src/tools/definitions/run-domain.ts
```
1 | import { z } from 'zod';
2 | import { createRunScriptTool } from './run-script.js';
3 | 
4 | const baseSchema = z
5 |   .object({
6 |     args: z.array(z.string()).optional(),
7 |     dryRun: z.boolean().default(false),
8 |     timeoutMs: z.number().int().positive().max(300_000).default(60_000),
9 |   })
10 |   .strict();
11 | 
12 | export const createRunTestsTool = () => {
13 |   const runScript = createRunScriptTool();
14 |   return {
15 |     name: 'workflow/run_tests',
16 |     title: 'Run project tests',
17 |     description: 'Execute the test suite using an allowlisted package script.',
18 |     inputSchema: baseSchema,
19 |     async handler(raw: unknown) {
20 |       const parsed = baseSchema.safeParse(raw ?? {});
21 |       if (!parsed.success) {
22 |         return { isError: true, summary: 'workflow/run_tests input validation failed', issues: parsed.error.flatten() };
23 |       }
24 |       const { args = [], dryRun, timeoutMs } = parsed.data;
25 |       return runScript.handler({ script: 'test:jest', args, dryRun, timeoutMs });
26 |     },
27 |   };
28 | };
29 | 
30 | export const createRunBuildTool = () => {
31 |   const runScript = createRunScriptTool();
32 |   return {
33 |     name: 'workflow/run_build',
34 |     title: 'Run project build',
35 |     description: 'Execute the build using an allowlisted package script.',
36 |     inputSchema: baseSchema,
37 |     async handler(raw: unknown) {
38 |       const parsed = baseSchema.safeParse(raw ?? {});
39 |       if (!parsed.success) {
40 |         return { isError: true, summary: 'workflow/run_build input validation failed', issues: parsed.error.flatten() };
41 |       }
42 |       const { args = [], dryRun, timeoutMs } = parsed.data;
43 |       return runScript.handler({ script: 'build', args, dryRun, timeoutMs });
44 |     },
45 |   };
46 | };
47 | 
48 | export const createRunLintTool = () => {
49 |   const runScript = createRunScriptTool();
50 |   return {
51 |     name: 'workflow/run_lint',
52 |     title: 'Run project lint',
53 |     description: 'Execute the linter using an allowlisted package script.',
54 |     inputSchema: baseSchema,
55 |     async handler(raw: unknown) {
56 |       const parsed = baseSchema.safeParse(raw ?? {});
57 |       if (!parsed.success) {
58 |         return { isError: true, summary: 'workflow/run_lint input validation failed', issues: parsed.error.flatten() };
59 |       }
60 |       const { args = [], dryRun, timeoutMs } = parsed.data;
61 |       return runScript.handler({ script: 'lint', args, dryRun, timeoutMs });
62 |     },
63 |   };
64 | };
```

src/tools/definitions/run-script.ts
```
1 | import { spawn } from 'node:child_process';
2 | import { createRequire } from 'node:module';
3 | 
4 | import { z } from 'zod';
5 | 
6 | const require = createRequire(import.meta.url);
7 | const packageJson = require('../../../package.json') as { mcpAllowScripts?: string[] };
8 | 
9 | export const createRunScriptTool = () => ({
10 |   name: 'workflow/run_script',
11 |   title: 'Run an allowed package script',
12 |   description:
13 |     'Execute an allowed script from package.json in a sandboxed way. Disabled unless PROMPTS_EXEC_ALLOW=1 and script is allowlisted under package.json#mcpAllowScripts.',
14 |   inputSchema: z
15 |     .object({
16 |       script: z.string(),
17 |       args: z.array(z.string()).optional(),
18 |       timeoutMs: z.number().int().positive().max(300_000).default(60_000),
19 |       dryRun: z.boolean().default(false),
20 |     })
21 |     .strict(),
22 |   async handler(raw: unknown) {
23 |     const parsed = this.inputSchema.safeParse(raw);
24 |     if (!parsed.success) {
25 |       return {
26 |         isError: true,
27 |         summary: 'workflow/run_script input validation failed',
28 |         issues: parsed.error.flatten(),
29 |       };
30 |     }
31 |     const { script, args = [], timeoutMs, dryRun } = parsed.data;
32 | 
33 |     const allowed = new Set(packageJson.mcpAllowScripts ?? []);
34 |     if (!allowed.has(script)) {
35 |       return {
36 |         isError: true,
37 |         summary: `Script not allowed: ${script}. Add to package.json#mcpAllowScripts to permit.`,
38 |         allowed: Array.from(allowed),
39 |       };
40 |     }
41 | 
42 |     if (dryRun) {
43 |       return {
44 |         isError: false,
45 |         summary: `DRY RUN: npm run --silent ${script} ${args.join(' ')}`.trim(),
46 |         ok: true,
47 |       };
48 |     }
49 | 
50 |     if (process.env.PROMPTS_EXEC_ALLOW !== '1') {
51 |       return {
52 |         isError: true,
53 |         summary:
54 |           'Execution disabled. Set PROMPTS_EXEC_ALLOW=1 and restart the server to enable workflow/run_script.',
55 |       };
56 |     }
57 | 
58 |     const stdio: Buffer[] = [];
59 |     const child = spawn('npm', ['run', '--silent', script, ...args], {
60 |       cwd: process.cwd(),
61 |       env: process.env,
62 |       stdio: ['ignore', 'pipe', 'pipe'],
63 |     });
64 | 
65 |     let timedOut = false;
66 |     const timer = setTimeout(() => {
67 |       timedOut = true;
68 |       child.kill('SIGTERM');
69 |     }, timeoutMs);
70 | 
71 |     return await new Promise((resolve) => {
72 |       child.stdout.on('data', (chunk) => stdio.push(Buffer.from(chunk)));
73 |       child.stderr.on('data', (chunk) => stdio.push(Buffer.from(chunk)));
74 |       child.on('error', (err) => {
75 |         clearTimeout(timer);
76 |         resolve({
77 |           isError: true,
78 |           summary: `Failed to start process: ${err?.message ?? 'spawn error'}`,
79 |           ok: false,
80 |           exitCode: -1,
81 |           output: stdio.length ? Buffer.concat(stdio).toString('utf8') : '',
82 |         });
83 |       });
84 |       child.on('close', (code) => {
85 |         clearTimeout(timer);
86 |         resolve({
87 |           isError: code !== 0 || timedOut,
88 |           summary: timedOut
89 |             ? `Timed out after ${timeoutMs} ms`
90 |             : `Exited with code ${code ?? -1}`,
91 |           ok: !timedOut && code === 0,
92 |           exitCode: code ?? -1,
93 |           output: stdio.length ? Buffer.concat(stdio).toString('utf8') : '',
94 |         });
95 |       });
96 |     });
97 |   },
98 | });
```

src/tools/definitions/run-task-action.ts
```
1 | import { readFile } from 'node:fs/promises';
2 | 
3 | import { z } from 'zod';
4 | 
5 | import type { TaskService } from '../../mcp/task-service.js';
6 | import { createRunScriptTool } from './run-script.js';
7 | 
8 | const ActionsSchema = z.record(z.string(), z.object({ script: z.string(), args: z.array(z.string()).optional() }));
9 | 
10 | export const createRunTaskActionTool = (service: TaskService) => ({
11 |   name: 'workflow/run_task_action',
12 |   title: 'Run action mapped to a task id',
13 |   description: 'Resolve an action (script + args) from task metadata or actions.json and execute via run_script.',
14 |   inputSchema: z
15 |     .object({
16 |       taskId: z.number().int().positive(),
17 |       actionsPath: z.string().optional(),
18 |       dryRun: z.boolean().default(false),
19 |       timeoutMs: z.number().int().positive().max(300_000).default(60_000),
20 |     })
21 |     .strict(),
22 |   async handler(raw: unknown) {
23 |     const parsed = this.inputSchema.safeParse(raw);
24 |     if (!parsed.success) {
25 |       return {
26 |         isError: true,
27 |         summary: 'workflow/run_task_action input validation failed',
28 |         issues: parsed.error.flatten(),
29 |       };
30 |     }
31 | 
32 |     const { taskId, actionsPath, dryRun, timeoutMs } = parsed.data;
33 |     const task = service.get(taskId);
34 |     if (!task) {
35 |       return { isError: true, summary: `Task ${taskId} not found.` };
36 |     }
37 | 
38 |     // 1) Task metadata action
39 |     const metadata = (task as any).metadata;
40 |     let action: { script: string; args?: string[] } | null = null;
41 |     if (metadata && typeof metadata === 'object' && metadata.action && typeof metadata.action === 'object') {
42 |       const record = metadata.action as { script?: unknown; args?: unknown };
43 |       if (typeof record.script === 'string') {
44 |         action = { script: record.script, args: Array.isArray(record.args) ? (record.args as string[]) : [] };
45 |       }
46 |     }
47 | 
48 |     // 2) actions.json fallback
49 |     if (!action) {
50 |       const path = actionsPath ?? 'actions.json';
51 |       try {
52 |         const raw = await readFile(path, 'utf8');
53 |         const table = ActionsSchema.parse(JSON.parse(raw));
54 |         const entry = table[String(taskId)];
55 |         if (entry) action = { script: entry.script, args: entry.args };
56 |       } catch {
57 |         // ignore missing/invalid actions file
58 |       }
59 |     }
60 | 
61 |     if (!action) {
62 |       return { isError: true, summary: `No action mapped for task ${taskId}.` };
63 |     }
64 | 
65 |     const runScript = createRunScriptTool();
66 |     const result: any = await runScript.handler({
67 |       script: action.script,
68 |       args: action.args ?? [],
69 |       dryRun,
70 |       timeoutMs,
71 |     });
72 |     return {
73 |       isError: Boolean(result.isError),
74 |       summary: `${String(result.summary)} (task ${taskId})`,
75 |       ok: Boolean(result.ok),
76 |       exitCode: typeof result.exitCode === 'number' ? result.exitCode : undefined,
77 |       output: typeof result.output === 'string' ? result.output : undefined,
78 |     };
79 |   },
80 | });
```

test/state/graph/computeReadiness.test.ts
```
1 | import { describe, expect, test } from '@jest/globals';
2 | 
3 | import { computeReadiness } from '../../../src/state/graph.ts';
4 | import type { PromptsTask } from '../../../src/types/prompts-task.ts';
5 | 
6 | const createTask = (
7 |   overrides: Partial<PromptsTask> & { id: number },
8 |   base?: PromptsTask,
9 | ): PromptsTask => ({
10 |   id: overrides.id,
11 |   title: overrides.title ?? `Task ${overrides.id}`,
12 |   description: overrides.description ?? 'desc',
13 |   status: overrides.status ?? 'pending',
14 |   dependencies: overrides.dependencies ?? [],
15 |   priority: overrides.priority ?? 'medium',
16 |   details: overrides.details ?? '',
17 |   testStrategy: overrides.testStrategy ?? '',
18 |   subtasks: overrides.subtasks ?? [],
19 |   labels: overrides.labels ?? base?.labels,
20 |   metadata: overrides.metadata ?? base?.metadata,
21 |   evidence: overrides.evidence ?? base?.evidence,
22 |   artifacts: overrides.artifacts ?? base?.artifacts,
23 |   source_doc: overrides.source_doc ?? base?.source_doc,
24 |   lineage: overrides.lineage ?? base?.lineage,
25 |   supersedes: overrides.supersedes ?? base?.supersedes,
26 |   superseded_by: overrides.superseded_by ?? base?.superseded_by,
27 |   reason: overrides.reason ?? base?.reason,
28 | });
29 | 
30 | describe('computeReadiness', () => {
31 |   test('returns tasks with no dependencies that are pending', () => {
32 |     const tasks: PromptsTask[] = [
33 |       createTask({ id: 1 }),
34 |       createTask({ id: 2, status: 'done' }),
35 |     ];
36 | 
37 |     const ready = computeReadiness(tasks);
38 | 
39 |     expect(ready.map((task) => task.id)).toEqual([1]);
40 |   });
41 | 
42 |   test('excludes tasks when dependencies are not completed', () => {
43 |     const tasks: PromptsTask[] = [
44 |       createTask({ id: 1, status: 'pending', dependencies: [2] }),
45 |       createTask({ id: 2, status: 'in_progress' }),
46 |     ];
47 | 
48 |     const ready = computeReadiness(tasks);
49 | 
50 |     expect(ready).toHaveLength(0);
51 |   });
52 | 
53 |   test('includes tasks when dependencies are done or deprecated', () => {
54 |     const tasks: PromptsTask[] = [
55 |       createTask({ id: 1, status: 'done' }),
56 |       createTask({ id: 2, status: 'deprecated' }),
57 |       createTask({ id: 3, status: 'pending', dependencies: [1, 2] }),
58 |       createTask({ id: 4, status: 'pending', dependencies: [2] }),
59 |     ];
60 | 
61 |     const ready = computeReadiness(tasks);
62 | 
63 |     expect(ready.map((task) => task.id)).toEqual([3, 4]);
64 |   });
65 | 
66 |   test('excludes tasks referencing missing dependencies', () => {
67 |     const tasks: PromptsTask[] = [
68 |       createTask({ id: 1, status: 'pending', dependencies: [99] }),
69 |     ];
70 | 
71 |     expect(computeReadiness(tasks)).toHaveLength(0);
72 |   });
73 | 
74 |   test('excludes tasks with self dependencies', () => {
75 |     const tasks: PromptsTask[] = [
76 |       createTask({ id: 1, status: 'pending', dependencies: [1] }),
77 |       createTask({ id: 2, status: 'pending', dependencies: [2] }),
78 |     ];
79 | 
80 |     expect(computeReadiness(tasks)).toHaveLength(0);
81 |   });
82 | 
83 |   test('ignores tasks not in a ready status even if dependencies are satisfied', () => {
84 |     const tasks: PromptsTask[] = [
85 |       createTask({ id: 1, status: 'done' }),
86 |       createTask({ id: 2, status: 'blocked', dependencies: [1] }),
87 |       createTask({ id: 3, status: 'pending', dependencies: [1] }),
88 |     ];
89 | 
90 |     const ready = computeReadiness(tasks);
91 | 
92 |     expect(ready.map((task) => task.id)).toEqual([3]);
93 |   });
94 | });
```

test/state/graph/next.test.ts
```
1 | import { describe, expect, test } from '@jest/globals';
2 | 
3 | import { computeReadiness, next } from '../../../src/state/graph.ts';
4 | import type { PromptsTask } from '../../../src/types/prompts-task.ts';
5 | 
6 | const createTask = (overrides: Partial<PromptsTask> & { id: number }): PromptsTask => ({
7 |   id: overrides.id,
8 |   title: overrides.title ?? `Task ${overrides.id}`,
9 |   description: overrides.description ?? 'desc',
10 |   status: overrides.status ?? 'pending',
11 |   dependencies: overrides.dependencies ?? [],
12 |   priority: overrides.priority ?? 'medium',
13 |   details: overrides.details ?? '',
14 |   testStrategy: overrides.testStrategy ?? '',
15 |   subtasks: overrides.subtasks ?? [],
16 |   labels: overrides.labels,
17 |   metadata: overrides.metadata,
18 |   evidence: overrides.evidence,
19 |   artifacts: overrides.artifacts,
20 |   source_doc: overrides.source_doc,
21 |   lineage: overrides.lineage,
22 |   supersedes: overrides.supersedes,
23 |   superseded_by: overrides.superseded_by,
24 |   reason: overrides.reason,
25 | });
26 | 
27 | describe('next', () => {
28 |   test('returns null when no tasks are ready', () => {
29 |     const tasks: PromptsTask[] = [
30 |       createTask({ id: 1, status: 'pending', dependencies: [2] }),
31 |       createTask({ id: 2, status: 'in_progress' }),
32 |     ];
33 | 
34 |     expect(next(tasks)).toBeNull();
35 |   });
36 | 
37 |   test('selects the highest priority ready task', () => {
38 |     const tasks: PromptsTask[] = [
39 |       createTask({ id: 1, priority: 'medium' }),
40 |       createTask({ id: 2, priority: 'high' }),
41 |       createTask({ id: 3, priority: 'low' }),
42 |     ];
43 | 
44 |     expect(next(tasks)?.id).toBe(2);
45 |   });
46 | 
47 |   test('breaks ties using dependent counts', () => {
48 |     const tasks: PromptsTask[] = [
49 |       createTask({ id: 1, priority: 'medium' }),
50 |       createTask({ id: 2, priority: 'medium' }),
51 |       createTask({ id: 3, priority: 'medium', dependencies: [1] }),
52 |       createTask({ id: 4, status: 'done', priority: 'medium', dependencies: [] }),
53 |     ];
54 | 
55 |     // Task 1 has one dependent (task 3); task 2 has none.
56 |     expect(next(tasks)?.id).toBe(1);
57 |   });
58 | 
59 |   test('uses lowest id when priority and dependency counts match', () => {
60 |     const tasks: PromptsTask[] = [
61 |       createTask({ id: 1, priority: 'medium' }),
62 |       createTask({ id: 2, priority: 'medium' }),
63 |     ];
64 | 
65 |     expect(next(tasks)?.id).toBe(1);
66 |   });
67 | 
68 |   test('computeReadiness feeds next with ready tasks only', () => {
69 |     const tasks: PromptsTask[] = [
70 |       createTask({ id: 1, status: 'pending', dependencies: [3] }),
71 |       createTask({ id: 2, status: 'pending', dependencies: [] }),
72 |       createTask({ id: 3, status: 'in_progress', dependencies: [] }),
73 |     ];
74 | 
75 |     const ready = computeReadiness(tasks);
76 |     expect(ready.map((task) => task.id)).toEqual([2]);
77 |     expect(next(tasks)?.id).toBe(2);
78 |   });
79 | });
```

tests/fixtures/taskmaster/invalid-missing-fields.json
```
1 | {
2 |   "tasks": [
3 |     {
4 |       "id": 1,
5 |       "title": "Incomplete",
6 |       "description": "Missing required fields should fail validation.",
7 |       "status": "pending",
8 |       "dependencies": [],
9 |       "priority": "low",
10 |       "testStrategy": "",
11 |       "subtasks": []
12 |     }
13 |   ]
14 | }
```

tests/fixtures/taskmaster/legacy-tasks.json
```
1 | {
2 |   "tasks": [
3 |     {
4 |       "id": 1,
5 |       "title": "Legacy format task",
6 |       "description": "Supports historic Task Master layout.",
7 |       "status": "pending",
8 |       "dependencies": [],
9 |       "priority": "low",
10 |       "details": "Legacy support case",
11 |       "testStrategy": "Manual",
12 |       "subtasks": []
13 |     }
14 |   ]
15 | }
```

tests/fixtures/taskmaster/simple-tasks.json
```
1 | {
2 |   "master": {
3 |     "tasks": [
4 |       {
5 |         "id": 1,
6 |         "title": "Initial work",
7 |         "description": "First task in the backlog.",
8 |         "status": "pending",
9 |         "dependencies": [],
10 |         "priority": "medium",
11 |         "details": "",
12 |         "testStrategy": "",
13 |         "subtasks": []
14 |       },
15 |       {
16 |         "id": 2,
17 |         "title": "Follow-up",
18 |         "description": "Second task blocked until first completes.",
19 |         "status": "pending",
20 |         "dependencies": [1],
21 |         "priority": "low",
22 |         "details": "",
23 |         "testStrategy": "",
24 |         "subtasks": []
25 |       }
26 |     ]
27 |   }
28 | }
```

tests/fixtures/taskmaster/subtask-missing-status.json
```
1 | {
2 |   "master": {
3 |     "tasks": [
4 |       {
5 |         "id": 1,
6 |         "title": "Task without subtask status",
7 |         "description": "Demonstrates defaulting subtask status when omitted.",
8 |         "status": "pending",
9 |         "dependencies": [],
10 |         "priority": "medium",
11 |         "details": "",
12 |         "testStrategy": "",
13 |         "subtasks": [
14 |           {
15 |             "id": 1,
16 |             "title": "Review defaults"
17 |           }
18 |         ]
19 |       }
20 |     ]
21 |   }
22 | }
```

tests/fixtures/taskmaster/tagged-tasks.json
```
1 | {
2 |   "master": {
3 |     "tasks": [
4 |       {
5 |         "id": 1,
6 |         "title": "Normalize statuses",
7 |         "description": "Ensure aliases canonicalise as expected.",
8 |         "status": "todo",
9 |         "dependencies": [2],
10 |         "priority": "High",
11 |         "details": "Pending execution until dependencies clear.",
12 |         "testStrategy": "Unit tests cover alias mapping.",
13 |         "subtasks": [
14 |           {
15 |             "id": 1,
16 |             "title": "Alias handling",
17 |             "status": "in-progress",
18 |             "dependencies": ["2.1"]
19 |           }
20 |         ]
21 |       },
22 |       {
23 |         "id": 2,
24 |         "title": "Completed task",
25 |         "description": "Represents a finished workflow.",
26 |         "status": "deferred",
27 |         "dependencies": [],
28 |         "priority": "medium",
29 |         "details": "No further work required.",
30 |         "testStrategy": "None",
31 |         "subtasks": []
32 |       }
33 |     ]
34 |   }
35 | }
```
