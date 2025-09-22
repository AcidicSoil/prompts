import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from '@jest/globals';

import {
  ingestTasks,
  TaskIngestError,
  TaskValidationError
} from '../../src/adapters/taskmaster/ingest.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_DIR = resolve(__dirname, '../fixtures/taskmaster');

describe('Task-Master ingest adapter', () => {
  test('normalizes aliased statuses and records report entries', async () => {
    const fixture = join(FIXTURES_DIR, 'tagged-tasks.json');

    const { tasks, report } = await ingestTasks(fixture);

    expect(tasks).toHaveLength(2);

    const [first, second] = tasks;
    expect(first.status).toBe('pending');
    expect(first.priority).toBe('high');
    expect(first.subtasks).toHaveLength(1);
    expect(first.subtasks[0]?.status).toBe('in_progress');

    expect(second.status).toBe('blocked');

    expect(report.total).toBe(2);
    expect(report.remapped).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ entity: 'task', taskId: 1, from: 'todo', to: 'pending' }),
        expect.objectContaining({ entity: 'task', taskId: 2, from: 'deferred', to: 'blocked' }),
        expect.objectContaining({ entity: 'subtask', taskId: 1, subtaskId: 1, from: 'in-progress', to: 'in_progress' })
      ])
    );
  });

  test('defaults missing subtask statuses to pending', async () => {
    const { tasks } = await ingestTasks(join(FIXTURES_DIR, 'subtask-missing-status.json'));
    const [task] = tasks;
    expect(task?.subtasks).toHaveLength(1);
    expect(task?.subtasks[0]?.status).toBe('pending');
  });

  test('supports legacy root-level task arrays', async () => {
    const { tasks } = await ingestTasks(join(FIXTURES_DIR, 'legacy-tasks.json'));
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({ id: 1, title: 'Legacy format task', status: 'pending' });
  });

  test('throws TaskValidationError when schema validation fails', async () => {
    await expect(ingestTasks(join(FIXTURES_DIR, 'invalid-missing-fields.json'))).rejects.toBeInstanceOf(
      TaskValidationError
    );
  });

  test('throws TaskIngestError when tag is missing', async () => {
    await expect(
      ingestTasks(join(FIXTURES_DIR, 'tagged-tasks.json'), { tag: 'non-existent' })
    ).rejects.toBeInstanceOf(TaskIngestError);
  });
});
