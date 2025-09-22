import { readFile } from 'node:fs/promises';

import { z } from 'zod';

import type { TaskService } from '../../mcp/task-service.js';
import { createRunScriptTool } from './run-script.js';

const ActionsSchema = z.record(z.string(), z.object({ script: z.string(), args: z.array(z.string()).optional() }));

export const createRunTaskActionTool = (service: TaskService) => ({
  name: 'workflow/run_task_action',
  title: 'Run action mapped to a task id',
  description: 'Resolve an action (script + args) from task metadata or actions.json and execute via run_script.',
  inputSchema: z
    .object({
      taskId: z.number().int().positive(),
      actionsPath: z.string().optional(),
      dryRun: z.boolean().default(false),
      timeoutMs: z.number().int().positive().max(300_000).default(60_000),
    })
    .strict(),
  async handler(raw: unknown) {
    const parsed = this.inputSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        isError: true,
        summary: 'workflow/run_task_action input validation failed',
        issues: parsed.error.flatten(),
      };
    }

    const { taskId, actionsPath, dryRun, timeoutMs } = parsed.data;
    const task = service.get(taskId);
    if (!task) {
      return { isError: true, summary: `Task ${taskId} not found.` };
    }

    // 1) Task metadata action
    const metadata = (task as any).metadata;
    let action: { script: string; args?: string[] } | null = null;
    if (metadata && typeof metadata === 'object' && metadata.action && typeof metadata.action === 'object') {
      const record = metadata.action as { script?: unknown; args?: unknown };
      if (typeof record.script === 'string') {
        action = { script: record.script, args: Array.isArray(record.args) ? (record.args as string[]) : [] };
      }
    }

    // 2) actions.json fallback
    if (!action) {
      const path = actionsPath ?? 'actions.json';
      try {
        const raw = await readFile(path, 'utf8');
        const table = ActionsSchema.parse(JSON.parse(raw));
        const entry = table[String(taskId)];
        if (entry) action = { script: entry.script, args: entry.args };
      } catch {
        // ignore missing/invalid actions file
      }
    }

    if (!action) {
      return { isError: true, summary: `No action mapped for task ${taskId}.` };
    }

    const runScript = createRunScriptTool();
    const result: any = await runScript.handler({
      script: action.script,
      args: action.args ?? [],
      dryRun,
      timeoutMs,
    });
    return {
      isError: Boolean(result.isError),
      summary: `${String(result.summary)} (task ${taskId})`,
      ok: Boolean(result.ok),
      exitCode: typeof result.exitCode === 'number' ? result.exitCode : undefined,
      output: typeof result.output === 'string' ? result.output : undefined,
    };
  },
});
