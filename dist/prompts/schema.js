import { z } from "zod";
const VARIABLE_TYPE_MAP = {
    string: () => z.string(),
    number: () => z.number(),
    boolean: () => z.boolean(),
};
const createSchemaForVariable = (variable) => {
    const factory = VARIABLE_TYPE_MAP[variable.type ?? "string"] ?? VARIABLE_TYPE_MAP.string;
    const schema = factory();
    const described = variable.description ? schema.describe(variable.description) : schema;
    return variable.required === false ? described.optional() : described;
};
export const generateToolSchemas = (definition) => {
    const variables = definition.variables ?? [];
    const input = variables.length
        ? variables.reduce((shape, variable) => {
            shape[variable.name] = createSchemaForVariable(variable);
            return shape;
        }, {})
        : undefined;
    const output = {
        content: z.string(),
    };
    return { input, output };
};
