import { mkdtemp, copyFile, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test, beforeEach, afterEach } from '@jest/globals';

import { TaskService } from '../../src/mcp/task-service.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FIXTURE_DIR = resolve(__dirname, '../../tests/fixtures/taskmaster');
const SIMPLE_FIXTURE = join(FIXTURE_DIR, 'simple-tasks.json');

const createTempTasksFile = async (): Promise<{ dir: string; path: string }> => {
  const dir = await mkdtemp(join(tmpdir(), 'task-service-'));
  const path = join(dir, 'tasks.json');
  await copyFile(SIMPLE_FIXTURE, path);
  return { dir, path };
};

describe('TaskService', () => {
  let tempDir: string;
  let tasksPath: string;

  beforeEach(async () => {
    const temp = await createTempTasksFile();
    tempDir = temp.dir;
    tasksPath = temp.path;
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  const createService = async (writeEnabled: boolean) => {
    const service = new TaskService({
      tasksPath,
      tag: 'master',
      writeEnabled
    });
    await service.load();
    return service;
  };

  test('lists tasks and computes next task', async () => {
    const service = await createService(false);
    const tasks = service.list();
    expect(tasks).toHaveLength(2);
    expect(tasks[0]?.title).toBe('Initial work');

    const next = service.next();
    expect(next?.id).toBe(1);
  });

  test('returns graph export nodes', async () => {
    const service = await createService(false);
    const graph = service.graph();
    expect(graph.nodes).toHaveLength(2);
    expect(graph.nodes[1]).toMatchObject({ id: 2, dependencies: [1] });
  });

  test('setStatus respects read-only mode', async () => {
    const service = await createService(false);
    const result = await service.setStatus(1, 'done');

    expect(result.persisted).toBe(false);
    expect(result.task.status).toBe('pending');

    const file = await readFile(tasksPath, 'utf8');
    const document = JSON.parse(file);
    expect(document.master.tasks[0].status).toBe('pending');
  });

  test('setStatus persists when write mode enabled', async () => {
    const service = await createService(true);
    const result = await service.setStatus(1, 'done');

    expect(result.persisted).toBe(true);
    expect(result.task.status).toBe('done');

    const file = await readFile(tasksPath, 'utf8');
    const document = JSON.parse(file);
    expect(document.master.tasks[0].status).toBe('done');
  });
});
