export type Scalar = string;

export type MetadataValue = Scalar | Scalar[];

export interface ParsedFrontMatter {
  metadata: Record<string, MetadataValue>;
  endOffset: number;
}

export function parseFrontMatter(content: string): ParsedFrontMatter | null {
  if (!content.startsWith('---')) {
    return null;
  }
  const closingIndex = content.indexOf('\n---', 3);
  if (closingIndex === -1) {
    throw new Error('Front matter missing closing delimiter.');
  }
  const frontMatter = content.slice(4, closingIndex);
  const lines = frontMatter.split('\n');
  const data: Record<string, MetadataValue> = {};
  let currentKey: string | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (line.trim() === '') {
      continue;
    }
    const itemMatch = line.match(/^[-\s]+-\s+(.*)$/);
    if (itemMatch) {
      if (!currentKey) {
        throw new Error(`Array item encountered without a key in front matter: "${line}"`);
      }
      const array = (data[currentKey] as Scalar[]) || [];
      array.push(parseScalar(itemMatch[1].trim()));
      data[currentKey] = array;
      continue;
    }

    const keyMatch = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!keyMatch) {
      throw new Error(`Unable to parse front matter line: "${line}"`);
    }
    const [, key, rawValue] = keyMatch;
    if (rawValue.length === 0) {
      data[key] = [];
      currentKey = key;
    } else {
      data[key] = parseScalar(rawValue);
      currentKey = null;
    }
  }

  return { metadata: data, endOffset: closingIndex + 4 };
}

function parseScalar(value: string): string {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    const inner = trimmed.slice(1, -1);
    return inner.replace(/\\"/g, '"').replace(/\\'/g, "'");
  }
  return trimmed;
}
