---
phase: "Support"
gate: "Support intake"
status: "Clarify voice-derived requests before invoking gated prompts."
previous:
  - "Voice transcript capture"
next:
  - "Any stage-specific command (e.g., /planning-process)"
---

# Voice Input

Trigger: /voice-input

Purpose: Support interaction from voice capture and convert to structured prompts.

## Steps

1. Accept transcript text.
2. Normalize to tasks or commands for other prompts.
3. Preserve speaker intents and important entities.

## Output format

- Cleaned command list ready to execute.

