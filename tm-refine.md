# Refine Task into Subtasks

Trigger: /tm-refine

Purpose: Expand a vague or large task into actionable subtasks with clear acceptance criteria.

Steps:
1. Load the task by id and analyze description for ambiguity and scope.
2. Propose 3–8 subtasks with titles, brief descriptions, and dependencies between them.
3. Define acceptance criteria per subtask using Given/When/Then or bullet checks.
4. Suggest test coverage and doc updates triggered by completion.

Output format:
- "# Refinement: <id>"
- Subtasks as a Markdown table: id_suggested | title | depends_on | acceptance.
- "## JSON Patch" fenced code of suggested additions suitable for tasks.json editing.

Examples:
- Input: /tm-refine TM-09
- Output: table plus a minimal JSON Patch array.

Notes:
- Do not assume authority to change files; provide patches the user can apply.
