/**
 * ChatGPT Share Link Adapter
 *
 * Parses conversations from ChatGPT share link pages.
 * Based on the chatgpt-share-to-markdown Python implementation.
 *
 * Share Link URL Format:
 * - https://chatgpt.com/s/t_{id}
 * - https://chatgpt.com/share/{id}
 * - https://chat.openai.com/share/{id}
 *
 * Supports two extraction strategies:
 * 1. Modern: React Flight loader payload (streamController.enqueue)
 * 2. Legacy: __NEXT_DATA__ script tag
 *
 * @see https://github.com/nicepkg/chat2poster
 */

import type { Provider } from "@chat2poster/core-schema";
import { createAppError } from "@chat2poster/core-schema";
import { BaseShareLinkAdapter, type RawMessage } from "../base";
import { fetchHtml } from "../network";

// =============================================================================
// Types
// =============================================================================

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

interface MessageAuthor {
  role?: string;
  name?: string;
}

interface MessageContent {
  content_type?: string;
  parts?: (string | Record<string, JsonValue>)[];
  text?: string;
  language?: string;
  thoughts?: Array<{ summary?: string; content?: string }>;
}

interface MessageNode {
  id?: string;
  message?: {
    id?: string;
    author?: MessageAuthor;
    content?: MessageContent;
    create_time?: number;
    metadata?: {
      attachments?: Array<{
        download_url?: string;
        file_url?: string;
        mime_type?: string;
        name?: string;
        title?: string;
        file_type?: string;
        type?: string;
      }>;
    };
  };
  parent?: string;
  children?: string[];
}

interface ShareData {
  title?: string;
  model?: { slug?: string };
  update_time?: number;
  mapping?: Record<string, MessageNode>;
  linear_conversation?: Array<{ id?: string }>;
}

interface ServerResponse {
  data?: ShareData;
  sharedConversationId?: string;
}

interface LoaderData {
  "routes/share.$shareId.($action)"?: {
    serverResponse?: ServerResponse;
    sharedConversationId?: string;
  };
}

interface DecodedLoader {
  loaderData?: LoaderData;
}

// =============================================================================
// Text Processing Utilities
// =============================================================================

/** Pattern to match Unicode private use area characters */
const PRIVATE_USE_PATTERN = /[\uE000-\uF8FF]/g;

/** Pattern to match citation tokens */
const CITATION_TOKEN_PATTERN = /\s*(?:citeturn|navlist|turn\d+\w*)[^,\s]*,?/g;

/**
 * Strip private use Unicode characters
 */
function stripPrivateUse(text: string): string {
  return text.replace(PRIVATE_USE_PATTERN, "");
}

/**
 * Strip citation tokens from text
 */
function stripCitationTokens(text: string): string {
  if (!text) return text;
  return text
    .split("\n")
    .map((line) => line.replace(CITATION_TOKEN_PATTERN, "").trimEnd())
    .join("\n");
}

// =============================================================================
// React Flight Loader Decoder
// =============================================================================

/**
 * Decode a flattened React Flight loader array into structured data.
 *
 * The loader format is a flat array where:
 * - Odd indices contain keys (strings)
 * - Even indices contain values (which may be integers referencing other indices)
 * - Objects use keys like "_1", "_2" that reference other indices
 */
