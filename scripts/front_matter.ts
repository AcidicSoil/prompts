import matter from 'gray-matter';

export type Scalar = string;

export type MetadataValue = Scalar | Scalar[];

export interface ParsedFrontMatter {
  metadata: Record<string, MetadataValue>;
  endOffset: number;
}

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
