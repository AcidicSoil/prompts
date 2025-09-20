import { z, ZodRawShape } from "zod";

import { PromptDefinition, PromptVariable } from "./loader.js";

export interface ToolSchemas {
  input: ZodRawShape | undefined;
  output: ZodRawShape;
}

const VARIABLE_TYPE_MAP: Record<string, () => z.ZodTypeAny> = {
  string: () => z.string(),
  number: () => z.number(),
  boolean: () => z.boolean(),
};

const createSchemaForVariable = (variable: PromptVariable) => {
  const factory = VARIABLE_TYPE_MAP[variable.type ?? "string"] ?? VARIABLE_TYPE_MAP.string;
  const schema = factory();
  const described = variable.description ? schema.describe(variable.description) : schema;
  return variable.required === false ? described.optional() : described;
};

export const generateToolSchemas = (definition: PromptDefinition): ToolSchemas => {
  const variables = definition.variables ?? [];
  const input: ZodRawShape | undefined = variables.length
    ? variables.reduce<ZodRawShape>((shape, variable) => {
        shape[variable.name] = createSchemaForVariable(variable);
        return shape;
      }, {})
    : undefined;

  const output: ZodRawShape = {
    content: z.string(),
  };

  return { input, output };
};
