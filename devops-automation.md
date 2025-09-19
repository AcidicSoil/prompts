---
phase: "P6 CI/CD & Env"
gate: "Review Gate"
status: "CI pipeline codified, rollback steps rehearsed."
previous:
  - "/version-control-guide"
next:
  - "/env-setup"
  - "/secrets-manager-setup"
  - "/iac-bootstrap"
---

# DevOps Automation

Trigger: /devops-automation

Purpose: Configure servers, DNS, SSL, CI/CD at a pragmatic level.

## Steps

1. Inspect repo for IaC or deploy scripts.
2. Generate Terraform or Docker Compose templates if missing.
3. Propose CI workflows for tests, builds, and deploys.
4. Provide runbooks for rollback.

## Output format

- Infra plan with checkpoints and secrets placeholders.

