import type { Artifact, ToolCompletion } from './state-types.js';

export interface ProjectState {
  completedTools: ToolCompletion[];
  artifacts: Record<string, Artifact>;
}

export const createInitialProjectState = (): ProjectState => ({
  completedTools: [],
  artifacts: {},
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object';

const sanitizeArtifactMap = (raw: unknown): Record<string, Artifact> => {
  if (!isRecord(raw)) {
    throw new TypeError('State artifacts payload must be an object.');
  }

  const entries = Object.entries(raw).map(([key, value]) => {
    if (!isRecord(value)) {
      throw new TypeError(`Artifact entry ${key} must be an object.`);
    }

    const { name, source, uri } = value as Partial<Artifact>;

    if (typeof name !== 'string' || typeof source !== 'string' || typeof uri !== 'string') {
      throw new TypeError(`Artifact entry ${key} missing required fields.`);
    }

    const artifact: Artifact = { name, source, uri };
    return [key, artifact] as const;
  });

  return Object.fromEntries(entries);
};

const sanitizeCompletions = (raw: unknown): ToolCompletion[] => {
  if (!Array.isArray(raw)) {
    throw new TypeError('State completedTools payload must be an array.');
  }

  return raw.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new TypeError(`Completion entry at index ${index} must be an object.`);
    }

    const { id, completedAt, outputs, artifacts } = entry as Partial<ToolCompletion>;

    if (typeof id !== 'string' || typeof completedAt !== 'string') {
      throw new TypeError(`Completion entry at index ${index} missing required fields.`);
    }

    const safeOutputs = isRecord(outputs) ? (outputs as Record<string, unknown>) : {};
    const safeArtifacts = Array.isArray(artifacts)
      ? artifacts.map((artifact, artifactIndex) => {
          if (!isRecord(artifact)) {
            throw new TypeError(
              `Artifact entry at completion ${index}, position ${artifactIndex} must be an object.`,
            );
          }

          const { name, source, uri } = artifact as Partial<Artifact>;

          if (typeof name !== 'string' || typeof source !== 'string' || typeof uri !== 'string') {
            throw new TypeError(
              `Artifact entry at completion ${index}, position ${artifactIndex} missing required fields.`,
            );
          }

          return { name, source, uri } as Artifact;
        })
      : [];

    const completion: ToolCompletion = {
      id,
      completedAt,
      outputs: safeOutputs,
      artifacts: safeArtifacts,
    };

    return completion;
  });
};

export const coerceProjectState = (payload: unknown): ProjectState => {
  if (!isRecord(payload)) {
    throw new TypeError('State payload must be an object.');
  }

  return {
    completedTools: sanitizeCompletions(payload.completedTools),
    artifacts: sanitizeArtifactMap(payload.artifacts),
  };
};

export type { Artifact, ToolCompletion } from './state-types.js';
