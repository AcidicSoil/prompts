# PRD → Tasks Delta

Trigger: /tm-delta

Purpose: Compare a PRD text against tasks.json and propose add/update/remove operations.

Steps:
1. Accept PRD content pasted by the user or a path like ./prd.txt. If absent, output a short template asking for PRD input.
2. Extract objectives, constraints, deliverables, and milestones from the PRD.
3. Map them to existing tasks by fuzzy match on title and keywords; detect gaps.
4. Propose: new tasks, updates to titles/descriptions/priority, and deprecations.

Output format:
- "# Delta Summary"
- Tables: adds | updates | removals.
- "## JSON Patch" with an ordered list of operations: add/replace/remove.
- "## Assumptions" and "## Open Questions".

Examples:
- Input: /tm-delta ./prd.txt
- Output: tables with a small JSON Patch block.

Notes:
- Keep patches minimal and reversible. Flag any destructive changes explicitly.
