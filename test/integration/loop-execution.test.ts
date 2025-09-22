import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, test, afterEach } from '@jest/globals';

import { TaskService } from '../../src/mcp/task-service.ts';
import { createRunTaskActionTool } from '../../src/tools/definitions/run-task-action.ts';

describe('Full-loop execution (task action)', () => {
  let tempDir = '';

  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  test('resolve action -> dry-run -> live run (gated)', async () => {
    const service = new TaskService({ tasksPath: '.taskmaster/tasks/tasks.json', tag: 'master', writeEnabled: true });
    await service.load();

    // Pick a ready task (use the new execution wiring task 37)
    const taskId = 37;

    // Create a temp actions file mapping task 37 to a harmless, allowed script
    tempDir = await mkdtemp(join(tmpdir(), 'actions-'));
    const actionsPath = join(tempDir, 'actions.json');
    await writeFile(actionsPath, JSON.stringify({ "37": { script: "noop" } }, null, 2), 'utf8');

    const tool = createRunTaskActionTool(service);

    // Dry run first (does not require exec enable)
    const dry = await tool.handler({ taskId, actionsPath, dryRun: true });
    expect(dry.isError).toBe(false);
    expect(String(dry.summary)).toContain('DRY RUN: npm run --silent noop');

    // Live run gated by env flag
    process.env.PROMPTS_EXEC_ALLOW = '1';
    const live = await tool.handler({ taskId, actionsPath, dryRun: false, timeoutMs: 60_000 });
    expect(live.isError).toBe(false);
    expect(live.ok).toBe(true);
  });
});
