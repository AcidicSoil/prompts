.markdownlint-cli2.jsonc
```
1 | {
2 |   // Ignore patterns for markdownlint-cli2
3 |   "ignores": ["node_modules/**", "dist/**", "build/**"],
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
19 |   "MD048": { "style": "backtick" }
20 | }
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
59 | ## Conflict resolution
60 | 
61 | - **Specificity rule:** If both target the same scope, the later item in the final order wins.
62 | - **Pack vs. extension:** No special case. Order controls outcome.
63 | - **Out-of-scope packs:** Do not affect behavior. They remain listed as informational.
64 | 
65 | ---
66 | 
67 | ## Tagging Syntax (context only)
68 | 
69 | **Context tag — `@{file}` (no behavior change)**
70 | 
71 | - Purpose: include files for retrieval only.
72 | - Syntax: `@{path/to/file.md}`. Globs allowed.
73 | - Report under `DocFetchReport.context_files[]`.
74 | 
75 | ---
76 | 
77 | ## Resolution and loading
78 | 
79 | 1. Baseline = AGENTS.md.
80 | 2. Load **approved behavior extensions** in final order.
81 | 3. Load **approved rule-packs** in final order. Packs with `alwaysApply: true` default to the end.
82 | 4. Apply later-wins on conflicts.
83 | 5. Record `DocFetchReport.status`.
84 | 
85 | ---
86 | 
87 | ## Validation
88 | 
89 | - Behavior extension: must be readable text.
90 | - Rule-pack: must have front matter with `description` (string), `globs` (string), `alwaysApply` (bool).
91 | - Invalid items are skipped and logged in `DocFetchReport.validation_errors[]`.
92 | 
93 | ---
94 | 
95 | ## Execution flow (docs integration)
96 | 
97 | - **Preflight must list:**
98 | 
99 |   - `DocFetchReport.context_files[]` from `@{...}`
100 |   - `DocFetchReport.approved_instructions[]`
101 |   - `DocFetchReport.approved_rule_packs[]`
102 | - Compose in this order:
103 | 
104 |   1. Baseline
105 |   2. Behavior extensions
106 |   3. Rule-packs
107 | - Proceed only when `DocFetchReport.status == "OK"`.
108 | 
109 | ---
110 | 
111 | ## Failure handling
112 | 
113 | - If any approved item cannot be loaded:
114 | 
115 |   - Do not finalize. Return a “Docs Missing” plan with missing paths and a fix.
116 | - If any context file fails:
117 | 
118 |   - Continue. Add to `DocFetchReport.gaps.context_missing[]`. Suggest a fix in the plan.
119 | 
120 | ---
121 | 
122 | ## DocFetchReport Addendum
123 | 
124 | When discovery/confirmation is used, add:
125 | 
126 | ```json
127 | {
128 |   "DocFetchReport": {
129 |     "approved_instructions": [
130 |       {"path": "instructions/prd_generator.md", "loaded": true, "order": 1},
131 |       {"path": "instructions/security/guardrails.md", "loaded": true, "order": 2}
132 |     ],
133 |     "context_files": [
134 |       {"path": "docs/changelog.md", "loaded": true}
135 |     ],
136 |     "memory_ops": [
137 |       {"tool": "memory", "op": "create_entities|create_relations|add_observations|read_graph|search_nodes", "time_utc": "<ISO8601>", "scope": "project:${PROJECT_TAG}"}
138 |     ],
139 |     "proposed_mcp_servers": [
140 |       {"name": "<lib> Docs", "url": "https://gitmcp.io/{OWNER}/{REPO}", "source": "techstack-bootstrap", "status": "proposed"}
141 |     ],
142 |     "owner_repo_resolution": [
143 |       {"library": "<lib>", "candidates": ["owner1/repo1", "owner2/repo2"], "selected": "owner/repo", "confidence": 0.92, "method": "registry|package_index|docs_link|search"}
144 |     ],
145 |     "server_inventory": [
146 |       {"name": "fastapi_docs", "url": "https://gitmcp.io/tiangolo/fastapi", "source": "project-local|user|generated", "writable": true}
147 |     ],
148 |     "server_diff": {
149 |       "missing": ["fastapi_docs", "httpx_docs"],
150 |       "extra": ["legacy_docs_server"]
151 |     },
152 |     "server_actions": [
153 |       {"action": "add", "name": "httpx_docs", "target": "project-local", "accepted": true}
154 |     ]
155 |   }
156 | }
157 | ```
158 | 
159 | > Note: Omit any fields related to generating or writing `config/mcp_servers.generated.toml`. Use a separate instruction file such as `instructions/mcp_servers_generated_concise.md` if present.
160 | 
161 | ---
162 | 
163 | ## A) Preflight: Latest Docs Requirement (**MUST**, Blocking)
164 | 
165 | **Goal:** Ensure the assistant retrieves and considers the *latest relevant docs* before planning, acting, or finalizing.
166 | 
167 | **Primary/Fallback Order (consolidated):**
168 | 
169 | 1. **contex7-mcp** (primary)
170 | 2. **gitmcp** (fallback)
171 | 
172 | **What to do:**
173 | 
174 | - For every task that could touch code, configuration, APIs, tooling, or libraries:
175 | 
176 |   - Call **contex7-mcp** to fetch the latest documentation or guides.
177 |   - If the **primary** call **fails**, retry with **gitmcp**.
178 | - Each successful call **MUST** capture:
179 | 
180 |   - Tool name, query/topic, retrieval timestamp (UTC), and source refs/URLs (or repo refs/commits).
181 | - Scope:
182 | 
183 |   - Fetch docs for each **area to be touched** (framework, library, CLI, infra, etc.).
184 |   - Prefer focused topics (e.g., "exception handlers", "lifespan", "retry policy", "schema").
185 | 
186 | **Failure handling:**
187 | 
188 | - If **all** providers fail for a required area, **do not finalize**. Return a minimal plan that includes:
189 | 
190 |   - The attempted providers and errors
191 |   - The specific topics/areas still uncovered
192 |   - A safe, read-only analysis and suggested next checks (or user confirmation).
193 | 
194 | **Proof-of-Work Artifact (required):**
195 | 
196 | - Produce and attach a `DocFetchReport` (JSON) with `status`, `tools_called[]`, `sources[]`, `coverage`, `key_guidance[]`, `gaps`, and `informed_changes[]`.
197 | 
198 | **Override Path (explicit, logged):**
199 | 
200 | Allowed only for outages/ambiguous scope/timeboxed spikes. Must include:
201 | 
202 | ```json
203 | {
204 |   "Override": {
205 |     "reason": "server_down|ambiguous_scope|timeboxed_spike",
206 |     "risk_mitigation": ["read-only analysis", "scoped PoC", "user confirmation required"],
207 |     "expires_after": "1 action or 30m",
208 |     "requested_by": "system|user"
209 |   }
210 | }
211 | ```
212 | 
213 | ---
214 | 
215 | ## A.1) Tech & Language Identification (Pre-Requirement)
216 | 
217 | - Before running Preflight (§A), the assistant must determine both:
218 | 
219 |   1. The **primary language(s)** used in the project (e.g., TypeScript, Python, Go, Rust, Java, Bash).
220 |   2. The **current project’s tech stack** (frameworks, libraries, infra, tools).
221 | 
222 | - Sources to infer language/stack:
223 | 
224 |   - Project tags (`${PROJECT_TAG}`), memory checkpoints, prior completion records.
225 |   - Files present in repo (e.g., manifests like `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`, CI configs).
226 |   - File extensions in repo (`.ts`, `.js`, `.py`, `.go`, `.rs`, `.java`, `.sh`, `.sql`, etc.).
227 |   - User/task context (explicit mentions of frameworks, CLIs, infra).
228 | 
229 | - **Repo mapping requirement:** Resolve the **canonical GitHub OWNER/REPO** for each detected library/tool whenever feasible.
230 | 
231 |   - **Resolution order:**
232 | 
233 |     1. **Registry mapping** (maintained lookup table for common libs).
234 |     2. **Package index metadata** (e.g., npm `repository.url`, PyPI `project_urls` → `Source`/`Homepage`).
235 |     3. **Official docs → GitHub link** discovery.
236 |     4. **Targeted search** (as a last resort) with guardrails below.
237 |   - **Guardrails:** Prefer official orgs; require name similarity and recent activity; avoid forks and mirrors unless explicitly chosen.
238 |   - Record outcomes in `DocFetchReport.owner_repo_resolution[]` with candidates, selected repo, method, and confidence score.
239 | 
240 | - Doc retrieval (§A) **must cover each identified language and stack element** that will be touched by the task.
241 | 
242 | - Record both in the `DocFetchReport`:
243 | 
244 | ```json
245 | "tech_stack": ["<stack1>", "<stack2>"],
246 | "languages": ["<lang1>", "<lang2>"]
247 | ```
248 | 
249 | ---
250 | 
251 | ## B) Decision Gate: No Finalize Without Proof (**MUST**)
252 | 
253 | - The assistant **MUST NOT**: finalize, apply diffs, modify files, or deliver a definitive answer **unless** `DocFetchReport.status == "OK"`.
254 | - The planner/executor must verify `ctx.docs_ready == true` (set when at least one successful docs call exists **per required area**).
255 | - If `status != OK` or `ctx.docs_ready != true`:
256 | 
257 |   - Stop. Return a **Docs Missing** message that lists the exact MCP calls and topics to run.
258 | 
259 | ---
260 | 
261 | ## 0) Debugging
262 | 
263 | - **Use consolidated docs-first flow** before touching any files or finalizing:
264 | 
265 |   - Try **contex7-mcp** → **gitmcp**.
266 |   - Record results in `DocFetchReport`.
267 | 
268 | ## 1) Startup memory bootstrap (memory)
269 | 
270 | - On chat/session start: initialize **memory**.
271 | 
272 | - Retrieve (project-scoped):
273 | 
274 |   - **memory** → latest `memory_checkpoints` and recent task completions.
275 |   - **memory** → ensure a graph namespace exists for this project and load prior nodes/edges.
276 | 
277 |     - **Server alias**: `memory` (e.g., Smithery "Memory Server" such as `@modelcontextprotocol/server-memory`).
278 |     - **Bootstrap ops** (idempotent):
279 | 
280 |       - `create_entities` (or `upsert_entities`) for: `project:${PROJECT_TAG}`.
281 |       - `create_relations` to link existing tasks/files if present.
282 |       - `read_graph` / `search_nodes` to hydrate working context.
283 | 
284 | - Read/write rules:
285 | 
286 |   - Prefer **memory** for free-form notes and checkpoints.
287 |   - Prefer **memory** for **structured** facts/relations (entities, edges, observations).
288 |   - If memory is unavailable, record `memory_unavailable: true` in the session preamble.
289 | 
290 | ### 1.0) Memory MCP Server Usage Contract (**NEW**)
291 | 
292 | - **Alias:** `memory`.
293 | - **Required tools:** `create_entities`, `create_relations`, `add_observations`, `delete_entities`, `delete_observations`, `delete_relations`, `read_graph`, `search_nodes`, `open_nodes`.
294 | - **Concept rules:**
295 | 
296 |   - **Entities** carry `name`, `entityType`, `observations[]`. Names are unique. Observations are atomic facts.
297 |   - **Relations** are directed and written in **active voice**: `{from, to, relationType}`.
298 |   - **Observations** are strings attached to entities; add/remove independently.
299 | - **Operational guarantees:**
300 | 
301 |   - Treat `create_*` as **idempotent upserts**. Skip duplicates silently.
302 |   - `delete_*` calls are **tolerant** to missing targets. No errors on non-existent items.
303 |   - `open_nodes` returns only requested entities and their inter-relations; silently skips misses.
304 | - **Usage patterns:**
305 | 
306 |   - On startup, ensure `project:${PROJECT_TAG}` exists; seed task and file nodes as needed.
307 |   - During execution, append observations for subtask starts/finishes; keep `percent_complete` on `task:${task_id}`.
308 |   - On completion, upsert entities and relations for `project`, `task`, and `file:<path>` per §2.
309 | - **Setup pointers (non-blocking):**
310 | 
311 |   - Storage file via `MEMORY_FILE_PATH` env; default `memory.json`.
312 |   - Configure server in **user** MCP config or workspace `.vscode/mcp.json`. Do not embed install steps here.
313 | - **Prompting note:**
314 | 
315 |   - If a separate chat-personalization prompt is used, it must not override gates (§A, §B) nor status flow (§3). Treat it as guidance for memory creation frequency and categories.
316 | 
317 | ### 1.1) Subtask plan and finish-in-one-go contract (**NEW**)
318 | 
319 | - **Before starting execution**, derive a **subtask plan** with clear **Definition of Done (DoD)** per subtask.
320 | - **Finish-in-one-go policy:** Once execution starts, work the subtask list to completion within the session unless a blocking gate occurs (§A, §B, or external dependency). If blocked, record the block and propose an unblock plan; do not leave partial work without a recorded reason.
321 | - **Recording:** Persist the subtask plan to **memory** under `task:${task_id}` as `observations.plan` with timestamps.
322 | 
323 | ### 1.2) Execution logging to memory (**NEW**)
324 | 
325 | - For each subtask: on **start** and **finish**, append an observation to `task:${task_id}` including `subtask_id`, `action`, `files_touched[]`, and short result.
326 | - Keep a running `percent_complete` on the task node. Update after each subtask.
327 | - Mirror links: `task:${task_id}` —\[touches]→ `file:<path>` as work proceeds, not only at the end.
328 | 
329 | ## 2) On task completion (status → done)
330 | 
331 | - Write a concise completion to memory including:
332 | 
333 |   - `task_id`, `title`, `status`, `next step`
334 |   - Files touched
335 |   - Commit/PR link (if applicable)
336 |   - Test results (if applicable)
337 | 
338 | - **Completion criteria (explicit):**
339 | 
340 |   - All subtasks from §1.1 are marked **done** and their DoD satisfied.
341 |   - Required gates passed (§A, §B).
342 |   - Post-completion checks executed or proposed (§2.1).
343 | 
344 | - **Update the Knowledge Graph (memory)**:
345 | 
346 |   - Ensure base entity `project:${PROJECT_TAG}` exists.
347 |   - Upsert `task:${task_id}` and any `file:<path>` entities touched.
348 |   - Create/refresh relations:
349 | 
350 |     - `project:${PROJECT_TAG}` —\[owns]→ `task:${task_id}`
351 |     - `task:${task_id}` —\[touches]→ `file:<path>`
352 |     - `task:${task_id}` —\[status]→ `<status>`
353 |     - Optional: `task:${task_id}` —\[depends\_on]→ `<entity>`
354 |   - Attach `observations` capturing key outcomes (e.g., perf metrics, regressions, decisions).
355 | 
356 | - **Documentation maintenance (auto)** — when a task **changes user-facing behavior**, **APIs**, **setup**, **CLI**, or **examples**:
357 | 
358 |   - **README.md** — keep **Install**, **Quickstart**, and **Usage/CLI** sections current. Add/adjust new flags, env vars, endpoints, and examples introduced by the task.
359 |   - **docs/CHANGELOG.md** — append an entry with **UTC date**, `task_id`, short summary, **breaking changes**, and **migration steps**. Create the file if missing.
360 |   - **docs/** pages — update or add topic pages. If present, refresh **`index.md`**/**`SUMMARY.md`**/**MkDocs/Sphinx nav** to include new pages (alphabetical within section unless a numbered order exists).
361 |   - **Build check** — run the project’s docs build if available (e.g., `npm run docs:build` | `mkdocs build` | `sphinx-build`). Record the result under `DocFetchReport.observations.docs_build`.
362 |   - **Sync scripts** — run `docs:sync`/`docs-sync` if defined; otherwise propose a TODO in the completion note.
363 |   - **Commit style** — use commit prefix `[docs] <scope>: <summary>` and link PR/issue.
364 |   - **Scope guard** — never edit `AGENTS.md` as part of docs maintenance.
365 | 
366 | - Seed/Update the knowledge graph **before** exiting the task so subsequent sessions can leverage it.
367 | 
368 | - Do **NOT** write to `AGENTS.md` beyond these standing instructions.
369 | 
370 | ### 2.1) Post-completion checks and tests (**REVISED — Run-then-verify**)
371 | 
372 | - **Order of operations:**
373 |   a) Append subtask completion logs to **memory** (§1.2).
374 |   b) Set task status to **`verify`** (new intermediate state).
375 |   c) Evaluate the **Safety Gate** per **§8 Environment & Testing Policy**.
376 |   d) If **safe**, run **stateless checks automatically** (see §8 Allowed Automatic Checks).
377 |   e) If **unsafe**, **defer** execution and emit a **Local Test Instructions** block for the user.
378 | 
379 | - **Recording:** Write outcomes to `task:${task_id}.observations.test_results` and also set:
380 | 
381 |   - `tests_deferred: true|false`
382 |   - `tests_deferred_reason: <string|null>`
383 |   - `test_log_path: artifacts/test/<UTC-timestamp>.log` when any checks are executed.
384 | 
385 | - **Status transitions:**
386 | 
387 |   - On all checks passing → set status **`done`**.
388 |   - On failures → set status **`blocked`** and record an unblock plan.
389 |   - On deferral → set status **`needs-local-tests`** and include the instructions block.
390 | 
391 | - **Local Test Instructions (example, Proposed — not executed):**
392 | 
393 | ```bash
394 | # Proposed Local Test Instructions — copy/paste locally
395 | # Reason: Safety Gate triggered deferral (e.g., venv detected, risk of global mutation, or OS mismatch)
396 | 
397 | # TypeScript/Node (stateless checks)
398 | npm run typecheck --silent || exit 1
399 | npm run lint --silent || exit 1
400 | npm run -s build --dry-run || exit 1
401 | 
402 | # Python (use uv; do NOT activate any existing venv)
403 | # Pure unit tests only; no network, no DB, no writes outside ./artifacts
404 | uv run -q python -c "import sys; sys.exit(0)" || exit 1
405 | uv run -q ruff check . || exit 1
406 | uv run -q pyright || exit 1
407 | uv run -q pytest -q tests/unit -k "not integration" || exit 1
408 | 
409 | # Expected: exit code 0 on success; non-zero indicates failures to review.
410 | ```
411 | 
412 | ---
413 | 
414 | ## 3) Status management (**REVISED**)
415 | 
416 | - Use Task Master MCP to set task status:
417 | 
418 |   - **`in-progress`** on start of execution after §A and §1.1 planning.
419 |   - **`verify`** automatically after memory updates and before tests (§2.1).
420 |   - **Auto-set `done`** when all subtasks are done, gates passed, and §2.1 checks succeed.
421 |   - **`needs-local-tests`** when §2.1 defers execution via the Safety Gate.
422 |   - **`blocked`** when a check fails or a gate prevents progress; include block reason and an unblock plan in memory.
423 | 
424 | - **Transition rules:**
425 |   `in-progress → verify → done` on success.
426 |   `verify → blocked` on check failure.
427 |   `verify → needs-local-tests` on deferral.
428 | 
429 | ---
430 | 
431 | ## 4) Tagging for retrieval
432 | 
433 | - Use tags: `${PROJECT_TAG}`, `project:${PROJECT_TAG}`, `memory_checkpoint`, `completion`, `agents`, `routine`, `instructions`, plus task-specific tags.
434 | - For memory entities/relations, mirror tags on observations (e.g., `graph`, `entity:task:${task_id}`, `file:<path>`), to ease cross-referencing with memory.
435 | 
436 | ---
437 | 
438 | ## 5) Handling user requests for code or docs
439 | 
440 | - When a task or a user requires **code**, **setup/config**, or **library/API documentation**:
441 | 
442 |   - **MUST** run the **Preflight** (§A) using the consolidated order (**contex7-mcp → gitmcp**).
443 |   - Only proceed to produce diffs or create files after `DocFetchReport.status == "OK"`.
444 | 
445 | ---
446 | 
447 | ## 6) Project tech stack specifics (generic)
448 | 
449 | - Apply §A Preflight for the **current** stack and language(s).
450 | - Prefer official documentation and repositories resolved in §A.1.
451 | - If coverage is weak after **contex7-mcp → gitmcp**, fall back to targeted web search and record gaps.
452 | 
453 | ---
454 | 
455 | ## 6.1) Layered Execution Guides (**NEW**)
456 | 
457 | Each layer defines role, task, context, reasoning, output format, and stop conditions. Use these blocks when planning and reviewing work in that layer.
458 | 
459 | ### Client/UI Layer — Frontend Engineer, UI Engineer, UX Designer
460 | 
461 | 1. **Role**
462 | 
463 |    - Own user-facing components and flows.
464 | 2. **Task**
465 | 
466 |    - Draft routes and components. Specify Tailwind classes and responsive breakpoints. Define accessibility and keyboard flows. List loading, empty, and error states. Map data needs to hooks. Set performance budgets.
467 | 3. **Context**
468 | 
469 |    - Next.js app router. Tailwind. shadcn/ui allowed. Target Core Web Vitals good. WCAG 2.2 AA.
470 | 4. **Reasoning**
471 | 
472 |    - Prefer server components for data. Client components only for interactivity. Avoid prop drilling. Use context only for shared UI state. Minimize re-renders. Defer non-critical JS.
473 | 5. **Output format**
474 | 
475 |    - Markdown table: Route | Component | Type (server|client) | States | Data source | Notes.
476 | 6. **Stop conditions**
477 | 
478 |    - Any route lacks explicit states. Missing keyboard flow. CLS or LCP budget undefined. Unmapped data dependency.
479 | 
480 | ### Build & Tooling Layer — Frontend Build Engineer, Tooling Engineer, DevOps Engineer
481 | 
482 | 1. **Role**
483 | 
484 |    - Maintain fast, reproducible builds and CI.
485 | 2. **Task**
486 | 
487 |    - Define bundler settings, lint, format, typecheck, unit test, and build steps. Configure CI matrix and caching. Enforce pre-commit hooks.
488 | 3. **Context**
489 | 
490 |    - Turbopack or Vite. ESLint. Prettier. Vitest. Node LTS.
491 | 4. **Reasoning**
492 | 
493 |    - Fail fast. Cache effectively. Keep steps isolated and deterministic. No network during tests unless mocked.
494 | 5. **Output format**
495 | 
496 |    - Checklist with commands, CI job matrix, cache keys, and expected durations.
497 | 6. **Stop conditions**
498 | 
499 |    - Non-deterministic builds. Unpinned tool versions. CI steps mutate global state. Missing cache strategy.
500 | 
501 | ### Language & Type Layer — Software Engineer, TypeScript/JavaScript Specialist
502 | 
503 | 1. **Role**
504 | 
505 |    - Enforce language rules and type safety.
506 | 2. **Task**
507 | 
508 |    - Set `tsconfig` targets. Define strict compiler flags. Establish type patterns and utilities. Require JSDoc where types are complex.
509 | 3. **Context**
510 | 
511 |    - TypeScript strict mode. ESM. Node and browser targets as needed.
512 | 4. **Reasoning**
513 | 
514 |    - Prefer explicit types. Use generics judiciously. Model nullability. Narrow unions at boundaries.
515 | 5. **Output format**
516 | 
517 |    - `tsconfig` fragment, lint rules list, and target type coverage goals by package.
518 | 6. **Stop conditions**
519 | 
520 |    - `any` or `unknown` leaks to public APIs. Implicit `any` enabled. Type coverage goals undefined.
521 | 
522 | ### State & Data Layer — Frontend Engineer, State Management Specialist, Full-Stack Engineer
523 | 
524 | 1. **Role**
525 | 
526 |    - Control state lifecycles and data fetching.
527 | 2. **Task**
528 | 
529 |    - Choose client vs server state. Define stores, selectors, and cache policy. Specify invalidation and suspense boundaries.
530 | 3. **Context**
531 | 
532 |    - React state, context, or a store. Fetch via RSC or client hooks. Cache with SWR or equivalent.
533 | 4. **Reasoning**
534 | 
535 |    - Server fetch by default. Co-locate state with consumers. Keep derived state computed. Normalize entities.
536 | 5. **Output format**
537 | 
538 |    - State inventory table: State | Scope | Source | Lifetime | Invalidation | Consumers.
539 | 6. **Stop conditions**
540 | 
541 |    - Duplicate sources of truth. Unbounded caches. Missing invalidation plan. Server-client mismatch.
542 | 
543 | ### API/Backend Layer — Backend Engineer, API Developer, Full-Stack Engineer
544 | 
545 | 1. **Role**
546 | 
547 |    - Provide stable contracts for data and actions.
548 | 2. **Task**
549 | 
550 |    - Define endpoints or schema. Specify auth, pagination, filtering, errors, and idempotency. Version contracts.
551 | 3. **Context**
552 | 
553 |    - REST or GraphQL. JSON. OpenAPI or SDL.
554 | 4. **Reasoning**
555 | 
556 |    - Design for evolution. Prefer standard status codes. Use cursor pagination. Return problem details.
557 | 5. **Output format**
558 | 
559 |    - OpenAPI snippet or GraphQL SDL. Error model table and example requests.
560 | 6. **Stop conditions**
561 | 
562 |    - Breaking change without versioning. Inconsistent pagination. Ambiguous error semantics. Missing auth notes.
563 | 
564 | ### Database & Persistence Layer — Database Engineer, Data Engineer, Backend Engineer
565 | 
566 | 1. **Role**
567 | 
568 |    - Safeguard data correctness and performance.
569 | 2. **Task**
570 | 
571 |    - Model schema. Choose indexes. Define migrations and retention. Set transaction boundaries.
572 | 3. **Context**
573 | 
574 |    - SQL or NoSQL. Managed service or local. Migration tool required.
575 | 4. **Reasoning**
576 | 
577 |    - Normalize until it hurts then denormalize where measured. Prefer declarative migrations. Use constraints.
578 | 5. **Output format**
579 | 
580 |    - Schema diagram or DDL. Migration plan with up and down steps. Index plan with rationale.
581 | 6. **Stop conditions**
582 | 
583 |    - Missing primary keys. Unsafe destructive migration. No rollback path. Unbounded growth.
584 | 
585 | ### Deployment & Hosting Layer — DevOps Engineer, Cloud Engineer, Platform Engineer
586 | 
587 | 1. **Role**
588 | 
589 |    - Ship safely and reversibly.
590 | 2. **Task**
591 | 
592 |    - Define environments, build artifacts, release gates, and rollout strategy. Set rollback procedures.
593 | 3. **Context**
594 | 
595 |    - IaC preferred. Blue/green or canary. Artifact registry. Secrets manager.
596 | 4. **Reasoning**
597 | 
598 |    - Immutable artifacts. Promote by provenance. Automate checks before traffic shift.
599 | 5. **Output format**
600 | 
601 |    - Release plan: envs, gates, rollout, rollback steps, and metrics to watch.
602 | 6. **Stop conditions**
603 | 
604 |    - Manual pet deployments. No rollback tested. Secrets in env without manager. Drift from IaC.
605 | 
606 | ### Observability & Ops Layer — Site Reliability Engineer, DevOps Engineer, Monitoring Specialist
607 | 
608 | 1. **Role**
609 | 
610 |    - Ensure reliability and rapid diagnosis.
611 | 2. **Task**
612 | 
613 |    - Define logs, metrics, traces, dashboards, SLOs, and alerts. Set runbooks.
614 | 3. **Context**
615 | 
616 |    - Centralized logging. Metrics store. Tracing. On-call rotation.
617 | 4. **Reasoning**
618 | 
619 |    - Measure user impact first. Alert on symptoms not causes. Keep noise low.
620 | 5. **Output format**
621 | 
622 |    - SLO doc. Alert rules list. Dashboard inventory with owners.
623 | 6. **Stop conditions**
624 | 
625 |    - No SLOs. Alerts without ownership. Missing runbooks. High alert noise.
626 | 
627 | ### Security & Auth Layer — Security Engineer, Identity and Access Management Engineer, DevOps with Security Focus
628 | 
629 | 1. **Role**
630 | 
631 |    - Protect assets and identities.
632 | 2. **Task**
633 | 
634 |    - Define authN and authZ flows. Manage secrets. Apply threat modeling and controls.
635 | 3. **Context**
636 | 
637 |    - OAuth or OIDC. Role based access. Secret store.
638 | 4. **Reasoning**
639 | 
640 |    - Least privilege. Rotate secrets. Validate all inputs. Log security events.
641 | 5. **Output format**
642 | 
643 |    - Auth flow diagram. Permission matrix. Threat model checklist.
644 | 6. **Stop conditions**
645 | 
646 |    - Hardcoded secrets. Missing MFA for admin. Broad tokens. Unvalidated input at boundaries.
647 | 
648 | ---
649 | 
650 | ## 7) Library docs retrieval (topic-focused)
651 | 
652 | - Use **contex7-mcp** first to fetch current docs before code changes.
653 | - UI components: call shadcn-ui-mcp-server to retrieve component recipes and scaffolds before writing code; then generate. Log under DocFetchReport.tools\_called\[].
654 | - If **contex7-mcp** fails, use **gitmcp** (repo docs/source) to retrieve equivalents.
655 | - Summarize key guidance inline in `DocFetchReport.key_guidance` and map each planned change to a guidance line.
656 | - Always note in the task preamble that docs were fetched and which topics/IDs were used.
657 | 
658 | ---
659 | 
660 | ## 8) Environment & Testing Policy (**REVISED: Safety Gate for automatic stateless checks**)
661 | 
662 | **Objective:** Allow **automatic stateless checks** post-completion when safe, while preventing environment drift or global mutations. Keep heavier or stateful tests **opt-in**.
663 | 
664 | **Safety Gate checklist (used by §2.1 step c):**
665 | 
666 | 1. **Execution scope** is read-only or hermetic.
667 | 2. **No environment activation** of existing shells or venvs.
668 | 3. **No network** access unless explicitly approved.
669 | 4. **No global writes** or package installs; all outputs limited to `./artifacts/`.
670 | 5. **Command review** shows only stateless operations.
671 | 
672 | **Allowed Automatic Checks (when Safety Gate passes):**
673 | 
674 | - Typecheck, lint, and format-check.
675 | - Build **dry-run** only.
676 | - Docs build if it does not write outside `./artifacts`.
677 | - Unit tests limited to **pure** functions with no I/O, no network, and no writes beyond `./artifacts`.
678 | 
679 | **Deferral conditions** (any true ⇒ **defer** and emit Local Test Instructions):
680 | 
681 | - Active Python venv detected (`VIRTUAL_ENV` set) or `.venv/` present in repo.
682 | - Managed envs or shims detected (e.g., `conda`, `poetry env`, Nix shells).
683 | - Commands imply global mutations, installs, migrations, DB writes, or network calls without explicit approval.
684 | - OS or shell mismatch risk in user context.
685 | 
686 | **Python rule:** If Python commands are needed and considered safe, use **`uv`** exclusively (`uv run`, `uvx`). **Do not** activate existing venvs.
687 | 
688 | **Pre-run Test Plan (required for any automatic run):**
689 | 
690 | - Exact commands, working directory, environment variables, and expected exit codes.
691 | - A short **Risk table** explaining why each command is safe under the Safety Gate.
692 | 
693 | **Execution protocol (automatic checks):**
694 | 
695 | - Run the approved commands exactly.
696 | - Capture stdout/stderr to `artifacts/test/<UTC-timestamp>.log`.
697 | - Do not modify other files.
698 | 
699 | **Post-run recording:**
700 | 
701 | - Add outcomes to the completion note and `DocFetchReport`.
702 | - Update `task:${task_id}.observations.test_results` and `test_log_path`.
703 | 
704 | **Deferral protocol:**
705 | 
706 | - Emit a **Local Test Instructions** block (see §2.1 example) with copy-paste commands, rationale, and expected exit codes.
707 | - Record `tests_deferred_reason` and set status to **`needs-local-tests`**.
708 | 
709 | ---
710 | 
711 | ### System-prompt scaffold (enforcement)
712 | 
713 | ```markdown
714 | SYSTEM: You operate under a blocking docs-first policy.
715 | 1) Preflight (§A):
716 |    - Call contex7-mcp → gitmcp as needed.
717 |    - Build DocFetchReport (status must be OK).
718 | 2) Planning:
719 |    - Map each planned change to key_guidance items in DocFetchReport.
720 |    - Build a subtask plan with DoD (§1.1) and record to memory.
721 | 3) Decision Gate (§B):
722 |    - If DocFetchReport.status != OK → STOP and return "Docs Missing" with exact MCP calls.
723 | 4) Execution:
724 |    - Proceed only if ctx.docs_ready == true.
725 |    - Log subtask progress to memory (§1.2). Finish-in-one-go unless blocked.
726 | 5) Completion:
727 |    - After memory updates, set status to **verify** and evaluate §8 Safety Gate.
728 |    - Run allowed automatic checks or defer with Local Test Instructions (§2.1, §8).
729 |    - Verify all subtasks done, then set status **done** on success; otherwise **blocked** or **needs-local-tests**.
730 |    - Attach DocFetchReport and write completion memory (§2).
731 | ```
732 | 
733 | ---
734 | 
735 | ## Prompt Registry & Precedence
736 | 
737 | - **Baseline:** AGENTS.md is always authoritative. Prompts in `~/.codex/prompts` are available but inert until manually invoked.
738 | - **Engagement:** Prompts run only when the user explicitly types the slash command or pastes the body. The assistant must not auto-run them.
739 | - **Precedence:** Behavior extensions and rule-packs follow later-wins. Prompts never override baseline unless pasted inline.
740 | - **Recording:** When invoked, the assistant must echo which prompt was used and log it in `DocFetchReport.approved_instructions[]` as `{source: "~/.codex/prompts", command: "/<name>"}`.
741 | 
742 | ---
743 | 
744 | ## Prompt Discovery & Namespacing
745 | 
746 | - **Discovery:** `/foo` resolves to `~/.codex/prompts/foo.md`. No auto-run.
747 | - **Reserved namespace:** `/vibe-*` for YC-style playbooks and planning flows.
748 | - **Default shortlist:** Recommended safe manual commands:
749 | 
750 |   - `/planning-process`, `/scope-control`, `/integration-test`, `/regression-guard`, `/review`, `/release-notes`, `/reset-strategy`, `/compare-outputs`.
751 |   - Newly available and supported: `/scaffold-fullstack`, `/api-contract`, `/openapi-generate`, `/db-bootstrap`, `/migration-plan`, `/auth-scaffold`, `/e2e-runner-setup`, `/env-setup`, `/secrets-manager-setup`, `/iac-bootstrap`, `/monitoring-setup`, `/slo-setup`, `/feature-flags`.
752 | 
753 | ---
754 | 
755 | ## Prompt→Gate Router
756 | 
757 | -
758 | - **Scope Gate:** `/scope-control`, `/plan`, `/planning-process`
759 | - **Test Gate:** `/integration-test`, `/regression-guard`, `/coverage-guide`
760 | - **Review Gate:** `/review`, `/review-branch`, `/pr-desc`, `/owners`
761 | - **Release Gate:** `/release-notes`, `/version-proposal`
762 | - **Reset path:** `/reset-strategy`
763 | - **Model tactics:** `/compare-outputs`, `/switch-model`, `/model-strengths`
764 | 
765 | ---
766 | 
767 | ## Prompt Safety & Proof Hooks
768 | 
769 | -
770 | - Prompts cannot bypass Preflight (§A) or Decision Gate (§B).
771 | - If a prompt suggests stateful changes, require Safety Gate review first.
772 | - Before acting on prompt output, confirm `DocFetchReport.status == "OK"`.
773 | - Append invoked prompts to `DocFetchReport.tools_called[]` as `{tool: "prompt", name: "/<cmd>", path: "~/.codex/prompts/<file>.md", time_utc}`.
774 | 
775 | ---
776 | 
777 | ## Prompt Non-Goals
778 | 
779 | -
780 | - No auto-invocation of prompts.
781 | - Prompts must not redefine baseline gates, safety policies, or precedence.
782 | - If a command is unrecognized, check `~/.codex/prompts/<name>.md` and restart Codex if missing.
783 | 
784 | ---
785 | 
786 | ## Install & Availability Note
787 | 
788 | -
789 | - Place your prompt catalog at `~/.codex/prompts` so slash commands like `/foo` resolve to `~/.codex/prompts/foo.md`.
790 | - Restart your Codex client if new prompts are not discovered. Hot‑reload is not guaranteed.
791 | - File naming must match the command exactly, use `.md` extension, and avoid hidden files or directories prefixed with `_`.
792 | - On Windows + WSL2, store prompts in the Linux home directory and, if needed, symlink from Windows paths to keep a single source of truth.
793 | 
794 | ---
795 | 
796 | ## Gemini→Codex Mapper (optional)
797 | 
798 | If you maintain mapper templates, you may expose a manual command like `/gemini-map <template>` that maps Gemini‑style request blocks into Codex‑style tasks. Group mapper templates under Architecture, Debug, Review, and Quality. Treat all mapper runs as manual accelerators that never bypass gates (§A, §B).
799 | 
800 | ---
801 | 
802 | ## Troubleshooting
803 | 
804 | -
805 | - **Slash not recognized:** Verify `~/.codex/prompts/<name>.md` exists and the filename matches the command. Restart the client.
806 | - **Prompt not applied:** Prompts are inert until manually invoked. Ensure you typed the slash command or pasted the prompt body.
807 | - **Discovery issues:** Avoid directories starting with `_` or filenames containing `.archive.` which are ignored by design.
808 | 
809 | ---
810 | 
811 | ## Version Pinning (optional)
812 | 
813 | For reproducibility, pin the prompt catalog to a specific commit SHA. Record the SHA in project docs or a local dotfile so teams share the same prompt semantics across runs.
814 | 
815 | ---
816 | 
817 | ## Workflow Expansion Example
818 | 
819 | To demonstrate prompts in practice, a full-stack app workflow includes:
820 | 
821 | 1. **Preflight Docs** → ensure latest docs. Block if `status != OK`.
822 | 2. **Planning** → `/planning-process`, `/scope-control`, `/stack-evaluation`.
823 | 3. **Scaffold** → `/scaffold-fullstack`, `/api-contract`, `/openapi-generate`.
824 | 4. **Data/Auth** → `/db-bootstrap`, `/migration-plan`, `/auth-scaffold`.
825 | 5. **Frontend** → `/modular-architecture`, `/ui-screenshots`, `/design-assets`.
826 | 6. **Testing** → `/e2e-runner-setup`, `/integration-test`, `/coverage-guide`, `/regression-guard`.
827 | 7. **CI/CD** → `/version-control-guide`, `/devops-automation`, `/env-setup`, `/secrets-manager-setup`, `/iac-bootstrap`.
828 | 8. **Release** → `/owners`, `/review`, `/review-branch`, `/pr-desc`, `/release-notes`, `/version-proposal`.
829 | 9. **Ops** → `/monitoring-setup`, `/slo-setup`, `/logging-strategy`, `/audit`.
830 | 10. **Post-release** → `/error-analysis`, `/fix`, `/refactor-suggestions`, `/file-modularity`, `/dead-code-scan`, `/cleanup-branches`, `/feature-flags`.
831 | 11. **Model tactics** → `/model-strengths`, `/model-evaluation`, `/compare-outputs`, `/switch-model`.
832 | 
833 | **Prompt catalog status:** All prompts referenced in this workflow are present in `~/.codex/prompts` and can be invoked as shown. To verify, run a discovery pass and confirm the resolver paths match the command names.
834 | 
835 | - Discovery check: ensure files exist at `~/.codex/prompts/<name>.md` for every command listed above.
836 | - If any command is not recognized, restart the client and re-check filename casing and extension.
837 | 
838 | ---
839 | 
840 | *End of file.*
```

