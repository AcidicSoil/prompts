import { z } from 'zod';
import { createRunScriptTool } from './run-script.js';
const baseSchema = z
    .object({
    args: z.array(z.string()).optional(),
    dryRun: z.boolean().default(false),
    timeoutMs: z.number().int().positive().max(300_000).default(60_000),
})
    .strict();
export const createRunTestsTool = () => {
    const runScript = createRunScriptTool();
    return {
        name: 'workflow/run_tests',
        title: 'Run project tests',
        description: 'Execute the test suite using an allowlisted package script.',
        inputSchema: baseSchema,
        async handler(raw) {
            const parsed = baseSchema.safeParse(raw ?? {});
            if (!parsed.success) {
                return { isError: true, summary: 'workflow/run_tests input validation failed', issues: parsed.error.flatten() };
            }
            const { args = [], dryRun, timeoutMs } = parsed.data;
            return runScript.handler({ script: 'test:jest', args, dryRun, timeoutMs });
        },
    };
};
export const createRunBuildTool = () => {
    const runScript = createRunScriptTool();
    return {
        name: 'workflow/run_build',
        title: 'Run project build',
        description: 'Execute the build using an allowlisted package script.',
        inputSchema: baseSchema,
        async handler(raw) {
            const parsed = baseSchema.safeParse(raw ?? {});
            if (!parsed.success) {
                return { isError: true, summary: 'workflow/run_build input validation failed', issues: parsed.error.flatten() };
            }
            const { args = [], dryRun, timeoutMs } = parsed.data;
            return runScript.handler({ script: 'build', args, dryRun, timeoutMs });
        },
    };
};
