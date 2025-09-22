# Conversation-Aware Research — Batch WBRO

Trigger: /research-batch

Purpose: Process a numbered work-breakdown list of objectives with carry-forward context across items and produce a roll-up summary.

Steps:

1. Parse numbered WBRO items from the input after the trigger.
2. Before Item 1: list ≤5 bullets of starting context.
3. For each item i: execute the per-item workflow and include a Conversation State Update.
4. If blocked by prior gaps, emit **Dependency Blocked** with a minimal micro-query.
5. After all items: emit a Roll-up Summary with per-item status, enabled decisions, unresolved risks, and a domain-type count of sources.

Output format:

- Repeat the single-item format per item.
- End with:

```
## Roll-up Summary
- Item {n}: {status} — decision enabled: {…}; risks: {…}
- Sources by domain type: {gov, org, docs, blog, news}
```

Examples:

- Input: `/research-batch 1) Validate Next.js 15 stability. 2) Compare Bun vs Node for CI. 3) Licensing risks for MIT vs Apache-2.0.`
- Output: Per-item sections plus roll-up.

Notes:

- Keep quotes ≤25 words. Prefer primary docs.
