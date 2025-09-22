import { describe, expect, test } from '@jest/globals';

import { computeReadiness, next } from '../../../src/state/graph.ts';
import type { PromptsTask } from '../../../src/types/prompts-task.ts';

const createTask = (overrides: Partial<PromptsTask> & { id: number }): PromptsTask => ({
  id: overrides.id,
  title: overrides.title ?? `Task ${overrides.id}`,
  description: overrides.description ?? 'desc',
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

describe('next', () => {
  test('returns null when no tasks are ready', () => {
    const tasks: PromptsTask[] = [
      createTask({ id: 1, status: 'pending', dependencies: [2] }),
      createTask({ id: 2, status: 'in_progress' }),
    ];

    expect(next(tasks)).toBeNull();
  });

  test('selects the highest priority ready task', () => {
    const tasks: PromptsTask[] = [
      createTask({ id: 1, priority: 'medium' }),
      createTask({ id: 2, priority: 'high' }),
      createTask({ id: 3, priority: 'low' }),
    ];

    expect(next(tasks)?.id).toBe(2);
  });

  test('breaks ties using dependent counts', () => {
    const tasks: PromptsTask[] = [
      createTask({ id: 1, priority: 'medium' }),
      createTask({ id: 2, priority: 'medium' }),
      createTask({ id: 3, priority: 'medium', dependencies: [1] }),
      createTask({ id: 4, status: 'done', priority: 'medium', dependencies: [] }),
    ];

    // Task 1 has one dependent (task 3); task 2 has none.
    expect(next(tasks)?.id).toBe(1);
  });

  test('uses lowest id when priority and dependency counts match', () => {
    const tasks: PromptsTask[] = [
      createTask({ id: 1, priority: 'medium' }),
      createTask({ id: 2, priority: 'medium' }),
    ];

    expect(next(tasks)?.id).toBe(1);
  });

  test('computeReadiness feeds next with ready tasks only', () => {
    const tasks: PromptsTask[] = [
      createTask({ id: 1, status: 'pending', dependencies: [3] }),
      createTask({ id: 2, status: 'pending', dependencies: [] }),
      createTask({ id: 3, status: 'in_progress', dependencies: [] }),
    ];

    const ready = computeReadiness(tasks);
    expect(ready.map((task) => task.id)).toEqual([2]);
    expect(next(tasks)?.id).toBe(2);
  });
});
