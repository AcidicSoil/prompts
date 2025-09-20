import { rename, writeFile, readFile, mkdir, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';

import {
  coerceProjectState,
  createInitialProjectState,
  type Artifact,
  type ProjectState,
  type ToolCompletion,
} from './ProjectState.js';

const LF = '\n';

const clone = <T>(value: T): T =>
  typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));

const isErrno = (error: unknown): error is NodeJS.ErrnoException =>
  !!error && typeof error === 'object' && 'code' in error;

export class StateStore {
  private readonly mcpDir: string;
  readonly statePath: string;
  private state: ProjectState = createInitialProjectState();
  private ensurePromise?: Promise<void>;

  constructor(private readonly projectRoot: string) {
    this.mcpDir = join(projectRoot, '.mcp');
    this.statePath = join(this.mcpDir, 'state.json');
  }

  private async ensureStorage(): Promise<void> {
    if (!this.ensurePromise) {
      this.ensurePromise = mkdir(this.mcpDir, { recursive: true }).then(() => undefined);
    }

    try {
      await this.ensurePromise;
    } catch (error) {
      this.ensurePromise = undefined;
      throw error;
    }
  }

  async load(): Promise<ProjectState> {
    await this.ensureStorage();

    try {
      const raw = await readFile(this.statePath, 'utf8');
      this.state = coerceProjectState(JSON.parse(raw));
    } catch (error) {
      if (isErrno(error) && error.code === 'ENOENT') {
        this.state = createInitialProjectState();
      } else if (error instanceof SyntaxError) {
        throw new Error(`State file at ${this.statePath} is not valid JSON: ${error.message}`);
      } else {
        throw error;
      }
    }

    return this.getState();
  }

  getState(): ProjectState {
    return clone(this.state);
  }

  getCompletedToolIds(): Set<string> {
    return new Set(this.state.completedTools.map((completion) => completion.id));
  }

  getAvailableArtifacts(): Set<string> {
    return new Set(Object.keys(this.state.artifacts));
  }

  recordCompletion(id: string, outputs: Record<string, unknown>, artifacts: Artifact[]): void {
    const completion: ToolCompletion = {
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

  async save(): Promise<void> {
    await this.ensureStorage();

    const payload = `${JSON.stringify(this.state, null, 2)}${LF}`;

    const tempPath = join(this.mcpDir, `state-${randomUUID()}.json.tmp`);

    await writeFile(tempPath, payload, 'utf8');

    try {
      await rename(tempPath, this.statePath);
    } catch (error) {
      await this.safeUnlink(tempPath);
      throw error;
    } finally {
      await this.safeUnlink(tempPath);
    }
  }

  private async safeUnlink(path: string): Promise<void> {
    try {
      await unlink(path);
    } catch (error) {
      if (!isErrno(error) || error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
