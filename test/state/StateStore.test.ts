import { strict as assert } from 'node:assert';
import { mkdir, rm, stat, readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join, dirname } from 'node:path';

import { describe, test, beforeAll, afterAll } from '@jest/globals';

import { StateStore } from '../../src/state/StateStore.ts';
import { createInitialProjectState } from '../../src/state/ProjectState.ts';

const TEST_ARTIFACT_ROOT = join(process.cwd(), 'artifacts', 'test', 'state-store');

const createTempProjectRoot = async (): Promise<string> => {
  const dir = join(TEST_ARTIFACT_ROOT, `run-${Date.now()}-${randomUUID()}`);
  await mkdir(dir, { recursive: true });
  return dir;
};

const ensureDirectoryExists = async (path: string): Promise<boolean> => {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
};

beforeAll(async () => {
  await mkdir(TEST_ARTIFACT_ROOT, { recursive: true });
});

afterAll(async () => {
  await rm(TEST_ARTIFACT_ROOT, { recursive: true, force: true });
});

describe('StateStore', () => {
  test('records completions and persists state to disk', async () => {
    const root = await createTempProjectRoot();

    try {
      const store = new StateStore(root);

      const initial = await store.load();
      const expected = createInitialProjectState();
      assert.equal(initial.completedTools.length, expected.completedTools.length);
      assert.equal(Object.keys(initial.artifacts).length, Object.keys(expected.artifacts).length);

      const mcpDirectory = join(root, '.mcp');
      assert.ok(await ensureDirectoryExists(mcpDirectory));

      store.recordCompletion(
        'discover_research',
        { summary: 'done' },
        [
          {
            name: 'research_summary',
            source: 'discover_research',
            uri: 'file://summary.md',
          },
        ],
      );

      const afterFirst = store.getState();
      assert.equal(afterFirst.completedTools.length, 1);
      assert.equal(afterFirst.completedTools[0].id, 'discover_research');
      assert.equal(afterFirst.artifacts.research_summary.name, 'research_summary');

      store.recordCompletion(
        'discover_research',
        { summary: 'updated' },
        [
          {
            name: 'research_summary',
            source: 'discover_research',
            uri: 'file://updated.md',
          },
        ],
      );

      const ids = store.getCompletedToolIds();
      assert.ok(ids.has('discover_research'));
      assert.equal(ids.size, 1);

      const availableArtifacts = store.getAvailableArtifacts();
      assert.ok(availableArtifacts.has('research_summary'));

      await Promise.all([store.save(), store.save(), store.save()]);

      const persisted = JSON.parse(await readFile(store.statePath, 'utf8'));
      assert.equal(persisted.completedTools.length, 1);
      assert.equal(persisted.completedTools[0].outputs.summary, 'updated');
      assert.equal(persisted.artifacts.research_summary.uri, 'file://updated.md');

      const secondStore = new StateStore(root);
      const loadedAgain = await secondStore.load();
      assert.equal(loadedAgain.completedTools.length, 1);
      assert.equal(loadedAgain.completedTools[0].outputs.summary, 'updated');

      const tmpPath = `${store.statePath}.tmp`;
      assert.strictEqual(await ensureDirectoryExists(dirname(tmpPath)), true);
      try {
        await stat(tmpPath);
        assert.fail('temporary state file should not persist after rename');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error;
        }
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
