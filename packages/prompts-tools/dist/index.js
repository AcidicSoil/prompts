import { z } from 'zod';
export const StatusEnum = z.enum(['pending', 'in_progress', 'blocked', 'done', 'deprecated']);
export const NextTaskInput = z.object({}).strict();
export const SetTaskStatusInput = z
    .object({ id: z.number().int().positive(), status: StatusEnum })
    .strict();
export const GraphExportInput = z.object({}).strict();
export const createPromptsTools = ({ service }) => {
    const nextTask = {
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
    const setTaskStatus = {
        name: 'set_task_status',
        input: SetTaskStatusInput,
        run: async (args) => {
            return service.setStatus(args.id, args.status);
        }
    };
    const graphExport = {
        name: 'graph_export',
        input: GraphExportInput,
        run: async () => service.graph()
    };
    return { nextTask, setTaskStatus, graphExport };
};
