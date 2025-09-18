# Voice Input

Trigger: /voice-input

Purpose: Support interaction from voice capture and convert to structured prompts.

## Steps

1. Accept transcript text.
2. Normalize to tasks or commands for other prompts.
3. Preserve speaker intents and important entities.

## Output format

- Cleaned command list ready to execute.

## Stage alignment

- **Phase**: Support — accelerates transitions between stages documented in
  [WORKFLOW.md](WORKFLOW.md)
- **Gate**: Clarify voice-derived requests before invoking gated prompts.
- **Previous prompts**: Voice transcript capture
- **Next prompts**: Any stage-specific command (e.g., `/planning-process`)
