# Model Strengths

Trigger: /model-strengths

Purpose: Choose model per task type.

## Steps

1. Classify task: UI, API, data, testing, docs, refactor.
2. Map historical success by model.
3. Recommend routing rules and temperatures.

## Output format

- Routing guide with examples.

## Stage alignment

- **Phase**: [P9 Model Tactics](WORKFLOW.md#p9-model-tactics-cross-cutting)
- **Gate**: Model uplift — capture baseline routing before experimentation.
- **Previous prompts**: `/feature-flags` (optional) or stage-specific blockers.
- **Next prompts**: `/model-evaluation`, `/compare-outputs`
