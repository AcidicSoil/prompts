import { resolve } from 'node:path';
import { ingestTasks } from '../adapters/taskmaster/ingest.js';
import { TaskService, computeReadyTasks } from '../mcp/task-service.js';
const LF = '\n';
const resolveTasksPath = ({ tasksPath, cwd }) => resolve(cwd ?? process.cwd(), tasksPath);
export const loadIngest = async (options) => ingestTasks(resolveTasksPath(options), { tag: options.tag });
export const createTaskService = async (options) => {
    const service = new TaskService({
        tasksPath: resolveTasksPath(options),
        tag: options.tag,
        writeEnabled: options.writeEnabled
    });
    await service.load();
    return service;
};
export const runNext = async (options) => {
    const service = await createTaskService({ ...options, writeEnabled: false });
    const tasks = service.list();
    return {
        task: service.next(),
        ready: computeReadyTasks(tasks)
    };
};
export const runAdvance = async (options, id, status, writeEnabled) => {
    const service = await createTaskService({ ...options, writeEnabled });
    return service.setStatus(id, status);
};
export const runGraph = async (options) => {
    const service = await createTaskService({ ...options, writeEnabled: false });
    return service.graph();
};
export const summarizeStatuses = (tasks) => tasks.reduce((totals, task) => {
    totals[task.status] = (totals[task.status] ?? 0) + 1;
    return totals;
}, {
    pending: 0,
    in_progress: 0,
    blocked: 0,
    done: 0,
    deprecated: 0
});
export const formatGraphDot = (nodes) => {
    const lines = ['digraph TaskGraph {', '  rankdir=LR;', '  node [shape=box];'];
    for (const node of nodes) {
        const escapedTitle = node.title.replaceAll('"', '\\"');
        const label = `#${node.id}: ${escapedTitle}`;
        lines.push(`  "${node.id}" [label="${label}\\nstatus=${node.status}\\npriority=${node.priority}"];`);
    }
    for (const node of nodes) {
        for (const dependency of node.dependencies) {
            lines.push(`  "${dependency}" -> "${node.id}";`);
        }
    }
    lines.push('}');
    return lines.join(LF);
};
export const buildStatusSummary = async (options) => {
    const service = await createTaskService({ ...options, writeEnabled: false });
    const tasks = service.list();
    const ready = computeReadyTasks(tasks);
    const next = service.next();
    return {
        summary: summarizeStatuses(tasks),
        next: next ? { id: next.id, title: next.title } : null,
        ready: ready.map((task) => ({ id: task.id, title: task.title })),
        total: tasks.length
    };
};
