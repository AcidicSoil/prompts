export const READY_STATUSES = new Set(['pending']);
export const SATISFIED_DEPENDENCY_STATUSES = new Set([
    'done',
    'deprecated',
]);
const buildStatusMap = (tasks) => {
    const map = new Map();
    for (const task of tasks) {
        map.set(task.id, task.status);
    }
    return map;
};
const dependenciesSatisfied = (task, statusById) => {
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
export const computeReadiness = (tasks) => {
    const statusById = buildStatusMap(tasks);
    return tasks.filter((task) => {
        if (!READY_STATUSES.has(task.status)) {
            return false;
        }
        return dependenciesSatisfied(task, statusById);
    });
};
const PRIORITY_ORDER = {
    high: 3,
    medium: 2,
    low: 1,
};
const buildDependentsCount = (tasks) => {
    const counts = new Map();
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
export const next = (tasks) => {
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
