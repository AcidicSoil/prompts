phase: "P2 App Scaffold & Contracts"
gate: "Test Gate lite"
status: "boundaries documented and lint/build scripts still pass; revisit during P4 Frontend UX for UI seams."
previous:

- "/openapi-generate"
next:
- "/db-bootstrap"
- "/ui-screenshots"
- "/design-assets"

---

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

