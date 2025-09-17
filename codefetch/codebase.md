.markdownlint-cli2.jsonc
```
1 | {
2 |   // Ignore patterns for markdownlint-cli2
3 |   "ignores": ["node_modules/**", "dist/**", "build/**"],
4 | 
5 |   // You can also include rule configuration here
6 |   "config": {
7 |     "default": true,
8 |     "MD013": false // Disable line length rule
9 |   }
10 | }
```

.markdownlint.json
```
1 | {
2 |   "default": true,
3 | 
4 |   "MD003": { "style": "atx" },
5 |   "MD004": { "style": "dash" },
6 |   "MD007": { "indent": 2 },
7 |   "MD012": false,
8 |   "MD013": false,
9 |   "MD022": false,
10 |   "MD024": false,
11 |   "MD026": { "punctuation": ".,;:!?" },
12 |   "MD033": false,
13 |   "MD034": false,
14 |   "MD036": false,
15 |   "MD041": false,
16 |   "MD040": false,
17 |   "MD051": false,
18 |   "MD046": { "style": "fenced" },
19 |   "MD048": { "style": "backtick" }
20 | }
```

AGENTS.md
```
1 | # Repository Guidelines
2 | 
3 | ## Project Structure & Module Organization
4 | All contributor-facing prompts live at the repository root as `.md` files. Files that declare a `Trigger:` expose direct Codex slash commands, while front-matter templates (with `---` blocks) plug into the shared `/gemini-map` workflow. Supporting assets reside in `codefetch/` (reference snippets) and `workflow.mmd` (Mermaid source for the end-to-end flow shown in `README.md`). Keep new prompts co-located with peers and reference them from `README.md` when they add net-new functionality.
5 | 
6 | ## Build, Test, and Development Commands
7 | The project is docs-only, so there is no build pipeline. Validate Markdown locally with `npx markdownlint-cli2 "**/*.md"` to honor the styles defined in `.markdownlint.json`. When editing prompts that issue shell commands, dry-run them with `bash -lc '<command>'` inside the Codex CLI to confirm arguments and paths resolve correctly.
8 | 
9 | ## Coding Style & Naming Conventions
10 | Write prompts in Markdown with ATX headings, 80–100 character lines, and ASCII characters unless the template already requires otherwise. For `/gemini-map` templates, mirror the existing front matter keys (`name`, `command`, `tags`, `scope`). Use imperative voice for numbered steps and bold the callouts that users should copy verbatim. New files should follow the lowercase-hyphenated naming pattern (e.g., `new-helper.md`).
11 | 
12 | ## Testing Guidelines
13 | Each prompt should explain a deterministic validation path. Include concrete command snippets (such as `rg -n "TODO" .`) so agents can verify results. After authoring changes, run `codex prompt run <file>` (or invoke the slash command directly) to ensure the prompt executes without missing context or syntax errors. Aim to cover both success and failure handling in the numbered steps.
14 | 
15 | ## Commit & Pull Request Guidelines
16 | Commits should read as imperative sentences ("Add scope control checklist") and focus on a single prompt or documentation area. Reference `/commit` to auto-generate an initial message, then edit for clarity. Pull requests must summarize the changes, list affected prompts, note verification steps (e.g., `markdownlint` and prompt dry-runs), and link to any relevant follow-up issues. Include screenshots or copied terminal output when updating Mermaid flows or command transcripts.
17 | 
18 | ## Agent Workflow Reminders
19 | Cross-link new prompts from `README.md` tables and, if relevant, extend the Mermaid flow to depict the new step. When deprecating a prompt, update its entry with a "Deprecated" note rather than deleting it outright so downstream agents can migrate gracefully.
```

GEMINI.md
```
1 | # GEMINI.md
2 | 
3 | ## Directory Overview
4 | 
5 | This directory contains a collection of prompts for the Codex CLI, designed to streamline and enhance various software development workflows. The prompts are written in Markdown and act as templates or scripts that can be invoked from the Codex command line. They cover a wide range of tasks, from planning and architecture to code generation, review, and auditing.
6 | 
7 | The prompts are categorized into two main types:
8 | 
9 | - **Slash Commands:** These are standalone prompts that can be directly invoked using a slash command (e.g., `/planning-process`). They are identified by a `Trigger:` line in the Markdown file.
10 | - **Gemini→Codex Mapper Templates:** These prompts are designed to be used with the `/gemini-map` command. They are identified by a YAML front-matter block at the beginning of the file.
11 | 
12 | ## Key Files
13 | 
14 | - **`README.md`**: The main documentation for the prompt collection. It provides an overview of the available prompts, their purpose, and how to use them.
15 | - **`AGENTS.md`**: Contains guidelines for contributors, including information on project structure, coding style, testing, and commit conventions.
16 | - **`workflow.mmd`**: A Mermaid flowchart that visualizes the end-to-end workflow of using the prompts.
17 | - **`.markdownlint.json`**: The configuration file for the Markdown linter, which enforces a consistent style for all prompt files.
18 | - **`codefetch/`**: A directory containing reference snippets and other assets used by the prompts.
19 | - **Prompt Files (`.md`)**: The individual prompt files, each of which corresponds to a specific command or template.
20 | 
21 | ## Usage
22 | 
23 | The prompts in this directory are intended to be used with the Codex CLI. To use them, you can either invoke the slash commands directly or use the `/gemini-map` command with a template file.
24 | 
25 | **Slash Commands:**
26 | 
27 | To use a slash command, simply type the command into the Codex CLI. For example, to use the planning process prompt, you would type:
28 | 
29 | ```
30 | /planning-process Add a new feature
31 | ```
32 | 
33 | **Gemini→Codex Mapper Templates:**
34 | 
35 | To use a `gemini-map` template, you would use the `/gemini-map` command followed by the name of the template file. For example, to use the `audit.md` template, you would type:
36 | 
37 | ```
38 | /gemini-map audit
39 | ```
40 | 
41 | **Validation:**
42 | 
43 | To ensure that the prompt files are well-formed and adhere to the project's style guidelines, you can use the following command to run the Markdown linter:
44 | 
45 | ```
46 | npx markdownlint-cli2 "**/*.md"
47 | ```
```