GEMINI.md
```
1 | ## Instruction Loading Model (Extended)
2 | 
3 | - **Baseline:** This file (GEMINI.md) is the canonical baseline.
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
59 | ## Conflict resolution
60 | 
61 | - **Specificity rule:** If both target the same scope, the later item in the final order wins.
62 | - **Pack vs. extension:** No special case. Order controls outcome.
63 | - **Out-of-scope packs:** Do not affect behavior. They remain listed as informational.
64 | 
65 | ---
66 | 
67 | ## Tagging Syntax (context only)
68 | 
69 | **Context tag — `@{file}` (no behavior change)**
70 | 
71 | - Purpose: include files for retrieval only.
72 | - Syntax: `@{path/to/file.md}`. Globs allowed.
73 | - Report under `DocFetchReport.context_files[]`.
74 | 
75 | ---
76 | 
77 | ## Resolution and loading
78 | 
79 | 1. Baseline = GEMINI.md.
80 | 2. Load **approved behavior extensions** in final order.
81 | 3. Load **approved rule-packs** in final order. Packs with `alwaysApply: true` default to the end.
82 | 4. Apply later-wins on conflicts.
83 | 5. Record `DocFetchReport.status`.
84 | 
85 | ---
86 | 
87 | ## Validation
88 | 
89 | - Behavior extension: must be readable text.
90 | - Rule-pack: must have front matter with `description` (string), `globs` (string), `alwaysApply` (bool).
91 | - Invalid items are skipped and logged in `DocFetchReport.validation_errors[]`.
92 | 
93 | ---
94 | 
95 | ## Execution flow (docs integration)
96 | 
97 | - **Preflight must list:**
98 | 
99 |   - `DocFetchReport.context_files[]` from `@{...}`
100 |   - `DocFetchReport.approved_instructions[]`
101 |   - `DocFetchReport.approved_rule_packs[]`
102 | - Compose in this order:
103 | 
104 |   1. Baseline
105 |   2. Behavior extensions
106 |   3. Rule-packs
107 | - Proceed only when `DocFetchReport.status == "OK"`.
108 | 
109 | ---
110 | 
111 | ## Failure handling
112 | 
113 | - If any approved item cannot be loaded:
114 | 
115 |   - Do not finalize. Return a “Docs Missing” plan with missing paths and a fix.
116 | - If any context file fails:
117 | 
118 |   - Continue. Add to `DocFetchReport.gaps.context_missing[]`. Suggest a fix in the plan.
119 | 
120 | ---
121 | 
122 | ## DocFetchReport Addendum
123 | 
124 | When discovery/confirmation is used, add:
125 | 
126 | ```json
127 | {
128 |   "DocFetchReport": {
129 |     "approved_instructions": [
130 |       {"path": "instructions/prd_generator.md", "loaded": true, "order": 1},
131 |       {"path": "instructions/security/guardrails.md", "loaded": true, "order": 2}
132 |     ],
133 |     "context_files": [
134 |       {"path": "docs/changelog.md", "loaded": true}
135 |     ],
136 |     "memory_ops": [
137 |       {"tool": "memory", "op": "create_entities|create_relations|add_observations|read_graph|search_nodes", "time_utc": "<ISO8601>", "scope": "project:${PROJECT_TAG}"}
138 |     ],
139 |     "proposed_mcp_servers": [
140 |       {"name": "<lib> Docs", "url": "https://gitmcp.io/{OWNER}/{REPO}", "source": "techstack-bootstrap", "status": "proposed"}
141 |     ],
142 |     "owner_repo_resolution": [
143 |       {"library": "<lib>", "candidates": ["owner1/repo1", "owner2/repo2"], "selected": "owner/repo", "confidence": 0.92, "method": "registry|package_index|docs_link|search"}
144 |     ],
145 |     "server_inventory": [
146 |       {"name": "fastapi_docs", "url": "https://gitmcp.io/tiangolo/fastapi", "source": "project-local|user|generated", "writable": true}
147 |     ],
148 |     "server_diff": {
149 |       "missing": ["fastapi_docs", "httpx_docs"],
150 |       "extra": ["legacy_docs_server"]
151 |     },
152 |     "server_actions": [
153 |       {"action": "add", "name": "httpx_docs", "target": "project-local", "accepted": true}
154 |     ]
155 |   }
156 | }
157 | ```
158 | 
159 | > Note: Omit any fields related to generating or writing `config/mcp_servers.generated.toml`. Use a separate instruction file such as `instructions/mcp_servers_generated_concise.md` if present.
160 | 
161 | ---
162 | 
163 | ## A) Preflight: Latest Docs Requirement (**MUST**, Blocking)
164 | 
165 | **Goal:** Ensure the assistant retrieves and considers the *latest relevant docs* before planning, acting, or finalizing.
166 | 
167 | **Primary/Fallback Order (consolidated):**
168 | 
169 | 1. **contex7-mcp** (primary)
170 | 2. **gitmcp** (fallback)
171 | 
172 | **What to do:**
173 | 
174 | - For every task that could touch code, configuration, APIs, tooling, or libraries:
175 | 
176 |   - Call **contex7-mcp** to fetch the latest documentation or guides.
177 |   - If the **primary** call **fails**, retry with **gitmcp**.
178 | - Each successful call **MUST** capture:
179 | 
180 |   - Tool name, query/topic, retrieval timestamp (UTC), and source refs/URLs (or repo refs/commits).
181 | - Scope:
182 | 
183 |   - Fetch docs for each **area to be touched** (framework, library, CLI, infra, etc.).
184 |   - Prefer focused topics (e.g., "exception handlers", "lifespan", "retry policy", "schema").
185 | 
186 | **Failure handling:**
187 | 
188 | - If **all** providers fail for a required area, **do not finalize**. Return a minimal plan that includes:
189 | 
190 |   - The attempted providers and errors
191 |   - The specific topics/areas still uncovered
192 |   - A safe, read-only analysis and suggested next checks (or user confirmation).
193 | 
194 | **Proof-of-Work Artifact (required):**
195 | 
196 | - Produce and attach a `DocFetchReport` (JSON) with `status`, `tools_called[]`, `sources[]`, `coverage`, `key_guidance[]`, `gaps`, and `informed_changes[]`.
197 | 
198 | **Override Path (explicit, logged):**
199 | 
200 | Allowed only for outages/ambiguous scope/timeboxed spikes. Must include:
201 | 
202 | ```json
203 | {
204 |   "Override": {
205 |     "reason": "server_down|ambiguous_scope|timeboxed_spike",
206 |     "risk_mitigation": ["read-only analysis", "scoped PoC", "user confirmation required"],
207 |     "expires_after": "1 action or 30m",
208 |     "requested_by": "system|user"
209 |   }
210 | }
211 | ```
212 | 
213 | ---
214 | 
215 | ## A.1) Tech & Language Identification (Pre-Requirement)
216 | 
217 | - Before running Preflight (§A), the assistant must determine both:
218 | 
219 |   1. The **primary language(s)** used in the project (e.g., TypeScript, Python, Go, Rust, Java, Bash).
220 |   2. The **current project’s tech stack** (frameworks, libraries, infra, tools).
221 | 
222 | - Sources to infer language/stack:
223 | 
224 |   - Project tags (`${PROJECT_TAG}`), memory checkpoints, prior completion records.
225 |   - Files present in repo (e.g., manifests like `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`, CI configs).
226 |   - File extensions in repo (`.ts`, `.js`, `.py`, `.go`, `.rs`, `.java`, `.sh`, `.sql`, etc.).
227 |   - User/task context (explicit mentions of frameworks, CLIs, infra).
228 | 
229 | - **Repo mapping requirement:** Resolve the **canonical GitHub OWNER/REPO** for each detected library/tool whenever feasible.
230 | 
231 |   - **Resolution order:**
232 | 
233 |     1. **Registry mapping** (maintained lookup table for common libs).
234 |     2. **Package index metadata** (e.g., npm `repository.url`, PyPI `project_urls` → `Source`/`Homepage`).
235 |     3. **Official docs → GitHub link** discovery.
236 |     4. **Targeted search** (as a last resort) with guardrails below.
237 |   - **Guardrails:** Prefer official orgs; require name similarity and recent activity; avoid forks and mirrors unless explicitly chosen.
238 |   - Record outcomes in `DocFetchReport.owner_repo_resolution[]` with candidates, selected repo, method, and confidence score.
239 | 
240 | - Doc retrieval (§A) **must cover each identified language and stack element** that will be touched by the task.
241 | 
242 | - Record both in the `DocFetchReport`:
243 | 
244 | ```json
245 | "tech_stack": ["<stack1>", "<stack2>"],
246 | "languages": ["<lang1>", "<lang2>"]
247 | ```
248 | 
249 | ---
250 | 
251 | ## B) Decision Gate: No Finalize Without Proof (**MUST**)
252 | 
253 | - The assistant **MUST NOT**: finalize, apply diffs, modify files, or deliver a definitive answer **unless** `DocFetchReport.status == "OK"`.
254 | - The planner/executor must verify `ctx.docs_ready == true` (set when at least one successful docs call exists **per required area**).
255 | - If `status != OK` or `ctx.docs_ready != true`:
256 | 
257 |   - Stop. Return a **Docs Missing** message that lists the exact MCP calls and topics to run.
258 | 
259 | ---
260 | 
261 | ## 0) Debugging
262 | 
263 | - **Use consolidated docs-first flow** before touching any files or finalizing:
264 | 
265 |   - Try **contex7-mcp** → **gitmcp**.
266 |   - Record results in `DocFetchReport`.
267 | 
268 | ## 1) Startup memory bootstrap (memory)
269 | 
270 | - On chat/session start: initialize **memory**.
271 | 
272 | - Retrieve (project-scoped):
273 | 
274 |   - **memory** → latest `memory_checkpoints` and recent task completions.
275 |   - **memory** → ensure a graph namespace exists for this project and load prior nodes/edges.
276 | 
277 |     - **Server alias**: `memory` (e.g., Smithery "Memory Server" such as `@modelcontextprotocol/server-memory`).
278 |     - **Bootstrap ops** (idempotent):
279 | 
280 |       - `create_entities` (or `upsert_entities`) for: `project:${PROJECT_TAG}`.
281 |       - `create_relations` to link existing tasks/files if present.
282 |       - `read_graph` / `search_nodes` to hydrate working context.
283 | 
284 | - Read/write rules:
285 | 
286 |   - Prefer **memory** for free-form notes and checkpoints.
287 |   - Prefer **memory** for **structured** facts/relations (entities, edges, observations).
288 |   - If memory is unavailable, record `memory_unavailable: true` in the session preamble.
289 | 
290 | ### 1.0) Memory MCP Server Usage Contract (**NEW**)
291 | 
292 | - **Alias:** `memory`.
293 | - **Required tools:** `create_entities`, `create_relations`, `add_observations`, `delete_entities`, `delete_observations`, `delete_relations`, `read_graph`, `search_nodes`, `open_nodes`.
294 | - **Concept rules:**
295 | 
296 |   - **Entities** carry `name`, `entityType`, `observations[]`. Names are unique. Observations are atomic facts.
297 |   - **Relations** are directed and written in **active voice**: `{from, to, relationType}`.
298 |   - **Observations** are strings attached to entities; add/remove independently.
299 | - **Operational guarantees:**
300 | 
301 |   - Treat `create_*` as **idempotent upserts**. Skip duplicates silently.
302 |   - `delete_*` calls are **tolerant** to missing targets. No errors on non-existent items.
303 |   - `open_nodes` returns only requested entities and their inter-relations; silently skips misses.
304 | - **Usage patterns:**
305 | 
306 |   - On startup, ensure `project:${PROJECT_TAG}` exists; seed task and file nodes as needed.
307 |   - During execution, append observations for subtask starts/finishes; keep `percent_complete` on `task:${task_id}`.
308 |   - On completion, upsert entities and relations for `project`, `task`, and `file:<path>` per §2.
309 | - **Setup pointers (non-blocking):**
310 | 
311 |   - Storage file via `MEMORY_FILE_PATH` env; default `memory.json`.
312 |   - Configure server in **user** MCP config or workspace `.vscode/mcp.json`. Do not embed install steps here.
313 | - **Prompting note:**
314 | 
315 |   - If a separate chat-personalization prompt is used, it must not override gates (§A, §B) nor status flow (§3). Treat it as guidance for memory creation frequency and categories.
316 | 
317 | ### 1.1) Subtask plan and finish-in-one-go contract (**NEW**)
318 | 
319 | - **Before starting execution**, derive a **subtask plan** with clear **Definition of Done (DoD)** per subtask.
320 | - **Finish-in-one-go policy:** Once execution starts, work the subtask list to completion within the session unless a blocking gate occurs (§A, §B, or external dependency). If blocked, record the block and propose an unblock plan; do not leave partial work without a recorded reason.
321 | - **Recording:** Persist the subtask plan to **memory** under `task:${task_id}` as `observations.plan` with timestamps.
322 | 
323 | ### 1.2) Execution logging to memory (**NEW**)
324 | 
325 | - For each subtask: on **start** and **finish**, append an observation to `task:${task_id}` including `subtask_id`, `action`, `files_touched[]`, and short result.
326 | - Keep a running `percent_complete` on the task node. Update after each subtask.
327 | - Mirror links: `task:${task_id}` —\[touches]→ `file:<path>` as work proceeds, not only at the end.
328 | 
329 | ## 2) On task completion (status → done)
330 | 
331 | - Write a concise completion to memory including:
332 | 
333 |   - `task_id`, `title`, `status`, `next step`
334 |   - Files touched
335 |   - Commit/PR link (if applicable)
336 |   - Test results (if applicable)
337 | 
338 | - **Completion criteria (explicit):**
339 | 
340 |   - All subtasks from §1.1 are marked **done** and their DoD satisfied.
341 |   - Required gates passed (§A, §B).
342 |   - Post-completion checks executed or proposed (§2.1).
343 | 
344 | - **Update the Knowledge Graph (memory)**:
345 | 
346 |   - Ensure base entity `project:${PROJECT_TAG}` exists.
347 |   - Upsert `task:${task_id}` and any `file:<path>` entities touched.
348 |   - Create/refresh relations:
349 | 
350 |     - `project:${PROJECT_TAG}` —\[owns]→ `task:${task_id}`
351 |     - `task:${task_id}` —\[touches]→ `file:<path>`
352 |     - `task:${task_id}` —\[status]→ `<status>`
353 |     - Optional: `task:${task_id}` —\[depends\_on]→ `<entity>`
354 |   - Attach `observations` capturing key outcomes (e.g., perf metrics, regressions, decisions).
355 | 
356 | - **Documentation maintenance (auto)** — when a task **changes user-facing behavior**, **APIs**, **setup**, **CLI**, or **examples**:
357 | 
358 |   - **README.md** — keep **Install**, **Quickstart**, and **Usage/CLI** sections current. Add/adjust new flags, env vars, endpoints, and examples introduced by the task.
359 |   - **docs/CHANGELOG.md** — append an entry with **UTC date**, `task_id`, short summary, **breaking changes**, and **migration steps**. Create the file if missing.
360 |   - **docs/** pages — update or add topic pages. If present, refresh **`index.md`**/**`SUMMARY.md`**/**MkDocs/Sphinx nav** to include new pages (alphabetical within section unless a numbered order exists).
361 |   - **Build check** — run the project’s docs build if available (e.g., `npm run docs:build` | `mkdocs build` | `sphinx-build`). Record the result under `DocFetchReport.observations.docs_build`.
362 |   - **Sync scripts** — run `docs:sync`/`docs-sync` if defined; otherwise propose a TODO in the completion note.
363 |   - **Commit style** — use commit prefix `[docs] <scope>: <summary>` and link PR/issue.
364 |   - **Scope guard** — never edit GEMINI.md as part of docs maintenance.
365 | 
366 | - Seed/Update the knowledge graph **before** exiting the task so subsequent sessions can leverage it.
367 | 
368 | - Do **NOT** write to GEMINI.md beyond these standing instructions.
369 | 
370 | ### 2.1) Post-completion checks and tests (**REVISED — Run-then-verify**)
371 | 
372 | - **Order of operations:**
373 |   a) Append subtask completion logs to **memory** (§1.2).
374 |   b) Set task status to **`verify`** (new intermediate state).
375 |   c) Evaluate the **Safety Gate** per **§8 Environment & Testing Policy**.
376 |   d) If **safe**, run **stateless checks automatically** (see §8 Allowed Automatic Checks).
377 |   e) If **unsafe**, **defer** execution and emit a **Local Test Instructions** block for the user.
378 | 
379 | - **Recording:** Write outcomes to `task:${task_id}.observations.test_results` and also set:
380 | 
381 |   - `tests_deferred: true|false`
382 |   - `tests_deferred_reason: <string|null>`
383 |   - `test_log_path: artifacts/test/<UTC-timestamp>.log` when any checks are executed.
384 | 
385 | - **Status transitions:**
386 | 
387 |   - On all checks passing → set status **`done`**.
388 |   - On failures → set status **`blocked`** and record an unblock plan.
389 |   - On deferral → set status **`needs-local-tests`** and include the instructions block.
390 | 
391 | - **Local Test Instructions (example, Proposed — not executed):**
392 | 
393 | ```bash
394 | # Proposed Local Test Instructions — copy/paste locally
395 | # Reason: Safety Gate triggered deferral (e.g., venv detected, risk of global mutation, or OS mismatch)
396 | 
397 | # TypeScript/Node (stateless checks)
398 | npm run typecheck --silent || exit 1
399 | npm run lint --silent || exit 1
400 | npm run -s build --dry-run || exit 1
401 | 
402 | # Python (use uv; do NOT activate any existing venv)
403 | # Pure unit tests only; no network, no DB, no writes outside ./artifacts
404 | uv run -q python -c "import sys; sys.exit(0)" || exit 1
405 | uv run -q ruff check . || exit 1
406 | uv run -q pyright || exit 1
407 | uv run -q pytest -q tests/unit -k "not integration" || exit 1
408 | 
409 | # Expected: exit code 0 on success; non-zero indicates failures to review.
410 | ```
411 | 
412 | ---
413 | 
414 | ## 3) Status management (**REVISED**)
415 | 
416 | - Use Task Master MCP to set task status:
417 | 
418 |   - **`in-progress`** on start of execution after §A and §1.1 planning.
419 |   - **`verify`** automatically after memory updates and before tests (§2.1).
420 |   - **Auto-set `done`** when all subtasks are done, gates passed, and §2.1 checks succeed.
421 |   - **`needs-local-tests`** when §2.1 defers execution via the Safety Gate.
422 |   - **`blocked`** when a check fails or a gate prevents progress; include block reason and an unblock plan in memory.
423 | 
424 | - **Transition rules:**
425 |   `in-progress → verify → done` on success.
426 |   `verify → blocked` on check failure.
427 |   `verify → needs-local-tests` on deferral.
428 | 
429 | ---
430 | 
431 | ## 4) Tagging for retrieval
432 | 
433 | - Use tags: `${PROJECT_TAG}`, `project:${PROJECT_TAG}`, `memory_checkpoint`, `completion`, `agents`, `routine`, `instructions`, plus task-specific tags.
434 | - For memory entities/relations, mirror tags on observations (e.g., `graph`, `entity:task:${task_id}`, `file:<path>`), to ease cross-referencing with memory.
435 | 
436 | ---
437 | 
438 | ## 5) Handling user requests for code or docs
439 | 
440 | - When a task or a user requires **code**, **setup/config**, or **library/API documentation**:
441 | 
442 |   - **MUST** run the **Preflight** (§A) using the consolidated order (**contex7-mcp → gitmcp**).
443 |   - Only proceed to produce diffs or create files after `DocFetchReport.status == "OK"`.
444 | 
445 | ---
446 | 
447 | ## 6) Project tech stack specifics (generic)
448 | 
449 | - Apply §A Preflight for the **current** stack and language(s).
450 | - Prefer official documentation and repositories resolved in §A.1.
451 | - If coverage is weak after **contex7-mcp → gitmcp**, fall back to targeted web search and record gaps.
452 | 
453 | ---
454 | 
455 | ## 6.1) Layered Execution Guides (**NEW**)
456 | 
457 | Each layer defines role, task, context, reasoning, output format, and stop conditions. Use these blocks when planning and reviewing work in that layer.
458 | 
459 | ### Client/UI Layer — Frontend Engineer, UI Engineer, UX Designer
460 | 
461 | 1. **Role**
462 | 
463 |    - Own user-facing components and flows.
464 | 2. **Task**
465 | 
466 |    - Draft routes and components. Specify Tailwind classes and responsive breakpoints. Define accessibility and keyboard flows. List loading, empty, and error states. Map data needs to hooks. Set performance budgets.
467 | 3. **Context**
468 | 
469 |    - Next.js app router. Tailwind. shadcn/ui allowed. Target Core Web Vitals good. WCAG 2.2 AA.
470 | 4. **Reasoning**
471 | 
472 |    - Prefer server components for data. Client components only for interactivity. Avoid prop drilling. Use context only for shared UI state. Minimize re-renders. Defer non-critical JS.
473 | 5. **Output format**
474 | 
475 |    - Markdown table: Route | Component | Type (server|client) | States | Data source | Notes.
476 | 6. **Stop conditions**
477 | 
478 |    - Any route lacks explicit states. Missing keyboard flow. CLS or LCP budget undefined. Unmapped data dependency.
479 | 
480 | ### Build & Tooling Layer — Frontend Build Engineer, Tooling Engineer, DevOps Engineer
481 | 
482 | 1. **Role**
483 | 
484 |    - Maintain fast, reproducible builds and CI.
485 | 2. **Task**
486 | 
487 |    - Define bundler settings, lint, format, typecheck, unit test, and build steps. Configure CI matrix and caching. Enforce pre-commit hooks.
488 | 3. **Context**
489 | 
490 |    - Turbopack or Vite. ESLint. Prettier. Vitest. Node LTS.
491 | 4. **Reasoning**
492 | 
493 |    - Fail fast. Cache effectively. Keep steps isolated and deterministic. No network during tests unless mocked.
494 | 5. **Output format**
495 | 
496 |    - Checklist with commands, CI job matrix, cache keys, and expected durations.
497 | 6. **Stop conditions**
498 | 
499 |    - Non-deterministic builds. Unpinned tool versions. CI steps mutate global state. Missing cache strategy.
500 | 
501 | ### Language & Type Layer — Software Engineer, TypeScript/JavaScript Specialist
502 | 
503 | 1. **Role**
504 | 
505 |    - Enforce language rules and type safety.
506 | 2. **Task**
507 | 
508 |    - Set `tsconfig` targets. Define strict compiler flags. Establish type patterns and utilities. Require JSDoc where types are complex.
509 | 3. **Context**
510 | 
511 |    - TypeScript strict mode. ESM. Node and browser targets as needed.
512 | 4. **Reasoning**
513 | 
514 |    - Prefer explicit types. Use generics judiciously. Model nullability. Narrow unions at boundaries.
515 | 5. **Output format**
516 | 
517 |    - `tsconfig` fragment, lint rules list, and target type coverage goals by package.
518 | 6. **Stop conditions**
519 | 
520 |    - `any` or `unknown` leaks to public APIs. Implicit `any` enabled. Type coverage goals undefined.
521 | 
522 | ### State & Data Layer — Frontend Engineer, State Management Specialist, Full-Stack Engineer
523 | 
524 | 1. **Role**
525 | 
526 |    - Control state lifecycles and data fetching.
527 | 2. **Task**
528 | 
529 |    - Choose client vs server state. Define stores, selectors, and cache policy. Specify invalidation and suspense boundaries.
530 | 3. **Context**
531 | 
532 |    - React state, context, or a store. Fetch via RSC or client hooks. Cache with SWR or equivalent.
533 | 4. **Reasoning**
534 | 
535 |    - Server fetch by default. Co-locate state with consumers. Keep derived state computed. Normalize entities.
536 | 5. **Output format**
537 | 
538 |    - State inventory table: State | Scope | Source | Lifetime | Invalidation | Consumers.
539 | 6. **Stop conditions**
540 | 
541 |    - Duplicate sources of truth. Unbounded caches. Missing invalidation plan. Server-client mismatch.
542 | 
543 | ### API/Backend Layer — Backend Engineer, API Developer, Full-Stack Engineer
544 | 
545 | 1. **Role**
546 | 
547 |    - Provide stable contracts for data and actions.
548 | 2. **Task**
549 | 
550 |    - Define endpoints or schema. Specify auth, pagination, filtering, errors, and idempotency. Version contracts.
551 | 3. **Context**
552 | 
553 |    - REST or GraphQL. JSON. OpenAPI or SDL.
554 | 4. **Reasoning**
555 | 
556 |    - Design for evolution. Prefer standard status codes. Use cursor pagination. Return problem details.
557 | 5. **Output format**
558 | 
559 |    - OpenAPI snippet or GraphQL SDL. Error model table and example requests.
560 | 6. **Stop conditions**
561 | 
562 |    - Breaking change without versioning. Inconsistent pagination. Ambiguous error semantics. Missing auth notes.
563 | 
564 | ### Database & Persistence Layer — Database Engineer, Data Engineer, Backend Engineer
565 | 
566 | 1. **Role**
567 | 
568 |    - Safeguard data correctness and performance.
569 | 2. **Task**
570 | 
571 |    - Model schema. Choose indexes. Define migrations and retention. Set transaction boundaries.
572 | 3. **Context**
573 | 
574 |    - SQL or NoSQL. Managed service or local. Migration tool required.
575 | 4. **Reasoning**
576 | 
577 |    - Normalize until it hurts then denormalize where measured. Prefer declarative migrations. Use constraints.
578 | 5. **Output format**
579 | 
580 |    - Schema diagram or DDL. Migration plan with up and down steps. Index plan with rationale.
581 | 6. **Stop conditions**
582 | 
583 |    - Missing primary keys. Unsafe destructive migration. No rollback path. Unbounded growth.
584 | 
585 | ### Deployment & Hosting Layer — DevOps Engineer, Cloud Engineer, Platform Engineer
586 | 
587 | 1. **Role**
588 | 
589 |    - Ship safely and reversibly.
590 | 2. **Task**
591 | 
592 |    - Define environments, build artifacts, release gates, and rollout strategy. Set rollback procedures.
593 | 3. **Context**
594 | 
595 |    - IaC preferred. Blue/green or canary. Artifact registry. Secrets manager.
596 | 4. **Reasoning**
597 | 
598 |    - Immutable artifacts. Promote by provenance. Automate checks before traffic shift.
599 | 5. **Output format**
600 | 
601 |    - Release plan: envs, gates, rollout, rollback steps, and metrics to watch.
602 | 6. **Stop conditions**
603 | 
604 |    - Manual pet deployments. No rollback tested. Secrets in env without manager. Drift from IaC.
605 | 
606 | ### Observability & Ops Layer — Site Reliability Engineer, DevOps Engineer, Monitoring Specialist
607 | 
608 | 1. **Role**
609 | 
610 |    - Ensure reliability and rapid diagnosis.
611 | 2. **Task**
612 | 
613 |    - Define logs, metrics, traces, dashboards, SLOs, and alerts. Set runbooks.
614 | 3. **Context**
615 | 
616 |    - Centralized logging. Metrics store. Tracing. On-call rotation.
617 | 4. **Reasoning**
618 | 
619 |    - Measure user impact first. Alert on symptoms not causes. Keep noise low.
620 | 5. **Output format**
621 | 
622 |    - SLO doc. Alert rules list. Dashboard inventory with owners.
623 | 6. **Stop conditions**
624 | 
625 |    - No SLOs. Alerts without ownership. Missing runbooks. High alert noise.
626 | 
627 | ### Security & Auth Layer — Security Engineer, Identity and Access Management Engineer, DevOps with Security Focus
628 | 
629 | 1. **Role**
630 | 
631 |    - Protect assets and identities.
632 | 2. **Task**
633 | 
634 |    - Define authN and authZ flows. Manage secrets. Apply threat modeling and controls.
635 | 3. **Context**
636 | 
637 |    - OAuth or OIDC. Role based access. Secret store.
638 | 4. **Reasoning**
639 | 
640 |    - Least privilege. Rotate secrets. Validate all inputs. Log security events.
641 | 5. **Output format**
642 | 
643 |    - Auth flow diagram. Permission matrix. Threat model checklist.
644 | 6. **Stop conditions**
645 | 
646 |    - Hardcoded secrets. Missing MFA for admin. Broad tokens. Unvalidated input at boundaries.
647 | 
648 | ---
649 | 
650 | ## 7) Library docs retrieval (topic-focused)
651 | 
652 | - Use **contex7-mcp** first to fetch current docs before code changes.
653 | - UI components: call shadcn-ui-mcp-server to retrieve component recipes and scaffolds before writing code; then generate. Log under DocFetchReport.tools\_called\[].
654 | - If **contex7-mcp** fails, use **gitmcp** (repo docs/source) to retrieve equivalents.
655 | - Summarize key guidance inline in `DocFetchReport.key_guidance` and map each planned change to a guidance line.
656 | - Always note in the task preamble that docs were fetched and which topics/IDs were used.
657 | 
658 | ---
659 | 
660 | ## 8) Environment & Testing Policy (**REVISED: Safety Gate for automatic stateless checks**)
661 | 
662 | **Objective:** Allow **automatic stateless checks** post-completion when safe, while preventing environment drift or global mutations. Keep heavier or stateful tests **opt-in**.
663 | 
664 | **Safety Gate checklist (used by §2.1 step c):**
665 | 
666 | 1. **Execution scope** is read-only or hermetic.
667 | 2. **No environment activation** of existing shells or venvs.
668 | 3. **No network** access unless explicitly approved.
669 | 4. **No global writes** or package installs; all outputs limited to `./artifacts/`.
670 | 5. **Command review** shows only stateless operations.
671 | 
672 | **Allowed Automatic Checks (when Safety Gate passes):**
673 | 
674 | - Typecheck, lint, and format-check.
675 | - Build **dry-run** only.
676 | - Docs build if it does not write outside `./artifacts`.
677 | - Unit tests limited to **pure** functions with no I/O, no network, and no writes beyond `./artifacts`.
678 | 
679 | **Deferral conditions** (any true ⇒ **defer** and emit Local Test Instructions):
680 | 
681 | - Active Python venv detected (`VIRTUAL_ENV` set) or `.venv/` present in repo.
682 | - Managed envs or shims detected (e.g., `conda`, `poetry env`, Nix shells).
683 | - Commands imply global mutations, installs, migrations, DB writes, or network calls without explicit approval.
684 | - OS or shell mismatch risk in user context.
685 | 
686 | **Python rule:** If Python commands are needed and considered safe, use **`uv`** exclusively (`uv run`, `uvx`). **Do not** activate existing venvs.
687 | 
688 | **Pre-run Test Plan (required for any automatic run):**
689 | 
690 | - Exact commands, working directory, environment variables, and expected exit codes.
691 | - A short **Risk table** explaining why each command is safe under the Safety Gate.
692 | 
693 | **Execution protocol (automatic checks):**
694 | 
695 | - Run the approved commands exactly.
696 | - Capture stdout/stderr to `artifacts/test/<UTC-timestamp>.log`.
697 | - Do not modify other files.
698 | 
699 | **Post-run recording:**
700 | 
701 | - Add outcomes to the completion note and `DocFetchReport`.
702 | - Update `task:${task_id}.observations.test_results` and `test_log_path`.
703 | 
704 | **Deferral protocol:**
705 | 
706 | - Emit a **Local Test Instructions** block (see §2.1 example) with copy-paste commands, rationale, and expected exit codes.
707 | - Record `tests_deferred_reason` and set status to **`needs-local-tests`**.
708 | 
709 | ---
710 | 
711 | ### System-prompt scaffold (enforcement)
712 | 
713 | ```markdown
714 | SYSTEM: You operate under a blocking docs-first policy.
715 | 1) Preflight (§A):
716 |    - Call contex7-mcp → gitmcp as needed.
717 |    - Build DocFetchReport (status must be OK).
718 | 2) Planning:
719 |    - Map each planned change to key_guidance items in DocFetchReport.
720 |    - Build a subtask plan with DoD (§1.1) and record to memory.
721 | 3) Decision Gate (§B):
722 |    - If DocFetchReport.status != OK → STOP and return "Docs Missing" with exact MCP calls.
723 | 4) Execution:
724 |    - Proceed only if ctx.docs_ready == true.
725 |    - Log subtask progress to memory (§1.2). Finish-in-one-go unless blocked.
726 | 5) Completion:
727 |    - After memory updates, set status to **verify** and evaluate §8 Safety Gate.
728 |    - Run allowed automatic checks or defer with Local Test Instructions (§2.1, §8).
729 |    - Verify all subtasks done, then set status **done** on success; otherwise **blocked** or **needs-local-tests**.
730 |    - Attach DocFetchReport and write completion memory (§2).
731 | ```
732 | 
733 | ---
734 | 
735 | ## Prompt Registry & Precedence
736 | 
737 | - **Baseline:** GEMINI.md is always authoritative. Prompts in `~/.codex/prompts` are available but inert until manually invoked.
738 | - **Engagement:** Prompts run only when the user explicitly types the slash command or pastes the body. The assistant must not auto-run them.
739 | - **Precedence:** Behavior extensions and rule-packs follow later-wins. Prompts never override baseline unless pasted inline.
740 | - **Recording:** When invoked, the assistant must echo which prompt was used and log it in `DocFetchReport.approved_instructions[]` as `{source: "~/.codex/prompts", command: "/<name>"}`.
741 | 
742 | ---
743 | 
744 | ## Prompt Discovery & Namespacing
745 | 
746 | - **Discovery:** `/foo` resolves to `~/.codex/prompts/foo.md`. No auto-run.
747 | - **Reserved namespace:** `/vibe-*` for YC-style playbooks and planning flows.
748 | - **Default shortlist:** Recommended safe manual commands:
749 | 
750 |   - `/planning-process`, `/scope-control`, `/integration-test`, `/regression-guard`, `/review`, `/release-notes`, `/reset-strategy`, `/compare-outputs`.
751 |   - Newly available and supported: `/scaffold-fullstack`, `/api-contract`, `/openapi-generate`, `/db-bootstrap`, `/migration-plan`, `/auth-scaffold`, `/e2e-runner-setup`, `/env-setup`, `/secrets-manager-setup`, `/iac-bootstrap`, `/monitoring-setup`, `/slo-setup`, `/feature-flags`.
752 | 
753 | ---
754 | 
755 | ## Prompt→Gate Router
756 | 
757 | -
758 | - **Scope Gate:** `/scope-control`, `/plan`, `/planning-process`
759 | - **Test Gate:** `/integration-test`, `/regression-guard`, `/coverage-guide`
760 | - **Review Gate:** `/review`, `/review-branch`, `/pr-desc`, `/owners`
761 | - **Release Gate:** `/release-notes`, `/version-proposal`
762 | - **Reset path:** `/reset-strategy`
763 | - **Model tactics:** `/compare-outputs`, `/switch-model`, `/model-strengths`
764 | 
765 | ---
766 | 
767 | ## Prompt Safety & Proof Hooks
768 | 
769 | -
770 | - Prompts cannot bypass Preflight (§A) or Decision Gate (§B).
771 | - If a prompt suggests stateful changes, require Safety Gate review first.
772 | - Before acting on prompt output, confirm `DocFetchReport.status == "OK"`.
773 | - Append invoked prompts to `DocFetchReport.tools_called[]` as `{tool: "prompt", name: "/<cmd>", path: "~/.codex/prompts/<file>.md", time_utc}`.
774 | 
775 | ---
776 | 
777 | ## Prompt Non-Goals
778 | 
779 | -
780 | - No auto-invocation of prompts.
781 | - Prompts must not redefine baseline gates, safety policies, or precedence.
782 | - If a command is unrecognized, check `~/.codex/prompts/<name>.md` and restart Codex if missing.
783 | 
784 | ---
785 | 
786 | ## Install & Availability Note
787 | 
788 | -
789 | - Place your prompt catalog at `~/.codex/prompts` so slash commands like `/foo` resolve to `~/.codex/prompts/foo.md`.
790 | - Restart your Codex client if new prompts are not discovered. Hot‑reload is not guaranteed.
791 | - File naming must match the command exactly, use `.md` extension, and avoid hidden files or directories prefixed with `_`.
792 | - On Windows + WSL2, store prompts in the Linux home directory and, if needed, symlink from Windows paths to keep a single source of truth.
793 | 
794 | ---
795 | 
796 | ## Gemini→Codex Mapper (optional)
797 | 
798 | If you maintain mapper templates, you may expose a manual command like `/gemini-map <template>` that maps Gemini‑style request blocks into Codex‑style tasks. Group mapper templates under Architecture, Debug, Review, and Quality. Treat all mapper runs as manual accelerators that never bypass gates (§A, §B).
799 | 
800 | ---
801 | 
802 | ## Troubleshooting
803 | 
804 | -
805 | - **Slash not recognized:** Verify `~/.codex/prompts/<name>.md` exists and the filename matches the command. Restart the client.
806 | - **Prompt not applied:** Prompts are inert until manually invoked. Ensure you typed the slash command or pasted the prompt body.
807 | - **Discovery issues:** Avoid directories starting with `_` or filenames containing `.archive.` which are ignored by design.
808 | 
809 | ---
810 | 
811 | ## Version Pinning (optional)
812 | 
813 | For reproducibility, pin the prompt catalog to a specific commit SHA. Record the SHA in project docs or a local dotfile so teams share the same prompt semantics across runs.
814 | 
815 | ---
816 | 
817 | ## Workflow Expansion Example
818 | 
819 | To demonstrate prompts in practice, a full-stack app workflow includes:
820 | 
821 | 1. **Preflight Docs** → ensure latest docs. Block if `status != OK`.
822 | 2. **Planning** → `/planning-process`, `/scope-control`, `/stack-evaluation`.
823 | 3. **Scaffold** → `/scaffold-fullstack`, `/api-contract`, `/openapi-generate`.
824 | 4. **Data/Auth** → `/db-bootstrap`, `/migration-plan`, `/auth-scaffold`.
825 | 5. **Frontend** → `/modular-architecture`, `/ui-screenshots`, `/design-assets`.
826 | 6. **Testing** → `/e2e-runner-setup`, `/integration-test`, `/coverage-guide`, `/regression-guard`.
827 | 7. **CI/CD** → `/version-control-guide`, `/devops-automation`, `/env-setup`, `/secrets-manager-setup`, `/iac-bootstrap`.
828 | 8. **Release** → `/owners`, `/review`, `/review-branch`, `/pr-desc`, `/release-notes`, `/version-proposal`.
829 | 9. **Ops** → `/monitoring-setup`, `/slo-setup`, `/logging-strategy`, `/audit`.
830 | 10. **Post-release** → `/error-analysis`, `/fix`, `/refactor-suggestions`, `/file-modularity`, `/dead-code-scan`, `/cleanup-branches`, `/feature-flags`.
831 | 11. **Model tactics** → `/model-strengths`, `/model-evaluation`, `/compare-outputs`, `/switch-model`.
832 | 
833 | **Prompt catalog status:** All prompts referenced in this workflow are present in `~/.codex/prompts` and can be invoked as shown. To verify, run a discovery pass and confirm the resolver paths match the command names.
834 | 
835 | - Discovery check: ensure files exist at `~/.codex/prompts/<name>.md` for every command listed above.
836 | - If any command is not recognized, restart the client and re-check filename casing and extension.
837 | 
838 | ---
839 | 
840 | *End of file.*
```

