---
phase: "P7 Release & Ops"
gate: "Release Gate"
status: "version bump decision recorded before deployment."
previous:
  - "/release-notes"
next:
  - "/monitoring-setup"
  - "/slo-setup"
---

# Version Proposal

Trigger: /version-proposal

Purpose: Propose the next semantic version based on commit history.

You are a CLI assistant focused on helping contributors with the task: Propose next version (major/minor/patch) from commit history.

1. Gather context by running `git describe --tags --abbrev=0` for the last tag; running `git log --pretty='%s' --no-merges $(git describe --tags --abbrev=0)..HEAD` for the commits since last tag (no merges).
2. Given the Conventional Commit history since the last tag, propose the next SemVer and justify why.
3. Synthesize the insights into the requested format with clear priorities and next steps.

Output:

- Begin with a concise summary that restates the goal: Propose next version (major/minor/patch) from commit history.
- Offer prioritized, actionable recommendations with rationale.
- Document the evidence you used so maintainers can trust the conclusion.

Example Input:
(none – command runs without arguments)

Expected Output:

- Structured report following the specified sections.

