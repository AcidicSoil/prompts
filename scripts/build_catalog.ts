import { promises as fs } from 'fs';
import path from 'path';

import {
  collectMarkdownFiles,
  loadWorkflowSections,
  Metadata,
  MetadataValue,
  parseFrontMatter,
  slugifyHeading,
  WorkflowSection,
} from './metadata';

interface PhaseReference {
  name: string;
  anchor: string;
  sectionTitle: string;
}

interface PromptEntry {
  file: string;
  title: string;
  trigger: string;
  purpose: string;
  gate: string;
  status: string;
  previous: string[];
  next: string[];
  phases: PhaseReference[];
  primaryPhase: PhaseReference;
}

interface CatalogPhase {
  name: string;
  anchor: string;
  prompts: PromptEntry[];
}

async function main(): Promise<void> {
  const repoRoot = path.resolve(__dirname, '..');
  const workflowPath = path.join(repoRoot, 'WORKFLOW.md');
  const readmePath = path.join(repoRoot, 'README.md');
  const catalogPath = path.join(repoRoot, 'catalog.json');
  const mermaidPath = path.join(repoRoot, 'workflow.mmd');

  const workflowSections = await loadWorkflowSections(workflowPath);
  const markdownFiles = await collectMarkdownFiles(repoRoot);

  const prompts = await loadPromptEntries(markdownFiles, workflowSections, repoRoot);
  const groupedPhases = groupPromptsByPhase(prompts, workflowSections);

  await writeCatalog(catalogPath, groupedPhases);
  const mermaidDiagram = renderWorkflowDiagram(groupedPhases);
  await updateReadme(readmePath, groupedPhases, mermaidDiagram);
  await writeWorkflowDiagram(mermaidPath, mermaidDiagram);

  console.log(`Catalog generated for ${prompts.length} prompt(s).`);
}

async function loadPromptEntries(
  markdownFiles: string[],
  workflowSections: WorkflowSection[],
  repoRoot: string,
): Promise<PromptEntry[]> {
  const prompts: PromptEntry[] = [];
  const triggerIndex = new Map<string, string>();

  for (const filePath of markdownFiles) {
    const content = await fs.readFile(filePath, 'utf8');
    const parsed = parseFrontMatter(content);
    if (!parsed) {
      continue;
    }

    const relativePath = path.relative(repoRoot, filePath);
    const metadata = parsed.metadata as Partial<Metadata>;

    const phases = normalizePhases(metadata.phase, workflowSections, relativePath);
    const gate = requireStringField('gate', metadata.gate, relativePath);
    const status = requireStringField('status', metadata.status, relativePath);
    const previous = normalizeStringArray('previous', metadata.previous, relativePath);
    const next = normalizeStringArray('next', metadata.next, relativePath);

    const title = extractHeading(content, parsed.endOffset, relativePath);
    const trigger = safeExtractTrigger(content, parsed.endOffset, relativePath);
    if (!trigger) {
      console.warn(`Skipping ${relativePath} because it does not declare a Trigger line.`);
      continue;
    }
    const purpose = safeExtractPurpose(content, parsed.endOffset, relativePath);

    const normalizedTrigger = trigger.toLowerCase();
    const existing = triggerIndex.get(normalizedTrigger);
    if (existing) {
      throw new Error(
        `Duplicate trigger detected for "${trigger}" in "${relativePath}" and "${existing}".`,
      );
    }
    triggerIndex.set(normalizedTrigger, relativePath);

    const prompt: PromptEntry = {
      file: relativePath,
      title,
      trigger,
      purpose,
      gate,
      status,
      previous,
      next,
      phases,
      primaryPhase: phases[0],
    };
    prompts.push(prompt);
  }

  return prompts.sort((a, b) => {
    const byPhase = compareByPhase(a.primaryPhase, b.primaryPhase, workflowSections);
    if (byPhase !== 0) {
      return byPhase;
    }
    return a.trigger.localeCompare(b.trigger);
  });
}

function normalizePhases(
  value: MetadataValue | undefined,
  sections: WorkflowSection[],
  file: string,
): PhaseReference[] {
  if (value === undefined) {
    throw new Error(`${file}: missing required field "phase".`);
  }

  const rawPhases = Array.isArray(value) ? value : [value];
  if (rawPhases.length === 0) {
    throw new Error(`${file}: "phase" must contain at least one entry.`);
  }

  return rawPhases.map((phaseValue) => {
    if (typeof phaseValue !== 'string' || phaseValue.trim() === '') {
      throw new Error(`${file}: "phase" contains an empty entry.`);
    }
    const trimmed = phaseValue.trim();
    const section = sections.find((item) => item.title.includes(trimmed));
    if (!section) {
      throw new Error(`${file}: unknown phase "${trimmed}". Update WORKFLOW.md or metadata.`);
    }
    return {
      name: trimmed,
      anchor: section.anchor,
      sectionTitle: section.title,
    };
  });
}

