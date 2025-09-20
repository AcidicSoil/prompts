/** Artifact metadata captured when a tool finishes. */
export interface Artifact {
  name: string;
  source: string;
  uri: string;
}

/**
 * Snapshot describing a single tool completion event along with any
 * produced artifacts and structured outputs.
 */
export interface ToolCompletion {
  id: string;
  completedAt: string;
  outputs: Record<string, unknown>;
  artifacts: Artifact[];
}
