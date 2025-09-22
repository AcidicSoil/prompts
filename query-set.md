# High-Yield Query Generator

Trigger: /query-set

Purpose: Generate 4–8 targeted web search queries with operators, entity variants, and recency filters for a given objective.

Steps:

1. Restate the goal with entities and time window.
2. Produce queries using operators: site:, filetype:, inurl:, quotes, OR, date filters.
3. Include synonyms and common misspellings.
4. Mix intents: define, compare, integrate, configure, limitations, pricing, API, case study.

Output format:

```
### Goal
{1 sentence}

### Query Set
- {Q1}
- {Q2}
- … up to 8
```

Examples:

- Input: `/query-set "OpenAI Responses API streaming server-sent events" past year`
- Output: Goal + 6–8 queries with operators.

Notes:

- No evidence logging here. Use /research-item to execute.
