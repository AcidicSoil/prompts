---
phase: "P0 Preflight Docs"
gate: "DocFetchReport"
status: "capture approved instructions before proceeding."
previous:
  - "Preflight discovery (AGENTS baseline)"
next:
  - "/planning-process"
  - "/scope-control"
---

# Instruction File

Trigger: /instruction-file

Purpose: Generate or update `cursor.rules`, `windsurf.rules`, or `claude.md` with project-specific instructions.

## Steps

1. Scan repo for existing instruction files.
2. Compose sections: Context, Coding Standards, Review Rituals, Testing, Security, Limits.
3. Include "Reset and re-implement cleanly" guidance and scope control.
4. Write to chosen file and propose a commit message.

## Output format

- Markdown instruction file with stable headings.

