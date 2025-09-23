import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
async function enrichWithComplexity(tasks, projectRoot) {
    const warnings = [];
    const out = tasks.map(t => ({ ...t, metadata: t.metadata ? { ...t.metadata } : undefined }));
    try {
        const path = join(projectRoot, 'artifacts', 'complexity.json');
        const raw = await readFile(path, 'utf8');
        const table = JSON.parse(raw);
        for (const task of out) {
            const key = String(task.id);
            if (Object.prototype.hasOwnProperty.call(table, key)) {
                const entry = table[key];
                const meta = task.metadata ?? (task.metadata = {});
                meta.enrichment = {
                    ...meta.enrichment,
                    complexity: entry,
                };
            }
        }
    }
    catch (err) {
        warnings.push({ message: `complexity enrichment skipped: ${err.message}` });
    }
    return { tasks: out, warnings };
}
const ENRICHERS = [enrichWithComplexity];
export async function enrichTasks(tasks, projectRoot) {
    let current = tasks.map((t) => ({ ...t, subtasks: t.subtasks.map(s => ({ ...s })) }));
    const warnings = [];
    for (const enricher of ENRICHERS) {
        try {
            const res = await enricher(current, projectRoot);
            current = res.tasks;
            warnings.push(...res.warnings);
        }
        catch (err) {
            warnings.push({ message: `enricher failed: ${err.message}` });
        }
    }
    return { tasks: current, warnings };
}
