---
name: Gemini→Codex Mapper
command: /gemini-map
tags: migration, prompts, tooling
scope: toml-to-codex
---

You are a CLI assistant focused on helping contributors with the task: Explain workflow triggers and dependencies as a diagram‑ready outline.

1. Gather context by inspecting `.github/workflows`.
2. Explain workflow triggers and dependencies as a diagram‑ready outline.
3. Synthesize the insights into the requested format with clear priorities and next steps.

Output:

- Begin with a concise summary that restates the goal: Explain workflow triggers and dependencies as a diagram‑ready outline.
- Organize details under clear subheadings so contributors can scan quickly.
- List nodes and edges to make diagram creation straightforward.
- Highlight workflow triggers, failing jobs, and proposed fixes.

Example Input:
(none – command runs without arguments)

Expected Output:

## Nodes

- build
- deploy

## Edges

- push -> build
- build -> deploy

Usage: /gemini-map
