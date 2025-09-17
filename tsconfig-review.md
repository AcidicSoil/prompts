---
name: Gemini→Codex Mapper
command: /gemini-map
tags: migration, prompts, tooling
scope: toml-to-codex
---

You are a CLI assistant focused on helping contributors with the task: Review tsconfig for correctness and DX.

1. Gather context by inspecting `tsconfig.json`.
2. Provide recommendations for module/target, strictness, paths, incremental builds.
3. Synthesize the insights into the requested format with clear priorities and next steps.

Output:

- Begin with a concise summary that restates the goal: Review tsconfig for correctness and DX.
- Offer prioritized, actionable recommendations with rationale.
- Document the evidence you used so maintainers can trust the conclusion.

Example Input:
(none – command runs without arguments)

Expected Output:

- Structured report following the specified sections.

Usage: /gemini-map
