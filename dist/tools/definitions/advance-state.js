import { z } from 'zod';
const artifactSchema = z.object({
    name: z.string().min(1, 'Artifact name is required'),
    source: z.string().min(1, 'Artifact source is required'),
    uri: z.string().min(1, 'Artifact uri is required'),
});
export const advanceStateInputSchema = z
    .object({
    id: z.string().min(1, 'Tool id is required'),
    outputs: z
        .object({})
        .catchall(z.unknown())
        .default({}),
    artifacts: z.array(artifactSchema).default([]),
})
    .strict();
export const createAdvanceStateTool = (stateStore) => ({
    name: 'advance_state',
    title: 'Advance Workflow State',
    description: 'Record a completed workflow tool, capture its outputs, and persist any produced artifacts.',
    inputSchema: advanceStateInputSchema,
    handler: async (input) => {
        const { id, outputs, artifacts } = input;
        stateStore.recordCompletion(id, outputs, artifacts);
        await stateStore.save();
        return {
            ok: true,
            statePath: stateStore.statePath,
        };
    },
});
