# Migration Plan

**Trigger:** `/migration-plan "<change summary>"`

**Purpose:** Produce safe up/down migration steps with checks and rollback notes.

**Steps:**

1. Describe current vs target schema, include data volume and lock risk.
2. Plan: deploy empty columns, backfill, dual-write, cutover, cleanup.
3. Provide SQL snippets and PR checklist. Add `can_rollback: true|false` flag.

**Output format:** `Plan`, `SQL`, `Rollback`, `Checks` sections.

**Examples:** `/migration-plan "orders add status enum"`.

**Notes:** Include online migration strategies for large tables.

## Stage alignment

- **Phase**: [P3 Data & Auth](WORKFLOW.md#p3-data--auth)
- **Gate**: Migration dry-run — validated rollback steps and safety checks documented.
- **Previous prompts**: `/db-bootstrap`
- **Next prompts**: `/auth-scaffold`, `/e2e-runner-setup`
