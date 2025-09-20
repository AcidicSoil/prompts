---
phase: "P0 Preflight Docs"
gate: "DocFetchReport"
status: "DocFetchReport.status is OK with sources captured before planning or coding."
previous:
  - "Preflight discovery (AGENTS baseline)"
next:
  - "/instruction-file"
  - "/planning-process"
---

# DocFetch Preflight Check

Trigger: /docfetch-check

Purpose: Enforce the documentation freshness gate before planning work begins. Run this guardrail to pull the latest references, update the DocFetchReport, and block further tasks until the report is OK.

## Why this matters

- Keeps lifecycle prompts aligned with the newest official docs, SDK notes, and workflow rule-packs.
- Prevents stale guidance from sneaking into planning or implementation tasks.
- Records doc coverage in `DocFetchReport` so reviewers can audit what sources were considered.

## Steps

1. **Prepare the workspace**
   - Ensure you are at the repo root (`/home/user/.codex/prompts`).
   - Review `AGENTS.md` for any newly added rule-packs that might need fresh docs.
2. **Identify the doc set**
   - Note the tech stack elements you will touch (frameworks, SDKs, infra). For each, pick the primary doc provider (contex7-mcp first, gitmcp as fallback).
3. **Fetch docs via MCP**
   - For each library/tool:
     ```bash
     # Example using contex7-mcp via CLI helper (adjust topic per dependency)
     docfetch contex7-mcp "<library-id>" --topic "<focus-topic>"
     ```
   - When contex7-mcp fails, retry with gitmcp:
     ```bash
     docfetch gitmcp "owner/repo" --path docs --topic "<focus-topic>"
     ```
   - Capture timestamps, tool calls, and URLs; you will paste them into the report.
4. **Run local metadata checks**
   - Keep prompt metadata synchronized before recording the report:
     ```bash
     npm run validate:metadata
     npm run build:catalog
     ```
   - Fix any validation errors before proceeding.
5. **Update `DocFetchReport`**
   - Open (or create) `.docfetch/DocFetchReport.json`.
   - Record for each fetch:
     - `tool` (e.g., `contex7-mcp`)
     - `query` or URL
     - `time_utc` when fetched
     - Key guidance or insights
   - Set `status` to `"OK"` only when every required area has at least one up-to-date source. Use `"Docs Missing"` or `"Stale"` if coverage is incomplete.
6. **Capture gaps and follow-ups**
   - If any source could not be retrieved, list it under `DocFetchReport.gaps`. Include remediation notes (e.g., "Retry gitmcp once service resumes").
7. **Validate the gate**
   - Confirm `DocFetchReport.status == "OK"`.
   - Paste a short summary in your working notes or PR description detailing what changed.

## Outcome checklist

- [ ] `DocFetchReport.status` is `"OK"`.
- [ ] All new tool/library areas touched by upcoming work have documented sources.
- [ ] `DocFetchReport.tools_called[]` reflects every MCP lookup.
- [ ] `DocFetchReport.key_guidance[]` links each source to how it informs planned changes.
- [ ] Any unresolved gaps are logged under `DocFetchReport.gaps` with an action plan.

## Remediation if the gate fails

- **Missing sources:** Re-run docfetch with fallback providers. If still missing, escalate in the report and block downstream tasks until resolved.
- **Stale report:** Repeat the fetch sequence; update timestamps and guidance. Do not proceed with planning on a stale report.
- **Validation errors:** Address metadata/catalog issues (`npm run validate:metadata`, `npm run build:catalog`) before re-attempting DocFetch.
- **Infrastructure outages:** Mark `DocFetchReport.status` as `"Docs Missing"`, include outage details, and schedule a re-check within 24 hours.

Only move forward with planning (`/instruction-file`, `/planning-process`) after this checklist is satisfied and `DocFetchReport` shows a clean `"OK"` state.