action-diagram.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Explain workflow triggers and dependencies as a diagram‑ready outline.
9 | 
10 | 1. Gather context by inspecting `.github/workflows`.
11 | 2. Explain workflow triggers and dependencies as a diagram‑ready outline.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Explain workflow triggers and dependencies as a diagram‑ready outline.
17 | - Organize details under clear subheadings so contributors can scan quickly.
18 | - List nodes and edges to make diagram creation straightforward.
19 | - Highlight workflow triggers, failing jobs, and proposed fixes.
20 | 
21 | Example Input:
22 | (none – command runs without arguments)
23 | 
24 | Expected Output:
25 | 
26 | ## Nodes
27 | 
28 | - build
29 | - deploy
30 | 
31 | ## Edges
32 | 
33 | - push -> build
34 | - build -> deploy
35 | 
36 | Usage: /gemini-map
```

adr-new.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Draft an Architecture Decision Record with pros/cons.
9 | 
10 | 1. Gather context by inspecting `README.md` for the project context.
11 | 2. Draft a concise ADR including Context, Decision, Status, Consequences. Title: <args>.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Draft an Architecture Decision Record with pros/cons.
17 | - Highlight workflow triggers, failing jobs, and proposed fixes.
18 | - Document the evidence you used so maintainers can trust the conclusion.
19 | 
20 | Example Input:
21 | src/example.ts
22 | 
23 | Expected Output:
24 | 
25 | - Actionable summary aligned with the output section.
26 | 
27 | Usage: /gemini-map
```

api-docs-local.md
```
1 | # API Docs Local
2 | 
3 | Trigger: /api-docs-local
4 | 
5 | Purpose: Fetch API docs and store locally for offline, deterministic reference.
6 | 
7 | ## Steps
8 | 
9 | 1. Create `docs/apis/` directory.
10 | 2. For each provided URL or package, write retrieval commands (curl or `npm view` docs links). Do not fetch automatically without confirmation.
11 | 3. Add `DOCS.md` index linking local copies.
12 | 
13 | ## Output format
14 | 
15 | - Command list and file paths to place docs under `docs/apis/`.
```

api-usage.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Show how an internal API is used across the codebase.
9 | 
10 | 1. Gather context by running `rg -n {{args}} . || grep -RIn {{args}} .`.
11 | 2. Summarize common usage patterns and potential misuses for the symbol.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Show how an internal API is used across the codebase.
17 | - Organize details under clear subheadings so contributors can scan quickly.
18 | - Document the evidence you used so maintainers can trust the conclusion.
19 | 
20 | Example Input:
21 | HttpClient
22 | 
23 | Expected Output:
24 | 
25 | - Definition: src/network/httpClient.ts line 42
26 | - Key usages: services/userService.ts, hooks/useRequest.ts
27 | 
28 | Usage: /gemini-map
```

audit.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Audit repository hygiene and suggest improvements.
9 | 
10 | 1. Gather context by running `ls -la` for the top‑level listing; inspecting `.editorconfig` for the common config files (if present); inspecting `.gitignore` for the common config files (if present); inspecting `.geminiignore` for the common config files (if present); inspecting `.eslintrc.cjs` for the common config files (if present); inspecting `.eslintrc.js` for the common config files (if present); inspecting `tsconfig.json` for the common config files (if present); inspecting `pyproject.toml` for the common config files (if present).
11 | 2. Assess repo hygiene: docs, tests, CI, linting, security. Provide a prioritized checklist.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Audit repository hygiene and suggest improvements.
17 | - Offer prioritized, actionable recommendations with rationale.
18 | - Call out test coverage gaps and validation steps.
19 | - Highlight workflow triggers, failing jobs, and proposed fixes.
20 | 
21 | Example Input:
22 | (none – command runs without arguments)
23 | 
24 | Expected Output:
25 | 
26 | - Structured report following the specified sections.
27 | 
28 | Usage: /gemini-map
```

blame-summary.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Summarize authorship hotspots for a file using git blame.
9 | 
10 | 1. Gather context by running `git blame -w --line-porcelain {{args}} | sed -n 's/^author //p' | sort | uniq -c | sort -nr | sed -n '1,25p'` for the blame authors (top contributors first).
11 | 2. Given the blame summary below, identify ownership hotspots and potential reviewers.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Summarize authorship hotspots for a file using git blame.
17 | - Organize details under clear subheadings so contributors can scan quickly.
18 | - Reference evidence from CODEOWNERS or git history for each owner suggestion.
19 | 
20 | Example Input:
21 | src/components/Button.tsx
22 | 
23 | Expected Output:
24 | 
25 | - Refactor proposal extracting shared styling hook with before/after snippet.
26 | 
27 | Usage: /gemini-map
```

changed-files.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Summarize changed files between HEAD and origin/main.
9 | 
10 | 1. Gather context by running `git diff --name-status origin/main...HEAD`.
11 | 2. List and categorize changed files: added/modified/renamed/deleted. Call out risky changes.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Summarize changed files between HEAD and origin/main.
17 | - Document the evidence you used so maintainers can trust the conclusion.
18 | 
19 | Example Input:
20 | (none – command runs without arguments)
21 | 
22 | Expected Output:
23 | 
24 | - Structured report following the specified sections.
25 | 
26 | Usage: /gemini-map
```

check.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Check adherence to .editorconfig across the repo.
9 | 
10 | 1. Gather context by inspecting `.editorconfig`; running `git ls-files | sed -n '1,400p'`.
11 | 2. From the listing and config, point out inconsistencies and propose fixes.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Check adherence to .editorconfig across the repo.
17 | - Offer prioritized, actionable recommendations with rationale.
18 | - Highlight workflow triggers, failing jobs, and proposed fixes.
19 | 
20 | Example Input:
21 | (none – command runs without arguments)
22 | 
23 | Expected Output:
24 | 
25 | - Structured report following the specified sections.
26 | 
27 | Usage: /gemini-map
```

cleanup-branches.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Suggest safe local branch cleanup (merged/stale).
9 | 
10 | 1. Gather context by running `git branch --merged` for the merged into current upstream; running `git branch --no-merged` for the branches not merged; running `git for-each-ref --sort=-authordate --format='%(refname:short) — %(authordate:relative)' refs/heads` for the recently updated (last author dates).
11 | 2. Using the lists below, suggest local branches safe to delete and which to keep. Include commands to remove them if desired (DO NOT execute).
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Suggest safe local branch cleanup (merged/stale).
17 | - Document the evidence you used so maintainers can trust the conclusion.
18 | 
19 | Example Input:
20 | (none – command runs without arguments)
21 | 
22 | Expected Output:
23 | 
24 | - Structured report following the specified sections.
25 | 
26 | Usage: /gemini-map
```