PRD.txt
```
1 | # Overview
2 | 
3 | prompts-mcp-server is a production-grade Model Context Protocol (MCP) server that exposes Markdown prompt files as tools, encodes a directed acyclic graph (DAG) for workflow gating, and ships a planner that proposes next calls based on state and artifacts. It targets AI tool integrators, LLM application engineers, and platform teams who need deterministic, inspectable prompt tooling with progress gating. It solves unstructured prompt distribution, lack of execution order, and brittle state tracking by providing dynamic tool surfacing, DAG-aware planning, file-based artifacts, and safety guards such as payload caps and redacted logging.
4 | 
5 | # Core Features
6 | 
7 | ## 1) Dynamic Prompt Tools
8 | 
9 | * What: Expose each prompt in resources/prompts/\*.md as an MCP tool with generated schemas.
10 | * Why: Standardize prompt access and enable client-side orchestration via MCP.
11 | * How: Parse prompts.meta.yaml; register tools with input/output schemas; handler returns prompt content with payload capping.
12 | * Acceptance criteria:
13 | 
14 |   * Given a prompt entry in prompts.meta.yaml when the server starts then a tool with matching id is registered.
15 |   * Given a tool invocation when the prompt file exists then the response contains the Markdown content and a rendered footer.
16 |   * Given a prompt larger than 1 MB when served then the response is truncated with an ellipsis note.
17 | 
18 | ## 2) Resource Exposure
19 | 
20 | * What: Serve each prompt Markdown as a file:// resource with mimeType text/markdown.
21 | * Why: Let clients preview prompts without executing tools.
22 | * How: On startup, load metadata and register resources with absolute file URIs and capped text.
23 | * Acceptance criteria:
24 | 
25 |   * Given a prompt with resource path when the server starts then a resource is listed with a file:// URI and human name.
26 |   * Given an oversized resource when read then the text is capped to \~1 MB with a truncation note.
27 | 
28 | ## 3) Planner: suggest\_next\_calls
29 | 
30 | * What: Rank next runnable tools based on DAG dependencies and required artifacts.
31 | * Why: Enforce correct sequencing and reduce operator error.
32 | * How: Load default-graph.json and .mcp/state.json; compute readiness; sort by phase order.
33 | * Acceptance criteria:
34 | 
35 |   * Given an empty state when suggest\_next\_calls runs then it returns discover\_research as the first candidate.
36 |   * Given discover\_research completed with research\_summary artifact when suggest\_next\_calls runs then define\_prd appears in ranked results.
37 |   * Given a node with unmet artifact requirements when suggest\_next\_calls runs then that node is not returned.
38 | 
39 | ## 4) State Management and Gating
40 | 
41 | * What: Persist tool completions, outputs, and artifact paths; gate progress on subsequent steps.
42 | * Why: Provide deterministic, idempotent progress tracking.
43 | * How: StateStore writes .mcp/state.json via atomic rename; recordCompletion merges artifacts; planner reads it.
44 | * Acceptance criteria:
45 | 
46 |   * Given a completed tool when advance\_state is called then .mcp/state.json exists and includes timestamp, outputs, and artifacts.
47 |   * Given concurrent save attempts when save runs then the final file is valid JSON due to write-to-temp then rename.
48 | 
49 | ## 5) advance\_state tool
50 | 
51 | * What: Mark a tool complete and record outputs and artifacts.
52 | * Why: Move the workflow forward and unlock dependent nodes.
53 | * How: Expose advance\_state MCP tool; handler calls StateStore.recordCompletion.
54 | * Acceptance criteria:
55 | 
56 |   * Given valid input with id when calling advance\_state then it returns ok: true and a statePath under .mcp/.
57 |   * Given artifacts in input when calling advance\_state then state.artifacts includes each key with provided deterministic path.
58 | 
59 | ## 6) Interop export\_task\_list
60 | 
61 | * What: Emit a compact task list for external planners.
62 | * Why: Allow task-master-ai or other systems to visualize DAG.
63 | * How: Read prompts.meta.yaml and map to id, title, dependsOn, status: pending.
64 | * Acceptance criteria:
65 | 
66 |   * Given metadata when export\_task\_list runs then tasks\[] contains all prompt ids with correct dependencies.
67 | 
68 | ## 7) Safety Controls
69 | 
70 | * What: Enforce payload cap, redact secrets in logs, and avoid external HTTP by default.
71 | * Why: Reduce leakage risk and control resource usage.
72 | * How: capPayload truncates strings at \~1 MB; logging.redactEnv hides keys matching /(key|secret|token)/i; rate limiter stub disables external calls by default.
73 | * Acceptance criteria:
74 | 
75 |   * Given environment variables with secret-like names when server\_start logs then log output shows \[redacted] values.
76 |   * Given a response body exceeding cap when returned then it includes a “\[truncated N bytes]” trailer.
77 | 
78 | ## 8) Rate Limiting Utility
79 | 
80 | * What: Provide a token-bucket for outbound HTTP stubbing.
81 | * Why: Bound future external integrations and tests.
82 | * How: TokenBucket with capacity, refill per second, and take() with simple wait.
83 | * Acceptance criteria:
84 | 
85 |   * Given zero tokens when take(1) is called then it waits approximately 1/refillPerSec seconds before granting.
86 |   * Given capacity C when take(C) then tokens decrease to zero and recover over time.
87 | 
88 | ## 9) Server Bootstrap and Transport
89 | 
90 | * What: Start MCP server on stdio with graceful shutdown.
91 | * Why: Enable use in MCP Inspector and Claude Desktop.
92 | * How: StdioServerTransport; SIGINT/SIGTERM handlers; register tools and resources on startup.
93 | * Acceptance criteria:
94 | 
95 |   * Given server start when inspected then name=prompts-mcp-server and version=0.1.0 are reported.
96 |   * Given SIGINT when received then process exits after logging server\_stop.
97 | 
98 | # User Experience
99 | 
100 | * Personas:
101 | 
102 |   * Tool Integrator: wires MCP servers into clients and automation.
103 |   * LLM Engineer: iterates on prompts and wants repeatable gating.
104 |   * QA Engineer: validates sequencing and state transitions.
105 |   * PM/Tech Lead: reviews PRD and architecture artifacts as resources.
106 | * Key flows:
107 | 
108 |   * Setup: install deps, build, start server; connect via MCP Inspector or Claude Desktop using provided config.
109 |   * Manual run: call discover\_research → advance\_state(research\_summary) → define\_prd → advance\_state(prd).
110 |   * Planner-led: call suggest\_next\_calls each step; only ready nodes appear until artifacts exist.
111 |   * Artifact review: open file:// resources to view prompt content.
112 | * UI/UX considerations:
113 | 
114 |   * JSON tool I/O with minimal required fields.
115 |   * Stable ids matched to prompts.meta.yaml and default-graph.json.
116 |   * Human-friendly titles for resources.
117 | * Accessibility considerations:
118 | 
119 |   * Text-based interfaces only; ensure log output is machine-parseable NDJSON.
120 |   * No color reliance; timestamps in ISO 8601.
121 | 
122 | # Technical Architecture
123 | 
124 | * System components:
125 | 
126 |   * MCP Server (stdio): process bootstrap, tool and resource registries, transport wiring.
127 |   * Prompt Registry: loads prompts.meta.yaml and Markdown files.
128 |   * Planner: reads graph JSON and state; computes readiness and ranking.
129 |   * State Store: file-backed JSON with atomic persistence.
130 |   * Utilities: logging with redaction, payload capping, token-bucket rate limiter.
131 | * Data models:
132 | 
133 |   * GraphDef { version, nodes\[] }, NodeDef { id, title, phase, dependsOn?, produces?, requiresArtifacts?, exitCriteria? }.
134 |   * ProjectState { version, completed { id → { at, outputs?, artifacts? } }, artifacts { key → path } }.
135 |   * PromptMeta { id, title, phase, description?, dependsOn?, inputs?, outputs?, artifacts?, resource? }.
136 | * APIs and integrations:
137 | 
138 |   * MCP tool interfaces: suggest\_next\_calls, advance\_state, export\_task\_list, plus dynamic prompt tools.
139 |   * Resources: file:// URIs for prompt Markdown.
140 |   * Clients: MCP Inspector and Claude Desktop via stdio.
141 | * Infrastructure requirements:
142 | 
143 |   * Runtime: Node.js ≥ 20, TypeScript build to dist/.
144 |   * Filesystem access with permission to create .mcp/ directories and write state.json.
145 |   * No database; no external HTTP by default.
146 | * Non-functional requirements:
147 | 
148 |   * Reliability: atomic writes for state; server survives restarts with intact state.
149 |   * Performance: register ≥100 prompts within 1 second on a typical laptop; suggest\_next\_calls in <50 ms on graphs ≤100 nodes.
150 |   * Security: never log secret values; cap outputs; no network egress by default; optional gating warning on direct tool calls.
151 |   * Consistency: deterministic ordering of suggestions by phase then id; stable ids across restarts.
152 |   * Portability: runs on macOS, Linux, and Windows with Node ≥20; uses path.join and file:// URIs.
153 |   * Observability: structured JSON logs with ts, level, event, msg, correlation\_id.
154 |   * Testability: unit tests for planner gating; enable vitest execution headless.
155 |   * Maintainability: single-responsibility modules; config via prompts.meta.yaml and default-graph.json.
156 |   * Scalability: supports single-process usage; graph and prompts load proportional to file count.
157 | * Cross-platform strategy:
158 | 
159 |   * Optional: file:// resource preview depends on client support; fallback is tool execution returning prompt text.
160 |   * Optional: POSIX signals on Windows may differ; fallback uses manual process termination supported by client.
161 |   * Optional: path separators differ; implementation uses Node path utilities to normalize.
162 | * Security and privacy considerations:
163 | 
164 |   * Redact environment secrets in logs using /(key|secret|token)/i.
165 |   * Cap payloads to \~1 MB to avoid large data leaks.
166 |   * Planner gating discourages out-of-order execution; direct calls log a warning.
167 |   * Artifacts are file paths only; contents are not ingested by default.
168 | 
169 | # Development Roadmap
170 | 
171 | * MVP requirements with acceptance criteria:
172 | 
173 |   * Dynamic Prompt Tools, Resource Exposure, Planner suggest\_next\_calls, advance\_state, export\_task\_list, State Store with atomic writes, Safety Controls, Server Bootstrap and Transport. Acceptance criteria as defined in Core Features.
174 | * Future enhancements with acceptance criteria:
175 | 
176 |   * External HTTP enablement:
177 | 
178 |     * How: flag to allow outbound calls guarded by TokenBucket.
179 |     * Criteria: Given ALLOW\_HTTP=1 when making N requests then rate limiter enforces capacity and refill.
180 |   * Schema validation for inputs/outputs:
181 | 
182 |     * Criteria: Given invalid tool input when invoked then server returns structured error with path and reason.
183 |   * Editable DAG and hot-reload:
184 | 
185 |     * Criteria: Given modified default-graph.json when server receives SIGHUP or hot-reload command then new graph is used without crashing.
186 |   * Metrics and health endpoints (optional transport):
187 | 
188 |     * Criteria: Given metrics enabled when tools execute then counters increase and can be scraped or logged.
189 |   * Encrypted state at rest:
190 | 
191 |     * Criteria: Given encryption key when saving then state file is unreadable without the key and loads successfully with it.
192 |   * Workspace scaffolder and CI stub generation:
193 | 
194 |     * Criteria: Given implement\_stub run then repo scaffold exists and build passes in CI.
195 |   * Multi-tenant workspaces:
196 | 
197 |     * Criteria: Given two roots when operating then their .mcp/state.json files are isolated.
198 |   * Config reload for prompts.meta.yaml:
199 | 
200 |     * Criteria: Given added prompt file when reloaded then a new tool and resource appear.
201 | 
202 | # Logical Dependency Chain
203 | 
204 | 1. Bootstrap server and logging.
205 | 2. Load prompts.meta.yaml and register resources.
206 | 3. Register dynamic prompt tools with schemas.
207 | 4. Load DAG and state store.
208 | 5. Implement suggest\_next\_calls planner.
209 | 6. Implement advance\_state persistence.
210 | 7. Implement export\_task\_list interop.
211 | 8. Enforce payload capping and redacted logging.
212 | 9. Provide token-bucket utility for future HTTP.
213 | 10. Add tests for planner gating and state write behavior.
214 | 
215 | # Risks and Mitigations
216 | 
217 | * Protocol drift in MCP:
218 | 
219 |   * Likelihood: Medium. Impact: High.
220 |   * Mitigation: Pin @modelcontextprotocol/sdk version; add compatibility tests.
221 | * Filesystem permissions and path issues:
222 | 
223 |   * Likelihood: Medium. Impact: Medium.
224 |   * Mitigation: Create directories recursively; normalize paths; document Windows file:// nuances; fallback to tool text when resource preview fails.
225 | * State corruption on crash:
226 | 
227 |   * Likelihood: Low. Impact: High.
228 |   * Mitigation: Atomic write via temp file then rename; validate JSON before replace; keep last-known-good backup.
229 | * Oversized payload performance hit:
230 | 
231 |   * Likelihood: Medium. Impact: Medium.
232 |   * Mitigation: Cap at \~1 MB; stream or paginate in future.
233 | * Direct tool invocation bypassing planner:
234 | 
235 |   * Likelihood: Medium. Impact: Medium.
236 |   * Mitigation: Log warnings; rely on clients to call planner; document gating.
237 | * Secret leakage in logs:
238 | 
239 |   * Likelihood: Low. Impact: High.
240 |   * Mitigation: Redaction regex; avoid logging env by default.
241 | * Cross-platform signal handling:
242 | 
243 |   * Likelihood: Medium. Impact: Low.
244 |   * Mitigation: Provide manual shutdown guidance; ensure graceful exit on supported signals.
245 | * Client dependency risk:
246 | 
247 |   * Likelihood: Medium. Impact: Medium.
248 |   * Mitigation: Keep stdio transport generic; test with MCP Inspector and Claude Desktop.
249 | * Data privacy of artifact paths:
250 | 
251 |   * Likelihood: Low. Impact: Medium.
252 |   * Mitigation: Store paths only; recommend non-sensitive directories; allow configurable root.
253 | 
254 | # Appendix
255 | 
256 | * Assumptions:
257 | 
258 |   * Operators run Node.js ≥ 20 and have filesystem write access.
259 |   * Clients support MCP stdio and can consume file:// resources.
260 |   * No external HTTP calls are required for MVP.
261 |   * Single-process usage is sufficient; no clustering required.
262 |   * Artifacts are deterministic file paths controlled by the operator.
263 |   * Environment variables may contain secrets and must not be logged in cleartext.
264 | * Research findings and references:
265 | 
266 |   * “OpenAI MCP docs — Create a server” link noted in README.
267 |   * “Model Context Protocol docs” link noted in README.
268 | * Technical specifications and terms glossary:
269 | 
270 |   * MCP: protocol for tool/resource servers over transports like stdio.
271 |   * DAG: directed acyclic graph defining tool dependencies.
272 |   * Artifact: file path recorded in state to gate subsequent steps.
273 |   * NDJSON: newline-delimited JSON logging format.
274 |   * Token bucket: rate limiting algorithm with capacity and refill rate.
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
35 | ### P0 Preflight Docs (Blocking)
36 | 
37 | - **Purpose**: Enforce docs-first policy and record DocFetchReport.&#x20;
38 | - **Inputs**: Empty repo, tool access.
39 | - **Steps**: Run Preflight Latest Docs. Record approved instructions and packs. Stop if status≠OK.&#x20;
40 | - **Gate Criteria**: DocFetchReport.status==OK.
41 | - **Outputs**: DocFetchReport JSON.
42 | - **Risks**: Missing docs.
43 | - **Owners**: Planner.
44 | 
45 | ### P1 Plan & Scope
46 | 
47 | - **Purpose**: Lock scope and acceptance.
48 | - **Steps**: `/planning-process "<app one-line>"` → draft plan. `/scope-control` → In/Out, Won’t do. `/stack-evaluation` → pick stack.&#x20;
49 | - **Gate**: Scope Gate passed.
50 | - **Outputs**: PLAN.md, scope table.
51 | - **Owners**: Planner.
52 | 
53 | ### P2 App Scaffold & Contracts
54 | 
55 | - **Purpose**: Create minimal working app.
56 | - **Steps**:
57 | 
58 |   - `/scaffold-fullstack <stack>` → create repo, packages, app, api, infra stubs. **(new)**
59 |   - `/api-contract` or `/openapi-generate` → draft API spec. **(new)**
60 |   - `/modular-architecture` → boundaries. `/reference-implementation` if copying style.&#x20;
61 | - **Gate**: Test Gate lite = build runs, lint clean.
62 | - **Outputs**: repo tree, OpenAPI/SDL.
63 | - **Owners**: Full-stack dev.
64 | 
65 | ### P3 Data & Auth
66 | 
67 | - **Purpose**: Persistence and identity.
68 | - **Steps**: `/db-bootstrap <db>` → schema, migrations, seeds. **(new)**
69 |   `/auth-scaffold <oauth|email>` → flows + threat model. **(new)**
70 |   `/migration-plan` → up/down scripts. **(new)**
71 | - **Gate**: Migration dry-run ok. Threat checklist done.
72 | - **Outputs**: migrations, seed script, auth routes.
73 | - **Owners**: API dev, Security.
74 | 
75 | ### P4 Frontend UX
76 | 
77 | - **Purpose**: Routes and components.
78 | - **Steps**: `/modular-architecture` (UI), `/ui-screenshots` for reviews, `/design-assets` for favicon/brand, `/logging-strategy` client events.&#x20;
79 | - **Gate**: Accessibility checks queued.
80 | - **Outputs**: Screens, states, assets.
81 | - **Owners**: Frontend.
82 | 
83 | ### P5 Quality Gates & Tests
84 | 
85 | - **Purpose**: E2E-first coverage.
86 | - **Steps**: `/e2e-runner-setup <playwright|cypress>` **(new)** → runner + fixtures.
87 |   `/integration-test` → happy path E2E. `/coverage-guide` → target areas. `/regression-guard` → unrelated drift.&#x20;
88 | - **Gate**: Test Gate = E2E happy path green.
89 | - **Outputs**: E2E suite, coverage plan.
90 | - **Owners**: QA.
91 | 
92 | ### P6 CI/CD & Env
93 | 
94 | - **Purpose**: Reproducible pipeline and environments.
95 | - **Steps**: `/version-control-guide` → commit rules. `/devops-automation` → CI, DNS, SSL, deploy. `/env-setup` + `/secrets-manager-setup` **(new)**. `/iac-bootstrap` **(new)**.&#x20;
96 | - **Gate**: Review Gate = CI green, approvals, no unrelated churn.
97 | - **Outputs**: CI config, IaC, secret store wiring.
98 | - **Owners**: DevOps.
99 | 
100 | ### P7 Release & Ops
101 | 
102 | - **Purpose**: Ship safely.
103 | - **Steps**: `/pr-desc`, `/owners`, `/review`, `/review-branch`, `/release-notes`, `/version-proposal`. `/monitoring-setup` + `/slo-setup` **(new)**. `/logging-strategy` server. `/audit` security/hygiene.&#x20;
104 | - **Gate**: Release Gate = canary ok, rollback tested.
105 | - **Outputs**: Release notes, dashboards, runbooks.
106 | - **Owners**: Dev, DevOps, SRE.
107 | 
108 | ### P8 Post-release Hardening
109 | 
110 | - **Purpose**: Stability and cleanup.
111 | - **Steps**: `/error-analysis`, `/fix`, `/refactor-suggestions`, `/file-modularity`, `/dead-code-scan`, `/cleanup-branches`. `/feature-flags` **(new)**.&#x20;
112 | - **Gate**: All Sev-1 fixed.
113 | - **Outputs**: Clean diff, flags in place.
114 | - **Owners**: Dev.
115 | 
116 | ### P9 Model Tactics (cross-cutting)
117 | 
118 | - **Purpose**: Optimize prompting/model choice.
119 | - **Steps**: `/model-strengths`, `/model-evaluation`, `/compare-outputs`, `/switch-model`.&#x20;
120 | - **Gate**: Model delta improves QoS.
121 | - **Owners**: Planner.
122 | 
123 | ## 6) Dev Loop Rules
124 | 
125 | Commit small. One concern per PR. Use clean-room finalize if diff grows. Reset when E2E red for >60m or design drift detected. Enforce branch policy via `/version-control-guide`.&#x20;
126 | 
127 | ## 7) Test Strategy
128 | 
129 | E2E first. Happy path before edge cases. Regression guards on changed areas and critical paths. Coverage targets: lines 80%, branches 60%, critical modules 90%. Use `/integration-test`, `/coverage-guide`, `/regression-guard`.&#x20;
130 | 
131 | ## 8) CI/CD Plan
132 | 
133 | Jobs: lint, typecheck, unit, build, e2e, package, deploy. Artifacts: build outputs, test logs, coverage, SBOM. Envs: preview, staging, prod. Rollback: pinned version + IaC plan. Use `/devops-automation` and `/iac-bootstrap`.&#x20;
134 | 
135 | ## 9) Observability & Logging Plan
136 | 
137 | Structured logs, metrics, traces. Dashboards by domain. Alerts on SLO burn. Client and server logging strategies via `/logging-strategy`.&#x20;
138 | 
139 | ## 10) Risk Register & Mitigations
140 | 
141 | Scope creep → Scope Gate. Flaky E2E → isolate and retry matrix. Secrets leakage → secrets manager, scans. Infra drift → IaC. Auth gaps → threat model.&#x20;
142 | 
143 | ## 11) Evidence Log
144 | 
145 | - Command catalog and flows: README table and Mermaid.&#x20;
146 | - Baseline precedence, Preflight, DocFetchReport, gates: AGENTS baseline.&#x20;
147 | 
148 | ## 12) Release Notes Checklist
149 | 
150 | Scope summary, changes by area, migration steps, breaking changes, version bump, commit range, contributors, links to dashboards. Use `/release-notes` and `/version-proposal`.&#x20;
151 | 
152 | ---
153 | 
154 | ### Missing prompts needed
155 | 
156 | - `/scaffold-fullstack` — generate repo, workspace, app, api, tests, CI seeds.
157 | - `/api-contract` — author initial OpenAPI/GraphQL contract from requirements.
158 | - `/openapi-generate` — codegen server and client from OpenAPI.
159 | - `/db-bootstrap` — pick DB, init migrations, local compose, seed scripts.
160 | - `/migration-plan` — write up/down plans with safety checks.
161 | - `/auth-scaffold` — OAuth/OIDC/email templates, routes, threat model.
162 | - `/e2e-runner-setup` — Playwright/Cypress config, fixtures, data sandbox.
163 | - `/env-setup` — `.env.example`, schema validation, per-env overrides.
164 | - `/secrets-manager-setup` — provision secret store, map app vars.
165 | - `/iac-bootstrap` — minimal IaC for chosen cloud, state, pipelines.
166 | - `/monitoring-setup` — logs/metrics/traces bootstrap.
167 | - `/slo-setup` — SLOs, alerts, dashboards.
168 | - `/feature-flags` — flag provider, SDK wiring, guardrails.
169 |   These integrate with existing commands and respect AGENTS gating.
170 | 
171 | ---
172 | 
173 | ## workflow\.mmd
174 | 
175 | ```mermaid
176 | flowchart TD
177 |   A[Preflight Docs (§A) AGENTS] -->|DocFetchReport OK| B[/planning-process/]
178 |   B --> C[/scope-control/]
179 |   C --> D[/stack-evaluation/]
180 |   D --> E[/scaffold-fullstack/]
181 |   E --> F[/api-contract/]
182 |   F --> G[/openapi-generate/]
183 |   G --> H[/modular-architecture/]
184 |   H --> I[/db-bootstrap/]
185 |   I --> J[/migration-plan/]
186 |   J --> K[/auth-scaffold/]
187 |   K --> L[/e2e-runner-setup/]
188 |   L --> M[/integration-test/]
189 |   M --> N[/coverage-guide/]
190 |   N --> O[/regression-guard/]
191 |   O --> P[/version-control-guide/]
192 |   P --> Q[/devops-automation/]
193 |   Q --> R[/env-setup/]
194 |   R --> S[/secrets-manager-setup/]
195 |   S --> T[/iac-bootstrap/]
196 |   T --> U[/owners/]
197 |   U --> V[/review/]
198 |   V --> W[/review-branch/]
199 |   W --> X[/pr-desc/]
200 |   X --> Y{Gates}
201 |   Y -->|Scope Gate pass| Z1[proceed]
202 |   Y -->|Test Gate pass| Z2[proceed]
203 |   Y -->|Review Gate pass| Z3[proceed]
204 |   Z3 --> AA[/release-notes/]
205 |   AA --> AB[/version-proposal/]
206 |   AB --> AC{Release Gate}
207 |   AC -->|pass| AD[Deploy Staging]
208 |   AD --> AE[Canary + Health]
209 |   AE -->|ok| AF[Deploy Prod]
210 |   AE -->|fail| AR[Rollback]
211 |   AF --> AG[/monitoring-setup/]
212 |   AG --> AH[/slo-setup/]
213 |   AH --> AI[/logging-strategy/]
214 |   AI --> AJ[/error-analysis/]
215 |   AJ --> AK[/fix/]
216 |   AK --> AL[/refactor-suggestions/]
217 |   AL --> AM[/file-modularity/]
218 |   AM --> AN[/dead-code-scan/]
219 |   AN --> AO[/cleanup-branches/]
220 |   AF --> AP[/feature-flags/]
221 |   AF --> AQ[/model-strengths/]
222 |   AQ --> AR2[/model-evaluation/]
223 |   AR2 --> AS[/compare-outputs/]
224 |   AS --> AT[/switch-model/]
225 | ```
226 | 
227 | ---
228 | 
229 | ## Nodes & Edges list
230 | 
231 | **Nodes**: Preflight, planning-process, scope-control, stack-evaluation, scaffold-fullstack, api-contract, openapi-generate, modular-architecture, db-bootstrap, migration-plan, auth-scaffold, e2e-runner-setup, integration-test, coverage-guide, regression-guard, version-control-guide, devops-automation, env-setup, secrets-manager-setup, iac-bootstrap, owners, review, review-branch, pr-desc, Gates, release-notes, version-proposal, Deploy Staging, Canary + Health, Deploy Prod, Rollback, monitoring-setup, slo-setup, logging-strategy, error-analysis, fix, refactor-suggestions, file-modularity, dead-code-scan, cleanup-branches, feature-flags, model-strengths, model-evaluation, compare-outputs, switch-model.
232 | **Edges**: Preflight→planning-process→scope-control→stack-evaluation→scaffold-fullstack→api-contract→openapi-generate→modular-architecture→db-bootstrap→migration-plan→auth-scaffold→e2e-runner-setup→integration-test→coverage-guide→regression-guard→version-control-guide→devops-automation→env-setup→secrets-manager-setup→iac-bootstrap→owners→review→review-branch→pr-desc→Gates→release-notes→version-proposal→Deploy Staging→Canary + Health→Deploy Prod→monitoring-setup→slo-setup→logging-strategy→error-analysis→fix→refactor-suggestions→file-modularity→dead-code-scan→cleanup-branches and Deploy Prod→feature-flags and model-strengths→model-evaluation→compare-outputs→switch-model; Canary + Health→Rollback on fail.
233 | 
234 | ---
235 | 
236 | ## Gate checklists
237 | 
238 | ### Scope Gate
239 | 
240 | - Problem, users, Done criteria defined.
241 | - In/Out lists and Won’t do recorded.
242 | - Stack chosen and risks listed.
243 |   Evidence: `/planning-process`, `/scope-control`, `/stack-evaluation`.&#x20;
244 | 
245 | ### Test Gate
246 | 
247 | - E2E happy path green locally and in CI.
248 | - No unrelated file churn.
249 | - Regression guards added for changed modules.
250 |   Evidence: `/integration-test`, `/regression-guard`.&#x20;
251 | 
252 | ### Review Gate
253 | 
254 | - Clean diff per `/version-control-guide`.
255 | - PR reviewed via `/review` and `/review-branch`.
256 | - Owners assigned and approvals met.&#x20;
257 | 
258 | ### Release Gate
259 | 
260 | - Staging deploy passes checks.
261 | - Canary health metrics stable.
262 | - Rollback rehearsed and documented.
263 |   Evidence: `/devops-automation`, IaC, monitoring setup.&#x20;
264 | 
265 | ---
266 | 
267 | ## Reset Playbook
268 | 
269 | **When**: E2E red >60m, diff noisy, plan drift, large rebase pain, conflicting designs.
270 | **Command path**: `/reset-strategy` → propose clean slice. Create new branch from main, cherry-pick minimal commits, re-run Gate sequence.&#x20;
271 | **Data-loss warning**: Uncommitted local changes will be dropped if hard reset. Stash before reset.
272 | 
273 | ---
274 | 
275 | ## Model Eval Block
276 | 
277 | **When**: Contentious generation, flaky refactors, new model availability.
278 | **Steps**: `/model-strengths` → route candidates. `/model-evaluation` → baseline vs new. `/compare-outputs` → pick best. `/switch-model` → roll change with guardrails. Success = higher test pass rate or smaller diff with same tests.&#x20;
279 | 
280 | ---
281 | 
282 | **Notes**
283 | 
284 | - Baseline precedence and Preflight come from AGENTS baseline. Prompts are manual. No auto-invoke.&#x20;
285 | - Command catalog and many building blocks exist already; this plan wires them into a complete “from scratch” path and lists required new prompts.&#x20;
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
1 | # API Contract
2 | 
3 | **Trigger:** `/api-contract "<feature or domain>"`
4 | 
5 | **Purpose:** Author an initial OpenAPI 3.1 or GraphQL SDL contract from requirements.
6 | 
7 | **Steps:**
8 | 
9 | 1. Parse inputs and existing docs. If REST, prefer OpenAPI 3.1 YAML; if GraphQL, produce SDL.
10 | 2. Define resources, operations, request/response schemas, error model, auth, and rate limit headers.
11 | 3. Add examples for each endpoint or type. Include pagination and filtering conventions.
12 | 4. Save to `apis/<domain>/openapi.yaml` or `apis/<domain>/schema.graphql`.
13 | 5. Emit changelog entry `docs/api/CHANGELOG.md` with rationale and breaking-change flags.
14 | 
15 | **Output format:**
16 | 
17 | - `Contract Path`, `Design Notes`, and a fenced code block with the spec body.
18 | 
19 | **Examples:**
20 | 
21 | - `/api-contract "accounts & auth"` → `apis/auth/openapi.yaml` with OAuth 2.1 flows.
22 | 
23 | **Notes:**
24 | 
25 | - Follow JSON:API style for REST unless caller specifies otherwise. Include `429` and `5xx` models.
```

