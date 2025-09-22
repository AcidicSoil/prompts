export const createInitialProjectState = () => ({
    completedTools: [],
    artifacts: {},
});
const isRecord = (value) => !!value && typeof value === 'object';
const sanitizeArtifactMap = (raw) => {
    if (!isRecord(raw)) {
        throw new TypeError('State artifacts payload must be an object.');
    }
    const entries = Object.entries(raw).map(([key, value]) => {
        if (!isRecord(value)) {
            throw new TypeError(`Artifact entry ${key} must be an object.`);
        }
        const { name, source, uri } = value;
        if (typeof name !== 'string' || typeof source !== 'string' || typeof uri !== 'string') {
            throw new TypeError(`Artifact entry ${key} missing required fields.`);
        }
        const artifact = { name, source, uri };
        return [key, artifact];
    });
    return Object.fromEntries(entries);
};
const sanitizeCompletions = (raw) => {
    if (!Array.isArray(raw)) {
        throw new TypeError('State completedTools payload must be an array.');
    }
    return raw.map((entry, index) => {
        if (!isRecord(entry)) {
            throw new TypeError(`Completion entry at index ${index} must be an object.`);
        }
        const { id, completedAt, outputs, artifacts } = entry;
        if (typeof id !== 'string' || typeof completedAt !== 'string') {
            throw new TypeError(`Completion entry at index ${index} missing required fields.`);
        }
        const safeOutputs = isRecord(outputs) ? outputs : {};
        const safeArtifacts = Array.isArray(artifacts)
            ? artifacts.map((artifact, artifactIndex) => {
                if (!isRecord(artifact)) {
                    throw new TypeError(`Artifact entry at completion ${index}, position ${artifactIndex} must be an object.`);
                }
                const { name, source, uri } = artifact;
                if (typeof name !== 'string' || typeof source !== 'string' || typeof uri !== 'string') {
                    throw new TypeError(`Artifact entry at completion ${index}, position ${artifactIndex} missing required fields.`);
                }
                return { name, source, uri };
            })
            : [];
        const completion = {
            id,
            completedAt,
            outputs: safeOutputs,
            artifacts: safeArtifacts,
        };
        return completion;
    });
};
export const coerceProjectState = (payload) => {
    if (!isRecord(payload)) {
        throw new TypeError('State payload must be an object.');
    }
    return {
        completedTools: sanitizeCompletions(payload.completedTools),
        artifacts: sanitizeArtifactMap(payload.artifacts),
    };
};
