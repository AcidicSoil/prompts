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
356 | - Seed/Update the knowledge graph **before** exiting the task so subsequent sessions can leverage it.
357 | 
358 | - Do **NOT** write to `AGENTS.md` beyond these standing instructions.
359 | 
360 | ### 2.1) Post-completion checks and tests (**REVISED — Run-then-verify**)
361 | 
362 | - **Order of operations:**
363 |   a) Append subtask completion logs to **memory** (§1.2).
364 |   b) Set task status to **`verify`** (new intermediate state).
365 |   c) Evaluate the **Safety Gate** per **§8 Environment & Testing Policy**.
366 |   d) If **safe**, run **stateless checks automatically** (see §8 Allowed Automatic Checks).
367 |   e) If **unsafe**, **defer** execution and emit a **Local Test Instructions** block for the user.
368 | 
369 | - **Recording:** Write outcomes to `task:${task_id}.observations.test_results` and also set:
370 | 
371 |   - `tests_deferred: true|false`
372 |   - `tests_deferred_reason: <string|null>`
373 |   - `test_log_path: artifacts/test/<UTC-timestamp>.log` when any checks are executed.
374 | 
375 | - **Status transitions:**
376 | 
377 |   - On all checks passing → set status **`done`**.
378 |   - On failures → set status **`blocked`** and record an unblock plan.
379 |   - On deferral → set status **`needs-local-tests`** and include the instructions block.
380 | 
381 | - **Local Test Instructions (example, Proposed — not executed):**
382 | 
383 | ```bash
384 | # Proposed Local Test Instructions — copy/paste locally
385 | # Reason: Safety Gate triggered deferral (e.g., venv detected, risk of global mutation, or OS mismatch)
386 | 
387 | # TypeScript/Node (stateless checks)
388 | npm run typecheck --silent || exit 1
389 | npm run lint --silent || exit 1
390 | npm run -s build --dry-run || exit 1
391 | 
392 | # Python (use uv; do NOT activate any existing venv)
393 | # Pure unit tests only; no network, no DB, no writes outside ./artifacts
394 | uv run -q python -c "import sys; sys.exit(0)" || exit 1
395 | uv run -q ruff check . || exit 1
396 | uv run -q pyright || exit 1
397 | uv run -q pytest -q tests/unit -k "not integration" || exit 1
398 | 
399 | # Expected: exit code 0 on success; non-zero indicates failures to review.
400 | ```
401 | 
402 | ---
403 | 
404 | ## 3) Status management (**REVISED**)
405 | 
406 | - Use Task Master MCP to set task status:
407 | 
408 |   - **`in-progress`** on start of execution after §A and §1.1 planning.
409 |   - **`verify`** automatically after memory updates and before tests (§2.1).
410 |   - **Auto-set `done`** when all subtasks are done, gates passed, and §2.1 checks succeed.
411 |   - **`needs-local-tests`** when §2.1 defers execution via the Safety Gate.
412 |   - **`blocked`** when a check fails or a gate prevents progress; include block reason and an unblock plan in memory.
413 | 
414 | - **Transition rules:**
415 |   `in-progress → verify → done` on success.
416 |   `verify → blocked` on check failure.
417 |   `verify → needs-local-tests` on deferral.
418 | 
419 | ---
420 | 
421 | ## 4) Tagging for retrieval
422 | 
423 | - Use tags: `${PROJECT_TAG}`, `project:${PROJECT_TAG}`, `memory_checkpoint`, `completion`, `agents`, `routine`, `instructions`, plus task-specific tags.
424 | - For memory entities/relations, mirror tags on observations (e.g., `graph`, `entity:task:${task_id}`, `file:<path>`), to ease cross-referencing with memory.
425 | 
426 | ---
427 | 
428 | ## 5) Handling user requests for code or docs
429 | 
430 | - When a task or a user requires **code**, **setup/config**, or **library/API documentation**:
431 | 
432 |   - **MUST** run the **Preflight** (§A) using the consolidated order (**contex7-mcp → gitmcp**).
433 |   - Only proceed to produce diffs or create files after `DocFetchReport.status == "OK"`.
434 | 
435 | ---
436 | 
437 | ## 6) Project tech stack specifics (generic)
438 | 
439 | - Apply §A Preflight for the **current** stack and language(s).
440 | - Prefer official documentation and repositories resolved in §A.1.
441 | - If coverage is weak after **contex7-mcp → gitmcp**, fall back to targeted web search and record gaps.
442 | 
443 | ---
444 | 
445 | ## 6.1) Layered Execution Guides (**NEW**)
446 | 
447 | Each layer defines role, task, context, reasoning, output format, and stop conditions. Use these blocks when planning and reviewing work in that layer.
448 | 
449 | ### Client/UI Layer — Frontend Engineer, UI Engineer, UX Designer
450 | 
451 | 1. **Role**
452 | 
453 |    - Own user-facing components and flows.
454 | 2. **Task**
455 | 
456 |    - Draft routes and components. Specify Tailwind classes and responsive breakpoints. Define accessibility and keyboard flows. List loading, empty, and error states. Map data needs to hooks. Set performance budgets.
457 | 3. **Context**
458 | 
459 |    - Next.js app router. Tailwind. shadcn/ui allowed. Target Core Web Vitals good. WCAG 2.2 AA.
460 | 4. **Reasoning**
461 | 
462 |    - Prefer server components for data. Client components only for interactivity. Avoid prop drilling. Use context only for shared UI state. Minimize re-renders. Defer non-critical JS.
463 | 5. **Output format**
464 | 
465 |    - Markdown table: Route | Component | Type (server|client) | States | Data source | Notes.
466 | 6. **Stop conditions**
467 | 
468 |    - Any route lacks explicit states. Missing keyboard flow. CLS or LCP budget undefined. Unmapped data dependency.
469 | 
470 | ### Build & Tooling Layer — Frontend Build Engineer, Tooling Engineer, DevOps Engineer
471 | 
472 | 1. **Role**
473 | 
474 |    - Maintain fast, reproducible builds and CI.
475 | 2. **Task**
476 | 
477 |    - Define bundler settings, lint, format, typecheck, unit test, and build steps. Configure CI matrix and caching. Enforce pre-commit hooks.
478 | 3. **Context**
479 | 
480 |    - Turbopack or Vite. ESLint. Prettier. Vitest. Node LTS.
481 | 4. **Reasoning**
482 | 
483 |    - Fail fast. Cache effectively. Keep steps isolated and deterministic. No network during tests unless mocked.
484 | 5. **Output format**
485 | 
486 |    - Checklist with commands, CI job matrix, cache keys, and expected durations.
487 | 6. **Stop conditions**
488 | 
489 |    - Non-deterministic builds. Unpinned tool versions. CI steps mutate global state. Missing cache strategy.
490 | 
491 | ### Language & Type Layer — Software Engineer, TypeScript/JavaScript Specialist
492 | 
493 | 1. **Role**
494 | 
495 |    - Enforce language rules and type safety.
496 | 2. **Task**
497 | 
498 |    - Set `tsconfig` targets. Define strict compiler flags. Establish type patterns and utilities. Require JSDoc where types are complex.
499 | 3. **Context**
500 | 
501 |    - TypeScript strict mode. ESM. Node and browser targets as needed.
502 | 4. **Reasoning**
503 | 
504 |    - Prefer explicit types. Use generics judiciously. Model nullability. Narrow unions at boundaries.
505 | 5. **Output format**
506 | 
507 |    - `tsconfig` fragment, lint rules list, and target type coverage goals by package.
508 | 6. **Stop conditions**
509 | 
510 |    - `any` or `unknown` leaks to public APIs. Implicit `any` enabled. Type coverage goals undefined.
511 | 
512 | ### State & Data Layer — Frontend Engineer, State Management Specialist, Full-Stack Engineer
513 | 
514 | 1. **Role**
515 | 
516 |    - Control state lifecycles and data fetching.
517 | 2. **Task**
518 | 
519 |    - Choose client vs server state. Define stores, selectors, and cache policy. Specify invalidation and suspense boundaries.
520 | 3. **Context**
521 | 
522 |    - React state, context, or a store. Fetch via RSC or client hooks. Cache with SWR or equivalent.
523 | 4. **Reasoning**
524 | 
525 |    - Server fetch by default. Co-locate state with consumers. Keep derived state computed. Normalize entities.
526 | 5. **Output format**
527 | 
528 |    - State inventory table: State | Scope | Source | Lifetime | Invalidation | Consumers.
529 | 6. **Stop conditions**
530 | 
531 |    - Duplicate sources of truth. Unbounded caches. Missing invalidation plan. Server-client mismatch.
532 | 
533 | ### API/Backend Layer — Backend Engineer, API Developer, Full-Stack Engineer
534 | 
535 | 1. **Role**
536 | 
537 |    - Provide stable contracts for data and actions.
538 | 2. **Task**
539 | 
540 |    - Define endpoints or schema. Specify auth, pagination, filtering, errors, and idempotency. Version contracts.
541 | 3. **Context**
542 | 
543 |    - REST or GraphQL. JSON. OpenAPI or SDL.
544 | 4. **Reasoning**
545 | 
546 |    - Design for evolution. Prefer standard status codes. Use cursor pagination. Return problem details.
547 | 5. **Output format**
548 | 
549 |    - OpenAPI snippet or GraphQL SDL. Error model table and example requests.
550 | 6. **Stop conditions**
551 | 
552 |    - Breaking change without versioning. Inconsistent pagination. Ambiguous error semantics. Missing auth notes.
553 | 
554 | ### Database & Persistence Layer — Database Engineer, Data Engineer, Backend Engineer
555 | 
556 | 1. **Role**
557 | 
558 |    - Safeguard data correctness and performance.
559 | 2. **Task**
560 | 
561 |    - Model schema. Choose indexes. Define migrations and retention. Set transaction boundaries.
562 | 3. **Context**
563 | 
564 |    - SQL or NoSQL. Managed service or local. Migration tool required.
565 | 4. **Reasoning**
566 | 
567 |    - Normalize until it hurts then denormalize where measured. Prefer declarative migrations. Use constraints.
568 | 5. **Output format**
569 | 
570 |    - Schema diagram or DDL. Migration plan with up and down steps. Index plan with rationale.
571 | 6. **Stop conditions**
572 | 
573 |    - Missing primary keys. Unsafe destructive migration. No rollback path. Unbounded growth.
574 | 
575 | ### Deployment & Hosting Layer — DevOps Engineer, Cloud Engineer, Platform Engineer
576 | 
577 | 1. **Role**
578 | 
579 |    - Ship safely and reversibly.
580 | 2. **Task**
581 | 
582 |    - Define environments, build artifacts, release gates, and rollout strategy. Set rollback procedures.
583 | 3. **Context**
584 | 
585 |    - IaC preferred. Blue/green or canary. Artifact registry. Secrets manager.
586 | 4. **Reasoning**
587 | 
588 |    - Immutable artifacts. Promote by provenance. Automate checks before traffic shift.
589 | 5. **Output format**
590 | 
591 |    - Release plan: envs, gates, rollout, rollback steps, and metrics to watch.
592 | 6. **Stop conditions**
593 | 
594 |    - Manual pet deployments. No rollback tested. Secrets in env without manager. Drift from IaC.
595 | 
596 | ### Observability & Ops Layer — Site Reliability Engineer, DevOps Engineer, Monitoring Specialist
597 | 
598 | 1. **Role**
599 | 
600 |    - Ensure reliability and rapid diagnosis.
601 | 2. **Task**
602 | 
603 |    - Define logs, metrics, traces, dashboards, SLOs, and alerts. Set runbooks.
604 | 3. **Context**
605 | 
606 |    - Centralized logging. Metrics store. Tracing. On-call rotation.
607 | 4. **Reasoning**
608 | 
609 |    - Measure user impact first. Alert on symptoms not causes. Keep noise low.
610 | 5. **Output format**
611 | 
612 |    - SLO doc. Alert rules list. Dashboard inventory with owners.
613 | 6. **Stop conditions**
614 | 
615 |    - No SLOs. Alerts without ownership. Missing runbooks. High alert noise.
616 | 
617 | ### Security & Auth Layer — Security Engineer, Identity and Access Management Engineer, DevOps with Security Focus
618 | 
619 | 1. **Role**
620 | 
621 |    - Protect assets and identities.
622 | 2. **Task**
623 | 
624 |    - Define authN and authZ flows. Manage secrets. Apply threat modeling and controls.
625 | 3. **Context**
626 | 
627 |    - OAuth or OIDC. Role based access. Secret store.
628 | 4. **Reasoning**
629 | 
630 |    - Least privilege. Rotate secrets. Validate all inputs. Log security events.
631 | 5. **Output format**
632 | 
633 |    - Auth flow diagram. Permission matrix. Threat model checklist.
634 | 6. **Stop conditions**
635 | 
636 |    - Hardcoded secrets. Missing MFA for admin. Broad tokens. Unvalidated input at boundaries.
637 | 
638 | ---
639 | 
640 | ## 7) Library docs retrieval (topic-focused)
641 | 
642 | - Use **contex7-mcp** first to fetch current docs before code changes.
643 | - UI components: call shadcn-ui-mcp-server to retrieve component recipes and scaffolds before writing code; then generate. Log under DocFetchReport.tools\_called\[].
644 | - If **contex7-mcp** fails, use **gitmcp** (repo docs/source) to retrieve equivalents.
645 | - Summarize key guidance inline in `DocFetchReport.key_guidance` and map each planned change to a guidance line.
646 | - Always note in the task preamble that docs were fetched and which topics/IDs were used.
647 | 
648 | ### Dynamic Docs MCP Router (generic, no hard-coding)
649 | 
650 | **Goal:** Use any configured `*-docs-mcp` server dynamically as primary or fallback.
651 | 
652 | **Discovery**
653 | 
654 | - Query the MCP client for active servers. Filter names matching `/\-docs\-mcp$/i`.
655 | - Record the set as `DocsServers[]` in `DocFetchReport.server_inventory`.
656 | 
657 | **Ranking (per question)**
658 | 
659 | 1. Token match: prefer servers whose **display name or label** appears in the question
660 |    (e.g., “pydantic”, “vite”, “mastra”, “devin”, “mintlify”, “e2b”).
661 | 2. Source match: call `list_doc_sources` on candidates; boost servers whose URLs’ host/path
662 |    contain query tokens.
663 | 3. Specific term: if the question contains “langgraph”, prefer `langgraph-docs-mcp` **if present**.
664 | 4. Tie-break: stable alphabetical by server name.
665 | 
666 | **Primary / Fallback selection**
667 | 
668 | - Default: primary = top-ranked from `DocsServers`. Fallbacks = remaining in rank order.
669 | - Override via inline tags in the user message or internal planner notes:
670 | 
671 |   - `[primary:<server-name>]` to force a primary.
672 |   - `[fallback:+<server-name>]` to append extra fallbacks.
673 |   - Multiple `fallback:+...` allowed. Unknown names are ignored.
674 | - Final chain always appends non-docs providers already defined in this file:
675 |   `… → contex7-mcp → gitmcp`.
676 | 
677 | **Retrieval loop (stop when coverage is sufficient)**
678 | For each server in the chain:
679 | 
680 | 1. `list_doc_sources` → collect available `llms.txt` refs and topic URLs.
681 | 2. Reflect on the question and sources; pick relevant URLs.
682 | 3. `fetch_docs` on selected URLs.
683 | 4. Synthesize guidance; if remaining gaps exist, continue to next server.
684 | 
685 | **Recording (required)**
686 | 
687 | - Append to `DocFetchReport.tools_called[]` for every call with:
688 |   `{server, tool, query_or_url, time_utc}`.
689 | - Save chosen `primary`, evaluated `fallbacks[]`, and `coverage` summary.
690 | - If all providers fail, return **Docs Missing** with attempted servers and errors.
691 | 
692 | **Example prompts (not hard-coded)**
693 | 
694 | - “For ANY question about a library/tool, route to the best `*-docs-mcp` dynamically.”
695 | - “If `[primary:vite-docs-mcp]` is present, start with that server.”
696 | - “If `[fallback:+e2b-docs-mcp]` is present, add it before `contex7-mcp`.”
697 | 
698 | **Safety**
699 | 
700 | - Do not finalize answers that depend on docs until `DocFetchReport.status == "OK"` (§B).
701 | 
702 | ---
703 | 
704 | ## 8) Environment & Testing Policy (**REVISED: Safety Gate for automatic stateless checks**)
705 | 
706 | **Objective:** Allow **automatic stateless checks** post-completion when safe, while preventing environment drift or global mutations. Keep heavier or stateful tests **opt-in**.
707 | 
708 | **Safety Gate checklist (used by §2.1 step c):**
709 | 
710 | 1. **Execution scope** is read-only or hermetic.
711 | 2. **No environment activation** of existing shells or venvs.
712 | 3. **No network** access unless explicitly approved.
713 | 4. **No global writes** or package installs; all outputs limited to `./artifacts/`.
714 | 5. **Command review** shows only stateless operations.
715 | 
716 | **Allowed Automatic Checks (when Safety Gate passes):**
717 | 
718 | - Typecheck, lint, and format-check.
719 | - Build **dry-run** only.
720 | - Docs build if it does not write outside `./artifacts`.
721 | - Unit tests limited to **pure** functions with no I/O, no network, and no writes beyond `./artifacts`.
722 | 
723 | **Deferral conditions** (any true ⇒ **defer** and emit Local Test Instructions):
724 | 
725 | - Active Python venv detected (`VIRTUAL_ENV` set) or `.venv/` present in repo.
726 | - Managed envs or shims detected (e.g., `conda`, `poetry env`, Nix shells).
727 | - Commands imply global mutations, installs, migrations, DB writes, or network calls without explicit approval.
728 | - OS or shell mismatch risk in user context.
729 | 
730 | **Python rule:** If Python commands are needed and considered safe, use **`uv`** exclusively (`uv run`, `uvx`). **Do not** activate existing venvs.
731 | 
732 | **Pre-run Test Plan (required for any automatic run):**
733 | 
734 | - Exact commands, working directory, environment variables, and expected exit codes.
735 | - A short **Risk table** explaining why each command is safe under the Safety Gate.
736 | 
737 | **Execution protocol (automatic checks):**
738 | 
739 | - Run the approved commands exactly.
740 | - Capture stdout/stderr to `artifacts/test/<UTC-timestamp>.log`.
741 | - Do not modify other files.
742 | 
743 | **Post-run recording:**
744 | 
745 | - Add outcomes to the completion note and `DocFetchReport`.
746 | - Update `task:${task_id}.observations.test_results` and `test_log_path`.
747 | 
748 | **Deferral protocol:**
749 | 
750 | - Emit a **Local Test Instructions** block (see §2.1 example) with copy-paste commands, rationale, and expected exit codes.
751 | - Record `tests_deferred_reason` and set status to **`needs-local-tests`**.
752 | 
753 | ---
754 | 
755 | ### System-prompt scaffold (enforcement)
756 | 
757 | ```markdown
758 | SYSTEM: You operate under a blocking docs-first policy.
759 | 1) Preflight (§A):
760 |    - Call contex7-mcp → gitmcp as needed.
761 |    - Build DocFetchReport (status must be OK).
762 | 2) Planning:
763 |    - Map each planned change to key_guidance items in DocFetchReport.
764 |    - Build a subtask plan with DoD (§1.1) and record to memory.
765 | 3) Decision Gate (§B):
766 |    - If DocFetchReport.status != OK → STOP and return "Docs Missing" with exact MCP calls.
767 | 4) Execution:
768 |    - Proceed only if ctx.docs_ready == true.
769 |    - Log subtask progress to memory (§1.2). Finish-in-one-go unless blocked.
770 | 5) Completion:
771 |    - After memory updates, set status to **verify** and evaluate §8 Safety Gate.
772 |    - Run allowed automatic checks or defer with Local Test Instructions (§2.1, §8).
773 |    - Verify all subtasks done, then set status **done** on success; otherwise **blocked** or **needs-local-tests**.
774 |    - Attach DocFetchReport and write completion memory (§2).
775 | ```
776 | 
777 | ---
778 | 
779 | ## Prompt Registry & Precedence
780 | 
781 | - **Baseline:** AGENTS.md is always authoritative. Prompts in `~/.codex/prompts` are available but inert until manually invoked.
782 | - **Engagement:** Prompts run only when the user explicitly types the slash command or pastes the body. The assistant must not auto-run them.
783 | - **Precedence:** Behavior extensions and rule-packs follow later-wins. Prompts never override baseline unless pasted inline.
784 | - **Recording:** When invoked, the assistant must echo which prompt was used and log it in `DocFetchReport.approved_instructions[]` as `{source: "~/.codex/prompts", command: "/<name>"}`.
785 | 
786 | ---
787 | 
788 | ## Prompt Discovery & Namespacing
789 | 
790 | - **Discovery:** `/foo` resolves to `~/.codex/prompts/foo.md`. No auto-run.
791 | - **Reserved namespace:** `/vibe-*` for YC-style playbooks and planning flows.
792 | - **Default shortlist:** Recommended safe manual commands:
793 | 
794 |   - `/planning-process`, `/scope-control`, `/integration-test`, `/regression-guard`, `/review`, `/release-notes`, `/reset-strategy`, `/compare-outputs`.
795 |   - Newly available and supported: `/scaffold-fullstack`, `/api-contract`, `/openapi-generate`, `/db-bootstrap`, `/migration-plan`, `/auth-scaffold`, `/e2e-runner-setup`, `/env-setup`, `/secrets-manager-setup`, `/iac-bootstrap`, `/monitoring-setup`, `/slo-setup`, `/feature-flags`.
796 | 
797 | ---
798 | 
799 | ## Prompt→Gate Router
800 | 
801 | -
802 | - **Scope Gate:** `/scope-control`, `/plan`, `/planning-process`
803 | - **Test Gate:** `/integration-test`, `/regression-guard`, `/coverage-guide`
804 | - **Review Gate:** `/review`, `/review-branch`, `/pr-desc`, `/owners`
805 | - **Release Gate:** `/release-notes`, `/version-proposal`
806 | - **Reset path:** `/reset-strategy`
807 | - **Model tactics:** `/compare-outputs`, `/switch-model`, `/model-strengths`
808 | 
809 | ---
810 | 
811 | ## Prompt Safety & Proof Hooks
812 | 
813 | -
814 | - Prompts cannot bypass Preflight (§A) or Decision Gate (§B).
815 | - If a prompt suggests stateful changes, require Safety Gate review first.
816 | - Before acting on prompt output, confirm `DocFetchReport.status == "OK"`.
817 | - Append invoked prompts to `DocFetchReport.tools_called[]` as `{tool: "prompt", name: "/<cmd>", path: "~/.codex/prompts/<file>.md", time_utc}`.
818 | 
819 | ---
820 | 
821 | ## Prompt Non-Goals
822 | 
823 | -
824 | - No auto-invocation of prompts.
825 | - Prompts must not redefine baseline gates, safety policies, or precedence.
826 | - If a command is unrecognized, check `~/.codex/prompts/<name>.md` and restart Codex if missing.
827 | 
828 | ---
829 | 
830 | ## Install & Availability Note
831 | 
832 | -
833 | - Place your prompt catalog at `~/.codex/prompts` so slash commands like `/foo` resolve to `~/.codex/prompts/foo.md`.
834 | - Restart your Codex client if new prompts are not discovered. Hot‑reload is not guaranteed.
835 | - File naming must match the command exactly, use `.md` extension, and avoid hidden files or directories prefixed with `_`.
836 | - On Windows + WSL2, store prompts in the Linux home directory and, if needed, symlink from Windows paths to keep a single source of truth.
837 | 
838 | ---
839 | 
840 | ## Troubleshooting
841 | 
842 | -
843 | - **Slash not recognized:** Verify `~/.codex/prompts/<name>.md` exists and the filename matches the command. Restart the client.
844 | - **Prompt not applied:** Prompts are inert until manually invoked. Ensure you typed the slash command or pasted the prompt body.
845 | - **Discovery issues:** Avoid directories starting with `_` or filenames containing `.archive.` which are ignored by design.
846 | 
847 | ---
848 | 
849 | ## Version Pinning (optional)
850 | 
851 | For reproducibility, pin the prompt catalog to a specific commit SHA. Record the SHA in project docs or a local dotfile so teams share the same prompt semantics across runs.
852 | 
853 | ---
854 | 
855 | ## Workflow Expansion Example
856 | 
857 | To demonstrate prompts in practice, a full-stack app workflow includes:
858 | 
859 | 1. **Preflight Docs** → ensure latest docs. Block if `status != OK`.
860 | 2. **Planning** → `/planning-process`, `/scope-control`, `/stack-evaluation`.
861 | 3. **Scaffold** → `/scaffold-fullstack`, `/api-contract`, `/openapi-generate`.
862 | 4. **Data/Auth** → `/db-bootstrap`, `/migration-plan`, `/auth-scaffold`.
863 | 5. **Frontend** → `/modular-architecture`, `/ui-screenshots`, `/design-assets`.
864 | 6. **Testing** → `/e2e-runner-setup`, `/integration-test`, `/coverage-guide`, `/regression-guard`.
865 | 7. **CI/CD** → `/version-control-guide`, `/devops-automation`, `/env-setup`, `/secrets-manager-setup`, `/iac-bootstrap`.
866 | 8. **Release** → `/owners`, `/review`, `/review-branch`, `/pr-desc`, `/release-notes`, `/version-proposal`.
867 | 9. **Ops** → `/monitoring-setup`, `/slo-setup`, `/logging-strategy`, `/audit`.
868 | 10. **Post-release** → `/error-analysis`, `/fix`, `/refactor-suggestions`, `/file-modularity`, `/dead-code-scan`, `/cleanup-branches`, `/feature-flags`.
869 | 11. **Model tactics** → `/model-strengths`, `/model-evaluation`, `/compare-outputs`, `/switch-model`.
870 | 
871 | **Prompt catalog status:** All prompts referenced in this workflow are present in `~/.codex/prompts` and can be invoked as shown. To verify, run a discovery pass and confirm the resolver paths match the command names.
872 | 
873 | - Discovery check: ensure files exist at `~/.codex/prompts/<name>.md` for every command listed above.
874 | - If any command is not recognized, restart the client and re-check filename casing and extension.
875 | 
876 | ---
877 | 
878 | *End of file.*
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
796 | ## Troubleshooting
797 | 
798 | -
799 | - **Slash not recognized:** Verify `~/.codex/prompts/<name>.md` exists and the filename matches the command. Restart the client.
800 | - **Prompt not applied:** Prompts are inert until manually invoked. Ensure you typed the slash command or pasted the prompt body.
801 | - **Discovery issues:** Avoid directories starting with `_` or filenames containing `.archive.` which are ignored by design.
802 | 
803 | ---
804 | 
805 | ## Version Pinning (optional)
806 | 
807 | For reproducibility, pin the prompt catalog to a specific commit SHA. Record the SHA in project docs or a local dotfile so teams share the same prompt semantics across runs.
808 | 
809 | ---
810 | 
811 | ## Workflow Expansion Example
812 | 
813 | To demonstrate prompts in practice, a full-stack app workflow includes:
814 | 
815 | 1. **Preflight Docs** → ensure latest docs. Block if `status != OK`.
816 | 2. **Planning** → `/planning-process`, `/scope-control`, `/stack-evaluation`.
817 | 3. **Scaffold** → `/scaffold-fullstack`, `/api-contract`, `/openapi-generate`.
818 | 4. **Data/Auth** → `/db-bootstrap`, `/migration-plan`, `/auth-scaffold`.
819 | 5. **Frontend** → `/modular-architecture`, `/ui-screenshots`, `/design-assets`.
820 | 6. **Testing** → `/e2e-runner-setup`, `/integration-test`, `/coverage-guide`, `/regression-guard`.
821 | 7. **CI/CD** → `/version-control-guide`, `/devops-automation`, `/env-setup`, `/secrets-manager-setup`, `/iac-bootstrap`.
822 | 8. **Release** → `/owners`, `/review`, `/review-branch`, `/pr-desc`, `/release-notes`, `/version-proposal`.
823 | 9. **Ops** → `/monitoring-setup`, `/slo-setup`, `/logging-strategy`, `/audit`.
824 | 10. **Post-release** → `/error-analysis`, `/fix`, `/refactor-suggestions`, `/file-modularity`, `/dead-code-scan`, `/cleanup-branches`, `/feature-flags`.
825 | 11. **Model tactics** → `/model-strengths`, `/model-evaluation`, `/compare-outputs`, `/switch-model`.
826 | 
827 | **Prompt catalog status:** All prompts referenced in this workflow are present in `~/.codex/prompts` and can be invoked as shown. To verify, run a discovery pass and confirm the resolver paths match the command names.
828 | 
829 | - Discovery check: ensure files exist at `~/.codex/prompts/<name>.md` for every command listed above.
830 | - If any command is not recognized, restart the client and re-check filename casing and extension.
831 | 
832 | ---
833 | 
834 | *End of file.*
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
316 |   A[Preflight Docs (§A) AGENTS] -->|DocFetchReport OK| B[/planning-process/]
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
23 |       "command": "/instruction-file",
24 |       "title": "Instruction File",
25 |       "purpose": "Generate or update `cursor.rules`, `windsurf.rules`, or `claude.md` with project-specific instructions.",
26 |       "gate": "DocFetchReport",
27 |       "status": "capture approved instructions before proceeding.",
28 |       "previous": [
29 |         "Preflight discovery (AGENTS baseline)"
30 |       ],
31 |       "next": [
32 |         "/planning-process",
33 |         "/scope-control"
34 |       ],
35 |       "path": "instruction-file.md"
36 |     }
37 |   ],
38 |   "p1-plan-scope": [
39 |     {
40 |       "phase": "P1 Plan & Scope",
41 |       "command": "/planning-process",
42 |       "title": "Planning Process",
43 |       "purpose": "Draft, refine, and execute a feature plan with strict scope control and progress tracking.",
44 |       "gate": "Scope Gate",
45 |       "status": "confirm problem, users, Done criteria, and stack risks are logged.",
46 |       "previous": [
47 |         "Preflight Docs (AGENTS baseline)"
48 |       ],
49 |       "next": [
50 |         "/scope-control",
51 |         "/stack-evaluation"
52 |       ],
53 |       "path": "planning-process.md"
54 |     },
55 |     {
56 |       "phase": "P1 Plan & Scope",
57 |       "command": "/prototype-feature",
58 |       "title": "Prototype Feature",
59 |       "purpose": "Spin up a standalone prototype in a clean repo before merging into main.",
60 |       "gate": "Prototype review",
61 |       "status": "Validate spike outcomes before committing to scope.",
62 |       "previous": [
63 |         "/planning-process"
64 |       ],
65 |       "next": [
66 |         "/scaffold-fullstack",
67 |         "/api-contract"
68 |       ],
69 |       "path": "prototype-feature.md"
70 |     },
71 |     {
72 |       "phase": "P1 Plan & Scope",
73 |       "command": "/scope-control",
74 |       "title": "Scope Control",
75 |       "purpose": "Enforce explicit scope boundaries and maintain \"won't do\" and \"ideas for later\" lists.",
76 |       "gate": "Scope Gate",
77 |       "status": "Done criteria, scope lists, and stack choices are committed.",
78 |       "previous": [
79 |         "/planning-process"
80 |       ],
81 |       "next": [
82 |         "/stack-evaluation",
83 |         "/scaffold-fullstack"
84 |       ],
85 |       "path": "scope-control.md"
86 |     },
87 |     {
88 |       "phase": "P1 Plan & Scope",
89 |       "command": "/stack-evaluation",
90 |       "title": "Stack Evaluation",
91 |       "purpose": "Evaluate language/framework choices relative to AI familiarity and repo goals.",
92 |       "gate": "Scope Gate",
93 |       "status": "record recommended stack and top risks before building.",
94 |       "previous": [
95 |         "/scope-control"
96 |       ],
97 |       "next": [
98 |         "/scaffold-fullstack",
99 |         "/api-contract"
100 |       ],
101 |       "path": "stack-evaluation.md"
102 |     }
103 |   ],
104 |   "p2-app-scaffold-contracts": [
105 |     {
106 |       "phase": "P2 App Scaffold & Contracts",
107 |       "command": "/api-contract \"<feature or domain>\"",
108 |       "title": "API Contract",
109 |       "purpose": "Author an initial OpenAPI 3.1 or GraphQL SDL contract from requirements.",
110 |       "gate": "Test Gate lite",
111 |       "status": "contract checked into repo with sample generation running cleanly.",
112 |       "previous": [
113 |         "/scaffold-fullstack"
114 |       ],
115 |       "next": [
116 |         "/openapi-generate",
117 |         "/modular-architecture"
118 |       ],
119 |       "path": "api-contract.md"
120 |     },
121 |     {
122 |       "phase": "P2 App Scaffold & Contracts",
123 |       "command": "/api-docs-local",
124 |       "title": "API Docs Local",
125 |       "purpose": "Fetch API docs and store locally for offline, deterministic reference.",
126 |       "gate": "Test Gate lite",
127 |       "status": "contracts cached locally for repeatable generation.",
128 |       "previous": [
129 |         "/scaffold-fullstack"
130 |       ],
131 |       "next": [
132 |         "/api-contract",
133 |         "/openapi-generate"
134 |       ],
135 |       "path": "api-docs-local.md"
136 |     },
137 |     {
138 |       "phase": "P2 App Scaffold & Contracts",
139 |       "command": "/openapi-generate <server|client> <lang> <spec-path>",
140 |       "title": "OpenAPI Generate",
141 |       "purpose": "Generate server stubs or typed clients from an OpenAPI spec.",
142 |       "gate": "Test Gate lite",
143 |       "status": "generated code builds and CI checks cover the new scripts.",
144 |       "previous": [
145 |         "/api-contract"
146 |       ],
147 |       "next": [
148 |         "/modular-architecture",
149 |         "/db-bootstrap"
150 |       ],
151 |       "path": "openapi-generate.md"
152 |     },
153 |     {
154 |       "phase": "P2 App Scaffold & Contracts",
155 |       "command": "/prototype-feature",
156 |       "title": "Prototype Feature",
157 |       "purpose": "Spin up a standalone prototype in a clean repo before merging into main.",
158 |       "gate": "Prototype review",
159 |       "status": "Validate spike outcomes before committing to scope.",
160 |       "previous": [
161 |         "/planning-process"
162 |       ],
163 |       "next": [
164 |         "/scaffold-fullstack",
165 |         "/api-contract"
166 |       ],
167 |       "path": "prototype-feature.md"
168 |     },
169 |     {
170 |       "phase": "P2 App Scaffold & Contracts",
171 |       "command": "/reference-implementation",
172 |       "title": "Reference Implementation",
173 |       "purpose": "Mimic the style and API of a known working example.",
174 |       "gate": "Test Gate lite",
175 |       "status": "align new modules with proven patterns before deeper work.",
176 |       "previous": [
177 |         "/scaffold-fullstack",
178 |         "/api-contract"
179 |       ],
180 |       "next": [
181 |         "/modular-architecture",
182 |         "/openapi-generate"
183 |       ],
184 |       "path": "reference-implementation.md"
185 |     },
186 |     {
187 |       "phase": "P2 App Scaffold & Contracts",
188 |       "command": "/scaffold-fullstack <stack>",
189 |       "title": "Scaffold Full‑Stack App",
190 |       "purpose": "Create a minimal, production-ready monorepo template with app, API, tests, CI seeds, and infra stubs.",
191 |       "gate": "Test Gate lite",
192 |       "status": "ensure lint/build scripts execute on the generated scaffold.",
193 |       "previous": [
194 |         "/stack-evaluation"
195 |       ],
196 |       "next": [
197 |         "/api-contract",
198 |         "/openapi-generate",
199 |         "/modular-architecture"
200 |       ],
201 |       "path": "scaffold-fullstack.md"
202 |     }
203 |   ],
204 |   "p3-data-auth": [
205 |     {
206 |       "phase": "P3 Data & Auth",
207 |       "command": "/auth-scaffold <oauth|email|oidc>",
208 |       "title": "Auth Scaffold",
209 |       "purpose": "Scaffold auth flows, routes, storage, and a basic threat model.",
210 |       "gate": "Migration dry-run",
211 |       "status": "auth flows threat-modeled and test accounts wired.",
212 |       "previous": [
213 |         "/migration-plan"
214 |       ],
215 |       "next": [
216 |         "/modular-architecture",
217 |         "/ui-screenshots",
218 |         "/e2e-runner-setup"
219 |       ],
220 |       "path": "auth-scaffold.md"
221 |     },
222 |     {
223 |       "phase": "P3 Data & Auth",
224 |       "command": "/db-bootstrap <postgres|mysql|sqlite|mongodb>",
225 |       "title": "DB Bootstrap",
226 |       "purpose": "Pick a database, initialize migrations, local compose, and seed scripts.",
227 |       "gate": "Migration dry-run",
228 |       "status": "migrations apply/rollback cleanly with seeds populated.",
229 |       "previous": [
230 |         "/modular-architecture"
231 |       ],
232 |       "next": [
233 |         "/migration-plan",
234 |         "/auth-scaffold"
235 |       ],
236 |       "path": "db-bootstrap.md"
237 |     },
238 |     {
239 |       "phase": "P3 Data & Auth",
240 |       "command": "/migration-plan \"<change summary>\"",
241 |       "title": "Migration Plan",
242 |       "purpose": "Produce safe up/down migration steps with checks and rollback notes.",
243 |       "gate": "Migration dry-run",
244 |       "status": "validated rollback steps and safety checks documented.",
245 |       "previous": [
246 |         "/db-bootstrap"
247 |       ],
248 |       "next": [
249 |         "/auth-scaffold",
250 |         "/e2e-runner-setup"
251 |       ],
252 |       "path": "migration-plan.md"
253 |     }
254 |   ],
255 |   "p4-frontend-ux": [
256 |     {
257 |       "phase": "P4 Frontend UX",
258 |       "command": "/design-assets",
259 |       "title": "Design Assets",
260 |       "purpose": "Generate favicons and small design snippets from product brand.",
261 |       "gate": "Accessibility checks queued",
262 |       "status": "ensure assets support design review.",
263 |       "previous": [
264 |         "/modular-architecture"
265 |       ],
266 |       "next": [
267 |         "/ui-screenshots",
268 |         "/logging-strategy"
269 |       ],
270 |       "path": "design-assets.md"
271 |     },
272 |     {
273 |       "phase": "P4 Frontend UX",
274 |       "command": "/ui-screenshots",
275 |       "title": "UI Screenshots",
276 |       "purpose": "Analyze screenshots for UI bugs or inspiration and propose actionable UI changes.",
277 |       "gate": "Accessibility checks queued",
278 |       "status": "capture UX issues and backlog fixes.",
279 |       "previous": [
280 |         "/design-assets",
281 |         "/modular-architecture"
282 |       ],
283 |       "next": [
284 |         "/logging-strategy",
285 |         "/e2e-runner-setup"
286 |       ],
287 |       "path": "ui-screenshots.md"
288 |     }
289 |   ],
290 |   "p5-quality-gates-tests": [
291 |     {
292 |       "phase": "P5 Quality Gates & Tests",
293 |       "command": "/coverage-guide",
294 |       "title": "Coverage Guide",
295 |       "purpose": "Propose high-ROI tests to raise coverage using uncovered areas.",
296 |       "gate": "Test Gate",
297 |       "status": "coverage targets and regression guard plan recorded.",
298 |       "previous": [
299 |         "/integration-test"
300 |       ],
301 |       "next": [
302 |         "/regression-guard",
303 |         "/version-control-guide"
304 |       ],
305 |       "path": "coverage-guide.md"
306 |     },
307 |     {
308 |       "phase": "P5 Quality Gates & Tests",
309 |       "command": "/e2e-runner-setup <playwright|cypress>",
310 |       "title": "E2E Runner Setup",
311 |       "purpose": "Configure an end-to-end test runner with fixtures and a data sandbox.",
312 |       "gate": "Test Gate",
313 |       "status": "runner green locally and wired into CI before expanding coverage.",
314 |       "previous": [
315 |         "/auth-scaffold",
316 |         "/ui-screenshots"
317 |       ],
318 |       "next": [
319 |         "/integration-test",
320 |         "/coverage-guide"
321 |       ],
322 |       "path": "e2e-runner-setup.md"
323 |     },
324 |     {
325 |       "phase": "P5 Quality Gates & Tests",
326 |       "command": "/generate <source-file>",
327 |       "title": "Generate Unit Tests",
328 |       "purpose": "Generate unit tests for a given source file.",
329 |       "gate": "Test Gate",
330 |       "status": "targeted unit tests authored for the specified module.",
331 |       "previous": [
332 |         "/coverage-guide"
333 |       ],
334 |       "next": [
335 |         "/regression-guard"
336 |       ],
337 |       "path": "generate.md"
338 |     },
339 |     {
340 |       "phase": "P5 Quality Gates & Tests",
341 |       "command": "/integration-test",
342 |       "title": "Integration Test",
343 |       "purpose": "Generate E2E tests that simulate real user flows.",
344 |       "gate": "Test Gate",
345 |       "status": "happy path E2E must pass locally and in CI.",
346 |       "previous": [
347 |         "/e2e-runner-setup"
348 |       ],
349 |       "next": [
350 |         "/coverage-guide",
351 |         "/regression-guard"
352 |       ],
353 |       "path": "integration-test.md"
354 |     },
355 |     {
356 |       "phase": "P5 Quality Gates & Tests",
357 |       "command": "/regression-guard",
358 |       "title": "Regression Guard",
359 |       "purpose": "Detect unrelated changes and add tests to prevent regressions.",
360 |       "gate": "Test Gate",
361 |       "status": "regression coverage in place before CI hand-off.",
362 |       "previous": [
363 |         "/coverage-guide"
364 |       ],
365 |       "next": [
366 |         "/version-control-guide",
367 |         "/devops-automation"
368 |       ],
369 |       "path": "regression-guard.md"
370 |     }
371 |   ],
372 |   "p6-ci-cd-env": [
373 |     {
374 |       "phase": "P6 CI/CD & Env",
375 |       "command": "/devops-automation",
376 |       "title": "DevOps Automation",
377 |       "purpose": "Configure servers, DNS, SSL, CI/CD at a pragmatic level.",
378 |       "gate": "Review Gate",
379 |       "status": "CI pipeline codified, rollback steps rehearsed.",
380 |       "previous": [
381 |         "/version-control-guide"
382 |       ],
383 |       "next": [
384 |         "/env-setup",
385 |         "/secrets-manager-setup",
386 |         "/iac-bootstrap"
387 |       ],
388 |       "path": "devops-automation.md"
389 |     },
390 |     {
391 |       "phase": "P6 CI/CD & Env",
392 |       "command": "/env-setup",
393 |       "title": "Env Setup",
394 |       "purpose": "Create .env.example, runtime schema validation, and per-env overrides.",
395 |       "gate": "Review Gate",
396 |       "status": "environment schemas enforced and CI respects strict loading.",
397 |       "previous": [
398 |         "/devops-automation"
399 |       ],
400 |       "next": [
401 |         "/secrets-manager-setup",
402 |         "/iac-bootstrap"
403 |       ],
404 |       "path": "env-setup.md"
405 |     },
406 |     {
407 |       "phase": "P6 CI/CD & Env",
408 |       "command": "/iac-bootstrap <aws|gcp|azure|fly|render>",
409 |       "title": "IaC Bootstrap",
410 |       "purpose": "Create minimal Infrastructure-as-Code for the chosen platform plus CI hooks.",
411 |       "gate": "Review Gate",
412 |       "status": "IaC applied in staging with drift detection configured.",
413 |       "previous": [
414 |         "/secrets-manager-setup"
415 |       ],
416 |       "next": [
417 |         "/owners",
418 |         "/review"
419 |       ],
420 |       "path": "iac-bootstrap.md"
421 |     },
422 |     {
423 |       "phase": "P6 CI/CD & Env",
424 |       "command": "/secrets-manager-setup <provider>",
425 |       "title": "Secrets Manager Setup",
426 |       "purpose": "Provision a secrets store and map application variables to it.",
427 |       "gate": "Review Gate",
428 |       "status": "secret paths mapped and least-privilege policies drafted.",
429 |       "previous": [
430 |         "/env-setup"
431 |       ],
432 |       "next": [
433 |         "/iac-bootstrap",
434 |         "/owners"
435 |       ],
436 |       "path": "secrets-manager-setup.md"
437 |     },
438 |     {
439 |       "phase": "P6 CI/CD & Env",
440 |       "command": "/version-control-guide",
441 |       "title": "Version Control Guide",
442 |       "purpose": "Enforce clean incremental commits and clean-room re-implementation when finalizing.",
443 |       "gate": "Review Gate",
444 |       "status": "clean diff, CI green, and approvals ready.",
445 |       "previous": [
446 |         "/regression-guard"
447 |       ],
448 |       "next": [
449 |         "/devops-automation",
450 |         "/env-setup"
451 |       ],
452 |       "path": "version-control-guide.md"
453 |     },
454 |     {
455 |       "phase": "P6 CI/CD & Env",
456 |       "command": "commit",
457 |       "title": "Commit Message Assistant",
458 |       "purpose": "Generate a conventional, review-ready commit message from the currently staged changes.",
459 |       "gate": "Review Gate",
460 |       "status": "clean diff, CI green, and approvals ready.",
461 |       "previous": [
462 |         "/version-control-guide"
463 |       ],
464 |       "next": [
465 |         "/devops-automation",
466 |         "/env-setup"
467 |       ],
468 |       "path": "commit.md"
469 |     }
470 |   ],
471 |   "p7-release-ops": [
472 |     {
473 |       "phase": "P7 Release & Ops",
474 |       "command": "/audit",
475 |       "title": "Audit",
476 |       "purpose": "Audit repository hygiene and suggest improvements.",
477 |       "gate": "Release Gate",
478 |       "status": "readiness criteria before shipping.",
479 |       "previous": [
480 |         "/logging-strategy"
481 |       ],
482 |       "next": [
483 |         "/error-analysis",
484 |         "/fix"
485 |       ],
486 |       "path": "audit.md"
487 |     },
488 |     {
489 |       "phase": "P7 Release & Ops",
490 |       "command": "/explain-code",
491 |       "title": "Explain Code",
492 |       "purpose": "Provide line-by-line explanations for a given file or diff.",
493 |       "gate": "Review Gate",
494 |       "status": "Improve reviewer comprehension before approvals.",
495 |       "previous": [
496 |         "/owners",
497 |         "/review"
498 |       ],
499 |       "next": [
500 |         "/review-branch",
501 |         "/pr-desc"
502 |       ],
503 |       "path": "explain-code.md"
504 |     },
505 |     {
506 |       "phase": "P7 Release & Ops",
507 |       "command": "/monitoring-setup",
508 |       "title": "Monitoring Setup",
509 |       "purpose": "Bootstrap logs, metrics, and traces with dashboards per domain.",
510 |       "gate": "Release Gate",
511 |       "status": "observability baselines ready before rollout.",
512 |       "previous": [
513 |         "/version-proposal"
514 |       ],
515 |       "next": [
516 |         "/slo-setup",
517 |         "/logging-strategy"
518 |       ],
519 |       "path": "monitoring-setup.md"
520 |     },
521 |     {
522 |       "phase": "P7 Release & Ops",
523 |       "command": "/owners <path>",
524 |       "title": "Owners",
525 |       "purpose": "Suggest likely owners or reviewers for the specified path.",
526 |       "gate": "Review Gate",
527 |       "status": "confirm approvers and escalation paths before PR submission.",
528 |       "previous": [
529 |         "/iac-bootstrap"
530 |       ],
531 |       "next": [
532 |         "/review",
533 |         "/review-branch",
534 |         "/pr-desc"
535 |       ],
536 |       "path": "owners.md"
537 |     },
538 |     {
539 |       "phase": "P7 Release & Ops",
540 |       "command": "/pr-desc <context>",
541 |       "title": "PR Description",
542 |       "purpose": "Draft a PR description from the branch diff.",
543 |       "gate": "Review Gate",
544 |       "status": "PR narrative ready for approvals and release prep.",
545 |       "previous": [
546 |         "/review-branch"
547 |       ],
548 |       "next": [
549 |         "/release-notes",
550 |         "/version-proposal"
551 |       ],
552 |       "path": "pr-desc.md"
553 |     },
554 |     {
555 |       "phase": "P7 Release & Ops",
556 |       "command": "/release-notes <git-range>",
557 |       "title": "Release Notes",
558 |       "purpose": "Generate human-readable release notes from recent commits.",
559 |       "gate": "Release Gate",
560 |       "status": "notes compiled for staging review and production rollout.",
561 |       "previous": [
562 |         "/pr-desc"
563 |       ],
564 |       "next": [
565 |         "/version-proposal",
566 |         "/monitoring-setup"
567 |       ],
568 |       "path": "release-notes.md"
569 |     },
570 |     {
571 |       "phase": "P7 Release & Ops",
572 |       "command": "/review <pattern>",
573 |       "title": "Review",
574 |       "purpose": "Review code matching a pattern and deliver actionable feedback.",
575 |       "gate": "Review Gate",
576 |       "status": "peer review coverage met before merging.",
577 |       "previous": [
578 |         "/owners"
579 |       ],
580 |       "next": [
581 |         "/review-branch",
582 |         "/pr-desc"
583 |       ],
584 |       "path": "review.md"
585 |     },
586 |     {
587 |       "phase": "P7 Release & Ops",
588 |       "command": "/review-branch",
589 |       "title": "Review Branch",
590 |       "purpose": "Provide a high-level review of the current branch versus origin/main.",
591 |       "gate": "Review Gate",
592 |       "status": "branch scope validated before PR submission.",
593 |       "previous": [
594 |         "/review"
595 |       ],
596 |       "next": [
597 |         "/pr-desc",
598 |         "/release-notes"
599 |       ],
600 |       "path": "review-branch.md"
601 |     },
602 |     {
603 |       "phase": "P7 Release & Ops",
604 |       "command": "/slo-setup",
605 |       "title": "SLO Setup",
606 |       "purpose": "Define Service Level Objectives, burn alerts, and runbooks.",
607 |       "gate": "Release Gate",
608 |       "status": "SLOs and alerts reviewed before production rollout.",
609 |       "previous": [
610 |         "/monitoring-setup"
611 |       ],
612 |       "next": [
613 |         "/logging-strategy",
614 |         "/audit"
615 |       ],
616 |       "path": "slo-setup.md"
617 |     },
618 |     {
619 |       "phase": "P7 Release & Ops",
620 |       "command": "/version-proposal",
621 |       "title": "Version Proposal",
622 |       "purpose": "Propose the next semantic version based on commit history.",
623 |       "gate": "Release Gate",
624 |       "status": "version bump decision recorded before deployment.",
625 |       "previous": [
626 |         "/release-notes"
627 |       ],
628 |       "next": [
629 |         "/monitoring-setup",
630 |         "/slo-setup"
631 |       ],
632 |       "path": "version-proposal.md"
633 |     }
634 |   ],
635 |   "p8-post-release-hardening": [
636 |     {
637 |       "phase": "P8 Post-release Hardening",
638 |       "command": "/cleanup-branches",
639 |       "title": "Cleanup Branches",
640 |       "purpose": "Recommend which local branches are safe to delete and which to keep.",
641 |       "gate": "Post-release cleanup",
642 |       "status": "repo tidy with stale branches archived.",
643 |       "previous": [
644 |         "/dead-code-scan"
645 |       ],
646 |       "next": [
647 |         "/feature-flags",
648 |         "/model-strengths"
649 |       ],
650 |       "path": "cleanup-branches.md"
651 |     },
652 |     {
653 |       "phase": "P8 Post-release Hardening",
654 |       "command": "/dead-code-scan",
655 |       "title": "Dead Code Scan",
656 |       "purpose": "Identify likely dead or unused files and exports using static signals.",
657 |       "gate": "Post-release cleanup",
658 |       "status": "ensure code removals keep prod stable.",
659 |       "previous": [
660 |         "/file-modularity"
661 |       ],
662 |       "next": [
663 |         "/cleanup-branches",
664 |         "/feature-flags"
665 |       ],
666 |       "path": "dead-code-scan.md"
667 |     },
668 |     {
669 |       "phase": "P8 Post-release Hardening",
670 |       "command": "/error-analysis",
671 |       "title": "Error Analysis",
672 |       "purpose": "Analyze error logs and enumerate likely root causes with fixes.",
673 |       "gate": "Post-release cleanup",
674 |       "status": "Sev-1 incidents triaged with fixes scheduled.",
675 |       "previous": [
676 |         "/logging-strategy",
677 |         "/audit"
678 |       ],
679 |       "next": [
680 |         "/fix",
681 |         "/refactor-suggestions"
682 |       ],
683 |       "path": "error-analysis.md"
684 |     },
685 |     {
686 |       "phase": "P8 Post-release Hardening",
687 |       "command": "/feature-flags <provider>",
688 |       "title": "Feature Flags",
689 |       "purpose": "Integrate a flag provider, wire the SDK, and enforce guardrails.",
690 |       "gate": "Post-release cleanup",
691 |       "status": "guardrails added before toggling new flows.",
692 |       "previous": [
693 |         "/cleanup-branches"
694 |       ],
695 |       "next": [
696 |         "/model-strengths",
697 |         "/model-evaluation"
698 |       ],
699 |       "path": "feature-flags.md"
700 |     },
701 |     {
702 |       "phase": "P8 Post-release Hardening",
703 |       "command": "/file-modularity",
704 |       "title": "File Modularity",
705 |       "purpose": "Enforce smaller files and propose safe splits for giant files.",
706 |       "gate": "Post-release cleanup",
707 |       "status": "structure debt addressed without destabilizing prod.",
708 |       "previous": [
709 |         "/refactor-suggestions"
710 |       ],
711 |       "next": [
712 |         "/dead-code-scan",
713 |         "/cleanup-branches"
714 |       ],
715 |       "path": "file-modularity.md"
716 |     },
717 |     {
718 |       "phase": "P8 Post-release Hardening",
719 |       "command": "/fix \"<bug summary>\"",
720 |       "title": "Fix",
721 |       "purpose": "Propose a minimal, correct fix with diff-style patches.",
722 |       "gate": "Post-release cleanup",
723 |       "status": "validated fix with regression coverage before closing incident.",
724 |       "previous": [
725 |         "/error-analysis"
726 |       ],
727 |       "next": [
728 |         "/refactor-suggestions",
729 |         "/file-modularity"
730 |       ],
731 |       "path": "fix.md"
732 |     },
733 |     {
734 |       "phase": "P8 Post-release Hardening",
735 |       "command": "/refactor-suggestions",
736 |       "title": "Refactor Suggestions",
737 |       "purpose": "Propose repo-wide refactoring opportunities after tests exist.",
738 |       "gate": "Post-release cleanup",
739 |       "status": "plan high-leverage refactors once Sev-1 issues settle.",
740 |       "previous": [
741 |         "/fix"
742 |       ],
743 |       "next": [
744 |         "/file-modularity",
745 |         "/dead-code-scan"
746 |       ],
747 |       "path": "refactor-suggestions.md"
748 |     }
749 |   ],
750 |   "p9-model-tactics": [
751 |     {
752 |       "phase": "P9 Model Tactics",
753 |       "command": "/compare-outputs",
754 |       "title": "Compare Outputs",
755 |       "purpose": "Run multiple models or tools on the same prompt and summarize best output.",
756 |       "gate": "Model uplift",
757 |       "status": "comparative data compiled before switching defaults.",
758 |       "previous": [
759 |         "/model-evaluation"
760 |       ],
761 |       "next": [
762 |         "/switch-model"
763 |       ],
764 |       "path": "compare-outputs.md"
765 |     },
766 |     {
767 |       "phase": "P9 Model Tactics",
768 |       "command": "/model-evaluation",
769 |       "title": "Model Evaluation",
770 |       "purpose": "Try a new model and compare outputs against a baseline.",
771 |       "gate": "Model uplift",
772 |       "status": "experiments must beat baseline quality metrics.",
773 |       "previous": [
774 |         "/model-strengths"
775 |       ],
776 |       "next": [
777 |         "/compare-outputs",
778 |         "/switch-model"
779 |       ],
780 |       "path": "model-evaluation.md"
781 |     },
782 |     {
783 |       "phase": "P9 Model Tactics",
784 |       "command": "/model-strengths",
785 |       "title": "Model Strengths",
786 |       "purpose": "Choose model per task type.",
787 |       "gate": "Model uplift",
788 |       "status": "capture baseline routing before experimentation.",
789 |       "previous": [
790 |         "/feature-flags (optional)",
791 |         "Stage-specific blockers"
792 |       ],
793 |       "next": [
794 |         "/model-evaluation",
795 |         "/compare-outputs"
796 |       ],
797 |       "path": "model-strengths.md"
798 |     },
799 |     {
800 |       "phase": "P9 Model Tactics",
801 |       "command": "/switch-model",
802 |       "title": "Switch Model",
803 |       "purpose": "Decide when to try a different AI backend and how to compare.",
804 |       "gate": "Model uplift",
805 |       "status": "document rollback/guardrails before flipping defaults.",
806 |       "previous": [
807 |         "/compare-outputs"
808 |       ],
809 |       "next": [
810 |         "Return to the blocked stage (e.g., /integration-test) to apply learnings"
811 |       ],
812 |       "path": "switch-model.md"
813 |     }
814 |   ],
815 |   "reset-playbook": [
816 |     {
817 |       "phase": "Reset Playbook",
818 |       "command": "/reset-strategy",
819 |       "title": "Reset Strategy",
820 |       "purpose": "Decide when to hard reset and start clean to avoid layered bad diffs.",
821 |       "gate": "Clean restart",
822 |       "status": "triggered when gate criteria stall for >60 minutes.",
823 |       "previous": [
824 |         "Any blocked stage"
825 |       ],
826 |       "next": [
827 |         "Restart with /planning-process then follow the gated flow"
828 |       ],
829 |       "path": "reset-strategy.md"
830 |     }
831 |   ],
832 |   "support": [
833 |     {
834 |       "phase": "Support",
835 |       "command": "/voice-input",
836 |       "title": "Voice Input",
837 |       "purpose": "Support interaction from voice capture and convert to structured prompts.",
838 |       "gate": "Support intake",
839 |       "status": "Clarify voice-derived requests before invoking gated prompts.",
840 |       "previous": [
841 |         "Voice transcript capture"
842 |       ],
843 |       "next": [
844 |         "Any stage-specific command (e.g., /planning-process)"
845 |       ],
846 |       "path": "voice-input.md"
847 |     }
848 |   ]
849 | }
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

