# IaC Bootstrap

**Trigger:** `/iac-bootstrap <aws|gcp|azure|fly|render>`

**Purpose:** Create minimal Infrastructure‑as‑Code for chosen platform plus CI pipeline hooks.

**Steps:**

1. Select tool (Terraform, Pulumi). Initialize backend and state.
2. Define stacks for `preview`, `staging`, `prod`. Add outputs (URLs, connection strings).
3. Add CI jobs: plan on PR, apply on main with manual approval.
4. Document rollback and drift detection.

**Output format:** stack diagram, file list, CI snippets.

**Examples:** `/iac-bootstrap aws`.

**Notes:** Prefer least privilege IAM and remote state with locking.
