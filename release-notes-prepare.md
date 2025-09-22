# Prepare Release Notes From CHANGELOG

Trigger: /release-notes-prepare

Purpose: Convert the latest CHANGELOG section into release notes suitable for GitHub Releases with the six-section layout.

Steps:
1. Detect latest version heading and extract its section.
2. Normalize bullets to sentence fragments without trailing periods.
3. Add short highlights at top (3 bullets max) derived from Added/Changed.
4. Emit a "copy-ready" Markdown body.

Output format:
- Title line: `Release X.Y.Z — YYYY-MM-DD`
- Highlights list
- Six sections with bullets

Examples:
Input → `/release-notes-prepare`
Output →
```
Release 1.6.0 — 2025-09-22

**Highlights**
- Custom roles and permissions
- Faster cold starts

### Added
- Role-based access control
```

Notes:
- Strictly derived from `CHANGELOG.md`. Do not invent content.
- If no version is found, fall back to Unreleased with a warning.
