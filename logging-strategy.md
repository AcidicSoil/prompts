# Logging Strategy

Trigger: /logging-strategy

Purpose: Add or remove diagnostic logging cleanly with levels and privacy in mind.

## Steps

1. Identify hotspots from recent failures.
2. Insert structured logs with contexts and correlation IDs.
3. Remove noisy or PII-leaking logs.
4. Document log levels and sampling in `OBSERVABILITY.md`.

## Output format

- Diff hunks and a short guideline section.

## Stage alignment

- **Phase**: [P7 Release & Ops](WORKFLOW.md#p7-release--ops);
  coordinate with [P4 Frontend UX](WORKFLOW.md#p4-frontend-ux) for client telemetry.
- **Gate**: Release Gate — logging guardrails ready for canary/production checks.
- **Previous prompts**: `/monitoring-setup`, `/slo-setup`
- **Next prompts**: `/audit`, `/error-analysis`
