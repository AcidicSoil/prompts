# WORKFLOW\.md

## 1) Goal

Ship a production-grade full-stack web app from zero to deployed with audit trails, tests, and rollback. Use Codex slash commands as the execution surface.&#x20;

## 2) Scope

### In

Greenfield repo. Web UI, API, DB, auth, CI/CD, observability, security baseline, docs, release. Full run uses prompts end-to-end.&#x20;

### Out / Won’t do

Vendor lock-in choices, bespoke infra, ML features, mobile clients, data science. No auto-running prompts; all manual per AGENTS baseline.&#x20;

### Ideas for later

Multi-region, blue/green, SSO, feature flags, load testing, A/B infra.

## 3) Roles & Owners

Planner, Full-stack dev, API dev, Frontend dev, QA, DevOps, Security, Docs. One person may hold multiple roles. Owners per phase below.

## 4) Milestones

M1 Plan approved.
M2 Scaffold + CI green.
M3 E2E happy path green.
M4 Staging deployed.
M5 Production release with rollback tested.

## 5) Phases

### P0 Preflight Docs (Blocking)

- **Purpose**: Enforce docs-first policy and record DocFetchReport.&#x20;
- **Inputs**: Empty repo, tool access.
- **Steps**: Run Preflight Latest Docs. Record approved instructions and packs. Stop if status≠OK.&#x20;
- **Gate Criteria**: DocFetchReport.status==OK.
- **Outputs**: DocFetchReport JSON.
- **Risks**: Missing docs.
- **Owners**: Planner.

### P1 Plan & Scope

- **Purpose**: Lock scope and acceptance.
- **Steps**: `/planning-process "<app one-line>"` → draft plan. `/scope-control` → In/Out, Won’t do. `/stack-evaluation` → pick stack.&#x20;
- **Gate**: Scope Gate passed.
- **Outputs**: PLAN.md, scope table.
- **Owners**: Planner.

### P2 App Scaffold & Contracts

- **Purpose**: Create minimal working app.
- **Steps**:

  - `/scaffold-fullstack <stack>` → create repo, packages, app, api, infra stubs. **(new)**
  - `/api-contract` or `/openapi-generate` → draft API spec. **(new)**
  - `/modular-architecture` → boundaries. `/reference-implementation` if copying style.&#x20;
- **Gate**: Test Gate lite = build runs, lint clean.
- **Outputs**: repo tree, OpenAPI/SDL.
- **Owners**: Full-stack dev.

### P3 Data & Auth

- **Purpose**: Persistence and identity.
- **Steps**: `/db-bootstrap <db>` → schema, migrations, seeds. **(new)**
  `/auth-scaffold <oauth|email>` → flows + threat model. **(new)**
  `/migration-plan` → up/down scripts. **(new)**
- **Gate**: Migration dry-run ok. Threat checklist done.
- **Outputs**: migrations, seed script, auth routes.
- **Owners**: API dev, Security.

### P4 Frontend UX

- **Purpose**: Routes and components.
- **Steps**: `/modular-architecture` (UI), `/ui-screenshots` for reviews, `/design-assets` for favicon/brand, `/logging-strategy` client events.&#x20;
- **Gate**: Accessibility checks queued.
- **Outputs**: Screens, states, assets.
- **Owners**: Frontend.

### P5 Quality Gates & Tests

- **Purpose**: E2E-first coverage.
- **Steps**: `/e2e-runner-setup <playwright|cypress>` **(new)** → runner + fixtures.
  `/integration-test` → happy path E2E. `/coverage-guide` → target areas. `/regression-guard` → unrelated drift.&#x20;
- **Gate**: Test Gate = E2E happy path green.
- **Outputs**: E2E suite, coverage plan.
- **Owners**: QA.

### P6 CI/CD & Env

- **Purpose**: Reproducible pipeline and environments.
- **Steps**: `/version-control-guide` → commit rules. `/devops-automation` → CI, DNS, SSL, deploy. `/env-setup` + `/secrets-manager-setup` **(new)**. `/iac-bootstrap` **(new)**.&#x20;
- **Gate**: Review Gate = CI green, approvals, no unrelated churn.
- **Outputs**: CI config, IaC, secret store wiring.
- **Owners**: DevOps.

### P7 Release & Ops

- **Purpose**: Ship safely.
- **Steps**: `/pr-desc`, `/owners`, `/review`, `/review-branch`, `/release-notes`, `/version-proposal`. `/monitoring-setup` + `/slo-setup` **(new)**. `/logging-strategy` server. `/audit` security/hygiene.&#x20;
- **Gate**: Release Gate = canary ok, rollback tested.
- **Outputs**: Release notes, dashboards, runbooks.
- **Owners**: Dev, DevOps, SRE.

