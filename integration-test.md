# Integration Test

Trigger: /integration-test

Purpose: Generate E2E tests that simulate real user flows.

## Steps

1. Detect framework from `package.json` or repo (Playwright/Cypress/Vitest).
2. Identify critical path scenarios from `PLAN.md`.
3. Produce test files under `e2e/` with arrange/act/assert and selectors resilient to DOM changes.
4. Include login helpers and data setup. Add CI commands.

## Output format

- Test files with comments and a README snippet on how to run them.

## Examples

- Login, navigate to dashboard, create record, assert toast.

## Notes

- Prefer data-test-id attributes. Avoid brittle CSS selectors.