api-docs-local.md
```
1 | # API Docs Local
2 | 
3 | Trigger: /api-docs-local
4 | 
5 | Purpose: Fetch API docs and store locally for offline, deterministic reference.
6 | 
7 | ## Steps
8 | 
9 | 1. Create `docs/apis/` directory.
10 | 2. For each provided URL or package, write retrieval commands (curl or `npm view` docs links). Do not fetch automatically without confirmation.
11 | 3. Add `DOCS.md` index linking local copies.
12 | 
13 | ## Output format
14 | 
15 | - Command list and file paths to place docs under `docs/apis/`.
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
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Audit repository hygiene and suggest improvements.
9 | 
10 | 1. Gather context by running `ls -la` for the top‑level listing; inspecting `.editorconfig` for the common config files (if present); inspecting `.gitignore` for the common config files (if present); inspecting `.geminiignore` for the common config files (if present); inspecting `.eslintrc.cjs` for the common config files (if present); inspecting `.eslintrc.js` for the common config files (if present); inspecting `tsconfig.json` for the common config files (if present); inspecting `pyproject.toml` for the common config files (if present).
11 | 2. Assess repo hygiene: docs, tests, CI, linting, security. Provide a prioritized checklist.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Audit repository hygiene and suggest improvements.
17 | - Offer prioritized, actionable recommendations with rationale.
18 | - Call out test coverage gaps and validation steps.
19 | - Highlight workflow triggers, failing jobs, and proposed fixes.
20 | 
21 | Example Input:
22 | (none – command runs without arguments)
23 | 
24 | Expected Output:
25 | 
26 | - Structured report following the specified sections.
27 | 
28 | Usage: /gemini-map
```

