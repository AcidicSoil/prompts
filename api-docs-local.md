# API Docs Local

Trigger: /api-docs-local

Purpose: Fetch API docs and store locally for offline, deterministic reference.

## Steps

1. Create `docs/apis/` directory.
2. For each provided URL or package, write retrieval commands (curl or `npm view` docs links). Do not fetch automatically without confirmation.
3. Add `DOCS.md` index linking local copies.

## Output format

- Command list and file paths to place docs under `docs/apis/`.

## Stage alignment

- **Phase**: [P2 App Scaffold & Contracts](WORKFLOW.md#p2-app-scaffold--contracts)
- **Gate**: Test Gate lite — contracts cached locally for repeatable generation.
- **Previous prompts**: `/scaffold-fullstack`
- **Next prompts**: `/api-contract`, `/openapi-generate`
