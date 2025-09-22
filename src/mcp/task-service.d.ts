import { type CanonicalTaskStatus, type PromptsTask, type TaskPriority } from '../types/prompts-task.js';
export interface TaskRepositoryOptions {
    tasksPath: string;
    tag: string;
}
interface GraphNode {
    id: number;
    title: string;
    status: CanonicalTaskStatus;
    priority: TaskPriority;
    dependencies: number[];
}
export interface TaskServiceOptions extends TaskRepositoryOptions {
    writeEnabled: boolean;
}
export interface SetTaskStatusResult {
    task: PromptsTask;
    persisted: boolean;
}
export declare class TaskService {
    private readonly repository;
    private readonly writeEnabled;
    constructor(options: TaskServiceOptions);
    load(): Promise<void>;
    list(): PromptsTask[];
    get(id: number): PromptsTask | undefined;
    next(): PromptsTask | null;
    graph(): {
        nodes: GraphNode[];
    };
    setStatus(id: number, status: CanonicalTaskStatus): Promise<SetTaskStatusResult>;
}
export declare const computeReadyTasks: (tasks: PromptsTask[]) => PromptsTask[];
export {};
