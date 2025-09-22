#!/usr/bin/env node
// (no require needed)
import { resolve } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { Command } from 'commander';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createSecureLogger, logger as baseLogger } from '../logger.js';
import { TaskService } from './task-service.js';
import { StateStore } from '../state/StateStore.js';
import { createServer, connectServer } from '../server.js';
import { registerAllTools } from '../tools/index.js';
const secureLogger = createSecureLogger(baseLogger);
export const createTaskService = (options) => {
    return new TaskService({
        tasksPath: options.tasksPath,
        tag: options.tag,
        writeEnabled: options.writeEnabled
    });
};
export const startServer = async (options) => {
    const transport = options.transport ?? new StdioServerTransport();
    const service = createTaskService(options);
    await service.load();
    const server = createServer();
    // Initialize StateStore for workflow tools
    const stateStore = new StateStore(process.cwd());
    await stateStore.load();
    // Register all tools from a single hub
    await registerAllTools(server, secureLogger, { service, stateStore });
    transport.onerror = (error) => {
        secureLogger.error('transport_error', { error });
    };
    transport.onclose = () => {
        secureLogger.info('transport_closed');
    };
    await connectServer(server, transport);
    secureLogger.info('server_started', {
        tasksPath: options.tasksPath,
        tag: options.tag,
        writeEnabled: options.writeEnabled
    });
    const shutdown = async (signal) => {
        secureLogger.info('server_shutdown_signal', { signal });
        try {
            await server.close();
            await transport.close();
        }
        catch (error) {
            secureLogger.error('server_shutdown_error', { error });
        }
        finally {
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
    return { server, transport };
};
const buildCli = () => {
    const program = new Command();
    program
        .name('prompts-mcp-server')
        .description('Expose task management helpers over the Model Context Protocol stdio transport.')
        .option('--tasks <path>', 'Path to Task-Master tasks.json', '.taskmaster/tasks/tasks.json')
        .option('--tag <tag>', 'Task-Master tag to load', 'master')
        .option('--write-enabled', 'Persist task status changes to disk', false);
    return program;
};
const runCli = async () => {
    const program = buildCli();
    const parsed = program.parse(process.argv);
    const opts = parsed.opts();
    const tasksPath = resolve(process.cwd(), opts.tasks);
    try {
        await startServer({
            tasksPath,
            tag: opts.tag,
            writeEnabled: Boolean(opts.writeEnabled)
        });
    }
    catch (error) {
        secureLogger.error('server_start_failed', { error });
        process.exitCode = 1;
    }
};
const entryUrl = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : undefined;
if (entryUrl === import.meta.url) {
    void runCli();
}
