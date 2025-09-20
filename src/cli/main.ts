#!/usr/bin/env node
import { createRequire } from 'node:module';
import { Command } from 'commander';
import { ZodError } from 'zod';

import { createExportTaskListTool } from '../tools/definitions/export-task-list.js';
import { createRefreshMetadataTool } from '../tools/definitions/refresh-metadata.js';
import { createAdvanceStateTool, advanceStateInputSchema } from '../tools/definitions/advance-state.js';
import { StateStore } from '../state/StateStore.js';

const require = createRequire(import.meta.url);
const packageJson = require('../../package.json') as { version?: string };

const program = new Command();
program
  .name('prompts')
  .description('CLI utilities for the Proactive Workflow Assistant prompts server')
  .version(packageJson.version ?? '0.0.0');

const exportTaskListTool = createExportTaskListTool();
const refreshMetadataTool = createRefreshMetadataTool();

const parseJson = <T>(label: string, value: string): T => {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    throw new Error(`Failed to parse ${label} as JSON.`, { cause: error });
  }
};

const printError = (error: unknown): void => {
  if (error instanceof ZodError) {
    console.error('Validation failed:');
    for (const issue of error.issues) {
      console.error(`- ${issue.path.join('.') || '<root>'}: ${issue.message}`);
    }
    return;
  }

  if (error && typeof error === 'object' && 'stderr' in error && 'stdout' in error) {
    const commandError = error as { stdout: string; stderr: string; message: string };
    console.error(commandError.message);
    if (commandError.stderr) {
      console.error(commandError.stderr.trim());
    }
    if (commandError.stdout) {
      console.error(commandError.stdout.trim());
    }
    return;
  }

  console.error(error instanceof Error ? error.message : String(error));
};

const withCliErrors = async (runner: () => Promise<void>) => {
  try {
    await runner();
  } catch (error) {
    printError(error);
    process.exitCode = 1;
  }
};

program
  .command('list')
  .description('List tasks exposed by the prompts workflow tooling')
  .option('--json', 'Output raw JSON instead of a table')
  .action(async (options: { json?: boolean }) => {
    await withCliErrors(async () => {
      const result = await exportTaskListTool.handler();
      if (options.json) {
        console.log(JSON.stringify(result.tasks, null, 2));
        return;
      }

      const rows = result.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        dependsOn: task.dependsOn.join(', '),
      }));

      if (rows.length === 0) {
        console.log('No tasks found.');
        return;
      }

      console.table(rows);
    });
  });

program
  .command('export')
  .description('Export the workflow task list as JSON')
  .action(async () => {
    await withCliErrors(async () => {
      const result = await exportTaskListTool.handler();
      console.log(JSON.stringify(result.tasks, null, 2));
    });
  });

program
  .command('refresh')
  .description('Validate prompt metadata and rebuild catalog/README artifacts')
  .option('--update-workflow', 'Regenerate WORKFLOW.md in addition to catalog assets')
  .action(async (options: { updateWorkflow?: boolean }) => {
    await withCliErrors(async () => {
      const result = await refreshMetadataTool.handler({
        updateWorkflow: Boolean(options.updateWorkflow),
      });

      console.log(result.summary);
      for (const step of result.steps) {
        const commandLine = `${step.command} ${step.args.join(' ')}`.trim();
        console.log(`\n> ${commandLine}`);
        if (step.stdout) {
          console.log(step.stdout.trim());
        }
        if (step.stderr) {
          console.error(step.stderr.trim());
        }
      }
    });
  });

program
  .command('advance <id>')
  .description('Record completion data for a workflow tool and persist state')
  .option('--outputs <json>', 'JSON description of tool outputs', '{}')
  .option(
    '--artifact <json>',
    'Artifact JSON (repeat to add multiple entries)',
    (value: string, previous: string[]) => {
      previous.push(value);
      return previous;
    },
    [],
  )
  .action(async (id: string, options: { outputs?: string; artifact: string[] }) => {
    await withCliErrors(async () => {
      const outputs = parseJson<Record<string, unknown>>('outputs', options.outputs ?? '{}');
      const artifacts = options.artifact.map((entry, index) =>
        parseJson<Record<string, unknown>>(`artifact[${index}]`, entry),
      );

      const stateStore = new StateStore(process.cwd());
      await stateStore.load();

      const advanceTool = createAdvanceStateTool(stateStore);
      const validatedInput = advanceStateInputSchema.parse({
        id,
        outputs,
        artifacts,
      });

      const result = await advanceTool.handler(validatedInput);
      console.log(`Recorded completion for ${id}. State saved to ${result.statePath}`);
    });
  });

program
  .command('help', { isDefault: false })
  .description('Display CLI help')
  .action(() => {
    program.help();
  });

program.parseAsync(process.argv).catch((error) => {
  printError(error);
  process.exitCode = 1;
});
