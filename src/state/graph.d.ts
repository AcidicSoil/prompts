import type { CanonicalTaskStatus, PromptsTask } from '../types/prompts-task.js';
export declare const READY_STATUSES: ReadonlySet<CanonicalTaskStatus>;
export declare const SATISFIED_DEPENDENCY_STATUSES: ReadonlySet<CanonicalTaskStatus>;
export declare const computeReadiness: (tasks: PromptsTask[]) => PromptsTask[];
export declare const next: (tasks: PromptsTask[]) => PromptsTask | null;
