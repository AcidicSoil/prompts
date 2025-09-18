# Model Evaluation

Trigger: /model-evaluation

Purpose: Try a new model and compare outputs against a baseline.

## Steps

1. Define a benchmark set from recent tasks.
2. Run candidates and collect outputs and metrics.
3. Analyze failures and summarize where each model excels.

## Output format

- Summary table and recommendations to adopt or not.

## Stage alignment

- **Phase**: [P9 Model Tactics](WORKFLOW.md#p9-model-tactics-cross-cutting)
- **Gate**: Model uplift — experiments must beat baseline quality metrics.
- **Previous prompts**: `/model-strengths`
- **Next prompts**: `/compare-outputs`, `/switch-model`
