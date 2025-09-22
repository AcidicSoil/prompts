import type { CanonicalTaskStatus, PromptsTask } from '../types/prompts-task.js';

const VALID_STATUSES: ReadonlySet<CanonicalTaskStatus> = new Set([
  'pending',
  'in_progress',
  'blocked',
  'done',
  'deprecated',
]);

const cloneTask = (task: PromptsTask): PromptsTask => ({ ...task });

export const advance = (
  tasks: readonly PromptsTask[],
  taskId: number,
  newStatus: CanonicalTaskStatus,
): PromptsTask[] => {
  if (!Array.isArray(tasks)) {
    throw new TypeError('Tasks collection must be an array.');
  }
  if (!Number.isInteger(taskId) || taskId < 1) {
    throw new RangeError('Task id must be a positive integer.');
  }
  if (!VALID_STATUSES.has(newStatus)) {
    throw new RangeError('New status must be a canonical Task-Master status value.');
  }

  let updated = false;

  const nextTasks = tasks.map((task) => {
    if (task.id !== taskId) {
      return task;
    }

    updated = true;

    if (task.status === newStatus) {
      return cloneTask(task);
    }

    return {
      ...task,
      status: newStatus,
    } satisfies PromptsTask;
  });

  if (!updated) {
    throw new Error(`Task with id ${taskId} was not found.`);
  }

  return nextTasks;
};

export type { PromptsTask } from '../types/prompts-task.js';
