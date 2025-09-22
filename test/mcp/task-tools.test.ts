import { mkdtemp, copyFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test, beforeEach, afterEach } from '@jest/globals';

import { buildTaskToolDefinitions } from '../../src/tools/task-tools.ts';
import { TaskService } from '../../src/mcp/task-service.ts';
import { createSecureLogger, logger as baseLogger } from '../../src/logger.ts';

const secureLogger = createSecureLogger(baseLogger);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FIXTURE_DIR = resolve(__dirname, '../../tests/fixtures/taskmaster');
const SIMPLE_FIXTURE = join(FIXTURE_DIR, 'simple-tasks.json');

const createTempService = async (writeEnabled: boolean) => {
  const dir = await mkdtemp(join(tmpdir(), 'task-tools-'));
  const tasksPath = join(dir, 'tasks.json');
  await copyFile(SIMPLE_FIXTURE, tasksPath);
  const service = new TaskService({ tasksPath, tag: 'master', writeEnabled });
  await service.load();
  return { dir, service };
};

describe('task tools', () => {
  let tempDir: string;

  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  const getTool = (tools: ReturnType<typeof buildTaskToolDefinitions>, name: string) =>
    tools.find((tool) => tool.name === name);

  test('next_task returns ready task payload', async () => {
    const temp = await createTempService(false);
    tempDir = temp.dir;

    const tools = buildTaskToolDefinitions({ service: temp.service, logger: secureLogger });
    const nextTaskTool = getTool(tools, 'next_task');
    expect(nextTaskTool).toBeDefined();

    const result = await nextTaskTool!.handler();
    expect(result.structuredResult).toMatchObject({ task: { id: 1 } });

    const listTool = getTool(tools, 'list_tasks');
    expect(listTool).toBeDefined();
    const listResult = await listTool!.handler();
    expect(listResult.structuredResult).toMatchObject({ tasks: expect.any(Array) });

    const getToolHandler = getTool(tools, 'get_task');
    expect(getToolHandler).toBeDefined();
    const getResult = await getToolHandler!.handler({ id: 1 });
    expect(getResult.structuredResult).toMatchObject({ task: { id: 1 } });

    const graphTool = getTool(tools, 'graph_export');
    expect(graphTool).toBeDefined();
    const graphResult = await graphTool!.handler();
    expect(graphResult.structuredResult).toMatchObject({ nodes: expect.any(Array) });
  });

  test('set_task_status honours write mode switch', async () => {
    const temp = await createTempService(false);
    tempDir = temp.dir;

    const tools = buildTaskToolDefinitions({ service: temp.service, logger: secureLogger });
    const setStatusTool = tools.find((tool) => tool.name === 'set_task_status');
    expect(setStatusTool).toBeDefined();

    const readOnlyResult = await setStatusTool!.handler({ id: 1, status: 'done' });
    expect(readOnlyResult.structuredResult).toMatchObject({ persisted: false });

    // Recreate with write mode enabled to ensure persistence is allowed.
    await rm(tempDir, { recursive: true, force: true });
    const writable = await createTempService(true);
    tempDir = writable.dir;
    const writableTools = buildTaskToolDefinitions({ service: writable.service, logger: secureLogger });
    const writableSetStatus = writableTools.find((tool) => tool.name === 'set_task_status');
    const writeResult = await writableSetStatus!.handler({ id: 1, status: 'done' });
    expect(writeResult.structuredResult).toMatchObject({ persisted: true, task: { status: 'done' } });
  });
});