commit.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Generates a Git commit message based on staged changes.
9 | 
10 | 1. Gather context by running `git diff --staged`.
11 | 
12 | 2. ```diff.
13 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
14 | 
15 | Output:
16 | 
17 | - Begin with a concise summary that restates the goal: Generates a Git commit message based on staged changes.
18 | - Provide unified diff-style patches when recommending code changes.
19 | - Document the evidence you used so maintainers can trust the conclusion.
20 | 
21 | Example Input:
22 | (none – command runs without arguments)
23 | 
24 | Expected Output:
25 | 
26 | - Structured report following the specified sections.
27 | 
28 | Usage: /gemini-map
```

compare-outputs.md
```
1 | # Compare Outputs
2 | 
3 | Trigger: /compare-outputs
4 | 
5 | Purpose: Run multiple models or tools on the same prompt and summarize best output.
6 | 
7 | ## Steps
8 | 
9 | 1. Define evaluation prompts and expected properties.
10 | 2. Record outputs from each model/tool with metadata.
11 | 3. Score using a rubric: correctness, compile/run success, edits required.
12 | 4. Recommend a winner and suggested settings.
13 | 
14 | ## Output format
15 | 
16 | - Matrix comparison and a one-paragraph decision.
```

content-generation.md
```
1 | # Content Generation
2 | 
3 | Trigger: /content-generation
4 | 
5 | Purpose: Draft docs, blog posts, or marketing copy aligned with the codebase.
6 | 
7 | ## Steps
8 | 
9 | 1. Read repo README and recent CHANGELOG or commits.
10 | 2. Propose outlines for docs and posts.
11 | 3. Generate content with code snippets and usage examples.
12 | 
13 | ## Output format
14 | 
15 | - Markdown files with frontmatter and section headings.
```

coverage-guide.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Suggest a plan to raise coverage based on uncovered areas.
9 | 
10 | 1. Gather context by running `find . -name 'coverage*' -type f -maxdepth 3 -print -exec head -n 40 {} \; 2>/dev/null` for the coverage hints; running `git ls-files | sed -n '1,400p'` for the repo map.
11 | 2. Using coverage artifacts (if available) and repository map, propose the highest‑ROI tests to add.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Suggest a plan to raise coverage based on uncovered areas.
17 | - Offer prioritized, actionable recommendations with rationale.
18 | - Call out test coverage gaps and validation steps.
19 | 
20 | Example Input:
21 | (none – command runs without arguments)
22 | 
23 | Expected Output:
24 | 
25 | - Focus on src/auth/login.ts — 0% branch coverage; add error path test.
26 | 
27 | Usage: /gemini-map
```

dead-code-scan.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: List likely dead or unused files and exports (static signals).
9 | 
10 | 1. Gather context by running `rg -n "export |module.exports|exports\.|require\(|import " -g '!node_modules' .` for the file reference graph (best‑effort).
11 | 2. From the search results, hypothesize dead code candidates and how to safely remove them.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: List likely dead or unused files and exports (static signals).
17 | - Document the evidence you used so maintainers can trust the conclusion.
18 | 
19 | Example Input:
20 | (none – command runs without arguments)
21 | 
22 | Expected Output:
23 | 
24 | - Structured report following the specified sections.
25 | 
26 | Usage: /gemini-map
```

design-assets.md
```
1 | # Design Assets
2 | 
3 | Trigger: /design-assets
4 | 
5 | Purpose: Generate favicons and small design snippets from product brand.
6 | 
7 | ## Steps
8 | 
9 | 1. Extract brand colors and name from README or config.
10 | 2. Produce favicon set, social preview, and basic UI tokens.
11 | 3. Document asset locations and references.
12 | 
13 | ## Output format
14 | 
15 | - Asset checklist and generation commands.
```

devops-automation.md
```
1 | # DevOps Automation
2 | 
3 | Trigger: /devops-automation
4 | 
5 | Purpose: Configure servers, DNS, SSL, CI/CD at a pragmatic level.
6 | 
7 | ## Steps
8 | 
9 | 1. Inspect repo for IaC or deploy scripts.
10 | 2. Generate Terraform or Docker Compose templates if missing.
11 | 3. Propose CI workflows for tests, builds, and deploys.
12 | 4. Provide runbooks for rollback.
13 | 
14 | ## Output format
15 | 
16 | - Infra plan with checkpoints and secrets placeholders.
```

error-analysis.md
```
1 | # Error Analysis
2 | 
3 | Trigger: /error-analysis
4 | 
5 | Purpose: Analyze error logs and enumerate likely root causes with fixes.
6 | 
7 | ## Steps
8 | 
9 | 1. Collect last test logs or application stack traces if present.
10 | 2. Cluster errors by symptom. For each cluster list 2–3 plausible causes.
11 | 3. Propose instrumentation or inputs to disambiguate.
12 | 4. Provide minimal patch suggestions and validation steps.
13 | 
14 | ## Output format
15 | 
16 | - Table: error → likely causes → next checks → candidate fix.
17 | 
18 | ## Examples
19 | 
20 | - "TypeError: x is not a function" → wrong import, circular dep, stale build.
```

eslint-review.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Review ESLint config and suggest rule tweaks.
9 | 
10 | 1. Gather context by inspecting `.eslintrc.cjs`; inspecting `.eslintrc.js`; inspecting `package.json`.
11 | 2. Explain key rules, missing plugins, and performance considerations.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Review ESLint config and suggest rule tweaks.
17 | - Organize details under clear subheadings so contributors can scan quickly.
18 | - Document the evidence you used so maintainers can trust the conclusion.
19 | 
20 | Example Input:
21 | (none – command runs without arguments)
22 | 
23 | Expected Output:
24 | 
25 | - Structured report following the specified sections.
26 | 
27 | Usage: /gemini-map
```

explain-code.md
```
1 | # Explain Code
2 | 
3 | Trigger: /explain-code
4 | 
5 | Purpose: Provide line-by-line explanations for a given file or diff.
6 | 
7 | ## Steps
8 | 
9 | 1. Accept a file path or apply to staged diff.
10 | 2. Explain blocks with comments on purpose, inputs, outputs, and caveats.
11 | 3. Highlight risky assumptions and complexity hot spots.
12 | 
13 | ## Output format
14 | 
15 | - Annotated markdown with code fences and callouts.
```

explain-failures.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Analyze recent test failures and propose fixes.
9 | 
10 | 1. Gather context by running `ls -1 test-results 2>/dev/null || echo 'no test-results/ directory'` for the recent test output (if present); running `find . -maxdepth 2 -name 'junit*.xml' -o -name 'TEST-*.xml' -o -name 'last-test.log' -print -exec tail -n 200 {} \; 2>/dev/null` for the recent test output (if present).
11 | 2. From the following logs, identify root causes and propose concrete fixes.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Analyze recent test failures and propose fixes.
17 | - Offer prioritized, actionable recommendations with rationale.
18 | - Document the evidence you used so maintainers can trust the conclusion.
19 | 
20 | Example Input:
21 | (none – command runs without arguments)
22 | 
23 | Expected Output:
24 | 
25 | - Structured report following the specified sections.
26 | 
27 | Usage: /gemini-map
```

