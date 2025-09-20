import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import yaml from "js-yaml";

import { capPayload } from "../utils/safety.js";

export interface PromptVariable {
  name: string;
  description?: string;
  type?: string;
  required?: boolean;
}

export interface PromptDefinition {
  id: string;
  title: string;
  description?: string;
  path: string;
  phase?: string;
  gate?: string;
  tags?: string[];
  dependsOn?: string[];
  variables?: PromptVariable[];
}

export interface PromptResource {
  id: string;
  uri: string;
  filePath: string;
  metadata: {
    name: string;
    title?: string;
    description?: string;
    mimeType: string;
    _meta?: Record<string, unknown>;
  };
}

export interface LoadPromptMetadataOptions {
  metadataPath?: string;
  baseDir?: string;
}

export interface PreparePromptResourcesOptions {
  baseDir?: string;
  previewLimit?: number;
}

const DEFAULT_METADATA_RELATIVE_PATH = path.join("resources", "prompts.meta.yaml");
const DEFAULT_PREVIEW_LIMIT = 4 * 1024; // 4 KiB for list previews.

const isRecord = (input: unknown): input is Record<string, unknown> => {
  return typeof input === "object" && input !== null;
};

const asStringArray = (value: unknown, fieldName: string): string[] => {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new Error(`Expected \"${fieldName}\" to be an array of strings.`);
  }
  const result: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string" || entry.trim() === "") {
      throw new Error(`Expected \"${fieldName}\" to contain non-empty strings.`);
    }
    result.push(entry.trim());
  }
  return result;
};

const asVariableArray = (value: unknown): PromptVariable[] => {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new Error("Expected \"variables\" to be an array of objects.");
  }
  return value.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`Expected variable at index ${index} to be an object.`);
    }
    const { name, description, type, required } = item;
    if (typeof name !== "string" || name.trim() === "") {
      throw new Error(`Variable at index ${index} is missing a valid \"name\".`);
    }
    if (description !== undefined && typeof description !== "string") {
      throw new Error(`Variable \"${name}\" has an invalid description.`);
    }
    if (type !== undefined && typeof type !== "string") {
      throw new Error(`Variable \"${name}\" has an invalid type.`);
    }
    if (required !== undefined && typeof required !== "boolean") {
      throw new Error(`Variable \"${name}\" has an invalid required flag.`);
    }
    return {
      name: name.trim(),
      description: description?.trim(),
      type: type?.trim(),
      required,
    } satisfies PromptVariable;
  });
};

const resolveMetadataPath = ({ metadataPath, baseDir }: LoadPromptMetadataOptions = {}): string => {
  const cwd = baseDir ?? process.cwd();
  const relativePath = metadataPath ?? DEFAULT_METADATA_RELATIVE_PATH;
  return path.isAbsolute(relativePath) ? relativePath : path.resolve(cwd, relativePath);
};

export function loadPromptMetadata(options: LoadPromptMetadataOptions = {}): PromptDefinition[] {
  const absolutePath = resolveMetadataPath(options);
  let raw: string;
  try {
    raw = readFileSync(absolutePath, "utf8");
  } catch (error) {
    throw new Error(`Failed to read prompt metadata at ${absolutePath}: ${(error as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = yaml.load(raw);
  } catch (error) {
    throw new Error(`Failed to parse prompt metadata at ${absolutePath}: ${(error as Error).message}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Prompt metadata file must contain a top-level array.");
  }

  return parsed.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new Error(`Prompt metadata entry at index ${index} is not an object.`);
    }

    const { id, title, description, path: filePath, phase, gate, tags, dependsOn, variables } = entry;

    if (typeof id !== "string" || id.trim() === "") {
      throw new Error(`Prompt metadata entry at index ${index} is missing an \"id\".`);
    }
    if (typeof title !== "string" || title.trim() === "") {
      throw new Error(`Prompt metadata entry \"${id}\" is missing a \"title\".`);
    }
    if (typeof filePath !== "string" || filePath.trim() === "") {
      throw new Error(`Prompt metadata entry \"${id}\" is missing a \"path\" to the markdown file.`);
    }

    return {
      id: id.trim(),
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : undefined,
      path: filePath.trim(),
      phase: typeof phase === "string" ? phase.trim() : undefined,
      gate: typeof gate === "string" ? gate.trim() : undefined,
      tags: asStringArray(tags, "tags"),
      dependsOn: asStringArray(dependsOn, "dependsOn"),
      variables: asVariableArray(variables),
    } satisfies PromptDefinition;
  });
}

export function preparePromptResources(
  definitions: PromptDefinition[],
  options: PreparePromptResourcesOptions = {},
): PromptResource[] {
  const baseDir = options.baseDir ?? process.cwd();
  const previewLimit = options.previewLimit ?? DEFAULT_PREVIEW_LIMIT;

  return definitions.map((definition) => {
    const absolutePath = path.isAbsolute(definition.path)
      ? definition.path
      : path.resolve(baseDir, definition.path);

    let previewText: string;
    try {
      const fileContent = readFileSync(absolutePath, "utf8");
      previewText = capPayload(fileContent, previewLimit);
    } catch (error) {
      throw new Error(`Failed to read prompt file for \"${definition.id}\": ${(error as Error).message}`);
    }

    const uri = pathToFileURL(absolutePath).href;

    return {
      id: definition.id,
      uri,
      filePath: absolutePath,
      metadata: {
        name: definition.id,
        title: definition.title,
        description: definition.description,
        mimeType: "text/markdown",
        _meta: {
          contentPreview: previewText,
          phase: definition.phase,
          gate: definition.gate,
          tags: definition.tags,
          dependsOn: definition.dependsOn,
        },
      },
    } satisfies PromptResource;
  });
}