logging-strategy.md

```
1 | phase: "P7 Release & Ops"
2 | gate: "Release Gate"
3 | status: "logging guardrails ready for canary/production checks; coordinate with P4 Frontend UX for client telemetry."
4 | previous:
5 |   - "/monitoring-setup"
6 |   - "/slo-setup"
7 | next:
8 |   - "/audit"
9 |   - "/error-analysis"
10 | ---
11 | 
12 | # Logging Strategy
13 | 
14 | Trigger: /logging-strategy
15 | 
16 | Purpose: Add or remove diagnostic logging cleanly with levels and privacy in mind.
17 | 
18 | ## Steps
19 | 
20 | 1. Identify hotspots from recent failures.
21 | 2. Insert structured logs with contexts and correlation IDs.
22 | 3. Remove noisy or PII-leaking logs.
23 | 4. Document log levels and sampling in `OBSERVABILITY.md`.
24 | 
25 | ## Output format
26 | 
27 | - Diff hunks and a short guideline section.
28 | 
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
5 |   - "/openapi-generate"
6 | next:
7 |   - "/db-bootstrap"
8 |   - "/ui-screenshots"
9 |   - "/design-assets"
10 | ---
11 | 
12 | # Modular Architecture
13 | 
14 | Trigger: /modular-architecture
15 | 
16 | Purpose: Enforce modular boundaries and clear external interfaces.
17 | 
18 | ## Steps
19 | 
20 | 1. Identify services/modules and their public contracts.
21 | 2. Flag cross-module imports and circular deps.
22 | 3. Propose boundaries, facades, and internal folders.
23 | 4. Add "contract tests" for public APIs.
24 | 
25 | ## Output format
26 | 
27 | - Diagram-ready list of modules and edges, plus diffs.
28 | 
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
3 |   "private": true,
4 |   "type": "module",
5 |   "scripts": {
6 |     "validate:metadata": "ts-node --esm scripts/validate_metadata.ts",
7 |     "build:catalog": "ts-node --esm scripts/build_catalog.ts",
8 |     "test": "ts-node --esm scripts/__tests__/workflow_sync.test.ts",
9 |     "build": "tsc",
10 |     "start": "node dist/index.js"
11 |   },
12 |   "dependencies": {
13 |     "@modelcontextprotocol/sdk": "^0.2.0"
14 |   },
15 |   "devDependencies": {
16 |     "@types/node": "^20.14.9",
17 |     "ts-node": "^10.9.2",
18 |     "typescript": "^5.4.0"
19 |   }
20 | }
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

prd.txt

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

tsconfig.json

```
1 | {
2 |   "compilerOptions": {
3 |     "target": "ES2022",
4 |     "module": "node16",
5 |     "moduleResolution": "node16",
6 |     "esModuleInterop": true,
7 |     "forceConsistentCasingInFileNames": true,
8 |     "strict": true,
9 |     "skipLibCheck": true,
10 |     "resolveJsonModule": true,
11 |     "types": ["node"],
12 |     "outDir": "./dist",
13 |     "rootDir": "./src"
14 |   },
15 |   "include": [
16 |     "scripts/**/*.ts",
17 |     "src/**/*.ts"
18 |   ]
19 | }
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
2 |  "mcpServers": {
3 |   "task-master-ai": {
4 |    "command": "npx",
5 |    "args": ["-y", "--package=task-master-ai", "task-master-ai"],
6 |    "env": {
7 |     "ANTHROPIC_API_KEY": "YOUR_ANTHROPIC_API_KEY_HERE",
8 |     "PERPLEXITY_API_KEY": "YOUR_PERPLEXITY_API_KEY_HERE",
9 |     "OPENAI_API_KEY": "YOUR_OPENAI_KEY_HERE",
10 |     "GOOGLE_API_KEY": "YOUR_GOOGLE_KEY_HERE",
11 |     "XAI_API_KEY": "YOUR_XAI_KEY_HERE",
12 |     "OPENROUTER_API_KEY": "YOUR_OPENROUTER_KEY_HERE",
13 |     "MISTRAL_API_KEY": "YOUR_MISTRAL_KEY_HERE",
14 |     "AZURE_OPENAI_API_KEY": "YOUR_AZURE_KEY_HERE",
15 |     "OLLAMA_API_KEY": "YOUR_OLLAMA_API_KEY_HERE"
16 |    }
17 |   }
18 |  }
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