explain-symbol.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Explain where and how a symbol is defined and used.
9 | 
10 | 1. Gather context by running `rg -n {{args}} . || grep -RIn {{args}} .` for the results.
11 | 2. Explain where and how a symbol is defined and used.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Explain where and how a symbol is defined and used.
17 | - Organize details under clear subheadings so contributors can scan quickly.
18 | - Document the evidence you used so maintainers can trust the conclusion.
19 | 
20 | Example Input:
21 | HttpClient
22 | 
23 | Expected Output:
24 | 
25 | - Definition: src/network/httpClient.ts line 42
26 | - Key usages: services/userService.ts, hooks/useRequest.ts
27 | 
28 | Usage: /gemini-map
```

file-modularity.md
```
1 | # File Modularity
2 | 
3 | Trigger: /file-modularity
4 | 
5 | Purpose: Enforce smaller files and propose safe splits for giant files.
6 | 
7 | ## Steps
8 | 
9 | 1. Find files over thresholds (e.g., >500 lines).
10 | 2. Suggest extraction targets: components, hooks, utilities, schemas.
11 | 3. Provide before/after examples and import updates.
12 | 
13 | ## Output format
14 | 
15 | - Refactor plan with patches for file splits.
```

fix.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Propose a minimal, correct fix with patch hunks.
9 | 
10 | 1. Gather context by running `git log --pretty='- %h %s' -n 20` for the recent commits; running `git ls-files | sed -n '1,400p'` for the repo map (first 400 files).
11 | 2. Bug summary: <args>. Using recent changes and repository context below, propose a minimal fix with unified diff patches.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Propose a minimal, correct fix with patch hunks.
17 | - Provide unified diff-style patches when recommending code changes.
18 | - Offer prioritized, actionable recommendations with rationale.
19 | 
20 | Example Input:
21 | Authentication failure after password reset
22 | 
23 | Expected Output:
24 | 
25 | ```
26 | diff
27 | - if (!user) return error;
28 | + if (!user) return { status: 401 };
29 | ```
30 | 
31 | Regression test: add case for missing user.
32 | 
33 | Usage: /gemini-map
```

generate.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Generate unit tests for a given source file.
9 | 
10 | 1. Gather context by inspecting `package.json` for the framework hints (package.json); running `sed -n '1,400p' {{args}}` for the source (first 400 lines).
11 | 2. Given the file content, generate focused unit tests with clear arrange/act/assert and edge cases.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Generate unit tests for a given source file.
17 | - Call out test coverage gaps and validation steps.
18 | - Document the evidence you used so maintainers can trust the conclusion.
19 | 
20 | Example Input:
21 | src/components/Button.tsx
22 | 
23 | Expected Output:
24 | 
25 | - Refactor proposal extracting shared styling hook with before/after snippet.
26 | 
27 | Usage: /gemini-map
```

grep.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Recursive text search with ripgrep/grep injection.
9 | 
10 | 1. Gather context by running `rg -n {{args}} . || grep -RIn {{args}} .`.
11 | 2. Show matched lines with file paths and line numbers.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Recursive text search with ripgrep/grep injection.
17 | - Document the evidence you used so maintainers can trust the conclusion.
18 | 
19 | Example Input:
20 | HttpClient
21 | 
22 | Expected Output:
23 | 
24 | - Usage cluster in src/network/* with note on inconsistent error handling.
25 | 
26 | Usage: /gemini-map
```

instruction-file.md
```
1 | # Instruction File
2 | 
3 | Trigger: /instruction-file
4 | 
5 | Purpose: Generate or update `cursor.rules`, `windsurf.rules`, or `claude.md` with project-specific instructions.
6 | 
7 | ## Steps
8 | 
9 | 1. Scan repo for existing instruction files.
10 | 2. Compose sections: Context, Coding Standards, Review Rituals, Testing, Security, Limits.
11 | 3. Include "Reset and re-implement cleanly" guidance and scope control.
12 | 4. Write to chosen file and propose a commit message.
13 | 
14 | ## Output format
15 | 
16 | - Markdown instruction file with stable headings.
```

integration-test.md
```
1 | # Integration Test
2 | 
3 | Trigger: /integration-test
4 | 
5 | Purpose: Generate E2E tests that simulate real user flows.
6 | 
7 | ## Steps
8 | 
9 | 1. Detect framework from `package.json` or repo (Playwright/Cypress/Vitest).
10 | 2. Identify critical path scenarios from `PLAN.md`.
11 | 3. Produce test files under `e2e/` with arrange/act/assert and selectors resilient to DOM changes.
12 | 4. Include login helpers and data setup. Add CI commands.
13 | 
14 | ## Output format
15 | 
16 | - Test files with comments and a README snippet on how to run them.
17 | 
18 | ## Examples
19 | 
20 | - Login, navigate to dashboard, create record, assert toast.
21 | 
22 | ## Notes
23 | 
24 | - Prefer data-test-id attributes. Avoid brittle CSS selectors.
```

logging-strategy.md
```
1 | # Logging Strategy
2 | 
3 | Trigger: /logging-strategy
4 | 
5 | Purpose: Add or remove diagnostic logging cleanly with levels and privacy in mind.
6 | 
7 | ## Steps
8 | 
9 | 1. Identify hotspots from recent failures.
10 | 2. Insert structured logs with contexts and correlation IDs.
11 | 3. Remove noisy or PII-leaking logs.
12 | 4. Document log levels and sampling in `OBSERVABILITY.md`.
13 | 
14 | ## Output format
15 | 
16 | - Diff hunks and a short guideline section.
```

model-evaluation.md
```
1 | # Model Evaluation
2 | 
3 | Trigger: /model-evaluation
4 | 
5 | Purpose: Try a new model and compare outputs against a baseline.
6 | 
7 | ## Steps
8 | 
9 | 1. Define a benchmark set from recent tasks.
10 | 2. Run candidates and collect outputs and metrics.
11 | 3. Analyze failures and summarize where each model excels.
12 | 
13 | ## Output format
14 | 
15 | - Summary table and recommendations to adopt or not.
```