auth-scaffold.md
```
1 | # Auth Scaffold
2 | 
3 | **Trigger:** `/auth-scaffold <oauth|email|oidc>`
4 | 
5 | **Purpose:** Scaffold auth flows, routes, storage, and a basic threat model.
6 | 
7 | **Steps:**
8 | 
9 | 1. Select provider (OAuth/OIDC/email) and persistence for sessions.
10 | 2. Generate routes: login, callback, logout, session refresh.
11 | 3. Add CSRF, state, PKCE where applicable. Include secure cookie flags.
12 | 4. Document threat model: replay, fixation, token leakage, SSRF on callbacks.
13 | 5. Wire to frontend with protected routes and user context.
14 | 
15 | **Output format:** route list, config keys, and mitigations table.
16 | 
17 | **Examples:** `/auth-scaffold oauth` → NextAuth/Passport/Custom adapter plan.
18 | 
19 | **Notes:** Never print real secrets. Use placeholders in `.env.example`.
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
1 | You are a CLI assistant focused on helping contributors with the task: Suggest safe local branch cleanup (merged/stale).
2 | 
3 | 1. Gather context by running `git branch --merged` for the merged into current upstream; running `git branch --no-merged` for the branches not merged; running `git for-each-ref --sort=-authordate --format='%(refname:short) — %(authordate:relative)' refs/heads` for the recently updated (last author dates).
4 | 2. Using the lists below, suggest local branches safe to delete and which to keep. Include commands to remove them if desired (DO NOT execute).
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Suggest safe local branch cleanup (merged/stale).
10 | - Document the evidence you used so maintainers can trust the conclusion.
11 | 
12 | Example Input:
13 | (none – command runs without arguments)
14 | 
15 | Expected Output:
16 | 
17 | - Structured report following the specified sections.
```

