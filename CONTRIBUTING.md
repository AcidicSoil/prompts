# Contributing

Thanks for helping extend the prompt catalog. Follow these guidelines so metadata stays consistent with the lifecycle workflow.

## Metadata expectations

- Every lifecycle prompt must begin with the YAML front matter documented in [README.md](README.md).
- `phase` values must reference headings from [WORKFLOW.md](WORKFLOW.md). Use an array when the prompt spans multiple phases.
- Keep `previous` and `next` arrays focused on slash commands or named prerequisites.

## Validation

1. Install dev dependencies once: `npm install`.
2. Run the metadata check before adding or editing prompts: `npm run validate:metadata`.
3. Fix any reported issues before opening a PR.

The validator ensures front matter stays in sync with the workflow gates and stops regressions early.
