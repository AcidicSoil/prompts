#!/usr/bin/env node
import { createRequire } from 'node:module';

import { Command } from 'commander';

import { TaskIngestError, TaskValidationError } from '../adapters/taskmaster/ingest.js';
import {
  buildStatusSummary,
  formatGraphDot,
  loadIngest,
  runAdvance,
  runGraph,
  runNext,
  type GraphNode,
  type TaskLocatorOptions
} from './actions.js';
import { STATUS_ALIASES, type CanonicalTaskStatus } from '../types/prompts-task.js';

const require = createRequire(import.meta.url);
const packageJson = require('../../package.json') as { version?: string };

interface GlobalCliOptions {
  tasks: string;
  tag: string;
  write?: boolean;
  pretty?: boolean;
}

const DEFAULT_TASKS_PATH = '.taskmaster/tasks/tasks.json';

const program = new Command();
program
  .name('prompts')
  .description('Task-Master companion CLI for prompts workflows')
  .version(packageJson.version ?? '0.0.0')
  .option('--tasks <path>', 'Path to Task-Master tasks.json file', DEFAULT_TASKS_PATH)
  .option('--tag <tag>', 'Tagged task list to load', 'master')
  .option('--write', 'Enable write mode for commands that persist changes')
  .option('--pretty', 'Pretty-print JSON output');

const getGlobalOptions = (): GlobalCliOptions => program.optsWithGlobals<GlobalCliOptions>();

const stringify = (value: unknown, pretty?: boolean): string =>
  JSON.stringify(value, null, pretty ? 2 : undefined) ?? 'null';

const printJson = (value: unknown, pretty?: boolean): void => {
  console.log(stringify(value, pretty));
};

const parseTaskId = (raw: string): number => {
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error('Task id must be a positive integer.');
  }
  return value;
};

const parseStatus = (raw: string): CanonicalTaskStatus => {
  const key = raw.trim().toLowerCase();
  const canonical = STATUS_ALIASES[key];
  if (!canonical) {
    throw new Error(`Unsupported status value: ${raw}`);
  }
  return canonical;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object';

const printError = (error: unknown): void => {
  if (error instanceof TaskValidationError) {
    console.error(`Validation failed: ${error.message}`);
    if (isRecord(error.context) && Array.isArray(error.context.errors)) {
      for (const issue of error.context.errors as { message?: string }[]) {
        if (issue && typeof issue.message === 'string') {
          console.error(`- ${issue.message}`);
        }
      }
    }
    return;
  }

  if (error instanceof TaskIngestError) {
    console.error(error.message);
    if (error.context) {
      console.error(stringify(error.context, true));
    }
    return;
  }

  console.error(error instanceof Error ? error.message : String(error));
};

const withCliErrors = async (runner: () => Promise<void>): Promise<void> => {
  try {
    await runner();
  } catch (error) {
    printError(error);
    process.exitCode = 1;
  }
};

const toLocatorOptions = (options: GlobalCliOptions): TaskLocatorOptions => ({
  tasksPath: options.tasks,
  tag: options.tag,
  cwd: process.cwd()
});

program
  .command('ingest')
  .description('Validate and normalize Task-Master tasks into the canonical schema.')
  .action(async () => {
    await withCliErrors(async () => {
      const options = getGlobalOptions();
      const result = await loadIngest(toLocatorOptions(options));
      printJson(
        {
          tasks: result.tasks,
          report: result.report
        },
        options.pretty
      );
    });
  });

program
  .command('next')
  .description('Select the next ready task based on dependency and priority rules.')
  .action(async () => {
    await withCliErrors(async () => {
      const options = getGlobalOptions();
      const { task, ready } = await runNext(toLocatorOptions(options));

      printJson(
        {
          task,
          ready
        },
        options.pretty
      );
    });
  });

program
  .command('advance')
  .description('Update a task\'s status. Persists only when --write is supplied.')
  .argument('<id>', 'Task identifier to update.')
  .argument('<status>', 'New status (canonical name or supported alias).')
  .action(async (id: string, status: string) => {
    await withCliErrors(async () => {
      const options = getGlobalOptions();
      const taskId = parseTaskId(id);
      const canonicalStatus = parseStatus(status);
      const result = await runAdvance(toLocatorOptions(options), taskId, canonicalStatus, Boolean(options.write));

      printJson(
        {
          task: result.task,
          persisted: result.persisted
        },
        options.pretty
      );
    });
  });

program
  .command('graph')
  .description('Export the task dependency graph as JSON or DOT.')
  .option('--format <format>', 'Output format: json or dot', 'json')
  .action(async (commandOptions: { format: string }) => {
    await withCliErrors(async () => {
      const options = getGlobalOptions();
      const graph = await runGraph(toLocatorOptions(options));
      const format = (commandOptions.format ?? 'json').toLowerCase();

      if (format === 'json') {
        printJson(graph, options.pretty);
        return;
      }

      if (format === 'dot') {
        console.log(formatGraphDot(graph.nodes as GraphNode[]));
        return;
      }

      throw new Error(`Unsupported graph format: ${commandOptions.format}`);
    });
  });

program
  .command('status')
  .description('Summarize task statuses and readiness information.')
  .action(async () => {
    await withCliErrors(async () => {
      const options = getGlobalOptions();
      const summary = await buildStatusSummary(toLocatorOptions(options));
      printJson(summary, options.pretty);
    });
  });

program
  .command('help', { isDefault: false })
  .description('Display CLI help information.')
  .action(() => {
    program.help();
  });

program.parseAsync(process.argv).catch((error) => {
  printError(error);
  process.exitCode = 1;
});
