import { chdir, cwd } from 'node:process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { describe, expect, test, afterEach, beforeEach } from '@jest/globals';

import { ingestTasks } from '../../src/adapters/taskmaster/ingest.ts';

const FIXTURE = resolve('tests/fixtures/taskmaster/simple-tasks.json');

describe('ingest schema resolution', () => {
  const originalCwd = cwd();
  let sandbox = '';

  beforeEach(async () => {
    sandbox = await mkdtemp(join(tmpdir(), 'ingest-cwd-sandbox-'));
    chdir(sandbox);
  });

  afterEach(async () => {
    chdir(originalCwd);
    if (sandbox) {
      await rm(sandbox, { recursive: true, force: true });
      sandbox = '';
    }
  });

  test('ingestTasks works when CWD is not repo root', async () => {
    const { tasks, report } = await ingestTasks(FIXTURE, { tag: 'master' });
    expect(Array.isArray(tasks)).toBe(true);
    expect(report).toHaveProperty('total');
    expect(tasks.length).toBeGreaterThan(0);
  });
});

