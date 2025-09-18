# Modular Architecture

Trigger: /modular-architecture

Purpose: Enforce modular boundaries and clear external interfaces.

## Steps

1. Identify services/modules and their public contracts.
2. Flag cross-module imports and circular deps.
3. Propose boundaries, facades, and internal folders.
4. Add "contract tests" for public APIs.

## Output format

- Diagram-ready list of modules and edges, plus diffs.

## Stage alignment

- **Phase**: [P2 App Scaffold & Contracts](WORKFLOW.md#p2-app-scaffold--contracts);
  revisit during [P4 Frontend UX](WORKFLOW.md#p4-frontend-ux) for UI seams.
- **Gate**: Test Gate lite — boundaries documented and lint/build scripts still pass.
- **Previous prompts**: `/openapi-generate`
- **Next prompts**: `/db-bootstrap`, `/ui-screenshots`, `/design-assets`
