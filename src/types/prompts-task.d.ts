export type TaskPriority = 'high' | 'medium' | 'low';
export type CanonicalTaskStatus = 'pending' | 'in_progress' | 'blocked' | 'done' | 'deprecated';
export interface StatusAliasMap {
    readonly [alias: string]: CanonicalTaskStatus;
}
export declare const STATUS_ALIASES: StatusAliasMap;
export interface PromptsArtifactReference {
    name: string;
    path?: string;
    type?: string;
}
export interface PromptsEvidenceReference {
    source?: string;
    summary?: string;
    date?: string;
    link?: string;
}
export interface PromptsSubtask {
    id: number;
    title: string;
    description?: string;
    details?: string;
    testStrategy?: string;
    status: CanonicalTaskStatus;
    parentTaskId?: number;
    dependencies?: Array<number | string>;
}
export interface PromptsTask {
    id: number;
    title: string;
    description: string;
    status: CanonicalTaskStatus;
    dependencies: number[];
    priority: TaskPriority;
    details: string;
    testStrategy: string;
    subtasks: PromptsSubtask[];
    labels?: string[];
    metadata?: Record<string, unknown>;
    evidence?: Array<string | PromptsEvidenceReference>;
    artifacts?: Array<string | PromptsArtifactReference>;
    source_doc?: string;
    lineage?: number[];
    supersedes?: number[];
    superseded_by?: number[];
    reason?: string;
}
export interface StatusNormalizationEntry {
    entity: 'task' | 'subtask';
    taskId: number;
    subtaskId?: number;
    from: string;
    to: CanonicalTaskStatus;
}
export interface StatusNormalizationReport {
    total: number;
    remapped: StatusNormalizationEntry[];
}
export interface IngestOptions {
    /**
     * Optional tag to extract from Task-Master tagged task files. Defaults to "master".
     */
    tag?: string;
}
export interface IngestResult {
    tasks: PromptsTask[];
    report: StatusNormalizationReport;
}