function requireStringField(
  field: string,
  value: MetadataValue | undefined,
  file: string,
): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${file}: missing or empty "${field}".`);
  }
  return value.trim();
}

function normalizeStringArray(
  field: string,
  value: MetadataValue | undefined,
  file: string,
): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${file}: "${field}" must be a non-empty array.`);
  }
  const invalid = value.filter((item) => typeof item !== 'string' || item.trim() === '');
  if (invalid.length > 0) {
    throw new Error(`${file}: "${field}" contains empty entries.`);
  }
  return value.map((item) => (item as string).trim());
}

function extractHeading(content: string, offset: number, file: string): string {
  const lines = content.slice(offset).split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === '') {
      continue;
    }
    if (line.startsWith('# ')) {
      return line.slice(2).trim();
    }
  }
  return inferTitleFromPath(file);
}

function extractInlineField(
  content: string,
  offset: number,
  fieldName: string,
  file: string,
): string {
  const lines = content.slice(offset).split(/\r?\n/);
  const target = `${fieldName.toLowerCase()}:`;
  for (const rawLine of lines) {
    const normalizedLine = rawLine.replace(/\*\*/g, '').trim();
    if (normalizedLine.toLowerCase().startsWith(target)) {
      const rawValue = normalizedLine.slice(target.length).trim();
      if (rawValue === '') {
        throw new Error(`${file}: "${fieldName}" line is present but empty.`);
      }
      return stripWrappingDelimiters(rawValue);
    }
  }
  throw new Error(`${file}: missing inline field "${fieldName}:" in body.`);
}

function safeExtractTrigger(content: string, offset: number, file: string): string | null {
  try {
    return extractInlineField(content, offset, 'Trigger', file);
  } catch (error) {
    if (error instanceof Error && error.message.includes('missing inline field "Trigger')) {
      return null;
    }
    throw error;
  }
}

function safeExtractPurpose(content: string, offset: number, file: string): string {
  try {
    return extractInlineField(content, offset, 'Purpose', file);
  } catch (error) {
    if (error instanceof Error && error.message.includes('missing inline field "Purpose')) {
      return 'See prompt for detailed guidance.';
    }
    throw error;
  }
}

function stripWrappingDelimiters(value: string): string {
  let result = value.trim();
  let updated = true;
  while (updated && result.length >= 2) {
    updated = false;
    if (
      (result.startsWith('`') && result.endsWith('`')) ||
      (result.startsWith('"') && result.endsWith('"')) ||
      (result.startsWith("'") && result.endsWith("'"))
    ) {
      result = result.slice(1, -1).trim();
      updated = true;
      continue;
    }
  }
  return result;
}

function compareByPhase(
  a: PhaseReference,
  b: PhaseReference,
  sections: WorkflowSection[],
): number {
  const order = new Map(sections.map((section, index) => [section.title, index] as const));
  const indexA = order.get(a.sectionTitle) ?? Number.MAX_SAFE_INTEGER;
  const indexB = order.get(b.sectionTitle) ?? Number.MAX_SAFE_INTEGER;
  if (indexA !== indexB) {
    return indexA - indexB;
  }
  return a.name.localeCompare(b.name);
}

function groupPromptsByPhase(
  prompts: PromptEntry[],
  sections: WorkflowSection[],
): CatalogPhase[] {
  const grouped = new Map<string, CatalogPhase>();
  for (const prompt of prompts) {
    const phaseKey = prompt.primaryPhase.sectionTitle;
    const existing = grouped.get(phaseKey);
    if (!existing) {
      grouped.set(phaseKey, {
        name: prompt.primaryPhase.name,
        anchor: prompt.primaryPhase.anchor,
        prompts: [prompt],
      });
    } else {
      existing.prompts.push(prompt);
    }
  }

  return sections
    .filter((section) => grouped.has(section.title))
    .map((section) => grouped.get(section.title)!)
    .map((phase) => ({
      ...phase,
      prompts: phase.prompts.sort((a, b) => a.trigger.localeCompare(b.trigger)),
    }));
}

async function writeCatalog(catalogPath: string, phases: CatalogPhase[]): Promise<void> {
  const catalog = {
    phases: phases.map((phase) => ({
      name: phase.name,
      anchor: phase.anchor,
      prompts: phase.prompts.map((prompt) => ({
        file: prompt.file,
        title: prompt.title,
        trigger: prompt.trigger,
        purpose: prompt.purpose,
        gate: prompt.gate,
        status: prompt.status,
        previous: prompt.previous,
        next: prompt.next,
        phases: prompt.phases.map((phaseRef) => ({
          name: phaseRef.name,
          anchor: phaseRef.anchor,
        })),
      })),
    })),
  };

  const json = `${JSON.stringify(catalog, null, 2)}\n`;
  await fs.writeFile(catalogPath, json, 'utf8');
}

