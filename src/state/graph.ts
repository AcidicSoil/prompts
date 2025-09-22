import type { CanonicalTaskStatus, PromptsTask, TaskPriority } from '../types/prompts-task.js';

export const READY_STATUSES: ReadonlySet<CanonicalTaskStatus> = new Set(['pending']);
export const SATISFIED_DEPENDENCY_STATUSES: ReadonlySet<CanonicalTaskStatus> = new Set([
  'done',
  'deprecated',
]);

const buildStatusMap = (tasks: PromptsTask[]): Map<number, CanonicalTaskStatus> => {
  const map = new Map<number, CanonicalTaskStatus>();
  for (const task of tasks) {
    map.set(task.id, task.status);
  }
  return map;
};

const dependenciesSatisfied = (
  task: PromptsTask,
  statusById: Map<number, CanonicalTaskStatus>,
): boolean => {
  for (const depId of task.dependencies) {
    if (!Number.isInteger(depId) || depId < 1) {
      return false;
    }
    if (depId === task.id) {
      return false;
    }
    const dependencyStatus = statusById.get(depId);
    if (!dependencyStatus || !SATISFIED_DEPENDENCY_STATUSES.has(dependencyStatus)) {
      return false;
    }
  }
  return true;
};

export const computeReadiness = (tasks: PromptsTask[]): PromptsTask[] => {
  const statusById = buildStatusMap(tasks);

  return tasks.filter((task) => {
    if (!READY_STATUSES.has(task.status)) {
      return false;
    }
    return dependenciesSatisfied(task, statusById);
  });
};

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const buildDependentsCount = (tasks: PromptsTask[]): Map<number, number> => {
  const counts = new Map<number, number>();
  for (const task of tasks) {
    counts.set(task.id, 0);
  }
  for (const task of tasks) {
    for (const dependency of task.dependencies) {
      if (!Number.isInteger(dependency)) {
        continue;
      }
      counts.set(dependency, (counts.get(dependency) ?? 0) + 1);
    }
  }
  return counts;
};

export const next = (tasks: PromptsTask[]): PromptsTask | null => {
  const ready = computeReadiness(tasks);
  if (ready.length === 0) {
    return null;
  }

  const dependentsCount = buildDependentsCount(tasks);

  const sorted = [...ready].sort((a, b) => {
    const priorityDelta = (PRIORITY_ORDER[b.priority] ?? 0) - (PRIORITY_ORDER[a.priority] ?? 0);
    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    const dependentsDelta = (dependentsCount.get(b.id) ?? 0) - (dependentsCount.get(a.id) ?? 0);
    if (dependentsDelta !== 0) {
      return dependentsDelta;
    }

    return a.id - b.id;
  });

  return sorted[0] ?? null;
};
