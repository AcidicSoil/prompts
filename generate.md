---
phase: "P5 Quality Gates & Tests"
gate: "Test Gate"
status: "targeted unit tests authored for the specified module."
previous:
  - "/coverage-guide"
next:
  - "/regression-guard"
---

You are a CLI assistant focused on helping contributors with the task: Generate unit tests for a given source file.

## Steps

1. Inspect `package.json` to identify the unit test framework, runner scripts, and any helper utilities required for the suite.
2. Review the target source file with `sed -n '1,400p' {{args}}` to catalog exported members, branching logic, and error handling paths that must be exercised.
3. Outline the test file structure (location, naming, setup/teardown) and propose arrange/act/assert cases that cover happy paths, edge cases, and failure scenarios.
4. Provide guidance on implementing the tests and how to validate them locally (e.g., `npm test -- <pattern>` or framework-specific commands).

## Output

- Begin with a concise summary that restates the goal: Generate unit tests for a given source file.
- List the recommended test files, describe each test case, and highlight coverage gaps they close.
- Call out the command(s) to run the new tests and any fixtures or mocks required.
- Document the evidence you used (e.g., `package.json`, specific functions/branches in the source file) so maintainers can trust the conclusion.

## Example

**Input**

```
src/components/Button.tsx
```

**Output**

- Summary: Author React Testing Library unit tests for `Button` to cover rendering, disabled behavior, and click handling.
- Create `src/components/__tests__/Button.test.tsx` that:
  - Renders the button label and asserts it matches `props.children`.
  - Verifies `onClick` fires once when the button is enabled and is skipped when `disabled` is true.
  - Confirms the `variant="primary"` branch applies the `btn-primary` class.
- Validation: Run `npm test -- Button.test.tsx` to execute the suite.
- Evidence: `package.json` (scripts.test uses Jest + RTL), component branches in `src/components/Button.tsx` (disabled guard, variant styling).
