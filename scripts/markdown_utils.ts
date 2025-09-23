import path from 'path';

import { glob } from 'glob';

import { loadPhases as loadWorkflowPhases } from '../src/utils/markdown.ts';

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

export { loadWorkflowPhases as loadPhases };
