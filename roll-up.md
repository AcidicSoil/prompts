# Research Roll-up Summary

Trigger: /roll-up

Purpose: Summarize per-item statuses, enabled decisions, unresolved risks, and count sources by domain type.

Steps:
1. Aggregate Conversation State Updates from prior items.
2. Produce per-item status lines and decisions.
3. Tally sources by domain type: gov, org, docs, blog, news, academic.

Output format:
```
## Roll-up Summary
- Item {n}: {status} — decision enabled: {…}; risks: {…}
- Sources by domain type: {gov:X, org:Y, docs:Z, blog:A, news:B, academic:C}
```

Examples:
- Input: `/roll-up from items 1–3`
- Output: Summary block as above.

Notes:
- Use counts derived from the Evidence Logs.