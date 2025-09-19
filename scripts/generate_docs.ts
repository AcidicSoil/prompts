import { promises as fs } from 'fs';
import path from 'path';

import { PromptCatalog, PromptCatalogEntry, normalizePhaseLabel } from './catalog_types';
import { writeFileAtomic } from './file_utils';

interface GenerateDocsOptions {
  updateWorkflow: boolean;
}

interface CrossEntry {
  command: string;
  stageTieIn: string;
  purpose: string;
}

export async function generateDocs(
  repoRoot: string,
  catalog: PromptCatalog,
  options: GenerateDocsOptions,
): Promise<void> {
  const readmeUpdated = await updateReadme(repoRoot, catalog);
  if (readmeUpdated) {
    console.log('Updated README.md metadata tables.');
  } else {
    console.log('README.md metadata tables already match catalog.json.');
  }

  if (options.updateWorkflow) {
    const workflowUpdated = await regenerateWorkflow(repoRoot, catalog);
    if (workflowUpdated) {
      console.log('Regenerated workflow.mmd from catalog graph.');
    } else {
      console.log('workflow.mmd already up to date with catalog graph.');
    }
  } else {
    console.log('Skipped workflow.mmd regeneration (pass --update-workflow to enable).');
  }
}

async function updateReadme(repoRoot: string, catalog: PromptCatalog): Promise<boolean> {
  const readmePath = path.join(repoRoot, 'README.md');
  const original = await fs.readFile(readmePath, 'utf8');
  const lines = original.split(/\r?\n/);
  const usedPhases = new Set<string>();
  let modified = false;
  let crossHeadingIndex: number | null = null;

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (!line.startsWith('### [')) {
      continue;
    }
    const headingLabel = extractHeadingLabel(line);
    if (!headingLabel) {
      continue;
    }
    if (headingLabel === 'Reset Playbook') {
      crossHeadingIndex = index;
      continue;
    }
    if (!/^P\d+/i.test(headingLabel)) {
      continue;
    }
    const normalized = normalizePhaseLabel(headingLabel);
    usedPhases.add(normalized);
    const entries = catalog[normalized];
    if (!entries) {
      throw new Error(`README.md references phase "${headingLabel}" but catalog.json has no entries.`);
    }
    const bounds = locateTableBounds(lines, index + 1);
    const tableLines = buildPhaseTable(entries);
    if (!tableEquals(lines.slice(bounds.start, bounds.end), tableLines)) {
      lines.splice(bounds.start, bounds.end - bounds.start, ...tableLines);
      modified = true;
    }
  }

  if (crossHeadingIndex !== null) {
    const bounds = locateTableBounds(lines, crossHeadingIndex + 1);
    const crossEntries = collectCrossEntries(catalog, usedPhases);
    const tableLines = buildCrossTable(crossEntries);
    if (!tableEquals(lines.slice(bounds.start, bounds.end), tableLines)) {
      lines.splice(bounds.start, bounds.end - bounds.start, ...tableLines);
      modified = true;
    }
  }

  if (!modified) {
    return false;
  }

  const updatedContent = ensureTrailingNewline(lines.join('\n'));
  await writeFileAtomic(readmePath, updatedContent);
  return true;
}

function extractHeadingLabel(line: string): string | null {
  const bracketStart = line.indexOf('[');
  const bracketEnd = line.indexOf('](', bracketStart);
  if (bracketStart === -1 || bracketEnd === -1) {
    return null;
  }
  return line.slice(bracketStart + 1, bracketEnd);
}

function locateTableBounds(lines: string[], startIndex: number): { start: number; end: number } {
  let start = startIndex;
  while (start < lines.length && lines[start].trim() === '') {
    start++;
  }
  let end = start;
  while (end < lines.length && lines[end].trim().startsWith('|')) {
    end++;
  }
  return { start, end };
}

function buildPhaseTable(entries: PromptCatalogEntry[]): string[] {
  const rows = entries
    .slice()
    .sort((a, b) => a.command.localeCompare(b.command))
    .map((entry) => `| ${escapeCell(entry.command)} | ${escapeCell(entry.purpose)} |`);
  return ['| Command | What it does |', '| --- | --- |', ...rows];
}

