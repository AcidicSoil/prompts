# Blocker Diagnosis

Trigger: /tm-blockers

Purpose: Diagnose why a task is blocked and propose the shortest path to unblock it.

Steps:
1. Load tasks.json and the target id.
2. Enumerate unmet dependencies and missing artifacts (tests, docs, approvals).
3. Classify each blocker: dependency, ambiguity, environment, CI, external.
4. Propose 1–3 minimal unblocking actions, each with owner, effort, and success check.

Output format:
- "# Blocker Report: <id>"
- Tables: blockers (type | item | evidence), actions (step | owner | effort | success_criteria).

Examples:
- Input: /tm-blockers TM-17
- Output: two tables and a short narrative under "Findings".

Notes:
- If the task is not actually blocked, state why and redirect to /tm-advance.