model-strengths.md
```
1 | # Model Strengths
2 | 
3 | Trigger: /model-strengths
4 | 
5 | Purpose: Choose model per task type.
6 | 
7 | ## Steps
8 | 
9 | 1. Classify task: UI, API, data, testing, docs, refactor.
10 | 2. Map historical success by model.
11 | 3. Recommend routing rules and temperatures.
12 | 
13 | ## Output format
14 | 
15 | - Routing guide with examples.
```

modular-architecture.md
```
1 | # Modular Architecture
2 | 
3 | Trigger: /modular-architecture
4 | 
5 | Purpose: Enforce modular boundaries and clear external interfaces.
6 | 
7 | ## Steps
8 | 
9 | 1. Identify services/modules and their public contracts.
10 | 2. Flag cross-module imports and circular deps.
11 | 3. Propose boundaries, facades, and internal folders.
12 | 4. Add "contract tests" for public APIs.
13 | 
14 | ## Output format
15 | 
16 | - Diagram-ready list of modules and edges, plus diffs.
```

owners.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Suggest likely owners/reviewers for a path.
9 | 
10 | 1. Gather context by inspecting `.github/CODEOWNERS` for the codeowners (if present); running `git log --pretty='- %an %ae: %s' -- {{args}} | sed -n '1,50p'` for the recent authors for the path.
11 | 2. Based on CODEOWNERS and git history, suggest owners.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Suggest likely owners/reviewers for a path.
17 | - Reference evidence from CODEOWNERS or git history for each owner suggestion.
18 | - Document the evidence you used so maintainers can trust the conclusion.
19 | 
20 | Example Input:
21 | src/components/Button.tsx
22 | 
23 | Expected Output:
24 | 
25 | - Likely reviewers: @frontend-team (CODEOWNERS), @jane (last 5 commits).
26 | 
27 | Usage: /gemini-map
```

plan.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Plan a Prettier adoption or migration with minimal churn.
9 | 
10 | 1. Gather context by inspecting `package.json`; running `git ls-files '*.*' | sed -n '1,400p'`.
11 | 2. Given the files and package.json, propose a rollout plan and ignore patterns.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Plan a Prettier adoption or migration with minimal churn.
17 | - Offer prioritized, actionable recommendations with rationale.
18 | - Document the evidence you used so maintainers can trust the conclusion.
19 | 
20 | Example Input:
21 | (none – command runs without arguments)
22 | 
23 | Expected Output:
24 | 
25 | - Structured report following the specified sections.
26 | 
27 | Usage: /gemini-map
```

planning-process.md
```
1 | # Planning Process
2 | 
3 | Trigger: /planning-process
4 | 
5 | Purpose: Draft, refine, and execute a feature plan with strict scope control and progress tracking.
6 | 
7 | ## Steps
8 | 
9 | 1. If no plan file exists, create `PLAN.md`. If it exists, load it.
10 | 2. Draft sections: **Goal**, **User Story**, **Milestones**, **Tasks**, **Won't do**, **Ideas for later**, **Validation**, **Risks**.
11 | 3. Trim bloat. Convert vague bullets into testable tasks with acceptance criteria.
12 | 4. Tag each task with an owner and estimate. Link to files or paths that will change.
13 | 5. Maintain two backlogs: **Won't do** (explicit non-goals) and **Ideas for later** (deferrable work).
14 | 6. Mark tasks done after tests pass. Append commit SHAs next to completed items.
15 | 7. After each milestone: run tests, update **Validation**, then commit `PLAN.md`.
16 | 
17 | ## Output format
18 | 
19 | - Update or create `PLAN.md` with the sections above.
20 | - Include a checklist for **Tasks**. Keep lines under 100 chars.
21 | 
22 | ## Examples
23 | **Input**: "Add OAuth login"
24 | 
25 | **Output**:
26 | 
27 | - Goal: Let users sign in with Google.
28 | - Tasks: [ ] add Google client, [ ] callback route, [ ] session, [ ] E2E test.
29 | - Won't do: org SSO.
30 | - Ideas for later: Apple login.
31 | 
32 | ## Notes
33 | 
34 | - Planning only. No code edits.
35 | - Assume a Git repo with test runner available.
```

pr-desc.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Draft a PR description from the branch diff.
9 | 
10 | 1. Gather context by running `git diff --name-status origin/main...HEAD` for the changed files (name + status); running `git diff --shortstat origin/main...HEAD` for the high‑level stats.
11 | 2. Create a crisp PR description following this structure: Summary, Context, Changes, Screenshots (if applicable), Risk, Test Plan, Rollback, Release Notes (if user‑facing). Base branch: origin/main User context: <args>.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Draft a PR description from the branch diff.
17 | - Offer prioritized, actionable recommendations with rationale.
18 | - Call out test coverage gaps and validation steps.
19 | - Highlight workflow triggers, failing jobs, and proposed fixes.
20 | 
21 | Example Input:
22 | src/example.ts
23 | 
24 | Expected Output:
25 | 
26 | - Actionable summary aligned with the output section.
27 | 
28 | Usage: /gemini-map
```

prototype-feature.md
```
1 | # Prototype Feature
2 | 
3 | Trigger: /prototype-feature
4 | 
5 | Purpose: Spin up a standalone prototype in a clean repo before merging into main.
6 | 
7 | ## Steps
8 | 
9 | 1. Create a scratch directory name suggestion and scaffolding commands.
10 | 2. Generate minimal app with only the feature and hardcoded data.
11 | 3. Add E2E test covering the prototype flow.
12 | 4. When validated, list the minimal patches to port back.
13 | 
14 | ## Output format
15 | 
16 | - Scaffold plan and migration notes.
```

refactor-file.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Suggest targeted refactors for a single file.
9 | 
10 | 1. Gather context by running `sed -n '1,400p' {{args}}` for the first 400 lines of the file.
11 | 2. Suggest refactors that reduce complexity and improve readability without changing behavior. Provide before/after snippets.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Suggest targeted refactors for a single file.
17 | - Include before/after snippets or diffs with commentary.
18 | - Document the evidence you used so maintainers can trust the conclusion.
19 | 
20 | Example Input:
21 | src/components/Button.tsx
22 | 
23 | Expected Output:
24 | 
25 | - Refactor proposal extracting shared styling hook with before/after snippet.
26 | 
27 | Usage: /gemini-map
```

refactor-suggestions.md
```
1 | # Refactor Suggestions
2 | 
3 | Trigger: /refactor-suggestions
4 | 
5 | Purpose: Propose repo-wide refactoring opportunities after tests exist.
6 | 
7 | ## Steps
8 | 
9 | 1. Map directory structure and large files.
10 | 2. Identify duplication, data clumps, and god objects.
11 | 3. Suggest phased refactors with safety checks and tests.
12 | 
13 | ## Output format
14 | 
15 | - Ranked list with owners and effort estimates.
```

