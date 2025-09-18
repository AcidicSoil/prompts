# Reference Implementation

Trigger: /reference-implementation

Purpose: Mimic the style and API of a known working example.

## Steps

1. Accept a path or URL to an example. Extract its public API and patterns.
2. Map target module’s API to the reference.
3. Generate diffs that adopt the same structure and naming.

## Output format

- Side-by-side API table and patch suggestions.

## Stage alignment

- **Phase**: [P2 App Scaffold & Contracts](WORKFLOW.md#p2-app-scaffold--contracts)
- **Gate**: Test Gate lite — align new modules with proven patterns before deeper work.
- **Previous prompts**: `/scaffold-fullstack`, `/api-contract`
- **Next prompts**: `/modular-architecture`, `/openapi-generate`
