const SENSITIVE_KEY_PATTERN = /(key|secret|token)/i;

const REDACTED_VALUE = "[redacted]";

export type Redactable = unknown;

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.getPrototypeOf(value) === Object.prototype
  );
};

const cloneArrayWithRedaction = (input: unknown[]): unknown[] => {
  return input.map((item) => redactSecrets(item));
};

const cloneObjectWithRedaction = (input: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      result[key] = REDACTED_VALUE;
      continue;
    }

    result[key] = redactSecrets(value);
  }

  return result;
};

export function redactSecrets<T extends Redactable>(data: T): T {
  if (Array.isArray(data)) {
    return cloneArrayWithRedaction(data) as unknown as T;
  }

  if (isPlainObject(data)) {
    return cloneObjectWithRedaction(data) as unknown as T;
  }

  return data;
}

const formatTruncationMessage = (bytesRemoved: number): string => {
  return `[truncated ${bytesRemoved} bytes]`;
};

const utf8ByteLength = (value: string): number => Buffer.byteLength(value, "utf8");

export function capPayload(payload: string, maxSize: number = 1024 * 1024): string {
  if (maxSize <= 0) {
    return payload;
  }

  const payloadBytes = utf8ByteLength(payload);
  if (payloadBytes <= maxSize) {
    return payload;
  }

  const buffer = Buffer.from(payload, "utf8");
  let truncatedBuffer = buffer.subarray(0, maxSize);
  let truncatedText = truncatedBuffer.toString("utf8");

  if (utf8ByteLength(truncatedText) > truncatedBuffer.length) {
    const decoder = new TextDecoder("utf-8", { fatal: true });
    while (truncatedBuffer.length > 0) {
      try {
        truncatedText = decoder.decode(truncatedBuffer);
        break;
      } catch {
        truncatedBuffer = truncatedBuffer.subarray(0, truncatedBuffer.length - 1);
      }
    }
  }

  const truncatedBytes = payloadBytes - truncatedBuffer.length;

  return `${truncatedText}${formatTruncationMessage(truncatedBytes)}`;
}
