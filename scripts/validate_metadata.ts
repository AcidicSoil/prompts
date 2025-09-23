import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { z } from 'zod';

import { parseFrontMatter } from './front_matter.ts';
import { collectMarkdownFiles, loadPhases } from './markdown_utils.ts';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

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
  const repoRoot = path.resolve(moduleDir, '..');
  const workflowPath = path.join(repoRoot, 'WORKFLOW.md');
  const validPhases = await loadPhases(workflowPath);
  const markdownFiles = await collectMarkdownFiles(repoRoot);

  const errors: string[] = [];
  let validatedFiles = 0;

  for (const filePath of markdownFiles) {
    const relativePath = path.relative(repoRoot, filePath);
    const content = await fs.readFile(filePath, 'utf8');
    const parsed = parseFrontMatter(content);
    if (!parsed) {
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

  console.log(`Metadata validation passed for ${validatedFiles} file(s).`);
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

main().catch((error) => {
  console.error('Failed to validate metadata.');
  console.error(error);
  process.exitCode = 1;
});
