import { mkdtemp, copyFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test, afterEach } from '@jest/globals';

import { TaskService } from '../../src/mcp/task-service.ts';
import {
  createPromptsTools,
  NextTaskInput,
  SetTaskStatusInput,
  GraphExportInput,
} from '../../packages/prompts-tools/src/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FIXTURE_DIR = resolve(__dirname, '../../tests/fixtures/taskmaster');
const SIMPLE_FIXTURE = join(FIXTURE_DIR, 'simple-tasks.json');

const createTempService = async (writeEnabled: boolean) => {
  const dir = await mkdtemp(join(tmpdir(), 'agent-smoke-'));
  const tasksPath = join(dir, 'tasks.json');
  await copyFile(SIMPLE_FIXTURE, tasksPath);
  const service = new TaskService({ tasksPath, tag: 'master', writeEnabled });
  await service.load();
  return { dir, service };
};

describe('Agent demo smoke test', () => {
  let tempDir = '';

  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  test('agent plans via next_task and completes with set_task_status, then inspects graph', async () => {
    const temp = await createTempService(true); // enable persistence for status updates
    tempDir = temp.dir;

    // Prime context: expose a minimal Task API and create tool adapters
    const tools = createPromptsTools({
      service: {
        list: () => temp.service.list(),
        next: () => temp.service.next(),
        graph: () => temp.service.graph(),
        setStatus: (id, status) => temp.service.setStatus(id, status),
      },
    });

    // "Agent" step 1: discover the next task
    const nextArgs = NextTaskInput.parse({});
    const nextResult = await tools.nextTask.run(nextArgs);
    expect(nextResult).toHaveProperty('task');
    const task = nextResult.task as { id?: number; title?: string } | null;
    expect(task && typeof task.id === 'number').toBe(true);

    // "Agent" step 2: mark it done
    const setArgs = SetTaskStatusInput.parse({ id: task!.id as number, status: 'done' });
    const setResult = await tools.setTaskStatus.run(setArgs);
    expect(setResult.persisted).toBe(true);
    const updated = setResult.task as { status?: string };
    expect(updated.status).toBe('done');

    // "Agent" step 3: inspect graph to confirm consistency
    const graphArgs = GraphExportInput.parse({});
    const graph = await tools.graphExport.run(graphArgs);
    expect(Array.isArray(graph.nodes)).toBe(true);
    expect(graph.nodes.length).toBeGreaterThan(0);
  });
});