MCP/MCP server resources.md

```
1 | 
2 | Converting Markdown Prompt Repo into Local MCP Server with DAG-Aware Planning
3 | 
4 | Converting a Prompt Library into a Proactive MCP Workflow Assistant
5 | ===================================================================
6 | 
7 | Converting Prompt Playbooks into an MCP Server
8 | ----------------------------------------------
9 | 
10 | To turn a Markdown-only prompt library into an MCP server, you can expose each prompt file as an **MCP tool**. For example, the open-source _Prompts MCP Server_ demonstrates this pattern: it loads prompt templates (Markdown files with YAML frontmatter) from a `prompts/` directory and exposes operations like adding, retrieving, listing, and deleting prompts via MCP[github.com](https://github.com/tanker327/prompts-mcp-server#:~:text=Prompts%20MCP%20Server)[github.com](https://github.com/tanker327/prompts-mcp-server#:~:text=,title%2C%20description%2C%20tags%2C%20etc). In practice, you’d package your prompt files and a lightweight server program (e.g. in Node or Rust) that registers each prompt as a tool (e.g. `/planning-process` becomes a tool callable by the AI). Once installed and configured in an MCP client (like Claude Desktop or Cursor), the server advertises these prompt-tools on initialization. This approach essentially wraps your docs as a **tool library** the AI can invoke by name. It requires writing minimal glue code (to read files, handle JSON-RPC requests, etc.), and there are templates and examples available – for instance, the prompts-mcp-server above is published on NPM for quick use[github.com](https://github.com/tanker327/prompts-mcp-server#:~:text=,server)[github.com](https://github.com/tanker327/prompts-mcp-server#:~:text=Features). You would follow a similar structure: load your Markdown playbooks, perhaps parse any frontmatter (titles, descriptions, tags), and implement MCP _tool handlers_ that simply return the prompt content (or perform any slight processing needed) to the client.
11 | 
12 | Maintaining Workflow State and Context
13 | --------------------------------------
14 | 
15 | To go beyond static prompts and make the assistant **workflow-aware**, your MCP server should maintain some **project state** across calls. MCP servers support long-lived, stateful sessions with the client – the JSON-RPC connection stays open and can carry context between requests[workos.com](https://workos.com/blog/how-mcp-servers-work#:~:text=MCP%20servers%20maintain%20a%20stateful,one%20request%20to%20the%20next). This means your server can “remember” where the user is in the workflow (for example, which phase or step has been completed) and adjust the next suggestions accordingly. In fact, some MCP servers are specifically designed to keep persistent project context. For example, a _Project Context MCP Server_ can track details like the project’s name, _current phase/status_, task list, and decision history in a local store[lobehub.com](https://lobehub.com/mcp/aaronfeingold-mcp-project-context#:~:text=The%20MCP%20Project%20Context%20Server,for%20your%20development%20projects%2C%20maintaining). By exposing tools to update and query this state (e.g. `get_project_status`, `advance_phase`, or `add_task`), the server and AI together can ensure the conversation always considers what’s been done and what’s next.
16 | 
17 | Crucially, an MCP server can include a **Session Orchestrator** component that links multi-step operations together. This allows implementing a DAG or flowchart of actions as a guided sequence of tool calls. For instance, if the user’s request triggers a multi-step workflow (say Plan → Code → Test → Deploy), the orchestrator can carry information from one tool call to the next and decide when the sequence is complete[workos.com](https://workos.com/blog/how-mcp-servers-work#:~:text=1,through%20multiple%20pages%20of%20results)[workos.com](https://workos.com/blog/how-mcp-servers-work#:~:text=The%20Session%20Orchestrator%20is%20responsible,for). In a web-browsing MCP server example, the orchestrator tracks which page is open so that a “next page” command knows where to resume[workos.com](https://workos.com/blog/how-mcp-servers-work#:~:text=1,through%20multiple%20pages%20of%20results). By analogy, your server can track which **milestone or gate** the project is at (e.g. “Scope defined”, “App scaffolded”, “Tests passing”) and only allow or suggest tools relevant to the current stage.
18 | 
19 | Using Diagrams to Plan Next Actions
20 | -----------------------------------
21 | 
22 | Since your repository already includes a **Mermaid workflow diagram** mapping out phases P0–P9, the MCP server can leverage this as a source of truth for the process flow. In practice, you might parse the Mermaid **graph** (which is a DAG of steps and decisions) to know the dependencies and order of tasks. Some MCP servers even specialize in diagram analysis – for example, an _MCP Mermaid Server_ provides tools to **analyze an existing diagram’s structure and provide insights or improvement suggestions**[lobehub.com](https://lobehub.com/mcp/kayaozkur-mcp-server-mermaid#:~:text=%2A%20%60generate_diagram_from_code%60%20,Mermaid%20syntax%20with%20error%20details). Leveraging such capabilities, your server could include a custom tool (or integrate an existing one) to read the `workflow.mmd` Mermaid file and determine “what comes next.” For instance, if the project is in phase P3 (Data & Auth), a diagram analysis tool could find the next node after P3 and suggest or auto-trigger the commands under P4 (Frontend UX). Even without a dedicated diagram parser, you can encode the workflow logic in a simple state machine or lookup table: e.g. after **Scope Gate** is passed, the server knows the next phase is App Scaffold (P2) and could notify the user or proactively call the `/scaffold-fullstack` prompt. The key is that by **modeling the workflow** (via the Mermaid diagram or an equivalent DAG in code), the server can drive the assistant to follow a structured game plan rather than just reacting blindly. This yields a more _systematic, proactive assistant_ that guides the developer through each stage in order.
23 | 
24 | Enabling Autonomous Step Execution
25 | ----------------------------------
26 | 
27 | Finally, to have the MCP server _autonomously advance implementation steps_, you can take advantage of MCP’s support for **agent-initiated actions**. Unlike a stateless API, MCP’s persistent connection allows the server to send **notifications or prompts back to the client** asynchronously[github.com](https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/102#:~:text=MCP%20is%20currently%20a%20stateful,us%20to%20support%20behaviors%20like). In practical terms, once the server detects that a certain condition is met (say, the “Test Gate” milestone achieved all green tests), it could emit a notification or result indicating “Gate cleared – ready to proceed to next phase.” Modern AI hosts (Claude Code, Cursor, etc.) are built to handle such server-initiated messages, enabling what the MCP spec calls _agentic workflows_[github.com](https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/102#:~:text=MCP%20is%20currently%20a%20stateful,us%20to%20support%20behaviors%20like). With this, your MCP server doesn’t have to passively wait for the user to invoke the next slash command; it can proactively suggest or even trigger the next tool.
28 | 
29 | For example, you might implement a tool like `next_step_recommendation` that returns the next recommended command based on the stored state (phase, pending tasks, any “Gate” criteria). The assistant could call this at the end of each phase, effectively asking “what should I do next?”, and your server would respond with something like: _“Proceed to P5: run /e2e-runner-setup to set up end-to-end testing”_. Alternatively, the server can be configured to push a notification to the client as soon as a phase’s exit criteria are met. Because the MCP server can maintain a _live context_ and even initiate calls, it serves as the **planner/foreman** in the workflow: tracking progress, updating the state store after each tool action, and guiding the AI on what tool or prompt to invoke next.
30 | 
31 | By drawing on existing patterns – a prompts library server for the base commands[github.com](https://github.com/tanker327/prompts-mcp-server#:~:text=Prompts%20MCP%20Server), a context-tracking layer for project state[lobehub.com](https://lobehub.com/mcp/aaronfeingold-mcp-project-context#:~:text=The%20MCP%20Project%20Context%20Server,for%20your%20development%20projects%2C%20maintaining), diagram-driven logic for sequencing[lobehub.com](https://lobehub.com/mcp/kayaozkur-mcp-server-mermaid#:~:text=%2A%20%60generate_diagram_from_code%60%20,Mermaid%20syntax%20with%20error%20details), and MCP’s event capabilities for proactivity[github.com](https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/102#:~:text=MCP%20is%20currently%20a%20stateful,us%20to%20support%20behaviors%20like) – you can transform your docs-only playbook into an intelligent MCP server. Such a server will not only respond to slash commands but also **act as a workflow orchestrator**, interpreting the project’s design map (your Mermaid flowchart) and proactively advancing the development process step by step. This ensures the AI assistant always knows _where you are_ in the project and what to do next, essentially becoming a hands-on project co-pilot rather than just a passive text generator.
32 | 
33 | References and Examples
34 | -----------------------
35 | 
36 | - _Prompts MCP Server_ – Open-source MCP server that exposes Markdown prompt templates as tools[github.com](https://github.com/tanker327/prompts-mcp-server#:~:text=Prompts%20MCP%20Server)[github.com](https://github.com/tanker327/prompts-mcp-server#:~:text=,title%2C%20description%2C%20tags%2C%20etc). Helpful as a blueprint for wrapping a docs catalog into a running MCP service.
37 | 
38 | - _Project Context MCP Server_ – Example MCP server that **maintains project state** (current phase, tasks, decisions) between sessions[lobehub.com](https://lobehub.com/mcp/aaronfeingold-mcp-project-context#:~:text=The%20MCP%20Project%20Context%20Server,for%20your%20development%20projects%2C%20maintaining), illustrating how to persist and query workflow context.
39 | 
40 | - _MCP Mermaid Server_ – Demonstrates tools for **interpreting and generating flowcharts**; e.g. it can analyze a Mermaid diagram’s structure and suggest improvements[lobehub.com](https://lobehub.com/mcp/kayaozkur-mcp-server-mermaid#:~:text=%2A%20%60generate_diagram_from_code%60%20,Mermaid%20syntax%20with%20error%20details), useful for building diagram-aware assistants.
41 | 
42 | - _MCP Protocol Discussions_ – MCP is stateful and supports **server-initiated messages** (notifications, streaming) to enable agent-driven workflows[github.com](https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/102#:~:text=MCP%20is%20currently%20a%20stateful,us%20to%20support%20behaviors%20like). This is the basis for making the assistant proactive in executing a sequence of steps.
43 | 
44 | - _MCP Architecture Guides_ – Overviews of MCP server components and session orchestration, showing how multi-step actions can be handled internally[workos.com](https://workos.com/blog/how-mcp-servers-work#:~:text=1,through%20multiple%20pages%20of%20results)[workos.com](https://workos.com/blog/how-mcp-servers-work#:~:text=The%20Session%20Orchestrator%20is%20responsible,for) (e.g. sequential tool calls managed by the server). These can guide the design of your “DAG-aware” planner logic within the server.
```

