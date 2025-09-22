import { describe, expect, test } from '@jest/globals';

import { computeReadiness } from '../../../src/state/graph.ts';
import type { PromptsTask } from '../../../src/types/prompts-task.ts';

const createTask = (
  overrides: Partial<PromptsTask> & { id: number },
  base?: PromptsTask,
): PromptsTask => ({
  id: overrides.id,
  title: overrides.title ?? `Task ${overrides.id}`,
  description: overrides.description ?? 'desc',
  status: overrides.status ?? 'pending',
  dependencies: overrides.dependencies ?? [],
  priority: overrides.priority ?? 'medium',
  details: overrides.details ?? '',
  testStrategy: overrides.testStrategy ?? '',
  subtasks: overrides.subtasks ?? [],
  labels: overrides.labels ?? base?.labels,
  metadata: overrides.metadata ?? base?.metadata,
  evidence: overrides.evidence ?? base?.evidence,
  artifacts: overrides.artifacts ?? base?.artifacts,
  source_doc: overrides.source_doc ?? base?.source_doc,
  lineage: overrides.lineage ?? base?.lineage,
  supersedes: overrides.supersedes ?? base?.supersedes,
  superseded_by: overrides.superseded_by ?? base?.superseded_by,
  reason: overrides.reason ?? base?.reason,
});

describe('computeReadiness', () => {
  test('returns tasks with no dependencies that are pending', () => {
    const tasks: PromptsTask[] = [
      createTask({ id: 1 }),
      createTask({ id: 2, status: 'done' }),
    ];

    const ready = computeReadiness(tasks);

    expect(ready.map((task) => task.id)).toEqual([1]);
  });

  test('excludes tasks when dependencies are not completed', () => {
    const tasks: PromptsTask[] = [
      createTask({ id: 1, status: 'pending', dependencies: [2] }),
      createTask({ id: 2, status: 'in_progress' }),
    ];

    const ready = computeReadiness(tasks);

    expect(ready).toHaveLength(0);
  });

  test('includes tasks when dependencies are done or deprecated', () => {
    const tasks: PromptsTask[] = [
      createTask({ id: 1, status: 'done' }),
      createTask({ id: 2, status: 'deprecated' }),
      createTask({ id: 3, status: 'pending', dependencies: [1, 2] }),
      createTask({ id: 4, status: 'pending', dependencies: [2] }),
    ];

    const ready = computeReadiness(tasks);

    expect(ready.map((task) => task.id)).toEqual([3, 4]);
  });

  test('excludes tasks referencing missing dependencies', () => {
    const tasks: PromptsTask[] = [
      createTask({ id: 1, status: 'pending', dependencies: [99] }),
    ];

    expect(computeReadiness(tasks)).toHaveLength(0);
  });

  test('excludes tasks with self dependencies', () => {
    const tasks: PromptsTask[] = [
      createTask({ id: 1, status: 'pending', dependencies: [1] }),
      createTask({ id: 2, status: 'pending', dependencies: [2] }),
    ];

    expect(computeReadiness(tasks)).toHaveLength(0);
  });

  test('ignores tasks not in a ready status even if dependencies are satisfied', () => {
    const tasks: PromptsTask[] = [
      createTask({ id: 1, status: 'done' }),
      createTask({ id: 2, status: 'blocked', dependencies: [1] }),
      createTask({ id: 3, status: 'pending', dependencies: [1] }),
    ];

    const ready = computeReadiness(tasks);

    expect(ready.map((task) => task.id)).toEqual([3]);
  });
});
