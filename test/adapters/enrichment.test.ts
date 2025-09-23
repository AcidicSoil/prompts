import { describe, expect, test } from '@jest/globals';
import { enrichTasks } from '../../src/enrichment/index.ts';

describe('enrichment pipeline', () => {
  test('does not mutate tasks and swallows missing artifacts', async () => {
    const tasks = [
      { id: 1, title: 'T1', description: '', status: 'pending', dependencies: [], priority: 'low', details: '', testStrategy: '', subtasks: [] },
    ];
    const res = await enrichTasks(tasks as any, process.cwd());
    expect(res.tasks).not.toBe(tasks);
    expect(res.tasks[0].metadata?.enrichment?.complexity).toBeUndefined();
    expect(Array.isArray(res.warnings)).toBe(true);
  });
});