MCP/mcp_cli_integration_brief_prompts_claude_task_master.md

```
1 | # MCP CLI Integration Brief — `AcidicSoil/prompts` & `AcidicSoil/claude-task-master`
2 | 
3 | ## Scope
4 | This brief maps architectures and interfaces of two repositories and proposes a cross‑platform Node.js/TypeScript CLI design that interoperates over MCP stdio with JSON‑Schema I/O. It identifies commands, schemas, config formats, dependency/IPC patterns, and aggregates ecosystem best practices (MCP spec, transports, mcpdoc, Claude Desktop/Inspector, Smithery). Targets Node ≥18 on macOS/Windows/WSL/Linux; supports VS Code tasks and optional Docker.
5 | 
6 | ---
7 | 
8 | ## (1) Command taxonomy & MVP for `prompts` CLI
9 | **Binary:** `prompts`
10 | 
11 | **Core commands**
12 | 
13 | - `prompts list` — List prompt playbooks, tags, and paths (from catalog or directory scan).
14 | - `prompts show <name>` — Print resolved prompt (markdown) to stdout.
15 | - `prompts run <name> [--input <file>|--var k=v ...]` — Render with vars; emit JSON result (MCP‑friendly schema).
16 | - `prompts plan [<graph.json>|--auto]` — Build a task plan/graph from prompt metadata (e.g., prev/next links) or auto‑plan; output JSON.
17 | - `prompts mcp-server` (alias `mcp start`) — Start an MCP stdio server exposing prompts as tools.
18 | - `prompts call <tool> --json <file|- >` — Act as a thin MCP client to call a tool via local stdio bridge.
19 | - `prompts export [--format llms.txt]` — Generate/validate exports (e.g., llms.txt; validate catalog consistency).
20 | 
21 | **I/O & schemas**
22 | 
23 | - Inputs/outputs follow MCP JSON‑RPC envelopes with per‑tool JSON‑Schema (params/results). Each prompt tool advertises schema via server introspection.
24 | 
25 | **Minimal internal modules**
26 | 
27 | - Catalog loader (reads `catalog.json` or scans prompt dirs/front‑matter).
28 | - Renderer (applies `--var`/`--input` to templates; returns hydrated text/JSON).
29 | - MCP transport (stdio JSON‑RPC loop; tool registry; schema advertisement).
30 | 
31 | **Example table**
32 | 
33 | | Command | Purpose |
34 | |---|---|
35 | | `list` | Enumerate prompts with tags/phase |
36 | | `show <name>` | Output prompt markdown |
37 | | `run <name>` | Render/execute; JSON result |
38 | | `plan` | Output JSON task plan/graph |
39 | | `mcp-server` | Expose prompts as MCP tools |
40 | | `call <tool>` | Invoke tool via stdio; pipeable |
41 | | `export` | Emit/validate external formats |
42 | 
43 | ---
44 | 
45 | ## (2) Compatibility layer: `prompts` ⇄ `claude-task-master`
46 | **Transport:** MCP over stdio (JSON‑RPC 2.0). Persistent process preferred for multiple calls.
47 | 
48 | **Discovery & config**
49 | 
50 | - Prefer project `.mcp.json` / `mcp.config.(json|toml)` for server entries.
51 | - Environment fallbacks: e.g., `MCP_SERVERS`, `PROMPTS_DIR`, API keys.
52 | 
53 | **Tool namespace & schema**
54 | 
55 | - Methods like `prompts/<slug>` map to prompt tools. Each advertises `params`/`result` JSON‑Schema.
56 | - Errors: JSON‑RPC error with code/message; CLI exits non‑zero for shell use.
57 | 
58 | **Interoperation modes**
59 | 
60 | 1) **Task‑master→Prompts:** `claude-task-master` connects to `prompts mcp-server`; calls tools like `prompts/render_prompt`, `prompts/list_prompts`, `prompts/plan_session`.
61 | 2) **Prompts→Task‑master:** `prompts` acts as MCP client to call `taskmaster.run_plan` / `taskmaster.execute` where available.
62 | 
63 | **Sample `.mcp.json` entry**
64 | 
65 | ```json
66 | {
67 |   "servers": [
68 |     { "name": "PromptsTools", "command": "prompts mcp-server", "autoStart": true }
69 |   ]
70 | }
71 | ```
72 | 
73 | ---
74 | 
75 | ## (3) Sample end‑to‑end flows
76 | **Flow A: plan → run tools → persist**
77 | 
78 | 1. `prompts plan --auto > plan.json`
79 | 2. `claude-task-master run --plan plan.json --out run.json`
80 | 3. `prompts call prompts/render_prompt --json run.json | tee artifacts/prompt.txt`
81 | 
82 | **Flow B: single‑tool pipe**
83 | 
84 | ```sh
85 | prompts show define_prd_generator \
86 | | prompts call prompts/render_prompt --json - \
87 | | claude-task-master run --stdin
88 | ```
89 | 
90 | **Flow C: prompts orchestrates via task‑master**
91 | 
92 | ```sh
93 | prompts orchestrate <prompt> --goal "<objective>" --use-taskmaster
94 | ```
95 | 
96 | - Internally: connect via MCP, request plan, execute, stream results.
97 | 
98 | ---
99 | 
100 | ## (4) Security & sandboxing
101 | 
102 | - Prefer local stdio; avoid exposing network sockets. If remote, require auth and least‑privilege tokens.
103 | - Validate all inputs/outputs against JSON‑Schema before execution/use.
104 | - Side‑effects guarded: explicit flags for filesystem writes; use temp dirs; principle of least privilege.
105 | - Subprocess safety: use `execa`/spawn with controlled `PATH`, cwd, env allow‑lists.
106 | - Logging: structured logs for MCP requests/responses (redact secrets); per‑step audit trail.
107 | - Keys & secrets: env vars or OS keychain; never log values; optional secret manager integration.
108 | - Idempotency: design tools to be safe on retries; include operation IDs; write‑once file naming.
109 | 
110 | ---
111 | 
112 | ## (5) Phased roadmap (with refs & snippets)
113 | **Phase 0 — Scaffold**
114 | 
115 | - Add TS CLI skeleton in `prompts`; choose `commander` for MVP. Ensure Node ≥18, cross‑platform paths, ESM/CJS choice.
116 | - Wire scripts: `build`, `dev`, `lint`, `test`.
117 | 
118 | **Commander skeleton**
119 | 
120 | ```ts
121 | #!/usr/bin/env node
122 | import { Command } from 'commander';
123 | const program = new Command();
124 | program.name('prompts').version('0.1.0');
125 | program.command('list').action(async () => {/* scan & print */});
126 | program.parseAsync(process.argv);
127 | ```
128 | 
129 | **Phase 1 — Core commands**
130 | 
131 | - Implement `list`, `show`, `run`, `plan`; JSON output by default; `--format json|text`.
132 | - Basic renderer (front‑matter + vars). Generate simple plan from metadata (prev/next/phase).
133 | 
134 | **Phase 2 — MCP stdio server**
135 | 
136 | - `prompts mcp-server`: long‑lived JSON‑RPC loop on stdin/stdout; advertise tools & schemas.
137 | - Map `method`→prompt; unify with `run` execution path.
138 | - Add `prompts call` thin client for piping/system tests.
139 | 
140 | **Phase 3 — Orchestration interop**
141 | 
142 | - Read `.mcp.json`; auto‑launch/attach to `claude-task-master`.
143 | - Concurrency + retries via `p-limit`/`p-retry`.
144 | - Structured logging; `--verbose`; JSON logs for IDE ingestion.
145 | 
146 | **Phase 4 — Packaging & plugins**
147 | 
148 | - Evaluate `oclif` if plugins/autoupdater required; otherwise keep Commander.
149 | - Config discovery: `mcp.config.json|toml`, env overrides; home‑dir search.
150 | - Optional: Dockerfile + VS Code tasks for local dev.
151 | 
152 | **Phase 5 — Advanced**
153 | 
154 | - Multi‑tool coordination (parallel steps); session state cache; resumable runs.
155 | - Bridges (LangGraph/LangChain/Smithery); MCP Inspector for server testing.
156 | - `export --format llms.txt` validation; cross‑repo plugin loading.
157 | 
158 | ---
159 | 
160 | ## Implementation details & patterns
161 | **Config precedence**
162 | 
163 | 1) CLI flags → 2) env vars → 3) project config (`.mcp.json` / `mcp.config.*`) → 4) defaults.
164 | 
165 | **JSON‑RPC envelopes**
166 | 
167 | ```json
168 | { "jsonrpc": "2.0", "id": 1, "method": "prompts/render_prompt", "params": { "name": "<slug>", "vars": {"k":"v"} } }
169 | ```
170 | 
171 | **Result envelope**
172 | 
173 | ```json
174 | { "jsonrpc": "2.0", "id": 1, "result": { "output": "...", "artifacts": [{"path":"..."}] } }
175 | ```
176 | 
177 | **Exit codes**
178 | 
179 | - `0` success; `1` validation error; `2` tool not found; `3` transport error; `>3` reserved.
180 | 
181 | **Logging**
182 | 
183 | - Default human logs to stderr; machine‑readable JSON to stdout only when `--json`.
184 | 
185 | **Telemetry (optional, off by default)**
186 | 
187 | - Event names: `plan_generated`, `tool_invoked`, `rpc_error` (redact PII; opt‑in only).
188 | 
189 | ---
190 | 
191 | ## Licensing & contribution notes
192 | 
193 | - `claude-task-master`: MIT with Commons Clause (permissive; no selling as‑a‑service). Follow upstream tests/contrib patterns.
194 | - `prompts`: add/confirm OSS license; enforce metadata validation (`validate:metadata`), rebuild catalog pre‑commit.
195 | 
196 | ---
197 | 
198 | ## Appendix A — Minimal JSON Schemas (examples)
199 | **Render Prompt (params)**
200 | 
201 | ```json
202 | {
203 |   "$schema": "https://json-schema.org/draft/2020-12/schema",
204 |   "type": "object",
205 |   "required": ["name"],
206 |   "properties": {
207 |     "name": {"type": "string"},
208 |     "vars": {"type": "object", "additionalProperties": true},
209 |     "input": {"type": "object", "additionalProperties": true}
210 |   }
211 | }
212 | ```
213 | 
214 | **Render Prompt (result)**
215 | 
216 | ```json
217 | {
218 |   "$schema": "https://json-schema.org/draft/2020-12/schema",
219 |   "type": "object",
220 |   "required": ["output"],
221 |   "properties": {
222 |     "output": {"type": "string"},
223 |     "artifacts": {
224 |       "type": "array",
225 |       "items": {"type": "object", "properties": {"path": {"type":"string"}}}
226 |     }
227 |   }
228 | }
229 | ```
230 | 
231 | **Plan Session (params/result)**
232 | 
233 | ```json
234 | {
235 |   "params": {
236 |     "$schema": "https://json-schema.org/draft/2020-12/schema",
237 |     "type": "object",
238 |     "properties": {"spec": {"type":"string"}, "auto": {"type":"boolean"}}
239 |   },
240 |   "result": {
241 |     "$schema": "https://json-schema.org/draft/2020-12/schema",
242 |     "type": "object",
243 |     "required": ["plan"],
244 |     "properties": {
245 |       "plan": {
246 |         "type": "array",
247 |         "items": {"type":"object", "properties": {"step": {"type":"string"}, "desc": {"type":"string"}}}
248 |       }
249 |     }
250 |   }
251 | }
252 | ```
253 | 
254 | ## Appendix B — Suggested package set
255 | 
256 | - `commander` (CLI), `zod` or `ajv` (schema validation), `execa` (subprocess), `p-limit`, `p-retry`, `chalk` (TTY), `ora` (spinners, optional), `winston` or `pino` (logs), `tsx` (dev), `tsup`/`esbuild` (build), `vitest`/`jest` (tests).
257 | 
258 | ## Appendix C — VS Code tasks (example)
259 | 
260 | ```json
261 | {
262 |   "version": "2.0.0",
263 |   "tasks": [
264 |     { "label": "Prompts: MCP Server", "type": "shell", "command": "prompts mcp-server" },
265 |     { "label": "TaskMaster: Run Plan", "type": "shell", "command": "claude-task-master run --plan plan.json --out run.json" }
266 |   ]
267 | }
268 | ```
269 | 
```

MCP/mcp_server_research_report_docs-proactive_workflow_assistant_local_stdio_mermaid_dag.md

```
1 | # MCP Server Research Report — Converting a Markdown Prompt Library into a Proactive Workflow Assistant (Local/STDIO, Mermaid DAG)
2 | 
3 | > Scope: Turn a Markdown-only prompt repo (Codex CLI playbooks) into a local-first MCP server that exposes prompts as tools, tracks project state, interprets a Mermaid workflow, and proactively suggests/executes next steps via stdio with MCP Inspector / Claude Desktop.
4 | > Note: Citations are provided in chat alongside this canvas.
5 | 
6 | ---
7 | 
8 | ## 1) Executive Summary
9 | A viable path is to wrap each Markdown playbook as an MCP **prompt/tool**, add a **state store** to track phase/tasks, parse the **Mermaid** DAG to compute “what’s next,” and use **server notifications** or a `next_step` tool to proactively guide execution. Transport is **stdio** to integrate with Claude Desktop and MCP Inspector.
10 | 
11 | ---
12 | 
13 | ## 2) MCP-Native Patterns to Reuse
14 | 
15 | ### A. Prompts-as-Tools
16 | 
17 | - Expose each Markdown playbook as an MCP **prompt** and/or **tool** (name, description, inputs).
18 | - Optional: Read YAML front‑matter for metadata (phase tags, gates, inputs, outputs).
19 | - Provide list/get/run endpoints: `list_prompts`, `get_prompt`, `run_prompt` or a single `run_{slug}` tool.
20 | 
21 | ### B. Local-First over STDIO
22 | 
23 | - Package the server as a CLI (Node/TS or Python) that speaks MCP over **stdio**.
24 | - Ship a minimal config example for Claude Desktop / MCP Inspector.
25 | 
26 | ### C. Persistent Project State
27 | 
28 | - Maintain a simple SQLite/JSON store of: `phase`, `tasks`, `decisions`, `artifacts`, and `gate_status`.
29 | - Provide tools: `get_state`, `set_state`, `advance_phase`, `add_task`, `complete_task`, `log_decision`.
30 | 
31 | ### D. Diagram-Aware Planner (Mermaid)
32 | 
33 | - Parse `workflow.mmd` and build a DAG: nodes = phases/steps, edges = transitions (with optional condition tags).
34 | - Compute **eligible next steps** as nodes with satisfied predecessors and unmet outputs.
35 | - Map nodes → prompt/tool slugs, so planner can suggest or trigger the right command.
36 | 
37 | ### E. Proactive Guidance
38 | 
39 | - Implement `next_step_recommendation(state)` returning: next node(s), rationale, required inputs, and candidate tools.
40 | - Optionally send **server notifications** to nudge when a gate is cleared, or auto‑call follow‑ups when user toggles an `auto_advance` flag.
41 | 
42 | ---
43 | 
44 | ## 3) Reference Implementations & Docs (Mapped to Needs)
45 | 
46 | - **Prompts exposure**: Reuse the official MCP **Prompts** concept; mirror shape/semantics; treat Markdown playbooks as named prompt templates with args.
47 | - **Mermaid/diagram ops**: Use an existing **Mermaid MCP** (or embed a lightweight mermaid parser) to analyze graph structure and generate/validate diagrams.
48 | - **Project state servers**: Study small **project‑context/tracking** MCP servers (often SQLite + FastMCP) for patterns: schema, tool surface, session persistence.
49 | - **Inspector & debugging**: Use **MCP Inspector** to iterate on tool shapes, prompt discovery, notifications, and stdio wiring.
50 | - **Architecture (local vs remote)**: Follow **Architecture** guidance for local stdio servers and client attachment.
51 | - **Server notifications**: Implement proactive hints via notifications panel; or expose a `poll_next_step` tool the client calls after each action.
52 | 
53 | ---
54 | 
55 | ## 4) Minimal Architecture (ASCII)
56 | 
57 | ```
58 | +--------------------+       stdio       +--------------------+
59 | |  Claude Desktop /  | <----------------> |   MCP Server      |
60 | |  MCP Inspector     |                   |  (Node/TS or Py)  |
61 | +--------------------+                   +--------------------+
62 |                                              |  |   |   |
63 |                                              |  |   |   +-- Notifications (proactive hints)
64 |                                              |  |   +------ State Store (SQLite/JSON)
65 |                                              |  +---------- Mermaid DAG Parser
66 |                                              +------------- Prompts/Tools Registry
67 | ```
68 | 
69 | **Core modules**
70 | 
71 | - `server.ts` / `main.py`: stdio transport, tool & prompt registry
72 | - `registry/`: loads Markdown prompts + front‑matter → tool descriptors
73 | - `state/`: persistence (SQLite/SQLModel or JSON + locks)
74 | - `planner/mermaid.ts`: parse DAG; next-step computation; gate checks
75 | - `orchestrator/`: optional sequencing for multi-step tool chains
76 | 
77 | ---
78 | 
79 | ## 5) Mermaid DAG → Next-Step Logic (Algorithm Sketch)
80 | 
81 | 1. **Load DAG** from `workflow.mmd` → `Graph{nodes, edges}`
82 | 2. **Annotate nodes** with metadata from prompt front‑matter (phase, inputs, outputs, gates)
83 | 3. **Read state**: `completed_nodes`, `artifacts`, `decisions`, `signals`
84 | 4. **Eligible set** = nodes where all predecessors ∈ `completed_nodes` and gate preconditions satisfied
85 | 5. Rank eligible nodes by: (a) critical path, (b) missing artifacts, (c) user intent tokens in last message
86 | 6. Emit `NextStep{nodeId, promptSlug, rationale, requiredInputs}`
87 | 7. If `auto_advance=true` and inputs resolvable, **invoke** tool; else **notify** suggestion
88 | 
89 | ---
90 | 
91 | ## 6) Tool Surface (Draft)
92 | 
93 | - `list_prompts()` → `[PromptMeta]`
94 | - `run_prompt(slug, args)` → `{outputs, artifacts}`
95 | - `get_state()` / `set_state(patch)` → `{phase, tasks, gates, artifacts}`
96 | - `advance_phase(target)` → `{phase}` (validates Mermaid edges + gate checks)
97 | - `next_step_recommendation()` → `{candidates[], rationale, missing_inputs}`
98 | - `record_gate_result(gateId, pass|fail, notes)` → updates state
99 | - `render_workflow(format=svg|png)` → returns diagram for UI feedback
100 | 
101 | ---
102 | 
103 | ## 7) Implementation Notes
104 | 
105 | - **Front‑matter schema** per playbook: `id`, `title`, `phase`, `inputs`, `produces`, `gates`, `estimated_cost`, `tags`.
106 | - **Idempotency**: tools should be safe to re‑run or detect prior outputs (hash/artifact check).
107 | - **Artifacts**: persist key outputs (files, links) with reverse index → nodes that produced them.
108 | - **Testing**: scriptable Inspector sessions; golden files for `next_step_recommendation` on sample states.
109 | - **Security**: if any tool shells out, sandbox paths and validate args; prefer explicit allow‑lists.
110 | 
111 | ---
112 | 
113 | ## 8) Quickstart (TS Example Outline)
114 | 
115 | 1. **Scaffold**: `pnpm add @modelcontextprotocol/sdk` (or FastMCP for Python)
116 | 2. **Load prompts**: glob `prompts/**/*.md`, parse front‑matter, register with SDK
117 | 3. **State store**: init SQLite/JSON; define schema + accessors
118 | 4. **Mermaid parser**: load `workflow.mmd` → `Graph` (use existing lib or simple parser)
119 | 5. **Planner tool**: implement `next_step_recommendation()` using DAG + state
120 | 6. **Notifications**: after tool success, compute next candidates and `notify()`
121 | 7. **Inspect**: run via MCP Inspector; iterate shapes/IO contracts
122 | 
123 | ---
124 | 
125 | ## 9) Risks & Limitations
126 | 
127 | - **Ecosystem flux**: MCP SDK revisions may change prompt/tool registration APIs.
128 | - **Diagram fidelity**: Mermaid → DAG parsing may miss semantics (conditions, loops) without conventions.
129 | - **Autonomy boundaries**: aggressive auto‑advance can surprise users; keep a toggle and confirmations.
130 | - **State drift**: ensure gates reflect real artifacts (tests, files) not just flags; add verifiers.
131 | 
132 | ---
133 | 
134 | ## 10) Action Plan (2 Weeks)
135 | 
136 | **Day 1–2**  Setup server skeleton (stdio), prompt loader, and basic `list/get/run` tools.
137 | **Day 3–4**  Add state store + CRUD tools; persist phase/tasks/decisions.
138 | **Day 5–6**  Implement Mermaid parser + node↔prompt mapping.
139 | **Day 7–8**  Build `next_step_recommendation` + ranking; wire notifications.
140 | **Day 9–10**  Inspector test flows; add idempotency and artifact indexing.
141 | **Day 11–12**  Author gates for each phase; add `advance_phase` validation.
142 | **Day 13–14**  Hardening: errors, metrics logs, sample configs for Claude Desktop/Inspector.
143 | 
144 | ---
145 | 
146 | ## 11) Deliverables
147 | 
148 | - MCP server (stdio) with prompt registry, state store, Mermaid planner.
149 | - Inspector scripts & fixtures for reproducible tests.
150 | - Sample client configs (Claude Desktop / Inspector).
151 | - Developer docs: front‑matter schema, tool contracts, gate policy.
152 | 
153 | **Sources used (high-signal):**
154 | 
155 | - MCP Prompts concept & API (protocol site). ([Model Context Protocol][1])
156 | - MCP architecture (local/STDIO vs remote/HTTP). ([Model Context Protocol][2])
157 | - MCP Inspector docs & GitHub (testing stdio servers, notifications view). ([Model Context Protocol][3])
158 | - Mermaid-focused MCP servers (features, analysis): Lobehub page; GitHub impl; marketplace entry. ([LobeHub][4])
159 | - Project/persistent-context MCP servers (state, planning): discovery pages/articles. ([LobeChat][5])
160 | - How-to guides for building MCP servers (quickstart, prompts in servers, notifications). ([Medium][6])
161 | - Overview/tutorials of MCP features (prompts/resources/tools, practical server build). ([WorkOS][7])
162 | 
163 | [1]: https://modelcontextprotocol.io/docs/concepts/prompts?utm_source=chatgpt.com "Prompts"
164 | [2]: https://modelcontextprotocol.io/docs/concepts/architecture?utm_source=chatgpt.com "Architecture overview"
165 | [3]: https://modelcontextprotocol.io/docs/tools/inspector?utm_source=chatgpt.com "MCP Inspector"
166 | [4]: https://lobehub.com/mcp/kayaozkur-mcp-server-mermaid?utm_source=chatgpt.com "MCP Mermaid Server"
167 | [5]: https://lobechat.com/discover/mcp/aaronfeingold-mcp-project-context?utm_source=chatgpt.com "MCP Project Context Server"
168 | [6]: https://matt-harper.medium.com/getting-started-with-mcp-model-context-protocol-ded288ef3ae7?utm_source=chatgpt.com "Getting Started with MCP (Model Context Protocol)"
169 | [7]: https://workos.com/blog/mcp-features-guide?utm_source=chatgpt.com "Understanding MCP features: Tools, Resources, Prompts ..."
```

scripts/build_catalog.ts

