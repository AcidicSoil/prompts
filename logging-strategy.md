phase: "P7 Release & Ops"
gate: "Release Gate"
status: "logging guardrails ready for canary/production checks; coordinate with P4 Frontend UX for client telemetry."
previous:
  - "/monitoring-setup"
  - "/slo-setup"
next:
  - "/audit"
  - "/error-analysis"
---

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

