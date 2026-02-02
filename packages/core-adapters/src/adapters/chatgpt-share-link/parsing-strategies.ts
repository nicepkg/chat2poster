/**
 * Parsing Strategies
 *
 * Different strategies for parsing ChatGPT share link HTML content.
 */

import type { RawMessage } from "../../base";
import { flattenMessageContent } from "./content-flattener";
import { decodeLoader, extractLoaderPayload } from "./react-flight-decoder";
import { stripCitationTokens } from "./text-processor";
import type { ShareData } from "./types";

/**
 * Parse modern share format (React Flight)
 */
export function parseModernShare(html: string): RawMessage[] {
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
export function parseLegacyShare(html: string): RawMessage[] {
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
export function parseShareHtml(html: string): RawMessage[] {
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
