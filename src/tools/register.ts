import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { SecureLogger } from '../logger.js';
import type { StateStore } from '../state/StateStore.js';
import { createAdvanceStateTool } from './definitions/advance-state.js';

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
  const advanceState = createAdvanceStateTool(options.stateStore);

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
    count: 1,
    tools: [advanceState.name],
  });
};
