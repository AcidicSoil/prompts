import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { z } from 'zod';
import { load as loadYaml } from 'js-yaml';

import { parseFrontMatter } from './front_matter.ts';
import { collectMarkdownFiles, loadPhases } from './markdown_utils.ts';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const CUSTOM_ROOT_ENV = 'PROMPTS_VALIDATION_ROOT';

const stringField = z.string().trim().min(1, 'value must be a non-empty string');
const stringArray = z.array(stringField).nonempty('must contain at least one entry');
const stringOrArray = z.union([stringField, stringArray]);

const metadataSchema = z
  .object({
    phase: stringOrArray,
    gate: stringField,
    status: stringField,
    previous: stringArray,
    next: stringArray,
    tags: z.array(stringField).optional(),
  })
  .passthrough();

async function main(): Promise<void> {
  const customRoot = process.env[CUSTOM_ROOT_ENV];
  const repoRoot = customRoot ? path.resolve(customRoot) : path.resolve(moduleDir, '..');
  const workflowPath = path.join(repoRoot, 'WORKFLOW.md');
  const validPhases = await loadPhases(workflowPath);
  const markdownFiles = await collectMarkdownFiles(repoRoot);
  const trackedPaths = await loadTrackedMarkdownPaths(repoRoot);
  const useTrackedFilter = trackedPaths.size > 0;
  const promptsPrefix = `prompts${path.sep}`;

  const errors: string[] = [];
  let validatedFiles = 0;

  for (const filePath of markdownFiles) {
    const relativePath = path.relative(repoRoot, filePath);
    const normalizedRelative = normalizeRelativePath(relativePath);
    const shouldValidate =
      normalizedRelative.startsWith(promptsPrefix) || !useTrackedFilter || trackedPaths.has(normalizedRelative);
    if (!shouldValidate) {
      continue;
    }
    const content = await fs.readFile(filePath, 'utf8');
    const parsed = parseFrontMatter(content);
    if (!parsed) {
      errors.push(`${relativePath}: missing YAML front matter`);
      continue;
    }

    validatedFiles += 1;

    const validation = metadataSchema.safeParse(parsed.metadata);
    if (!validation.success) {
      for (const issue of validation.error.issues) {
        const location = issue.path.length > 0 ? issue.path.join('.') : 'front matter';
        errors.push(`${relativePath}: ${location} ${issue.message}`);
      }
      continue;
    }

    const metadata = validation.data;
    const phases = toArray(metadata.phase);
    const missingPhases = findMissingPhases(phases, validPhases);
    if (missingPhases.length > 0) {
      errors.push(
        `${relativePath}: phase value(s) not found in WORKFLOW.md headings: ${missingPhases.join(', ')}.`,
      );
    }
  }

  if (errors.length > 0) {
    console.error('Metadata validation failed:\n');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Metadata validated for ${validatedFiles} file(s).`);
}

function toArray(input: z.infer<typeof stringOrArray>): string[] {
  return Array.isArray(input) ? input : [input];
}

function findMissingPhases(phases: string[], validPhases: Set<string>): string[] {
  if (phases.length === 0) {
    return [];
  }
  const headings = Array.from(validPhases).map((heading) => heading.toLowerCase());
  const missing: string[] = [];
  for (const phase of phases) {
    const normalized = phase.toLowerCase();
    const found = headings.some((heading) => heading.includes(normalized));
    if (!found) {
      missing.push(phase);
    }
  }
  return missing;
}

async function loadTrackedMarkdownPaths(repoRoot: string): Promise<Set<string>> {
  const tracked = new Set<string>();
  await appendCatalogPaths(repoRoot, tracked);
  await appendMetadataPaths(repoRoot, tracked);
  return tracked;
}

async function appendCatalogPaths(repoRoot: string, tracked: Set<string>): Promise<void> {
  const catalogPath = path.join(repoRoot, 'catalog.json');
  try {
    const raw = await fs.readFile(catalogPath, 'utf8');
    const catalog = JSON.parse(raw) as Record<string, unknown>;
    for (const value of Object.values(catalog)) {
      if (!Array.isArray(value)) {
        continue;
      }
      for (const entry of value) {
        if (isPlainObject(entry) && typeof entry.path === 'string') {
          tracked.add(normalizeRelativePath(entry.path));
        }
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn(`Failed to read catalog.json: ${(error as Error).message}`);
    }
  }
}

async function appendMetadataPaths(repoRoot: string, tracked: Set<string>): Promise<void> {
  const metadataPath = path.join(repoRoot, 'resources', 'prompts.meta.yaml');
  try {
    const raw = await fs.readFile(metadataPath, 'utf8');
    const parsed = loadYaml(raw);
    if (!Array.isArray(parsed)) {
      return;
    }
    for (const entry of parsed) {
      if (isPlainObject(entry) && typeof entry.path === 'string') {
        tracked.add(normalizeRelativePath(entry.path));
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn(`Failed to read prompts.meta.yaml: ${(error as Error).message}`);
    }
  }
}

function normalizeRelativePath(filePath: string): string {
  const normalized = path.normalize(filePath);
  if (normalized.startsWith(`.${path.sep}`)) {
    return normalized.slice(2);
  }
  return normalized;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

main().catch((error) => {
  console.error('Failed to validate metadata.');
  console.error(error);
  process.exitCode = 1;
});
