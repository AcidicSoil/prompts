---
phase: "P7 Release & Ops"
gate: "Release Gate"
status: "readiness criteria before shipping."
previous:
  - "/logging-strategy"
next:
  - "/error-analysis"
  - "/fix"
---

# Audit

Trigger: /audit

Purpose: Audit repository hygiene and suggest improvements.

## Steps

1. Gather context by running `ls -la` for the top-level listing. Inspect `.editorconfig`, `.gitignore`, `.geminiignore`, `.eslintrc.cjs`, `.eslintrc.js`, `tsconfig.json`, and `pyproject.toml` if present to understand shared conventions.
2. Assess repository hygiene across documentation, testing, CI, linting, and security. Highlight gaps and existing automation.
3. Synthesize the findings into a prioritized checklist with recommended next steps.

## Output format

- Begin with a concise summary that restates the goal: Audit repository hygiene and suggest improvements.
- Offer prioritized, actionable recommendations with rationale.
- Call out test coverage gaps and validation steps.
- Highlight workflow triggers, failing jobs, and proposed fixes.

## Example input

(none – command runs without arguments)

## Expected output

- Structured report following the specified sections.

