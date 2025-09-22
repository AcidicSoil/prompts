import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import Ajv from 'ajv';
import type { ValidateFunction, ErrorObject } from 'ajv';

import {
  STATUS_ALIASES,
  type CanonicalTaskStatus,
  type IngestOptions,
  type IngestResult,
  type PromptsSubtask,
  type PromptsTask,
  type PromptsArtifactReference,
  type StatusNormalizationEntry,
  type StatusNormalizationReport,
  type TaskPriority
} from '../../types/prompts-task.js';

export class TaskIngestError extends Error {
  constructor(message: string, readonly context?: Record<string, unknown>) {
    super(message);
    this.name = 'TaskIngestError';
  }
}

export class TaskValidationError extends TaskIngestError {
  constructor(message: string, context: { taskId: number; errors: ErrorObject[] }) {
    super(message, context);
    this.name = 'TaskValidationError';
  }
}

const DEFAULT_SCHEMA_PATH = resolve(process.cwd(), 'schemas/task.json');
const DEFAULT_SUBTASK_STATUS: CanonicalTaskStatus = 'pending';
const ajv = new Ajv({
  allErrors: true,
  jsonPointers: true
});

let validatorCache: ValidateFunction | null = null;
let cachedSchemaPath: string | null = null;

async function getValidator(schemaPath: string): Promise<ValidateFunction> {
  if (validatorCache && cachedSchemaPath === schemaPath) {
    return validatorCache;
  }

  const schemaRaw = await readFile(schemaPath, 'utf8');
  const schemaJson = JSON.parse(schemaRaw) as unknown;
  const validator = ajv.compile(schemaJson as object) as ValidateFunction;
  validatorCache = validator;
  cachedSchemaPath = schemaPath;
  return validator;
}

function coerceTaskPriority(value: unknown, taskId: number): TaskPriority {
  if (typeof value !== 'string') {
    throw new TaskIngestError('Task priority must be a string', { taskId, value });
  }
  const normalized = value.toLowerCase();
  if (normalized === 'high' || normalized === 'medium' || normalized === 'low') {
    return normalized;
  }
  throw new TaskIngestError('Task priority is not recognised', { taskId, value });
}

function normalizeStatus(
  rawStatus: unknown,
  entity: 'task' | 'subtask',
  ids: { taskId: number; subtaskId?: number },
  report: StatusNormalizationReport
): CanonicalTaskStatus {
  if (typeof rawStatus !== 'string' || rawStatus.trim().length === 0) {
    throw new TaskIngestError('Status must be a non-empty string', { entity, ...ids, rawStatus });
  }

  const key = rawStatus.trim().toLowerCase();
  const canonical = STATUS_ALIASES[key];
  if (!canonical) {
    throw new TaskIngestError('Encountered unsupported status value', { entity, ...ids, rawStatus });
  }

  if (canonical !== rawStatus) {
    report.remapped.push({ entity, from: rawStatus, to: canonical, ...ids });
  }

  return canonical;
}

interface RawTaskDocument {
  tasks: unknown;
}

type RawTask = Record<string, unknown>;

function extractTasksFromDocument(doc: unknown, tag: string): RawTask[] {
  if (!doc || typeof doc !== 'object') {
    throw new TaskIngestError('tasks.json must contain an object at the root');
  }

  if (Array.isArray((doc as RawTaskDocument).tasks)) {
    return (doc as RawTaskDocument).tasks as RawTask[];
  }

  const tagged = doc as Record<string, unknown>;
  const tagEntry = tagged[tag];
  if (!tagEntry || typeof tagEntry !== 'object') {
    throw new TaskIngestError('Requested tag was not found in tasks.json', { tag });
  }
  const tasks = (tagEntry as RawTaskDocument).tasks;
  if (!Array.isArray(tasks)) {
    throw new TaskIngestError('Tag entry must include a tasks array', { tag });
  }
  return tasks as RawTask[];
}

