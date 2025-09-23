import { promises as fs } from 'node:fs';
import path from 'node:path';
export async function loadPhases(workflowPath) {
    const content = await fs.readFile(workflowPath, 'utf8');
    const headingRegex = /^(##|###)\s+(.+)$/gm;
    const phases = new Set();
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
        phases.add(match[2].trim());
    }
    return phases;
}
export function extractTitleFromMarkdown(body, filePath) {
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
