export type TaskPriority = 'high' | 'medium' | 'low';
export type CanonicalTaskStatus = 'pending' | 'in_progress' | 'blocked' | 'done' | 'deprecated';

export interface StatusAliasMap {
  readonly [alias: string]: CanonicalTaskStatus;
}

export const STATUS_ALIASES: StatusAliasMap = {
  pending: 'pending',
  todo: 'pending',
  backlog: 'pending',
  ready: 'pending',
  'in-progress': 'in_progress',
  in_progress: 'in_progress',
  started: 'in_progress',
  doing: 'in_progress',
  blocked: 'blocked',
  deferred: 'blocked',
  impeded: 'blocked',
  done: 'done',
  completed: 'done',
  complete: 'done',
  shipped: 'done',
  review: 'in_progress',
  deprecated: 'deprecated',
  retired: 'deprecated',
  cancelled: 'deprecated',
  canceled: 'deprecated'
} as const;

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
  /**
   * Optional absolute path to a tasks JSON Schema file. When omitted, the loader
   * resolves the schema relative to the installed module/package location.
   */
  schemaPath?: string;
}

export interface IngestResult {
  tasks: PromptsTask[];
  report: StatusNormalizationReport;
}
