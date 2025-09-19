---
phase: "P6 CI/CD & Env"
gate: "Review Gate"
status: "IaC applied in staging with drift detection configured."
previous:
  - "/secrets-manager-setup"
next:
  - "/owners"
  - "/review"
---

# IaC Bootstrap

Trigger: /iac-bootstrap <aws|gcp|azure|fly|render>

Purpose: Create minimal Infrastructure-as-Code for the chosen platform plus CI hooks.

**Steps:**

1. Select tool (Terraform, Pulumi). Initialize backend and state.
2. Define stacks for `preview`, `staging`, `prod`. Add outputs (URLs, connection strings).
3. Add CI jobs: plan on PR, apply on main with manual approval.
4. Document rollback and drift detection.

**Output format:** stack diagram, file list, CI snippets.

**Examples:** `/iac-bootstrap aws`.

**Notes:** Prefer least privilege IAM and remote state with locking.