async function updateReadme(
  readmePath: string,
  phases: CatalogPhase[],
  mermaidDiagram: string,
): Promise<void> {
  const startMarker = '<!-- prompts-catalog:start -->';
  const endMarker = '<!-- prompts-catalog:end -->';
  const content = await fs.readFile(readmePath, 'utf8');
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error('README.md is missing catalog markers.');
  }

  const before = content.slice(0, startIndex + startMarker.length);
  const after = content.slice(endIndex);
  const catalogMarkdown = renderCatalogMarkdown(phases);
  const nextContent = `${before}\n\n${catalogMarkdown}${after}`;
  const updatedContent = replaceSection(
    nextContent,
    '<!-- workflow-diagram:start -->',
    '<!-- workflow-diagram:end -->',
    `
${'```'}mermaid\n${mermaidDiagram}${'```'}\n`,
  );
  await fs.writeFile(readmePath, updatedContent, 'utf8');
}

function renderCatalogMarkdown(phases: CatalogPhase[]): string {
  const lines: string[] = [];
  for (const phase of phases) {
    lines.push(`### [${phase.name}](WORKFLOW.md#${phase.anchor})`);
    lines.push('');
    lines.push('| Command | Gate | Purpose |');
    lines.push('| --- | --- | --- |');
    for (const prompt of phase.prompts) {
      lines.push(
        `| ${formatCommand(prompt.trigger)} | ${escapePipes(prompt.gate)} | ${escapePipes(prompt.purpose)} |`,
      );
    }
    lines.push('');
  }
  return lines.join('\n');
}

function formatCommand(trigger: string): string {
  const trimmed = trigger.trim();
  const escaped = trimmed.replace(/`/g, '\\`');
  return `\`${escapePipes(escaped)}\``;
}

function escapePipes(value: string): string {
  return value.replace(/\|/g, '\\|');
}

async function writeWorkflowDiagram(pathname: string, diagram: string): Promise<void> {
  const formatted = diagram.endsWith('\n') ? diagram : `${diagram}\n`;
  await fs.writeFile(pathname, formatted, 'utf8');
}

function renderWorkflowDiagram(phases: CatalogPhase[]): string {
  const lines: string[] = ['flowchart TD'];
  const phaseOrder = phases.map((phase, index) => ({ phase, index }));

  for (const { phase, index } of phaseOrder) {
    const subgraphId = `phase_${index}`;
    lines.push(`  subgraph ${subgraphId}["${escapeMermaidText(phase.name)}"]`);
    for (const prompt of phase.prompts) {
      const nodeId = makeNodeId(prompt.trigger);
      const label = `${prompt.title}\\n${prompt.trigger}`;
      lines.push(`    ${nodeId}["${escapeMermaidText(label)}"]`);
    }
    lines.push('  end');
  }

  for (let i = 0; i < phaseOrder.length - 1; i += 1) {
    const current = phaseOrder[i];
    const next = phaseOrder[i + 1];
    const currentNode = current.phase.prompts[0];
    const nextNode = next.phase.prompts[0];
    if (currentNode && nextNode) {
      lines.push(`  ${makeNodeId(currentNode.trigger)} --> ${makeNodeId(nextNode.trigger)}`);
    }
  }

  return `${lines.join('\n')}\n`;
}

function makeNodeId(trigger: string): string {
  const base = trigger.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  return base.replace(/^_+|_+$/g, '') || `node_${slugifyHeading(trigger)}`;
}

function escapeMermaidText(value: string): string {
  return value.replace(/"/g, '\\"');
}

function inferTitleFromPath(file: string): string {
  const base = path.basename(file, path.extname(file));
  return base
    .split(/[-_]/)
    .filter((segment) => segment.length > 0)
    .map((segment) => segment[0].toUpperCase() + segment.slice(1))
    .join(' ');
}

function replaceSection(
  content: string,
  startMarker: string,
  endMarker: string,
  newBody: string,
): string {
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker, startIndex);
  if (startIndex === -1 || endIndex === -1) {
    throw new Error(`README.md is missing expected marker pair: ${startMarker} ... ${endMarker}`);
  }
  const sectionStart = startIndex + startMarker.length;
  return (
    content.slice(0, sectionStart) +
    newBody.replace(/\r?\n$/, '\n') +
    content.slice(endIndex)
  );
}

main().catch((error) => {
  console.error('Failed to build catalog.');
  console.error(error);
  process.exitCode = 1;
});
