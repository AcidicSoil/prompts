# Advance Task(s)

Trigger: /tm-advance

Purpose: For given task id(s), produce a concrete work plan, acceptance criteria, tests, and a Conventional Commits message to move status toward done.

Steps:
1. Read tasks.json; resolve each provided id. If none provided, pick the top item from /tm-next.
2. For each task: restate title, goals, and related dependencies.
3. Draft a step-by-step plan with file touch-points and test hooks.
4. Provide a minimal commit plan and a Conventional Commits message with scope and short body.
5. List measurable acceptance criteria.

Output format:
- One section per task: "## <id> — <title>"
- Subsections: Plan, Files, Tests, Acceptance, Commit Message (fenced), Risks.

Examples:
- Input: /tm-advance TM-42 TM-43
- Output: structured sections with a commit message like `feat(parser): implement rule X`.

Notes:
- Do not mutate tasks.json. Emit proposed changes only.
