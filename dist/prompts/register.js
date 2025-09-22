import { readFile } from "node:fs/promises";
import { capPayload } from "../utils/safety.js";
import { loadPromptMetadata, loadPromptDefinitions, preparePromptResources, } from "./loader.js";
import { createPromptToolHandler, DEFAULT_TOOL_PAYLOAD_LIMIT } from "../tools/prompt-handler.js";
import { generateToolSchemas } from "./schema.js";
const DEFAULT_PAYLOAD_LIMIT = 1024 * 1024; // 1 MiB cap to satisfy MCP spec guidance.
export async function registerPromptResources(server, logger, options = {}) {
    const definitions = resolveDefinitions(logger, options, loadPromptMetadata);
    if (definitions.length === 0) {
        logger.warn("prompt_metadata_empty", {
            metadataPath: options.metadataPath,
        });
        return;
    }
    let resources;
    try {
        resources = preparePromptResources(definitions, {
            baseDir: options.baseDir,
            previewLimit: options.previewLimit,
        });
    }
    catch (error) {
        logger.error("prompt_resource_prepare_failed", { error });
        throw error;
    }
    const payloadLimit = options.payloadLimit ?? DEFAULT_PAYLOAD_LIMIT;
    for (const resource of resources) {
        server.registerResource(resource.id, resource.uri, resource.metadata, async (uri) => {
            try {
                const rawContent = await readFile(resource.filePath, "utf8");
                const text = capPayload(rawContent, payloadLimit);
                return {
                    contents: [
                        {
                            uri: uri.href,
                            mimeType: resource.metadata.mimeType,
                            text,
                        },
                    ],
                };
            }
            catch (error) {
                logger.error("prompt_resource_read_failed", {
                    resourceId: resource.id,
                    filePath: resource.filePath,
                    error,
                });
                throw error;
            }
        });
    }
    logger.info("prompt_resources_registered", {
        count: resources.length,
    });
}
const resolveDefinitions = (logger, options, loader) => {
    try {
        return loader(options);
    }
    catch (error) {
        logger.error("prompt_metadata_load_failed", { error });
        throw error;
    }
};
export async function registerPromptTools(server, logger, options = {}) {
    const definitions = resolveDefinitions(logger, options, loadPromptDefinitions);
    if (definitions.length === 0) {
        logger.warn("prompt_metadata_empty", {
            metadataPath: options.metadataPath,
        });
        return;
    }
    const fileRoot = options.baseDir ?? process.cwd();
    const payloadLimit = options.payloadLimit ?? DEFAULT_TOOL_PAYLOAD_LIMIT;
    const registered = [];
    for (const definition of definitions) {
        const { input, output } = generateToolSchemas(definition);
        const handler = createPromptToolHandler(definition, fileRoot, {
            payloadLimit,
        });
        server.registerTool(definition.id, {
            title: definition.title,
            description: definition.description,
            inputSchema: input,
            outputSchema: output,
            annotations: {
                title: definition.title,
                readOnlyHint: true,
                openWorldHint: false,
                idempotentHint: true,
            },
        }, async (args) => handler(args ?? {}));
        registered.push(definition.id);
    }
    logger.info("prompt_tools_registered", {
        count: registered.length,
    });
}
