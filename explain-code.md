# Explain Code

Trigger: /explain-code

Purpose: Provide line-by-line explanations for a given file or diff.

## Steps

1. Accept a file path or apply to staged diff.
2. Explain blocks with comments on purpose, inputs, outputs, and caveats.
3. Highlight risky assumptions and complexity hot spots.

## Output format

- Annotated markdown with code fences and callouts.

## Stage alignment

- **Phase**: Support — reinforce reviews noted in
  [P7 Release & Ops](WORKFLOW.md#p7-release--ops)
- **Gate**: Improve reviewer comprehension before approvals.
- **Previous prompts**: `/owners`, `/review`
- **Next prompts**: `/review-branch`, `/pr-desc`
