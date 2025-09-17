# Reset Strategy

Trigger: /reset-strategy

Purpose: Decide when to hard reset and start clean to avoid layered bad diffs.

## Steps

1. Run: `git status -sb` and `git diff --stat` to assess churn.
2. If many unrelated edits or failing builds, propose: `git reset --hard HEAD` to discard working tree.
3. Save any valuable snippets to `scratch/` before reset.
4. Re-implement the minimal correct fix from a clean state.

## Output format

- A short decision note and exact commands. Never execute resets automatically.

## Examples

- Recommend reset after repeated failing refactors touching 15+ files.

## Notes

- Warn about destructive nature. Require user confirmation.
