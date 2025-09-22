import { z } from 'zod';
export declare const StatusEnum: z.ZodEnum<["pending", "in_progress", "blocked", "done", "deprecated"]>;
export declare const NextTaskInput: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
export declare const SetTaskStatusInput: z.ZodObject<{
    id: z.ZodNumber;
    status: z.ZodEnum<["pending", "in_progress", "blocked", "done", "deprecated"]>;
}, "strict", z.ZodTypeAny, {
    status: "pending" | "in_progress" | "blocked" | "done" | "deprecated";
    id: number;
}, {
    status: "pending" | "in_progress" | "blocked" | "done" | "deprecated";
    id: number;
}>;
export declare const GraphExportInput: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
export interface ToolHandler<I extends z.ZodTypeAny, O> {
    name: string;
    input: I;
    run: (args: z.infer<I>) => Promise<O>;
}
export interface TaskApi {
    list(): unknown[];
    next(): unknown | null;
    graph(): {
        nodes: unknown[];
    };
    setStatus(id: number, status: z.infer<typeof StatusEnum>): Promise<{
        task: unknown;
        persisted: boolean;
    }>;
}
export interface CreatePromptsToolsOptions {
    service: TaskApi;
}
export declare const createPromptsTools: ({ service }: CreatePromptsToolsOptions) => {
    nextTask: ToolHandler<z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>, {
        task: unknown;
        ready: unknown[];
    }>;
    setTaskStatus: ToolHandler<z.ZodObject<{
        id: z.ZodNumber;
        status: z.ZodEnum<["pending", "in_progress", "blocked", "done", "deprecated"]>;
    }, "strict", z.ZodTypeAny, {
        status: "pending" | "in_progress" | "blocked" | "done" | "deprecated";
        id: number;
    }, {
        status: "pending" | "in_progress" | "blocked" | "done" | "deprecated";
        id: number;
    }>, {
        task: unknown;
        persisted: boolean;
    }>;
    graphExport: ToolHandler<z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>, {
        nodes: unknown[];
    }>;
};
