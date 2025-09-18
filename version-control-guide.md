# Version Control Guide

Trigger: /version-control-guide

Purpose: Enforce clean incremental commits and clean-room re-implementation when finalizing.

## Steps

1. Start each feature from a clean branch: `git switch -c <feat>`.
2. Commit in vertical slices with passing tests: `git add -p && git commit`.
3. When solution is proven, recreate a minimal clean diff: stash or copy results, reset, then apply only the final changes.
4. Use `git revert` for bad commits instead of force-pushing shared branches.

## Output format

- Checklist plus suggested commands for the current repo state.

## Examples

- Convert messy spike into three commits: setup, feature, tests.

## Notes

- Never modify remote branches without confirmation.

## Stage alignment

- **Phase**: [P6 CI/CD & Env](WORKFLOW.md#p6-cicd--env)
- **Gate**: Review Gate — clean diff, CI green, and approvals ready.
- **Previous prompts**: `/regression-guard`
- **Next prompts**: `/devops-automation`, `/env-setup`
