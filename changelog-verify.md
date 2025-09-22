# Verify CHANGELOG Completeness

Trigger: /changelog-verify

Purpose: Check that the latest merge introduced a CHANGELOG entry with the six-section policy and that sections are concise and non-empty where applicable.

Steps:

1. Parse `CHANGELOG.md` and locate `## [Unreleased]` or the latest version heading.
2. Validate presence and order of sections: Added, Changed, Deprecated, Removed, Fixed, Security.
3. Flag anti-patterns: paragraphs longer than 2 lines, trailing periods, internal-only jargon, file paths, or empty sections left in place.
4. Cross-check against commits since last tag to detect missing items.
5. Emit a diagnostic report and a suggested patch to fix ordering and brevity issues.

Output format:

- "Status: PASS|FAIL"
- Table of findings with line numbers and reasons
- Suggested normalized Markdown block
- Unified diff to apply

Examples:
Input → `/changelog-verify`
Output →

```
Status: FAIL
- L42: Section order incorrect (Found Fixed before Removed)
- Missing Security section stub

Suggested block:
### Added
- Bulk upload for SKUs

### Security
- Bump OpenSSL to 3.0.14
```

Notes:

- Static analysis only; no network calls.
- Treat any section with 0 bullets as removable unless policy requires stubs.