### P8 Post-release Hardening

- **Purpose**: Stability and cleanup.
- **Steps**: `/error-analysis`, `/fix`, `/refactor-suggestions`, `/file-modularity`, `/dead-code-scan`, `/cleanup-branches`. `/feature-flags` **(new)**.&#x20;
- **Gate**: All Sev-1 fixed.
- **Outputs**: Clean diff, flags in place.
- **Owners**: Dev.

### P9 Model Tactics (cross-cutting)

- **Purpose**: Optimize prompting/model choice.
- **Steps**: `/model-strengths`, `/model-evaluation`, `/compare-outputs`, `/switch-model`.&#x20;
- **Gate**: Model delta improves QoS.
- **Owners**: Planner.

## 6) Dev Loop Rules

Commit small. One concern per PR. Use clean-room finalize if diff grows. Reset when E2E red for >60m or design drift detected. Enforce branch policy via `/version-control-guide`.&#x20;

## 7) Test Strategy

E2E first. Happy path before edge cases. Regression guards on changed areas and critical paths. Coverage targets: lines 80%, branches 60%, critical modules 90%. Use `/integration-test`, `/coverage-guide`, `/regression-guard`.&#x20;

## 8) CI/CD Plan

Jobs: lint, typecheck, unit, build, e2e, package, deploy. Artifacts: build outputs, test logs, coverage, SBOM. Envs: preview, staging, prod. Rollback: pinned version + IaC plan. Use `/devops-automation` and `/iac-bootstrap`.&#x20;

## 9) Observability & Logging Plan

Structured logs, metrics, traces. Dashboards by domain. Alerts on SLO burn. Client and server logging strategies via `/logging-strategy`.&#x20;

## 10) Risk Register & Mitigations

Scope creep → Scope Gate. Flaky E2E → isolate and retry matrix. Secrets leakage → secrets manager, scans. Infra drift → IaC. Auth gaps → threat model.&#x20;

## 11) Evidence Log

- Command catalog and flows: README table and Mermaid.&#x20;
- Baseline precedence, Preflight, DocFetchReport, gates: AGENTS baseline.&#x20;

## 12) Release Notes Checklist

Scope summary, changes by area, migration steps, breaking changes, version bump, commit range, contributors, links to dashboards. Use `/release-notes` and `/version-proposal`.&#x20;

---

### Missing prompts needed

- `/scaffold-fullstack` — generate repo, workspace, app, api, tests, CI seeds.
- `/api-contract` — author initial OpenAPI/GraphQL contract from requirements.
- `/openapi-generate` — codegen server and client from OpenAPI.
- `/db-bootstrap` — pick DB, init migrations, local compose, seed scripts.
- `/migration-plan` — write up/down plans with safety checks.
- `/auth-scaffold` — OAuth/OIDC/email templates, routes, threat model.
- `/e2e-runner-setup` — Playwright/Cypress config, fixtures, data sandbox.
- `/env-setup` — `.env.example`, schema validation, per-env overrides.
- `/secrets-manager-setup` — provision secret store, map app vars.
- `/iac-bootstrap` — minimal IaC for chosen cloud, state, pipelines.
- `/monitoring-setup` — logs/metrics/traces bootstrap.
- `/slo-setup` — SLOs, alerts, dashboards.
- `/feature-flags` — flag provider, SDK wiring, guardrails.
  These integrate with existing commands and respect AGENTS gating.

---

# workflow\.mmd

