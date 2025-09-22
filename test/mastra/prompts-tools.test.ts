import { mkdtemp, copyFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test, afterEach } from '@jest/globals';

import { TaskService } from '../../src/mcp/task-service.ts';
import { createPromptsTools } from '../../packages/prompts-tools/src/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FIXTURE_DIR = resolve(__dirname, '../../tests/fixtures/taskmaster');
const SIMPLE_FIXTURE = join(FIXTURE_DIR, 'simple-tasks.json');

const createTempService = async (writeEnabled: boolean) => {
  const dir = await mkdtemp(join(tmpdir(), 'prompts-tools-'));
  const tasksPath = join(dir, 'tasks.json');
  await copyFile(SIMPLE_FIXTURE, tasksPath);
  const service = new TaskService({ tasksPath, tag: 'master', writeEnabled });
  await service.load();
  return { dir, service };
};

describe('@prompts/tools adapters', () => {
  let tempDir = '';

  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  test('next_task and graph_export run with expected shapes', async () => {
    const temp = await createTempService(false);
    tempDir = temp.dir;
    const tools = createPromptsTools({
      service: {
        list: () => temp.service.list(),
        next: () => temp.service.next(),
        graph: () => temp.service.graph(),
        setStatus: (id, status) => temp.service.setStatus(id, status)
      }
    });

    const next = await tools.nextTask.run({});
    expect(next).toHaveProperty('task');
    expect(Array.isArray(next.ready)).toBe(true);

    const graph = await tools.graphExport.run({});
    expect(Array.isArray(graph.nodes)).toBe(true);
  });

  test('set_task_status respects persistence flag', async () => {
    const temp = await createTempService(false);
    tempDir = temp.dir;
    const tools = createPromptsTools({
      service: {
        list: () => temp.service.list(),
        next: () => temp.service.next(),
        graph: () => temp.service.graph(),
        setStatus: (id, status) => temp.service.setStatus(id, status)
      }
    });

    const ro = await tools.setTaskStatus.run({ id: 1, status: 'done' });
    expect(ro.persisted).toBe(false);
  });
});
