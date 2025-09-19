export interface PromptCatalogEntry {
  phase: string;
  command: string;
  title: string;
  purpose: string;
  gate: string;
  status: string;
  previous: string[];
  next: string[];
  path: string;
}

export type PromptCatalog = Record<string, PromptCatalogEntry[]>;

export function normalizePhaseLabel(phase: string): string {
  return phase
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