```
1 | import { promises as fs } from 'fs';
2 | import path from 'path';
3 | 
4 | import { MetadataValue, parseFrontMatter } from './front_matter';
5 | import { collectMarkdownFiles, loadPhases } from './markdown_utils';
6 | import { PromptCatalog, PromptCatalogEntry, normalizePhaseLabel } from './catalog_types';
7 | import { writeFileAtomic } from './file_utils';
8 | import { generateDocs, synchronizeWorkflowDoc } from './generate_docs';
9 | 
10 | type PromptMetadata = Record<string, MetadataValue | undefined> & {
11 |   phase?: MetadataValue;
12 |   gate?: MetadataValue;
13 |   status?: MetadataValue;
14 |   previous?: MetadataValue;
15 |   next?: MetadataValue;
16 | };
17 | 
18 | interface MissingPhaseRecord {
19 |   label: string;
20 |   files: Set<string>;
21 | }
22 | 
23 | async function main(): Promise<void> {
24 |   const args = new Set(process.argv.slice(2));
25 |   const updateWorkflow = args.has('--update-workflow');
26 |   const repoRoot = path.resolve(__dirname, '..');
27 |   const workflowPath = path.join(repoRoot, 'WORKFLOW.md');
28 |   let validPhases = await loadPhases(workflowPath);
29 |   let normalizedPhaseLookup = buildNormalizedPhaseSet(validPhases);
30 |   const markdownFiles = await collectMarkdownFiles(repoRoot);
31 | 
32 |   const phaseBuckets = new Map<string, PromptCatalogEntry[]>();
33 |   const commandIndex = new Map<string, string>();
34 |   const errors: string[] = [];
35 |   const missingPhases = new Map<string, MissingPhaseRecord>();
36 | 
37 |   for (const filePath of markdownFiles) {
38 |     const relativePath = path.relative(repoRoot, filePath);
39 |     const content = await fs.readFile(filePath, 'utf8');
40 |     const parsed = parseFrontMatter(content);
41 |     if (!parsed) {
42 |       continue;
43 |     }
44 | 
45 |     const metadata = parsed.metadata as PromptMetadata;
46 |     const metadataErrors: string[] = [];
47 | 
48 |     const phases = extractPhases(metadata.phase, relativePath, metadataErrors);
49 |     const gate = extractString(metadata.gate, 'gate', relativePath, metadataErrors);
50 |     const status = extractString(metadata.status, 'status', relativePath, metadataErrors);
51 |     const previous = extractStringArray(metadata.previous, 'previous', relativePath, metadataErrors);
52 |     const next = extractStringArray(metadata.next, 'next', relativePath, metadataErrors);
53 | 
54 |     if (metadataErrors.length > 0) {
55 |       errors.push(...metadataErrors);
56 |       continue;
57 |     }
58 | 
59 |     const body = content.slice(parsed.endOffset);
60 |     const title = extractTitle(body, relativePath);
61 |     const command = extractCommand(body, relativePath);
62 |     const purpose = extractPurpose(body) ?? '';
63 | 
64 |     registerCommand(commandIndex, command, relativePath, errors);
65 | 
66 |     for (const phaseLabel of phases) {
67 |       const normalizedPhase = normalizePhaseLabel(phaseLabel);
68 |       if (!phaseExists(normalizedPhase, normalizedPhaseLookup)) {
69 |         const existing = missingPhases.get(normalizedPhase);
70 |         if (existing) {
71 |           existing.files.add(relativePath);
72 |         } else {
73 |           missingPhases.set(normalizedPhase, { label: phaseLabel, files: new Set([relativePath]) });
74 |         }
75 |         if (!updateWorkflow) {
76 |           errors.push(`${relativePath}: phase "${phaseLabel}" not found in WORKFLOW.md.`);
77 |         }
78 |       }
79 | 
80 |       const entry: PromptCatalogEntry = {
81 |         phase: phaseLabel,
82 |         command,
83 |         title,
84 |         purpose,
85 |         gate,
86 |         status,
87 |         previous,
88 |         next,
89 |         path: relativePath,
90 |       };
91 |       const bucket = phaseBuckets.get(normalizedPhase);
92 |       if (bucket) {
93 |         bucket.push(entry);
94 |       } else {
95 |         phaseBuckets.set(normalizedPhase, [entry]);
96 |       }
97 |     }
98 |   }
99 | 
100 |   const { catalog: ordered, sortedKeys } = buildOrderedCatalog(phaseBuckets);
101 | 
102 |   if (updateWorkflow && missingPhases.size > 0) {
103 |     const workflowUpdated = await synchronizeWorkflowDoc(repoRoot, ordered);
104 |     if (workflowUpdated) {
105 |       console.log('Inserted missing phases into WORKFLOW.md before catalog generation.');
106 |     }
107 |     validPhases = await loadPhases(workflowPath);
108 |     normalizedPhaseLookup = buildNormalizedPhaseSet(validPhases);
109 |     for (const [normalized, record] of missingPhases) {
110 |       if (phaseExists(normalized, normalizedPhaseLookup)) {
111 |         continue;
112 |       }
113 |       const files = Array.from(record.files).sort();
114 |       errors.push(
115 |         `Phase "${record.label}" referenced in ${files.join(', ')} is missing from WORKFLOW.md after synchronization.`,
116 |       );
117 |     }
118 |   }
119 | 
120 |   if (errors.length > 0) {
121 |     console.error('Failed to build catalog:\n');
122 |     for (const error of errors) {
123 |       console.error(`- ${error}`);
124 |     }
125 |     process.exitCode = 1;
126 |     return;
127 |   }
128 | 
129 |   const catalogPath = path.join(repoRoot, 'catalog.json');
130 |   const catalogPayload = `${JSON.stringify(ordered, null, 2)}\n`;
131 |   const catalogUpdated = await writeFileAtomic(catalogPath, catalogPayload);
132 |   if (catalogUpdated) {
133 |     console.log(`Wrote catalog with ${sortedKeys.length} phase group(s) to ${catalogPath}`);
134 |   } else {
135 |     console.log(`Catalog already up to date at ${catalogPath}`);
136 |   }
137 | 
138 |   await generateDocs(repoRoot, ordered, { updateWorkflow });
139 | }
140 | 
141 | function buildOrderedCatalog(
142 |   buckets: Map<string, PromptCatalogEntry[]>,
143 | ): { catalog: PromptCatalog; sortedKeys: string[] } {
144 |   const sortedKeys = Array.from(buckets.keys()).sort((a, b) => a.localeCompare(b));
145 |   const catalog: PromptCatalog = {};
146 |   for (const key of sortedKeys) {
147 |     const prompts = buckets.get(key);
148 |     if (!prompts) {
149 |       continue;
150 |     }
151 |     catalog[key] = prompts.slice().sort((a, b) => a.command.localeCompare(b.command));
152 |   }
153 |   return { catalog, sortedKeys: Object.keys(catalog) };
154 | }
155 | 
156 | function extractPhases(
157 |   value: MetadataValue | undefined,
158 |   file: string,
159 |   errors: string[],
160 | ): string[] {
161 |   if (value === undefined) {
162 |     errors.push(`${file}: missing required field "phase".`);
163 |     return [];
164 |   }
165 |   const raw = Array.isArray(value) ? value : [value];
166 |   if (raw.length === 0) {
167 |     errors.push(`${file}: "phase" must contain at least one entry.`);
168 |     return [];
169 |   }
170 |   const phases: string[] = [];
171 |   for (const item of raw) {
172 |     if (typeof item !== 'string' || item.trim() === '') {
173 |       errors.push(`${file}: "phase" contains an invalid value.`);
174 |       continue;
175 |     }
176 |     phases.push(item.trim());
177 |   }
178 |   return phases;
179 | }
180 | 
181 | function extractString(
182 |   value: MetadataValue | undefined,
183 |   field: string,
184 |   file: string,
185 |   errors: string[],
186 | ): string {
187 |   if (typeof value !== 'string' || value.trim() === '') {
188 |     errors.push(`${file}: missing or empty "${field}".`);
189 |     return '';
190 |   }
191 |   return value.trim();
192 | }
193 | 
194 | function extractStringArray(
195 |   value: MetadataValue | undefined,
196 |   field: string,
197 |   file: string,
198 |   errors: string[],
199 | ): string[] {
200 |   if (!Array.isArray(value) || value.length === 0) {
201 |     errors.push(`${file}: "${field}" must be a non-empty array.`);
202 |     return [];
203 |   }
204 |   const result: string[] = [];
205 |   for (const item of value) {
206 |     if (typeof item !== 'string' || item.trim() === '') {
207 |       errors.push(`${file}: "${field}" contains an invalid entry.`);
208 |       continue;
209 |     }
210 |     result.push(item.trim());
211 |   }
212 |   return result;
213 | }
214 | 
215 | function extractTitle(body: string, file: string): string {
216 |   const headingMatch = body.match(/^#\s+(.+)$/m);
217 |   if (headingMatch) {
218 |     return headingMatch[1].trim();
219 |   }
220 |   const base = path.basename(file, path.extname(file));
221 |   const words = base.split(/[-_]+/).filter(Boolean);
222 |   if (words.length === 0) {
223 |     return base;
224 |   }
225 |   return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
226 | }
227 | 
228 | function extractCommand(body: string, file: string): string {
229 |   const command = extractField(body, 'Trigger');
230 |   if (command) {
231 |     return command;
232 |   }
233 |   const fallback = path.basename(file, path.extname(file));
234 |   return `/${fallback}`;
235 | }
236 | 
237 | function extractPurpose(body: string): string | null {
238 |   return extractField(body, 'Purpose');
239 | }
240 | 
241 | function extractField(body: string, label: string): string | null {
242 |   const lines = body.split(/\r?\n/);
243 |   const target = `${label.toLowerCase()}:`;
244 |   for (const rawLine of lines) {
245 |     const trimmed = rawLine.trim();
246 |     if (!trimmed) {
247 |       continue;
248 |     }
249 |     const sanitized = trimmed.replace(/\*\*/g, '').replace(/__/g, '');
250 |     if (!sanitized.toLowerCase().startsWith(target)) {
251 |       continue;
252 |     }
253 |     const value = sanitized.slice(target.length).trim();
254 |     return stripFormatting(value);
255 |   }
256 |   return null;
257 | }
258 | 
259 | function stripFormatting(value: string): string {
260 |   let result = value.trim();
261 |   if ((result.startsWith('`') && result.endsWith('`')) || (result.startsWith('"') && result.endsWith('"'))) {
262 |     result = result.slice(1, -1).trim();
263 |   }
264 |   if (result.startsWith("'") && result.endsWith("'")) {
265 |     result = result.slice(1, -1).trim();
266 |   }
267 |   return result;
268 | }
269 | 
270 | function registerCommand(
271 |   commandIndex: Map<string, string>,
272 |   command: string,
273 |   file: string,
274 |   errors: string[],
275 | ): void {
276 |   const existing = commandIndex.get(command);
277 |   if (existing && existing !== file) {
278 |     errors.push(`Duplicate command "${command}" found in ${existing} and ${file}.`);
279 |     return;
280 |   }
281 |   commandIndex.set(command, file);
282 | }
283 | 
284 | function buildNormalizedPhaseSet(phases: Set<string>): Set<string> {
285 |   const normalized = new Set<string>();
286 |   for (const phase of phases) {
287 |     const key = normalizePhaseLabel(phase);
288 |     if (key) {
289 |       normalized.add(key);
290 |     }
291 |   }
292 |   return normalized;
293 | }
294 | 
295 | function phaseExists(normalizedPhase: string, normalizedPhases: Set<string>): boolean {
296 |   if (!normalizedPhase) {
297 |     return false;
298 |   }
299 |   return normalizedPhases.has(normalizedPhase);
300 | }
301 | 
302 | main().catch((error) => {
303 |   console.error('Failed to build catalog.');
304 |   console.error(error);
305 |   process.exitCode = 1;
306 | });
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
1 | export type Scalar = string;
2 | 
3 | export type MetadataValue = Scalar | Scalar[];
4 | 
5 | export interface ParsedFrontMatter {
6 |   metadata: Record<string, MetadataValue>;
7 |   endOffset: number;
8 | }
9 | 
10 | export function parseFrontMatter(content: string): ParsedFrontMatter | null {
11 |   if (!content.startsWith('---')) {
12 |     return null;
13 |   }
14 |   const closingIndex = content.indexOf('\n---', 3);
15 |   if (closingIndex === -1) {
16 |     throw new Error('Front matter missing closing delimiter.');
17 |   }
18 |   const frontMatter = content.slice(4, closingIndex);
19 |   const lines = frontMatter.split('\n');
20 |   const data: Record<string, MetadataValue> = {};
21 |   let currentKey: string | null = null;
22 | 
23 |   for (const rawLine of lines) {
24 |     const line = rawLine.trimEnd();
25 |     if (line.trim() === '') {
26 |       continue;
27 |     }
28 |     const itemMatch = line.match(/^[-\s]+-\s+(.*)$/);
29 |     if (itemMatch) {
30 |       if (!currentKey) {
31 |         throw new Error(`Array item encountered without a key in front matter: "${line}"`);
32 |       }
33 |       const array = (data[currentKey] as Scalar[]) || [];
34 |       array.push(parseScalar(itemMatch[1].trim()));
35 |       data[currentKey] = array;
36 |       continue;
37 |     }
38 | 
39 |     const keyMatch = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
40 |     if (!keyMatch) {
41 |       throw new Error(`Unable to parse front matter line: "${line}"`);
42 |     }
43 |     const [, key, rawValue] = keyMatch;
44 |     if (rawValue.length === 0) {
45 |       data[key] = [];
46 |       currentKey = key;
47 |     } else {
48 |       data[key] = parseScalar(rawValue);
49 |       currentKey = null;
50 |     }
51 |   }
52 | 
53 |   return { metadata: data, endOffset: closingIndex + 4 };
54 | }
55 | 
56 | function parseScalar(value: string): string {
57 |   const trimmed = value.trim();
58 |   if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
59 |     const inner = trimmed.slice(1, -1);
60 |     return inner.replace(/\\"/g, '"').replace(/\\'/g, "'");
61 |   }
62 |   return trimmed;
63 | }
```

scripts/generate_docs.ts

