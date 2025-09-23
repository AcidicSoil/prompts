# Observability & Secure Logging

This project emits structured NDJSON logs to stderr. By default, sensitive fields in log metadata are redacted (keys matching `/key|secret|token/i`).

## CLI flags

- `--verbose`: emit start/end markers and additional structured diagnostics on stderr.
- `--unsafe-logs`: disable metadata redaction (not recommended).

Example:

```bash
prompts next --verbose --tasks .taskmaster/tasks/tasks.json --tag master
```

## Server flags

The MCP server supports the same concepts:

- `--verbose`: emits a `verbose_mode_enabled` line on startup.
- `--unsafe-logs`: disables redaction when creating the secure logger.

Example:

```bash
node dist/mcp/server.js --tasks .taskmaster/tasks/tasks.json --tag master --verbose
```

## Redaction notes

- Redaction only touches log metadata objects; the log message string is not altered.
- Avoid logging full task payloads. Prefer lightweight identifiers or summaries.
- Use `--unsafe-logs` only for local debugging with care.

