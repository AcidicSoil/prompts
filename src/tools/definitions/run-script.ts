import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

import { z } from 'zod';

const require = createRequire(import.meta.url);
const packageJson = require('../../../package.json') as { mcpAllowScripts?: string[] };

export const createRunScriptTool = () => ({
  name: 'workflow_run_script',
  title: 'Run an allowed package script',
  description:
    'Execute an allowed script from package.json in a sandboxed way. Disabled unless PROMPTS_EXEC_ALLOW=1 and script is allowlisted under package.json#mcpAllowScripts.',
  inputSchema: z
    .object({
      script: z.string(),
      args: z.array(z.string()).optional(),
      timeoutMs: z.number().int().positive().max(300_000).default(60_000),
      dryRun: z.boolean().default(false),
    })
    .strict(),
  async handler(raw: unknown) {
    const parsed = this.inputSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        isError: true,
        summary: 'workflow_run_script input validation failed',
        issues: parsed.error.flatten(),
      };
    }
    const { script, args = [], timeoutMs, dryRun } = parsed.data;

    const allowed = new Set(packageJson.mcpAllowScripts ?? []);
    if (!allowed.has(script)) {
      return {
        isError: true,
        summary: `Script not allowed: ${script}. Add to package.json#mcpAllowScripts to permit.`,
        allowed: Array.from(allowed),
      };
    }

    if (dryRun) {
      return {
        isError: false,
        summary: `DRY RUN: npm run --silent ${script} ${args.join(' ')}`.trim(),
        ok: true,
      };
    }

    if (process.env.PROMPTS_EXEC_ALLOW !== '1') {
      return {
        isError: true,
        summary:
          'Execution disabled. Set PROMPTS_EXEC_ALLOW=1 and restart the server to enable workflow_run_script.',
      };
    }

    const stdio: Buffer[] = [];
    const child = spawn('npm', ['run', '--silent', script, ...args], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, timeoutMs);

    return await new Promise((resolve) => {
      child.stdout.on('data', (chunk) => stdio.push(Buffer.from(chunk)));
      child.stderr.on('data', (chunk) => stdio.push(Buffer.from(chunk)));
      child.on('error', (err) => {
        clearTimeout(timer);
        resolve({
          isError: true,
          summary: `Failed to start process: ${err?.message ?? 'spawn error'}`,
          ok: false,
          exitCode: -1,
          output: stdio.length ? Buffer.concat(stdio).toString('utf8') : '',
        });
      });
      child.on('close', (code) => {
        clearTimeout(timer);
        resolve({
          isError: code !== 0 || timedOut,
          summary: timedOut
            ? `Timed out after ${timeoutMs} ms`
            : `Exited with code ${code ?? -1}`,
          ok: !timedOut && code === 0,
          exitCode: code ?? -1,
          output: stdio.length ? Buffer.concat(stdio).toString('utf8') : '',
        });
      });
    });
  },
});