reference-implementation.md
```
1 | # Reference Implementation
2 | 
3 | Trigger: /reference-implementation
4 | 
5 | Purpose: Mimic the style and API of a known working example.
6 | 
7 | ## Steps
8 | 
9 | 1. Accept a path or URL to an example. Extract its public API and patterns.
10 | 2. Map target module’s API to the reference.
11 | 3. Generate diffs that adopt the same structure and naming.
12 | 
13 | ## Output format
14 | 
15 | - Side-by-side API table and patch suggestions.
```

regression-guard.md
```
1 | # Regression Guard
2 | 
3 | Trigger: /regression-guard
4 | 
5 | Purpose: Detect unrelated changes and add tests to prevent regressions.
6 | 
7 | ## Steps
8 | 
9 | 1. Run `git diff --name-status origin/main...HEAD` and highlight unrelated files.
10 | 2. Propose test cases that lock current behavior for touched modules.
11 | 3. Suggest CI checks to block large unrelated diffs.
12 | 
13 | ## Output format
14 | 
15 | - Report with file groups, risk notes, and test additions.
16 | 
17 | ## Notes
18 | 
19 | - Keep proposed tests minimal and focused.
```

release-notes.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Generate human‑readable release notes from recent commits.
9 | 
10 | 1. Gather context by running `git log --pretty='* %s (%h) — %an' --no-merges {{args}}` for the commit log (no merges).
11 | 2. Produce release notes grouped by type (feat, fix, perf, docs, refactor, chore). Include a Highlights section and a full changelog list.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Generate human‑readable release notes from recent commits.
17 | - Document the evidence you used so maintainers can trust the conclusion.
18 | 
19 | Example Input:
20 | src/example.ts
21 | 
22 | Expected Output:
23 | ## Features
24 | 
25 | - Add SSO login flow (PR #42)
26 | 
27 | ## Fixes
28 | 
29 | - Resolve logout crash (PR #57)
30 | 
31 | Usage: /gemini-map
```

reset-strategy.md
```
1 | # Reset Strategy
2 | 
3 | Trigger: /reset-strategy
4 | 
5 | Purpose: Decide when to hard reset and start clean to avoid layered bad diffs.
6 | 
7 | ## Steps
8 | 
9 | 1. Run: `git status -sb` and `git diff --stat` to assess churn.
10 | 2. If many unrelated edits or failing builds, propose: `git reset --hard HEAD` to discard working tree.
11 | 3. Save any valuable snippets to `scratch/` before reset.
12 | 4. Re-implement the minimal correct fix from a clean state.
13 | 
14 | ## Output format
15 | 
16 | - A short decision note and exact commands. Never execute resets automatically.
17 | 
18 | ## Examples
19 | 
20 | - Recommend reset after repeated failing refactors touching 15+ files.
21 | 
22 | ## Notes
23 | 
24 | - Warn about destructive nature. Require user confirmation.
```

review-branch.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Provide a high‑level review of the current branch vs origin/main.
9 | 
10 | 1. Gather context by running `git diff --stat origin/main...HEAD` for the diff stats; running `git diff origin/main...HEAD | sed -n '1,200p'` for the ```diff.
11 | 2. Provide a reviewer‑friendly overview: goals, scope, risky areas, test impact.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Provide a high‑level review of the current branch vs origin/main.
17 | - Organize details under clear subheadings so contributors can scan quickly.
18 | - Call out test coverage gaps and validation steps.
19 | 
20 | Example Input:
21 | (none – command runs without arguments)
22 | 
23 | Expected Output:
24 | 
25 | - Structured report following the specified sections.
26 | 
27 | Usage: /gemini-map
```

review.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Review code matching a pattern and give actionable feedback.
9 | 
10 | 1. Gather context by running `rg -n {{args}} . || grep -RIn {{args}} .` for the search results for {{args}} (filename or regex).
11 | 2. Perform a thorough code review. Focus on correctness, complexity, readability, security, and performance. Provide concrete patch suggestions.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Review code matching a pattern and give actionable feedback.
17 | - Provide unified diff-style patches when recommending code changes.
18 | - Organize details under clear subheadings so contributors can scan quickly.
19 | 
20 | Example Input:
21 | HttpClient
22 | 
23 | Expected Output:
24 | 
25 | - Usage cluster in src/network/* with note on inconsistent error handling.
26 | 
27 | Usage: /gemini-map
```

scope-control.md
```
1 | # Scope Control
2 | 
3 | Trigger: /scope-control
4 | 
5 | Purpose: Enforce explicit scope boundaries and maintain "won't do" and "ideas for later" lists.
6 | 
7 | ## Steps
8 | 
9 | 1. Parse `PLAN.md` or create it if absent.
10 | 2. For each open task, confirm linkage to the current milestone.
11 | 3. Detect off-scope items and move them to **Won't do** or **Ideas for later** with rationale.
12 | 4. Add a "Scope Gate" checklist before merging.
13 | 
14 | ## Output format
15 | 
16 | - Patch to `PLAN.md` showing changes in sections and checklists.
17 | 
18 | ## Examples
19 | Input: off-scope request "Add email templates" during OAuth feature.
20 | Output: Move to **Ideas for later** with reason "Not needed for OAuth MVP".
21 | 
22 | ## Notes
23 | 
24 | - Never add new scope without recording tradeoffs.
```

stack-evaluation.md
```
1 | # Stack Evaluation
2 | 
3 | Trigger: /stack-evaluation
4 | 
5 | Purpose: Evaluate language/framework choices relative to AI familiarity and repo goals.
6 | 
7 | ## Steps
8 | 
9 | 1. Detect current stack and conventions.
10 | 2. List tradeoffs: maturity, tooling, available examples, hiring, and AI training coverage.
11 | 3. Recommend stay-or-switch with migration outline if switching.
12 | 
13 | ## Output format
14 | 
15 | - Decision memo with pros/cons and next steps.
```

summary.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Produce a README‑level summary of the repo.
9 | 
10 | 1. Gather context by running `git ls-files | sed -n '1,400p'` for the repo map (first 400 files); inspecting `README.md` for the key docs if present; inspecting `docs` for the key docs if present.
11 | 2. Generate a high‑level summary (What, Why, How, Getting Started).
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Produce a README‑level summary of the repo.
17 | - Document the evidence you used so maintainers can trust the conclusion.
18 | 
19 | Example Input:
20 | (none – command runs without arguments)
21 | 
22 | Expected Output:
23 | 
24 | - Structured report following the specified sections.
25 | 
26 | Usage: /gemini-map
```

switch-model.md
```
1 | # Switch Model
2 | 
3 | Trigger: /switch-model
4 | 
5 | Purpose: Decide when to try a different AI backend and how to compare.
6 | 
7 | ## Steps
8 | 
9 | 1. Define task type: frontend codegen, backend reasoning, test writing, refactor.
10 | 2. Select candidate models and temperature/tooling options.
11 | 3. Run a fixed input suite and measure latency, compile success, and edits needed.
12 | 4. Recommend a model per task with rationale.
13 | 
14 | ## Output format
15 | 
16 | - Table: task → model → settings → win reason.
```

todo-report.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Summarize TODO/FIXME/XXX annotations across the codebase.
9 | 
10 | 1. Gather context by running `rg -n "TODO|FIXME|XXX" -g '!node_modules' . || grep -RInE 'TODO|FIXME|XXX' .`.
11 | 2. Aggregate and group TODO/FIXME/XXX by area and priority. Propose a triage plan.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Summarize TODO/FIXME/XXX annotations across the codebase.
17 | - Offer prioritized, actionable recommendations with rationale.
18 | - Organize details under clear subheadings so contributors can scan quickly.
19 | 
20 | Example Input:
21 | (none – command runs without arguments)
22 | 
23 | Expected Output:
24 | 
25 | - Group: Platform backlog — 4 TODOs referencing auth migration (owner: @platform).
26 | 
27 | Usage: /gemini-map
```

todos.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Find and group TODO/FIXME annotations.
9 | 
10 | 1. Gather context by running `rg -n "TODO|FIXME" -g '!node_modules' . || grep -RInE 'TODO|FIXME' .`.
11 | 2. Find and group TODO/FIXME annotations.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Find and group TODO/FIXME annotations.
17 | - Document the evidence you used so maintainers can trust the conclusion.
18 | 
19 | Example Input:
20 | (none – command runs without arguments)
21 | 
22 | Expected Output:
23 | 
24 | - Group: Platform backlog — 4 TODOs referencing auth migration (owner: @platform).
25 | 
26 | Usage: /gemini-map
```

tsconfig-review.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Review tsconfig for correctness and DX.
9 | 
10 | 1. Gather context by inspecting `tsconfig.json`.
11 | 2. Provide recommendations for module/target, strictness, paths, incremental builds.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Review tsconfig for correctness and DX.
17 | - Offer prioritized, actionable recommendations with rationale.
18 | - Document the evidence you used so maintainers can trust the conclusion.
19 | 
20 | Example Input:
21 | (none – command runs without arguments)
22 | 
23 | Expected Output:
24 | 
25 | - Structured report following the specified sections.
26 | 
27 | Usage: /gemini-map
```

ui-screenshots.md
```
1 | # UI Screenshots
2 | 
3 | Trigger: /ui-screenshots
4 | 
5 | Purpose: Analyze screenshots for UI bugs or inspiration and propose actionable UI changes.
6 | 
7 | ## Steps
8 | 
9 | 1. Accept screenshot paths or links.
10 | 2. Describe visual hierarchy, spacing, contrast, and alignment issues.
11 | 3. Output concrete CSS or component changes.
12 | 
13 | ## Output format
14 | 
15 | - Issue list and code snippets to fix visuals.
```

version-control-guide.md
```
1 | # Version Control Guide
2 | 
3 | Trigger: /version-control-guide
4 | 
5 | Purpose: Enforce clean incremental commits and clean-room re-implementation when finalizing.
6 | 
7 | ## Steps
8 | 
9 | 1. Start each feature from a clean branch: `git switch -c <feat>`.
10 | 2. Commit in vertical slices with passing tests: `git add -p && git commit`.
11 | 3. When solution is proven, recreate a minimal clean diff: stash or copy results, reset, then apply only the final changes.
12 | 4. Use `git revert` for bad commits instead of force-pushing shared branches.
13 | 
14 | ## Output format
15 | 
16 | - Checklist plus suggested commands for the current repo state.
17 | 
18 | ## Examples
19 | 
20 | - Convert messy spike into three commits: setup, feature, tests.
21 | 
22 | ## Notes
23 | 
24 | - Never modify remote branches without confirmation.
```

version-proposal.md
```
1 | ---
2 | name: Gemini→Codex Mapper
3 | command: /gemini-map
4 | tags: migration, prompts, tooling
5 | scope: toml-to-codex
6 | ---
7 | 
8 | You are a CLI assistant focused on helping contributors with the task: Propose next version (major/minor/patch) from commit history.
9 | 
10 | 1. Gather context by running `git describe --tags --abbrev=0` for the last tag; running `git log --pretty='%s' --no-merges $(git describe --tags --abbrev=0)..HEAD` for the commits since last tag (no merges).
11 | 2. Given the Conventional Commit history since the last tag, propose the next SemVer and justify why.
12 | 3. Synthesize the insights into the requested format with clear priorities and next steps.
13 | 
14 | Output:
15 | 
16 | - Begin with a concise summary that restates the goal: Propose next version (major/minor/patch) from commit history.
17 | - Offer prioritized, actionable recommendations with rationale.
18 | - Document the evidence you used so maintainers can trust the conclusion.
19 | 
20 | Example Input:
21 | (none – command runs without arguments)
22 | 
23 | Expected Output:
24 | 
25 | - Structured report following the specified sections.
26 | 
27 | Usage: /gemini-map
```

vibe-coders.md
```
1 | # YC Guide to Vibe Coding
2 | 
3 | ## Planning Process
4 | 
5 | - **Create a comprehensive plan**: Start by working with the AI to write a detailed implementation plan in a markdown file.
6 | - **Review and refine**: Delete unnecessary items, mark features as *won’t do* if too complex.
7 | - **Maintain scope control**: Keep a separate section for *ideas for later* to stay focused.
8 | - **Implement incrementally**: Work section by section rather than attempting to build everything at once.
9 | - **Track progress**: Have the AI mark sections as complete after successful implementation.
10 | - **Commit regularly**: Ensure each working section is committed to Git before moving to the next.
11 | 
12 | ---
13 | 
14 | ## Version Control Strategies
15 | 
16 | - **Use Git religiously**: Don’t rely solely on the AI tools’ revert functionality.
17 | - **Start clean**: Begin each new feature with a clean Git slate.
18 | - **Reset when stuck**: Use `git reset --hard HEAD` if the AI goes on a vision quest.
19 | - **Avoid cumulative problems**: Multiple failed attempts create layers of bad code.
20 | - **Clean implementation**: When you finally find a solution, reset and implement it cleanly.
21 | 
22 | ---
23 | 
24 | ## Testing Framework
25 | 
26 | - **Prioritize high-level tests**: Focus on end-to-end integration tests over unit tests.
27 | - **Simulate user behavior**: Test features by simulating someone clicking through the site/app.
28 | - **Catch regressions**: LLMs often make unnecessary changes to unrelated logic.
29 | - **Test before proceeding**: Ensure tests pass before moving to the next feature.
30 | - **Use tests as guardrails**: Some founders recommend starting with test cases to provide clear boundaries.
31 | 
32 | ---
33 | 
34 | ## Effective Bug Fixing
35 | 
36 | - **Leverage error messages**: Simply copy-pasting error messages is often enough for the AI.
37 | - **Analyze before coding**: Ask the AI to consider multiple possible causes.
38 | - **Reset after failures**: Start with a clean slate after each unsuccessful fix attempt.
39 | - **Implement logging**: Add strategic logging to better understand what’s happening.
40 | - **Switch models**: Try different AI models when one gets stuck.
41 | - **Clean implementation**: Once you identify the fix, reset and implement it on a clean codebase.
42 | 
43 | ---
44 | 
45 | ## AI Tool Optimization
46 | 
47 | - **Create instruction files**: Write detailed instructions for your AI in appropriate files (`cursor.rules`, `windsurf.rules`, `claude.md`).
48 | - **Local documentation**: Download API documentation to your project folder for accuracy.
49 | - **Use multiple tools**: Some founders run both Cursor and Windsurf simultaneously on the same project.
50 | - **Tool specialization**: Cursor is a bit faster for frontend work, while Windsurf thinks longer.
51 | - **Compare outputs**: Generate multiple solutions and pick the best one.
52 | 
53 | ---
54 | 
55 | ## Complex Feature Development
56 | 
57 | - **Create standalone prototypes**: Build complex features in a clean codebase first.
58 | - **Use reference implementations**: Point the AI to working examples to follow.
59 | - **Clear boundaries**: Maintain consistent external APIs while allowing internal changes.
60 | - **Modular architecture**: Service-based architectures with clear boundaries work better than monorepos.
61 | 
62 | ---
63 | 
64 | ## Tech Stack Considerations
65 | 
66 | - **Established frameworks excel**: Ruby on Rails works well due to 20 years of consistent conventions.
67 | - **Training data matters**: Newer languages like Rust or Elixir may have less training data.
68 | - **Modularity is key**: Small, modular files are easier for both humans and AIs to work with.
69 | - **Avoid large files**: Don’t have files that are thousands of lines long.
70 | 
71 | ---
72 | 
73 | ## Beyond Coding
74 | 
75 | - **DevOps automation**: Use AI for configuring servers, DNS, and hosting.
76 | - **Design assistance**: Generate favicons and other design elements.
77 | - **Content creation**: Draft documentation and marketing materials.
78 | - **Educational tool**: Ask the AI to explain implementations line by line.
79 | - **Use screenshots**: Share UI bugs or design inspiration visually.
80 | - **Voice input**: Tools like Aqua enable 140 words per minute input.
81 | 
82 | ---
83 | 
84 | ## Continuous Improvement
85 | 
86 | - **Regular refactoring**: Once tests are in place, refactor frequently.
87 | - **Identify opportunities**: Ask the AI to find refactoring candidates.
88 | - **Stay current**: Try every new model release.
89 | - **Recognize strengths**: Different models excel at different tasks.
```

voice-input.md
```
1 | # Voice Input
2 | 
3 | Trigger: /voice-input
4 | 
5 | Purpose: Support interaction from voice capture and convert to structured prompts.
6 | 
7 | ## Steps
8 | 
9 | 1. Accept transcript text.
10 | 2. Normalize to tasks or commands for other prompts.
11 | 3. Preserve speaker intents and important entities.
12 | 
13 | ## Output format
14 | 
15 | - Cleaned command list ready to execute.
```

workflow.mmd
```
1 | flowchart TD
2 |     A[planning-process.md] --> B[scope-control.md]
3 |     B --> C[prototype-feature.md]
4 |     C --> D[explain-code.md]
5 |     D --> E[refactor-file.md]
6 |     E --> F[file-modularity.md]
7 |     F --> G[generate.md]
8 |     G --> H[integration-test.md]
9 |     H --> I[coverage-guide.md]
10 |     I --> J[explain-failures.md]
11 |     J --> K[fix.md]
12 |     K --> L[commit.md]
13 |     L --> M[review.md]
14 |     M --> N[review-branch.md]
15 |     N --> O[pr-desc.md]
16 |     O --> P[regression-guard.md]
17 |     P --> Q[release-notes.md]
18 |     Q --> R[version-proposal.md]
19 |     R --> S[devops-automation.md]
20 |     S --> T[reset-strategy.md]
21 |     T --> U[cleanup-branches.md]
22 |     U --> V[design-assets.md]
23 |     V --> W[ui-screenshots.md]
24 |     W --> X[logging-strategy.md]
25 |     X --> Y[error-analysis.md]
26 |     Y --> Z[audit.md]
27 |     Z --> AA[summary.md]
28 |     AA --> AB[instruction-file.md]
29 |     AB --> AC[version-control-guide.md]
30 |     AC --> AD[owners.md]
31 |     AD --> AE[blame-summary.md]
32 |     AE --> AF[changed-files.md]
33 |     AF --> AG[todo-report.md]
34 |     AG --> AH[todos.md]
35 |     AH --> AI[dead-code-scan.md]
36 |     AI --> AJ[grep.md]
37 |     AJ --> AK[explain-symbol.md]
38 |     AK --> AL[api-usage.md]
39 |     AL --> AM[action-diagram.md]
40 |     AM --> AN[plan.md]
41 |     AN --> AO[tsconfig-review.md]
42 |     AO --> AP[eslint-review.md]
43 |     AP --> AQ[stack-evaluation.md]
44 |     AQ --> AR[modular-architecture.md]
45 |     AR --> AS[refactor-suggestions.md]
46 |     AS --> AT[reference-implementation.md]
47 |     AT --> AU[model-strengths.md]
48 |     AU --> AV[model-evaluation.md]
49 |     AV --> AW[compare-outputs.md]
50 |     AW --> AX[switch-model.md]
51 |     AX --> AY[voice-input.md]
52 |     AY --> AZ[content-generation.md]
53 |     AZ --> BA[api-docs-local.md]
```
