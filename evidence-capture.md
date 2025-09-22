# Evidence Logger

Trigger: /evidence-capture

Purpose: Capture sources for a specified claim with dates, ≤25-word quotes, findings, relevance, and confidence.

Steps:

1. Read the claim text and optional URLs provided.
2. For each source, record metadata and a ≤25-word quote.
3. Add a brief Finding, Relevance (H/M/L), and Confidence (0.0–1.0).

Output format:

```
### Evidence Log
| SourceID | Title | Publisher | URL | PubDate | Accessed | Quote (≤25w) | Finding | Rel | Conf |
|---|---|---|---|---|---|---|---|---|---|
```

Examples:

- Input: `/evidence-capture "Next.js 15 requires React 19 RC"` with official links.
- Output: Evidence table entries with dates.

Notes:

- Mark missing PubDate as n/a. Prefer official documentation.
