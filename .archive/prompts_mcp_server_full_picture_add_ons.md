# Prompts MCP Server — Full Picture Add‑Ons

This extends the minimal skeleton with config, logging, hot reindex, rate limiting, orchestration, and tests.

---

## package.json additions

```diff
  "scripts": {
    "build": "tsc -p .",
    "start": "node dist/index.js",
-   "dev": "tsx watch src/index.ts"
+   "dev": "tsx watch src/index.ts",
+   "test": "vitest run",
+   "test:watch": "vitest"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.5.0",
    "gray-matter": "^4.0.3",
-   "jsonschema": "^1.4.1",
-   "mermaid-js-parser-lite": "^2.0.1"
+   "jsonschema": "^1.4.1",
+   "mermaid-js-parser-lite": "^2.0.1",
+   "chokidar": "^3.6.0",
+   "pino": "^9.4.0"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
-   "typescript": "^5.6.3"
+   "typescript": "^5.6.3",
+   "vitest": "^2.1.3"
  }
```

---

## src/config.ts

```ts
export type Config = {
  root: string;
  timeouts: { toolMs: number; resourceMs: number };
  limits: { maxFileBytes: number; maxOutputChars: number };
  rate: { capacity: number; refillPerSec: number };
  logLevel: 'info' | 'debug' | 'error';
};

export function loadConfig(): Config {
  const env = process.env;
  return {
    root: env.PROMPTS_DIR || process.cwd(),
    timeouts: {
      toolMs: parseInt(env.MCP_TOOL_TIMEOUT_MS || '15000', 10),
      resourceMs: parseInt(env.MCP_RESOURCE_TIMEOUT_MS || '8000', 10)
    },
    limits: {
      maxFileBytes: parseInt(env.MCP_MAX_FILE_BYTES || '524288', 10),
      maxOutputChars: parseInt(env.MCP_MAX_OUTPUT_CHARS || '200000', 10)
    },
    rate: {
      capacity: parseInt(env.MCP_RATE_CAPACITY || '20', 10),
      refillPerSec: parseFloat(env.MCP_RATE_REFILL_PER_SEC || '5')
    },
    logLevel: (env.MCP_LOG_LEVEL as any) || 'info'
  };
}
```

---

## src/log.ts

```ts
import pino from 'pino';
export const log = pino({ level: process.env.MCP_LOG_LEVEL || 'info' });
export type Timer = { start: number; end(): number };
export function timer(): Timer { const t = Date.now(); return { start: t, end: () => Date.now() - t }; }
```

---

## src/rateLimiter.ts

```ts
const buckets = new Map<string, { tokens: number; last: number }>();
export function allow(key: string, capacity: number, refillPerSec: number): boolean {
  const now = Date.now();
  const b = buckets.get(key) || { tokens: capacity, last: now };
  const elapsed = (now - b.last) / 1000;
  b.tokens = Math.min(capacity, b.tokens + elapsed * refillPerSec);
  b.last = now;
  if (b.tokens < 1) { buckets.set(key, b); return false; }
  b.tokens -= 1; buckets.set(key, b); return true;
}
```

---

## src/watcher.ts

```ts
import chokidar from 'chokidar';
import { log } from './log.js';
export function watchDir(dir: string, onChange: () => Promise<void>) {
  const w = chokidar.watch(dir, { ignored: [/node_modules/, /dist/], ignoreInitial: true });
  w.on('all', async (event, path) => {
    log.info({ event, path }, 'fs_change');
    try { await onChange(); } catch (e) { log.error({ err: e }, 'reindex_failed'); }
  });
  return w;
}
```

---

## src/security.ts

```ts
import fs from 'node:fs/promises';
export async function safeRead(path: string, maxBytes: number): Promise<string> {
  const h = await fs.open(path, 'r');
  try {
    const stat = await h.stat();
    if (stat.size > maxBytes) throw new Error(`file too large: ${stat.size} > ${maxBytes}`);
    const buf = Buffer.alloc(stat.size);
    await h.read(buf, 0, stat.size, 0);
    return buf.toString('utf8');
  } finally {
    await h.close();
  }
}
export function capOutput(s: string, maxChars: number): string {
  if (s.length <= maxChars) return s;
  const msg = `\n\n[truncated output: ${s.length} chars > limit]`;
  return s.slice(0, maxChars) + msg;
}
```

---

## src/orchestrate.ts

```ts
import type { IndexedPrompt } from './types.js';
import { fillTemplate } from './indexer.js';
export function orchestrateFlow(start: string, next: (from: string)=>Promise<string[]>, prompts: IndexedPrompt[], args: Record<string, unknown>) {
  const seen = new Set<string>();
  async function dfs(node: string, acc: string[]): Promise<string[]> {
    if (seen.has(node)) return acc; seen.add(node);
    const p = prompts.find(x => x.name === node);
    if (p) {
      const rendered = p.messages.map(m => fillTemplate(m.content, args)).join('\n\n');
      acc.push(`## ${p.name}\n\n${rendered}`);
    }
    const outs = await next(node);
    for (const n of outs) await dfs(n, acc);
    return acc;
  }
  return dfs(start, []).then(parts => parts.join('\n\n---\n\n'));
}
```

---

## src/index.ts changes

```diff
+import { loadConfig } from './config.js';
+import { log, timer } from './log.js';
+import { allow } from './rateLimiter.js';
+import { watchDir } from './watcher.js';
+import { capOutput } from './security.js';
+import { orchestrateFlow } from './orchestrate.js';
-const ROOT = process.env.PROMPTS_DIR || path.resolve(process.cwd());
+const cfg = loadConfig();
+const ROOT = cfg.root;
 await bootstrap();
