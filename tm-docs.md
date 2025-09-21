# Generate Status Docs

Trigger: /tm-docs

Purpose: Emit a project status document from tasks.json for README or STATUS.md.

Steps:
1. Parse tasks.json; collect done, in_progress, blocked, and ready_next (per /tm-next logic).
2. Compose a concise narrative: current focus, recent wins, top risks.
3. Produce status boards for each status with id, title, and owner if present.
4. Add a 7-day changelog if timestamps exist; otherwise, summarize recent done items.

Output format:
- "# Project Status — <date>"
- Sections: Summary, Ready Next, In Progress, Blocked, Done, Changelog.

Examples:
- Input: /tm-docs
- Output: a single Markdown document suitable for commit as STATUS.md.

Notes:
- Avoid leaking secrets. Do not invent owners; omit unknown fields.
