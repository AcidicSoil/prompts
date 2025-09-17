# Repository Guidelines

## Project Structure & Module Organization
All contributor-facing prompts live at the repository root as `.md` files. Files that declare a `Trigger:` expose direct Codex slash commands, while front-matter templates (with `---` blocks) plug into the shared `/gemini-map` workflow. Supporting assets reside in `codefetch/` (reference snippets) and `workflow.mmd` (Mermaid source for the end-to-end flow shown in `README.md`). Keep new prompts co-located with peers and reference them from `README.md` when they add net-new functionality.

## Build, Test, and Development Commands
The project is docs-only, so there is no build pipeline. Validate Markdown locally with `npx markdownlint-cli2 "**/*.md"` to honor the styles defined in `.markdownlint.json`. When editing prompts that issue shell commands, dry-run them with `bash -lc '<command>'` inside the Codex CLI to confirm arguments and paths resolve correctly.

## Coding Style & Naming Conventions
Write prompts in Markdown with ATX headings, 80–100 character lines, and ASCII characters unless the template already requires otherwise. For `/gemini-map` templates, mirror the existing front matter keys (`name`, `command`, `tags`, `scope`). Use imperative voice for numbered steps and bold the callouts that users should copy verbatim. New files should follow the lowercase-hyphenated naming pattern (e.g., `new-helper.md`).

## Testing Guidelines
Each prompt should explain a deterministic validation path. Include concrete command snippets (such as `rg -n "TODO" .`) so agents can verify results. After authoring changes, run `codex prompt run <file>` (or invoke the slash command directly) to ensure the prompt executes without missing context or syntax errors. Aim to cover both success and failure handling in the numbered steps.

## Commit & Pull Request Guidelines
Commits should read as imperative sentences ("Add scope control checklist") and focus on a single prompt or documentation area. Reference `/commit` to auto-generate an initial message, then edit for clarity. Pull requests must summarize the changes, list affected prompts, note verification steps (e.g., `markdownlint` and prompt dry-runs), and link to any relevant follow-up issues. Include screenshots or copied terminal output when updating Mermaid flows or command transcripts.

## Agent Workflow Reminders
Cross-link new prompts from `README.md` tables and, if relevant, extend the Mermaid flow to depict the new step. When deprecating a prompt, update its entry with a "Deprecated" note rather than deleting it outright so downstream agents can migrate gracefully.
