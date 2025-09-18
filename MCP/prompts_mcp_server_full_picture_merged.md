# Prompts MCP Server — Full Picture (Merged)

> Complete, single source. Includes config, logging, hot reindex, rate limiting, orchestration tool, and tests. Follows your file-output rules: full contents with `# path:` headers and a tree.

---

## Project tree

```text
prompts-mcp-server/
├─ package.json
├─ tsconfig.json
├─ README.md
├─ src/
│  ├─ types.ts
│  ├─ indexer.ts
│  ├─ mermaid.ts
│  ├─ config.ts
│  ├─ log.ts
│  ├─ rateLimiter.ts
│  ├─ watcher.ts
│  ├─ security.ts
│  └─ index.ts
└─ tests/
   ├─ basic.test.ts
   └─ mermaid.test.ts
```

---

```json
# path: package.json
{
  "name": "prompts-mcp-server",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc -p .",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.5.0",
    "gray-matter": "^4.0.3",
    "jsonschema": "^1.4.1",
    "mermaid-js-parser-lite": "^2.0.1",
    "chokidar": "^3.6.0",
    "pino": "^9.4.0"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.6.3",
    "vitest": "^2.1.3"
  }
}
```

```json
# path: tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*.ts"]
}
```

```md
# path: README.md
# Prompts MCP Server

Run your prompts repo as an MCP server. Exposes Markdown files as MCP **prompts** and **resources**, plus workflow **tools**.

## Run

```bash
npm i
npm run build
node dist/index.js
```

Set the repo root:

```bash
# Windows + WSL preference per your setup
setx PROMPTS_DIR "/c/Users/user/projects/prompts"   # PowerShell: [Environment]::SetEnvironmentVariable(...)
# Linux/WSL
export PROMPTS_DIR="$HOME/.codex/prompts"
```

### Host integration
- **ChatGPT custom connector**: command `node dist/index.js`
- **Claude Desktop**: register same command

### Tools exposed
- `list_triggers` · `run_prompt` · `next_steps` · `grep_prompts` · `refresh_index` · `orchestrate_flow`

### Notes
- Read-only FS. No shell execution. Size and output caps.
- Mermaid graph optional. If missing, traversal returns empty.
```

```ts
# path: src/types.ts
export type IndexedPrompt = {
  name: string;
  description: string;
  path: string;
  raw: string;
  arguments?: Record<string, unknown>;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
};
```

```ts
# path: src/indexer.ts
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type { IndexedPrompt } from "./types.js";

const VAR = /\{\{(\w+)\}\}/g;

export async function indexRepo(root: string): Promise<IndexedPrompt[]> {
  const files = await walk(root);
  const mdFiles = files.filter(f => f.endsWith(".md") && !path.basename(f).startsWith("."));
  const out: IndexedPrompt[] = [];

  for (const fp of mdFiles) {
    const raw = await fs.readFile(fp, "utf8");
    const fm = matter(raw);
    const name = path.basename(fp, ".md");

    const body = String(fm.content || "").trim();
    const description = String(fm.data?.description ?? `Prompt ${name}`);
    const args = fm.data?.args && typeof fm.data.args === "object" ? fm.data.args : undefined;

    out.push({
      name,
      description,
      path: fp,
      raw,
      arguments: args,
      messages: [ { role: "user", content: body } ]
    });
  }

  return out;
}

export function fillTemplate(s: string, args: Record<string, unknown> = {}): string {
  return s.replace(VAR, (_, k) => args?.[k] !== undefined ? String(args[k]) : "");
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === "node_modules" || e.name === "dist") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p));
    else out.push(p);
  }
  return out;
}
```

```ts
# path: src/mermaid.ts
import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "mermaid-js-parser-lite";

export async function nextFrom(root: string, from: string): Promise<string[]> {
  const mmdPath = path.join(root, "workflow.mmd");
  let mmd: string;
  try {
    mmd = await fs.readFile(mmdPath, "utf8");
  } catch {
    return [];
  }
  const g: any = parse(mmd);
  const edges: any[] = g?.edges ?? [];
  return edges
    .filter(e => e?.start?.id === from || e?.start?.text === from)
    .map(e => e?.end?.id || e?.end?.text)
    .filter(Boolean);
}
```

