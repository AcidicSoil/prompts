import { spawn } from 'node:child_process';
import { z } from 'zod';
export const refreshMetadataInputSchema = z
    .object({
    updateWorkflow: z.boolean().default(false),
})
    .strict();
const runCommand = async (command, args) => {
    return await new Promise((resolve, reject) => {
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
            }
            else {
                const error = new Error(`${command} ${args.join(' ')} exited with code ${code}`);
                error.stdout = stdout;
                error.stderr = stderr;
                error.exitCode = code;
                reject(error);
            }
        });
    });
};
export const createRefreshMetadataTool = () => ({
    name: 'refresh_metadata',
    title: 'Refresh Prompt Metadata and Catalog',
    description: 'Run npm scripts to validate prompt metadata and rebuild catalog/README artifacts, optionally updating WORKFLOW.md.',
    inputSchema: refreshMetadataInputSchema,
    handler: async ({ updateWorkflow }) => {
        const steps = [];
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
        };
    },
});
