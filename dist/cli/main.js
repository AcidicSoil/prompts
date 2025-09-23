#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { createRequire } from 'node:module';
import { Command } from 'commander';
import { dump as dumpYaml, load as loadYaml } from 'js-yaml';
import { TaskIngestError, TaskValidationError } from '../adapters/taskmaster/ingest.js';
import { buildStatusSummary, formatGraphDot, loadIngest, runAdvance, runGraph, runNext } from './actions.js';
import { STATUS_ALIASES } from '../types/prompts-task.js';
import { ensureArray, formatFrontMatter, parseFrontMatter, } from '../utils/front_matter.js';
import { extractTitleFromMarkdown, loadPhases } from '../utils/markdown.js';
const require = createRequire(import.meta.url);
const packageJson = require('../../package.json');
const DEFAULT_TASKS_PATH = '.taskmaster/tasks/tasks.json';
const program = new Command();
program
    .name('prompts')
    .description('Task-Master companion CLI for prompts workflows')
    .version(packageJson.version ?? '0.0.0')
    .option('--tasks <path>', 'Path to Task-Master tasks.json file', DEFAULT_TASKS_PATH)
    .option('--tag <tag>', 'Tagged task list to load', 'master')
    .option('--write', 'Enable write mode for commands that persist changes')
    .option('--pretty', 'Pretty-print JSON output')
    .option('--verbose', 'Emit structured logs to stderr')
    .option('--unsafe-logs', 'Disable metadata redaction (not recommended)');