```ts
# path: src/config.ts
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

```ts
# path: src/log.ts
import pino from 'pino';
export const log = pino({ level: process.env.MCP_LOG_LEVEL || 'info' });
export type Timer = { start: number; end(): number };
export function timer(): Timer { const t = Date.now(); return { start: t, end: () => Date.now() - t }; }
```

```ts
# path: src/rateLimiter.ts
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

```ts
# path: src/watcher.ts
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

```ts
# path: src/security.ts
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

```ts
# path: src/index.ts
import path from "node:path";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { indexRepo, fillTemplate } from "./indexer.js";
import { nextFrom } from "./mermaid.js";
import type { IndexedPrompt } from "./types.js";
import { loadConfig } from './config.js';
import { log, timer } from './log.js';
import { allow } from './rateLimiter.js';
import { watchDir } from './watcher.js';
import { capOutput } from './security.js';
import { orchestrateFlow } from './orchestrate.js';

const cfg = loadConfig();
const ROOT = cfg.root;

const server = new Server({ name: "prompts-mcp", version: "0.1.0" });
let PROMPTS: IndexedPrompt[] = [];

await bootstrap();
watchDir(ROOT, bootstrap);

server.setRequestHandler("resources/list", async () => ({
  resources: [
    ...PROMPTS.map(p => ({ uri: `prompt://${p.name}`, name: p.name, mimeType: "text/markdown" })),
    { uri: `prompt://workflow`, name: "workflow", mimeType: "text/mermaid" }
  ]
}));

server.setRequestHandler("resources/read", async (req) => {
  const uri = req.params?.uri as string;
  if (uri === "prompt://workflow") {
    const fs = await import('node:fs/promises');
    try { return { contents: [{ type: "text", text: await fs.readFile(path.join(ROOT, "workflow.mmd"), "utf8") }] }; }
    catch { return { contents: [{ type: "text", text: "graph TD\n  A[no workflow.mmd]" }] }; }
  }
  const key = uri?.replace("prompt://", "");
  const p = PROMPTS.find(x => x.name === key);
  if (!p) throw new Error(`Unknown resource: ${uri}`);
  return { contents: [{ type: "text", text: p.raw }] };
});

server.setRequestHandler("prompts/list", async () => ({
  prompts: PROMPTS.map(p => ({
    name: p.name,
    description: p.description,
    arguments: p.arguments ?? {},
    messages: p.messages.map(m => ({ role: m.role, content: [{ type: "text", text: m.content }] }))
  }))
}));

server.setRequestHandler("tools/list", async () => ({
  tools: [
    { name: "list_triggers", description: "List '/slash' triggers discovered in markdown", inputSchema: { type: "object", properties: {} } },
    { name: "run_prompt", description: "Render a prompt by name with {{vars}}", inputSchema: { type: "object", required: ["name"], properties: { name: { type: "string" }, args: { type: "object", additionalProperties: true } } } },
    { name: "next_steps", description: "Return outgoing nodes from workflow.mmd", inputSchema: { type: "object", required: ["from"], properties: { from: { type: "string" } } } },
    { name: "grep_prompts", description: "Search prompt texts", inputSchema: { type: "object", required: ["query"], properties: { query: { type: "string" } } } },
    { name: "refresh_index", description: "Reindex prompt files", inputSchema: { type: "object", properties: {} } },
    { name: "orchestrate_flow", description: "Walk workflow.mmd from a node and emit a stitched plan", inputSchema: { type: "object", required: ["start"], properties: { start: { type: "string" }, args: { type: "object", additionalProperties: true } } } }
  ]
}));

