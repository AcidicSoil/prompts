import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { SecureLogger } from '../logger.js';
import type { StateStore } from '../state/StateStore.js';
import { createAdvanceStateTool } from './definitions/advance-state.js';
import { createExportTaskListTool } from './definitions/export-task-list.js';
import { createRefreshMetadataTool } from './definitions/refresh-metadata.js';

interface RegisterWorkflowToolsOptions {
  stateStore: StateStore;
}

const formatIssues = (issues: z.ZodIssue[]): string =>
  issues
    .map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
    .join('\n');

export const registerWorkflowTools = (
  server: McpServer,
  logger: SecureLogger,
  options: RegisterWorkflowToolsOptions,
): void => {
  const refreshMetadata = createRefreshMetadataTool();
  const exportTaskList = createExportTaskListTool();
  const advanceState = createAdvanceStateTool(options.stateStore);

  server.registerTool(
    exportTaskList.name,
    {
      title: exportTaskList.title,
      description: exportTaskList.description,
      inputSchema: exportTaskList.inputSchema.shape,
      annotations: {
        idempotentHint: true,
      },
    },
    async () => {
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
      } catch (error) {
        logger.error('export_task_list_failed', { error });
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Failed to export task list: ${(error as Error).message}`,
            },
          ],
        };
      }
    },
  );

  server.registerTool(
    refreshMetadata.name,
    {
      title: refreshMetadata.title,
      description: refreshMetadata.description,
      inputSchema: refreshMetadata.inputSchema.shape,
      annotations: {
        idempotentHint: false,
      },
    },
    async (rawArgs) => {
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
      } catch (error) {
        logger.error('refresh_metadata_failed', { error });
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Failed to refresh metadata: ${(error as Error).message}`,
            },
          ],
        };
      }
    },
  );

  server.registerTool(
    advanceState.name,
    {
      title: advanceState.title,
      description: advanceState.description,
      inputSchema: advanceState.inputSchema.shape,
      annotations: {
        idempotentHint: false,
      },
    },
    async (rawArgs) => {
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
    },
  );

  logger.info('workflow_tools_registered', {
    count: 3,
    tools: [refreshMetadata.name, exportTaskList.name, advanceState.name],
  });
};
