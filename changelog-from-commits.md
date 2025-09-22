# Draft CHANGELOG From Commits

Trigger: /changelog-from-commits

Purpose: Produce a first-draft six-section CHANGELOG block from commit messages and PR titles between two refs.

Steps:
1. Inputs: `since=<ref or tag>` optional, `until=<ref>` default HEAD, `include_prs=true|false` default true.
2. Gather data with:
   - `git log --pretty=%H%x09%s%x09%b <since>.. <until>`
   - If available, `gh pr view` for merged PR titles by commit SHA; else rely on merge commit subjects.
3. Heuristics:
   - Map types: `feat|add`→Added, `fix|bug`→Fixed, `perf|refactor|opt`→Changed, `deprecate`→Deprecated, `remove|drop`→Removed, `sec|cve|security`→Security.
   - Shorten to 12–80 chars. Strip scope parentheses.
4. Emit Markdown with only non-empty sections and a short preface noting the range.

Output format:
- Range preface line
- Six-section Markdown block

Examples:
Input → `/changelog-from-commits since=v2.0.0 until=HEAD`
Output →
```
Range: v2.0.0..HEAD

### Added
- Import data from XLSX (#612)

### Fixed
- Correct null check in OAuth callback (#615)
```

Notes:
- This is a draft; run `/update-changelog` to finalize and create links.
- Keep bullets user-facing; avoid internal refactor noise.
