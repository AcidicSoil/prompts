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

const decodeUtf8Safely = (input: Buffer): { buffer: Buffer; text: string } => {
  let current = input;
  const decoder = new TextDecoder("utf-8", { fatal: true });

  while (current.length > 0) {
    try {
      const text = decoder.decode(current);
      return { buffer: current, text };
    } catch {
      current = current.subarray(0, current.length - 1);
    }
  }

  return { buffer: Buffer.alloc(0), text: "" };
};

const clampSuffixToLimit = (suffix: string, limit: number): string => {
  if (limit <= 0) {
    return "";
  }

  let result = suffix;
  while (utf8ByteLength(result) > limit && result.length > 0) {
    result = result.slice(0, result.length - 1);
  }

  return result;
};

export function capPayload(payload: string, maxSize: number = 1024 * 1024): string {
  if (maxSize <= 0) {
    return "";
  }

  const payloadBytes = utf8ByteLength(payload);
  if (payloadBytes <= maxSize) {
    return payload;
  }

  const buffer = Buffer.from(payload, "utf8");
  let targetLength = Math.min(maxSize, buffer.length);

  while (targetLength >= 0) {
    const { buffer: validBuffer, text: truncatedText } = decodeUtf8Safely(buffer.subarray(0, targetLength));
    const truncatedBytes = payloadBytes - validBuffer.length;
    const suffix = formatTruncationMessage(truncatedBytes);
    const suffixBytes = utf8ByteLength(suffix);

    if (suffixBytes > maxSize) {
      return clampSuffixToLimit(suffix, maxSize);
    }

    const allowedPrefixBytes = maxSize - suffixBytes;
    if (allowedPrefixBytes <= 0) {
      return clampSuffixToLimit(suffix, maxSize);
    }

    if (validBuffer.length <= allowedPrefixBytes) {
      return `${truncatedText}${suffix}`;
    }

    targetLength = Math.min(allowedPrefixBytes, validBuffer.length - 1);
  }

  const fallbackSuffix = formatTruncationMessage(payloadBytes);
  return clampSuffixToLimit(fallbackSuffix, maxSize);
}
