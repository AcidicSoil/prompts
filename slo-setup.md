---
phase: "P7 Release & Ops"
gate: "Release Gate"
status: "SLOs and alerts reviewed before production rollout."
previous:
  - "/monitoring-setup"
next:
  - "/logging-strategy"
  - "/audit"
---

# SLO Setup

Trigger: /slo-setup

Purpose: Define Service Level Objectives, burn alerts, and runbooks.

**Steps:**

1. Choose SLI/metrics per user journey. Define SLO targets and error budgets.
2. Create burn alerts (fast/slow) and link to runbooks.
3. Add `SLO.md` with rationale and review cadence.

**Output format:** SLO table and alert rules snippet.

**Examples:** `/slo-setup`.

**Notes:** Tie SLOs to deploy gates and incident severity.