function decodeLoader(loader: JsonValue[]): DecodedLoader {
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

// =============================================================================
// Content Extraction
// =============================================================================

/**
 * Flatten message content into a string based on content type
 */
function flattenMessageContent(content: MessageContent): string {
  const contentType = content.content_type;

  // Text content
  if (contentType === "text") {
    const parts = content.parts ?? [];
    const textParts: string[] = [];

    for (const part of parts) {
      if (typeof part !== "string") continue;

      let cleaned = stripPrivateUse(part).trim();

      // Try to parse JSON response
      if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
        try {
          const json = JSON.parse(cleaned) as Record<string, unknown>;
          if (typeof json.response === "string") {
            cleaned = json.response;
          } else if (typeof json.content === "string") {
            cleaned = json.content;
          }
        } catch {
          // Keep original
        }
      }

      if (cleaned) {
        textParts.push(cleaned);
      }
    }

    return textParts.join("\n\n");
  }

  // Code content
  if (contentType === "code") {
    const lang =
      content.language && content.language !== "unknown"
        ? content.language
        : "";
    let body = typeof content.text === "string" ? content.text.trimEnd() : "";

    if (body) {
      // Try to summarize tool payload
      try {
        const json = JSON.parse(body) as Record<string, unknown>;
        // Remove response_length and format nicely
        const cleaned = Object.fromEntries(
          Object.entries(json).filter(([k]) => k !== "response_length"),
        );
        if (Object.keys(cleaned).length > 0) {
          body = JSON.stringify(cleaned, null, 2);
        } else {
          return "";
        }
      } catch {
        // Not JSON, keep as is
      }
    }

    return body ? `\`\`\`${lang}\n${body}\n\`\`\`` : "";
  }

  // Thoughts content
  if (contentType === "thoughts") {
    const thoughts = content.thoughts ?? [];
    const parts: string[] = [];

    for (const thought of thoughts) {
      const summary = thought.summary ?? "";
      const detail = thought.content ?? "";
      const combined = [summary, detail].filter(Boolean).join(": ");
      if (combined) {
        parts.push(`_${combined}_`);
      }
    }

    return parts.join("\n\n");
  }

  // Reasoning recap
  if (contentType === "reasoning_recap") {
    const recap = typeof content.text === "string" ? content.text.trim() : "";
    return recap ? `_${recap}_` : "";
  }

  // Multimodal text
  if (contentType === "multimodal_text") {
    const parts = content.parts ?? [];
    const segments: string[] = [];

    for (const part of parts) {
      if (typeof part === "string") {
        segments.push(stripPrivateUse(part));
        continue;
      }

      if (typeof part === "object" && part !== null) {
        const pType =
          (part as Record<string, unknown>).content_type ??
          (part as Record<string, unknown>).type;

        if (pType === "text") {
          const texts = (part as Record<string, unknown>).text;
          if (Array.isArray(texts)) {
            segments.push(
              ...texts
                .filter((t): t is string => typeof t === "string")
                .map(stripPrivateUse),
            );
          } else if (typeof texts === "string") {
            segments.push(stripPrivateUse(texts));
          }
        }
        // Skip image_asset_pointer and file types (not downloadable server-side)
      }
    }

    return segments
      .map((s) => s.trim())
      .filter(Boolean)
      .join("\n\n");
  }

  // Tool response
  if (contentType === "tool_response") {
    const output =
      typeof (content as Record<string, unknown>).output === "string"
        ? ((content as Record<string, unknown>).output as string)
        : "";
    return stripPrivateUse(output);
  }

  // Model editable context
  if (contentType === "model_editable_context") {
    const context = (content as Record<string, unknown>).model_set_context;
    return typeof context === "string" ? context.trim() : "";
  }

  // Fallback: try to extract from parts
  if (content.parts) {
    const parts = content.parts
      .filter((p): p is string => typeof p === "string")
      .map((p) => stripPrivateUse(p));
    return parts.join("\n\n").trim();
  }

  return "";
}

// =============================================================================
// Parsing Strategies
// =============================================================================

/**
 * Extract content from streamController.enqueue() call
 *
 * Handles nested parentheses and quoted strings properly.
 */
