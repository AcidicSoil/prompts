import { promises as fs } from 'node:fs';
import path from 'node:path';

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

export function extractTitleFromMarkdown(body: string, filePath: string): string {
  const headingMatch = body.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }
  const base = path.basename(filePath, path.extname(filePath));
  const words = base.split(/[-_]+/).filter(Boolean);
  if (words.length === 0) {
    return base;
  }
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
