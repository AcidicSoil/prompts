# From‑Scratch Workflow — New Commands

This set adds the missing slash commands required by `fromScratch-Workflow.md`.

| Command | File | Summary |
|---|---|---|
| /scaffold-fullstack | scaffold-fullstack.md | Monorepo scaffold with app, API, tests, CI seeds. |
| /api-contract | api-contract.md | Draft OpenAPI/GraphQL contracts with examples. |
| /openapi-generate | openapi-generate.md | Generate server stubs or typed clients from OpenAPI. |
| /db-bootstrap | db-bootstrap.md | Initialize DB, migrations, compose, and seeds. |
| /migration-plan | migration-plan.md | Safe up/down plan with rollback notes. |
| /auth-scaffold | auth-scaffold.md | Auth routes, storage, and threat model. |
| /e2e-runner-setup | e2e-runner-setup.md | Configure Playwright/Cypress with fixtures and CI. |
| /env-setup | env-setup.md | `.env.example`, schema validation, env precedence. |
| /secrets-manager-setup | secrets-manager-setup.md | Map ENV vars to secrets manager paths. |
| /iac-bootstrap | iac-bootstrap.md | Minimal IaC plus CI plan/apply. |
| /monitoring-setup | monitoring-setup.md | Logs, metrics, traces with default dashboards. |
| /slo-setup | slo-setup.md | Define SLOs, burn alerts, runbooks. |
| /feature-flags | feature-flags.md | Provider integration and guardrails. |

**Usage:** Place these files in `~/.codex/prompts/`. Invoke with their `Trigger:` slash commands inside Codex.
