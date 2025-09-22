# CI/Test Checklist from Tasks

Trigger: /tm-ci

Purpose: Derive a near-term CI and test checklist from ready and in-progress tasks.

Steps:

1. Compute ready tasks (see /tm-next) and collect any testStrategy fields.
2. Group by component or tag if available; otherwise by path keywords in titles.
3. Propose CI jobs and test commands with approximate runtimes and gating rules.
4. Include a smoke-test matrix and minimal code coverage targets if relevant.

Output format:

- "# CI Plan"
- Tables: jobs (name | trigger | commands | est_time) and tests (scope | command | expected_artifacts).
- "## Risk Areas" bullets and "## Follow-ups".

Examples:

- Input: /tm-ci
- Output: one CI plan with 3–8 jobs and a test table.

Notes:

- Non-binding guidance. Adapt to the repo’s actual CI system.
