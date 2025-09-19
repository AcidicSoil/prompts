import { promises as fs } from 'fs';
import path from 'path';

export type Scalar = string;

export type MetadataValue = Scalar | Scalar[];

export interface Metadata {
  phase: Scalar | Scalar[];
  gate: Scalar;
  status: Scalar;
  previous: Scalar[];
  next: Scalar[];
  [key: string]: MetadataValue;
}

export interface ParsedFrontMatter {
  metadata: Record<string, MetadataValue>;
  endOffset: number;
}

export interface WorkflowSection {
  title: string;
  anchor: string;
  level: number;
}

export async function loadWorkflowSections(workflowPath: string): Promise<WorkflowSection[]> {
  const content = await fs.readFile(workflowPath, 'utf8');
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const sections: WorkflowSection[] = [];
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    sections.push({
      title,
      anchor: slugifyHeading(title),
      level,
    });
  }
  return sections;
}

export function slugifyHeading(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

export async function collectMarkdownFiles(rootDir: string): Promise<string[]> {
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

export function shouldSkip(name: string): boolean {
  return (
    name === 'node_modules' ||
    name === '.git' ||
    name === '.taskmaster' ||
    name === '.github' ||
    name === '.husky'
  );
}

export function parseFrontMatter(content: string): ParsedFrontMatter | null {
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

export function parseScalar(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    const inner = trimmed.slice(1, -1);
    return inner.replace(/\\"/g, '"').replace(/\\'/g, "'");
  }
  return trimmed;
}
