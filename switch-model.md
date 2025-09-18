# Switch Model

Trigger: /switch-model

Purpose: Decide when to try a different AI backend and how to compare.

## Steps

1. Define task type: frontend codegen, backend reasoning, test writing, refactor.
2. Select candidate models and temperature/tooling options.
3. Run a fixed input suite and measure latency, compile success, and edits needed.
4. Recommend a model per task with rationale.

## Output format

- Table: task → model → settings → win reason.

## Stage alignment

- **Phase**: [P9 Model Tactics](WORKFLOW.md#p9-model-tactics-cross-cutting)
- **Gate**: Model uplift — document rollback/guardrails before flipping defaults.
- **Previous prompts**: `/compare-outputs`
- **Next prompts**: Return to the blocked stage (e.g., `/integration-test`) to apply learnings.
