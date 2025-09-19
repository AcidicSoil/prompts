---
phase: "P8 Post-release Hardening"
gate: "Post-release cleanup"
status: "plan high-leverage refactors once Sev-1 issues settle."
previous:
  - "/fix"
next:
  - "/file-modularity"
  - "/dead-code-scan"
---

# Refactor Suggestions

Trigger: /refactor-suggestions

Purpose: Propose repo-wide refactoring opportunities after tests exist.

## Steps

1. Map directory structure and large files.
2. Identify duplication, data clumps, and god objects.
3. Suggest phased refactors with safety checks and tests.

## Output format

- Ranked list with owners and effort estimates.

