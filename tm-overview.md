# TaskMaster Overview

Trigger: /tm-overview

Purpose: Summarize the current TaskMaster tasks.json by status, priority, dependency health, and critical path to orient work.

Steps:
1. Locate the active tasks.json at repo root or the path supplied in the user message. Do not modify it.
2. Parse fields: id, title, description, status, priority, dependencies, subtasks.
3. Compute counts per status and a table of top pending items by priority.
4. Detect dependency issues: cycles, missing ids, orphans (no deps and not depended on).
5. Approximate a critical path: longest dependency chain among pending→in_progress tasks.

Output format:
- "# Overview" then a bullets summary.
- "## Totals" as a 4-column table: status | count | percent | notes.
- "## Top Pending" table: id | title | priority | unblockers.
- "## Critical Path" as an ordered list of ids with short titles.
- "## Issues" list for cycles, missing references, duplicates.

Examples:
- Input (Codex TUI): /tm-overview
- Output: tables and lists as specified. Keep to <= 200 lines.

Notes:
- Read-only. Assume statuses: pending | in_progress | blocked | done.
- If tasks.json is missing or invalid, output an "## Errors" section with a concise diagnosis.