function coerceDependencies(value: unknown, taskId: number): number[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new TaskIngestError('Task dependencies must be an array', { taskId, value });
  }
  return value.map((entry, index) => {
    if (typeof entry === 'number' && Number.isInteger(entry) && entry > 0) {
      return entry;
    }
    if (typeof entry === 'string' && /^\d+$/.test(entry.trim())) {
      return Number.parseInt(entry.trim(), 10);
    }
    throw new TaskIngestError('Task dependency must be a positive integer', {
      taskId,
      value: entry,
      index
    });
  });
}

function sanitizeString(value: unknown, context?: Record<string, unknown>, fallback?: string): string {
  if (typeof value === 'string') {
    return value;
  }
  if ((value === undefined || value === null) && fallback !== undefined) {
    return fallback;
  }
  throw new TaskIngestError('Expected a string value', { ...context, value });
}

function buildRequiredError(field: string): ErrorObject {
  return {
    dataPath: '',
    schemaPath: '#/required',
    keyword: 'required',
    params: { missingProperty: field },
    message: `must have required property '${field}'`
  };
}

function requireString(
  record: RawTask,
  field: string,
  ids: { taskId: number; subtaskId?: number }
): string {
  const value = record[field];
  if (typeof value === 'string') {
    return value;
  }
  throw new TaskValidationError(`Task missing required string property \"${field}\"`, {
    taskId: ids.taskId,
    errors: [buildRequiredError(field)]
  });
}

function sanitizeStringArray(value: unknown): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new TaskIngestError('Expected an array of strings', { value });
  }
  const result = value.map((entry, index) => {
    if (typeof entry !== 'string') {
      throw new TaskIngestError('Array entry must be a string', { value: entry, index });
    }
    return entry;
  });
  return result;
}

function sanitizeNumberArray(value: unknown, context: Record<string, unknown>): number[] | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new TaskIngestError('Expected an array of numbers', { ...context, value });
  }
  return value.map((entry, index) => {
    if (typeof entry !== 'number' || !Number.isInteger(entry) || entry < 1) {
      throw new TaskIngestError('Array entry must be a positive integer', { ...context, entry, index });
    }
    return entry;
  });
}

function sanitizeArtifacts(
  value: unknown,
  context: { taskId: number; subtaskId?: number }
): Array<string | PromptsArtifactReference> | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new TaskIngestError('Artifacts must be provided as an array', { ...context, value });
  }

  return value.map((entry, index) => {
    if (typeof entry === 'string') {
      return entry;
    }

    if (!entry || typeof entry !== 'object') {
      throw new TaskIngestError('Artifact entry must be a string or object', { ...context, entry, index });
    }

    const record = entry as Record<string, unknown>;
    const name = sanitizeString(record.name, { ...context, index, field: 'name' });
    const path = record.path === undefined ? undefined : sanitizeString(record.path, { ...context, index, field: 'path' });
    const type = record.type === undefined ? undefined : sanitizeString(record.type, { ...context, index, field: 'type' });

    return {
      name,
      path,
      type
    } satisfies PromptsArtifactReference;
  });
}

function sanitizeSubtaskDependencies(value: unknown, context: Record<string, unknown>): Array<number | string> | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new TaskIngestError('Subtask dependencies must be an array', { ...context, value });
  }
  return value.map((entry, index) => {
    if (typeof entry === 'number' && Number.isInteger(entry) && entry > 0) {
      return entry;
    }
    if (typeof entry === 'string' && entry.trim().length > 0) {
      return entry;
    }
    throw new TaskIngestError('Subtask dependency must be a positive integer or task reference', {
      ...context,
      entry,
      index
    });
  });
}

