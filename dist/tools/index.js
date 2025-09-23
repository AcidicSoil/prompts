import { registerPromptResources, registerPromptTools } from '../prompts/register.js';
import { registerWorkflowTools } from './register.js';
import { registerTaskTools } from './task-tools.js';
export const registerAllTools = async (server, logger, { service, stateStore }) => {
    // Prompts: resources + tool wrappers generated from metadata
    await registerPromptResources(server, logger, { baseDir: process.cwd() });
    await registerPromptTools(server, logger, { baseDir: process.cwd() });
    // Workflow tools (advance_state, export_task_list, refresh_metadata, run_task_action, runners)
    registerWorkflowTools(server, logger, { stateStore, service });
    // Task tools (list, next, set_status, etc.)
    registerTaskTools(server, { service, logger });
};
