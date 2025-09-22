import { readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ingestTasks, TaskIngestError, TaskValidationError } from '../adapters/taskmaster/ingest.js';
import { computeReadiness, next as selectNext } from '../state/graph.js';
import { advance } from '../state/update.js';
const ensureArray = (value, errorMessage) => {
    if (!Array.isArray(value)) {
        throw new TaskIngestError(errorMessage, { value });
    }
    return value;
};
const isRecord = (value) => !!value && typeof value === 'object';
class TaskRepository {
    tasksPath;
    tag;
    rawDocument = null;
    rawTasks = [];
    rawTaskById = new Map();
    tasks = [];
    constructor(options) {
        this.tasksPath = resolve(options.tasksPath);
        this.tag = options.tag;
    }
    async load() {
        const raw = await readFile(this.tasksPath, 'utf8');
        this.rawDocument = JSON.parse(raw);
        this.rawTasks = this.extractRawTasks(this.rawDocument);
        this.rawTaskById = new Map();
        for (const entry of this.rawTasks) {
            const id = entry.id;
            if (typeof id === 'number' && Number.isInteger(id)) {
                this.rawTaskById.set(id, entry);
            }
        }
        const { tasks } = await ingestTasks(this.tasksPath, { tag: this.tag });
        this.tasks = tasks;
    }
    list() {
        return this.tasks.map((task) => ({ ...task, subtasks: task.subtasks.map((subtask) => ({ ...subtask })) }));
    }
    getById(id) {
        return this.tasks.find((task) => task.id === id);
    }
    getNext() {
        return selectNext(this.tasks);
    }
    getGraph() {
        return this.tasks.map((task) => ({
            id: task.id,
            title: task.title,
            status: task.status,
            priority: task.priority,
            dependencies: [...task.dependencies]
        }));
    }
    applyStatusUpdate(id, status) {
        this.tasks = advance(this.tasks, id, status);
        const updated = this.getById(id);
        if (!updated) {
            throw new Error(`Task ${id} missing after update`);
        }
        const raw = this.rawTaskById.get(id);
        if (raw) {
            raw.status = status;
        }
        return updated;
    }
    async persist() {
        if (!this.rawDocument) {
            throw new Error('Task repository not loaded.');
        }
        const payload = `${JSON.stringify(this.rawDocument, null, 2)}\n`;
        const tempPath = `${this.tasksPath}.${Date.now()}.tmp`;
        await writeFile(tempPath, payload, 'utf8');
        try {
            await rename(tempPath, this.tasksPath);
        }
        catch (error) {
            await unlink(tempPath).catch(() => {
                /* ignore */
            });
            throw error;
        }
    }
    extractRawTasks(document) {
        if (Array.isArray(document)) {
            return ensureArray(document, 'tasks.json root must be an array for legacy format');
        }
        if (!isRecord(document)) {
            throw new TaskIngestError('tasks.json must be an object or array at the root', { document });
        }
        const tagEntry = document[this.tag];
        if (Array.isArray(tagEntry)) {
            return ensureArray(tagEntry, 'Tag entry must be an array of tasks.');
        }
        if (isRecord(tagEntry)) {
            const tasks = tagEntry.tasks;
            const taskArray = ensureArray(tasks, 'Tag entry must contain a tasks array.');
            return taskArray;
        }
        const tasks = document.tasks;
        if (Array.isArray(tasks)) {
            return ensureArray(tasks, 'Root tasks entry must be an array.');
        }
        throw new TaskIngestError('Unable to locate tasks array in tasks.json', {
            keys: Object.keys(document)
        });
    }
}
export class TaskService {
    repository;
    writeEnabled;
    constructor(options) {
        this.repository = new TaskRepository(options);
        this.writeEnabled = options.writeEnabled;
    }
    async load() {
        await this.repository.load();
    }
    list() {
        return this.repository.list();
    }
    get(id) {
        return this.repository.getById(id);
    }
    next() {
        return this.repository.getNext();
    }
    graph() {
        return { nodes: this.repository.getGraph() };
    }
    async setStatus(id, status) {
        if (!this.writeEnabled) {
            const task = this.repository.getById(id);
            if (!task) {
                throw new TaskValidationError(`Task with id ${id} not found`, {
                    taskId: id,
                    errors: []
                });
            }
            return { task, persisted: false };
        }
        const updated = this.repository.applyStatusUpdate(id, status);
        await this.repository.persist();
        return { task: updated, persisted: true };
    }
}
export const computeReadyTasks = (tasks) => computeReadiness(tasks);