commit.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Generates a Git commit message based on staged changes.
2 | 
3 | 1. Gather context by running `git diff --staged`.
4 | 
5 | 2. ```diff.
6 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
7 | 
8 | Output:
9 | 
10 | - Begin with a concise summary that restates the goal: Generates a Git commit message based on staged changes.
11 | - Provide unified diff-style patches when recommending code changes.
12 | - Document the evidence you used so maintainers can trust the conclusion.
13 | 
14 | Example Input:
15 | (none – command runs without arguments)
16 | 
17 | Expected Output:
18 | 
19 | - Structured report following the specified sections.
```

compare-outputs.md
```
1 | # Compare Outputs
2 | 
3 | Trigger: /compare-outputs
4 | 
5 | Purpose: Run multiple models or tools on the same prompt and summarize best output.
6 | 
7 | ## Steps
8 | 
9 | 1. Define evaluation prompts and expected properties.
10 | 2. Record outputs from each model/tool with metadata.
11 | 3. Score using a rubric: correctness, compile/run success, edits required.
12 | 4. Recommend a winner and suggested settings.
13 | 
14 | ## Output format
15 | 
16 | - Matrix comparison and a one-paragraph decision.
```

content-generation.md
```
1 | # Content Generation
2 | 
3 | Trigger: /content-generation
4 | 
5 | Purpose: Draft docs, blog posts, or marketing copy aligned with the codebase.
6 | 
7 | ## Steps
8 | 
9 | 1. Read repo README and recent CHANGELOG or commits.
10 | 2. Propose outlines for docs and posts.
11 | 3. Generate content with code snippets and usage examples.
12 | 
13 | ## Output format
14 | 
15 | - Markdown files with frontmatter and section headings.
```

coverage-guide.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Suggest a plan to raise coverage based on uncovered areas.
2 | 
3 | 1. Gather context by running `find . -name 'coverage*' -type f -maxdepth 3 -print -exec head -n 40 {} \; 2>/dev/null` for the coverage hints; running `git ls-files | sed -n '1,400p'` for the repo map.
4 | 2. Using coverage artifacts (if available) and repository map, propose the highest‑ROI tests to add.
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Suggest a plan to raise coverage based on uncovered areas.
10 | - Offer prioritized, actionable recommendations with rationale.
11 | - Call out test coverage gaps and validation steps.
12 | 
13 | Example Input:
14 | (none – command runs without arguments)
15 | 
16 | Expected Output:
17 | 
18 | - Focus on src/auth/login.ts — 0% branch coverage; add error path test.
```

db-bootstrap.md
```
1 | # DB Bootstrap
2 | 
3 | **Trigger:** `/db-bootstrap <postgres|mysql|sqlite|mongodb>`
4 | 
5 | **Purpose:** Pick a database, initialize migrations, local compose, and seed scripts.
6 | 
7 | **Steps:**
8 | 
9 | 1. Create `db/compose.yaml` for local dev (skip for sqlite).
10 | 2. Choose ORM/driver (Prisma or Drizzle for SQL). Add migration config.
11 | 3. Create `prisma/schema.prisma` or `drizzle/*.ts` with baseline tables (users, sessions, audit_log).
12 | 4. Add `pnpm db:migrate`, `db:reset`, `db:seed` scripts. Write seed data for local admin user.
13 | 5. Update `.env.example` with `DATABASE_URL` and test connection script.
14 | 
15 | **Output format:** Migration plan list and generated file paths.
16 | 
17 | **Examples:** `/db-bootstrap postgres` → Prisma + Postgres docker-compose.
18 | 
19 | **Notes:** Avoid destructive defaults; provide `--preview-feature` warnings if relevant.
```

dead-code-scan.md
```
1 | You are a CLI assistant focused on helping contributors with the task: List likely dead or unused files and exports (static signals).
2 | 
3 | 1. Gather context by running `rg -n "export |module.exports|exports\.|require\(|import " -g '!node_modules' .` for the file reference graph (best‑effort).
4 | 2. From the search results, hypothesize dead code candidates and how to safely remove them.
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: List likely dead or unused files and exports (static signals).
10 | - Document the evidence you used so maintainers can trust the conclusion.
11 | 
12 | Example Input:
13 | (none – command runs without arguments)
14 | 
15 | Expected Output:
16 | 
17 | - Structured report following the specified sections.
```

design-assets.md
```
1 | # Design Assets
2 | 
3 | Trigger: /design-assets
4 | 
5 | Purpose: Generate favicons and small design snippets from product brand.
6 | 
7 | ## Steps
8 | 
9 | 1. Extract brand colors and name from README or config.
10 | 2. Produce favicon set, social preview, and basic UI tokens.
11 | 3. Document asset locations and references.
12 | 
13 | ## Output format
14 | 
15 | - Asset checklist and generation commands.
```

devops-automation.md
```
1 | # DevOps Automation
2 | 
3 | Trigger: /devops-automation
4 | 
5 | Purpose: Configure servers, DNS, SSL, CI/CD at a pragmatic level.
6 | 
7 | ## Steps
8 | 
9 | 1. Inspect repo for IaC or deploy scripts.
10 | 2. Generate Terraform or Docker Compose templates if missing.
11 | 3. Propose CI workflows for tests, builds, and deploys.
12 | 4. Provide runbooks for rollback.
13 | 
14 | ## Output format
15 | 
16 | - Infra plan with checkpoints and secrets placeholders.
```

e2e-runner-setup.md
```
1 | # E2E Runner Setup
2 | 
3 | **Trigger:** `/e2e-runner-setup <playwright|cypress>`
4 | 
5 | **Purpose:** Configure an end‑to‑end test runner with fixtures and data sandbox.
6 | 
7 | **Steps:**
8 | 
9 | 1. Install runner and add config with baseURL, retries, trace/videos on retry only.
10 | 2. Create fixtures for auth, db reset, and network stubs. Add `test:serve` script.
11 | 3. Provide CI job that boots services, runs E2E, uploads artifacts.
12 | 
13 | **Output format:** file list, scripts, and CI snippet fenced code block.
14 | 
15 | **Examples:** `/e2e-runner-setup playwright`.
16 | 
17 | **Notes:** Keep runs under 10 minutes locally; parallelize spec files.
```

env-setup.md
```
1 | # Env Setup
2 | 
3 | **Trigger:** `/env-setup`
4 | 
5 | **Purpose:** Create `.env.example`, runtime schema validation, and per‑env overrides.
6 | 
7 | **Steps:**
8 | 
9 | 1. Scan repo for `process.env` usage and collected keys.
10 | 2. Emit `.env.example` with comments and safe defaults.
11 | 3. Add runtime validation via `zod` or `envsafe` in `packages/config`.
12 | 4. Document `development`, `staging`, `production` precedence and loading order.
13 | 
14 | **Output format:** `.env.example` content block and `config/env.ts` snippet.
15 | 
16 | **Examples:** `/env-setup`.
17 | 
18 | **Notes:** Do not include real credentials. Enforce `STRICT_ENV=true` in CI.
```

error-analysis.md
```
1 | # Error Analysis
2 | 
3 | Trigger: /error-analysis
4 | 
5 | Purpose: Analyze error logs and enumerate likely root causes with fixes.
6 | 
7 | ## Steps
8 | 
9 | 1. Collect last test logs or application stack traces if present.
10 | 2. Cluster errors by symptom. For each cluster list 2–3 plausible causes.
11 | 3. Propose instrumentation or inputs to disambiguate.
12 | 4. Provide minimal patch suggestions and validation steps.
13 | 
14 | ## Output format
15 | 
16 | - Table: error → likely causes → next checks → candidate fix.
17 | 
18 | ## Examples
19 | 
20 | - "TypeError: x is not a function" → wrong import, circular dep, stale build.
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

explain-code.md
```
1 | # Explain Code
2 | 
3 | Trigger: /explain-code
4 | 
5 | Purpose: Provide line-by-line explanations for a given file or diff.
6 | 
7 | ## Steps
8 | 
9 | 1. Accept a file path or apply to staged diff.
10 | 2. Explain blocks with comments on purpose, inputs, outputs, and caveats.
11 | 3. Highlight risky assumptions and complexity hot spots.
12 | 
13 | ## Output format
14 | 
15 | - Annotated markdown with code fences and callouts.
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
1 | # Feature Flags
2 | 
3 | **Trigger:** `/feature-flags <provider>`
4 | 
5 | **Purpose:** Integrate a flag provider, wire SDK, and enforce guardrails.
6 | 
7 | **Steps:**
8 | 
9 | 1. Select provider (LaunchDarkly, Unleash, Flagsmith, custom).
10 | 2. Add SDK init in web/api with bootstrap values and offline mode for dev.
11 | 3. Define flag naming and ownership. Add kill‑switch pattern and monitoring.
12 | 
13 | **Output format:** SDK snippet, example usage, and guardrail checklist.
14 | 
15 | **Examples:** `/feature-flags launchdarkly`.
16 | 
17 | **Notes:** Ensure flags are typed and expire with tickets.
```

file-modularity.md
```
1 | # File Modularity
2 | 
3 | Trigger: /file-modularity
4 | 
5 | Purpose: Enforce smaller files and propose safe splits for giant files.
6 | 
7 | ## Steps
8 | 
9 | 1. Find files over thresholds (e.g., >500 lines).
10 | 2. Suggest extraction targets: components, hooks, utilities, schemas.
11 | 3. Provide before/after examples and import updates.
12 | 
13 | ## Output format
14 | 
15 | - Refactor plan with patches for file splits.
```

fix.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Propose a minimal, correct fix with patch hunks.
2 | 
3 | 1. Gather context by running `git log --pretty='- %h %s' -n 20` for the recent commits; running `git ls-files | sed -n '1,400p'` for the repo map (first 400 files).
4 | 2. Bug summary: <args>. Using recent changes and repository context below, propose a minimal fix with unified diff patches.
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Propose a minimal, correct fix with patch hunks.
10 | - Provide unified diff-style patches when recommending code changes.
11 | - Offer prioritized, actionable recommendations with rationale.
12 | 
13 | Example Input:
14 | Authentication failure after password reset
15 | 
16 | Expected Output:
17 | 
18 | ```
19 | diff
20 | - if (!user) return error;
21 | + if (!user) return { status: 401 };
22 | ```
23 | 
24 | Regression test: add case for missing user.
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
33 | A pr-description.md file with the structure above and a bash cat > block.
34 | 
35 | Usage: /gemini-map
```

generate.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Generate unit tests for a given source file.
2 | 
3 | 1. Gather context by inspecting `package.json` for the framework hints (package.json); running `sed -n '1,400p' {{args}}` for the source (first 400 lines).
4 | 2. Given the file content, generate focused unit tests with clear arrange/act/assert and edge cases.
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Generate unit tests for a given source file.
10 | - Call out test coverage gaps and validation steps.
11 | - Document the evidence you used so maintainers can trust the conclusion.
12 | 
13 | Example Input:
14 | src/components/Button.tsx
15 | 
16 | Expected Output:
17 | 
18 | - Refactor proposal extracting shared styling hook with before/after snippet.
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
1 | # IaC Bootstrap
2 | 
3 | **Trigger:** `/iac-bootstrap <aws|gcp|azure|fly|render>`
4 | 
5 | **Purpose:** Create minimal Infrastructure‑as‑Code for chosen platform plus CI pipeline hooks.
6 | 
7 | **Steps:**
8 | 
9 | 1. Select tool (Terraform, Pulumi). Initialize backend and state.
10 | 2. Define stacks for `preview`, `staging`, `prod`. Add outputs (URLs, connection strings).
11 | 3. Add CI jobs: plan on PR, apply on main with manual approval.
12 | 4. Document rollback and drift detection.
13 | 
14 | **Output format:** stack diagram, file list, CI snippets.
15 | 
16 | **Examples:** `/iac-bootstrap aws`.
17 | 
18 | **Notes:** Prefer least privilege IAM and remote state with locking.
```

instruction-file.md
```
1 | # Instruction File
2 | 
3 | Trigger: /instruction-file
4 | 
5 | Purpose: Generate or update `cursor.rules`, `windsurf.rules`, or `claude.md` with project-specific instructions.
6 | 
7 | ## Steps
8 | 
9 | 1. Scan repo for existing instruction files.
10 | 2. Compose sections: Context, Coding Standards, Review Rituals, Testing, Security, Limits.
11 | 3. Include "Reset and re-implement cleanly" guidance and scope control.
12 | 4. Write to chosen file and propose a commit message.
13 | 
14 | ## Output format
15 | 
16 | - Markdown instruction file with stable headings.
```

integration-test.md
```
1 | # Integration Test
2 | 
3 | Trigger: /integration-test
4 | 
5 | Purpose: Generate E2E tests that simulate real user flows.
6 | 
7 | ## Steps
8 | 
9 | 1. Detect framework from `package.json` or repo (Playwright/Cypress/Vitest).
10 | 2. Identify critical path scenarios from `PLAN.md`.
11 | 3. Produce test files under `e2e/` with arrange/act/assert and selectors resilient to DOM changes.
12 | 4. Include login helpers and data setup. Add CI commands.
13 | 
14 | ## Output format
15 | 
16 | - Test files with comments and a README snippet on how to run them.
17 | 
18 | ## Examples
19 | 
20 | - Login, navigate to dashboard, create record, assert toast.
21 | 
22 | ## Notes
23 | 
24 | - Prefer data-test-id attributes. Avoid brittle CSS selectors.
```

logging-strategy.md
```
1 | # Logging Strategy
2 | 
3 | Trigger: /logging-strategy
4 | 
5 | Purpose: Add or remove diagnostic logging cleanly with levels and privacy in mind.
6 | 
7 | ## Steps
8 | 
9 | 1. Identify hotspots from recent failures.
10 | 2. Insert structured logs with contexts and correlation IDs.
11 | 3. Remove noisy or PII-leaking logs.
12 | 4. Document log levels and sampling in `OBSERVABILITY.md`.
13 | 
14 | ## Output format
15 | 
16 | - Diff hunks and a short guideline section.
```

migration-plan.md
```
1 | # Migration Plan
2 | 
3 | **Trigger:** `/migration-plan "<change summary>"`
4 | 
5 | **Purpose:** Produce safe up/down migration steps with checks and rollback notes.
6 | 
7 | **Steps:**
8 | 
9 | 1. Describe current vs target schema, include data volume and lock risk.
10 | 2. Plan: deploy empty columns, backfill, dual-write, cutover, cleanup.
11 | 3. Provide SQL snippets and PR checklist. Add `can_rollback: true|false` flag.
12 | 
13 | **Output format:** `Plan`, `SQL`, `Rollback`, `Checks` sections.
14 | 
15 | **Examples:** `/migration-plan "orders add status enum"`.
16 | 
17 | **Notes:** Include online migration strategies for large tables.
```

