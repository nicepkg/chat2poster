/**
 * React Flight Decoder
 *
 * Decodes React Flight loader payloads from ChatGPT share pages.
 */

import type { JsonValue, DecodedLoader } from "./types";

/**
 * Decode a flattened React Flight loader array into structured data.
 *
 * The loader format is a flat array where:
 * - Odd indices contain keys (strings)
 * - Even indices contain values (which may be integers referencing other indices)
 * - Objects use keys like "_1", "_2" that reference other indices
 */
export function decodeLoader(loader: JsonValue[]): DecodedLoader {
  const cache = new Map<number, JsonValue>();

  /**
   * Decode a key that might be a reference (e.g., "_1" -> loader[1])
   */
  function decodeKey(rawKey: JsonValue): string {
    if (
      typeof rawKey === "string" &&
      rawKey.startsWith("_") &&
      /^\d+$/.test(rawKey.slice(1))
    ) {
      const idx = parseInt(rawKey.slice(1), 10);
      if (idx >= 0 && idx < loader.length) {
        const candidate = loader[idx];
        if (typeof candidate === "string") {
          return candidate;
        }
      }
    }
    return typeof rawKey === "object" && rawKey !== null
      ? JSON.stringify(rawKey)
      : String(rawKey);
  }

  /**
   * Resolve a value, following integer references
   */
  function resolve(value: JsonValue): JsonValue {
    // Integer reference to another index
    if (typeof value === "number" && Number.isInteger(value)) {
      if (cache.has(value)) {
        return cache.get(value)!;
      }
      if (value < 0 || value >= loader.length) {
        return value;
      }
      cache.set(value, null);
      const loaderValue = loader[value];
      if (loaderValue === undefined) return value;
      const resolved = resolve(loaderValue);
      cache.set(value, resolved);
      return resolved;
    }

    // Array - resolve each element
    if (Array.isArray(value)) {
      return value.map((item) => resolve(item));
    }

    // Object - resolve values and decode keys
    if (typeof value === "object" && value !== null) {
      const result: Record<string, JsonValue> = {};
      for (const [k, v] of Object.entries(value)) {
        result[decodeKey(k)] = resolve(v);
      }
      return result;
    }

    return value;
  }

  // Build the result by iterating through key-value pairs
  const resolved: Record<string, JsonValue> = {};
  const iter = loader.slice(1);

  for (let i = 0; i < iter.length - 1; i += 2) {
    const key = iter[i];
    const value = iter[i + 1];
    if (typeof key === "string" && !(key in resolved) && value !== undefined) {
      resolved[key] = resolve(value);
    }
  }

  return resolved as unknown as DecodedLoader;
}

/**
 * Extract content from streamController.enqueue() call
 *
 * Handles nested parentheses and quoted strings properly.
 */
export function extractEnqueueContent(
  html: string,
  startPos: number,
): string | null {
  let pos = startPos;
  let depth = 1;
  let inString = false;
  let escape = false;

  while (pos < html.length && depth > 0) {
    const char = html[pos];

    if (escape) {
      escape = false;
    } else if (char === "\\") {
      escape = true;
    } else if (char === '"' && !escape) {
      inString = !inString;
    } else if (!inString) {
      if (char === "(") {
        depth++;
      } else if (char === ")") {
        depth--;
      }
    }
    pos++;
  }

  if (depth === 0) {
    return html.slice(startPos, pos - 1).trim();
  }
  return null;
}

/**
 * Extract React Flight loader payload from HTML
 */
export function extractLoaderPayload(html: string): JsonValue[] | null {
  const marker = "streamController.enqueue(";
  let searchStart = 0;

  while (true) {
    const markerPos = html.indexOf(marker, searchStart);
    if (markerPos === -1) break;

    const contentStart = markerPos + marker.length;
    const rawChunk = extractEnqueueContent(html, contentStart);

    if (!rawChunk) {
      searchStart = contentStart;
      continue;
    }

    let chunk = rawChunk;

    // Remove outer quotes and unescape JSON string
    if (chunk.startsWith('"') && chunk.endsWith('"')) {
      try {
        chunk = JSON.parse(chunk) as string;
      } catch {
        // Continue with raw string
      }
    }

    chunk = chunk.trim();

    // Try to parse as JSON array
    if (chunk.startsWith("[")) {
      try {
        const parsed = JSON.parse(chunk) as unknown;
        if (Array.isArray(parsed)) {
          return parsed as JsonValue[];
        }
      } catch {
        // Try to fix common escape issues
        try {
          const fixed = chunk
            .replace(/\\x([0-9A-Fa-f]{2})/g, (_match: string, hex: string) =>
              String.fromCharCode(parseInt(hex, 16)),
            )
            .replace(/\\u([0-9A-Fa-f]{4})/g, (_match: string, hex: string) =>
              String.fromCharCode(parseInt(hex, 16)),
            );
          const parsedFixed = JSON.parse(fixed) as unknown;
          if (Array.isArray(parsedFixed)) {
            return parsedFixed as JsonValue[];
          }
        } catch {
          // Continue to next match
        }
      }
    }

    searchStart = contentStart + rawChunk.length;
  }

  return null;
}
