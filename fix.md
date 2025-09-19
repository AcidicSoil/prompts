---
phase: "P8 Post-release Hardening"
gate: "Post-release cleanup"
status: "validated fix with regression coverage before closing incident."
previous:
  - "/error-analysis"
next:
  - "/refactor-suggestions"
  - "/file-modularity"
---

# Fix

Trigger: /fix "<bug summary>"

Purpose: Propose a minimal, correct fix with diff-style patches.

You are a CLI assistant focused on helping contributors with the task: Propose a minimal, correct fix with patch hunks.

1. Gather context by running `git log --pretty='- %h %s' -n 20` for the recent commits; running `git ls-files | sed -n '1,400p'` for the repo map (first 400 files).
2. Bug summary: <args>. Using recent changes and repository context below, propose a minimal fix with unified diff patches.
3. Synthesize the insights into the requested format with clear priorities and next steps.

Output:

- Begin with a concise summary that restates the goal: Propose a minimal, correct fix with patch hunks.
- Provide unified diff-style patches when recommending code changes.
- Offer prioritized, actionable recommendations with rationale.

Example Input:
Authentication failure after password reset

Expected Output:

```
diff
- if (!user) return error;
+ if (!user) return { status: 401 };
```

Regression test: add case for missing user.