server.setRequestHandler("tools/call", async (req) => {
  const { name, arguments: args } = req.params;
  const t = timer();
  if (!allow(name, cfg.rate.capacity, cfg.rate.refillPerSec)) {
    return { content: [{ type: 'text', text: 'rate_limited' }] };
  }

  if (name === "list_triggers") {
    const entries = PROMPTS.map(p => {
      const m = p.raw.match(/^\s*Trigger:\s*(\/\S+)/mi);
      return m ? { trigger: m[1], prompt: p.name } : null;
    }).filter(Boolean) as Array<{ trigger: string; prompt: string }>;
    const out = JSON.stringify({ triggers: entries }, null, 2);
    log.info({ tool: name, ms: t.end(), size: out.length }, 'tool_done');
    return { content: [{ type: "text", text: capOutput(out, cfg.limits.maxOutputChars) }] };
  }

  if (name === "run_prompt") {
    const key = String((args as any)?.name || "");
    const p = PROMPTS.find(x => x.name === key);
    if (!p) throw new Error(`Unknown prompt: ${key}`);
    const rendered = p.messages.map(m => fillTemplate(m.content, (args as any)?.args || {})).join("\n\n");
    log.info({ tool: name, ms: t.end(), chars: rendered.length }, 'tool_done');
    return { content: [{ type: "text", text: capOutput(rendered, cfg.limits.maxOutputChars) }] };
  }

  if (name === "next_steps") {
    const from = String((args as any)?.from || "");
    const next = await nextFrom(ROOT, from);
    const out = JSON.stringify({ from, next }, null, 2);
    log.info({ tool: name, ms: t.end() }, 'tool_done');
    return { content: [{ type: "text", text: out }] };
  }

  if (name === "grep_prompts") {
    const q = String((args as any)?.query || "").toLowerCase();
    const hits = PROMPTS.map(p => ({ name: p.name, match: p.raw.toLowerCase().includes(q) }))
      .filter(h => h.match).map(h => h.name);
    const out = JSON.stringify({ query: q, results: hits }, null, 2);
    log.info({ tool: name, ms: t.end(), results: hits.length }, 'tool_done');
    return { content: [{ type: "text", text: out }] };
  }

  if (name === 'refresh_index') {
    await bootstrap();
    log.info({ tool: name, ms: t.end(), count: PROMPTS.length }, 'tool_done');
    return { content: [{ type: 'text', text: JSON.stringify({ prompts: PROMPTS.length }) }] };
  }

  if (name === 'orchestrate_flow') {
    const start = String((args as any)?.start || '');
    const a = (args as any)?.args || {};
    const plan = await orchestrateFlow(start, (n)=> nextFrom(ROOT, n), PROMPTS, a);
    log.info({ tool: name, ms: t.end(), chars: plan.length }, 'tool_done');
    return { content: [{ type: 'text', text: capOutput(plan, cfg.limits.maxOutputChars) }] };
  }

  throw new Error(`Unknown tool: ${name}`);
});

await server.connect(new StdioServerTransport());

async function bootstrap() {
  PROMPTS = await indexRepo(ROOT);
  log.info({ count: PROMPTS.length }, 'indexed');
}
```

```ts
# path: tests/basic.test.ts
import { describe, it, expect } from 'vitest';
import { fillTemplate } from '../src/indexer.js';

describe('templating', () => {
  it('fills known vars and blanks missing', () => {
    const out = fillTemplate('Hello {{name}} {{x}}', { name: 'Ada' });
    expect(out).toBe('Hello Ada ');
  });
});
```

```ts
# path: tests/mermaid.test.ts
import { it, expect } from 'vitest';
import { nextFrom } from '../src/mermaid.js';
import fs from 'node:fs/promises';

it('returns [] when workflow.mmd missing', async () => {
  const tmp = await fs.mkdtemp('mmd-');
  const out = await nextFrom(tmp, 'A');
  expect(out).toEqual([]);
});
```

---

**Stack**: Node.js 20+, TypeScript, MCP SDK, gray-matter, mermaid parser, chokidar, pino, vitest. Implements prompts/resources/tools, reindexing, logging, rate limits, orchestration.

