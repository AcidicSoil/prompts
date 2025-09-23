import { mkdtemp, writeFile, rm, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, test, afterEach } from '@jest/globals';

import { TaskService } from '../../src/mcp/task-service.ts';
import { createRunTaskActionTool } from '../../src/tools/definitions/run-task-action.ts';

const createTempService = async (doc: unknown) => {
  const dir = await mkdtemp(join(tmpdir(), 'run-task-action-err-'));
  const tasksPath = join(dir, 'tasks.json');
  await writeFile(tasksPath, JSON.stringify(doc, null, 2), 'utf8');
  const service = new TaskService({ tasksPath, tag: 'master', writeEnabled: false });
  await service.load();
  return { dir, service } as const;
};

describe('workflow_run_task_action error cases', () => {
  let tempDir = '';

  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  test('returns error when no mapping exists (no metadata, no actions.json)', async () => {
    const doc = {
      master: {
        tasks: [
          {
            id: 1,
            title: 'T1',
            description: '',
            status: 'pending',
            dependencies: [],
            priority: 'medium',
            details: '',
            testStrategy: '',
            subtasks: [],
          },
        ],
      },
    };
    const temp = await createTempService(doc);
    tempDir = temp.dir;

    const tool = createRunTaskActionTool(temp.service);
    const res = await tool.handler({ taskId: 1, dryRun: true });
    expect(res.isError).toBe(true);
    expect(String(res.summary)).toMatch(/No action mapped/i);
  });

  test('ignores invalid actions.json and returns a clear error', async () => {
    const doc = {
      master: {
        tasks: [
          {
            id: 2,
            title: 'T2',
            description: '',
            status: 'pending',
            dependencies: [],
            priority: 'low',
            details: '',
            testStrategy: '',
            subtasks: [],
          },
        ],
      },
    };
    const temp = await createTempService(doc);
    tempDir = temp.dir;
    const badPath = join(temp.dir, 'actions.bad.json');
    await writeFile(badPath, '{"oops": ', 'utf8'); // intentionally invalid JSON

    const tool = createRunTaskActionTool(temp.service);
    const res = await tool.handler({ taskId: 2, actionsPath: badPath, dryRun: true });
    expect(res.isError).toBe(true);
    expect(String(res.summary)).toMatch(/No action mapped/i);
  });

  test('falls back to actions.json when metadata.action is malformed', async () => {
    const doc = {
      master: {
        tasks: [
          {
            id: 3,
            title: 'T3',
            description: '',
            status: 'pending',
            dependencies: [],
            priority: 'medium',
            details: '',
            testStrategy: '',
            subtasks: [],
            metadata: { action: { script: 123, args: 'nope' } }, // malformed
          },
        ],
      },
    } as any;
    const temp = await createTempService(doc);
    tempDir = temp.dir;

    // Provide a valid mapping via actions.json
    const actionsPath = join(temp.dir, 'actions.json');
    await writeFile(actionsPath, JSON.stringify({ '3': { script: 'noop' } }, null, 2), 'utf8');

    const tool = createRunTaskActionTool(temp.service);
    const res = await tool.handler({ taskId: 3, actionsPath, dryRun: true });
    expect(res.isError).toBe(false);
    expect(String(res.summary)).toMatch(/DRY RUN: npm run --silent noop/);
  });
});
