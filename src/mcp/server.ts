#!/usr/bin/env node
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

import { Command } from 'commander';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { createSecureLogger, logger as baseLogger } from '../logger.js';
import { TaskService } from './task-service.js';
import { registerTaskTools } from './task-tools.js';

const require = createRequire(import.meta.url);
const packageJson = require('../../package.json') as { name?: string; version?: string };

export interface TaskServerOptions {
  tasksPath: string;
  tag: string;
  writeEnabled: boolean;
}

export interface StartServerOptions extends TaskServerOptions {
  transport?: StdioServerTransport;
}

const secureLogger = createSecureLogger(baseLogger);

export const createTaskService = (options: TaskServerOptions): TaskService => {
  return new TaskService({
    tasksPath: options.tasksPath,
    tag: options.tag,
    writeEnabled: options.writeEnabled
  });
};

export const startServer = async (options: StartServerOptions): Promise<{ server: McpServer; transport: StdioServerTransport }> => {
  const transport = options.transport ?? new StdioServerTransport();

  const service = createTaskService(options);
  await service.load();

  const serverInfo = {
    name: packageJson.name ? `${packageJson.name}-server` : 'prompts-mcp-server',
    version: packageJson.version ?? '0.0.0'
  };

  const mcpServer = new McpServer(serverInfo);

  registerTaskTools(mcpServer, { service, logger: secureLogger });

  transport.onerror = (error) => {
    secureLogger.error('transport_error', { error });
  };

  transport.onclose = () => {
    secureLogger.info('transport_closed');
  };

  mcpServer.server.onerror = (error) => {
    secureLogger.error('server_error', { error });
  };

  await mcpServer.connect(transport);

  secureLogger.info('server_started', {
    tasksPath: options.tasksPath,
    tag: options.tag,
    writeEnabled: options.writeEnabled
  });

  const shutdown = async (signal: string): Promise<void> => {
    secureLogger.info('server_shutdown_signal', { signal });
    try {
      await mcpServer.close();
      await transport.close();
    } catch (error) {
      secureLogger.error('server_shutdown_error', { error });
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  process.on('uncaughtException', (error) => {
    secureLogger.error('uncaught_exception', { error });
    void shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    secureLogger.error('unhandled_rejection', { reason });
    void shutdown('unhandledRejection');
  });

  return { server: mcpServer, transport };
};

const buildCli = (): Command => {
  const program = new Command();

  program
    .name('prompts-mcp-server')
    .description('Expose task management helpers over the Model Context Protocol stdio transport.')
    .option('--tasks <path>', 'Path to Task-Master tasks.json', '.taskmaster/tasks/tasks.json')
    .option('--tag <tag>', 'Task-Master tag to load', 'master')
    .option('--write-enabled', 'Persist task status changes to disk', false);

  return program;
};

const runCli = async (): Promise<void> => {
  const program = buildCli();
  const parsed = program.parse(process.argv);
  const opts = parsed.opts<{ tasks: string; tag: string; writeEnabled: boolean }>();

  const tasksPath = resolve(process.cwd(), opts.tasks);

  try {
    await startServer({
      tasksPath,
      tag: opts.tag,
      writeEnabled: Boolean(opts.writeEnabled)
    });
  } catch (error) {
    secureLogger.error('server_start_failed', { error });
    process.exitCode = 1;
  }
};

const entryUrl = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : undefined;

if (entryUrl === import.meta.url) {
  void runCli();
}
