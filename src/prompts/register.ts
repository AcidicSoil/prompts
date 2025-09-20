import { readFile } from "node:fs/promises";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { capPayload } from "../utils/safety.js";
import { SecureLogger } from "../logger.js";
import {
  loadPromptMetadata,
  preparePromptResources,
  LoadPromptMetadataOptions,
  PreparePromptResourcesOptions,
} from "./loader.js";

export interface RegisterPromptResourcesOptions
  extends LoadPromptMetadataOptions,
    PreparePromptResourcesOptions {
  payloadLimit?: number;
}

const DEFAULT_PAYLOAD_LIMIT = 1024 * 1024; // 1 MiB cap to satisfy MCP spec guidance.

export async function registerPromptResources(
  server: McpServer,
  logger: SecureLogger,
  options: RegisterPromptResourcesOptions = {},
): Promise<void> {
  let definitions;
  try {
    definitions = loadPromptMetadata({
      metadataPath: options.metadataPath,
      baseDir: options.baseDir,
    });
  } catch (error) {
    logger.error("prompt_metadata_load_failed", { error });
    throw error;
  }

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
  } catch (error) {
    logger.error("prompt_resource_prepare_failed", { error });
    throw error;
  }

  const payloadLimit = options.payloadLimit ?? DEFAULT_PAYLOAD_LIMIT;

  for (const resource of resources) {
    server.registerResource(
      resource.id,
      resource.uri,
      resource.metadata,
      async (uri) => {
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
        } catch (error) {
          logger.error("prompt_resource_read_failed", {
            resourceId: resource.id,
            filePath: resource.filePath,
            error,
          });
          throw error;
        }
      },
    );
  }

  logger.info("prompt_resources_registered", {
    count: resources.length,
  });
}
