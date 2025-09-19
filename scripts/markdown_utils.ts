import { promises as fs } from 'fs';
import path from 'path';

const SKIP_DIRECTORIES = new Set(['node_modules', '.git', '.taskmaster', '.github']);

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
  return SKIP_DIRECTORIES.has(name);
}

export async function loadPhases(workflowPath: string): Promise<Set<string>> {
  const content = await fs.readFile(workflowPath, 'utf8');
  const headingRegex = /^(##|###)\s+(.+)$/gm;
  const phases = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(content)) !== null) {
    phases.add(match[2].trim());
  }
  return phases;
}
