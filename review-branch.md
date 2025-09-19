---
phase: "P7 Release & Ops"
gate: "Review Gate"
status: "branch scope validated before PR submission."
previous:
  - "/review"
next:
  - "/pr-desc"
  - "/release-notes"
---

# Review Branch

Trigger: /review-branch

Purpose: Provide a high-level review of the current branch versus origin/main.

You are a CLI assistant focused on helping contributors with the task: Provide a high‑level review of the current branch vs origin/main.

1. Gather context by running `git diff --stat origin/main...HEAD` for the diff stats; running `git diff origin/main...HEAD | sed -n '1,200p'` for the ```diff.
2. Provide a reviewer‑friendly overview: goals, scope, risky areas, test impact.
3. Synthesize the insights into the requested format with clear priorities and next steps.

Output:

- Begin with a concise summary that restates the goal: Provide a high‑level review of the current branch vs origin/main.
- Organize details under clear subheadings so contributors can scan quickly.
- Call out test coverage gaps and validation steps.

Example Input:
(none – command runs without arguments)

Expected Output:

- Structured report following the specified sections.