const getGlobalOptions = () => program.optsWithGlobals();
const stringify = (value, pretty) => JSON.stringify(value, null, pretty ? 2 : undefined) ?? 'null';
const printJson = (value, pretty) => {
    console.log(stringify(value, pretty));
};
const parseTaskId = (raw) => {
    const value = Number.parseInt(raw, 10);
    if (!Number.isInteger(value) || value < 1) {
        throw new Error('Task id must be a positive integer.');
    }
    return value;
};
const parseStatus = (raw) => {
    const key = raw.trim().toLowerCase();
    const canonical = STATUS_ALIASES[key];
    if (!canonical) {
        throw new Error(`Unsupported status value: ${raw}`);
    }
    return canonical;
};
const isRecord = (value) => !!value && typeof value === 'object';
const printError = (error) => {
    if (error instanceof TaskValidationError) {
        console.error(`Validation failed: ${error.message}`);
        if (isRecord(error.context) && Array.isArray(error.context.errors)) {
            for (const issue of error.context.errors) {
                if (issue && typeof issue.message === 'string') {
                    console.error(`- ${issue.message}`);
                }
            }
        }
        return;
    }
    if (error instanceof TaskIngestError) {
        console.error(error.message);
        if (error.context) {
            console.error(stringify(error.context, true));
        }
        return;
    }
    console.error(error instanceof Error ? error.message : String(error));
};
import { createSecureLogger, logger as baseLogger } from '../logger.js';
const withCliErrors = async (runner) => {
    try {
        const opts = getGlobalOptions();
        const cliLogger = createSecureLogger(baseLogger, { unsafe: Boolean(opts.unsafeLogs) });
        if (opts.verbose)
            cliLogger.info('cli_start');
        await runner();
        if (opts.verbose)
            cliLogger.info('cli_end');
    }
    catch (error) {
        printError(error);
        process.exitCode = 1;
    }
};
const toLocatorOptions = (options) => ({
    tasksPath: options.tasks,
    tag: options.tag,
    cwd: process.cwd()
});
program
    .command('ingest')
    .description('Validate and normalize Task-Master tasks into the canonical schema.')
    .action(async () => {
    await withCliErrors(async () => {
        const options = getGlobalOptions();
        const result = await loadIngest(toLocatorOptions(options));
        printJson({
            tasks: result.tasks,
            report: result.report
        }, options.pretty);
    });
});
program
    .command('next')
    .description('Select the next ready task based on dependency and priority rules.')
    .action(async () => {
    await withCliErrors(async () => {
        const options = getGlobalOptions();
        const { task, ready } = await runNext(toLocatorOptions(options));
        printJson({
            task,
            ready
        }, options.pretty);
    });
});
program
    .command('advance')
    .description('Update a task\'s status. Persists only when --write is supplied.')
    .argument('<id>', 'Task identifier to update.')
    .argument('<status>', 'New status (canonical name or supported alias).')
    .action(async (id, status) => {
    await withCliErrors(async () => {
        const options = getGlobalOptions();
        const taskId = parseTaskId(id);
        const canonicalStatus = parseStatus(status);
        const result = await runAdvance(toLocatorOptions(options), taskId, canonicalStatus, Boolean(options.write));
        printJson({
            task: result.task,
            persisted: result.persisted
        }, options.pretty);
    });
});
program
    .command('graph')
    .description('Export the task dependency graph as JSON or DOT.')
    .option('--format <format>', 'Output format: json or dot', 'json')
    .action(async (commandOptions) => {
    await withCliErrors(async () => {
        const options = getGlobalOptions();
        const graph = await runGraph(toLocatorOptions(options));
        const format = (commandOptions.format ?? 'json').toLowerCase();
        if (format === 'json') {
            printJson(graph, options.pretty);
            return;
        }
        if (format === 'dot') {
            console.log(formatGraphDot(graph.nodes));
            return;
        }
        throw new Error(`Unsupported graph format: ${commandOptions.format}`);
    });
});
program
    .command('scaffold')
    .description('Scaffold metadata, catalog entries, and docs for a prompt slug.')
    .argument('<slug>', 'Prompt slug relative to the prompts directory')
    .option('--fix <path>', 'Override the markdown file path to update')
    .action(async (slug, commandOptions) => {
    await withCliErrors(async () => {
        const repoRoot = await findRepoRoot(process.cwd());
        const promptFile = await resolvePromptFile(repoRoot, slug, commandOptions.fix);
        const workflowPath = path.join(repoRoot, 'WORKFLOW.md');
        const validPhases = await loadPhases(workflowPath);
        const original = await fs.readFile(promptFile.absolute, 'utf8');
        const parsed = parseFrontMatter(original);
        const baseMetadata = parsed ? { ...parsed.metadata } : {};
        const body = original.slice(parsed?.endOffset ?? 0);
        const scaffold = await collectMetadataInteractively(baseMetadata, validPhases, slug);
        const updatedMetadata = {
            ...baseMetadata,
            phase: scaffold.phases.length === 1 ? scaffold.phases[0] : scaffold.phases,
            gate: scaffold.gate,
            status: scaffold.status,
            previous: scaffold.previous,
            next: scaffold.next,
        };
        const frontMatterBlock = formatFrontMatter(updatedMetadata);
        const bodyWithoutLeadingBreak = body.replace(/^\r?\n/, '');
        const updatedContent = `${frontMatterBlock}${bodyWithoutLeadingBreak}`;
        if (updatedContent !== original) {
            await fs.writeFile(promptFile.absolute, updatedContent, 'utf8');
            console.log(`Updated ${promptFile.relative}`);
        }
        else {
            console.log(`No changes required for ${promptFile.relative}`);
        }
        const title = extractTitleFromMarkdown(bodyWithoutLeadingBreak, promptFile.relative);
        const primaryPhase = scaffold.phases[0] ?? '';
        const metadataUpdated = await updatePromptMetadataFile(repoRoot, {
            id: slugToId(slug),
            title,
            path: promptFile.relative,
            phase: primaryPhase,
            gate: scaffold.gate,
        });
        if (metadataUpdated) {
            console.log('Updated resources/prompts.meta.yaml');
        }
        const missingPhases = scaffold.phases.filter((phase) => !phaseExists(phase, validPhases));
        if (missingPhases.length > 0) {
            console.log(`Phase(s) ${missingPhases.join(', ')} not found in WORKFLOW.md. Running catalog build with --update-workflow.`);
        }
        await runValidationScripts(repoRoot, missingPhases.length > 0);
    });
});
program
    .command('status')
    .description('Summarize task statuses and readiness information.')
    .action(async () => {
    await withCliErrors(async () => {
        const options = getGlobalOptions();
        const summary = await buildStatusSummary(toLocatorOptions(options));
        printJson(summary, options.pretty);
    });
});
async function findRepoRoot(start) {
    let current = path.resolve(start);
    const { root } = path.parse(current);
    while (true) {
        const candidate = path.join(current, 'package.json');
        try {
            await fs.access(candidate);
            return current;
        }
        catch {
            if (current === root) {
                throw new Error('Unable to locate repository root. Run this command from within the project.');
            }
            current = path.dirname(current);
        }
    }
}
async function resolvePromptFile(repoRoot, slug, overridePath) {
    const targetPath = overridePath
        ? path.resolve(repoRoot, overridePath)
        : path.resolve(repoRoot, 'prompts', ensureMarkdownExtension(slug));
    const relative = path.relative(repoRoot, targetPath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new Error('Prompt file must reside inside the repository.');
    }
    try {
        const stats = await fs.stat(targetPath);
        if (!stats.isFile()) {
            throw new Error(`Expected ${targetPath} to be a file.`);
        }
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`Unable to locate prompt markdown at ${targetPath}.`);
        }
        throw error;
    }
    return {
        absolute: targetPath,
        relative: toPosixPath(relative),
    };
}
async function collectMetadataInteractively(metadata, validPhases, slug) {
    const rl = createInterface({ input, output });
    try {
        console.log(`\nScaffolding metadata for ${slug}`);
        if (validPhases.size > 0) {
            const phasesList = Array.from(validPhases).sort((a, b) => a.localeCompare(b));
            console.log(`Available phases: ${phasesList.join(', ')}`);
        }
        console.log('Enter comma-separated lists for multi-value fields. Press enter to keep defaults.');
        const phases = await promptForPhases(rl, ensureArray(metadata.phase), validPhases);
        const gate = await promptForString(rl, 'Gate', typeof metadata.gate === 'string' ? metadata.gate : undefined);
        const status = await promptForString(rl, 'Status', typeof metadata.status === 'string' ? metadata.status : undefined);
        const previous = await promptForList(rl, 'Previous commands', ensureArray(metadata.previous));
        const next = await promptForList(rl, 'Next commands', ensureArray(metadata.next));
        return { phases, gate, status, previous, next };
    }
    finally {
        rl.close();
    }
}
async function promptForPhases(rl, defaults, validPhases) {
    while (true) {
        const promptLabel = defaults.length > 0 ? `Phase [${defaults.join(', ')}]` : 'Phase';
        const answer = (await rl.question(`${promptLabel}: `)).trim();
        const raw = answer.length > 0 ? answer : defaults.join(',');
        const values = raw
            .split(',')
            .map((value) => value.trim())
            .filter((value) => value.length > 0);
        if (values.length === 0) {
            console.log('Phase is required.');
            continue;
        }
        const missing = values.filter((phase) => !phaseExists(phase, validPhases));
        if (missing.length > 0) {
            console.log(`Warning: phase(s) ${missing.join(', ')} not present in WORKFLOW.md.`);
        }
        return values;
    }
}
async function promptForString(rl, label, defaultValue) {
    while (true) {
        const promptLabel = defaultValue ? `${label} [${defaultValue}]` : label;
        const answer = (await rl.question(`${promptLabel}: `)).trim();
        if (answer.length > 0) {
            return answer;
        }
        if (defaultValue && defaultValue.trim().length > 0) {
            return defaultValue.trim();
        }
        console.log(`${label} is required.`);
    }
}
async function promptForList(rl, label, defaults) {
    while (true) {
        const promptLabel = defaults.length > 0 ? `${label} [${defaults.join(', ')}]` : label;
        const answer = (await rl.question(`${promptLabel}: `)).trim();
        const raw = answer.length > 0 ? answer : defaults.join(',');
        const values = raw
            .split(',')
            .map((value) => value.trim())
            .filter((value) => value.length > 0);
        if (values.length === 0) {
            console.log(`${label} must include at least one entry.`);
            continue;
        }
        return values;
    }
}
function phaseExists(phase, validPhases) {
    if (validPhases.size === 0) {
        return true;
    }
    const normalized = phase.trim().toLowerCase();
    return Array.from(validPhases).some((heading) => heading.toLowerCase().includes(normalized));
}
function slugToId(slug) {
    const withoutExtension = slug.replace(/\.md$/i, '');
    const segments = withoutExtension.split(/[\\/]+/).filter((segment) => segment.length > 0);
    const rawId = segments.join('-').replace(/[^a-zA-Z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const normalized = rawId.length > 0 ? rawId : slug.replace(/[^a-zA-Z0-9-]+/g, '-');
    return normalized.toLowerCase();
}
async function updatePromptMetadataFile(repoRoot, update) {
    const metadataPath = path.join(repoRoot, 'resources', 'prompts.meta.yaml');
    const original = await fs.readFile(metadataPath, 'utf8');
    const { header, rest } = splitLeadingComments(original);
    const parsed = rest.trim().length > 0 ? loadYaml(rest) : [];
    if (parsed !== undefined && !Array.isArray(parsed)) {
        throw new Error('Prompt metadata file must contain a YAML array.');
    }
    const entries = Array.isArray(parsed) ? parsed : [];
    let index = entries.findIndex((entry) => isPlainObject(entry) && entry.id === update.id);
    if (index === -1) {
        entries.push({});
        index = entries.length - 1;
    }
    const normalized = normalizeMetadataEntry(entries[index], update);
    entries[index] = normalized;
    entries.sort((a, b) => String(a.id).localeCompare(String(b.id)));
    const orderedEntries = entries.map(orderMetadataEntry);
    const serialized = dumpYaml(orderedEntries, {
        lineWidth: 120,
        noRefs: true,
        sortKeys: false,
        quotingType: '"',
    }).trimEnd();
    const headerSection = header;
    const bodySection = serialized.length > 0 ? `${serialized}\n` : '';
    const nextContent = `${headerSection}${bodySection}`;
    if (nextContent === original) {
        return false;
    }
    await fs.writeFile(metadataPath, nextContent, 'utf8');
    return true;
}
async function runValidationScripts(repoRoot, updateWorkflow) {
    await runNpmScript(repoRoot, 'validate:metadata');
    const buildArgs = updateWorkflow ? ['--', '--update-workflow'] : [];
    await runNpmScript(repoRoot, 'build:catalog', buildArgs);
}
async function runNpmScript(repoRoot, script, extraArgs = []) {
    const commandArgs = ['run', script, ...extraArgs];
    await new Promise((resolve, reject) => {
        const child = spawn('npm', commandArgs, {
            cwd: repoRoot,
            stdio: 'inherit',
        });
        child.on('error', reject);
        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            }
            else {
                reject(new Error(`npm run ${script} exited with code ${code}`));
            }
        });
    });
}
function splitLeadingComments(content) {
    const match = content.match(/^(?:#.*\r?\n)*/);
    const header = match ? match[0] : '';
    const rest = content.slice(header.length);
    return { header, rest };
}
function normalizeMetadataEntry(existing, update) {
    const base = isPlainObject(existing) ? { ...existing } : {};
    base.id = update.id;
    base.title = update.title;
    base.path = toPosixPath(update.path);
    base.phase = update.phase;
    base.gate = update.gate;
    if (typeof base.description !== 'string') {
        base.description = '';
    }
    base.tags = normalizeStringArray(base.tags);
    base.dependsOn = normalizeStringArray(base.dependsOn);
    base.variables = Array.isArray(base.variables) ? base.variables : [];
    return base;
}
function orderMetadataEntry(entry) {
    const ordered = {};
    const priority = ['id', 'title', 'description', 'path', 'phase', 'gate', 'tags', 'dependsOn', 'variables'];
    for (const key of priority) {
        if (entry[key] !== undefined) {
            ordered[key] = entry[key];
        }
    }
    for (const [key, value] of Object.entries(entry)) {
        if (ordered[key] !== undefined) {
            continue;
        }
        ordered[key] = value;
    }
    return ordered;
}
function normalizeStringArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value
        .map((item) => (typeof item === 'string' ? item : String(item)))
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
}
function isPlainObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}
function toPosixPath(filePath) {
    return filePath.split(path.sep).join('/');
}
function ensureMarkdownExtension(slug) {
    return slug.endsWith('.md') ? slug : `${slug}.md`;
}
program
    .command('help', { isDefault: false })
    .description('Display CLI help information.')
    .action(() => {
    program.help();
});
program.parseAsync(process.argv).catch((error) => {
    printError(error);
    process.exitCode = 1;
});