model-evaluation.md
```
1 | # Model Evaluation
2 | 
3 | Trigger: /model-evaluation
4 | 
5 | Purpose: Try a new model and compare outputs against a baseline.
6 | 
7 | ## Steps
8 | 
9 | 1. Define a benchmark set from recent tasks.
10 | 2. Run candidates and collect outputs and metrics.
11 | 3. Analyze failures and summarize where each model excels.
12 | 
13 | ## Output format
14 | 
15 | - Summary table and recommendations to adopt or not.
```

model-strengths.md
```
1 | # Model Strengths
2 | 
3 | Trigger: /model-strengths
4 | 
5 | Purpose: Choose model per task type.
6 | 
7 | ## Steps
8 | 
9 | 1. Classify task: UI, API, data, testing, docs, refactor.
10 | 2. Map historical success by model.
11 | 3. Recommend routing rules and temperatures.
12 | 
13 | ## Output format
14 | 
15 | - Routing guide with examples.
```

modular-architecture.md
```
1 | # Modular Architecture
2 | 
3 | Trigger: /modular-architecture
4 | 
5 | Purpose: Enforce modular boundaries and clear external interfaces.
6 | 
7 | ## Steps
8 | 
9 | 1. Identify services/modules and their public contracts.
10 | 2. Flag cross-module imports and circular deps.
11 | 3. Propose boundaries, facades, and internal folders.
12 | 4. Add "contract tests" for public APIs.
13 | 
14 | ## Output format
15 | 
16 | - Diagram-ready list of modules and edges, plus diffs.
```

monitoring-setup.md
```
1 | # Monitoring Setup
2 | 
3 | **Trigger:** `/monitoring-setup`
4 | 
5 | **Purpose:** Bootstrap logs, metrics, and traces with dashboards per domain.
6 | 
7 | **Steps:**
8 | 
9 | 1. Choose stack: OpenTelemetry → Prometheus/Grafana, or vendor.
10 | 2. Instrument web and api for request latency, error rate, throughput, and core domain metrics.
11 | 3. Provide default dashboards JSON and alert examples.
12 | 
13 | **Output format:** instrumentation checklist and dashboard links/paths.
14 | 
15 | **Examples:** `/monitoring-setup`.
16 | 
17 | **Notes:** Avoid high‑cardinality labels. Sample traces selectively in prod.
```

openapi-generate.md
```
1 | # OpenAPI Generate
2 | 
3 | **Trigger:** `/openapi-generate <server|client> <lang> <spec-path>`
4 | 
5 | **Purpose:** Generate server stubs or typed clients from an OpenAPI spec.
6 | 
7 | **Steps:**
8 | 
9 | 1. Validate `<spec-path>`; fail with actionable errors.
10 | 2. For `server`, generate controllers, routers, validation, and error middleware into `apps/api`.
11 | 3. For `client`, generate a typed SDK into `packages/sdk` with fetch wrapper and retry/backoff.
12 | 4. Add `make generate-api` or `pnpm sdk:gen` scripts and CI step to verify no drift.
13 | 5. Produce a diff summary and TODO list for unimplemented handlers.
14 | 
15 | **Output format:** summary table of generated paths, scripts to add, and next actions.
16 | 
17 | **Examples:** `/openapi-generate client ts apis/auth/openapi.yaml`.
18 | 
19 | **Notes:** Prefer openapi-typescript + zod for TS clients when possible.
```

owners.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Suggest likely owners/reviewers for a path.
2 | 
3 | 1. Gather context by inspecting `.github/CODEOWNERS` for the codeowners (if present); running `git log --pretty='- %an %ae: %s' -- {{args}} | sed -n '1,50p'` for the recent authors for the path.
4 | 2. Based on CODEOWNERS and git history, suggest owners.
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Suggest likely owners/reviewers for a path.
10 | - Reference evidence from CODEOWNERS or git history for each owner suggestion.
11 | - Document the evidence you used so maintainers can trust the conclusion.
12 | 
13 | Example Input:
14 | src/components/Button.tsx
15 | 
16 | Expected Output:
17 | 
18 | - Likely reviewers: @frontend-team (CODEOWNERS), @jane (last 5 commits).
```

planning-process.md
```
1 | # Planning Process
2 | 
3 | Trigger: /planning-process
4 | 
5 | Purpose: Draft, refine, and execute a feature plan with strict scope control and progress tracking.
6 | 
7 | ## Steps
8 | 
9 | 1. If no plan file exists, create `PLAN.md`. If it exists, load it.
10 | 2. Draft sections: **Goal**, **User Story**, **Milestones**, **Tasks**, **Won't do**, **Ideas for later**, **Validation**, **Risks**.
11 | 3. Trim bloat. Convert vague bullets into testable tasks with acceptance criteria.
12 | 4. Tag each task with an owner and estimate. Link to files or paths that will change.
13 | 5. Maintain two backlogs: **Won't do** (explicit non-goals) and **Ideas for later** (deferrable work).
14 | 6. Mark tasks done after tests pass. Append commit SHAs next to completed items.
15 | 7. After each milestone: run tests, update **Validation**, then commit `PLAN.md`.
16 | 
17 | ## Output format
18 | 
19 | - Update or create `PLAN.md` with the sections above.
20 | - Include a checklist for **Tasks**. Keep lines under 100 chars.
21 | 
22 | ## Examples
23 | **Input**: "Add OAuth login"
24 | 
25 | **Output**:
26 | 
27 | - Goal: Let users sign in with Google.
28 | - Tasks: [ ] add Google client, [ ] callback route, [ ] session, [ ] E2E test.
29 | - Won't do: org SSO.
30 | - Ideas for later: Apple login.
31 | 
32 | ## Notes
33 | 
34 | - Planning only. No code edits.
35 | - Assume a Git repo with test runner available.
```

pr-desc.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Draft a PR description from the branch diff.
2 | 
3 | 1. Gather context by running `git diff --name-status origin/main...HEAD` for the changed files (name + status); running `git diff --shortstat origin/main...HEAD` for the high‑level stats.
4 | 2. Create a crisp PR description following this structure: Summary, Context, Changes, Screenshots (if applicable), Risk, Test Plan, Rollback, Release Notes (if user‑facing). Base branch: origin/main User context: <args>.
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Draft a PR description from the branch diff.
10 | - Offer prioritized, actionable recommendations with rationale.
11 | - Call out test coverage gaps and validation steps.
12 | - Highlight workflow triggers, failing jobs, and proposed fixes.
13 | 
14 | Example Input:
15 | src/example.ts
16 | 
17 | Expected Output:
18 | 
19 | - Actionable summary aligned with the output section.
```

pr-description.md
```
1 | name: PR Description
2 | command: /pr-desc
3 | tags: pull-requests, docs, git
4 | scope: repository
5 | 
6 | You are a PR description drafter.
7 | 
8 | Steps:
9 | 
10 | 1) Read DIFF STATS and optional context NOTES.
11 | 2) Write sections: Summary, Context, Changes, Risk, Test Plan, Rollback, Release Notes.
12 | 3) Use concise bullets. Link tickets if provided.
13 | 4) Call out risky areas and manual test steps.
14 | 
15 | Output:
16 | 
17 | - Markdown with the sections above.
18 | 
19 | Example input:
20 | NOTES: "Implements ticket ABC-42; refactors date utils."
21 | DIFF STATS: 7 files changed, 120 insertions(+), 40 deletions(-)
22 | 
23 | Expected output:
24 | 
25 | # Summary
26 | 
27 | Implements ABC-42 adding date helpers and refactors callers.
28 | 
29 | # Context
30 | 
31 | Legacy parsing caused DST bugs.
32 | 
33 | # Changes
34 | 
35 | - add `parseUtc()` and `formatTz()`
36 | - update consumers in reports module
37 | 
38 | # Risk
39 | 
40 | Medium; date handling is critical.
41 | 
42 | # Test Plan
43 | 
44 | - unit tests for new helpers
45 | - manual verify report export across timezones
46 | 
47 | # Rollback
48 | 
49 | Revert PR and restore old helpers.
50 | 
51 | # Release Notes
52 | 
53 | Improved timezone handling in reports.
54 | 
55 | Usage: /pr-desc "ABC-42 timezone helpers"
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
1 | # Prototype Feature
2 | 
3 | Trigger: /prototype-feature
4 | 
5 | Purpose: Spin up a standalone prototype in a clean repo before merging into main.
6 | 
7 | ## Steps
8 | 
9 | 1. Create a scratch directory name suggestion and scaffolding commands.
10 | 2. Generate minimal app with only the feature and hardcoded data.
11 | 3. Add E2E test covering the prototype flow.
12 | 4. When validated, list the minimal patches to port back.
13 | 
14 | ## Output format
15 | 
16 | - Scaffold plan and migration notes.
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
1 | # Refactor Suggestions
2 | 
3 | Trigger: /refactor-suggestions
4 | 
5 | Purpose: Propose repo-wide refactoring opportunities after tests exist.
6 | 
7 | ## Steps
8 | 
9 | 1. Map directory structure and large files.
10 | 2. Identify duplication, data clumps, and god objects.
11 | 3. Suggest phased refactors with safety checks and tests.
12 | 
13 | ## Output format
14 | 
15 | - Ranked list with owners and effort estimates.
```

reference-implementation.md
```
1 | # Reference Implementation
2 | 
3 | Trigger: /reference-implementation
4 | 
5 | Purpose: Mimic the style and API of a known working example.
6 | 
7 | ## Steps
8 | 
9 | 1. Accept a path or URL to an example. Extract its public API and patterns.
10 | 2. Map target module’s API to the reference.
11 | 3. Generate diffs that adopt the same structure and naming.
12 | 
13 | ## Output format
14 | 
15 | - Side-by-side API table and patch suggestions.
```

regression-guard.md
```
1 | # Regression Guard
2 | 
3 | Trigger: /regression-guard
4 | 
5 | Purpose: Detect unrelated changes and add tests to prevent regressions.
6 | 
7 | ## Steps
8 | 
9 | 1. Run `git diff --name-status origin/main...HEAD` and highlight unrelated files.
10 | 2. Propose test cases that lock current behavior for touched modules.
11 | 3. Suggest CI checks to block large unrelated diffs.
12 | 
13 | ## Output format
14 | 
15 | - Report with file groups, risk notes, and test additions.
16 | 
17 | ## Notes
18 | 
19 | - Keep proposed tests minimal and focused.
```

