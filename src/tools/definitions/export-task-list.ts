import { promises as fs } from 'node:fs';
import path from 'node:path';

import yaml from 'js-yaml';
import { z } from 'zod';

const metadataEntrySchema = z
  .object({
    id: z.string().min(1, 'id is required'),
    title: z.string().min(1, 'title is required'),
    dependsOn: z.array(z.string()).optional().default([]),
  })
  .passthrough();

const metadataArraySchema = z.array(metadataEntrySchema);

export interface ExportedTask {
  id: string;
  title: string;
  dependsOn: string[];
  status: 'pending';
}

export interface ExportTaskListResult {
  ok: true;
  tasks: ExportedTask[];
}

export interface ExportTaskListTool {
  name: string;
  title: string;
  description: string;
  inputSchema: z.ZodObject<Record<string, never>>;
  handler: () => Promise<ExportTaskListResult>;
}

const METADATA_FILE = path.join(process.cwd(), 'resources', 'prompts.meta.yaml');

const loadMetadata = async (): Promise<ExportedTask[]> => {
  const raw = await fs.readFile(METADATA_FILE, 'utf8');
  const parsed = yaml.load(raw);
  const entries = metadataArraySchema.parse(parsed ?? []);
  return entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    dependsOn: entry.dependsOn ?? [],
    status: 'pending' as const,
  }));
};

const emptySchema = z.object({}).strict();

export const createExportTaskListTool = (): ExportTaskListTool => ({
  name: 'export_task_list',
  title: 'Export Task List',
  description: 'Expose prompts.meta.yaml as a normalized task list for external systems.',
  inputSchema: emptySchema,
  handler: async () => {
    const tasks = await loadMetadata();
    return {
      ok: true,
      tasks,
    } satisfies ExportTaskListResult;
  },
});
