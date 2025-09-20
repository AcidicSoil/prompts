import { readFile } from "node:fs/promises";
import path from "node:path";

import { capPayload } from "../utils/safety.js";
import { PromptDefinition } from "../prompts/loader.js";

const FOOTER = "\n\n---\n_Served via MCP prompt tool._";

export interface PromptHandlerOptions {
  payloadLimit?: number;
  footerTemplate?: string;
}

export const DEFAULT_TOOL_PAYLOAD_LIMIT = 1024 * 1024;

const renderFooter = (template: string, definition: PromptDefinition): string => {
  return template.replaceAll("{id}", definition.id).replaceAll("{title}", definition.title);
};

export interface PromptToolResult extends Record<string, unknown> {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

export type PromptToolHandler = (args: Record<string, unknown>) => Promise<PromptToolResult>;

export const createPromptToolHandler = (
  definition: PromptDefinition,
  fileRoot: string,
  options: PromptHandlerOptions = {},
) => {
  const payloadLimit = options.payloadLimit ?? DEFAULT_TOOL_PAYLOAD_LIMIT;
  const footerTemplate = options.footerTemplate ?? FOOTER;
  const absolutePath = path.isAbsolute(definition.path)
    ? definition.path
    : path.resolve(fileRoot, definition.path);

  const handler: PromptToolHandler = async () => {
    let rawContent: string;
    try {
      rawContent = await readFile(absolutePath, "utf8");
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Failed to read prompt file at ${absolutePath}: ${(error as Error).message}`,
          },
        ],
      };
    }

    const footer = renderFooter(footerTemplate, definition);
    const text = capPayload(`${rawContent}${footer}`, payloadLimit);

    return {
      content: [
        {
          type: "text",
          text,
        },
      ],
      structuredContent: {
        content: text,
      },
    };
  };

  return handler;
};
