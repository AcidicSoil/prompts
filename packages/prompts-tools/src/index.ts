import { z } from 'zod';

export const StatusEnum = z.enum(['pending', 'in_progress', 'blocked', 'done', 'deprecated']);

export const NextTaskInput = z.object({}).strict();
export const SetTaskStatusInput = z
  .object({ id: z.number().int().positive(), status: StatusEnum })
  .strict();
export const GraphExportInput = z.object({}).strict();

export interface ToolHandler<I extends z.ZodTypeAny, O> {
  name: string;
  input: I;
  run: (args: z.infer<I>) => Promise<O>;
}

export interface TaskApi {
  list(): unknown[];
  next(): unknown | null;
  graph(): { nodes: unknown[] };
  setStatus(id: number, status: z.infer<typeof StatusEnum>): Promise<{ task: unknown; persisted: boolean }>;
}

export interface CreatePromptsToolsOptions {
  service: TaskApi;
}

export const createPromptsTools = ({ service }: CreatePromptsToolsOptions) => {
  const nextTask: ToolHandler<typeof NextTaskInput, { task: unknown; ready: unknown[] }> = {
    name: 'next_task',
    input: NextTaskInput,
    run: async () => {
      const task = service.next();
      // Consumers can precompute and pass via list(); keeping simple here
      const ready = service.list();
      return {
        task: task ? JSON.parse(JSON.stringify(task)) : null,
        ready: ready.map((t) => JSON.parse(JSON.stringify(t)))
      };
    }
  };

  const setTaskStatus: ToolHandler<
    typeof SetTaskStatusInput,
    { task: unknown; persisted: boolean }
  > = {
    name: 'set_task_status',
    input: SetTaskStatusInput,
    run: async (args) => {
      return service.setStatus(args.id, args.status);
    }
  };

  const graphExport: ToolHandler<typeof GraphExportInput, { nodes: unknown[] }> = {
    name: 'graph_export',
    input: GraphExportInput,
    run: async () => service.graph()
  };

  return { nextTask, setTaskStatus, graphExport };
};
