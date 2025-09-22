import { redactSecrets } from "./utils/safety.js";
const ERROR_KEYS = ["name", "message", "stack", "cause"];
const sanitizeValue = (value) => {
    if (value instanceof Error) {
        const errorPayload = {};
        for (const key of ERROR_KEYS) {
            const data = value[key];
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
        const input = value;
        const result = {};
        for (const [key, nestedValue] of Object.entries(input)) {
            if (nestedValue !== undefined) {
                result[key] = sanitizeValue(nestedValue);
            }
        }
        return result;
    }
    return value;
};
const prepareMetadata = (metadata) => {
    if (!metadata) {
        return undefined;
    }
    const sanitized = {};
    for (const [key, value] of Object.entries(metadata)) {
        if (value !== undefined) {
            sanitized[key] = sanitizeValue(value);
        }
    }
    return Object.keys(sanitized).length > 0 ? sanitized : undefined;
};
export class Logger {
    stream;
    constructor(stream = process.stderr) {
        this.stream = stream;
    }
    write(level, message, metadata) {
        const entry = {
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
    info(message, metadata) {
        this.write("info", message, metadata);
    }
    warn(message, metadata) {
        this.write("warn", message, metadata);
    }
    error(message, metadata) {
        this.write("error", message, metadata);
    }
}
export const logger = new Logger(process.stderr);
const redactMetadata = (metadata) => {
    if (!metadata) {
        return undefined;
    }
    return prepareMetadata(redactSecrets(metadata));
};
export const createSecureLogger = (baseLogger) => ({
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