function extractEnqueueContent(html: string, startPos: number): string | null {
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
function extractLoaderPayload(html: string): JsonValue[] | null {
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

/**
 * Parse modern share format (React Flight)
 */
function parseModernShare(html: string): RawMessage[] {
  const loader = extractLoaderPayload(html);
  if (!loader) {
    throw new Error("Modern share payload not found");
  }

  const decoded = decodeLoader(loader);
  const route = decoded.loaderData?.["routes/share.$shareId.($action)"];
  const data = route?.serverResponse?.data;

  if (!data?.mapping) {
    throw new Error("No conversation mapping found");
  }

  const sequence = data.linear_conversation ?? [];
  const messages: RawMessage[] = [];

  for (const entry of sequence) {
    const nodeId = entry.id;
    if (!nodeId) continue;

    const node = data.mapping[nodeId];
    if (!node?.message) continue;

    const message = node.message;
    const role = message.author?.role;

    // Skip system messages
    if (role === "system") continue;
    if (role !== "user" && role !== "assistant" && role !== "tool") continue;

    const content = message.content;
    if (!content) continue;

    let text = flattenMessageContent(content);
    text = stripCitationTokens(text);

    if (!text.trim()) continue;

    messages.push({
      role: role === "user" ? "user" : "assistant",
      content: text,
    });
  }

  return messages;
}

/**
 * Parse legacy share format (__NEXT_DATA__)
 */
function parseLegacyShare(html: string): RawMessage[] {
  const match = /<script id="__NEXT_DATA__"[^>]*>([^<]+)<\/script>/.exec(html);
  if (!match?.[1]) {
    throw new Error("Legacy share payload not found");
  }

  const payload = JSON.parse(match[1]) as {
    props?: {
      pageProps?: {
        serverResponse?: {
          data?: ShareData;
        };
      };
    };
  };

  const data = payload.props?.pageProps?.serverResponse?.data;
  if (!data) {
    throw new Error("No conversation data found");
  }

  const sequence = data.linear_conversation ?? [];
  const mapping = data.mapping ?? {};
  const messages: RawMessage[] = [];

  for (const entry of sequence) {
    const nodeId = entry.id;
    if (!nodeId) continue;

    const node = mapping[nodeId];
    if (!node?.message) continue;

    const message = node.message;
    const role = message.author?.role;

    if (role === "system") continue;
    if (role !== "user" && role !== "assistant" && role !== "tool") continue;

    const content = message.content;
    if (!content) continue;

    let text = flattenMessageContent(content);
    text = stripCitationTokens(text);

    if (!text.trim()) continue;

    messages.push({
      role: role === "user" ? "user" : "assistant",
      content: text,
    });
  }

  return messages;
}

/**
 * Parse share HTML using best available strategy
 */
function parseShareHtml(html: string): RawMessage[] {
  // Try modern format first
  try {
    const messages = parseModernShare(html);
    if (messages.length > 0) {
      return messages;
    }
  } catch {
    // Fall through to legacy
  }

  // Try legacy format
  try {
    const messages = parseLegacyShare(html);
    if (messages.length > 0) {
      return messages;
    }
  } catch {
    // Fall through
  }

  return [];
}

// =============================================================================
// Adapter Implementation
// =============================================================================

/**
 * ChatGPT Share Link Adapter
 *
 * Extracts conversations from ChatGPT share pages.
 */
export class ChatGPTShareLinkAdapter extends BaseShareLinkAdapter {
  readonly id = "chatgpt-share-link";
  readonly version = "2.0.0";
  readonly name = "ChatGPT Share Link Parser";
  readonly provider: Provider = "chatgpt";

  readonly urlPatterns = [
    /^https?:\/\/(chat\.openai\.com|chatgpt\.com)\/(share|s)\/[a-zA-Z0-9_-]+$/,
  ];

  /**
   * Fetch share link and extract messages
   */
  async fetchAndExtract(url: string): Promise<RawMessage[]> {
    // Normalize URL
    const normalizedUrl = url.replace("chat.openai.com", "chatgpt.com");

    try {
      const html = await fetchHtml(normalizedUrl);
      const messages = parseShareHtml(html);

      if (messages.length === 0) {
        throw createAppError(
          "E-PARSE-005",
          "ChatGPT share pages load content dynamically. No messages could be extracted. Try using the browser extension instead.",
        );
      }

      return messages;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("E-PARSE") // Our error
      ) {
        throw error;
      }

      throw createAppError(
        "E-PARSE-005",
        `Failed to parse ChatGPT share page: ${error instanceof Error ? error.message : "Unknown error"}. Try using the browser extension instead.`,
      );
    }
  }
}

/**
 * Create and export a singleton instance
 */
export const chatGPTShareLinkAdapter = new ChatGPTShareLinkAdapter();