```
1 | import { promises as fs } from 'fs';
2 | import path from 'path';
3 | 
4 | import { PromptCatalog, PromptCatalogEntry, normalizePhaseLabel } from './catalog_types';
5 | import { writeFileAtomic } from './file_utils';
6 | 
7 | interface GenerateDocsOptions {
8 |   updateWorkflow: boolean;
9 | }
10 | 
11 | interface CrossEntry {
12 |   command: string;
13 |   stageTieIn: string;
14 |   purpose: string;
15 | }
16 | 
17 | const PHASE_BLOCK_BEGIN = '<!-- BEGIN GENERATED PHASES -->';
18 | const PHASE_BLOCK_END = '<!-- END GENERATED PHASES -->';
19 | const COMMANDS_BLOCK_BEGIN = '<!-- commands:start -->';
20 | const COMMANDS_BLOCK_END = '<!-- commands:end -->';
21 | 
22 | interface PhaseSectionSnapshot {
23 |   headingLine: string;
24 |   normalizedKey: string;
25 |   manualLines: string[];
26 | }
27 | 
28 | export async function generateDocs(
29 |   repoRoot: string,
30 |   catalog: PromptCatalog,
31 |   options: GenerateDocsOptions,
32 | ): Promise<void> {
33 |   const readmeUpdated = await updateReadme(repoRoot, catalog);
34 |   if (readmeUpdated) {
35 |     console.log('Updated README.md metadata tables.');
36 |   } else {
37 |     console.log('README.md metadata tables already match catalog.json.');
38 |   }
39 | 
40 |   if (options.updateWorkflow) {
41 |     const workflowDocUpdated = await synchronizeWorkflowDoc(repoRoot, catalog);
42 |     if (workflowDocUpdated) {
43 |       console.log('Synchronized WORKFLOW.md phase catalog.');
44 |     } else {
45 |       console.log('WORKFLOW.md already matches the generated phase catalog.');
46 |     }
47 | 
48 |     const workflowUpdated = await regenerateWorkflow(repoRoot, catalog);
49 |     if (workflowUpdated) {
50 |       console.log('Regenerated workflow.mmd from catalog graph.');
51 |     } else {
52 |       console.log('workflow.mmd already up to date with catalog graph.');
53 |     }
54 |   } else {
55 |     console.log('Skipped workflow.mmd regeneration (pass --update-workflow to enable).');
56 |   }
57 | }
58 | 
59 | export async function synchronizeWorkflowDoc(repoRoot: string, catalog: PromptCatalog): Promise<boolean> {
60 |   const workflowPath = path.join(repoRoot, 'WORKFLOW.md');
61 |   const original = await fs.readFile(workflowPath, 'utf8');
62 |   const lines = original.split(/\r?\n/);
63 | 
64 |   const blockStartIndex = lines.findIndex((line) => line.trim() === PHASE_BLOCK_BEGIN);
65 |   const blockEndIndex = lines.findIndex((line) => line.trim() === PHASE_BLOCK_END);
66 |   if (blockStartIndex === -1 || blockEndIndex === -1 || blockEndIndex <= blockStartIndex) {
67 |     throw new Error('WORKFLOW.md is missing generated phase markers.');
68 |   }
69 | 
70 |   const blockLines = lines.slice(blockStartIndex + 1, blockEndIndex);
71 |   const existingSections = parsePhaseSections(blockLines);
72 |   const manualLookup = new Map<string, PhaseSectionSnapshot>();
73 |   for (const section of existingSections) {
74 |     manualLookup.set(section.normalizedKey, section);
75 |   }
76 | 
77 |   const existingOrder = existingSections.map((section) => section.normalizedKey);
78 |   const catalogKeys = Object.keys(catalog);
79 |   const newKeys = catalogKeys.filter((key) => !manualLookup.has(key)).sort((a, b) => comparePhaseKeys(a, b));
80 |   const orderedKeys = [...existingOrder, ...newKeys];
81 | 
82 |   const renderedBlock: string[] = [];
83 |   for (const key of orderedKeys) {
84 |     const snapshot = manualLookup.get(key);
85 |     const bucket = catalog[key] ?? [];
86 |     const headingLine = snapshot?.headingLine ?? `### ${resolvePhaseHeading(key, bucket)}`;
87 |     const manualLines = snapshot?.manualLines ?? createManualStub(resolvePhaseHeading(key, bucket));
88 |     const commandLines = buildCommandLines(bucket);
89 | 
90 |     if (renderedBlock.length > 0) {
91 |       renderedBlock.push('');
92 |     }
93 | 
94 |     renderedBlock.push(headingLine);
95 |     renderedBlock.push('');
96 |     if (manualLines.length > 0) {
97 |       renderedBlock.push(...manualLines);
98 |       if (manualLines[manualLines.length - 1].trim() !== '') {
99 |         renderedBlock.push('');
100 |       }
101 |     }
102 | 
103 |     renderedBlock.push(COMMANDS_BLOCK_BEGIN);
104 |     renderedBlock.push(...commandLines);
105 |     renderedBlock.push(COMMANDS_BLOCK_END);
106 |   }
107 | 
108 |   while (renderedBlock.length > 0 && renderedBlock[renderedBlock.length - 1].trim() === '') {
109 |     renderedBlock.pop();
110 |   }
111 | 
112 |   const replacement = [PHASE_BLOCK_BEGIN, ...renderedBlock, PHASE_BLOCK_END];
113 |   const nextLines = [...lines];
114 |   nextLines.splice(blockStartIndex, blockEndIndex - blockStartIndex + 1, ...replacement);
115 |   const updatedContent = ensureTrailingNewline(nextLines.join('\n'));
116 |   const normalizedOriginal = ensureTrailingNewline(lines.join('\n'));
117 |   if (updatedContent === normalizedOriginal) {
118 |     return false;
119 |   }
120 |   await writeFileAtomic(workflowPath, updatedContent);
121 |   return true;
122 | }
123 | 
124 | async function updateReadme(repoRoot: string, catalog: PromptCatalog): Promise<boolean> {
125 |   const readmePath = path.join(repoRoot, 'README.md');
126 |   const original = await fs.readFile(readmePath, 'utf8');
127 |   const lines = original.split(/\r?\n/);
128 |   const usedPhases = new Set<string>();
129 |   let modified = false;
130 |   let crossHeadingIndex: number | null = null;
131 | 
132 |   for (let index = 0; index < lines.length; index++) {
133 |     const line = lines[index];
134 |     if (!line.startsWith('### [')) {
135 |       continue;
136 |     }
137 |     const headingLabel = extractHeadingLabel(line);
138 |     if (!headingLabel) {
139 |       continue;
140 |     }
141 |     if (headingLabel === 'Reset Playbook') {
142 |       crossHeadingIndex = index;
143 |       continue;
144 |     }
145 |     if (!/^P\d+/i.test(headingLabel)) {
146 |       continue;
147 |     }
148 |     const normalized = normalizePhaseLabel(headingLabel);
149 |     usedPhases.add(normalized);
150 |     const entries = catalog[normalized];
151 |     if (!entries) {
152 |       throw new Error(`README.md references phase "${headingLabel}" but catalog.json has no entries.`);
153 |     }
154 |     const bounds = locateTableBounds(lines, index + 1);
155 |     const tableLines = buildPhaseTable(entries);
156 |     if (!tableEquals(lines.slice(bounds.start, bounds.end), tableLines)) {
157 |       lines.splice(bounds.start, bounds.end - bounds.start, ...tableLines);
158 |       modified = true;
159 |     }
160 |   }
161 | 
162 |   if (crossHeadingIndex !== null) {
163 |     const bounds = locateTableBounds(lines, crossHeadingIndex + 1);
164 |     const crossEntries = collectCrossEntries(catalog, usedPhases);
165 |     const tableLines = buildCrossTable(crossEntries);
166 |     if (!tableEquals(lines.slice(bounds.start, bounds.end), tableLines)) {
167 |       lines.splice(bounds.start, bounds.end - bounds.start, ...tableLines);
168 |       modified = true;
169 |     }
170 |   }
171 | 
172 |   if (!modified) {
173 |     return false;
174 |   }
175 | 
176 |   const updatedContent = ensureTrailingNewline(lines.join('\n'));
177 |   await writeFileAtomic(readmePath, updatedContent);
178 |   return true;
179 | }
180 | 
181 | function extractHeadingLabel(line: string): string | null {
182 |   const bracketStart = line.indexOf('[');
183 |   const bracketEnd = line.indexOf('](', bracketStart);
184 |   if (bracketStart === -1 || bracketEnd === -1) {
185 |     return null;
186 |   }
187 |   return line.slice(bracketStart + 1, bracketEnd);
188 | }
189 | 
190 | function locateTableBounds(lines: string[], startIndex: number): { start: number; end: number } {
191 |   let start = startIndex;
192 |   while (start < lines.length && lines[start].trim() === '') {
193 |     start++;
194 |   }
195 |   let end = start;
196 |   while (end < lines.length && lines[end].trim().startsWith('|')) {
197 |     end++;
198 |   }
199 |   return { start, end };
200 | }
201 | 
202 | function buildPhaseTable(entries: PromptCatalogEntry[]): string[] {
203 |   const rows = entries
204 |     .slice()
205 |     .sort((a, b) => a.command.localeCompare(b.command))
206 |     .map((entry) => `| ${escapeCell(entry.command)} | ${escapeCell(entry.purpose)} |`);
207 |   return ['| Command | What it does |', '| --- | --- |', ...rows];
208 | }
209 | 
210 | function collectCrossEntries(
211 |   catalog: PromptCatalog,
212 |   usedPhases: Set<string>,
213 | ): CrossEntry[] {
214 |   const entries: CrossEntry[] = [];
215 |   const seen = new Set<string>();
216 |   for (const [normalized, bucket] of Object.entries(catalog)) {
217 |     if (usedPhases.has(normalized)) {
218 |       continue;
219 |     }
220 |     for (const entry of bucket) {
221 |       const key = `${entry.command}::${entry.phase}`;
222 |       if (seen.has(key)) {
223 |         continue;
224 |       }
225 |       seen.add(key);
226 |       entries.push({
227 |         command: entry.command,
228 |         stageTieIn: entry.phase,
229 |         purpose: entry.purpose,
230 |       });
231 |     }
232 |   }
233 |   entries.sort((a, b) => {
234 |     const stage = a.stageTieIn.localeCompare(b.stageTieIn);
235 |     if (stage !== 0) {
236 |       return stage;
237 |     }
238 |     return a.command.localeCompare(b.command);
239 |   });
240 |   return entries;
241 | }
242 | 
243 | function buildCrossTable(entries: CrossEntry[]): string[] {
244 |   const rows = entries.map(
245 |     (entry) => `| ${escapeCell(entry.command)} | ${escapeCell(entry.stageTieIn)} | ${escapeCell(entry.purpose)} |`,
246 |   );
247 |   return ['| Command | Stage tie-in | What it does |', '| --- | --- | --- |', ...rows];
248 | }
249 | 
250 | function escapeCell(value: string): string {
251 |   return value.replace(/\|/g, '\\|');
252 | }
253 | 
254 | function tableEquals(existing: string[], replacement: string[]): boolean {
255 |   if (existing.length !== replacement.length) {
256 |     return false;
257 |   }
258 |   for (let index = 0; index < existing.length; index++) {
259 |     if (existing[index] !== replacement[index]) {
260 |       return false;
261 |     }
262 |   }
263 |   return true;
264 | }
265 | 
266 | function ensureTrailingNewline(content: string): string {
267 |   return content.endsWith('\n') ? content : `${content}\n`;
268 | }
269 | 
270 | export async function regenerateWorkflow(repoRoot: string, catalog: PromptCatalog): Promise<boolean> {
271 |   const workflowPath = path.join(repoRoot, 'workflow.mmd');
272 |   const lines = buildWorkflowGraph(catalog);
273 |   const payload = ensureTrailingNewline(lines.join('\n'));
274 |   return writeFileAtomic(workflowPath, payload);
275 | }
276 | 
277 | function buildWorkflowGraph(catalog: PromptCatalog): string[] {
278 |   const phaseKeys = Object.keys(catalog);
279 |   const numbered = phaseKeys
280 |     .filter((key) => /^p\d/.test(key))
281 |     .sort((a, b) => comparePhaseKeys(a, b));
282 |   const nonNumbered = phaseKeys.filter((key) => !/^p\d/.test(key)).sort();
283 |   const orderedKeys = [...numbered, ...nonNumbered];
284 | 
285 |   const commandAssignments = new Map<string, string>();
286 |   const commandLookup = new Map<string, PromptCatalogEntry>();
287 |   const phaseLabels = new Map<string, string>();
288 | 
289 |   for (const key of orderedKeys) {
290 |     const bucket = catalog[key] ?? [];
291 |     if (bucket.length > 0) {
292 |       phaseLabels.set(key, bucket[0].phase);
293 |     }
294 |     for (const entry of bucket) {
295 |       if (!commandLookup.has(entry.command)) {
296 |         commandLookup.set(entry.command, entry);
297 |         commandAssignments.set(entry.command, key);
298 |       }
299 |     }
300 |   }
301 | 
302 |   const lines: string[] = ['flowchart TD'];
303 |   for (const key of numbered) {
304 |     lines.push(...renderPhaseSubgraph(key, phaseLabels.get(key) ?? key, commandAssignments));
305 |   }
306 | 
307 |   const crossPhaseNodes: string[] = [];
308 |   for (const key of nonNumbered) {
309 |     crossPhaseNodes.push(...renderPhaseSubgraph(key, phaseLabels.get(key) ?? key, commandAssignments));
310 |   }
311 |   if (crossPhaseNodes.length > 0) {
312 |     lines.push(...crossPhaseNodes);
313 |   }
314 | 
315 |   const edges = buildEdges(commandLookup);
316 |   lines.push(...edges);
317 |   return lines;
318 | }
319 | 
320 | function renderPhaseSubgraph(
321 |   phaseKey: string,
322 |   label: string,
323 |   commandAssignments: Map<string, string>,
324 | ): string[] {
325 |   const commands: string[] = [];
326 |   for (const [command, assignedPhase] of commandAssignments.entries()) {
327 |     if (assignedPhase !== phaseKey) {
328 |       continue;
329 |     }
330 |     commands.push(command);
331 |   }
332 |   if (commands.length === 0) {
333 |     return [];
334 |   }
335 |   commands.sort((a, b) => a.localeCompare(b));
336 |   const lines: string[] = [];
337 |   const phaseId = toPhaseId(phaseKey);
338 |   lines.push(`  subgraph ${phaseId}["${escapeLabel(label)}"]`);
339 |   for (const command of commands) {
340 |     const nodeId = toCommandId(command);
341 |     lines.push(`    ${nodeId}[/${command}/]`);
342 |   }
343 |   lines.push('  end');
344 |   return lines;
345 | }
346 | 
347 | function buildEdges(commandLookup: Map<string, PromptCatalogEntry>): string[] {
348 |   const edges: string[] = [];
349 |   const seen = new Set<string>();
350 |   for (const entry of commandLookup.values()) {
351 |     const sourceId = toCommandId(entry.command);
352 |     for (const nextCommand of entry.next) {
353 |       const targetEntry = commandLookup.get(nextCommand);
354 |       if (!targetEntry) {
355 |         continue;
356 |       }
357 |       const targetId = toCommandId(targetEntry.command);
358 |       const key = `${sourceId}->${targetId}`;
359 |       if (seen.has(key)) {
360 |         continue;
361 |       }
362 |       seen.add(key);
363 |       edges.push(`  ${sourceId} --> ${targetId}`);
364 |     }
365 |   }
366 |   return edges.sort((a, b) => a.localeCompare(b));
367 | }
368 | 
369 | function toPhaseId(phaseKey: string): string {
370 |   return `phase_${phaseKey.replace(/[^a-z0-9]/g, '_')}`;
371 | }
372 | 
373 | function toCommandId(command: string): string {
374 |   const stripped = command.replace(/^\//, '');
375 |   const normalized = stripped.replace(/[^a-z0-9]/gi, '_');
376 |   return `cmd_${normalized}`;
377 | }
378 | 
379 | function escapeLabel(label: string): string {
380 |   return label.replace(/"/g, '\\"');
381 | }
382 | 
383 | function comparePhaseKeys(a: string, b: string): number {
384 |   const numberA = extractPhaseNumber(a);
385 |   const numberB = extractPhaseNumber(b);
386 |   if (numberA !== null && numberB !== null && numberA !== numberB) {
387 |     return numberA - numberB;
388 |   }
389 |   return a.localeCompare(b);
390 | }
391 | 
392 | function extractPhaseNumber(key: string): number | null {
393 |   const match = key.match(/^p(\d+)/);
394 |   if (!match) {
395 |     return null;
396 |   }
397 |   return Number.parseInt(match[1], 10);
398 | }
399 | 
400 | function parsePhaseSections(lines: string[]): PhaseSectionSnapshot[] {
401 |   const sections: PhaseSectionSnapshot[] = [];
402 |   let current: PhaseSectionSnapshot | null = null;
403 |   let manualBuffer: string[] = [];
404 |   let inCommands = false;
405 | 
406 |   const flush = (): void => {
407 |     if (!current) {
408 |       return;
409 |     }
410 |     current.manualLines = trimBlankEdges(manualBuffer);
411 |     sections.push(current);
412 |     current = null;
413 |     manualBuffer = [];
414 |   };
415 | 
416 |   for (const line of lines) {
417 |     if (line.trim().startsWith('### ')) {
418 |       flush();
419 |       const headingLine = line.trimStart();
420 |       const heading = headingLine.replace(/^###\s+/, '').trim();
421 |       current = {
422 |         headingLine,
423 |         normalizedKey: normalizePhaseLabel(heading),
424 |         manualLines: [],
425 |       };
426 |       inCommands = false;
427 |       manualBuffer = [];
428 |       continue;
429 |     }
430 | 
431 |     if (!current) {
432 |       continue;
433 |     }
434 | 
435 |     const trimmed = line.trim();
436 |     if (trimmed === COMMANDS_BLOCK_BEGIN) {
437 |       inCommands = true;
438 |       continue;
439 |     }
440 |     if (trimmed === COMMANDS_BLOCK_END) {
441 |       inCommands = false;
442 |       continue;
443 |     }
444 | 
445 |     if (!inCommands) {
446 |       manualBuffer.push(line);
447 |     }
448 |   }
449 | 
450 |   flush();
451 |   return sections;
452 | }
453 | 
454 | function trimBlankEdges(lines: string[]): string[] {
455 |   let start = 0;
456 |   let end = lines.length;
457 |   while (start < end && lines[start].trim() === '') {
458 |     start += 1;
459 |   }
460 |   while (end > start && lines[end - 1].trim() === '') {
461 |     end -= 1;
462 |   }
463 |   return lines.slice(start, end);
464 | }
465 | 
466 | function resolvePhaseHeading(key: string, bucket: PromptCatalogEntry[]): string {
467 |   if (bucket.length > 0) {
468 |     return bucket[0].phase;
469 |   }
470 |   const segments = key.split('-').filter(Boolean);
471 |   if (segments.length === 0) {
472 |     return key;
473 |   }
474 |   return segments
475 |     .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
476 |     .join(' ');
477 | }
478 | 
479 | function createManualStub(label: string): string[] {
480 |   const trimmed = label.trim();
481 |   return [
482 |     `- **Purpose**: _Document the goal for ${trimmed}._`,
483 |     '- **Steps**: _Outline the prompts and activities involved._',
484 |     '- **Gate Criteria**: _Capture the exit checks before advancing._',
485 |     '- **Outputs**: _List the deliverables for this phase._',
486 |     '- **Owners**: _Assign accountable roles._',
487 |   ];
488 | }
489 | 
490 | function buildCommandLines(entries: PromptCatalogEntry[]): string[] {
491 |   if (entries.length === 0) {
492 |     return ['- _No catalog commands mapped to this phase._'];
493 |   }
494 |   return entries
495 |     .slice()
496 |     .sort((a, b) => a.command.localeCompare(b.command))
497 |     .map((entry) => {
498 |       const purpose = entry.purpose.trim();
499 |       return purpose ? `- \`${entry.command}\` — ${purpose}` : `- \`${entry.command}\``;
500 |     });
501 | }
```

scripts/markdown_utils.ts

```
1 | import { promises as fs } from 'fs';
2 | import path from 'path';
3 | 
4 | const SKIP_DIRECTORIES = new Set(['node_modules', '.git', '.taskmaster', '.github']);
5 | 
6 | export async function collectMarkdownFiles(rootDir: string): Promise<string[]> {
7 |   const results: string[] = [];
8 |   await walk(rootDir, results);
9 |   return results;
10 | 
11 |   async function walk(currentDir: string, acc: string[]): Promise<void> {
12 |     const entries = await fs.readdir(currentDir, { withFileTypes: true });
13 |     for (const entry of entries) {
14 |       if (shouldSkip(entry.name)) {
15 |         continue;
16 |       }
17 |       const fullPath = path.join(currentDir, entry.name);
18 |       if (entry.isDirectory()) {
19 |         await walk(fullPath, acc);
20 |       } else if (entry.isFile() && fullPath.endsWith('.md')) {
21 |         acc.push(fullPath);
22 |       }
23 |     }
24 |   }
25 | }
26 | 
27 | export function shouldSkip(name: string): boolean {
28 |   return SKIP_DIRECTORIES.has(name);
29 | }
30 | 
31 | export async function loadPhases(workflowPath: string): Promise<Set<string>> {
32 |   const content = await fs.readFile(workflowPath, 'utf8');
33 |   const headingRegex = /^(##|###)\s+(.+)$/gm;
34 |   const phases = new Set<string>();
35 |   let match: RegExpExecArray | null;
36 |   while ((match = headingRegex.exec(content)) !== null) {
37 |     phases.add(match[2].trim());
38 |   }
39 |   return phases;
40 | }
```

scripts/validate_metadata.ts

```
1 | import { promises as fs } from 'fs';
2 | import path from 'path';
3 | 
4 | import { parseFrontMatter, MetadataValue } from './front_matter';
5 | import { collectMarkdownFiles, loadPhases } from './markdown_utils';
6 | 
7 | type Scalar = string;
8 | 
9 | interface Metadata {
10 |   phase: Scalar | Scalar[];
11 |   gate: Scalar;
12 |   status: Scalar;
13 |   previous: Scalar[];
14 |   next: Scalar[];
15 |   [key: string]: MetadataValue;
16 | }
17 | 
18 | async function main(): Promise<void> {
19 |   const repoRoot = path.resolve(__dirname, '..');
20 |   const workflowPath = path.join(repoRoot, 'WORKFLOW.md');
21 |   const validPhases = await loadPhases(workflowPath);
22 |   const markdownFiles = await collectMarkdownFiles(repoRoot);
23 | 
24 |   const errors: string[] = [];
25 |   let validatedFiles = 0;
26 | 
27 |   for (const filePath of markdownFiles) {
28 |     const relativePath = path.relative(repoRoot, filePath);
29 |     const content = await fs.readFile(filePath, 'utf8');
30 |     const parsed = parseFrontMatter(content);
31 |     if (!parsed) {
32 |       continue;
33 |     }
34 | 
35 |     const metadata = parsed.metadata as Partial<Metadata>;
36 |     validatedFiles += 1;
37 | 
38 |     const phaseErrors = validatePhase(metadata.phase, validPhases, relativePath);
39 |     const gateErrors = validateRequiredString('gate', metadata.gate, relativePath);
40 |     const statusErrors = validateRequiredString('status', metadata.status, relativePath);
41 |     const previousErrors = validateStringArray('previous', metadata.previous, relativePath);
42 |     const nextErrors = validateStringArray('next', metadata.next, relativePath);
43 | 
44 |     errors.push(
45 |       ...phaseErrors,
46 |       ...gateErrors,
47 |       ...statusErrors,
48 |       ...previousErrors,
49 |       ...nextErrors,
50 |     );
51 |   }
52 | 
53 |   if (errors.length > 0) {
54 |     console.error('Metadata validation failed:\n');
55 |     for (const error of errors) {
56 |       console.error(`- ${error}`);
57 |     }
58 |     process.exitCode = 1;
59 |     return;
60 |   }
61 | 
62 |   console.log(`Metadata validation passed for ${validatedFiles} file(s).`);
63 | }
64 | 
65 | function validatePhase(value: MetadataValue | undefined, validPhases: Set<string>, file: string): string[] {
66 |   if (value === undefined) {
67 |     return [`${file}: missing required field "phase".`];
68 |   }
69 |   const phases = Array.isArray(value) ? value : [value];
70 |   if (phases.length === 0 || phases.some((item) => typeof item !== 'string' || item.trim() === '')) {
71 |     return [`${file}: "phase" must contain at least one non-empty string.`];
72 |   }
73 |   const headings = Array.from(validPhases);
74 |   const missing = phases.filter((phase) => !headings.some((heading) => heading.includes(phase.trim())));
75 |   if (missing.length > 0) {
76 |     return [`${file}: phase value(s) not found in WORKFLOW.md headings: ${missing.join(', ')}.`];
77 |   }
78 |   return [];
79 | }
80 | 
81 | function validateRequiredString(field: string, value: MetadataValue | undefined, file: string): string[] {
82 |   if (typeof value !== 'string' || value.trim() === '') {
83 |     return [`${file}: missing or empty "${field}".`];
84 |   }
85 |   return [];
86 | }
87 | 
88 | function validateStringArray(field: string, value: MetadataValue | undefined, file: string): string[] {
89 |   if (!Array.isArray(value) || value.length === 0) {
90 |     return [`${file}: "${field}" must be a non-empty array.`];
91 |   }
92 |   const invalid = value.filter((item) => typeof item !== 'string' || item.trim() === '');
93 |   if (invalid.length > 0) {
94 |     return [`${file}: "${field}" contains empty entries.`];
95 |   }
96 |   return [];
97 | }
98 | 
99 | main().catch((error) => {
100 |   console.error('Failed to validate metadata.');
101 |   console.error(error);
102 |   process.exitCode = 1;
103 | });
```

src/index.ts

```
1 | import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
2 | import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
3 | import { logger } from "./logger";
4 | import pkg from "../package.json";
5 | 
6 | const SERVER_NAME = "Proactive Workflow Assistant MCP";
7 | 
8 | type ShutdownHandler = () => Promise<void>;
9 | 
10 | const createServer = () => {
11 |   const server = new McpServer({
12 |     name: SERVER_NAME,
13 |     version: pkg.version ?? "0.0.0",
14 |   });
15 | 
16 |   return server;
17 | };
18 | 
19 | const connectServer = async (
20 |   server: McpServer,
21 |   transport: StdioServerTransport,
22 | ): Promise<void> => {
23 |   await server.connect(transport);
24 |   logger.info("server_started", {
25 |     transport: "stdio",
26 |     server: SERVER_NAME,
27 |     version: pkg.version,
28 |   });
29 | };
30 | 
31 | const registerShutdownHandlers = (shutdown: ShutdownHandler) => {
32 |   let shuttingDown = false;
33 | 
34 |   const handleSignal = (signal: NodeJS.Signals) => {
35 |     if (shuttingDown) {
36 |       return;
37 |     }
38 |     shuttingDown = true;
39 | 
40 |     logger.warn("received_signal", { signal });
41 |     shutdown()
42 |       .then(() => {
43 |         logger.info("server_stop", { reason: signal });
44 |         process.exit(0);
45 |       })
46 |       .catch((error) => {
47 |         logger.error("server_stop_error", { error, reason: signal });
48 |         process.exit(1);
49 |       });
50 |   };
51 | 
52 |   process.on("SIGINT", handleSignal);
53 |   process.on("SIGTERM", handleSignal);
54 | };
55 | 
56 | const registerTopLevelErrorHandlers = (shutdown: ShutdownHandler) => {
57 |   let shuttingDown = false;
58 | 
59 |   const handleFatal = async (event: "uncaught_exception" | "unhandled_rejection", payload: unknown) => {
60 |     if (shuttingDown) {
61 |       return;
62 |     }
63 |     shuttingDown = true;
64 | 
65 |     logger.error(event, { data: payload });
66 |     try {
67 |       await shutdown();
68 |     } finally {
69 |       process.exit(1);
70 |     }
71 |   };
72 | 
73 |   process.on("uncaughtException", (error) => {
74 |     void handleFatal("uncaught_exception", error);
75 |   });
76 | 
77 |   process.on("unhandledRejection", (reason) => {
78 |     void handleFatal("unhandled_rejection", reason);
79 |   });
80 | };
81 | 
82 | async function main(): Promise<void> {
83 |   const server = createServer();
84 |   const transport = new StdioServerTransport();
85 | 
86 |   try {
87 |     await connectServer(server, transport);
88 |   } catch (error) {
89 |     logger.error("server_start_error", { error });
90 |     await transport.close().catch(() => {
91 |       /* ignore */
92 |     });
93 |     await server.close().catch(() => {
94 |       /* ignore */
95 |     });
96 |     throw error;
97 |   }
98 | 
99 |   const shutdown: ShutdownHandler = async () => {
100 |     await server.close();
101 |     await transport.close();
102 |   };
103 | 
104 |   registerShutdownHandlers(shutdown);
105 |   registerTopLevelErrorHandlers(shutdown);
106 | }
107 | 
108 | main().catch((error) => {
109 |   logger.error("server_start_fatal", { error });
110 |   process.exit(1);
111 | });
```

src/logger.ts

```
1 | export type LogLevel = "info" | "warn" | "error";
2 | 
3 | export interface LogMetadata {
4 |   [key: string]: unknown;
5 | }
6 | 
7 | export interface LogEntry {
8 |   timestamp: string;
9 |   level: LogLevel;
10 |   message: string;
11 |   metadata?: LogMetadata;
12 | }
13 | 
14 | const ERROR_KEYS: Array<keyof Error> = ["name", "message", "stack", "cause"];
15 | 
16 | const sanitizeValue = (value: unknown): unknown => {
17 |   if (value instanceof Error) {
18 |     const errorPayload: Record<string, unknown> = {};
19 |     for (const key of ERROR_KEYS) {
20 |       const data = (value as Error)[key];
21 |       if (data !== undefined) {
22 |         errorPayload[key] = data;
23 |       }
24 |     }
25 |     return errorPayload;
26 |   }
27 | 
28 |   if (Array.isArray(value)) {
29 |     return value.map((item) => sanitizeValue(item));
30 |   }
31 | 
32 |   if (value && typeof value === "object") {
33 |     const input = value as Record<string, unknown>;
34 |     const result: Record<string, unknown> = {};
35 |     for (const [key, nestedValue] of Object.entries(input)) {
36 |       if (nestedValue !== undefined) {
37 |         result[key] = sanitizeValue(nestedValue);
38 |       }
39 |     }
40 |     return result;
41 |   }
42 | 
43 |   return value;
44 | };
45 | 
46 | const sanitizeMetadata = (metadata?: LogMetadata): LogMetadata | undefined => {
47 |   if (!metadata) {
48 |     return undefined;
49 |   }
50 | 
51 |   const sanitized: LogMetadata = {};
52 |   for (const [key, value] of Object.entries(metadata)) {
53 |     if (value !== undefined) {
54 |       sanitized[key] = sanitizeValue(value);
55 |     }
56 |   }
57 | 
58 |   return Object.keys(sanitized).length > 0 ? sanitized : undefined;
59 | };
60 | 
61 | export class Logger {
62 |   constructor(private readonly stream: NodeJS.WriteStream = process.stdout) {}
63 | 
64 |   private write(level: LogLevel, message: string, metadata?: LogMetadata): void {
65 |     const entry: LogEntry = {
66 |       timestamp: new Date().toISOString(),
67 |       level,
68 |       message,
69 |     };
70 | 
71 |     const sanitizedMetadata = sanitizeMetadata(metadata);
72 |     if (sanitizedMetadata) {
73 |       entry.metadata = sanitizedMetadata;
74 |     }
75 | 
76 |     this.stream.write(`${JSON.stringify(entry)}\n`);
77 |   }
78 | 
79 |   info(message: string, metadata?: LogMetadata): void {
80 |     this.write("info", message, metadata);
81 |   }
82 | 
83 |   warn(message: string, metadata?: LogMetadata): void {
84 |     this.write("warn", message, metadata);
85 |   }
86 | 
87 |   error(message: string, metadata?: LogMetadata): void {
88 |     this.write("error", message, metadata);
89 |   }
90 | }
91 | 
92 | export const logger = new Logger();
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
2 |  "meta": {
3 |   "generatedAt": "2025-09-19T23:04:04.198Z",
4 |   "tasksAnalyzed": 19,
5 |   "totalTasks": 19,
6 |   "analysisCount": 19,
7 |   "thresholdScore": 5,
8 |   "projectName": "Taskmaster",
9 |   "usedResearch": true
10 |  },
11 |  "complexityAnalysis": [
12 |   {
13 |    "taskId": 1,
14 |    "taskTitle": "Project Setup and Server Bootstrap",
15 |    "complexityScore": 4,
16 |    "recommendedSubtasks": 4,
17 |    "expansionPrompt": "Expand this task to set up the Node.js/TypeScript project. Create subtasks for: 1. Configuring `package.json` with necessary scripts (build, start, dev) and installing dependencies (`@modelcontextprotocol/sdk`, `typescript`, `ts-node`, etc.). 2. Configuring `tsconfig.json` for compilation into the `dist` directory. 3. Creating the main server entry point `src/index.ts` that initializes the `StdioServerTransport` and registers server info. 4. Implementing a basic NDJSON logger and adding graceful shutdown handlers for SIGINT and SIGTERM signals.",
18 |    "reasoning": "Codebase analysis shows this is a greenfield task. The `package.json` and `tsconfig.json` are skeletons, and the `src` directory is empty. The task requires creating the core project configuration, the main application entry point, and foundational features like logging and process handling. These are four distinct areas of setup that can be worked on sequentially, making them ideal subtasks."
19 |   },
20 |   {
21 |    "taskId": 2,
22 |    "taskTitle": "Implement Safety Control Utilities",
23 |    "complexityScore": 3,
24 |    "recommendedSubtasks": 2,
25 |    "expansionPrompt": "Expand this task into two subtasks for creating safety utilities. The first subtask should be to implement and unit test the `redactSecrets` function, which takes a log object and redacts values for keys matching a specific regex. The second subtask should be to implement and unit test the `capPayload` function, which truncates large strings and adds a truncation notice.",
26 |    "reasoning": "Codebase analysis confirms no utility files or functions for redaction or payload capping exist. This is greenfield development of two distinct, pure functions. They have no dependencies on each other and can be implemented and unit-tested in isolation, making a two-subtask split natural and efficient."
27 |   },
28 |   {
29 |    "taskId": 5,
30 |    "taskTitle": "Implement Atomic State Store",
31 |    "complexityScore": 5,
32 |    "recommendedSubtasks": 3,
33 |    "expansionPrompt": "Expand this task to implement the atomic `StateStore`. Create subtasks for: 1. Defining the `StateStore` class structure, including methods for initializing the `.mcp` directory and loading `state.json` (or a default state if it doesn't exist). 2. Implementing the atomic `save` method using the write-to-temp-then-rename pattern. 3. Writing comprehensive tests to verify that the directory is created, state is saved correctly, and the save operation is atomic and prevents file corruption.",
34 |    "reasoning": "Codebase analysis shows no existing state management logic. The complexity is not just in creating a class, but in correctly implementing the atomic write-then-rename pattern to prevent data corruption, which requires careful handling of file system operations and errors. Breaking this into class structure, the critical save logic, and dedicated testing is a robust approach."
35 |   },
36 |   {
37 |    "taskId": 9,
38 |    "taskTitle": "Implement Token Bucket Rate Limiter Utility",
39 |    "complexityScore": 4,
40 |    "recommendedSubtasks": 2,
41 |    "expansionPrompt": "Expand this task to create the `TokenBucket` rate limiter. Create two subtasks: 1. Implement the `TokenBucket` class structure, including the constructor, properties for capacity, refill rate, and the internal token refill logic. 2. Implement the asynchronous `take(count)` method, including the logic to wait for tokens to be refilled if necessary, and write time-sensitive unit tests to verify its correctness.",
42 |    "reasoning": "This is a greenfield implementation of a classic, self-contained algorithm. No related code exists. The complexity lies in managing the time-based state and the asynchronous waiting logic. Separating the core class and refill mechanism from the async `take` method and its specific testing requirements simplifies development."
43 |   },
44 |   {
45 |    "taskId": 3,
46 |    "taskTitle": "Implement Resource Exposure",
47 |    "complexityScore": 4,
48 |    "recommendedSubtasks": 3,
49 |    "expansionPrompt": "Expand this task to expose prompts as MCP resources. Create subtasks for: 1. Adding a YAML parsing library and creating a utility function to load and parse `resources/prompts.meta.yaml` on server startup. 2. In the main server file, iterating over the parsed prompt metadata and calling the MCP server's `registerResource` method for each, constructing the `file://` URI. 3. Integrating the `capPayload` utility to truncate the content preview for each registered resource.",
50 |    "reasoning": "Codebase analysis shows `resources/prompts.meta.yaml` exists but there is no server logic to process it. This task involves orchestrating multiple pieces: file I/O, data parsing (YAML), and integration with the MCP SDK. It also depends on the `capPayload` utility from another task. Breaking it down by concern (data loading, resource registration, safety feature integration) makes the implementation more manageable."
51 |   },
52 |   {
53 |    "taskId": 12,
54 |    "taskTitle": "Create DocFetch Preflight Guardrail Prompt",
55 |    "complexityScore": 1,
56 |    "recommendedSubtasks": 1,
57 |    "expansionPrompt": "Create the `prompts/preflight/docfetch-check.md` file. The file must contain YAML front matter with an appropriate `id`, `title`, and `phase`. The markdown body should instruct the user on how to run DocFetch, what a successful `DocFetchReport` looks like, and the steps to take if the check fails.",
58 |    "reasoning": "Codebase analysis shows the `prompts` directory does not exist. This task is purely content authoring—creating a single markdown file. It involves no code logic and is an atomic unit of work, so it does not require further subtask breakdown."
59 |   },
60 |   {
61 |    "taskId": 13,
62 |    "taskTitle": "Author Planning Phase Prompts",
63 |    "complexityScore": 1,
64 |    "recommendedSubtasks": 1,
65 |    "expansionPrompt": "Create a new markdown prompt file in the `prompts/` directory for the 'planning' phase. The file must include YAML front matter with `phase: planning` and a unique `id` and `title`. The prompt's content should guide a user through a specific planning activity, such as feature breakdown or defining acceptance criteria.",
66 |    "reasoning": "Similar to task 12, this is a content authoring task. It requires creating a new markdown file with specific content and metadata. It is a simple, atomic task with no implementation complexity."
67 |   },
68 |   {
69 |    "taskId": 14,
70 |    "taskTitle": "Author Scaffolding Phase Prompts",
71 |    "complexityScore": 1,
72 |    "recommendedSubtasks": 1,
73 |    "expansionPrompt": "Create a new markdown prompt file in the `prompts/` directory for the 'scaffolding' phase. The file must include YAML front matter with `phase: scaffolding` and a unique `id` and `title`. The prompt's content should assist a developer in generating boilerplate code or setting up initial file structures for a new feature.",
74 |    "reasoning": "This is another content authoring task. It involves creating a single markdown file and has no associated coding logic. It is a minimal, atomic piece of work."
75 |   },
76 |   {
77 |    "taskId": 19,
78 |    "taskTitle": "Document MCP Evolution Readiness in README",
79 |    "complexityScore": 1,
80 |    "recommendedSubtasks": 1,
81 |    "expansionPrompt": "Edit the `README.md` file to add a new H2 section titled 'Future Enhancements'. Under this section, describe the planned evolution to a full MCP server, including typed inputs and event signals. Also, explicitly mention that the current slash-command workflow will remain as a manual fallback.",
82 |    "reasoning": "Codebase analysis shows `README.md` exists but is minimal. This task is a simple documentation update, requiring editing a single text file. The complexity is in the quality of the writing, not the implementation, making it a very low-complexity task."
83 |   },
84 |   {
85 |    "taskId": 18,
86 |    "taskTitle": "Integrate and Test Full Metadata Workflow",
87 |    "complexityScore": 2,
88 |    "recommendedSubtasks": 1,
89 |    "expansionPrompt": "This is a manual testing task. The steps are: 1. Modify the YAML front matter of an existing prompt file (e.g., change its `title`). 2. Run the `npm run validate:metadata` script and confirm it passes. 3. Run the `npm run build:catalog` script. 4. Verify that the `catalog.json` file and the prompt tables in `README.md` have been updated to reflect the change. 5. (Optional) Introduce an invalid change to the metadata and confirm the validation script fails with a clear error.",
90 |    "reasoning": "This task does not involve writing any new code; it is a manual end-to-end testing procedure. While it has many dependencies (the scripts and prompts must exist), the task itself is a single, sequential set of verification steps. The complexity score of 2 reflects the coordination required, but it's not a development task that can be broken down further."
91 |   },
92 |   {
93 |    "taskId": 4,
94 |    "taskTitle": "Implement Dynamic Prompt Tools",
95 |    "complexityScore": 5,
96 |    "recommendedSubtasks": 3,
97 |    "expansionPrompt": "Break down this task with a focus on implement dynamic prompt tools.",
98 |    "reasoning": "Automatically added due to missing analysis in AI response."
99 |   },
100 |   {
101 |    "taskId": 6,
102 |    "taskTitle": "Implement Planner `suggest_next_calls` Tool",
103 |    "complexityScore": 5,
104 |    "recommendedSubtasks": 3,
105 |    "expansionPrompt": "Break down this task with a focus on implement planner `suggest_next_calls` tool.",
106 |    "reasoning": "Automatically added due to missing analysis in AI response."
107 |   },
108 |   {
109 |    "taskId": 7,
110 |    "taskTitle": "Implement `advance_state` Tool",
111 |    "complexityScore": 5,
112 |    "recommendedSubtasks": 3,
113 |    "expansionPrompt": "Break down this task with a focus on implement `advance_state` tool.",
114 |    "reasoning": "Automatically added due to missing analysis in AI response."
115 |   },
116 |   {
117 |    "taskId": 8,
118 |    "taskTitle": "Implement `export_task_list` Tool",
119 |    "complexityScore": 5,
120 |    "recommendedSubtasks": 3,
121 |    "expansionPrompt": "Break down this task with a focus on implement `export_task_list` tool.",
122 |    "reasoning": "Automatically added due to missing analysis in AI response."
123 |   },
124 |   {
125 |    "taskId": 10,
126 |    "taskTitle": "Implement Prompt Metadata Validation Script",
127 |    "complexityScore": 5,
128 |    "recommendedSubtasks": 3,
129 |    "expansionPrompt": "Break down this task with a focus on implement prompt metadata validation script.",
130 |    "reasoning": "Automatically added due to missing analysis in AI response."
131 |   },
132 |   {
133 |    "taskId": 11,
134 |    "taskTitle": "Implement Catalog and README Build Script",
135 |    "complexityScore": 5,
136 |    "recommendedSubtasks": 3,
137 |    "expansionPrompt": "Break down this task with a focus on implement catalog and readme build script.",
138 |    "reasoning": "Automatically added due to missing analysis in AI response."
139 |   },
140 |   {
141 |    "taskId": 15,
142 |    "taskTitle": "Author Testing Phase Prompts",
143 |    "complexityScore": 5,
144 |    "recommendedSubtasks": 3,
145 |    "expansionPrompt": "Break down this task with a focus on author testing phase prompts.",
146 |    "reasoning": "Automatically added due to missing analysis in AI response."
147 |   },
148 |   {
149 |    "taskId": 16,
150 |    "taskTitle": "Author Release Phase Prompts",
151 |    "complexityScore": 5,
152 |    "recommendedSubtasks": 3,
153 |    "expansionPrompt": "Break down this task with a focus on author release phase prompts.",
154 |    "reasoning": "Automatically added due to missing analysis in AI response."
155 |   },
156 |   {
157 |    "taskId": 17,
158 |    "taskTitle": "Author Post-Release Hardening Prompts",
159 |    "complexityScore": 5,
160 |    "recommendedSubtasks": 3,
161 |    "expansionPrompt": "Break down this task with a focus on author post-release hardening prompts.",
162 |    "reasoning": "Automatically added due to missing analysis in AI response."
163 |   }
164 |  ]
165 | }
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
12 |         "status": "in-progress",
13 |         "subtasks": [
14 |           {
15 |             "id": 1,
16 |             "title": "Configure package.json and tsconfig.json",
17 |             "description": "Update the project's package.json to include necessary dependencies and scripts. Configure tsconfig.json to define the TypeScript compilation settings, ensuring output is directed to the dist/ directory.",
18 |             "dependencies": [],
19 |             "details": "In `package.json`, add `@modelcontextprotocol/sdk` to `dependencies`. Add `typescript`, `ts-node`, and `@types/node` to `devDependencies`. Add a `build` script (`\"tsc\"`) and a `start` script (`\"node dist/index.js\"`). In `tsconfig.json`, set `compilerOptions.outDir` to `./dist`, `rootDir` to `./src`, and ensure `moduleResolution` is `node`.",
20 |             "status": "pending",
21 |             "testStrategy": ""
22 |           },
23 |           {
24 |             "id": 2,
25 |             "title": "Implement a Structured NDJSON Logger",
26 |             "description": "Create a simple logger in `src/logger.ts` that writes structured log messages to `stdout` in NDJSON (Newline Delimited JSON) format. This utility will be used for all server logging.",
27 |             "dependencies": [],
28 |             "details": "Implement a `Logger` class or object in `src/logger.ts` with `info`, `warn`, and `error` methods. Each method should accept a message and an optional metadata object. The output for each log entry must be a single-line JSON string containing a timestamp, log level, message, and any metadata, written to `process.stdout`.",
29 |             "status": "pending",
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
41 |             "status": "pending",
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
52 |             "status": "pending",
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
63 |             "status": "pending",
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
78 |         "status": "pending",
79 |         "subtasks": [
80 |           {
81 |             "id": 1,
82 |             "title": "Create `redactSecrets` Utility Function",
83 |             "description": "Implement a pure function to recursively scan an object and redact values for keys matching a specific regex.",
84 |             "dependencies": [],
85 |             "details": "In a new file, `src/utils/safety.ts`, create and export a pure function `redactSecrets(data: any)`. This function should recursively traverse any given object or array. If it encounters an object key that matches the case-insensitive regex `/(key|secret|token)/i`, it must replace the corresponding value with the string `[redacted]`. The function should handle nested objects and arrays without modifying the original input object (i.e., it should return a new, deep-cloned object).",
86 |             "status": "pending",
87 |             "testStrategy": "This function will be tested in a subsequent subtask. Focus on a clean, recursive implementation."
88 |           },
89 |           {
90 |             "id": 2,
91 |             "title": "Create `capPayload` Utility Function",
92 |             "description": "Implement a pure function to truncate large strings to a specified maximum size.",
93 |             "dependencies": [],
94 |             "details": "In the same `src/utils/safety.ts` file, create and export a pure function `capPayload(payload: string, maxSize: number = 1024 * 1024)`. This function will check if the input string's size exceeds `maxSize`. If it does, the function should truncate the string to `maxSize` bytes and append a message indicating how many bytes were removed, e.g., `[truncated 42 bytes]`. If the string is within the limit, it should be returned unmodified.",
95 |             "status": "pending",
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
106 |             "status": "pending",
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
117 |             "status": "pending",
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
128 |             "status": "pending",
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
144 |         "status": "pending",
145 |         "subtasks": [
146 |           {
147 |             "id": 1,
148 |             "title": "Create a utility to parse `prompts.meta.yaml`",
149 |             "description": "Add the `js-yaml` dependency to the project. Create a new utility function that reads the `resources/prompts.meta.yaml` file, parses its content, and returns a structured object. This function should handle potential file read or parsing errors gracefully.",
150 |             "dependencies": [],
151 |             "details": "Create a new file, e.g., `src/prompts/loader.ts`. Add a function `loadPromptMetadata()` that uses `fs.readFileSync` and `yaml.load`. Define a TypeScript interface for the expected structure of the YAML file (e.g., `{ prompts: [...] }`).",
152 |             "status": "pending",
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
163 |             "status": "pending",
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
174 |             "status": "pending",
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
186 |             "status": "pending",
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
197 |             "status": "pending",
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
213 |         "status": "pending",
214 |         "subtasks": [
215 |           {
216 |             "id": 1,
217 |             "title": "Create a Utility to Load and Parse Prompt Metadata",
218 |             "description": "Implement a function that reads `resources/prompts.meta.yaml`, parses it, and returns a validated, typed array of prompt metadata objects. This will serve as the single source of truth for prompt definitions.",
219 |             "dependencies": [],
220 |             "details": "Create a new file `src/lib/prompt-loader.ts`. Add an exported function `loadPromptDefinitions()`. This function should use the `fs` module to read `resources/prompts.meta.yaml` and the `js-yaml` library to parse its content. Define a TypeScript interface for the prompt metadata structure (e.g., `PromptDefinition`) and ensure the parsed data conforms to this type before returning it. This utility will be called during server startup.",
221 |             "status": "pending",
222 |             "testStrategy": "Add a unit test to verify that the function correctly parses a sample YAML string and returns the expected array of objects."
223 |           },
224 |           {
225 |             "id": 2,
226 |             "title": "Develop a Generic Handler for Prompt Tools",
227 |             "description": "Create a generic handler function that can be used by all dynamically generated prompt tools. The handler will be responsible for reading the prompt content, appending a footer, and applying the payload cap.",
228 |             "dependencies": [],
229 |             "details": "In a new file, e.g., `src/tools/prompt-handler.ts`, create a factory function `createPromptHandler(promptFilePath: string)`. This function should return an async `ToolHandler` function. The handler will read the file content from the provided `promptFilePath`, append a standard rendered footer (a simple string for now), and then apply the payload capping utility from Task 2 to the final content. The handler should return an object like `{ content: '...' }`.",
230 |             "status": "pending",
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
241 |             "status": "pending",
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
254 |             "status": "pending",
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
265 |             "status": "pending",
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
280 |         "status": "pending",
281 |         "subtasks": [
282 |           {
283 |             "id": 1,
284 |             "title": "Create StateStore Class and Directory Initialization Logic",
285 |             "description": "Create the file `src/state/StateStore.ts` and define the `StateStore` class. The constructor should accept a project root path and ensure the `.mcp` directory exists.",
286 |             "dependencies": [],
287 |             "details": "Define the `StateStore` class in a new file `src/state/StateStore.ts`. The constructor will take `projectRoot: string`. It should define and store private properties for the paths to the `.mcp` directory, `state.json`, and a temporary file like `state.json.tmp`. Implement a private async method that is called by the constructor to create the `.mcp` directory using `fs.promises.mkdir(mcpDir, { recursive: true })`. This ensures all subsequent file operations have a valid directory to work in.",
288 |             "status": "pending",
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
299 |             "status": "pending",
300 |             "testStrategy": "Test that `load` returns the default state when `state.json` is missing. Create a mock `state.json` file and test that `load` correctly reads and parses its content."
301 |           },
302 |           {
303 |             "id": 3,
304 |             "title": "Implement In-Memory State Accessors and Mutators",
305 |             "description": "Add methods to get the current state and to update it in memory, specifically by recording the completion of a tool. This prepares the store for use by other components like the `advance_state` tool.",
306 |             "dependencies": [
307 |               "5.1"
308 |             ],
309 |             "details": "Based on the `ProjectState` interface in `src/state/ProjectState.ts`, add a public getter `getState(): ProjectState` that returns a deep copy of the internal `_state` to prevent outside mutation. Also, add a public method `recordCompletion(completion: ToolCompletion)` which updates the internal `_state` by adding the new completion record to the `completedTools` array and merging the new artifacts into the top-level `artifacts` map.",
310 |             "status": "pending",
311 |             "testStrategy": "Write a unit test that loads an initial state, calls `recordCompletion` with a mock `ToolCompletion` object, and then uses `getState` to verify that the in-memory state has been correctly updated."
312 |           },
313 |           {
314 |             "id": 4,
315 |             "title": "Implement Atomic `save` Method Using a Temporary File and Rename",
316 |             "description": "Implement the `save` method to atomically persist the current in-memory state to `.mcp/state.json`.",
317 |             "dependencies": [
318 |               "5.3"
319 |             ],
320 |             "details": "Create a public async `save` method. This method will take the current in-memory state from the `_state` property, stringify it with `JSON.stringify`, and write it to the temporary file path (`.mcp/state.json.tmp`) using `fs.promises.writeFile`. Upon successful write, it will use `fs.promises.rename` to atomically move the temporary file to the final `state.json` path, overwriting any existing file. This two-step process prevents file corruption.",
321 |             "status": "pending",
322 |             "testStrategy": "Verify that calling `save` creates `state.json` with the correct content. Check that the temporary file is created during the operation and removed after the rename is complete."
323 |           },
324 |           {
325 |             "id": 5,
326 |             "title": "Create Comprehensive Unit Tests for StateStore",
327 |             "description": "Develop a suite of unit tests in `test/state/StateStore.test.ts` to validate all public methods and behaviors of the `StateStore` class.",
328 |             "dependencies": [
329 |               "5.1",
330 |               "5.2",
331 |               "5.3",
332 |               "5.4"
333 |             ],
334 |             "details": "Using a testing framework like Jest and a temporary file system utility, create a test file for the `StateStore`. The tests should cover: 1. Directory creation on instantiation. 2. Loading from a non-existent file. 3. Correctly saving state via `recordCompletion` and `save`. 4. Correctly loading a previously saved state. 5. Ensure the `getState` method returns a value-identical but not reference-identical object.",
335 |             "status": "pending",
336 |             "testStrategy": "Execute the full test suite to ensure all features work as expected and are isolated from the actual project's file system. Mock the `fs` module to confirm the sequence of `writeFile` then `rename` is called for atomicity."
337 |           }
338 |         ]
339 |       },
340 |       {
341 |         "id": 6,
342 |         "title": "Implement Planner `suggest_next_calls` Tool",
343 |         "description": "Implement the `suggest_next_calls` tool to rank and suggest runnable tools based on DAG dependencies and available artifacts.",
344 |         "details": "Create a `Planner` class that loads `resources/default-graph.json` and the current state from the `StateStore`. Implement the logic for the `suggest_next_calls` tool. This logic should compute which nodes in the DAG are 'ready' by checking if their `dependsOn` nodes are complete and their `requiresArtifacts` are present in the state. Return a ranked list of candidates, sorted by `phase` and then `id`.",
345 |         "testStrategy": "Unit test the planner logic. Given an empty state, verify it returns `discover_research`. Simulate the completion of `discover_research` with a `research_summary` artifact and verify `define_prd` is now suggested. Test that a node with unmet artifact requirements is not returned.",
346 |         "priority": "high",
347 |         "dependencies": [
348 |           4,
349 |           5
350 |         ],
351 |         "status": "pending",
352 |         "subtasks": [
353 |           {
354 |             "id": 1,
355 |             "title": "Create Planner Class and Load `default-graph.json`",
356 |             "description": "Create a new file `src/planner.ts` and define a `Planner` class. The constructor should read `resources/default-graph.json`, parse it, and store the graph nodes in a private member. Also, define the necessary types for graph nodes in `src/types.ts`.",
357 |             "dependencies": [],
358 |             "details": "The class should have a private field `private graph: { nodes: any[] }`. The constructor will use `fs.readFileSync` and `JSON.parse` to load the graph data. The path to the graph file should be passed into the constructor. Add a `GraphNode` type definition to `src/types.ts` to represent the structure of nodes in the JSON file.",
359 |             "status": "pending",
360 |             "testStrategy": "Unit test the constructor to ensure it correctly loads and parses the JSON file, and that the `graph` member is populated. Test for error handling if the file does not exist."
361 |           },
362 |           {
363 |             "id": 2,
364 |             "title": "Integrate `StateStore` into the `Planner` Class",
365 |             "description": "Modify the `Planner` class to accept a `StateStore` instance in its constructor. Store the `StateStore` instance as a private member to allow access to the current project state for subsequent logic.",
366 |             "dependencies": [
367 |               "6.1"
368 |             ],
369 |             "details": "Update the `Planner` constructor signature to accept an instance of `StateStore` (from Task 5). Store the passed `stateStore` in a `private readonly stateStore: StateStore` field. This will be used by other methods to query the project's state.",
370 |             "status": "pending",
371 |             "testStrategy": "Update the `Planner` unit tests to mock the `StateStore` and pass it to the constructor. Verify the instance is stored correctly within the `Planner` object."
372 |           },
373 |           {
374 |             "id": 3,
375 |             "title": "Implement `dependsOn` Completion Check in `Planner`",
376 |             "description": "Create a private helper method within the `Planner` class, e.g., `areDependenciesMet(node: GraphNode): boolean`. This method should check if all task IDs listed in the node's `dependsOn` array are present in the list of completed tools from the `StateStore`.",
377 |             "dependencies": [
378 |               "6.2"
379 |             ],
380 |             "details": "The method will get the set of completed tool IDs from `this.stateStore.getCompletedToolIds()`. It will then iterate through the input node's `dependsOn` array and return `false` if any dependency ID is not in the completed set. If the `dependsOn` array is empty or all dependencies are met, it returns `true`.",
381 |             "status": "pending",
382 |             "testStrategy": "Unit test this specific method. Provide a mock `StateStore` with a predefined set of completed tools and test nodes with met, unmet, and empty dependencies to ensure the logic is correct."
383 |           },
384 |           {
385 |             "id": 4,
386 |             "title": "Implement `requiresArtifacts` Availability Check in `Planner`",
387 |             "description": "Create a private helper method, e.g., `areArtifactsAvailable(node: GraphNode): boolean`. This method should check if all artifacts listed in the node's `requiresArtifacts` array are available in the current state via the `StateStore`.",
388 |             "dependencies": [
389 |               "6.2"
390 |             ],
391 |             "details": "The method will get the set of available artifact names from `this.stateStore.getAvailableArtifacts()`. It will then iterate through the input node's `requiresArtifacts` array and return `false` if any required artifact is not in the available set. If `requiresArtifacts` is empty or all are available, it returns `true`.",
392 |             "status": "pending",
393 |             "testStrategy": "Unit test this method. Provide a mock `StateStore` with a predefined set of available artifacts and test nodes with met, unmet, and empty artifact requirements."
394 |           },
395 |           {
396 |             "id": 5,
397 |             "title": "Implement `suggest_next_calls` to Filter and Rank Ready Nodes",
398 |             "description": "Implement the public `suggest_next_calls` method. This method will iterate through all graph nodes, filter out already completed nodes, and use the `areDependenciesMet` and `areArtifactsAvailable` helpers to find 'ready' nodes. Finally, it will sort the ready nodes by `phase` (ascending) and then by `id` (alphabetical) before returning them.",
399 |             "dependencies": [
400 |               "6.3",
401 |               "6.4"
402 |             ],
403 |             "details": "The method should first get the list of completed tool IDs from the state. Then, it will `filter` the graph nodes based on three conditions: 1) The node's ID is not in the completed list. 2) `this.areDependenciesMet(node)` is true. 3) `this.areArtifactsAvailable(node)` is true. The resulting array of nodes should then be sorted using a custom comparator for `phase` then `id`.",
404 |             "status": "pending",
405 |             "testStrategy": "Write an integration test for `suggest_next_calls`. Given a graph and a mock `StateStore` in various states (e.g., empty, one task done, one task done with artifacts), verify that the correct list of ranked nodes is returned, respecting the sorting order."
406 |           }
407 |         ]
408 |       },
409 |       {
410 |         "id": 7,
411 |         "title": "Implement `advance_state` Tool",
412 |         "description": "Create the `advance_state` MCP tool to mark a tool as complete and record its outputs and artifacts in the state file.",
413 |         "details": "Register a new MCP tool named `advance_state`. Its handler will accept a tool `id`, `outputs`, and a list of `artifacts`. The handler will call a `recordCompletion` method on the `StateStore` instance, which updates the in-memory state by adding the completed tool and merging the new artifacts. The handler then triggers the `StateStore` to save the updated state to disk. It should return `{ ok: true }` and the path to the state file on success.",
414 |         "testStrategy": "Call `advance_state` with a valid tool ID and artifact mapping. Inspect the resulting `.mcp/state.json` file to confirm it contains the new completion record with a timestamp, outputs, and the correct artifact paths.",
415 |         "priority": "high",
416 |         "dependencies": [
417 |           5,
418 |           6
419 |         ],
420 |         "status": "pending",
421 |         "subtasks": [
422 |           {
423 |             "id": 1,
424 |             "title": "Implement `recordCompletion` Method in `StateStore`",
425 |             "description": "Add a new public method `recordCompletion` to the `StateStore` class in `src/state/state-store.ts`. This method will accept a tool `id`, `outputs`, and a list of `artifacts`. It should create a `ToolCompletion` object with a new timestamp, add it to the `completedTools` map, and merge the new artifacts into the main `artifacts` map within the in-memory `ProjectState` object.",
426 |             "dependencies": [],
427 |             "details": "The method signature should be `recordCompletion(id: string, outputs: Record<string, any>, artifacts: Artifact[])`. It should not call `save()` itself; that responsibility will lie with the tool handler. The new artifacts should overwrite any existing artifacts with the same name. This method directly modifies the in-memory state managed by the `StateStore` instance.",
428 |             "status": "pending",
429 |             "testStrategy": "Unit test the `recordCompletion` method. Initialize a `StateStore` with a blank state, call `recordCompletion` with sample data, and then inspect the internal `state` property to verify that `completedTools` and `artifacts` have been updated correctly and a timestamp has been added."
430 |           },
431 |           {
432 |             "id": 2,
433 |             "title": "Define `advance_state` Tool and Zod Input Schema",
434 |             "description": "Create a new file `src/tools/definitions/advance-state.ts`. In this file, define and export the Zod schema for the `advance_state` tool's input, which includes a string `id`, a `z.record(z.any())` for `outputs`, and an array of `artifact` objects for `artifacts`. Also, define the `McpTool` object with the name `advance_state`, a suitable description, and a reference to the schema.",
435 |             "dependencies": [],
436 |             "details": "The artifact schema within the input array should validate `source`, `name`, and `uri` as strings, consistent with the `Artifact` type in `src/state/state-types.ts`. The main tool object will be exported to be used for registration later. The handler function can be a placeholder for now.",
437 |             "status": "pending",
438 |             "testStrategy": "No dedicated test is needed for the definition itself, as it will be validated by the tool registry and tested implicitly by the handler's tests."
439 |           },
440 |           {
441 |             "id": 3,
442 |             "title": "Implement `advance_state` Handler to Call `recordCompletion`",
443 |             "description": "In `src/tools/definitions/advance-state.ts`, implement the body of the `handler` function for the `advance_state` tool. The handler will use the `stateStore` from its context to call the `recordCompletion` method, passing the validated `id`, `outputs`, and `artifacts` from its input.",
444 |             "dependencies": [
445 |               "7.1",
446 |               "7.2"
447 |             ],
448 |             "details": "The handler will receive `context: McpToolContext` and `input: { id: string, ... }`. It should destructure these arguments and call `context.stateStore.recordCompletion(input.id, input.outputs, input.artifacts)`. The handler function should be marked as `async`.",
449 |             "status": "pending",
450 |             "testStrategy": "Using a mock `StateStore` in a unit test, verify that the handler correctly calls the `recordCompletion` method with the exact arguments passed into the tool."
451 |           },
452 |           {
453 |             "id": 4,
454 |             "title": "Add State Persistence and Success Response to `advance_state` Handler",
455 |             "description": "Extend the `advance_state` handler in `src/tools/definitions/advance-state.ts`. After calling `recordCompletion`, the handler must call `await context.stateStore.save()` to persist the updated state to disk. On success, it should return an object `{ ok: true, statePath: <path_to_state.json> }`.",
456 |             "dependencies": [
457 |               "7.3"
458 |             ],
459 |             "details": "The `save()` method on `StateStore` is asynchronous and must be awaited. The path to the state file can be retrieved from a property on the `stateStore` instance (e.g., `context.stateStore.statePath`). This completes the core logic of the tool.",
460 |             "status": "pending",
461 |             "testStrategy": "In an integration test, call the tool handler and verify that the `save` method on the `StateStore` mock is called. Also, check that the handler's return value matches the specified success format."
462 |           },
463 |           {
464 |             "id": 5,
465 |             "title": "Register `advance_state` Tool with the MCP Server",
466 |             "description": "Import the `advance_state` tool definition from `src/tools/definitions/advance-state.ts` into the main tool registration location (likely `src/mcp/mcp-server.ts` or a dedicated tool loading module). Register the tool with the `ToolRegistry` instance so it becomes available to the MCP server.",
467 |             "dependencies": [
468 |               "7.2"
469 |             ],
470 |             "details": "Locate the code block where other tools are registered, which is typically in the `McpServer` constructor or an initialization method. Add a line like `this.toolRegistry.registerTool(advanceStateTool);` to include the new tool in the server's list of available tools.",
471 |             "status": "pending",
472 |             "testStrategy": "Start the server and use an MCP client or a test utility to list available tools. Verify that `advance_state` is present in the list."
473 |           }
474 |         ]
475 |       },
476 |       {
477 |         "id": 8,
478 |         "title": "Implement `export_task_list` Tool",
479 |         "description": "Create the `export_task_list` tool to emit a compact task list for interoperability with external systems.",
480 |         "details": "Register a new MCP tool named `export_task_list`. The handler will read `resources/prompts.meta.yaml` and map its contents to a JSON array. Each element in the array should contain `id`, `title`, `dependsOn`, and a default `status: 'pending'`. This provides a simple, structured view of the entire workflow.",
481 |         "testStrategy": "Call the `export_task_list` tool. Validate that the returned JSON array contains an entry for every prompt defined in the metadata file and that the `id`, `title`, and `dependsOn` fields correctly match the source data.",
482 |         "priority": "medium",
483 |         "dependencies": [
484 |           3
485 |         ],
486 |         "status": "pending",
487 |         "subtasks": [
488 |           {
489 |             "id": 1,
490 |             "title": "Create `export_task_list` Tool Skeleton",
491 |             "description": "Create the file `src/tools/export_task_list.ts` and define the basic structure for the new tool, including the factory function `createExportTaskListTool` and a placeholder implementation.",
492 |             "dependencies": [],
493 |             "details": "Following the existing pattern in `src/tools`, create a new file for the `export_task_list` tool. It should export a factory function that returns a `Tool` object with the name 'export_task_list', a clear description, an empty input schema, and a handler that currently returns an empty array. This establishes the boilerplate for the tool.",
494 |             "status": "pending",
495 |             "testStrategy": "Verify the new file `src/tools/export_task_list.ts` exists and exports the `createExportTaskListTool` function. Ensure the returned tool object has the correct name."
496 |           },
497 |           {
498 |             "id": 2,
499 |             "title": "Implement YAML File Reading and Parsing",
500 |             "description": "Update the `export_task_list` tool handler to read and parse the `resources/prompts.meta.yaml` file.",
501 |             "dependencies": [
502 |               "8.1"
503 |             ],
504 |             "details": "Use the `fs` module to read the contents of `resources/prompts.meta.yaml`. Add the `js-yaml` library as a dependency if it's not already part of the project. Use the library to parse the YAML content into a JavaScript array of objects. Implement basic error handling for file-not-found scenarios.",
505 |             "status": "pending",
506 |             "testStrategy": "In a test environment, mock `fs.readFileSync` to return a sample YAML string. Call the handler and assert that it correctly parses the string into a JavaScript object without errors."
507 |           },
508 |           {
509 |             "id": 3,
510 |             "title": "Map Parsed YAML to the Specified JSON Array Format",
511 |             "description": "Transform the parsed data from `prompts.meta.yaml` into the final JSON array structure required by the task.",
512 |             "dependencies": [
513 |               "8.2"
514 |             ],
515 |             "details": "Within the tool's handler, iterate over the array of parsed prompt objects. For each object, create a new object containing the `id`, `title`, and `dependsOn` fields from the source. Add a `status` field with a default value of 'pending'. The handler should return this newly created array.",
516 |             "status": "pending",
517 |             "testStrategy": "Write a unit test for the handler that provides a pre-parsed array of prompt objects. Verify that the returned array has the correct length and that each element contains the `id`, `title`, `dependsOn`, and `status` fields with the expected values."
518 |           },
519 |           {
520 |             "id": 4,
521 |             "title": "Register the Tool with the MCP Server",
522 |             "description": "Integrate the newly created `export_task_list` tool into the main application by registering it with the MCP server on startup.",
523 |             "dependencies": [
524 |               "8.1"
525 |             ],
526 |             "details": "In `src/main.ts`, import the `createExportTaskListTool` factory function. In the main server initialization block, call the factory and pass the resulting tool object to the `server.registerTool()` method. This will make the tool available via the MCP.",
527 |             "status": "pending",
528 |             "testStrategy": "After starting the server, use an MCP client or a test utility to list all available tools. Confirm that `export_task_list` appears in the list of registered tools."
529 |           },
530 |           {
531 |             "id": 5,
532 |             "title": "Create an Integration Test for the `export_task_list` Tool",
533 |             "description": "Write a test that invokes the complete `export_task_list` tool and validates its output against a known `prompts.meta.yaml` file.",
534 |             "dependencies": [
535 |               "8.3",
536 |               "8.4"
537 |             ],
538 |             "details": "Create a test file `src/tools/export_task_list.test.ts`. The test should execute the tool's handler. It should use a test-specific version of `prompts.meta.yaml` to ensure a stable test environment. The test will assert that the returned JSON array correctly reflects the contents of the test YAML file, verifying the entire flow from file reading to data transformation.",
539 |             "status": "pending",
540 |             "testStrategy": "Run the test suite. The test should pass if the handler correctly reads a mock YAML file, transforms its content, and returns a JSON array matching the expected structure and values."
541 |           }
542 |         ]
543 |       },
544 |       {
545 |         "id": 9,
546 |         "title": "Implement Token Bucket Rate Limiter Utility",
547 |         "description": "Provide a `TokenBucket` utility for rate limiting, intended for future use with external HTTP integrations.",
548 |         "status": "pending",
549 |         "dependencies": [
550 |           1
551 |         ],
552 |         "priority": "low",
553 |         "details": "Create a `TokenBucket` class with a constructor that accepts `capacity` and `refillPerSec`. Implement a `take(count)` method that decrements the token count. If not enough tokens are available, the method should asynchronously wait for the required number of tokens to be refilled before resolving. This is a foundational component for future safety controls.",
554 |         "testStrategy": "Unit test the `TokenBucket`. Verify that calling `take(1)` when the bucket is empty causes a delay approximately equal to `1 / refillPerSec`. Test that taking the full capacity immediately depletes the tokens and that they recover over time as expected.",
555 |         "subtasks": [
556 |           {
557 |             "id": 1,
558 |             "title": "Create `TokenBucket.ts` with Class Skeleton and Constructor",
559 |             "description": "Create the file `src/utils/TokenBucket.ts`. Define the `TokenBucket` class with a constructor that accepts `capacity` and `refillPerSec`. Initialize class properties for `capacity`, `refillPerSec`, `tokens`, and `lastRefillTime`.",
560 |             "dependencies": [],
561 |             "details": "This subtask establishes the foundational file and class structure. The constructor should initialize `this.tokens` to `this.capacity` and `this.lastRefillTime` to the current time (`Date.now()`). Also, create the corresponding test file `tests/TokenBucket.test.ts` with a placeholder test suite.",
562 |             "status": "pending",
563 |             "testStrategy": ""
564 |           },
565 |           {
566 |             "id": 2,
567 |             "title": "Implement Private `_refill` Method for Token Replenishment",
568 |             "description": "Implement a private helper method, `_refill()`, inside the `TokenBucket` class. This method will calculate the number of new tokens to add based on the time elapsed since `lastRefillTime` and the `refillPerSec` rate.",
569 |             "dependencies": [
570 |               "9.1"
571 |             ],
572 |             "details": "The `_refill` method should calculate elapsed time since the last refill, determine the number of tokens to add, and update `this.lastRefillTime` to the current time. It must ensure that the number of tokens does not exceed the `capacity`. This isolates the core state update logic.",
573 |             "status": "pending",
574 |             "testStrategy": ""
575 |           },
576 |           {
577 |             "id": 3,
578 |             "title": "Implement Synchronous Path for `take(count)` Method",
579 |             "description": "Implement the `take(count)` method. It should first call the `_refill()` method to ensure the token count is up-to-date. Then, it should handle the synchronous case where sufficient tokens are available.",
580 |             "dependencies": [
581 |               "9.2"
582 |             ],
583 |             "details": "The `take` method will be `async`. After calling `_refill()`, if `this.tokens >= count`, the method should decrement `this.tokens` by `count` and resolve immediately. This covers the 'happy path' where no waiting is necessary.",
584 |             "status": "pending",
585 |             "testStrategy": ""
586 |           },
587 |           {
588 |             "id": 4,
589 |             "title": "Implement Asynchronous Waiting Logic in `take(count)`",
590 |             "description": "Enhance the `take(count)` method to handle cases where there are insufficient tokens. The method should calculate the necessary delay until enough tokens are available and wait asynchronously before proceeding.",
591 |             "dependencies": [
592 |               "9.3"
593 |             ],
594 |             "details": "When `this.tokens < count`, calculate the `tokensNeeded` and the `waitTime` in milliseconds. Use `new Promise(resolve => setTimeout(resolve, waitTime))` to pause execution. After the delay, recursively call `this.take(count)` to re-evaluate and consume the tokens.",
595 |             "status": "pending",
596 |             "testStrategy": ""
597 |           },
598 |           {
599 |             "id": 5,
600 |             "title": "Write Comprehensive Unit Tests in `tests/TokenBucket.test.ts`",
601 |             "description": "Implement unit tests in `tests/TokenBucket.test.ts` to validate the `TokenBucket` functionality, including asynchronous behavior.",
602 |             "dependencies": [
603 |               "9.4"
604 |             ],
605 |             "details": "Tests should cover: 1. Initial state (full bucket). 2. Immediate depletion of tokens. 3. Correct asynchronous delay when taking from an empty bucket. 4. Gradual refill over time. Use a testing framework like Jest with fake timers to control time during tests and make assertions on wait times.",
606 |             "status": "pending",
607 |             "testStrategy": "Using a test runner like Jest, mock timers to verify that `take(1)` on an empty bucket with `refillPerSec: 10` waits approximately 100ms. Test that taking full capacity works, and subsequent takes wait for the correct refill duration."
608 |           }
609 |         ]
610 |       },
611 |       {
612 |         "id": 10,
613 |         "title": "Implement Prompt Metadata Validation Script",
614 |         "description": "Flesh out the `scripts/validate_metadata.ts` script to parse YAML front matter from all markdown prompt files and validate it against a strict schema.",
615 |         "details": "The script must be executed via `npm run validate:metadata`. It should read all `.md` files in the prompts directory, extract the YAML front matter, and ensure required fields (e.g., `id`, `title`, `phase`, `description`) are present and correctly typed. The script should exit with a non-zero code if validation fails, logging clear error messages about which file and field are invalid. This aligns with the 'Prompt Metadata Automation' feature and is a prerequisite for building the catalog.",
616 |         "testStrategy": "Create a temporary valid prompt file and an invalid one (e.g., missing a required field). Run the script against them. Verify the script passes for the valid file and fails with a descriptive error for the invalid one. Ensure it correctly handles various data types.",
617 |         "priority": "high",
618 |         "dependencies": [],
619 |         "status": "pending",
620 |         "subtasks": [
621 |           {
622 |             "id": 1,
623 |             "title": "Add Dependencies and Configure `validate:metadata` NPM Script",
624 |             "description": "Add `zod`, `gray-matter`, and `glob` as development dependencies to `package.json`. Ensure the `validate:metadata` script in `package.json` is correctly configured to execute `scripts/validate_metadata.ts` using `ts-node`.",
625 |             "dependencies": [],
626 |             "details": "This foundational step ensures all required tools are available before writing the core logic. The command should be `npm install zod gray-matter glob --save-dev`. The script should be `\"validate:metadata\": \"ts-node scripts/validate_metadata.ts\"`.",
627 |             "status": "pending",
628 |             "testStrategy": ""
629 |           },
630 |           {
631 |             "id": 2,
632 |             "title": "Define Prompt Metadata Schema using Zod",
633 |             "description": "In `scripts/validate_metadata.ts`, define a strict Zod schema for the prompt's YAML front matter. The schema must enforce the presence and correct types for `id` (string), `title` (string), `phase` (number), and `description` (string).",
634 |             "dependencies": [
635 |               "10.1"
636 |             ],
637 |             "details": "Create a `const promptMetadataSchema = z.object({...})`. This schema will be the single source of truth for metadata validation and should be placed at the top of the script file for clarity.",
638 |             "status": "pending",
639 |             "testStrategy": ""
640 |           },
641 |           {
642 |             "id": 3,
643 |             "title": "Implement File Discovery for Prompt Markdown Files",
644 |             "description": "In `scripts/validate_metadata.ts`, use the `glob` library to implement a function that finds and returns a list of all `.md` file paths within the `prompts/` directory and its subdirectories.",
645 |             "dependencies": [
646 |               "10.1"
647 |             ],
648 |             "details": "The function should asynchronously find all files matching the pattern `prompts/**/*.md`. This isolates the file system interaction from the parsing and validation logic. The main script function will await the result of this discovery.",
649 |             "status": "pending",
650 |             "testStrategy": ""
651 |           },
652 |           {
653 |             "id": 4,
654 |             "title": "Implement Main Loop to Parse and Validate Front Matter",
655 |             "description": "Create the main execution logic in `scripts/validate_metadata.ts`. This logic should iterate through the file paths discovered in subtask 3, read each file's content, use `gray-matter` to parse the YAML front matter, and then validate the resulting object against the Zod schema defined in subtask 2.",
656 |             "dependencies": [
657 |               "10.2",
658 |               "10.3"
659 |             ],
660 |             "details": "This subtask ties together file discovery, parsing, and validation. It will form the core of the script's functionality. Use `fs.readFileSync` to get file content and `matter()` from `gray-matter` to extract the `data` object for validation.",
661 |             "status": "pending",
662 |             "testStrategy": ""
663 |           },
664 |           {
665 |             "id": 5,
666 |             "title": "Implement Error Reporting and Non-Zero Exit Code on Failure",
667 |             "description": "Enhance the validation loop to handle validation failures. When a file's metadata is invalid, log a clear error message to the console specifying the file path and the nature of the validation error. The script must exit with `process.exit(1)` if any validation errors are found.",
668 |             "dependencies": [
669 |               "10.4"
670 |             ],
671 |             "details": "Use a `try...catch` block around the Zod `safeParse` method. If the parse result is not successful, format the `ZodError` into a user-friendly message. Track a global error flag or a count of errors to determine the final exit code after checking all files.",
672 |             "status": "pending",
673 |             "testStrategy": ""
674 |           }
675 |         ]
676 |       },
677 |       {
678 |         "id": 11,
679 |         "title": "Implement Catalog and README Build Script",
680 |         "description": "Develop the `scripts/build_catalog.ts` script to automatically generate `catalog.json` and update the prompt tables in `README.md` based on the metadata from all prompt files.",
681 |         "details": "This script, run via `npm run build:catalog`, will consume the validated metadata from all `.md` prompt files. It will then generate a `catalog.json` file containing an array of all prompt metadata objects. Concurrently, it will parse `README.md`, find placeholder tags, and inject updated markdown tables, ensuring the README stays synchronized with the prompt library. This fulfills a core requirement of 'Prompt Metadata Automation'.",
682 |         "testStrategy": "After creating a few sample prompts, run the script. Check that `catalog.json` is created or updated correctly. Inspect `README.md` to confirm the prompt tables are accurately regenerated. Verify that running the script a second time without changes results in no file modifications.",
683 |         "priority": "high",
684 |         "dependencies": [
685 |           10
686 |         ],
687 |         "status": "pending",
688 |         "subtasks": [
689 |           {
690 |             "id": 1,
691 |             "title": "Create a Utility to Discover All Prompt Markdown Files",
692 |             "description": "Within the new `scripts/build_catalog.ts` file, implement a utility function that finds all prompt markdown files. This function will use a glob pattern to recursively search the `prompts/` directory for all files ending in `.md` and return an array of their full paths.",
693 |             "dependencies": [],
694 |             "details": "This is the initial step for gathering the source files. A library like `glob` or `fast-glob` should be added as a dev dependency to handle the file system traversal. The function should be designed to be reusable within the script.",
695 |             "status": "pending",
696 |             "testStrategy": "Create a temporary directory with a few nested `.md` files and some other file types. Assert that the utility function returns the correct paths for only the `.md` files."
697 |           },
698 |           {
699 |             "id": 2,
700 |             "title": "Implement a Parser to Extract and Validate Prompt Front-Matter",
701 |             "description": "Create a function that accepts a file path, reads the markdown file's content, and parses its YAML front-matter using the `gray-matter` library. The extracted metadata object should then be validated against a predefined schema to ensure it contains all required fields (e.g., id, title, description).",
702 |             "dependencies": [
703 |               "11.1"
704 |             ],
705 |             "details": "This function is critical for consuming the prompt files discovered in the previous subtask. A validation library like `zod` should be used to define and enforce the metadata structure. The function should throw a clear error or log a warning if a file is missing front-matter or if the metadata is invalid.",
706 |             "status": "pending",
707 |             "testStrategy": "Test with a valid prompt file and assert the metadata is parsed correctly. Test with a file missing front-matter and another with invalid/missing fields to ensure errors are handled gracefully."
708 |           },
709 |           {
710 |             "id": 3,
711 |             "title": "Develop Main Script Logic to Aggregate Metadata from All Prompts",
712 |             "description": "Implement the main execution logic in `scripts/build_catalog.ts`. This logic will use the discovery utility (11.1) to get all prompt file paths, then iterate through them, calling the parser (11.2) on each. All successfully parsed and validated metadata objects should be collected into a single in-memory array.",
713 |             "dependencies": [
714 |               "11.1",
715 |               "11.2"
716 |             ],
717 |             "details": "This subtask orchestrates the data collection process. The main function should handle errors from the parsing step by logging the problematic file and continuing, ensuring that one bad file doesn't halt the entire process. The final result is a complete, in-memory representation of the prompt catalog.",
718 |             "status": "pending",
719 |             "testStrategy": "Using a set of mock prompt files (including one invalid one), run the aggregation logic and assert that the final array contains the correct metadata for the valid files and that a warning was logged for the invalid one."
720 |           },
721 |           {
722 |             "id": 4,
723 |             "title": "Implement `catalog.json` Generation from Aggregated Metadata",
724 |             "description": "Create a function that takes the aggregated array of prompt metadata (from 11.3), sorts it by prompt ID, serializes it into a human-readable JSON string, and writes it to the `catalog.json` file in the project root.",
725 |             "dependencies": [
726 |               "11.3"
727 |             ],
728 |             "details": "This function is responsible for the first major output of the script. It should use `JSON.stringify` with an indentation setting for pretty-printing. The file write operation should overwrite the existing `catalog.json` to ensure it's always up-to-date.",
729 |             "status": "pending",
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

scripts/__tests__/workflow_sync.test.ts

```
1 | import assert from 'node:assert/strict';
2 | import { promises as fs } from 'fs';
3 | import os from 'os';
4 | import path from 'path';
5 | 
6 | import { PromptCatalog } from '../catalog_types';
7 | import { regenerateWorkflow, synchronizeWorkflowDoc } from '../generate_docs';
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
