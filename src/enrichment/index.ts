import type { PromptsTask } from '../types/prompts-task.js';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface EnrichmentWarning { message: string }

export interface EnrichmentResult {
  tasks: PromptsTask[];
  warnings: EnrichmentWarning[];
}

type Enricher = (tasks: PromptsTask[], projectRoot: string) => Promise<{ tasks: PromptsTask[]; warnings: EnrichmentWarning[] }>;

async function enrichWithComplexity(tasks: PromptsTask[], projectRoot: string) {
  const warnings: EnrichmentWarning[] = [];
  const out = tasks.map(t => ({ ...t, metadata: t.metadata ? { ...t.metadata } : undefined }));
  try {
    const path = join(projectRoot, 'artifacts', 'complexity.json');
    const raw = await readFile(path, 'utf8');
    const table = JSON.parse(raw) as Record<string, unknown>;
    for (const task of out) {
      const key = String(task.id);
      if (Object.prototype.hasOwnProperty.call(table, key)) {
        const entry = (table as Record<string, unknown>)[key];
        const meta = task.metadata ?? (task.metadata = {});
        (meta as Record<string, unknown>).enrichment = {
          ...(meta as Record<string, unknown>).enrichment as Record<string, unknown> | undefined,
          complexity: entry,
        };
      }
    }
  } catch (err) {
    warnings.push({ message: `complexity enrichment skipped: ${(err as Error).message}` });
  }
  return { tasks: out, warnings };
}

const ENRICHERS: Enricher[] = [enrichWithComplexity];

export async function enrichTasks(tasks: PromptsTask[], projectRoot: string): Promise<EnrichmentResult> {
  let current = tasks.map((t) => ({ ...t, subtasks: t.subtasks.map(s => ({ ...s })) }));
  const warnings: EnrichmentWarning[] = [];
  for (const enricher of ENRICHERS) {
    try {
      const res = await enricher(current, projectRoot);
      current = res.tasks;
      warnings.push(...res.warnings);
    } catch (err) {
      warnings.push({ message: `enricher failed: ${(err as Error).message}` });
    }
  }
  return { tasks: current, warnings };
}

