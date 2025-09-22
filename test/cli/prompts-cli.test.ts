import { mkdtemp, copyFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test, beforeEach, afterEach } from '@jest/globals';

import {
  buildStatusSummary,
  formatGraphDot,
  loadIngest,
  runAdvance,
  runGraph,
  runNext,
  type TaskLocatorOptions
} from '../../src/cli/actions.ts';
import type { CanonicalTaskStatus } from '../../src/types/prompts-task.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..', '..');
const FIXTURE_DIR = resolve(__dirname, '../../tests/fixtures/taskmaster');
const SIMPLE_FIXTURE = join(FIXTURE_DIR, 'simple-tasks.json');

const toLocator = (tasksPath: string): TaskLocatorOptions => ({
  tasksPath,
  tag: 'master',
  cwd: ROOT_DIR
});

describe('prompts CLI actions', () => {
  let tempDir: string;
  let tempTasksPath: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'prompts-cli-'));
    tempTasksPath = join(tempDir, 'tasks.json');
    await copyFile(SIMPLE_FIXTURE, tempTasksPath);
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  test('loadIngest parses tasks and returns normalization report', async () => {
    const result = await loadIngest(toLocator(SIMPLE_FIXTURE));
    expect(result.tasks).toHaveLength(2);
    expect(result.report.total).toBe(2);
  });

  test('runNext returns ready task snapshot', async () => {
    const result = await runNext(toLocator(SIMPLE_FIXTURE));
    expect(result.task?.id).toBe(1);
    expect(result.ready).toHaveLength(1);
  });

  test('runGraph exports nodes and formatGraphDot renders DOT output', async () => {
    const graph = await runGraph(toLocator(SIMPLE_FIXTURE));
    expect(graph.nodes).toHaveLength(2);
    const dot = formatGraphDot(graph.nodes);
    expect(dot.startsWith('digraph TaskGraph {')).toBe(true);
    expect(dot.includes('"1"')).toBe(true);
  });

  test('buildStatusSummary reports counts, ready list, and next task', async () => {
    const summary = await buildStatusSummary(toLocator(SIMPLE_FIXTURE));
    expect(summary.total).toBe(2);
    expect(summary.summary.pending).toBeGreaterThanOrEqual(1);
    expect(summary.next?.id).toBe(1);
    expect(Array.isArray(summary.ready)).toBe(true);
  });

  test('runAdvance honours write toggle and leaves file untouched without persistence', async () => {
    const status: CanonicalTaskStatus = 'done';
    const result = await runAdvance(toLocator(tempTasksPath), 1, status, false);
    expect(result.persisted).toBe(false);
    expect(result.task.status).toBe('pending');

    const fileContent = await readFile(tempTasksPath, 'utf8');
    const document = JSON.parse(fileContent) as { master: { tasks: Array<{ status: string }> } };
    expect(document.master.tasks[0]?.status).toBe('pending');
  });
});
