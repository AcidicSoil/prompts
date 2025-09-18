# PRD Generator
Trigger: /prd-generate
Purpose: Produce a complete `prd.txt` in the exact section order, headers, and tone of the inline example PRD using only the repository README and visible link texts.
Steps:

1. Read `README.md` at repo root; do not fetch external links.
2. Extract: product name, problem, target users, value, scope, constraints, features, flows, integrations, data, non-functional needs, risks.
3. If links exist, include their visible text or titles only as contextual hints.
4. Fill gaps with conservative assumptions to keep the PRD complete; collect assumptions for the Appendix.
5. Enforce strict structure identical to the example PRD’s top-level headers and order.
6. For each core feature, include What, Why, High-level How, and Acceptance criteria.
7. In Technical Architecture, document optional platform-specific features and required fallbacks; mirror related risks.
8. In Development Roadmap, group by phases (MVP and later); include acceptance criteria; exclude timelines.
9. In Logical Dependency Chain, order from foundations to visible value; keep items atomic.
10. Run an internal consistency check: features appear in roadmap; risks reflect platform and data concerns; all sections non-empty.
11. Output only the final `prd.txt` content starting with `# Overview` and ending with `# Appendix`.
Output format:

- Plain text PRD starting with `# Overview` and ending with `# Appendix`.
- No preamble, no postscript, no meta commentary.
Notes:
- Reject generation if `README.md` is missing.
- Do not browse external sources.
- Derived from example_prd.txt, extracted summaries only; secrets redacted.
