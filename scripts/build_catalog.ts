import { promises as fs } from 'fs';
import path from 'path';
import { generateDocs } from './generate_docs';

type Scalar = string;

type MetadataValue = Scalar | Scalar[];

interface ParsedFrontMatter {
  metadata: Record<string, MetadataValue>;
  endOffset: number;
}

interface CatalogEntry {
  slug: string;
  path: string;
  title: string;
  command: string;
  trigger: string;
  purpose: string;
  phases: string[];
  gate: string;
  status: string;
  previous: string[];
  next: string[];
}

interface CatalogOutput {
  generatedAt: string;
  entries: CatalogEntry[];
}

async function main(): Promise<void> {
  const repoRoot = path.resolve(__dirname, '..');
  const args = new Set(process.argv.slice(2));
  const updateWorkflow = args.has('--update-workflow');

  const markdownFiles = await collectMarkdownFiles(repoRoot);
  const entries: CatalogEntry[] = [];

  for (const filePath of markdownFiles) {
    const relativePath = path.relative(repoRoot, filePath);
    const content = await fs.readFile(filePath, 'utf8');
    const parsed = parseFrontMatter(content);
    if (!parsed) {
      continue;
    }

    try {
      const { metadata, endOffset } = parsed;
      const phases = normalizeStringArray(metadata.phase, 'phase', relativePath);
      const gate = ensureString(metadata.gate, 'gate', relativePath);
      const status = ensureString(metadata.status, 'status', relativePath);
      const previous = normalizeStringArray(metadata.previous, 'previous', relativePath);
      const next = normalizeStringArray(metadata.next, 'next', relativePath);

      const body = content.slice(endOffset).trimStart();
      const slug = path.basename(relativePath, path.extname(relativePath));
      const title = extractTitle(body) ?? formatTitleFromSlug(slug);
      const trigger = extractTrigger(body) ?? `/${slug}`;
      const command = resolveCommand(trigger, slug);
      const purpose = derivePurpose(body, slug);

      entries.push({
        slug,
        path: relativePath,
        title,
        command,
        trigger,
        purpose,
        phases,
        gate,
        status,
        previous,
        next,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[build_catalog] Skipping ${relativePath}: ${message}`);
    }
  }

  if (entries.length === 0) {
    throw new Error('No catalog entries were discovered.');
  }

  entries.sort((a, b) => a.command.localeCompare(b.command));

  const catalog: CatalogOutput = {
    generatedAt: new Date().toISOString(),
    entries,
  };

  const catalogPath = path.join(repoRoot, 'docs', 'catalog.json');
  await writeJsonAtomic(catalogPath, catalog);

  await generateDocs(catalog, { repoRoot, updateWorkflow });
}

async function collectMarkdownFiles(rootDir: string): Promise<string[]> {
  const results: string[] = [];

  await walk(rootDir);
  return results;

  async function walk(currentDir: string): Promise<void> {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (shouldSkip(entry.name)) {
        continue;
      }
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        results.push(fullPath);
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

function normalizeStringArray(value: MetadataValue | undefined, field: string, file: string): string[] {
  if (value === undefined) {
    throw new Error(`${file}: missing required field "${field}".`);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      throw new Error(`${file}: "${field}" must contain at least one entry.`);
    }
    return value.map((item) => ensureNonEmptyString(item, field, file));
  }
  return [ensureNonEmptyString(value, field, file)];
}

function ensureString(value: MetadataValue | undefined, field: string, file: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${file}: missing or empty "${field}".`);
  }
  return value.trim();
}

function ensureNonEmptyString(value: MetadataValue, field: string, file: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${file}: "${field}" entries must be non-empty strings.`);
  }
  return value.trim();
}

function extractTitle(body: string): string | null {
  const headingMatch = body.match(/^#\s+(.+)$/m);
  return headingMatch ? headingMatch[1].trim() : null;
}

function extractTrigger(body: string): string | null {
  const triggerMatch = body.match(/^\s*(?:\*\*)?Trigger(?:\*\*)?:\s*(.+)$/mi);
  return triggerMatch ? cleanupInline(triggerMatch[1]) : null;
}

function resolveCommand(trigger: string, slug: string): string {
  const commandMatch = trigger.match(/\/[a-z0-9-]+/i);
  if (commandMatch) {
    return commandMatch[0];
  }
  return `/${slug}`;
}

function derivePurpose(body: string, slug: string): string {
  const purposeMatch = body.match(/^\s*(?:\*\*)?Purpose(?:\*\*)?:\s*(.+)$/mi);
  if (purposeMatch) {
    return cleanupInline(purposeMatch[1]);
  }

  const lines = body.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#')) {
      continue;
    }
    if (/^\s*(?:\*\*)?Trigger/.test(line)) {
      continue;
    }
    const personaMatch = line.match(/You are a CLI assistant[^:]*:\s*(.+)/i);
    if (personaMatch) {
      return personaMatch[1].trim();
    }
    return line;
  }

  return `Prompt for ${slug.replace(/-/g, ' ')}`;
}

function cleanupInline(value: string): string {
  let result = value.trim();
  if (result.startsWith('`') && result.endsWith('`')) {
    result = result.slice(1, -1).trim();
  }
  if (result.startsWith('**')) {
    result = result.slice(2).trimStart();
  }
  if (result.endsWith('**')) {
    result = result.slice(0, -2).trimEnd();
  }
  return result;
}

async function writeJsonAtomic(filePath: string, data: unknown): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  const tempPath = path.join(dir, `.${path.basename(filePath)}.${process.pid}.${Date.now()}`);
  const payload = `${JSON.stringify(data, null, 2)}\n`;
  await fs.writeFile(tempPath, payload, 'utf8');
  await fs.rename(tempPath, filePath);
}

function formatTitleFromSlug(slug: string): string {
  return slug
    .split(/[-_]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

main().catch((error) => {
  console.error('Failed to build catalog.');
  console.error(error);
  process.exitCode = 1;
});

export type { CatalogEntry, CatalogOutput };
