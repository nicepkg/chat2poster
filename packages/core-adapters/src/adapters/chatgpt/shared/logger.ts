/**
 * ChatGPT Share Link Logger
 *
 * Privacy-safe logging utility that is disabled by default.
 * Enable debug logging only during development to avoid exposing user data.
 */

const LOG_PREFIX = "[ChatGPT Adapter]";
const MAX_STRING_LENGTH = 100;

let debugEnabled = false;

/**
 * Enable debug logging (for development only)
 *
 * WARNING: Debug logs may contain sensitive user conversation data.
 * Only enable during local development.
 */
export function enableDebugLogging(): void {
  debugEnabled = true;
}

/**
 * Disable debug logging
 */
export function disableDebugLogging(): void {
  debugEnabled = false;
}

/**
 * Check if debug logging is enabled
 */
export function isDebugEnabled(): boolean {
  return debugEnabled;
}

/**
 * Sanitize a value for safe logging
 * Truncates long strings to avoid exposing full conversation content
 */
export function sanitize(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  if (typeof value === "string") {
    if (value.length <= MAX_STRING_LENGTH) return value;
    return `${value.slice(0, MAX_STRING_LENGTH)}... (${value.length} chars)`;
  }

  if (typeof value === "object") {
    try {
      const json = JSON.stringify(value);
      if (json.length <= MAX_STRING_LENGTH) return json;
      return `${json.slice(0, MAX_STRING_LENGTH)}... (${json.length} chars)`;
    } catch {
      return "[Object]";
    }
  }

  // For symbols and other primitives
  if (typeof value === "symbol") {
    return value.toString();
  }

  // Fallback for any other type
  return `[${typeof value}]`;
}

/**
 * Log a debug message (only when debug logging is enabled)
 */
export function debug(message: string, ...args: unknown[]): void {
  if (!debugEnabled) return;
  console.log(`${LOG_PREFIX} ${message}`, ...args.map(sanitize));
}

/**
 * Log an info message (always logged)
 */
export function info(message: string): void {
  console.info(`${LOG_PREFIX} ${message}`);
}

/**
 * Log a warning message (always logged)
 */
export function warn(message: string): void {
  console.warn(`${LOG_PREFIX} ${message}`);
}

/**
 * Log an error (always logged, but sanitized)
 */
export function error(message: string, err?: unknown): void {
  if (err instanceof Error) {
    console.error(`${LOG_PREFIX} ${message}:`, err.message);
  } else if (err !== undefined) {
    console.error(`${LOG_PREFIX} ${message}:`, sanitize(err));
  } else {
    console.error(`${LOG_PREFIX} ${message}`);
  }
}

/**
 * Create a scoped logger with a specific prefix
 */
export function createScopedLogger(scope: string) {
  const scopePrefix = `[${scope}]`;

  return {
    debug: (message: string, ...args: unknown[]) => {
      if (!debugEnabled) return;
      console.log(
        `${LOG_PREFIX} ${scopePrefix} ${message}`,
        ...args.map(sanitize),
      );
    },
    info: (message: string) => {
      console.info(`${LOG_PREFIX} ${scopePrefix} ${message}`);
    },
    warn: (message: string) => {
      console.warn(`${LOG_PREFIX} ${scopePrefix} ${message}`);
    },
    error: (message: string, err?: unknown) => {
      if (err instanceof Error) {
        console.error(`${LOG_PREFIX} ${scopePrefix} ${message}:`, err.message);
      } else if (err !== undefined) {
        console.error(
          `${LOG_PREFIX} ${scopePrefix} ${message}:`,
          sanitize(err),
        );
      } else {
        console.error(`${LOG_PREFIX} ${scopePrefix} ${message}`);
      }
    },
  };
}
