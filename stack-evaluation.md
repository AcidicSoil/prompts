# Stack Evaluation

Trigger: /stack-evaluation

Purpose: Evaluate language/framework choices relative to AI familiarity and repo goals.

## Steps

1. Detect current stack and conventions.
2. List tradeoffs: maturity, tooling, available examples, hiring, and AI training coverage.
3. Recommend stay-or-switch with migration outline if switching.

## Output format

- Decision memo with pros/cons and next steps.

## Stage alignment

- **Phase**: [P1 Plan & Scope](WORKFLOW.md#p1-plan--scope)
- **Gate**: Scope Gate — record recommended stack and top risks before building.
- **Previous prompts**: `/scope-control`
- **Next prompts**: `/scaffold-fullstack`, `/api-contract`
