# Conversation-Aware Research — Single Item

Trigger: /research-item

Purpose: Run the full per-item research workflow for one objective and return queries, evidence, synthesis, contradictions, gaps, decision hook, plus a conversation state update.

Steps:
1. Read the objective text following the trigger.
2. Capture starting context if provided.
3. Apply the Process (per item): Goal, Assumptions, Query Set (4–8), Search Plan, Run & Capture, Cross-check, Synthesis, Gaps & Next, Decision Hook.
4. Track PubDate and Accessed (ISO) for every source; prefer primary docs.
5. Enforce quotes ≤25 words; mark inferences as "Inference".

Output format:
```
## Item 1: {short title}

### Goal
{1 sentence}

### Assumptions
- {only if needed}

### Query Set
- {Q1}
- {Q2}
- {Q3}
- {Q4–Q8}

### Evidence Log
| SourceID | Title | Publisher | URL | PubDate | Accessed | Quote (≤25w) | Finding | Rel | Conf |
|---|---|---|---|---|---|---|---|---|---|

### Synthesis
- {claim with [S1,S3]}
- {finding with [S2]}
- {risk/edge with [S4]}

### Contradictions
- {S2 vs S5 → rationale}

### Gaps & Next
- {follow-up or test}

### Decision Hook
{one line}

### Conversation State Update
- New facts: {bullets}
- Constraints learned: {bullets}
- Entities normalized: {canonical forms}
```

Examples:
- Input: `/research-item Compare OpenAPI 3.1 tooling for Python clients in 2024; budget $0; prefer official docs.`
- Output: As per format with SourceIDs and dates.

Notes:
- Safety: No personal data. Do not fabricate sources.
- Provenance: Cite reputable sources; record n/a for missing PubDate.