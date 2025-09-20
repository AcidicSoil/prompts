import { spawn } from 'node:child_process';

import { z } from 'zod';

export const refreshMetadataInputSchema = z
  .object({
    updateWorkflow: z.boolean().default(false),
  })
  .strict();

export type RefreshMetadataInput = z.infer<typeof refreshMetadataInputSchema>;

export interface RefreshMetadataResult {
  ok: true;
  summary: string;
  steps: Array<{
    command: string;
    args: string[];
    stdout: string;
    stderr: string;
  }>;
}

export type RefreshMetadataError = CommandError;

export interface RefreshMetadataTool {
  name: string;
  title: string;
  description: string;
  inputSchema: typeof refreshMetadataInputSchema;
  handler: (input: RefreshMetadataInput) => Promise<RefreshMetadataResult>;
}

interface RunCommandResult {
  stdout: string;
  stderr: string;
}

interface CommandError extends Error {
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

const runCommand = async (command: string, args: string[]): Promise<RunCommandResult> => {
  return await new Promise<RunCommandResult>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: process.env,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        const error = new Error(
          `${command} ${args.join(' ')} exited with code ${code}`,
        ) as CommandError;
        error.stdout = stdout;
        error.stderr = stderr;
        error.exitCode = code;
        reject(error);
      }
    });
  });
};

export const createRefreshMetadataTool = (): RefreshMetadataTool => ({
  name: 'refresh_metadata',
  title: 'Refresh Prompt Metadata and Catalog',
  description:
    'Run npm scripts to validate prompt metadata and rebuild catalog/README artifacts, optionally updating WORKFLOW.md.',
  inputSchema: refreshMetadataInputSchema,
  handler: async ({ updateWorkflow }) => {
    const steps: RefreshMetadataResult['steps'] = [];

    const validateResult = await runCommand('npm', ['run', 'validate:metadata']);
    steps.push({
      command: 'npm',
      args: ['run', 'validate:metadata'],
      stdout: validateResult.stdout,
      stderr: validateResult.stderr,
    });

    const buildArgs = ['run', 'build:catalog'];
    if (updateWorkflow) {
      buildArgs.push('--', '--update-workflow');
    }
    const buildResult = await runCommand('npm', buildArgs);
    steps.push({
      command: 'npm',
      args: buildArgs,
      stdout: buildResult.stdout,
      stderr: buildResult.stderr,
    });

    const summary = updateWorkflow
      ? 'Metadata validated and catalog/README/WORKFLOW regenerated.'
      : 'Metadata validated and catalog/README regenerated.';

    return {
      ok: true,
      summary,
      steps,
    } satisfies RefreshMetadataResult;
  },
});
