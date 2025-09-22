import { createAdvanceStateTool } from './definitions/advance-state.js';
import { createRunScriptTool } from './definitions/run-script.js';
import { createRunTaskActionTool } from './definitions/run-task-action.js';
import { createRunTestsTool, createRunBuildTool } from './definitions/run-domain.js';
import { createExportTaskListTool } from './definitions/export-task-list.js';
import { createRefreshMetadataTool } from './definitions/refresh-metadata.js';
const formatIssues = (issues) => issues
    .map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
    .join('\n');
export const registerWorkflowTools = (server, logger, options) => {
    const refreshMetadata = createRefreshMetadataTool();
    const exportTaskList = createExportTaskListTool();
    const advanceState = createAdvanceStateTool(options.stateStore);
    const runScript = createRunScriptTool();
    const runTaskAction = options.service ? createRunTaskActionTool(options.service) : null;
    const runTests = createRunTestsTool();
    const runBuild = createRunBuildTool();
    server.registerTool(exportTaskList.name, {
        title: exportTaskList.title,
        description: exportTaskList.description,
        inputSchema: exportTaskList.inputSchema.shape,
        annotations: {
            idempotentHint: true,
        },
    }, async () => {
        try {
            const result = await exportTaskList.handler();
            logger.info('export_task_list_completed', { count: result.tasks.length });
            return {
                content: [
                    {
                        type: 'text',
                        text: `Exported ${result.tasks.length} tasks.`,
                    },
                ],
                structuredResult: result,
            };
        }
        catch (error) {
            logger.error('export_task_list_failed', { error });
            return {
                isError: true,
                content: [
                    {
                        type: 'text',
                        text: `Failed to export task list: ${error.message}`,
                    },
                ],
            };
        }
    });
    if (runTaskAction) {
        server.registerTool(runTaskAction.name, {
            title: runTaskAction.title,
            description: runTaskAction.description,
            inputSchema: runTaskAction.inputSchema.shape,
            annotations: {
                idempotentHint: false,
            },
        }, async (rawArgs) => {
            const result = await runTaskAction.handler(rawArgs ?? {});
            return {
                isError: result.isError,
                content: [
                    { type: 'text', text: result.summary },
                ],
                structuredResult: result,
            };
        });
    }
    server.registerTool(runScript.name, {
        title: runScript.title,
        description: runScript.description,
        inputSchema: runScript.inputSchema.shape,
        annotations: {
            idempotentHint: false,
        },
    }, async (rawArgs) => {
        const result = await runScript.handler(rawArgs ?? {});
        return {
            isError: Boolean(result.isError),
            content: [
                { type: 'text', text: String(result.summary) },
            ],
            structuredResult: result,
        };
    });
    // Domain runners
    for (const tool of [runTests, runBuild]) {
        server.registerTool(tool.name, {
            title: tool.title,
            description: tool.description,
            inputSchema: tool.inputSchema.shape,
            annotations: { idempotentHint: false },
        }, async (rawArgs) => {
            const result = await tool.handler(rawArgs ?? {});
            return {
                isError: result.isError,
                content: [{ type: 'text', text: String(result.summary) }],
                structuredResult: result,
            };
        });
    }
    server.registerTool(refreshMetadata.name, {
        title: refreshMetadata.title,
        description: refreshMetadata.description,
        inputSchema: refreshMetadata.inputSchema.shape,
        annotations: {
            idempotentHint: false,
        },
    }, async (rawArgs) => {
        const parseResult = refreshMetadata.inputSchema.safeParse(rawArgs ?? {});
        if (!parseResult.success) {
            const message = formatIssues(parseResult.error.issues);
            logger.warn('refresh_metadata_invalid_input', {
                issues: parseResult.error.flatten(),
            });
            return {
                isError: true,
                content: [
                    {
                        type: 'text',
                        text: `refresh_metadata input validation failed:\n${message}`,
                    },
                ],
            };
        }
        try {
            const result = await refreshMetadata.handler(parseResult.data);
            logger.info('refresh_metadata_completed', {
                updateWorkflow: parseResult.data.updateWorkflow,
            });
            return {
                content: [
                    {
                        type: 'text',
                        text: result.summary,
                    },
                ],
                structuredResult: result,
            };
        }
        catch (error) {
            logger.error('refresh_metadata_failed', { error });
            return {
                isError: true,
                content: [
                    {
                        type: 'text',
                        text: `Failed to refresh metadata: ${error.message}`,
                    },
                ],
            };
        }
    });
    server.registerTool(advanceState.name, {
        title: advanceState.title,
        description: advanceState.description,
        inputSchema: advanceState.inputSchema.shape,
        annotations: {
            idempotentHint: false,
        },
    }, async (rawArgs) => {
        const parseResult = advanceState.inputSchema.safeParse(rawArgs ?? {});
        if (!parseResult.success) {
            const message = formatIssues(parseResult.error.issues);
            logger.warn('advance_state_invalid_input', {
                issues: parseResult.error.flatten(),
            });
            return {
                isError: true,
                content: [
                    {
                        type: 'text',
                        text: `advance_state input validation failed:\n${message}`,
                    },
                ],
            };
        }
        const result = await advanceState.handler(parseResult.data);
        logger.info('advance_state_recorded', {
            id: parseResult.data.id,
            artifactCount: parseResult.data.artifacts.length,
        });
        return {
            content: [
                {
                    type: 'text',
                    text: `Recorded completion for ${parseResult.data.id}.`,
                },
            ],
            structuredResult: result,
        };
    });
    const tools = [refreshMetadata.name, exportTaskList.name, advanceState.name, runScript.name, runTests.name, runBuild.name];
    if (runTaskAction)
        tools.push(runTaskAction.name);
    logger.info('workflow_tools_registered', {
        count: tools.length,
        tools,
    });
};
