# Next Ready Tasks

Trigger: /tm-next

Purpose: List tasks that are ready to start now (no unmet dependencies), ordered by priority and dependency depth.

Steps:

1. Load tasks.json and build a map of id → task.
2. A task is ready if status ∈ {pending, blocked} AND all dependencies are done.
3. Order by: priority desc, then shortest path length to completion, then title.
4. For each ready task, include why it is ready and the prerequisites satisfied.

Output format:

- "# Ready Now"
- Table: id | title | priority | why_ready | prereqs
- "## Notes" for tie-break rules and data gaps.

Examples:

- Input: /tm-next
- Output: a table of 5–20 items. If none, say "No ready tasks" and list nearest-unblock candidates.

Notes:

- Treat missing or null priority as 0. If custom scales exist, describe them in Notes.
