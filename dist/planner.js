import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const isRecord = (value) => !!value && typeof value === 'object';
const normaliseNode = (value, index) => {
    if (!isRecord(value)) {
        throw new TypeError(`Graph node at index ${index} must be an object.`);
    }
    const { id, title, phase, dependsOn = [], requiresArtifacts = [], } = value;
    if (typeof id !== 'string' || id.length === 0) {
        throw new TypeError(`Graph node at index ${index} is missing a string id.`);
    }
    if (typeof title !== 'string' || title.length === 0) {
        throw new TypeError(`Graph node "${id}" is missing a string title.`);
    }
    if (typeof phase !== 'number' || Number.isNaN(phase)) {
        throw new TypeError(`Graph node "${id}" must declare a numeric phase.`);
    }
    const deps = Array.isArray(dependsOn) ? dependsOn.map(String) : [];
    const requiredArtifacts = Array.isArray(requiresArtifacts)
        ? requiresArtifacts.map(String)
        : [];
    return {
        id,
        title,
        phase,
        dependsOn: deps,
        requiresArtifacts: requiredArtifacts,
    };
};
const normaliseDocument = (value) => {
    if (!isRecord(value)) {
        throw new TypeError('Graph document must be an object.');
    }
    const nodes = Array.isArray(value.nodes) ? value.nodes.map(normaliseNode) : [];
    if (nodes.length === 0) {
        throw new TypeError('Graph document must include at least one node.');
    }
    return { nodes };
};
export class Planner {
    graph;
    stateStore;
    constructor(graphPath, stateStore) {
        const absoluteGraphPath = resolve(graphPath);
        const fileContent = readFileSync(absoluteGraphPath, 'utf8');
        const document = normaliseDocument(JSON.parse(fileContent));
        this.graph = document.nodes;
        this.stateStore = stateStore;
    }
    areDependenciesMet(node) {
        const completed = this.stateStore.getCompletedToolIds();
        return node.dependsOn.every((dependency) => completed.has(dependency));
    }
    areArtifactsAvailable(node) {
        const artifacts = this.stateStore.getAvailableArtifacts();
        return node.requiresArtifacts.every((artifact) => artifacts.has(artifact));
    }
    suggestNextCalls() {
        const completed = this.stateStore.getCompletedToolIds();
        return this.graph
            .filter((node) => {
            if (completed.has(node.id)) {
                return false;
            }
            if (!this.areDependenciesMet(node)) {
                return false;
            }
            if (!this.areArtifactsAvailable(node)) {
                return false;
            }
            return true;
        })
            .sort((a, b) => a.phase - b.phase || a.id.localeCompare(b.id));
    }
}
