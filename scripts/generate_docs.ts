import { promises as fs } from 'fs';
import path from 'path';
import type { CatalogEntry, CatalogOutput } from './build_catalog';

interface GenerateDocsOptions {
  repoRoot: string;
  updateWorkflow: boolean;
}

interface PhaseGrouping {
  [phase: string]: CatalogEntry[];
}

export async function generateDocs(
  catalog: CatalogOutput,
  options: GenerateDocsOptions,
): Promise<void> {
  const { repoRoot, updateWorkflow } = options;
  await updateReadme(catalog.entries, repoRoot);

  if (updateWorkflow) {
    await updateWorkflowDiagram(catalog.entries, repoRoot);
  }
}

async function updateReadme(entries: CatalogEntry[], repoRoot: string): Promise<void> {
  const readmePath = path.join(repoRoot, 'README.md');
  const original = await fs.readFile(readmePath, 'utf8');
  const lines = original.split(/\r?\n/);

  const { numberedPhaseMap, crossCutting } = groupEntries(entries);
  const updatedLines = [...lines];

  for (let i = 0; i < updatedLines.length; i += 1) {
    const line = updatedLines[i];
    const headingMatch = line.match(/^### \[([^\]]+)\]/);
    if (!headingMatch) {
      continue;
    }
    const headingLabel = headingMatch[1];
    if (headingLabel.startsWith('P') && numberedPhaseMap[headingLabel]) {
      const tableLines = buildPhaseTable(numberedPhaseMap[headingLabel]);
      replaceTableBlock(updatedLines, i + 1, tableLines);
    } else if (headingLabel === 'Reset Playbook') {
      const tableLines = buildCrossCuttingTable(crossCutting);
      replaceTableBlock(updatedLines, i + 1, tableLines);
    }
  }

  const updatedContent = `${updatedLines.join('\n')}`;
  if (updatedContent !== original) {
    await writeFileAtomic(readmePath, updatedContent);
  }
}

function groupEntries(entries: CatalogEntry[]): {
  numberedPhaseMap: PhaseGrouping;
  crossCutting: CatalogEntry[];
} {
  const numberedPhaseMap: PhaseGrouping = {};
  const crossCutting: CatalogEntry[] = [];

  for (const entry of entries) {
    const numericPhases = entry.phases.filter((phase) => /^P\d+\b/.test(phase));
    if (entry.phases.length === 1 && numericPhases.length === 1) {
      const phase = numericPhases[0];
      if (!numberedPhaseMap[phase]) {
        numberedPhaseMap[phase] = [];
      }
      numberedPhaseMap[phase].push(entry);
    } else {
      crossCutting.push(entry);
    }
  }

  for (const phase of Object.keys(numberedPhaseMap)) {
    numberedPhaseMap[phase].sort((a, b) => a.command.localeCompare(b.command));
  }
  crossCutting.sort((a, b) => a.command.localeCompare(b.command));

  return { numberedPhaseMap, crossCutting };
}

function buildPhaseTable(entries: CatalogEntry[]): string[] {
  const rows = ['| Command | What it does |', '| --- | --- |'];
  for (const entry of entries) {
    rows.push(`| ${entry.command} | ${entry.purpose} |`);
  }
  if (entries.length === 0) {
    rows.push('| _No commands yet_ | |');
  }
  return rows;
}

function buildCrossCuttingTable(entries: CatalogEntry[]): string[] {
  const rows = ['| Command | Stage tie-in | What it does |', '| --- | --- | --- |'];
  for (const entry of entries) {
    const stage = entry.phases.join(', ');
    rows.push(`| ${entry.command} | ${stage} | ${entry.purpose} |`);
  }
  if (entries.length === 0) {
    rows.push('| _No commands yet_ | — | |');
  }
  return rows;
}

function replaceTableBlock(lines: string[], startIndex: number, newTable: string[]): void {
  let index = startIndex;
  while (index < lines.length && lines[index].trim() === '') {
    index += 1;
  }

  const tableStart = index;
  while (index < lines.length && lines[index].trim().startsWith('|')) {
    index += 1;
  }
  const tableEnd = index;

  lines.splice(tableStart, tableEnd - tableStart, ...newTable);
}

async function updateWorkflowDiagram(entries: CatalogEntry[], repoRoot: string): Promise<void> {
  const workflowPath = path.join(repoRoot, 'workflow.mmd');
  const nodeIds = new Map<string, string>();
  const edges: Array<[string, string]> = [];

  for (const entry of entries) {
    const id = sanitizeId(entry.command);
    nodeIds.set(entry.command, id);
  }

  for (const entry of entries) {
    const sourceId = nodeIds.get(entry.command);
    if (!sourceId) {
      continue;
    }
    for (const target of entry.next) {
      const commandMatch = target.match(/\/[a-z0-9-]+/i);
      if (!commandMatch) {
        continue;
      }
      const targetCommand = commandMatch[0];
      const targetId = nodeIds.get(targetCommand);
      if (!targetId) {
        continue;
      }
      edges.push([sourceId, targetId]);
    }
  }

  const lines = ['flowchart TD', '  %% Auto-generated from catalog metadata'];
  for (const [command, id] of nodeIds.entries()) {
    lines.push(`  ${id}["${command}"]`);
  }
  for (const [from, to] of edges) {
    lines.push(`  ${from} --> ${to}`);
  }

  lines.push('');
  await writeFileAtomic(workflowPath, `${lines.join('\n')}`);
}

function sanitizeId(command: string): string {
  return command.replace(/[^a-zA-Z0-9]/g, '_');
}

async function writeFileAtomic(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  const tempPath = path.join(dir, `.${path.basename(filePath)}.${process.pid}.${Date.now()}`);
  await fs.writeFile(tempPath, content, 'utf8');
  await fs.rename(tempPath, filePath);
}
