# Prompts MCP Server Roadmap

## Goal

- Deliver a production-ready prompts MCP server with rate limits, logging, hot reindex, and tests.

## User Story

- As a prompt operations engineer, I need a reliable MCP server
  so I can curate prompts safely at scale.

## Milestones

1. Minimal server skeleton compiles, loads prompts, and exposes core MCP tools.
2. Operational hardening in place: config, logging, rate limits, hot reindex, orchestration.
3. Test and validation suite covers templating, mermaid parsing, and service smoke tests.

## Tasks

- [ ] Owner: @backend (~6h) - Implement config loader `src/config.ts`.
      AC: env vars override defaults and fall back to cwd when unset.
- [ ] Owner: @backend (~4h) - Integrate pino logger and timers in `src/log.ts`.
      AC: emits JSON entries with duration ms on tool completion.
- [ ] Owner: @backend (~5h) - Add token bucket limiter `src/rateLimiter.ts`.
      AC: rejects bursts beyond capacity and refills over time.
- [ ] Owner: @backend (~5h) - Wire watcher + bootstrap in `src/index.ts`.
      AC: editing prompt invalidates index and reloads without restart.
- [ ] Owner: @backend (~6h) - Expand tool handlers in `src/index.ts`.
      AC: outputs capped, timings logged, rate-limited calls return sentinel.
- [ ] Owner: @backend (~4h) - Ship orchestrator in `src/orchestrate.ts`.
      AC: DFS joins prompts into stitched Markdown plan.
- [ ] Owner: @backend (~3h) - Harden safeRead + capOutput in `src/security.ts`.
      AC: rejects oversize files and truncates long payloads with notice.
- [ ] Owner: @devops (~3h) - Update `package.json`, `tsconfig.json`.
      AC: build, dev, test scripts and vitest dep resolve without warnings.
- [ ] Owner: @qa (~4h) - Add vitest suites under `tests/`.
      AC: `npm test` passes locally and in CI baseline.
- [ ] Owner: @docs (~2h) - Refresh README runbook.
      AC: env vars, tools, and run instructions documented with examples.

## Won't do

- Deploy infrastructure automation or container images in this iteration.
- Build a GUI or web front end for prompt management.
- Introduce persistence beyond local prompt files.

## Ideas for later

- Add analytics hooks to ship structured metrics to observability backends.
- Support remote prompt stores (S3, Git) with sync strategies.
- Provide CLI scaffolding for creating new prompt packs.

## Validation

- Run `npm run build`, `npm test`, and smoke exercise `node dist/index.js` per milestone.
- Confirm watcher reload by editing a prompt and observing log entry within 2s.
- Verify rate limiting by issuing >capacity calls and receiving `rate_limited` response.

## Risks

- File watcher may fail on platforms without inotify; need cross-platform testing.
- Rate limiter state may grow unbounded if key space not pruned.
- Large prompt catalogs could exceed memory; monitor index sizing.
