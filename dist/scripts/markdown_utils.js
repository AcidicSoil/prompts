import { promises as fs } from 'fs';
import path from 'path';
const SKIP_DIRECTORIES = new Set(['node_modules', '.git', '.taskmaster', '.github']);
export async function collectMarkdownFiles(rootDir) {
    const results = [];
    await walk(rootDir, results);
    return results;
    async function walk(currentDir, acc) {
        const entries = await fs.readdir(currentDir, { withFileTypes: true });
        for (const entry of entries) {
            if (shouldSkip(entry.name)) {
                continue;
            }
            const fullPath = path.join(currentDir, entry.name);
            if (entry.isDirectory()) {
                await walk(fullPath, acc);
            }
            else if (entry.isFile() && fullPath.endsWith('.md')) {
                acc.push(fullPath);
            }
        }
    }
}
export function shouldSkip(name) {
    return SKIP_DIRECTORIES.has(name);
}
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
