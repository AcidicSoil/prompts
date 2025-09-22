import { readFile } from "node:fs/promises";
import path from "node:path";
import { capPayload } from "../utils/safety.js";
const FOOTER = "\n\n---\n_Served via MCP prompt tool._";
export const DEFAULT_TOOL_PAYLOAD_LIMIT = 1024 * 1024;
const renderFooter = (template, definition) => {
    return template.replaceAll("{id}", definition.id).replaceAll("{title}", definition.title);
};
export const createPromptToolHandler = (definition, fileRoot, options = {}) => {
    const payloadLimit = options.payloadLimit ?? DEFAULT_TOOL_PAYLOAD_LIMIT;
    const footerTemplate = options.footerTemplate ?? FOOTER;
    const absolutePath = path.isAbsolute(definition.path)
        ? definition.path
        : path.resolve(fileRoot, definition.path);
    const handler = async () => {
        let rawContent;
        try {
            rawContent = await readFile(absolutePath, "utf8");
        }
        catch (error) {
            return {
                isError: true,
                content: [
                    {
                        type: "text",
                        text: `Failed to read prompt file at ${absolutePath}: ${error.message}`,
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
