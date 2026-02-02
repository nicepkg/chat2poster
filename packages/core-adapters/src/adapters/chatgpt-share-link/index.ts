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
import { BaseShareLinkAdapter, type RawMessage } from "../../base";
import { fetchHtml } from "../../network";
import { parseShareHtml } from "./parsing-strategies";

// Re-export types for external use
export type {
  JsonValue,
  MessageAuthor,
  MessageContent,
  MessageNode,
  ShareData,
  ServerResponse,
  LoaderData,
  DecodedLoader,
} from "./types";

// Re-export utilities for testing
export { stripPrivateUse, stripCitationTokens } from "./text-processor";
export {
  decodeLoader,
  extractEnqueueContent,
  extractLoaderPayload,
} from "./react-flight-decoder";
export { flattenMessageContent } from "./content-flattener";
export {
  parseModernShare,
  parseLegacyShare,
  parseShareHtml,
} from "./parsing-strategies";

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
