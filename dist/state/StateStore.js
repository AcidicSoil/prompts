import { rename, writeFile, readFile, mkdir, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { coerceProjectState, createInitialProjectState, } from './ProjectState.js';
const LF = '\n';
const clone = (value) => typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
const isErrno = (error) => !!error && typeof error === 'object' && 'code' in error;
export class StateStore {
    projectRoot;
    mcpDir;
    statePath;
    state = createInitialProjectState();
    ensurePromise;
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.mcpDir = join(projectRoot, '.mcp');
        this.statePath = join(this.mcpDir, 'state.json');
    }
    async ensureStorage() {
        if (!this.ensurePromise) {
            this.ensurePromise = mkdir(this.mcpDir, { recursive: true }).then(() => undefined);
        }
        try {
            await this.ensurePromise;
        }
        catch (error) {
            this.ensurePromise = undefined;
            throw error;
        }
    }
    async load() {
        await this.ensureStorage();
        try {
            const raw = await readFile(this.statePath, 'utf8');
            this.state = coerceProjectState(JSON.parse(raw));
        }
        catch (error) {
            if (isErrno(error) && error.code === 'ENOENT') {
                this.state = createInitialProjectState();
            }
            else if (error instanceof SyntaxError) {
                throw new Error(`State file at ${this.statePath} is not valid JSON: ${error.message}`);
            }
            else {
                throw error;
            }
        }
        return this.getState();
    }
    getState() {
        return clone(this.state);
    }
    getCompletedToolIds() {
        return new Set(this.state.completedTools.map((completion) => completion.id));
    }
    getAvailableArtifacts() {
        return new Set(Object.keys(this.state.artifacts));
    }
    recordCompletion(id, outputs, artifacts) {
        const completion = {
            id,
            completedAt: new Date().toISOString(),
            outputs: clone(outputs ?? {}),
            artifacts: artifacts.map((artifact) => ({ ...artifact })),
        };
        this.state.completedTools = [
            ...this.state.completedTools.filter((existing) => existing.id !== id),
            completion,
        ];
        for (const artifact of artifacts) {
            this.state.artifacts[artifact.name] = { ...artifact };
        }
    }
    async save() {
        await this.ensureStorage();
        const payload = `${JSON.stringify(this.state, null, 2)}${LF}`;
        const tempPath = join(this.mcpDir, `state-${randomUUID()}.json.tmp`);
        await writeFile(tempPath, payload, 'utf8');
        try {
            await rename(tempPath, this.statePath);
        }
        catch (error) {
            await this.safeUnlink(tempPath);
            throw error;
        }
        finally {
            await this.safeUnlink(tempPath);
        }
    }
    async safeUnlink(path) {
        try {
            await unlink(path);
        }
        catch (error) {
            if (!isErrno(error) || error.code !== 'ENOENT') {
                throw error;
            }
        }
    }
}