```mermaid
flowchart TD
  A[Preflight Docs (§A) AGENTS] -->|DocFetchReport OK| B[/planning-process/]
  B --> C[/scope-control/]
  C --> D[/stack-evaluation/]
  D --> E[/scaffold-fullstack/]
  E --> F[/api-contract/]
  F --> G[/openapi-generate/]
  G --> H[/modular-architecture/]
  H --> I[/db-bootstrap/]
  I --> J[/migration-plan/]
  J --> K[/auth-scaffold/]
  K --> L[/e2e-runner-setup/]
  L --> M[/integration-test/]
  M --> N[/coverage-guide/]
  N --> O[/regression-guard/]
  O --> P[/version-control-guide/]
  P --> Q[/devops-automation/]
  Q --> R[/env-setup/]
  R --> S[/secrets-manager-setup/]
  S --> T[/iac-bootstrap/]
  T --> U[/owners/]
  U --> V[/review/]
  V --> W[/review-branch/]
  W --> X[/pr-desc/]
  X --> Y{Gates}
  Y -->|Scope Gate pass| Z1[proceed]
  Y -->|Test Gate pass| Z2[proceed]
  Y -->|Review Gate pass| Z3[proceed]
  Z3 --> AA[/release-notes/]
  AA --> AB[/version-proposal/]
  AB --> AC{Release Gate}
  AC -->|pass| AD[Deploy Staging]
  AD --> AE[Canary + Health]
  AE -->|ok| AF[Deploy Prod]
  AE -->|fail| AR[Rollback]
  AF --> AG[/monitoring-setup/]
  AG --> AH[/slo-setup/]
  AH --> AI[/logging-strategy/]
  AI --> AJ[/error-analysis/]
  AJ --> AK[/fix/]
  AK --> AL[/refactor-suggestions/]
  AL --> AM[/file-modularity/]
  AM --> AN[/dead-code-scan/]
  AN --> AO[/cleanup-branches/]
  AF --> AP[/feature-flags/]
  AF --> AQ[/model-strengths/]
  AQ --> AR2[/model-evaluation/]
  AR2 --> AS[/compare-outputs/]
  AS --> AT[/switch-model/]
```

---

# Nodes & Edges list

**Nodes**: Preflight, planning-process, scope-control, stack-evaluation, scaffold-fullstack, api-contract, openapi-generate, modular-architecture, db-bootstrap, migration-plan, auth-scaffold, e2e-runner-setup, integration-test, coverage-guide, regression-guard, version-control-guide, devops-automation, env-setup, secrets-manager-setup, iac-bootstrap, owners, review, review-branch, pr-desc, Gates, release-notes, version-proposal, Deploy Staging, Canary + Health, Deploy Prod, Rollback, monitoring-setup, slo-setup, logging-strategy, error-analysis, fix, refactor-suggestions, file-modularity, dead-code-scan, cleanup-branches, feature-flags, model-strengths, model-evaluation, compare-outputs, switch-model.
**Edges**: Preflight→planning-process→scope-control→stack-evaluation→scaffold-fullstack→api-contract→openapi-generate→modular-architecture→db-bootstrap→migration-plan→auth-scaffold→e2e-runner-setup→integration-test→coverage-guide→regression-guard→version-control-guide→devops-automation→env-setup→secrets-manager-setup→iac-bootstrap→owners→review→review-branch→pr-desc→Gates→release-notes→version-proposal→Deploy Staging→Canary + Health→Deploy Prod→monitoring-setup→slo-setup→logging-strategy→error-analysis→fix→refactor-suggestions→file-modularity→dead-code-scan→cleanup-branches and Deploy Prod→feature-flags and model-strengths→model-evaluation→compare-outputs→switch-model; Canary + Health→Rollback on fail.

---

# Gate checklists

## Scope Gate

- Problem, users, Done criteria defined.
- In/Out lists and Won’t do recorded.
- Stack chosen and risks listed.
  Evidence: `/planning-process`, `/scope-control`, `/stack-evaluation`.&#x20;

## Test Gate

- E2E happy path green locally and in CI.
- No unrelated file churn.
- Regression guards added for changed modules.
  Evidence: `/integration-test`, `/regression-guard`.&#x20;

## Review Gate

- Clean diff per `/version-control-guide`.
- PR reviewed via `/review` and `/review-branch`.
- Owners assigned and approvals met.&#x20;

## Release Gate

- Staging deploy passes checks.
- Canary health metrics stable.
- Rollback rehearsed and documented.
  Evidence: `/devops-automation`, IaC, monitoring setup.&#x20;

---

# Reset Playbook

**When**: E2E red >60m, diff noisy, plan drift, large rebase pain, conflicting designs.
**Command path**: `/reset-strategy` → propose clean slice. Create new branch from main, cherry-pick minimal commits, re-run Gate sequence.&#x20;
**Data-loss warning**: Uncommitted local changes will be dropped if hard reset. Stash before reset.

---

# Model Eval Block

**When**: Contentious generation, flaky refactors, new model availability.
**Steps**: `/model-strengths` → route candidates. `/model-evaluation` → baseline vs new. `/compare-outputs` → pick best. `/switch-model` → roll change with guardrails. Success = higher test pass rate or smaller diff with same tests.&#x20;

---

**Notes**

- Baseline precedence and Preflight come from AGENTS baseline. Prompts are manual. No auto-invoke.&#x20;
- Command catalog and many building blocks exist already; this plan wires them into a complete “from scratch” path and lists required new prompts.&#x20;