function normalizeSubtasks(
  rawSubtasks: unknown,
  taskId: number,
  report: StatusNormalizationReport
): PromptsSubtask[] {
  if (rawSubtasks === undefined) {
    return [];
  }
  if (!Array.isArray(rawSubtasks)) {
    throw new TaskIngestError('Subtasks must be provided as an array', { taskId, rawSubtasks });
  }

  return rawSubtasks.map((raw, index) => {
    if (!raw || typeof raw !== 'object') {
      throw new TaskIngestError('Subtask entries must be objects', { taskId, index, raw });
    }

    const record = raw as RawTask;
    const subtaskId = record.id;
    if (typeof subtaskId !== 'number' || !Number.isInteger(subtaskId) || subtaskId < 1) {
      throw new TaskIngestError('Subtask id must be a positive integer', { taskId, index, subtaskId });
    }

    const status =
      record.status === undefined
        ? DEFAULT_SUBTASK_STATUS
        : normalizeStatus(record.status, 'subtask', { taskId, subtaskId }, report);

    return {
      id: subtaskId,
      title: requireString(record, 'title', { taskId, subtaskId }),
      description: record.description === undefined ? undefined : sanitizeString(record.description, { taskId, subtaskId }),
      details: record.details === undefined ? undefined : sanitizeString(record.details, { taskId, subtaskId }),
      testStrategy: record.testStrategy === undefined ? undefined : sanitizeString(record.testStrategy, { taskId, subtaskId }),
      status,
      parentTaskId: record.parentTaskId === undefined ? undefined : (record.parentTaskId as number),
      dependencies: sanitizeSubtaskDependencies(record.dependencies, { taskId, subtaskId })
    } satisfies PromptsSubtask;
  });
}

function normalizeTask(rawTask: RawTask, report: StatusNormalizationReport): PromptsTask {
  const taskId = rawTask.id;
  if (typeof taskId !== 'number' || !Number.isInteger(taskId) || taskId < 1) {
    throw new TaskIngestError('Task id must be a positive integer', { taskId });
  }

  const status = normalizeStatus(rawTask.status, 'task', { taskId }, report);
  const dependencies = coerceDependencies(rawTask.dependencies, taskId);
  const subtasks = normalizeSubtasks(rawTask.subtasks, taskId, report);

  const task: PromptsTask = {
    id: taskId,
    title: requireString(rawTask, 'title', { taskId }),
    description: requireString(rawTask, 'description', { taskId }),
    status,
    dependencies,
    priority: coerceTaskPriority(rawTask.priority, taskId),
    details: requireString(rawTask, 'details', { taskId }),
    testStrategy: requireString(rawTask, 'testStrategy', { taskId }),
    subtasks,
    labels: sanitizeStringArray(rawTask.labels),
    metadata:
      rawTask.metadata && typeof rawTask.metadata === 'object' && !Array.isArray(rawTask.metadata)
        ? (rawTask.metadata as Record<string, unknown>)
        : undefined,
    evidence: Array.isArray(rawTask.evidence) ? (rawTask.evidence as Array<string | Record<string, unknown>>) : undefined,
    artifacts: sanitizeArtifacts(rawTask.artifacts, { taskId }),
    source_doc: rawTask.source_doc === undefined ? undefined : sanitizeString(rawTask.source_doc, { taskId }),
    lineage: sanitizeNumberArray(rawTask.lineage, { taskId, field: 'lineage' }),
    supersedes: sanitizeNumberArray(rawTask.supersedes, { taskId, field: 'supersedes' }),
    superseded_by: sanitizeNumberArray(rawTask.superseded_by, { taskId, field: 'superseded_by' }),
    reason: rawTask.reason === undefined ? undefined : sanitizeString(rawTask.reason, { taskId })
  };

  return task;
}

function canonicaliseTasks(rawTasks: RawTask[]): { tasks: PromptsTask[]; report: StatusNormalizationReport } {
  const report: StatusNormalizationReport = {
    total: rawTasks.length,
    remapped: []
  };
  const tasks = rawTasks.map((raw) => normalizeTask(raw, report));
  return { tasks, report };
}

export async function ingestTasks(
  filePath: string,
  options: IngestOptions = {}
): Promise<IngestResult> {
  const tag = options.tag ?? 'master';
  const schemaPath = DEFAULT_SCHEMA_PATH;

  const rawFile = await readFile(filePath, 'utf8');
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawFile);
  } catch (error) {
    throw new TaskIngestError('Failed to parse tasks.json', { cause: error });
  }

  const rawTasks = extractTasksFromDocument(parsed, tag);
  const { tasks, report } = canonicaliseTasks(rawTasks);

  const validator = await getValidator(schemaPath);
  for (const task of tasks) {
    const valid = validator(task);
    if (!valid) {
      throw new TaskValidationError('Task failed schema validation', {
        taskId: task.id,
        errors: validator.errors ?? []
      });
    }
  }

  return { tasks, report } satisfies IngestResult;
}
