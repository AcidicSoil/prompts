import { promises as fs } from 'fs';
import path from 'path';

import { glob } from 'glob';

const DEFAULT_IGNORE = [
  '**/node_modules/**',
  '**/.git/**',
  '**/.taskmaster/**',
  '**/.github/**',
  '**/dist/**',
];

export async function collectMarkdownFiles(rootDir: string): Promise<string[]> {
  const matches = await glob('**/*.md', {
    cwd: rootDir,
    ignore: DEFAULT_IGNORE,
    nodir: true,
    absolute: true,
  });
  return matches.map((match) => path.resolve(match));
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
