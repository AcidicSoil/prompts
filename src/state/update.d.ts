import type { CanonicalTaskStatus, PromptsTask } from '../types/prompts-task.js';
export declare const advance: (tasks: readonly PromptsTask[], taskId: number, newStatus: CanonicalTaskStatus) => PromptsTask[];
export type { PromptsTask } from '../types/prompts-task.js';
