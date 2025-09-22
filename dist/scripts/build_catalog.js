import { promises as fs } from 'fs';
import path from 'path';
import { parseFrontMatter } from './front_matter';
import { collectMarkdownFiles, loadPhases } from './markdown_utils';
import { normalizePhaseLabel } from './catalog_types';
import { writeFileAtomic } from './file_utils';
import { generateDocs, synchronizeWorkflowDoc } from './generate_docs';
async function main() {
    const args = new Set(process.argv.slice(2));
    const updateWorkflow = args.has('--update-workflow');
    const repoRoot = path.resolve(__dirname, '..');
    const workflowPath = path.join(repoRoot, 'WORKFLOW.md');
    let validPhases = await loadPhases(workflowPath);
    let normalizedPhaseLookup = buildNormalizedPhaseSet(validPhases);
    const markdownFiles = await collectMarkdownFiles(repoRoot);
    const phaseBuckets = new Map();
    const commandIndex = new Map();
    const errors = [];
    const missingPhases = new Map();
    for (const filePath of markdownFiles) {
        const relativePath = path.relative(repoRoot, filePath);
        const content = await fs.readFile(filePath, 'utf8');
        const parsed = parseFrontMatter(content);
        if (!parsed) {
            continue;
        }
        const metadata = parsed.metadata;
        const metadataErrors = [];
        const phases = extractPhases(metadata.phase, relativePath, metadataErrors);
        const gate = extractString(metadata.gate, 'gate', relativePath, metadataErrors);
        const status = extractString(metadata.status, 'status', relativePath, metadataErrors);
        const previous = extractStringArray(metadata.previous, 'previous', relativePath, metadataErrors);
        const next = extractStringArray(metadata.next, 'next', relativePath, metadataErrors);
        if (metadataErrors.length > 0) {
            errors.push(...metadataErrors);
            continue;
        }
        const body = content.slice(parsed.endOffset);
        const title = extractTitle(body, relativePath);
        const command = extractCommand(body, relativePath);
        const purpose = extractPurpose(body) ?? '';
        registerCommand(commandIndex, command, relativePath, errors);
        for (const phaseLabel of phases) {
            const normalizedPhase = normalizePhaseLabel(phaseLabel);
            if (!phaseExists(normalizedPhase, normalizedPhaseLookup)) {
                const existing = missingPhases.get(normalizedPhase);
                if (existing) {
                    existing.files.add(relativePath);
                }
                else {
                    missingPhases.set(normalizedPhase, { label: phaseLabel, files: new Set([relativePath]) });
                }
                if (!updateWorkflow) {
                    errors.push(`${relativePath}: phase "${phaseLabel}" not found in WORKFLOW.md.`);
                }
            }
            const entry = {
                phase: phaseLabel,
                command,
                title,
                purpose,
                gate,
                status,
                previous,
                next,
                path: relativePath,
            };
            const bucket = phaseBuckets.get(normalizedPhase);
            if (bucket) {
                bucket.push(entry);
            }
            else {
                phaseBuckets.set(normalizedPhase, [entry]);
            }
        }
    }
    const { catalog: ordered, sortedKeys } = buildOrderedCatalog(phaseBuckets);
    if (updateWorkflow && missingPhases.size > 0) {
        const workflowUpdated = await synchronizeWorkflowDoc(repoRoot, ordered);
        if (workflowUpdated) {
            console.log('Inserted missing phases into WORKFLOW.md before catalog generation.');
        }
        validPhases = await loadPhases(workflowPath);
        normalizedPhaseLookup = buildNormalizedPhaseSet(validPhases);
        for (const [normalized, record] of missingPhases) {
            if (phaseExists(normalized, normalizedPhaseLookup)) {
                continue;
            }
            const files = Array.from(record.files).sort();
            errors.push(`Phase "${record.label}" referenced in ${files.join(', ')} is missing from WORKFLOW.md after synchronization.`);
        }
    }
    if (errors.length > 0) {
        console.error('Failed to build catalog:\n');
        for (const error of errors) {
            console.error(`- ${error}`);
        }
        process.exitCode = 1;
        return;
    }
    const catalogPath = path.join(repoRoot, 'catalog.json');
    const catalogPayload = `${JSON.stringify(ordered, null, 2)}\n`;
    const catalogUpdated = await writeFileAtomic(catalogPath, catalogPayload);
    if (catalogUpdated) {
        console.log(`Wrote catalog with ${sortedKeys.length} phase group(s) to ${catalogPath}`);
    }
    else {
        console.log(`Catalog already up to date at ${catalogPath}`);
    }
    await generateDocs(repoRoot, ordered, { updateWorkflow });
}
function buildOrderedCatalog(buckets) {
    const sortedKeys = Array.from(buckets.keys()).sort((a, b) => a.localeCompare(b));
    const catalog = {};
    for (const key of sortedKeys) {
        const prompts = buckets.get(key);
        if (!prompts) {
            continue;
        }
        catalog[key] = prompts.slice().sort((a, b) => a.command.localeCompare(b.command));
    }
    return { catalog, sortedKeys: Object.keys(catalog) };
}
function extractPhases(value, file, errors) {
    if (value === undefined) {
        errors.push(`${file}: missing required field "phase".`);
        return [];
    }
    const raw = Array.isArray(value) ? value : [value];
    if (raw.length === 0) {
        errors.push(`${file}: "phase" must contain at least one entry.`);
        return [];
    }
    const phases = [];
    for (const item of raw) {
        if (typeof item !== 'string' || item.trim() === '') {
            errors.push(`${file}: "phase" contains an invalid value.`);
            continue;
        }
        phases.push(item.trim());
    }
    return phases;
}
function extractString(value, field, file, errors) {
    if (typeof value !== 'string' || value.trim() === '') {
        errors.push(`${file}: missing or empty "${field}".`);
        return '';
    }
    return value.trim();
}
function extractStringArray(value, field, file, errors) {
    if (!Array.isArray(value) || value.length === 0) {
        errors.push(`${file}: "${field}" must be a non-empty array.`);
        return [];
    }
    const result = [];
    for (const item of value) {
        if (typeof item !== 'string' || item.trim() === '') {
            errors.push(`${file}: "${field}" contains an invalid entry.`);
            continue;
        }
        result.push(item.trim());
    }
    return result;
}
function extractTitle(body, file) {
    const headingMatch = body.match(/^#\s+(.+)$/m);
    if (headingMatch) {
        return headingMatch[1].trim();
    }
    const base = path.basename(file, path.extname(file));
    const words = base.split(/[-_]+/).filter(Boolean);
    if (words.length === 0) {
        return base;
    }
    return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
function extractCommand(body, file) {
    const command = extractField(body, 'Trigger');
    if (command) {
        return command;
    }
    const fallback = path.basename(file, path.extname(file));
    return `/${fallback}`;
}
function extractPurpose(body) {
    return extractField(body, 'Purpose');
}
function extractField(body, label) {
    const lines = body.split(/\r?\n/);
    const target = `${label.toLowerCase()}:`;
    for (const rawLine of lines) {
        const trimmed = rawLine.trim();
        if (!trimmed) {
            continue;
        }
        const sanitized = trimmed.replace(/\*\*/g, '').replace(/__/g, '');
        if (!sanitized.toLowerCase().startsWith(target)) {
            continue;
        }
        const value = sanitized.slice(target.length).trim();
        return stripFormatting(value);
    }
    return null;
}
function stripFormatting(value) {
    let result = value.trim();
    if ((result.startsWith('`') && result.endsWith('`')) || (result.startsWith('"') && result.endsWith('"'))) {
        result = result.slice(1, -1).trim();
    }
    if (result.startsWith("'") && result.endsWith("'")) {
        result = result.slice(1, -1).trim();
    }
    return result;
}
function registerCommand(commandIndex, command, file, errors) {
    const existing = commandIndex.get(command);
    if (existing && existing !== file) {
        errors.push(`Duplicate command "${command}" found in ${existing} and ${file}.`);
        return;
    }
    commandIndex.set(command, file);
}
function buildNormalizedPhaseSet(phases) {
    const normalized = new Set();
    for (const phase of phases) {
        const key = normalizePhaseLabel(phase);
        if (key) {
            normalized.add(key);
        }
    }
    return normalized;
}
function phaseExists(normalizedPhase, normalizedPhases) {
    if (!normalizedPhase) {
        return false;
    }
    return normalizedPhases.has(normalizedPhase);
}
main().catch((error) => {
    console.error('Failed to build catalog.');
    console.error(error);
    process.exitCode = 1;
});
