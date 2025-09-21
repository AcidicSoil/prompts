# plan-delta

Trigger: /plan-delta

Purpose: Orchestrate mid-project planning deltas on an existing task graph with history preservation, lineage, and readiness recalculation.

Steps:

1. Discover repository context:
   1. Detect tasks file path: prefer `tasks.json`; else search `**/tasks.json`.
   2. Detect latest plan doc: prefer `PRD.md` or `docs/PRD.md`; else `**/*(prd|spec|plan)*.md`.
2. Snapshot:
   1. Create `./artifacts/` if missing.
   2. Copy the current tasks file to `./artifacts/tasks-$(date +%Y%m%d-%H%M%S).json` using: `cp -f <tasks.json> ./artifacts/tasks-$(date +%Y%m%d-%H%M%S).json`.
3. Input collection:
   1. Read new objectives, constraints, and findings from the user input or provided delta text.
   2. Parse selection rules to choose mode: **Continue**, **Hybrid Rebaseline**, or **Full Rebaseline**.
4. Delta Doc generation:
   1. Create `./artifacts/delta-$(date +%Y%m%d-%H%M%S).md` containing sections:
      - Objectives (new)
      - Constraints (new)
      - Impacts
      - Decisions
      - Evidence log (sources, dates, links)
5. Task graph update:
   1. Never alter historical states `done|in_progress|blocked` of existing tasks.
   2. Do not reuse IDs. For any replaced task, set `superseded_by` on the old task and include its ID in the new task's `supersedes[]`.
   3. Add `source_doc`, `lineage[]` on all new or changed tasks.
   4. Create new tasks only for new or changed work. Link predecessors via `dependencies` or `relations`.
   5. Keep deprecated tasks in graph with `status: "deprecated"` and a `reason`.
6. Graph maintenance:
   1. Recompute dependency order and validate acyclicity.
   2. Flag contradictions or invalidated edges as `blocked` with a machine-readable `blocked_reason`.
   3. Bubble critical-path tasks to the active frontier by recomputing earliest-start and slack.
7. Readiness and selection:
   1. Implement `ready/next()` over the graph: select tasks with all dependencies `done` and not `blocked`.
   2. Produce a short readiness report grouped by `ready | blocked | deprecated`.
8. Outputs:
   1. Write the updated tasks file in-place, preserving formatting where possible.
   2. Persist the Delta Doc under `./artifacts/`.
   3. Emit decision hooks: one line per change stating what it enables.
9. Termination:
   - Stop when all deltas are merged and readiness recalculated, or when a prerequisite cannot be resolved with available evidence.

Output format:

- Produce three artifacts:
  1. **Updated tasks file**: valid JSON. Preserve existing fields. Append only the new or changed tasks and relations. Do not mutate historical statuses.
  2. **Delta document**: Markdown with the exact headings `# Delta`, `## Objectives`, `## Constraints`, `## Impacts`, `## Decisions`, `## Evidence`.
  3. **Readiness report**: Plain text with sections `READY`, `BLOCKED`, `DEPRECATED`. Each item as `- <id> <title>`; blocked items add `[reason=<code>]`.
- Print **Decision hooks** as lines starting with `HOOK: <id> enables <capability>`.

Examples:

- Input →

  ```
  Mode: Continue
  New objectives: add offline export for tasks
  Constraints: no DB migrations
  Findings: existing export lib supports JSON only
  ```

  Output →
  - Updated `tasks.json` with new task `T-342` { title: "Add CSV export", dependencies: ["T-120"], source_doc: "delta-20250921.md", lineage: ["T-120"], supersedes: [] }.
  - `artifacts/delta-20250921-160500.md` populated with objectives, constraints, impacts, decisions, evidence.
  - Readiness report lists `T-342` under READY if deps done.

- Input →

  ```
  Mode: Hybrid Rebaseline
  Changes: ~30% of scope affected by auth provider swap
  ```

  Output →
  - Minor-plan version bump recorded in Delta Doc.
  - New tasks added for provider swap; prior tasks kept with `deprecated` or `blocked` and lineage links.

Notes:

- Never write outside the repo. Keep artifacts in `./artifacts/`.
- Evidence log entries include `source`, `date`, `summary`, and optional `link`.
- Selection rules: Continue (<20% change), Hybrid (20–40%), Full (>40% or goals/KPIs/architecture pivot).
- If inputs are insufficient, emit a TERMINATION note with missing evidence keys.
