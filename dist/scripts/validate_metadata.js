import { promises as fs } from 'fs';
import path from 'path';
import { parseFrontMatter } from './front_matter';
import { collectMarkdownFiles, loadPhases } from './markdown_utils';
async function main() {
    const repoRoot = path.resolve(__dirname, '..');
    const workflowPath = path.join(repoRoot, 'WORKFLOW.md');
    const validPhases = await loadPhases(workflowPath);
    const markdownFiles = await collectMarkdownFiles(repoRoot);
    const errors = [];
    let validatedFiles = 0;
    for (const filePath of markdownFiles) {
        const relativePath = path.relative(repoRoot, filePath);
        const content = await fs.readFile(filePath, 'utf8');
        const parsed = parseFrontMatter(content);
        if (!parsed) {
            continue;
        }
        const metadata = parsed.metadata;
        validatedFiles += 1;
        const phaseErrors = validatePhase(metadata.phase, validPhases, relativePath);
        const gateErrors = validateRequiredString('gate', metadata.gate, relativePath);
        const statusErrors = validateRequiredString('status', metadata.status, relativePath);
        const previousErrors = validateStringArray('previous', metadata.previous, relativePath);
        const nextErrors = validateStringArray('next', metadata.next, relativePath);
        errors.push(...phaseErrors, ...gateErrors, ...statusErrors, ...previousErrors, ...nextErrors);
    }
    if (errors.length > 0) {
        console.error('Metadata validation failed:\n');
        for (const error of errors) {
            console.error(`- ${error}`);
        }
        process.exitCode = 1;
        return;
    }
    console.log(`Metadata validation passed for ${validatedFiles} file(s).`);
}
function validatePhase(value, validPhases, file) {
    if (value === undefined) {
        return [`${file}: missing required field "phase".`];
    }
    const phases = Array.isArray(value) ? value : [value];
    if (phases.length === 0 || phases.some((item) => typeof item !== 'string' || item.trim() === '')) {
        return [`${file}: "phase" must contain at least one non-empty string.`];
    }
    const headings = Array.from(validPhases);
    const missing = phases.filter((phase) => !headings.some((heading) => heading.includes(phase.trim())));
    if (missing.length > 0) {
        return [`${file}: phase value(s) not found in WORKFLOW.md headings: ${missing.join(', ')}.`];
    }
    return [];
}
function validateRequiredString(field, value, file) {
    if (typeof value !== 'string' || value.trim() === '') {
        return [`${file}: missing or empty "${field}".`];
    }
    return [];
}
function validateStringArray(field, value, file) {
    if (!Array.isArray(value) || value.length === 0) {
        return [`${file}: "${field}" must be a non-empty array.`];
    }
    const invalid = value.filter((item) => typeof item !== 'string' || item.trim() === '');
    if (invalid.length > 0) {
        return [`${file}: "${field}" contains empty entries.`];
    }
    return [];
}
main().catch((error) => {
    console.error('Failed to validate metadata.');
    console.error(error);
    process.exitCode = 1;
});
