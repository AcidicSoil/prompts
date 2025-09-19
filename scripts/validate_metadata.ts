import { promises as fs } from 'fs';
import path from 'path';

type Scalar = string;

type MetadataValue = Scalar | Scalar[];

interface Metadata {
  phase: Scalar | Scalar[];
  gate: Scalar;
  status: Scalar;
  previous: Scalar[];
  next: Scalar[];
  [key: string]: MetadataValue;
}

interface ParsedFrontMatter {
  metadata: Record<string, MetadataValue>;
  endOffset: number;
}

async function main(): Promise<void> {
  const repoRoot = path.resolve(__dirname, '..');
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

    const metadata = parsed.metadata as Partial<Metadata>;
    validatedFiles += 1;

    const phaseErrors = validatePhase(metadata.phase, validPhases, relativePath);
    const gateErrors = validateRequiredString('gate', metadata.gate, relativePath);
    const statusErrors = validateRequiredString('status', metadata.status, relativePath);
    const previousErrors = validateStringArray('previous', metadata.previous, relativePath);
    const nextErrors = validateStringArray('next', metadata.next, relativePath);

    errors.push(
      ...phaseErrors,
      ...gateErrors,
      ...statusErrors,
      ...previousErrors,
      ...nextErrors,
    );
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

async function loadPhases(workflowPath: string): Promise<Set<string>> {
  const content = await fs.readFile(workflowPath, 'utf8');
  const headingRegex = /^(##|###)\s+(.+)$/gm;
  const phases = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(content)) !== null) {
    phases.add(match[2].trim());
  }
  return phases;
}

async function collectMarkdownFiles(rootDir: string): Promise<string[]> {
  const results: string[] = [];
  await walk(rootDir, results);
  return results;

  async function walk(currentDir: string, acc: string[]): Promise<void> {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (shouldSkip(entry.name)) {
        continue;
      }
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath, acc);
      } else if (entry.isFile() && fullPath.endsWith('.md')) {
        acc.push(fullPath);
      }
    }
  }
}

function shouldSkip(name: string): boolean {
  return name === 'node_modules' || name === '.git' || name === '.taskmaster' || name === '.github';
}

function parseFrontMatter(content: string): ParsedFrontMatter | null {
  if (!content.startsWith('---')) {
    return null;
  }
  const closingIndex = content.indexOf('\n---', 3);
  if (closingIndex === -1) {
    throw new Error('Front matter missing closing delimiter.');
  }
  const frontMatter = content.slice(4, closingIndex);
  const lines = frontMatter.split('\n');
  const data: Record<string, MetadataValue> = {};
  let currentKey: string | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (line.trim() === '') {
      continue;
    }
    const itemMatch = line.match(/^[-\s]+-\s+(.*)$/);
    if (itemMatch) {
      if (!currentKey) {
        throw new Error(`Array item encountered without a key in front matter: "${line}"`);
      }
      const array = (data[currentKey] as Scalar[]) || [];
      array.push(parseScalar(itemMatch[1].trim()));
      data[currentKey] = array;
      continue;
    }

    const keyMatch = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!keyMatch) {
      throw new Error(`Unable to parse front matter line: "${line}"`);
    }
    const [, key, rawValue] = keyMatch;
    if (rawValue.length === 0) {
      data[key] = [];
      currentKey = key;
    } else {
      data[key] = parseScalar(rawValue);
      currentKey = null;
    }
  }

  return { metadata: data, endOffset: closingIndex + 4 };
}

function parseScalar(value: string): string {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    const inner = trimmed.slice(1, -1);
    return inner.replace(/\\"/g, '"').replace(/\\'/g, "'");
  }
  return trimmed;
}

function validatePhase(value: MetadataValue | undefined, validPhases: Set<string>, file: string): string[] {
  if (value === undefined) {
    return [`${file}: missing required field "phase".`];
  }
  const phases = Array.isArray(value) ? value : [value];
  if (phases.length === 0 || phases.some((item) => typeof item !== 'string' || item.trim() === '')) {
    return [`${file}: "phase" must contain at least one non-empty string.`];
  }
  const headings = Array.from(validPhases);
  const missing = phases.filter((phase) => !headings.some((heading) => heading.includes(phase.trim())));
  if (missing.length > 0) {
    return [`${file}: phase value(s) not found in WORKFLOW.md headings: ${missing.join(', ')}.`];
  }
  return [];
}

function validateRequiredString(field: string, value: MetadataValue | undefined, file: string): string[] {
  if (typeof value !== 'string' || value.trim() === '') {
    return [`${file}: missing or empty "${field}".`];
  }
  return [];
}

function validateStringArray(field: string, value: MetadataValue | undefined, file: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [`${file}: "${field}" must be a non-empty array.`];
  }
  const invalid = value.filter((item) => typeof item !== 'string' || item.trim() === '');
  if (invalid.length > 0) {
    return [`${file}: "${field}" contains empty entries.`];
  }
  return [];
}

main().catch((error) => {
  console.error('Failed to validate metadata.');
  console.error(error);
  process.exitCode = 1;
});
