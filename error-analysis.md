# Error Analysis

Trigger: /error-analysis

Purpose: Analyze error logs and enumerate likely root causes with fixes.

## Steps

1. Collect last test logs or application stack traces if present.
2. Cluster errors by symptom. For each cluster list 2–3 plausible causes.
3. Propose instrumentation or inputs to disambiguate.
4. Provide minimal patch suggestions and validation steps.

## Output format

- Table: error → likely causes → next checks → candidate fix.

## Examples

- "TypeError: x is not a function" → wrong import, circular dep, stale build.

## Stage alignment

- **Phase**: [P8 Post-release Hardening](WORKFLOW.md#p8-post-release-hardening)
- **Gate**: Post-release cleanup — Sev-1 incidents triaged with fixes scheduled.
- **Previous prompts**: `/logging-strategy`, `/audit`
- **Next prompts**: `/fix`, `/refactor-suggestions`
