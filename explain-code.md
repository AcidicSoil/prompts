---
phase: "P7 Release & Ops"
gate: "Review Gate"
status: "Improve reviewer comprehension before approvals."
previous:
  - "/owners"
  - "/review"
next:
  - "/review-branch"
  - "/pr-desc"
---

# Explain Code

Trigger: /explain-code

Purpose: Provide line-by-line explanations for a given file or diff.

## Steps

1. Accept a file path or apply to staged diff.
2. Explain blocks with comments on purpose, inputs, outputs, and caveats.
3. Highlight risky assumptions and complexity hot spots.

## Output format

- Annotated markdown with code fences and callouts.

