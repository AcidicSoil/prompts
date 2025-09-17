# File Modularity

Trigger: /file-modularity

Purpose: Enforce smaller files and propose safe splits for giant files.

## Steps

1. Find files over thresholds (e.g., >500 lines).
2. Suggest extraction targets: components, hooks, utilities, schemas.
3. Provide before/after examples and import updates.

## Output format

- Refactor plan with patches for file splits.