function collectCrossEntries(
  catalog: PromptCatalog,
  usedPhases: Set<string>,
): CrossEntry[] {
  const entries: CrossEntry[] = [];
  const seen = new Set<string>();
  for (const [normalized, bucket] of Object.entries(catalog)) {
    if (usedPhases.has(normalized)) {
      continue;
    }
    for (const entry of bucket) {
      const key = `${entry.command}::${entry.phase}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      entries.push({
        command: entry.command,
        stageTieIn: entry.phase,
        purpose: entry.purpose,
      });
    }
  }
  entries.sort((a, b) => {
    const stage = a.stageTieIn.localeCompare(b.stageTieIn);
    if (stage !== 0) {
      return stage;
    }
    return a.command.localeCompare(b.command);
  });
  return entries;
}

function buildCrossTable(entries: CrossEntry[]): string[] {
  const rows = entries.map(
    (entry) => `| ${escapeCell(entry.command)} | ${escapeCell(entry.stageTieIn)} | ${escapeCell(entry.purpose)} |`,
  );
  return ['| Command | Stage tie-in | What it does |', '| --- | --- | --- |', ...rows];
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, '\\|');
}

function tableEquals(existing: string[], replacement: string[]): boolean {
  if (existing.length !== replacement.length) {
    return false;
  }
  for (let index = 0; index < existing.length; index++) {
    if (existing[index] !== replacement[index]) {
      return false;
    }
  }
  return true;
}

function ensureTrailingNewline(content: string): string {
  return content.endsWith('\n') ? content : `${content}\n`;
}

async function regenerateWorkflow(repoRoot: string, catalog: PromptCatalog): Promise<boolean> {
  const workflowPath = path.join(repoRoot, 'workflow.mmd');
  const lines = buildWorkflowGraph(catalog);
  const payload = ensureTrailingNewline(lines.join('\n'));
  return writeFileAtomic(workflowPath, payload);
}

function buildWorkflowGraph(catalog: PromptCatalog): string[] {
  const phaseKeys = Object.keys(catalog);
  const numbered = phaseKeys
    .filter((key) => /^p\d/.test(key))
    .sort((a, b) => comparePhaseKeys(a, b));
  const nonNumbered = phaseKeys.filter((key) => !/^p\d/.test(key)).sort();
  const orderedKeys = [...numbered, ...nonNumbered];

  const commandAssignments = new Map<string, string>();
  const commandLookup = new Map<string, PromptCatalogEntry>();
  const phaseLabels = new Map<string, string>();

  for (const key of orderedKeys) {
    const bucket = catalog[key] ?? [];
    if (bucket.length > 0) {
      phaseLabels.set(key, bucket[0].phase);
    }
    for (const entry of bucket) {
      if (!commandLookup.has(entry.command)) {
        commandLookup.set(entry.command, entry);
        commandAssignments.set(entry.command, key);
      }
    }
  }

  const lines: string[] = ['flowchart TD'];
  for (const key of numbered) {
    lines.push(...renderPhaseSubgraph(key, phaseLabels.get(key) ?? key, commandAssignments));
  }

  const crossPhaseNodes: string[] = [];
  for (const key of nonNumbered) {
    crossPhaseNodes.push(...renderPhaseSubgraph(key, phaseLabels.get(key) ?? key, commandAssignments));
  }
  if (crossPhaseNodes.length > 0) {
    lines.push(...crossPhaseNodes);
  }

  const edges = buildEdges(commandLookup);
  lines.push(...edges);
  return lines;
}

function renderPhaseSubgraph(
  phaseKey: string,
  label: string,
  commandAssignments: Map<string, string>,
): string[] {
  const commands: string[] = [];
  for (const [command, assignedPhase] of commandAssignments.entries()) {
    if (assignedPhase !== phaseKey) {
      continue;
    }
    commands.push(command);
  }
  if (commands.length === 0) {
    return [];
  }
  commands.sort((a, b) => a.localeCompare(b));
  const lines: string[] = [];
  const phaseId = toPhaseId(phaseKey);
  lines.push(`  subgraph ${phaseId}["${escapeLabel(label)}"]`);
  for (const command of commands) {
    const nodeId = toCommandId(command);
    lines.push(`    ${nodeId}[/${command}/]`);
  }
  lines.push('  end');
  return lines;
}

function buildEdges(commandLookup: Map<string, PromptCatalogEntry>): string[] {
  const edges: string[] = [];
  const seen = new Set<string>();
  for (const entry of commandLookup.values()) {
    const sourceId = toCommandId(entry.command);
    for (const nextCommand of entry.next) {
      const targetEntry = commandLookup.get(nextCommand);
      if (!targetEntry) {
        continue;
      }
      const targetId = toCommandId(targetEntry.command);
      const key = `${sourceId}->${targetId}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      edges.push(`  ${sourceId} --> ${targetId}`);
    }
  }
  return edges.sort((a, b) => a.localeCompare(b));
}

function toPhaseId(phaseKey: string): string {
  return `phase_${phaseKey.replace(/[^a-z0-9]/g, '_')}`;
}

function toCommandId(command: string): string {
  const stripped = command.replace(/^\//, '');
  const normalized = stripped.replace(/[^a-z0-9]/gi, '_');
  return `cmd_${normalized}`;
}

function escapeLabel(label: string): string {
  return label.replace(/"/g, '\\"');
}

function comparePhaseKeys(a: string, b: string): number {
  const numberA = extractPhaseNumber(a);
  const numberB = extractPhaseNumber(b);
  if (numberA !== null && numberB !== null && numberA !== numberB) {
    return numberA - numberB;
  }
  return a.localeCompare(b);
}

function extractPhaseNumber(key: string): number | null {
  const match = key.match(/^p(\d+)/);
  if (!match) {
    return null;
  }
  return Number.parseInt(match[1], 10);
}
