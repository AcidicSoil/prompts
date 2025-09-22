import { readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import {
  type CanonicalTaskStatus,
  type PromptsTask,
  type TaskPriority
} from '../types/prompts-task.js';
import {
  ingestTasks,
  TaskIngestError,
  TaskValidationError
} from '../adapters/taskmaster/ingest.js';
import { computeReadiness, next as selectNext } from '../state/graph.js';
import { advance } from '../state/update.js';

export interface TaskRepositoryOptions {
  tasksPath: string;
  tag: string;
}

type RawDocument = Record<string, unknown> | unknown[];

interface GraphNode {
  id: number;
  title: string;
  status: CanonicalTaskStatus;
  priority: TaskPriority;
  dependencies: number[];
}

const ensureArray = <T>(value: unknown, errorMessage: string): T[] => {
  if (!Array.isArray(value)) {
    throw new TaskIngestError(errorMessage, { value });
  }
  return value as T[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object';

class TaskRepository {
  private readonly tasksPath: string;
  private readonly tag: string;
  private rawDocument: RawDocument | null = null;
  private rawTasks: Record<string, unknown>[] = [];
  private rawTaskById = new Map<number, Record<string, unknown>>();
  private tasks: PromptsTask[] = [];

  constructor(options: TaskRepositoryOptions) {
    this.tasksPath = resolve(options.tasksPath);
    this.tag = options.tag;
  }

  async load(): Promise<void> {
    const raw = await readFile(this.tasksPath, 'utf8');
    this.rawDocument = JSON.parse(raw) as RawDocument;
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

  list(): PromptsTask[] {
    return this.tasks.map((task) => ({ ...task, subtasks: task.subtasks.map((subtask) => ({ ...subtask })) }));
  }

  getById(id: number): PromptsTask | undefined {
    return this.tasks.find((task) => task.id === id);
  }

  getNext(): PromptsTask | null {
    return selectNext(this.tasks);
  }

  getGraph(): GraphNode[] {
    return this.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      dependencies: [...task.dependencies]
    }));
  }

  applyStatusUpdate(id: number, status: CanonicalTaskStatus): PromptsTask {
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

  async persist(): Promise<void> {
    if (!this.rawDocument) {
      throw new Error('Task repository not loaded.');
    }

    const payload = `${JSON.stringify(this.rawDocument, null, 2)}\n`;
    const tempPath = `${this.tasksPath}.${Date.now()}.tmp`;

    await writeFile(tempPath, payload, 'utf8');

    try {
      await rename(tempPath, this.tasksPath);
    } catch (error) {
      await unlink(tempPath).catch(() => {
        /* ignore */
      });
      throw error;
    }
  }

  private extractRawTasks(document: RawDocument): Record<string, unknown>[] {
    if (Array.isArray(document)) {
      return ensureArray<Record<string, unknown>>(document, 'tasks.json root must be an array for legacy format');
    }

    if (!isRecord(document)) {
      throw new TaskIngestError('tasks.json must be an object or array at the root', { document });
    }

    const tagEntry = document[this.tag];
    if (Array.isArray(tagEntry)) {
      return ensureArray<Record<string, unknown>>(tagEntry, 'Tag entry must be an array of tasks.');
    }

    if (isRecord(tagEntry)) {
      const tasks = tagEntry.tasks;
      const taskArray = ensureArray<Record<string, unknown>>(tasks, 'Tag entry must contain a tasks array.');
      return taskArray;
    }

    const tasks = document.tasks;
    if (Array.isArray(tasks)) {
      return ensureArray<Record<string, unknown>>(tasks, 'Root tasks entry must be an array.');
    }

    throw new TaskIngestError('Unable to locate tasks array in tasks.json', {
      keys: Object.keys(document)
    });
  }
}

export interface TaskServiceOptions extends TaskRepositoryOptions {
  writeEnabled: boolean;
}

export interface SetTaskStatusResult {
  task: PromptsTask;
  persisted: boolean;
}

export class TaskService {
  private readonly repository: TaskRepository;
  private readonly writeEnabled: boolean;

  constructor(options: TaskServiceOptions) {
    this.repository = new TaskRepository(options);
    this.writeEnabled = options.writeEnabled;
  }

  async load(): Promise<void> {
    await this.repository.load();
  }

  list(): PromptsTask[] {
    return this.repository.list();
  }

  get(id: number): PromptsTask | undefined {
    return this.repository.getById(id);
  }

  next(): PromptsTask | null {
    return this.repository.getNext();
  }

  graph(): { nodes: GraphNode[] } {
    return { nodes: this.repository.getGraph() };
  }

  async setStatus(id: number, status: CanonicalTaskStatus): Promise<SetTaskStatusResult> {
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

export const computeReadyTasks = (tasks: PromptsTask[]): PromptsTask[] => computeReadiness(tasks);
