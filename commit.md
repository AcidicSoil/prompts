---
phase: "P6 CI/CD & Env"
gate: "Review Gate"
status: "clean diff, CI green, and approvals ready."
previous:
  - "/version-control-guide"
next:
  - "/devops-automation"
  - "/env-setup"
---

# Commit Message Assistant

Trigger: `commit`

Purpose: Generate a conventional, review-ready commit message from the currently staged changes.

Output: A finalized commit message with a 50–72 character imperative subject line, optional scope, and supporting body lines describing the rationale, evidence, and tests.

## Steps

1. Verify there is staged work with `git status --short` and stop with guidance if nothing is staged.
2. Inspect the staged diff with `git diff --staged` and identify the primary change type (feat, fix, chore, docs, refactor, etc.) and optional scope (e.g., package or module).
3. Draft a concise subject line in the form `<type>(<scope>): <imperative summary>` or `<type>: <imperative summary>` when no scope applies. Keep the line under 73 characters.
4. Capture essential details in the body as wrapped bullet points or paragraphs: what changed, why it was necessary, and any follow-up actions.
5. Document validation in a trailing section (e.g., `Tests:`) noting commands executed or why tests were skipped.

## Example Output

```
fix(auth): prevent session expiration loop

- guard refresh flow against repeated 401 responses
- add regression coverage for expired refresh tokens

Tests: npm test -- auth/session.test.ts
```
