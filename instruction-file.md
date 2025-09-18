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

## Stage alignment

- **Phase**: [P0 Preflight Docs](WORKFLOW.md#p0-preflight-docs-blocking)
- **Gate**: DocFetchReport — capture approved instructions before proceeding.
- **Previous prompts**: Preflight discovery (AGENTS baseline)
- **Next prompts**: `/planning-process`, `/scope-control`
