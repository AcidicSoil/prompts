import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { SecureLogger } from '../logger.js';
import type { TaskService, SetTaskStatusResult } from '../mcp/task-service.js';
import { computeReadyTasks } from '../mcp/task-service.js';

const statusSchema = z.enum(['pending', 'in_progress', 'blocked', 'done', 'deprecated']);

const idSchema = z.number().int().positive();

const serializeTask = (task: unknown): unknown => JSON.parse(JSON.stringify(task));

interface ToolDefinition {
  name: string;
  title: string;
  description: string;
  inputSchema: z.ZodTypeAny;
  handler: (args?: unknown) => Promise<{
    content: string;
    structuredResult?: unknown;
    isError?: boolean;
  }>;
}

const buildTextContent = (message: string) => [{ type: 'text' as const, text: message }];

export interface RegisterTaskToolsOptions {
  service: TaskService;
  logger: SecureLogger;
}

export const buildTaskToolDefinitions = ({
  service,
  logger
}: RegisterTaskToolsOptions): ToolDefinition[] => {
  const emptyInput = z.object({}).strict();

  const nextTaskTool: ToolDefinition = {
    name: 'next_task',
    title: 'Next task',
    description: 'Return the highest-priority ready task based on dependency satisfaction and tie-break rules.',
    inputSchema: emptyInput,
    handler: async () => {
      const task = service.next();
      if (!task) {
        logger.info('next_task_empty');
        return {
          content: 'No ready tasks. All dependencies may be incomplete.',
          structuredResult: { task: null, ready: [] }
        };
      }

      const readyList = computeReadyTasks(service.list());

      logger.info('next_task_selected', { id: task.id, title: task.title });
      return {
        content: `Next ready task: #${task.id} – ${task.title}`,
        structuredResult: {
          task: serializeTask(task),
          ready: readyList.map((ready) => serializeTask(ready))
        }
      };
    }
  };

  const getTaskTool: ToolDefinition = {
    name: 'get_task',
    title: 'Get task by id',
    description: 'Return a single task, including subtasks, for the given numeric id.',
    inputSchema: z.object({ id: idSchema }).strict(),
    handler: async (rawArgs) => {
      const parseResult = getTaskTool.inputSchema.safeParse(rawArgs ?? {});
      if (!parseResult.success) {
        const message = parseResult.error.issues.map((issue) => issue.message).join('\n');
        logger.warn('get_task_invalid_input', { issues: parseResult.error.flatten() });
        return {
          content: `Invalid input for get_task:\n${message}`,
          isError: true
        };
      }

      const task = service.get(parseResult.data.id);
      if (!task) {
        logger.warn('get_task_not_found', { id: parseResult.data.id });
        return {
          content: `Task ${parseResult.data.id} was not found.`,
          isError: true
        };
      }

      return {
        content: `Task ${task.id}: ${task.title}`,
        structuredResult: { task: serializeTask(task) }
      };
    }
  };

  const listTasksTool: ToolDefinition = {
    name: 'list_tasks',
    title: 'List all tasks',
    description: 'Return the full canonical task list with statuses and dependencies.',
    inputSchema: emptyInput,
    handler: async () => {
      const tasks = service.list();
      logger.info('list_tasks', { count: tasks.length });
      return {
        content: `Returned ${tasks.length} tasks.`,
        structuredResult: { tasks: tasks.map((task) => serializeTask(task)) }
      };
    }
  };

  const graphExportTool: ToolDefinition = {
    name: 'graph_export',
    title: 'Export task dependency graph',
    description: 'Return nodes suitable for graph visualisation, including dependencies and status.',
    inputSchema: emptyInput,
    handler: async () => {
      const graph = service.graph();
      logger.info('graph_export', { count: graph.nodes.length });
      return {
        content: `Exported ${graph.nodes.length} graph nodes.`,
        structuredResult: graph
      };
    }
  };

  const setTaskStatusTool: ToolDefinition = {
    name: 'set_task_status',
    title: 'Update task status',
    description:
      'Update the canonical status for a task. Persistence occurs only when the server write mode is enabled.',
    inputSchema: z
      .object({
        id: idSchema,
        status: statusSchema
      })
      .strict(),
    handler: async (rawArgs) => {
      const parseResult = setTaskStatusTool.inputSchema.safeParse(rawArgs ?? {});
      if (!parseResult.success) {
        const message = parseResult.error.issues.map((issue) => issue.message).join('\n');
        logger.warn('set_task_status_invalid_input', { issues: parseResult.error.flatten() });
        return {
          content: `Invalid input for set_task_status:\n${message}`,
          isError: true
        };
      }

      let result: SetTaskStatusResult;
      try {
        result = await service.setStatus(parseResult.data.id, parseResult.data.status);
      } catch (error) {
        logger.error('set_task_status_failed', { error, id: parseResult.data.id });
        return {
          content: `Failed to update task ${parseResult.data.id}: ${(error as Error).message}`,
          isError: true
        };
      }

      logger.info('set_task_status_completed', {
        id: result.task.id,
        status: result.task.status,
        persisted: result.persisted
      });

      const message = result.persisted
        ? `Task ${result.task.id} status updated to ${result.task.status}.`
        : `Write mode disabled. Task ${result.task.id} remains ${result.task.status}.`;

      return {
        content: message,
        structuredResult: {
          task: serializeTask(result.task),
          persisted: result.persisted
        }
      };
    }
  };

  return [nextTaskTool, getTaskTool, listTasksTool, graphExportTool, setTaskStatusTool];
};

export const registerTaskTools = (server: McpServer, options: RegisterTaskToolsOptions): void => {
  const tools = buildTaskToolDefinitions(options);

  for (const tool of tools) {
    const schema = tool.inputSchema as z.ZodObject<any> | undefined;
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: schema ? schema.shape : {},
        annotations: {
          idempotentHint: tool.name === 'set_task_status' ? false : true
        }
      },
      async (rawArgs: unknown) => {
        const result = await tool.handler(rawArgs);
        return {
          content: buildTextContent(result.content),
          structuredResult: result.structuredResult,
          isError: result.isError
        };
      }
    );
  }
};
