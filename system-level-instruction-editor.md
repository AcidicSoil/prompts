---
phase: "P0 Preflight Docs"
gate: "DocFetchReport"
status: "Canonical instruction editor guardrail prepared for use."
owner: "Prompts Team"
date: "2024-09-01"
previous:
  - "/instruction-file"
next:
  - "/planning-process"
  - "/scope-control"
tags:
  - "documentation"
  - "preflight"
---

# System Instruction: Canonical Instruction File Editor

Trigger: /system-instruction-editor

Purpose: Publish the canonical system instruction guardrail before work begins.

## Inputs

- Latest DocFetchReport summary and approvals.
- Existing instruction artifacts (`cursor.rules`, `windsurf.rules`, `claude.md`).
- Safety, legal, or policy updates provided by stakeholders.
- Outstanding TODOs or follow-ups from prior instruction reviews.
- Version control diffs for instruction-related files.

## Steps

1. Gather the current instruction artifacts and diff them against the repo baseline.
2. Capture required additions/removals from DocFetchReport or stakeholder feedback.
3. Update the canonical instruction file, keeping sections organized and annotated.
4. Flag any sections needing follow-up review or approvals.
5. Commit the updated instruction file and notify owners of changes.