+watchDir(ROOT, bootstrap);
 server.setRequestHandler("tools/list", async () => ({
   tools: [
     { name: "list_triggers", description: "List '/slash' triggers discovered in markdown", inputSchema: { type: "object", properties: {} } },
     { name: "run_prompt", description: "Render a prompt by name with {{vars}}", inputSchema: { type: "object", required: ["name"], properties: { name: { type: "string" }, args: { type: "object", additionalProperties: true } } } },
     { name: "next_steps", description: "Return outgoing nodes from workflow.mmd", inputSchema: { type: "object", required: ["from"], properties: { from: { type: "string" } } } },
     { name: "grep_prompts", description: "Search prompt texts", inputSchema: { type: "object", required: ["query"], properties: { query: { type: "string" } } } },
+    { name: "refresh_index", description: "Reindex prompt files", inputSchema: { type: "object", properties: {} } },
+    { name: "orchestrate_flow", description: "Walk workflow.mmd from a node and emit a stitched plan", inputSchema: { type: "object", required: ["start"], properties: { start: { type: "string" }, args: { type: "object", additionalProperties: true } } } }
   ]
 }));
 server.setRequestHandler("tools/call", async (req) => {
   const { name, arguments: args } = req.params;
+  const t = timer();
+  if (!allow(name, cfg.rate.capacity, cfg.rate.refillPerSec)) return { content: [{ type: 'text', text: 'rate_limited' }] };
   if (name === "list_triggers") {
     const entries = PROMPTS.map(p => { const m = p.raw.match(/^\s*Trigger:\s*(\/\S+)/mi); return m ? { trigger: m[1], prompt: p.name } : null; }).filter(Boolean);
-    return { content: [{ type: "text", text: JSON.stringify({ triggers: entries }, null, 2) }] };
+    const out = JSON.stringify({ triggers: entries }, null, 2); log.info({ tool: name, ms: t.end(), size: out.length }, 'tool_done'); return { content: [{ type: "text", text: capOutput(out, cfg.limits.maxOutputChars) }] };
   }
   if (name === "run_prompt") {
     const key = String((args as any)?.name || "");
     const p = PROMPTS.find(x => x.name === key);
     if (!p) throw new Error(`Unknown prompt: ${key}`);
     const rendered = p.messages.map(m => fillTemplate(m.content, (args as any)?.args || {})).join("\n\n");
-    return { content: [{ type: "text", text: rendered }] };
+    log.info({ tool: name, ms: t.end(), chars: rendered.length }, 'tool_done'); return { content: [{ type: "text", text: capOutput(rendered, cfg.limits.maxOutputChars) }] };
   }
   if (name === "next_steps") {
     const from = String((args as any)?.from || "");
     const next = await nextFrom(ROOT, from);
-    return { content: [{ type: "text", text: JSON.stringify({ from, next }, null, 2) }] };
+    const out = JSON.stringify({ from, next }, null, 2); log.info({ tool: name, ms: t.end() }, 'tool_done'); return { content: [{ type: "text", text: out }] };
   }
   if (name === "grep_prompts") {
     const q = String((args as any)?.query || "").toLowerCase();
     const hits = PROMPTS.map(p => ({ name: p.name, match: p.raw.toLowerCase().includes(q) })).filter(h => h.match).map(h => h.name);
-    return { content: [{ type: "text", text: JSON.stringify({ query: q, results: hits }, null, 2) }] };
+    const out = JSON.stringify({ query: q, results: hits }, null, 2); log.info({ tool: name, ms: t.end(), results: hits.length }, 'tool_done'); return { content: [{ type: "text", text: out }] };
   }
+  if (name === 'refresh_index') { await bootstrap(); log.info({ tool: name, ms: t.end(), count: PROMPTS.length }, 'tool_done'); return { content: [{ type: 'text', text: JSON.stringify({ prompts: PROMPTS.length }) }] }; }
+  if (name === 'orchestrate_flow') { const start = String((args as any)?.start || ''); const a = (args as any)?.args || {}; const plan = await orchestrateFlow(start, (n)=> nextFrom(ROOT, n), PROMPTS, a); log.info({ tool: name, ms: t.end(), chars: plan.length }, 'tool_done'); return { content: [{ type: 'text', text: capOutput(plan, cfg.limits.maxOutputChars) }] }; }
   throw new Error(`Unknown tool: ${name}`);
 });
 async function bootstrap() { PROMPTS = await indexRepo(ROOT); }
```

---

## tests/basic.test.ts

```ts
import { describe, it, expect } from 'vitest';
import { fillTemplate } from '../src/indexer.js';

describe('templating', () => {
  it('fills known vars and blanks missing', () => {
    const out = fillTemplate('Hello {{name}} {{x}}', { name: 'Ada' });
    expect(out).toBe('Hello Ada ');
  });
});
```

---

## tests/mermaid.test.ts

```ts
import { describe, it, expect } from 'vitest';
import { nextFrom } from '../src/mermaid.js';
import fs from 'node:fs/promises';

it('returns [] when workflow.mmd missing', async () => {
  const tmp = await fs.mkdtemp('mmd-');
  const out = await nextFrom(tmp, 'A');
  expect(out).toEqual([]);
});
```

---

## Operational tips

- Set `MCP_MAX_FILE_BYTES` and `MCP_MAX_OUTPUT_CHARS` for guardrails.
- Use `MCP_RATE_*` to protect hosts from bursty tool calls.
- Enable file watching to keep the host’s prompt catalog fresh.
- Log to JSONL and ship to your aggregator of choice.

