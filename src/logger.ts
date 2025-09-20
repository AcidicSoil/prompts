import { redactSecrets } from "./utils/safety.js";

export type LogLevel = "info" | "warn" | "error";

export interface LogMetadata {
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: LogMetadata;
}

const ERROR_KEYS: Array<keyof Error> = ["name", "message", "stack", "cause"];

const sanitizeValue = (value: unknown): unknown => {
  if (value instanceof Error) {
    const errorPayload: Record<string, unknown> = {};
    for (const key of ERROR_KEYS) {
      const data = (value as Error)[key];
      if (data !== undefined) {
        errorPayload[key] = data;
      }
    }
    return errorPayload;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value && typeof value === "object") {
    const input = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(input)) {
      if (nestedValue !== undefined) {
        result[key] = sanitizeValue(nestedValue);
      }
    }
    return result;
  }

  return value;
};

const prepareMetadata = (metadata?: LogMetadata): LogMetadata | undefined => {
  if (!metadata) {
    return undefined;
  }

  const sanitized: LogMetadata = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value !== undefined) {
      sanitized[key] = sanitizeValue(value);
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
};

export class Logger {
  private readonly stream: NodeJS.WriteStream;

  constructor(stream: NodeJS.WriteStream = process.stdout) {
    this.stream = stream;
  }

  private write(level: LogLevel, message: string, metadata?: LogMetadata): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    const sanitizedMetadata = prepareMetadata(metadata);
    if (sanitizedMetadata) {
      entry.metadata = sanitizedMetadata;
    }

    this.stream.write(`${JSON.stringify(entry)}\n`);
  }

  info(message: string, metadata?: LogMetadata): void {
    this.write("info", message, metadata);
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.write("warn", message, metadata);
  }

  error(message: string, metadata?: LogMetadata): void {
    this.write("error", message, metadata);
  }
}

export const logger = new Logger();

const redactMetadata = (metadata?: LogMetadata): LogMetadata | undefined => {
  if (!metadata) {
    return undefined;
  }

  return prepareMetadata(redactSecrets(metadata) as LogMetadata);
};

export type SecureLogger = Pick<Logger, "info" | "warn" | "error">;

export const createSecureLogger = (baseLogger: Logger): SecureLogger => ({
  info(message, metadata) {
    baseLogger.info(message, redactMetadata(metadata));
  },
  warn(message, metadata) {
    baseLogger.warn(message, redactMetadata(metadata));
  },
  error(message, metadata) {
    baseLogger.error(message, redactMetadata(metadata));
  },
});

export const secureLogger = createSecureLogger(logger);
