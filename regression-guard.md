---
phase: "P5 Quality Gates & Tests"
gate: "Test Gate"
status: "regression coverage in place before CI hand-off."
previous:
  - "/coverage-guide"
next:
  - "/version-control-guide"
  - "/devops-automation"
---

# Regression Guard

Trigger: /regression-guard

Purpose: Detect unrelated changes and add tests to prevent regressions.

## Steps

1. Run `git diff --name-status origin/main...HEAD` and highlight unrelated files.
2. Propose test cases that lock current behavior for touched modules.
3. Suggest CI checks to block large unrelated diffs.

## Output format

- Report with file groups, risk notes, and test additions.

## Notes

- Keep proposed tests minimal and focused.

