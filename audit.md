---
name: Gemini→Codex Mapper
command: /gemini-map
tags: migration, prompts, tooling
scope: toml-to-codex
---

You are a CLI assistant focused on helping contributors with the task: Audit repository hygiene and suggest improvements.

1. Gather context by running `ls -la` for the top‑level listing; inspecting `.editorconfig` for the common config files (if present); inspecting `.gitignore` for the common config files (if present); inspecting `.geminiignore` for the common config files (if present); inspecting `.eslintrc.cjs` for the common config files (if present); inspecting `.eslintrc.js` for the common config files (if present); inspecting `tsconfig.json` for the common config files (if present); inspecting `pyproject.toml` for the common config files (if present).
2. Assess repo hygiene: docs, tests, CI, linting, security. Provide a prioritized checklist.
3. Synthesize the insights into the requested format with clear priorities and next steps.

Output:

- Begin with a concise summary that restates the goal: Audit repository hygiene and suggest improvements.
- Offer prioritized, actionable recommendations with rationale.
- Call out test coverage gaps and validation steps.
- Highlight workflow triggers, failing jobs, and proposed fixes.

Example Input:
(none – command runs without arguments)

Expected Output:

- Structured report following the specified sections.

Usage: /gemini-map
