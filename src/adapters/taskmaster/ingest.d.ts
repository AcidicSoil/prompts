import type { ErrorObject } from 'ajv';
import { type IngestOptions, type IngestResult } from '../../types/prompts-task.js';
export declare class TaskIngestError extends Error {
    readonly context?: Record<string, unknown> | undefined;
    constructor(message: string, context?: Record<string, unknown> | undefined);
}
export declare class TaskValidationError extends TaskIngestError {
    constructor(message: string, context: {
        taskId: number;
        errors: ErrorObject[];
    });
}
export declare function ingestTasks(filePath: string, options?: IngestOptions): Promise<IngestResult>;
