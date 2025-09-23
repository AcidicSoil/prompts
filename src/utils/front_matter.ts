import matter from 'gray-matter';

export type Scalar = string;
export type MetadataValue = Scalar | Scalar[];

export interface ParsedFrontMatter {
  metadata: Record<string, MetadataValue>;
  endOffset: number;
}

export type FrontMatterRecord = Record<string, MetadataValue | undefined>;

const FRONT_MATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function parseFrontMatter(content: string): ParsedFrontMatter | null {
  if (!content.startsWith('---')) {
    return null;
  }

  const match = content.match(FRONT_MATTER_PATTERN);
  if (!match) {
    throw new Error('Front matter missing closing delimiter.');
  }

  const parsed = matter(content, { excerpt: false });
  const metadata = normalizeMetadata(parsed.data);

  return {
    metadata,
    endOffset: match[0].length,
  };
}

export function ensureArray(value: MetadataValue | undefined): string[] {
  if (value === undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map((entry) => entry.trim()).filter((entry) => entry.length > 0);
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? [trimmed] : [];
}

export function formatFrontMatter(
  metadata: FrontMatterRecord,
  preferredOrder: string[] = ['phase', 'gate', 'status', 'previous', 'next'],
): string {
  const normalizedEntries: [string, MetadataValue][] = [];
  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined || value === null) {
      continue;
    }
    if (Array.isArray(value)) {
      const items = value.map((item) => item.trim()).filter((item) => item.length > 0);
      normalizedEntries.push([key, items]);
    } else {
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        continue;
      }
      normalizedEntries.push([key, trimmed]);
    }
  }

  const orderedKeys = new Set<string>();
  for (const key of preferredOrder) {
    if (normalizedEntries.some(([entryKey]) => entryKey === key)) {
      orderedKeys.add(key);
    }
  }
  for (const [key] of normalizedEntries) {
    if (!orderedKeys.has(key)) {
      orderedKeys.add(key);
    }
  }

  const lines: string[] = ['---'];
  for (const key of orderedKeys) {
    const entry = normalizedEntries.find(([entryKey]) => entryKey === key);
    if (!entry) {
      continue;
    }
    const [, value] = entry;
    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
        continue;
      }
      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - ${JSON.stringify(item)}`);
      }
    } else {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    }
  }

  lines.push('---', '');
  return `${lines.join('\n')}\n`;
}

function normalizeMetadata(raw: unknown): Record<string, MetadataValue> {
  if (raw === null || typeof raw !== 'object') {
    return {};
  }

  const entries = Object.entries(raw as Record<string, unknown>);
  const normalized: Record<string, MetadataValue> = {};

  for (const [key, value] of entries) {
    if (value === undefined || value === null) {
      continue;
    }
    if (Array.isArray(value)) {
      normalized[key] = value.map((item) => stringify(item)).filter((item) => item.length > 0);
    } else {
      const stringValue = stringify(value);
      if (stringValue.length > 0) {
        normalized[key] = stringValue;
      }
    }
  }

  return normalized;
}

function stringify(input: unknown): string {
  if (typeof input === 'string') {
    return input.trim();
  }
  return String(input).trim();
}
