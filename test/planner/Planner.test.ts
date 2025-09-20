import { strict as assert } from 'node:assert';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';

import { Planner } from '../../src/planner.ts';
import { StateStore } from '../../src/state/StateStore.ts';

const ARTIFACT_ROOT = join(process.cwd(), 'artifacts', 'test', 'planner');
const DEFAULT_GRAPH_PATH = join(process.cwd(), 'resources', 'default-graph.json');

const createTempProjectRoot = async () => {
  const dir = join(ARTIFACT_ROOT, `run-${Date.now()}-${randomUUID()}`);
  await mkdir(dir, { recursive: true });
  return dir;
};

const runPlannerFlowTest = async () => {
  await mkdir(ARTIFACT_ROOT, { recursive: true });
  const projectRoot = await createTempProjectRoot();

  try {
    const store = new StateStore(projectRoot);
    await store.load();
    const planner = new Planner(DEFAULT_GRAPH_PATH, store);

    const nextIds = () => planner.suggestNextCalls().map((node) => node.id);

    assert.deepEqual(nextIds(), ['instruction-file']);

    store.recordCompletion('instruction-file', {}, []);
    assert.deepEqual(nextIds(), ['planning-process']);

    store.recordCompletion('planning-process', {}, []);
    assert.deepEqual(nextIds(), ['scope-control']);

    store.recordCompletion('scope-control', {}, []);
    assert.deepEqual(nextIds(), ['integration-test']);

    store.recordCompletion('integration-test', { status: 'draft' }, []);
    assert.deepEqual(nextIds(), []);

    store.recordCompletion('integration-test', { status: 'ready' }, [
      {
        name: 'test_results',
        source: 'integration-test',
        uri: 'file://tests.json',
      },
    ]);
    assert.deepEqual(nextIds(), ['regression-guard']);

    store.recordCompletion('regression-guard', { status: 'pending' }, []);
    assert.deepEqual(nextIds(), []);

    store.recordCompletion('regression-guard', { status: 'complete' }, [
      {
        name: 'release_notes_context',
        source: 'regression-guard',
        uri: 'file://release-notes.md',
      },
    ]);
    assert.deepEqual(nextIds(), ['release-notes']);
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
};

const runSortOrderTest = async () => {
  const projectRoot = await createTempProjectRoot();
  const customGraphPath = join(projectRoot, 'custom-graph.json');

  try {
    await writeFile(
      customGraphPath,
      JSON.stringify(
        {
          nodes: [
            {
              id: 'b-task',
              title: 'B Task',
              phase: 2,
              dependsOn: [],
              requiresArtifacts: [],
            },
            {
              id: 'a-task',
              title: 'A Task',
              phase: 2,
              dependsOn: [],
              requiresArtifacts: [],
            },
            {
              id: 'c-task',
              title: 'C Task',
              phase: 1,
              dependsOn: [],
              requiresArtifacts: [],
            },
          ],
        },
        null,
        2,
      ),
      'utf8',
    );

    const store = new StateStore(projectRoot);
    await store.load();

    const planner = new Planner(customGraphPath, store);
    const suggestions = planner.suggestNextCalls().map((node) => node.id);
    assert.deepEqual(suggestions, ['c-task', 'a-task', 'b-task']);
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
};

const run = async () => {
  await runPlannerFlowTest();
  await runSortOrderTest();
};

run()
  .then(() => {
    console.log('Planner tests passed.');
  })
  .catch((error) => {
    console.error('Planner tests failed:', error);
    process.exitCode = 1;
  });
