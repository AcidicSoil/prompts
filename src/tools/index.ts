import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SecureLogger } from '../logger.js';

import { registerPromptResources, registerPromptTools } from '../prompts/register.js';
import { registerWorkflowTools } from './register.js';
import { registerTaskTools } from './task-tools.js';
import type { TaskService } from '../mcp/task-service.js';
import type { StateStore } from '../state/StateStore.js';

export interface RegisterAllToolsOptions {
  service: TaskService;
  stateStore: StateStore;
}

export const registerAllTools = async (
  server: McpServer,
  logger: SecureLogger,
  { service, stateStore }: RegisterAllToolsOptions,
): Promise<void> => {
  // Prompts: resources + tool wrappers generated from metadata
  await registerPromptResources(server, logger, { baseDir: process.cwd() });
  await registerPromptTools(server, logger, { baseDir: process.cwd() });

  // Workflow tools (advance_state, export_task_list, refresh_metadata, run_task_action, runners)
  registerWorkflowTools(server, logger, { stateStore, service });

  // Task tools (list, next, set_status, etc.)
  registerTaskTools(server, { service, logger });
};
