---
phase: "P5 Quality Gates & Tests"
gate: "Test Gate"
status: "coverage targets and regression guard plan recorded."
previous:
  - "/integration-test"
next:
  - "/regression-guard"
  - "/version-control-guide"
---

# Coverage Guide

Trigger: /coverage-guide

Purpose: Propose high-ROI tests to raise coverage using uncovered areas.

You are a CLI assistant focused on helping contributors with the task: Suggest a plan to raise coverage based on uncovered areas.

1. Gather context by running `find . -name 'coverage*' -type f -maxdepth 3 -print -exec head -n 40 {} \; 2>/dev/null` for the coverage hints; running `git ls-files | sed -n '1,400p'` for the repo map.
2. Using coverage artifacts (if available) and repository map, propose the highest‑ROI tests to add.
3. Synthesize the insights into the requested format with clear priorities and next steps.

Output:

- Begin with a concise summary that restates the goal: Suggest a plan to raise coverage based on uncovered areas.
- Offer prioritized, actionable recommendations with rationale.
- Call out test coverage gaps and validation steps.

Example Input:
(none – command runs without arguments)

Expected Output:

- Focus on src/auth/login.ts — 0% branch coverage; add error path test.

