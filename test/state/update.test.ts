import { describe, expect, test } from '@jest/globals';

import { advance } from '../../src/state/update.ts';
import type { CanonicalTaskStatus, PromptsTask } from '../../src/types/prompts-task.ts';

const createTask = (overrides: Partial<PromptsTask> & { id: number }): PromptsTask => ({
  id: overrides.id,
  title: overrides.title ?? `Task ${overrides.id}`,
  description: overrides.description ?? '',
  status: overrides.status ?? 'pending',
  dependencies: overrides.dependencies ?? [],
  priority: overrides.priority ?? 'medium',
  details: overrides.details ?? '',
  testStrategy: overrides.testStrategy ?? '',
  subtasks: overrides.subtasks ?? [],
  labels: overrides.labels,
  metadata: overrides.metadata,
  evidence: overrides.evidence,
  artifacts: overrides.artifacts,
  source_doc: overrides.source_doc,
  lineage: overrides.lineage,
  supersedes: overrides.supersedes,
  superseded_by: overrides.superseded_by,
  reason: overrides.reason,
});

describe('advance', () => {
  test('updates target task status without mutating input', () => {
    const tasks: PromptsTask[] = [
      createTask({ id: 1, status: 'pending' }),
      createTask({ id: 2, status: 'in_progress' }),
    ];

    const nextTasks = advance(tasks, 2, 'done');

    expect(nextTasks).not.toBe(tasks);
    expect(tasks[1].status).toBe('in_progress');
    expect(nextTasks[1].status).toBe('done');
    expect(nextTasks[1]).not.toBe(tasks[1]);
    expect(nextTasks[0]).toBe(tasks[0]);
  });

  test('clones target task even when status is unchanged', () => {
    const tasks: PromptsTask[] = [createTask({ id: 1, status: 'pending' })];

    const nextTasks = advance(tasks, 1, 'pending');

    expect(nextTasks).not.toBe(tasks);
    expect(nextTasks[0]).not.toBe(tasks[0]);
    expect(nextTasks[0].status).toBe('pending');
  });

  test('throws when task id is not found', () => {
    const tasks: PromptsTask[] = [createTask({ id: 1 })];

    expect(() => advance(tasks, 99, 'done')).toThrow('Task with id 99 was not found.');
  });

  test('throws when status is invalid', () => {
    const tasks: PromptsTask[] = [createTask({ id: 1 })];

    expect(() => advance(tasks, 1, 'invalid' as CanonicalTaskStatus)).toThrow(RangeError);
  });

  test('throws when tasks argument is not an array', () => {
    expect(() => advance(null as unknown as PromptsTask[], 1, 'pending')).toThrow(TypeError);
  });
});