release-notes.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Generate human‑readable release notes from recent commits.
2 | 
3 | 1. Gather context by running `git log --pretty='* %s (%h) — %an' --no-merges {{args}}` for the commit log (no merges).
4 | 2. Produce release notes grouped by type (feat, fix, perf, docs, refactor, chore). Include a Highlights section and a full changelog list.
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Generate human‑readable release notes from recent commits.
10 | - Document the evidence you used so maintainers can trust the conclusion.
11 | 
12 | Example Input:
13 | src/example.ts
14 | 
15 | Expected Output:
16 | ## Features
17 | 
18 | - Add SSO login flow (PR #42)
19 | 
20 | ## Fixes
21 | 
22 | - Resolve logout crash (PR #57)
```

reset-strategy.md
```
1 | # Reset Strategy
2 | 
3 | Trigger: /reset-strategy
4 | 
5 | Purpose: Decide when to hard reset and start clean to avoid layered bad diffs.
6 | 
7 | ## Steps
8 | 
9 | 1. Run: `git status -sb` and `git diff --stat` to assess churn.
10 | 2. If many unrelated edits or failing builds, propose: `git reset --hard HEAD` to discard working tree.
11 | 3. Save any valuable snippets to `scratch/` before reset.
12 | 4. Re-implement the minimal correct fix from a clean state.
13 | 
14 | ## Output format
15 | 
16 | - A short decision note and exact commands. Never execute resets automatically.
17 | 
18 | ## Examples
19 | 
20 | - Recommend reset after repeated failing refactors touching 15+ files.
21 | 
22 | ## Notes
23 | 
24 | - Warn about destructive nature. Require user confirmation.
```

review-branch.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Provide a high‑level review of the current branch vs origin/main.
2 | 
3 | 1. Gather context by running `git diff --stat origin/main...HEAD` for the diff stats; running `git diff origin/main...HEAD | sed -n '1,200p'` for the ```diff.
4 | 2. Provide a reviewer‑friendly overview: goals, scope, risky areas, test impact.
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Provide a high‑level review of the current branch vs origin/main.
10 | - Organize details under clear subheadings so contributors can scan quickly.
11 | - Call out test coverage gaps and validation steps.
12 | 
13 | Example Input:
14 | (none – command runs without arguments)
15 | 
16 | Expected Output:
17 | 
18 | - Structured report following the specified sections.
```

review.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Review code matching a pattern and give actionable feedback.
2 | 
3 | 1. Gather context by running `rg -n {{args}} . || grep -RIn {{args}} .` for the search results for {{args}} (filename or regex).
4 | 2. Perform a thorough code review. Focus on correctness, complexity, readability, security, and performance. Provide concrete patch suggestions.
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Review code matching a pattern and give actionable feedback.
10 | - Provide unified diff-style patches when recommending code changes.
11 | - Organize details under clear subheadings so contributors can scan quickly.
12 | 
13 | Example Input:
14 | HttpClient
15 | 
16 | Expected Output:
17 | 
18 | - Usage cluster in src/network/* with note on inconsistent error handling.
```

scaffold-fullstack.md
```
1 | # Scaffold Full‑Stack App
2 | 
3 | **Trigger:** `/scaffold-fullstack <stack>`
4 | 
5 | **Purpose:** Create a minimal, production‑ready monorepo template with app, API, tests, CI seeds, and infra stubs.
6 | 
7 | **Steps:**
8 | 
9 | 1. Read repository context: `git rev-parse --is-inside-work-tree`.
10 | 2. If repo is empty, initialize: `git init -b main` and create `.editorconfig`, `.gitignore`, `README.md`.
11 | 3. For `<stack>` derive presets (examples):
12 |    - `ts-next-express-pg`: Next.js app, Express API, Prisma + PostgreSQL, Playwright, pnpm workspaces.
13 |    - `ts-vite-fastify-sqlite`: Vite + React app, Fastify API, Drizzle + SQLite.
14 | 4. Create workspace layout:
15 |    - root: `package.json` with `pnpm` workspaces, `tsconfig.base.json`, `eslint`, `prettier`.
16 |    - apps/web, apps/api, packages/ui, packages/config.
17 | 5. Add scripts:
18 |    - root: `dev`, `build`, `lint`, `typecheck`, `test`, `e2e`, `format`.
19 |    - web: Next/Vite scripts. api: dev with ts-node or tsx.
20 | 6. Seed CI files: `.github/workflows/ci.yml` with jobs [lint, typecheck, test, build, e2e] and artifact uploads.
21 | 7. Add example routes:
22 |    - web: `/health` page. api: `GET /health` returning `{ ok: true }`.
23 | 8. Write docs to `README.md`: how to run dev, test, build, and env variables.
24 | 9. Stage files, but do not commit. Output a tree and next commands.
25 | 
26 | **Output format:**
27 | 
28 | - Title line: `Scaffold created: <stack>`
29 | - Sections: `Repo Tree`, `Next Steps`, `CI Seeds`.
30 | - Include a fenced code block of the `tree` and sample scripts.
31 | 
32 | **Examples:**
33 | 
34 | - **Input:** `/scaffold-fullstack ts-next-express-pg`
35 |   **Output:** Summary + tree with `apps/web`, `apps/api`, `packages/ui`.
36 | - **Input:** `/scaffold-fullstack ts-vite-fastify-sqlite`
37 |   **Output:** Summary + tree + Drizzle config.
38 | 
39 | **Notes:**
40 | 
41 | - Assume pnpm and Node 20+. Do not run package installs automatically; propose commands instead.
42 | - Respect existing files; avoid overwriting without explicit confirmation.
```

scope-control.md
```
1 | # Scope Control
2 | 
3 | Trigger: /scope-control
4 | 
5 | Purpose: Enforce explicit scope boundaries and maintain "won't do" and "ideas for later" lists.
6 | 
7 | ## Steps
8 | 
9 | 1. Parse `PLAN.md` or create it if absent.
10 | 2. For each open task, confirm linkage to the current milestone.
11 | 3. Detect off-scope items and move them to **Won't do** or **Ideas for later** with rationale.
12 | 4. Add a "Scope Gate" checklist before merging.
13 | 
14 | ## Output format
15 | 
16 | - Patch to `PLAN.md` showing changes in sections and checklists.
17 | 
18 | ## Examples
19 | Input: off-scope request "Add email templates" during OAuth feature.
20 | Output: Move to **Ideas for later** with reason "Not needed for OAuth MVP".
21 | 
22 | ## Notes
23 | 
24 | - Never add new scope without recording tradeoffs.
```

slo-setup.md
```
1 | # SLO Setup
2 | 
3 | **Trigger:** `/slo-setup`
4 | 
5 | **Purpose:** Define Service Level Objectives, burn alerts, and runbooks.
6 | 
7 | **Steps:**
8 | 
9 | 1. Choose SLI/metrics per user journey. Define SLO targets and error budgets.
10 | 2. Create burn alerts (fast/slow) and link to runbooks.
11 | 3. Add `SLO.md` with rationale and review cadence.
12 | 
13 | **Output format:** SLO table and alert rules snippet.
14 | 
15 | **Examples:** `/slo-setup`.
16 | 
17 | **Notes:** Tie SLOs to deploy gates and incident severity.
```

stack-evaluation.md
```
1 | # Stack Evaluation
2 | 
3 | Trigger: /stack-evaluation
4 | 
5 | Purpose: Evaluate language/framework choices relative to AI familiarity and repo goals.
6 | 
7 | ## Steps
8 | 
9 | 1. Detect current stack and conventions.
10 | 2. List tradeoffs: maturity, tooling, available examples, hiring, and AI training coverage.
11 | 3. Recommend stay-or-switch with migration outline if switching.
12 | 
13 | ## Output format
14 | 
15 | - Decision memo with pros/cons and next steps.
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
1 | # Switch Model
2 | 
3 | Trigger: /switch-model
4 | 
5 | Purpose: Decide when to try a different AI backend and how to compare.
6 | 
7 | ## Steps
8 | 
9 | 1. Define task type: frontend codegen, backend reasoning, test writing, refactor.
10 | 2. Select candidate models and temperature/tooling options.
11 | 3. Run a fixed input suite and measure latency, compile success, and edits needed.
12 | 4. Recommend a model per task with rationale.
13 | 
14 | ## Output format
15 | 
16 | - Table: task → model → settings → win reason.
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

ui-screenshots.md
```
1 | # UI Screenshots
2 | 
3 | Trigger: /ui-screenshots
4 | 
5 | Purpose: Analyze screenshots for UI bugs or inspiration and propose actionable UI changes.
6 | 
7 | ## Steps
8 | 
9 | 1. Accept screenshot paths or links.
10 | 2. Describe visual hierarchy, spacing, contrast, and alignment issues.
11 | 3. Output concrete CSS or component changes.
12 | 
13 | ## Output format
14 | 
15 | - Issue list and code snippets to fix visuals.
```

version-control-guide.md
```
1 | # Version Control Guide
2 | 
3 | Trigger: /version-control-guide
4 | 
5 | Purpose: Enforce clean incremental commits and clean-room re-implementation when finalizing.
6 | 
7 | ## Steps
8 | 
9 | 1. Start each feature from a clean branch: `git switch -c <feat>`.
10 | 2. Commit in vertical slices with passing tests: `git add -p && git commit`.
11 | 3. When solution is proven, recreate a minimal clean diff: stash or copy results, reset, then apply only the final changes.
12 | 4. Use `git revert` for bad commits instead of force-pushing shared branches.
13 | 
14 | ## Output format
15 | 
16 | - Checklist plus suggested commands for the current repo state.
17 | 
18 | ## Examples
19 | 
20 | - Convert messy spike into three commits: setup, feature, tests.
21 | 
22 | ## Notes
23 | 
24 | - Never modify remote branches without confirmation.
```

version-proposal.md
```
1 | You are a CLI assistant focused on helping contributors with the task: Propose next version (major/minor/patch) from commit history.
2 | 
3 | 1. Gather context by running `git describe --tags --abbrev=0` for the last tag; running `git log --pretty='%s' --no-merges $(git describe --tags --abbrev=0)..HEAD` for the commits since last tag (no merges).
4 | 2. Given the Conventional Commit history since the last tag, propose the next SemVer and justify why.
5 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
6 | 
7 | Output:
8 | 
9 | - Begin with a concise summary that restates the goal: Propose next version (major/minor/patch) from commit history.
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
1 | # Voice Input
2 | 
3 | Trigger: /voice-input
4 | 
5 | Purpose: Support interaction from voice capture and convert to structured prompts.
6 | 
7 | ## Steps
8 | 
9 | 1. Accept transcript text.
10 | 2. Normalize to tasks or commands for other prompts.
11 | 3. Preserve speaker intents and important entities.
12 | 
13 | ## Output format
14 | 
15 | - Cleaned command list ready to execute.
```

workflow.mmd
```
1 | flowchart TD
2 |     A[planning-process.md] --> B[scope-control.md]
3 |     B --> C[prototype-feature.md]
4 |     C --> D[explain-code.md]
5 |     D --> E[refactor-file.md]
6 |     E --> F[file-modularity.md]
7 |     F --> G[generate.md]
8 |     G --> H[integration-test.md]
9 |     H --> I[coverage-guide.md]
10 |     I --> J[explain-failures.md]
11 |     J --> K[fix.md]
12 |     K --> L[commit.md]
13 |     L --> M[review.md]
14 |     M --> N[review-branch.md]
15 |     N --> O[pr-desc.md]
16 |     O --> P[regression-guard.md]
17 |     P --> Q[release-notes.md]
18 |     Q --> R[version-proposal.md]
19 |     R --> S[devops-automation.md]
20 |     S --> T[reset-strategy.md]
21 |     T --> U[cleanup-branches.md]
22 |     U --> V[design-assets.md]
23 |     V --> W[ui-screenshots.md]
24 |     W --> X[logging-strategy.md]
25 |     X --> Y[error-analysis.md]
26 |     Y --> Z[audit.md]
27 |     Z --> AA[summary.md]
28 |     AA --> AB[instruction-file.md]
29 |     AB --> AC[version-control-guide.md]
30 |     AC --> AD[owners.md]
31 |     AD --> AE[blame-summary.md]
32 |     AE --> AF[changed-files.md]
33 |     AF --> AG[todo-report.md]
34 |     AG --> AH[todos.md]
35 |     AH --> AI[dead-code-scan.md]
36 |     AI --> AJ[grep.md]
37 |     AJ --> AK[explain-symbol.md]
38 |     AK --> AL[api-usage.md]
39 |     AL --> AM[action-diagram.md]
40 |     AM --> AN[plan.md]
41 |     AN --> AO[tsconfig-review.md]
42 |     AO --> AP[eslint-review.md]
43 |     AP --> AQ[stack-evaluation.md]
44 |     AQ --> AR[modular-architecture.md]
45 |     AR --> AS[refactor-suggestions.md]
46 |     AS --> AT[reference-implementation.md]
47 |     AT --> AU[model-strengths.md]
48 |     AU --> AV[model-evaluation.md]
49 |     AV --> AW[compare-outputs.md]
50 |     AW --> AX[switch-model.md]
51 |     AX --> AY[voice-input.md]
52 |     AY --> AZ[content-generation.md]
53 |     AZ --> BA[api-docs-local.md]
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
5 |   "migrationNoticeShown": false
6 | }
```

docs/AGENTS.md
```
1 | # Repository Guidelines
2 | 
3 | ## Project Structure & Module Organization
4 | All contributor-facing prompts live at the repository root as `.md` files. Files that declare a `Trigger:` expose direct Codex slash commands, while front-matter templates (with `---` blocks) plug into the shared `/gemini-map` workflow. Supporting assets reside in `codefetch/` (reference snippets) and `workflow.mmd` (Mermaid source for the end-to-end flow shown in `README.md`). Keep new prompts co-located with peers and reference them from `README.md` when they add net-new functionality.
5 | 
6 | ## Build, Test, and Development Commands
7 | The project is docs-only, so there is no build pipeline. Validate Markdown locally with `npx markdownlint-cli2 "**/*.md"` to honor the styles defined in `.markdownlint.json`. When editing prompts that issue shell commands, dry-run them with `bash -lc '<command>'` inside the Codex CLI to confirm arguments and paths resolve correctly.
8 | 
9 | ## Coding Style & Naming Conventions
10 | Write prompts in Markdown with ATX headings, 80–100 character lines, and ASCII characters unless the template already requires otherwise. For `/gemini-map` templates, mirror the existing front matter keys (`name`, `command`, `tags`, `scope`). Use imperative voice for numbered steps and bold the callouts that users should copy verbatim. New files should follow the lowercase-hyphenated naming pattern (e.g., `new-helper.md`).
11 | 
12 | ## Testing Guidelines
13 | Each prompt should explain a deterministic validation path. Include concrete command snippets (such as `rg -n "TODO" .`) so agents can verify results. After authoring changes, run `codex prompt run <file>` (or invoke the slash command directly) to ensure the prompt executes without missing context or syntax errors. Aim to cover both success and failure handling in the numbered steps.
14 | 
15 | ## Commit & Pull Request Guidelines
16 | Commits should read as imperative sentences ("Add scope control checklist") and focus on a single prompt or documentation area. Reference `/commit` to auto-generate an initial message, then edit for clarity. Pull requests must summarize the changes, list affected prompts, note verification steps (e.g., `markdownlint` and prompt dry-runs), and link to any relevant follow-up issues. Include screenshots or copied terminal output when updating Mermaid flows or command transcripts.
17 | 
18 | ## Agent Workflow Reminders
19 | Cross-link new prompts from `README.md` tables and, if relevant, extend the Mermaid flow to depict the new step. When deprecating a prompt, update its entry with a "Deprecated" note rather than deleting it outright so downstream agents can migrate gracefully.
```

docs/WORKFLOW.mmd
```
1 | flowchart TD
2 |     A["Preflight Docs (§A) AGENTS"] -->|DocFetchReport OK| B[/planning-process/]
3 |     B --> C[/scope-control/]
4 |     C --> D[/stack-evaluation/]
5 |     D --> E[/scaffold-fullstack/]
6 |     E --> F[/api-contract/]
7 |     F --> G[/openapi-generate/]
8 |     G --> H[/modular-architecture/]
9 |     H --> I[/db-bootstrap/]
10 |     I --> J[/migration-plan/]
11 |     J --> K[/auth-scaffold/]
12 |     K --> L[/e2e-runner-setup/]
13 |     L --> M[/integration-test/]
14 |     M --> N[/coverage-guide/]
15 |     N --> O[/regression-guard/]
16 |     O --> P[/version-control-guide/]
17 |     P --> Q[/devops-automation/]
18 |     Q --> R[/env-setup/]
19 |     R --> S[/secrets-manager-setup/]
20 |     S --> T[/iac-bootstrap/]
21 |     T --> U[/owners/]
22 |     U --> V[/review/]
23 |     V --> W[/review-branch/]
24 |     W --> X[/pr-desc/]
25 |     X --> Y{Gates}
26 |     Y -->|Scope Gate pass| Z1[proceed]
27 |     Y -->|Test Gate pass| Z2[proceed]
28 |     Y -->|Review Gate pass| Z3[proceed]
29 |     Z3 --> AA[/release-notes/]
30 |     AA --> AB[/version-proposal/]
31 |     AB --> AC{Release Gate}
32 |     AC -->|pass| AD[Deploy Staging]
33 |     AD --> AE[Canary + Health]
34 |     AE -->|ok| AF[Deploy Prod]
35 |     AE -->|fail| AR[Rollback]
36 |     AF --> AG[/monitoring-setup/]
37 |     AG --> AH[/slo-setup/]
38 |     AH --> AI[/logging-strategy/]
39 |     AI --> AJ[/error-analysis/]
40 |     AJ --> AK[/fix/]
41 |     AK --> AL[/refactor-suggestions/]
42 |     AL --> AM[/file-modularity/]
43 |     AM --> AN[/dead-code-scan/]
44 |     AN --> AO[/cleanup-branches/]
45 |     AF --> AP[/feature-flags/]
46 |     AF --> AQ[/model-strengths/]
47 |     AQ --> AR2[/model-evaluation/]
48 |     AR2 --> AS[/compare-outputs/]
49 |     AS --> AT[/switch-model/]
```

docs/fromScratch-Workflow.md
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
35 | ### P0 Preflight Docs (Blocking)
36 | 
37 | - **Purpose**: Enforce docs-first policy and record DocFetchReport.&#x20;
38 | - **Inputs**: Empty repo, tool access.
39 | - **Steps**: Run Preflight Latest Docs. Record approved instructions and packs. Stop if status≠OK.&#x20;
40 | - **Gate Criteria**: DocFetchReport.status==OK.
41 | - **Outputs**: DocFetchReport JSON.
42 | - **Risks**: Missing docs.
43 | - **Owners**: Planner.
44 | 
45 | ### P1 Plan & Scope
46 | 
47 | - **Purpose**: Lock scope and acceptance.
48 | - **Steps**: `/planning-process "<app one-line>"` → draft plan. `/scope-control` → In/Out, Won’t do. `/stack-evaluation` → pick stack.&#x20;
49 | - **Gate**: Scope Gate passed.
50 | - **Outputs**: PLAN.md, scope table.
51 | - **Owners**: Planner.
52 | 
53 | ### P2 App Scaffold & Contracts
54 | 
55 | - **Purpose**: Create minimal working app.
56 | - **Steps**:
57 | 
58 |   - `/scaffold-fullstack <stack>` → create repo, packages, app, api, infra stubs. **(new)**
59 |   - `/api-contract` or `/openapi-generate` → draft API spec. **(new)**
60 |   - `/modular-architecture` → boundaries. `/reference-implementation` if copying style.&#x20;
61 | - **Gate**: Test Gate lite = build runs, lint clean.
62 | - **Outputs**: repo tree, OpenAPI/SDL.
63 | - **Owners**: Full-stack dev.
64 | 
65 | ### P3 Data & Auth
66 | 
67 | - **Purpose**: Persistence and identity.
68 | - **Steps**: `/db-bootstrap <db>` → schema, migrations, seeds. **(new)**
69 |   `/auth-scaffold <oauth|email>` → flows + threat model. **(new)**
70 |   `/migration-plan` → up/down scripts. **(new)**
71 | - **Gate**: Migration dry-run ok. Threat checklist done.
72 | - **Outputs**: migrations, seed script, auth routes.
73 | - **Owners**: API dev, Security.
74 | 
75 | ### P4 Frontend UX
76 | 
77 | - **Purpose**: Routes and components.
78 | - **Steps**: `/modular-architecture` (UI), `/ui-screenshots` for reviews, `/design-assets` for favicon/brand, `/logging-strategy` client events.&#x20;
79 | - **Gate**: Accessibility checks queued.
80 | - **Outputs**: Screens, states, assets.
81 | - **Owners**: Frontend.
82 | 
83 | ### P5 Quality Gates & Tests
84 | 
85 | - **Purpose**: E2E-first coverage.
86 | - **Steps**: `/e2e-runner-setup <playwright|cypress>` **(new)** → runner + fixtures.
87 |   `/integration-test` → happy path E2E. `/coverage-guide` → target areas. `/regression-guard` → unrelated drift.&#x20;
88 | - **Gate**: Test Gate = E2E happy path green.
89 | - **Outputs**: E2E suite, coverage plan.
90 | - **Owners**: QA.
91 | 
92 | ### P6 CI/CD & Env
93 | 
94 | - **Purpose**: Reproducible pipeline and environments.
95 | - **Steps**: `/version-control-guide` → commit rules. `/devops-automation` → CI, DNS, SSL, deploy. `/env-setup` + `/secrets-manager-setup` **(new)**. `/iac-bootstrap` **(new)**.&#x20;
96 | - **Gate**: Review Gate = CI green, approvals, no unrelated churn.
97 | - **Outputs**: CI config, IaC, secret store wiring.
98 | - **Owners**: DevOps.
99 | 
100 | ### P7 Release & Ops
101 | 
102 | - **Purpose**: Ship safely.
103 | - **Steps**: `/pr-desc`, `/owners`, `/review`, `/review-branch`, `/release-notes`, `/version-proposal`. `/monitoring-setup` + `/slo-setup` **(new)**. `/logging-strategy` server. `/audit` security/hygiene.&#x20;
104 | - **Gate**: Release Gate = canary ok, rollback tested.
105 | - **Outputs**: Release notes, dashboards, runbooks.
106 | - **Owners**: Dev, DevOps, SRE.
107 | 
108 | ### P8 Post-release Hardening
109 | 
110 | - **Purpose**: Stability and cleanup.
111 | - **Steps**: `/error-analysis`, `/fix`, `/refactor-suggestions`, `/file-modularity`, `/dead-code-scan`, `/cleanup-branches`. `/feature-flags` **(new)**.&#x20;
112 | - **Gate**: All Sev-1 fixed.
113 | - **Outputs**: Clean diff, flags in place.
114 | - **Owners**: Dev.
115 | 
116 | ### P9 Model Tactics (cross-cutting)
117 | 
118 | - **Purpose**: Optimize prompting/model choice.
119 | - **Steps**: `/model-strengths`, `/model-evaluation`, `/compare-outputs`, `/switch-model`.&#x20;
120 | - **Gate**: Model delta improves QoS.
121 | - **Owners**: Planner.
122 | 
123 | ## 6) Dev Loop Rules
124 | 
125 | Commit small. One concern per PR. Use clean-room finalize if diff grows. Reset when E2E red for >60m or design drift detected. Enforce branch policy via `/version-control-guide`.&#x20;
126 | 
127 | ## 7) Test Strategy
128 | 
129 | E2E first. Happy path before edge cases. Regression guards on changed areas and critical paths. Coverage targets: lines 80%, branches 60%, critical modules 90%. Use `/integration-test`, `/coverage-guide`, `/regression-guard`.&#x20;
130 | 
131 | ## 8) CI/CD Plan
132 | 
133 | Jobs: lint, typecheck, unit, build, e2e, package, deploy. Artifacts: build outputs, test logs, coverage, SBOM. Envs: preview, staging, prod. Rollback: pinned version + IaC plan. Use `/devops-automation` and `/iac-bootstrap`.&#x20;
134 | 
135 | ## 9) Observability & Logging Plan
136 | 
137 | Structured logs, metrics, traces. Dashboards by domain. Alerts on SLO burn. Client and server logging strategies via `/logging-strategy`.&#x20;
138 | 
139 | ## 10) Risk Register & Mitigations
140 | 
141 | Scope creep → Scope Gate. Flaky E2E → isolate and retry matrix. Secrets leakage → secrets manager, scans. Infra drift → IaC. Auth gaps → threat model.&#x20;
142 | 
143 | ## 11) Evidence Log
144 | 
145 | - Command catalog and flows: README table and Mermaid.&#x20;
146 | - Baseline precedence, Preflight, DocFetchReport, gates: AGENTS baseline.&#x20;
147 | 
148 | ## 12) Release Notes Checklist
149 | 
150 | Scope summary, changes by area, migration steps, breaking changes, version bump, commit range, contributors, links to dashboards. Use `/release-notes` and `/version-proposal`.&#x20;
151 | 
152 | ---
153 | 
154 | ### Missing prompts needed
155 | 
156 | - `/scaffold-fullstack` — generate repo, workspace, app, api, tests, CI seeds.
157 | - `/api-contract` — author initial OpenAPI/GraphQL contract from requirements.
158 | - `/openapi-generate` — codegen server and client from OpenAPI.
159 | - `/db-bootstrap` — pick DB, init migrations, local compose, seed scripts.
160 | - `/migration-plan` — write up/down plans with safety checks.
161 | - `/auth-scaffold` — OAuth/OIDC/email templates, routes, threat model.
162 | - `/e2e-runner-setup` — Playwright/Cypress config, fixtures, data sandbox.
163 | - `/env-setup` — `.env.example`, schema validation, per-env overrides.
164 | - `/secrets-manager-setup` — provision secret store, map app vars.
165 | - `/iac-bootstrap` — minimal IaC for chosen cloud, state, pipelines.
166 | - `/monitoring-setup` — logs/metrics/traces bootstrap.
167 | - `/slo-setup` — SLOs, alerts, dashboards.
168 | - `/feature-flags` — flag provider, SDK wiring, guardrails.
169 |   These integrate with existing commands and respect AGENTS gating.
170 | 
171 | ---
172 | 
173 | ## workflow\.mmd
174 | 
175 | ```mermaid
176 | flowchart TD
177 |   A["Preflight Docs (§A) AGENTS"] -->|DocFetchReport OK| B[/planning-process/]
178 |   B --> C[/scope-control/]
179 |   C --> D[/stack-evaluation/]
180 |   D --> E[/scaffold-fullstack/]
181 |   E --> F[/api-contract/]
182 |   F --> G[/openapi-generate/]
183 |   G --> H[/modular-architecture/]
184 |   H --> I[/db-bootstrap/]
185 |   I --> J[/migration-plan/]
186 |   J --> K[/auth-scaffold/]
187 |   K --> L[/e2e-runner-setup/]
188 |   L --> M[/integration-test/]
189 |   M --> N[/coverage-guide/]
190 |   N --> O[/regression-guard/]
191 |   O --> P[/version-control-guide/]
192 |   P --> Q[/devops-automation/]
193 |   Q --> R[/env-setup/]
194 |   R --> S[/secrets-manager-setup/]
195 |   S --> T[/iac-bootstrap/]
196 |   T --> U[/owners/]
197 |   U --> V[/review/]
198 |   V --> W[/review-branch/]
199 |   W --> X[/pr-desc/]
200 |   X --> Y{Gates}
201 |   Y -->|Scope Gate pass| Z1[proceed]
202 |   Y -->|Test Gate pass| Z2[proceed]
203 |   Y -->|Review Gate pass| Z3[proceed]
204 |   Z3 --> AA[/release-notes/]
205 |   AA --> AB[/version-proposal/]
206 |   AB --> AC{Release Gate}
207 |   AC -->|pass| AD[Deploy Staging]
208 |   AD --> AE[Canary + Health]
209 |   AE -->|ok| AF[Deploy Prod]
210 |   AE -->|fail| AR[Rollback]
211 |   AF --> AG[/monitoring-setup/]
212 |   AG --> AH[/slo-setup/]
213 |   AH --> AI[/logging-strategy/]
214 |   AI --> AJ[/error-analysis/]
215 |   AJ --> AK[/fix/]
216 |   AK --> AL[/refactor-suggestions/]
217 |   AL --> AM[/file-modularity/]
218 |   AM --> AN[/dead-code-scan/]
219 |   AN --> AO[/cleanup-branches/]
220 |   AF --> AP[/feature-flags/]
221 |   AF --> AQ[/model-strengths/]
222 |   AQ --> AR2[/model-evaluation/]
223 |   AR2 --> AS[/compare-outputs/]
224 |   AS --> AT[/switch-model/]
225 | ```
226 | 
227 | ---
228 | 
229 | # Nodes & Edges list
230 | 
231 | **Nodes**: Preflight, planning-process, scope-control, stack-evaluation, scaffold-fullstack, api-contract, openapi-generate, modular-architecture, db-bootstrap, migration-plan, auth-scaffold, e2e-runner-setup, integration-test, coverage-guide, regression-guard, version-control-guide, devops-automation, env-setup, secrets-manager-setup, iac-bootstrap, owners, review, review-branch, pr-desc, Gates, release-notes, version-proposal, Deploy Staging, Canary + Health, Deploy Prod, Rollback, monitoring-setup, slo-setup, logging-strategy, error-analysis, fix, refactor-suggestions, file-modularity, dead-code-scan, cleanup-branches, feature-flags, model-strengths, model-evaluation, compare-outputs, switch-model.
232 | **Edges**: Preflight→planning-process→scope-control→stack-evaluation→scaffold-fullstack→api-contract→openapi-generate→modular-architecture→db-bootstrap→migration-plan→auth-scaffold→e2e-runner-setup→integration-test→coverage-guide→regression-guard→version-control-guide→devops-automation→env-setup→secrets-manager-setup→iac-bootstrap→owners→review→review-branch→pr-desc→Gates→release-notes→version-proposal→Deploy Staging→Canary + Health→Deploy Prod→monitoring-setup→slo-setup→logging-strategy→error-analysis→fix→refactor-suggestions→file-modularity→dead-code-scan→cleanup-branches and Deploy Prod→feature-flags and model-strengths→model-evaluation→compare-outputs→switch-model; Canary + Health→Rollback on fail.
233 | 
234 | ---
235 | 
236 | # Gate checklists
237 | 
238 | ## Scope Gate
239 | 
240 | - Problem, users, Done criteria defined.
241 | - In/Out lists and Won’t do recorded.
242 | - Stack chosen and risks listed.
243 |   Evidence: `/planning-process`, `/scope-control`, `/stack-evaluation`.&#x20;
244 | 
245 | ## Test Gate
246 | 
247 | - E2E happy path green locally and in CI.
248 | - No unrelated file churn.
249 | - Regression guards added for changed modules.
250 |   Evidence: `/integration-test`, `/regression-guard`.&#x20;
251 | 
252 | ## Review Gate
253 | 
254 | - Clean diff per `/version-control-guide`.
255 | - PR reviewed via `/review` and `/review-branch`.
256 | - Owners assigned and approvals met.&#x20;
257 | 
258 | ## Release Gate
259 | 
260 | - Staging deploy passes checks.
261 | - Canary health metrics stable.
262 | - Rollback rehearsed and documented.
263 |   Evidence: `/devops-automation`, IaC, monitoring setup.&#x20;
264 | 
265 | ---
266 | 
267 | ## Reset Playbook
268 | 
269 | **When**: E2E red >60m, diff noisy, plan drift, large rebase pain, conflicting designs.
270 | **Command path**: `/reset-strategy` → propose clean slice. Create new branch from main, cherry-pick minimal commits, re-run Gate sequence.&#x20;
271 | **Data-loss warning**: Uncommitted local changes will be dropped if hard reset. Stash before reset.
272 | 
273 | ---
274 | 
275 | ## Model Eval Block
276 | 
277 | **When**: Contentious generation, flaky refactors, new model availability.
278 | **Steps**: `/model-strengths` → route candidates. `/model-evaluation` → baseline vs new. `/compare-outputs` → pick best. `/switch-model` → roll change with guardrails. Success = higher test pass rate or smaller diff with same tests.&#x20;
279 | 
280 | ---
281 | 
282 | **Notes**
283 | 
284 | - Baseline precedence and Preflight come from AGENTS baseline. Prompts are manual. No auto-invoke.&#x20;
285 | - Command catalog and many building blocks exist already; this plan wires them into a complete “from scratch” path and lists required new prompts.&#x20;
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
