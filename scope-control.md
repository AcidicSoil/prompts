---
phase: "P1 Plan & Scope"
gate: "Scope Gate"
status: "Done criteria, scope lists, and stack choices are committed."
previous:
  - "/planning-process"
next:
  - "/stack-evaluation"
  - "/scaffold-fullstack"
---

# Scope Control

Trigger: /scope-control

Purpose: Enforce explicit scope boundaries and maintain "won't do" and "ideas for later" lists.

## Steps

1. Parse `PLAN.md` or create it if absent.
2. For each open task, confirm linkage to the current milestone.
3. Detect off-scope items and move them to **Won't do** or **Ideas for later** with rationale.
4. Add a "Scope Gate" checklist before merging.

## Output format

- Patch to `PLAN.md` showing changes in sections and checklists.

## Examples
Input: off-scope request "Add email templates" during OAuth feature.
Output: Move to **Ideas for later** with reason "Not needed for OAuth MVP".

## Notes

- Never add new scope without recording tradeoffs.

