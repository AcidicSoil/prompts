# Refactor Suggestions

Trigger: /refactor-suggestions

Purpose: Propose repo-wide refactoring opportunities after tests exist.

## Steps

1. Map directory structure and large files.
2. Identify duplication, data clumps, and god objects.
3. Suggest phased refactors with safety checks and tests.

## Output format

- Ranked list with owners and effort estimates.

## Stage alignment

- **Phase**: [P8 Post-release Hardening](WORKFLOW.md#p8-post-release-hardening)
- **Gate**: Post-release cleanup — plan high-leverage refactors once Sev-1 issues settle.
- **Previous prompts**: `/fix`
- **Next prompts**: `/file-modularity`, `/dead-code-scan`
