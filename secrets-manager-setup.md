---
phase: "P6 CI/CD & Env"
gate: "Review Gate"
status: "secret paths mapped and least-privilege policies drafted."
previous:
  - "/env-setup"
next:
  - "/iac-bootstrap"
  - "/owners"
---

# Secrets Manager Setup

**Trigger:** `/secrets-manager-setup <provider>`

**Purpose:** Provision secret store and map app variables to it.

**Steps:**

1. Choose provider: 1Password, Doppler, AWS Secrets Manager, GCP Secret Manager, Vault.
2. Define secret names and scopes. Generate read paths for web and api.
3. Add dev bootstrap instructions and CI access policy docs.

**Output format:** mapping table `ENV_VAR → provider path` and bootstrap steps.

**Examples:** `/secrets-manager-setup doppler`.

**Notes:** Never echo secret values. Include rotation policy.

