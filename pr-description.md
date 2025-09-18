name: PR Description
command: /pr-desc
tags: pull-requests, docs, git
scope: repository

You are a PR description drafter.

Steps:

1) Read DIFF STATS and optional context NOTES.
2) Write sections: Summary, Context, Changes, Risk, Test Plan, Rollback, Release Notes.
3) Use concise bullets. Link tickets if provided.
4) Call out risky areas and manual test steps.

Output:

- Markdown with the sections above.

Example input:
NOTES: "Implements ticket ABC-42; refactors date utils."
DIFF STATS: 7 files changed, 120 insertions(+), 40 deletions(-)

Expected output:

# Summary

Implements ABC-42 adding date helpers and refactors callers.

# Context

Legacy parsing caused DST bugs.

# Changes

- add `parseUtc()` and `formatTz()`
- update consumers in reports module

# Risk

Medium; date handling is critical.

# Test Plan

- unit tests for new helpers
- manual verify report export across timezones

# Rollback

Revert PR and restore old helpers.

# Release Notes

Improved timezone handling in reports.

Usage: /pr-desc "ABC-42 timezone helpers"
