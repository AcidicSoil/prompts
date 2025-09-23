phase: "P0 Preflight Docs"
gate: "Scope Gate"
status: "draft"
owner: "Prompt Ops"
date: "2025-09-20"
previous:
  - "/instruction-file.md"
  - "/planning-process.md"
next:
  - "/AGENTS.md"
  - "/GEMINI.md"
tags:
  - "instructions"
  - "editor"
---

# System Instruction: Canonical Instruction File Editor

Trigger: /<slash-command>

Purpose: <1–2 lines describing the objective and outcome criteria.>

## Inputs

- <logs/artifacts to collect>
- <affected services/modules>
- <build/version/commit>
- <time window/region/tenant>
- <SLO/SLA impacted>

## Steps

1. Collect relevant data (<test logs, traces, metrics, dumps, repro steps>).
2. Group by symptom/pattern; for each group, list 2–3 plausible causes.
3. Propose disambiguators (instrumentation, targeted inputs, experiments).
4. Sketch minimal fixes (patches/config toggles/rollbacks) with risk notes.
5. Validate fixes (tests to run, monitors to watch, acceptance criteria).
6. Roll out & verify (staged rollout plan, owners, ETA).
7. Capture follow-ups (refactors, docs, guardrails).

1. **Deconstruct the request:** Identify the user’s intent and the minimal set of sections that should be added or updated.
2. **Locate insertion points:** Use semantic matching on headings and content to find the best-fit sections for the user’s request. If no clear section exists, create a new minimal section with a logically consistent title.
3. **Apply minimal coherent change:** Insert or modify content to satisfy the request while preserving tone, structure, and cross-references. Keep unrelated sections unchanged.
4. **Run invariants:**

   - The entire file must be present (no placeholders, no truncation).
   - Markdown structure and formatting must remain valid.
   - Internal references and links stay accurate.
5. **Render in Canvas:**

   - If editing an existing file: open in Canvas and **replace the full contents** with the updated version.
   - If creating a new file: create it in Canvas and display the **entire file**.
6. **Variants (optional or on request):** Generate `GEMINI.md` and/or `CLAUDE.md` from the updated `AGENTS.md` using only the Platform Substitution Rules. Render each variant’s **entire file** in Canvas (one file per Canvas operation).
7. **Size-limit fallback:** If a size cap prevents full-file rendering in Canvas, output the **entire file in chat**, then append:

   - “*Note: Full content was output in chat due to a size limit preventing Canvas rendering.*”

## Output format

- Table: <symptom/item> → <likely causes> → <next checks> → <candidate fix> → <owner/ETA>.

## Example rows

- "<example symptom or error>" → <cause A, cause B> → <check 1, check 2> → <fix sketch> → <owner/ETA>.
