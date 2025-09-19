# Codex Prompts — Vibe Coding Additions

This pack extends the default Codex CLI prompts with vibe-coding playbooks inspired by YC cadences. Drop the folder into `~/.codex/prompts` and you get a catalog of opinionated helpers covering planning, scope control, testing, audits, and model orchestration.

## Installation

1. Clone or copy this repository into `~/.codex/prompts`. The CLI hot-reloads changes, but restarting Codex guarantees the new commands are registered.
2. Optionally commit the directory into your dotfiles so the prompts travel with your workstation setup.

## Contributor workflow

Run these commands whenever you add or edit prompts so the generated catalog stays in sync:

1. `npm install` — install the TypeScript tooling used by the validation scripts.
2. `npm run validate:metadata` — confirm every prompt’s front matter matches the lifecycle workflow.
3. `npm run build:catalog` — regenerate `catalog.json` and refresh the README tables.

`npm run build:catalog` must run after each prompt change; it keeps our published metadata accurate for the upcoming [MCP roadmap](#future-enhancements) work on tool exposure and state tracking. The pre-commit hook and CI guard execute these checks and will fail when `catalog.json` or the README tables are stale, so expect local or remote failures if the command is skipped.

## Using these prompts

- **Direct slash commands**: Invoke the files that declare a `Trigger:` (table below) straight from Codex. Example: `/planning-process Add OAuth login` opens `planning-process.md` and walks through the feature plan template.
- **Gemini mapper prompt**: `/gemini-map` is a single translator prompt (`gemini-map.md`) that converts Gemini CLI TOML commands into Codex prompt files. Use it only when migrating Gemini content; all other prompts run directly with their own slash commands.

## Prompt metadata

Every lifecycle prompt starts with YAML front matter so docs and tooling stay in sync:

```yaml
---
phase: "P5 Quality Gates & Tests"
gate: "Test Gate"
status: "Runner green locally and wired into CI before expanding coverage."
previous:
  - "/auth-scaffold"
  - "/ui-screenshots"
next:
  - "/integration-test"
  - "/coverage-guide"
---
```

- `phase` — primary stage(s) from [WORKFLOW.md](WORKFLOW.md). Use a string for a single phase or a YAML list for cross-phase helpers.
- `gate` — named gate or checkpoint the prompt supports.
- `status` — the success criteria required to pass that gate.
- `previous` — prerequisite prompts or setup tasks.
- `next` — recommended follow-up prompts once the gate clears.

Maintainers and the metadata validator rely on this block to keep the stage catalog coherent.

## Core slash commands

Commands are grouped by development phase. Stage headings link back to
[WORKFLOW.md](WORKFLOW.md) for owners, gates, and evidence expectations.

### [P0 Preflight Docs](WORKFLOW.md#p0-preflight-docs-blocking) — DocFetchReport must be **OK**

| Command | What it does |
| --- | --- |
| /instruction-file | Generate or update `cursor.rules`, `windsurf.rules`, or `claude.md` so DocFetchReport captures current guardrails. |

### [P1 Plan & Scope](WORKFLOW.md#p1-plan--scope) — pass the [Scope Gate](WORKFLOW.md#scope-gate)

| Command | What it does |
| --- | --- |
| /planning-process | Draft, refine, and execute a feature plan with strict scope control. |
| /scope-control | Enforce explicit scope boundaries plus “won’t do” and “ideas for later” lists. |
| /stack-evaluation | Evaluate language/framework choices relative to AI familiarity and roadmap goals. |

### [P2 App Scaffold & Contracts](WORKFLOW.md#p2-app-scaffold--contracts) — clear Test Gate lite

| Command | What it does |
| --- | --- |
| /scaffold-fullstack | Create a minimal full-stack workspace with CI seeds. |
| /api-contract | Author an initial OpenAPI/GraphQL contract from requirements. |
| /openapi-generate | Generate server stubs or typed clients from an OpenAPI spec. |
| /modular-architecture | Enforce module boundaries; revisit during P4 for UI seams. |
| /reference-implementation | Mimic the style and API of a known working example. |
| /api-docs-local | Fetch API docs and store locally for deterministic reference. |

### [P3 Data & Auth](WORKFLOW.md#p3-data--auth) — migrations must dry-run cleanly

| Command | What it does |
| --- | --- |
| /db-bootstrap | Pick a database, initialize migrations, and seed scripts. |
| /migration-plan | Produce safe up/down migration steps with rollback notes. |
| /auth-scaffold | Scaffold auth flows, threat model, and secure session storage. |

### [P4 Frontend UX](WORKFLOW.md#p4-frontend-ux) — queue accessibility checks

| Command | What it does |
| --- | --- |
| /design-assets | Generate favicons and lightweight visual assets from your product brand. |
| /ui-screenshots | Analyze screenshots for UI bugs or inspiration and propose actionable fixes. |

### [P5 Quality Gates & Tests](WORKFLOW.md#p5-quality-gates--tests) — meet the [Test Gate](WORKFLOW.md#test-gate)

| Command | What it does |
| --- | --- |
| /e2e-runner-setup | Configure Playwright/Cypress with fixtures and CI jobs. |
| /integration-test | Generate end-to-end tests that simulate real user flows. |
| /coverage-guide | Suggest a plan to raise coverage based on uncovered areas. |
| /regression-guard | Detect unrelated changes and add tests to prevent regressions. |

### [P6 CI/CD & Env](WORKFLOW.md#p6-cicd--env) — satisfy the [Review Gate](WORKFLOW.md#review-gate)

| Command | What it does |
| --- | --- |
| /version-control-guide | Enforce clean incremental commits and clean-room re-implementation before merge. |
| /devops-automation | Configure servers, DNS, SSL, and CI/CD with pragmatic defaults. |
| /env-setup | Create `.env.example`, runtime validation, and per-environment overrides. |
| /secrets-manager-setup | Provision a secret store and map application variables. |
| /iac-bootstrap | Create minimal IaC stacks with plan/apply pipelines. |

### [P7 Release & Ops](WORKFLOW.md#p7-release--ops) — clear the [Release Gate](WORKFLOW.md#release-gate)

| Command | What it does |
| --- | --- |
| /owners | Suggest owners and reviewers for a path using CODEOWNERS and history. |
| /review | Review code matching a pattern and provide actionable feedback. |
| /review-branch | Provide a high-level review of the branch compared to `origin/main`. |
| /pr-desc | Draft a PR description from the branch diff. |
| /release-notes | Convert recent commits into human-readable release notes. |
| /version-proposal | Propose the next semantic version based on commit history. |
| /monitoring-setup | Bootstrap logs, metrics, and traces with dashboards per domain. |
| /slo-setup | Define SLOs, burn alerts, and supporting runbooks. |
| /logging-strategy | Add or remove diagnostic logging with structured levels and privacy considerations. |

### [P8 Post-release Hardening](WORKFLOW.md#p8-post-release-hardening) — resolve Sev-1 issues

| Command | What it does |
| --- | --- |
| /error-analysis | Analyze error logs and enumerate likely root causes with fixes. |
| /fix | Propose a minimal, correct fix with patch hunks. |
| /refactor-suggestions | Propose repo-wide refactoring opportunities once tests exist. |
| /file-modularity | Enforce smaller files and propose safe splits for giant files. |
| /dead-code-scan | Flag likely dead files and exports using static signals. |
| /cleanup-branches | Recommend local branches that are merged or stale and safe to delete. |
| /feature-flags | Integrate a flag provider, wire SDK, and enforce guardrails. |

### [P9 Model Tactics](WORKFLOW.md#p9-model-tactics-cross-cutting) — document uplift before switching defaults

| Command | What it does |
| --- | --- |
| /model-strengths | Route work by model strengths for faster delegation. |
| /model-evaluation | Try a new model and compare outputs against a baseline. |
| /compare-outputs | Run multiple models or tools on the same prompt and summarize the best output. |
| /switch-model | Decide when to try a different AI backend and how to compare. |

### [Reset Playbook](WORKFLOW.md#reset-playbook) and other cross-cutting helpers

| Command | Stage tie-in | What it does |
| --- | --- | --- |
| /reset-strategy | Reset path | Decide when to hard reset and start clean to avoid layered bad diffs. |
| /prototype-feature | P1–P2 sandbox | Spin up a standalone prototype before merging into main. |
| /content-generation | Support | Draft docs, blog posts, or marketing copy aligned with the codebase. |
| /explain-code | Support | Provide line-by-line explanations for a given file or diff. |
| /voice-input | Support | Convert speech to structured prompts for Codex. |

## Reference assets

- `workflow.mmd` — Mermaid source for the end-to-end workflow shown below.
- `codefetch/codebase.md` — Quick peek of local config snippets used by the prompts (e.g., markdownlint defaults).

## Example flow

1. `/planning-process Add OAuth login` to align on goals, risks, and validation.
2. Implement the scoped tasks, checking `/scope-control` to document non-goals and later ideas.
3. `/integration-test` to add coverage for the new flow, then `/regression-guard` to verify no unrelated files drifted.
4. `/version-control-guide` to clean the final diff, followed by `/pr-desc` or `/release-notes` to communicate the change.

## Mermaid flowchart

```mermaid
flowchart TD
  subgraph P0["P0 Preflight Docs"]
    preflight["Preflight Docs (§A) AGENTS"]
  end

  subgraph P1["P1 Plan & Scope"]
    plan[/planning-process/]
    scope[/scope-control/]
    stack[/stack-evaluation/]
  end

  subgraph P2["P2 App Scaffold & Contracts"]
    scaffold[/scaffold-fullstack/]
    api_contract[/api-contract/]
    openapi[/openapi-generate/]
    modular[/modular-architecture/]
  end

  subgraph P3["P3 Data & Auth"]
    db[/db-bootstrap/]
    migrate[/migration-plan/]
    auth[/auth-scaffold/]
  end

  subgraph P4["P4 Frontend UX"]
    assets[/design-assets/]
    screenshots[/ui-screenshots/]
  end

  subgraph P5["P5 Quality Gates & Tests"]
    e2e[/e2e-runner-setup/]
    integration[/integration-test/]
    coverage[/coverage-guide/]
    regression[/regression-guard/]
  end

  subgraph P6["P6 CI/CD & Env"]
    vcs[/version-control-guide/]
    devops[/devops-automation/]
    env[/env-setup/]
    secrets[/secrets-manager-setup/]
    iac[/iac-bootstrap/]
  end

  subgraph P7["P7 Release & Ops"]
    owners[/owners/]
    review[/review/]
    review_branch[/review-branch/]
    pr_desc[/pr-desc/]
    release_notes[/release-notes/]
    version[/version-proposal/]
    monitoring[/monitoring-setup/]
    slo[/slo-setup/]
    logging[/logging-strategy/]
  end

  subgraph Deploy["Deployment Flow"]
    deploy_staging[Deploy Staging]
    canary[Canary + Health]
    deploy_prod[Deploy Prod]
    rollback[Rollback]
  end

  subgraph P8["P8 Post-release Hardening"]
    error[/error-analysis/]
    fix[/fix/]
    refactor[/refactor-suggestions/]
    modularity[/file-modularity/]
    deadcode[/dead-code-scan/]
    cleanup[/cleanup-branches/]
    flags[/feature-flags/]
  end

  subgraph P9["P9 Model Tactics"]
    strengths[/model-strengths/]
    evaluation[/model-evaluation/]
    compare[/compare-outputs/]
    switch[/switch-model/]
  end

  scope_gate{Scope Gate}
  test_gate_lite{Test Gate lite}
  ux_gate{Accessibility checks queued}
  test_gate{Test Gate}
  review_gate{Review Gate}
  release_gate{Release Gate}
  hardening_gate{Sev-1 resolved}

  preflight --> plan
  plan --> scope --> stack --> scope_gate
  scope_gate --> scaffold
  scaffold --> api_contract --> openapi --> modular --> test_gate_lite
  test_gate_lite --> db
  db --> migrate --> auth --> assets --> screenshots --> ux_gate
  ux_gate --> e2e --> integration --> coverage --> regression --> test_gate
  test_gate --> vcs --> devops --> env --> secrets --> iac --> review_gate
  review_gate --> owners --> review --> review_branch --> pr_desc --> release_notes --> version --> release_gate
  release_gate --> deploy_staging --> canary --> deploy_prod
  canary --> rollback
  deploy_prod --> monitoring --> slo --> logging --> hardening_gate
  deploy_prod --> error
  error --> fix --> refactor --> modularity --> deadcode --> cleanup --> flags --> hardening_gate
  deploy_prod --> flags
  deploy_prod --> strengths
  strengths --> evaluation --> compare --> switch
  flags --> strengths
```

## Future enhancements

We plan to evolve this prompt pack into a full MCP server so teams can integrate Codex-native workflows through a single machine-coordination endpoint. Detailed architectural and rollout plans are forthcoming, but anticipated capabilities include:

- Hosting the current prompt catalog as callable MCP tools with typed inputs and outputs.
- Surfacing DocFetch and gating status signals as first-class MCP events.
- Enabling external automation to trigger prompt flows programmatically while preserving safety gates.
