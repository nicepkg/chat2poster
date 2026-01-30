/**
 * ChatGPT Share Link Adapter
 *
 * Parses conversations from ChatGPT share link pages.
 *
 * Share Link URL Format:
 * - https://chatgpt.com/s/t_{id}
 * - https://chatgpt.com/share/{id}
 * - https://chat.openai.com/share/{id}
 *
 * Note: ChatGPT share pages use React Server Components with streaming.
 * The conversation data is loaded dynamically via JavaScript, not embedded
 * in the initial HTML. This adapter attempts multiple extraction strategies:
 *
 * 1. Look for __NEXT_DATA__ script (older versions)
 * 2. Look for React Server Component streaming chunks
 * 3. Parse DOM structure if JavaScript has rendered
 * 4. Try backend API (requires CORS proxy in browser)
 */

import type { Provider } from "@chat2poster/core-schema";
import { createAppError } from "@chat2poster/core-schema";
import { BaseShareLinkAdapter, type RawMessage } from "../base";

/**
 * ChatGPT conversation structure from share page
 */
interface ChatGPTShareData {
  title?: string;
  create_time?: number;
  update_time?: number;
  mapping?: Record<
    string,
    {
      id: string;
      message?: {
        id: string;
        author: {
          role: "user" | "assistant" | "system" | "tool";
          name?: string;
        };
        content: {
          content_type: string;
          parts?: string[];
          text?: string;
        };
        create_time?: number;
      };
      parent?: string;
      children?: string[];
    }
  >;
  linear_conversation?: Array<{
    id: string;
    message?: {
      author: { role: string };
      content: {
        content_type?: string;
        parts?: string[];
        text?: string;
      };
    };
  }>;
}

/**
 * ChatGPT Share Link Adapter
 *
 * Extracts conversation from ChatGPT share page.
 */
export class ChatGPTShareLinkAdapter extends BaseShareLinkAdapter {
  readonly id = "chatgpt-share-link";
  readonly version = "1.0.0";
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
    const normalizedUrl = this.normalizeUrl(url);

    // Try multiple extraction strategies
    const strategies = [
      () => this.extractFromHtml(normalizedUrl),
      () => this.extractFromApi(normalizedUrl),
    ];

    let lastError: Error | null = null;

    for (const strategy of strategies) {
      try {
        const messages = await strategy();
        if (messages.length > 0) {
          return messages;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        // Continue to next strategy
      }
    }

    throw createAppError(
      "E-PARSE-003",
      `Failed to extract messages from ChatGPT share link. ${lastError?.message || "No messages found."}`
    );
  }

  /**
   * Normalize share link URL
   */
  private normalizeUrl(url: string): string {
    // Convert old chat.openai.com URLs to chatgpt.com
    return url.replace("chat.openai.com", "chatgpt.com");
  }

  /**
   * Extract conversation ID from URL
   */
  private extractConversationId(url: string): string {
    const match = url.match(/\/(share|s)\/([a-zA-Z0-9_-]+)/);
    return match?.[2] || "";
  }

  /**
   * Extract messages from HTML response
   */
  private async extractFromHtml(url: string): Promise<RawMessage[]> {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Strategy 1: Look for __NEXT_DATA__ script
    const nextDataMatch = html.match(
      /<script id="__NEXT_DATA__"[^>]*>([^<]+)<\/script>/
    );
    if (nextDataMatch?.[1]) {
      try {
        const data = JSON.parse(nextDataMatch[1]);
        const shareData = data?.props?.pageProps?.serverResponse?.data;
        if (shareData) {
          return this.parseShareData(shareData);
        }
      } catch {
        // Continue to other strategies
      }
    }

    // Strategy 2: Look for React streaming data
    const streamChunks = html.match(
      /window\.__reactRouterContext\.streamController\.enqueue\("([^"]+)"\)/g
    );
    if (streamChunks && streamChunks.length > 0) {
      // React RSC streaming - data may be encoded in chunks
      // This requires more complex parsing of RSC protocol
      // For now, we'll fall back to other strategies
    }

    // Strategy 3: Parse embedded JSON in script tags
    const jsonScripts = html.match(
      /<script[^>]*type="application\/json"[^>]*>([^<]+)<\/script>/g
    );
    if (jsonScripts) {
      for (const script of jsonScripts) {
        const jsonMatch = script.match(/>([^<]+)</);
        if (jsonMatch?.[1]) {
          try {
            const data = JSON.parse(jsonMatch[1]);
            if (data.mapping || data.linear_conversation) {
              return this.parseShareData(data);
            }
          } catch {
            // Continue
          }
        }
      }
    }

    // Strategy 4: Look for data in global variables
    const globalDataPatterns = [
      /window\.__SHARE_DATA__\s*=\s*({[^;]+});/,
      /window\.shareData\s*=\s*({[^;]+});/,
      /"serverResponse"\s*:\s*({[^}]+})/,
    ];

    for (const pattern of globalDataPatterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        try {
          const data = JSON.parse(match[1]);
          const shareData = data.data || data;
          if (shareData.mapping || shareData.linear_conversation) {
            return this.parseShareData(shareData);
          }
        } catch {
          // Continue
        }
      }
    }

    return [];
  }

  /**
   * Try to extract from ChatGPT API directly
   * Note: This may fail due to CORS restrictions in browser environments
   */
  private async extractFromApi(url: string): Promise<RawMessage[]> {
    const conversationId = this.extractConversationId(url);
    if (!conversationId) {
      throw new Error("Could not extract conversation ID from URL");
    }

    // Try the share API endpoint
    const apiUrl = `https://chatgpt.com/backend-api/share/${conversationId}`;

    try {
      const response = await fetch(apiUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      if (data && (data.mapping || data.linear_conversation)) {
        return this.parseShareData(data);
      }
    } catch (error) {
      // API access may be restricted
      throw new Error(
        `API access failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    return [];
  }

  /**
   * Parse ChatGPT share data into RawMessages
   */
  private parseShareData(data: ChatGPTShareData): RawMessage[] {
    const messages: RawMessage[] = [];

    // If linear_conversation is available, use it (simpler structure)
    if (data.linear_conversation) {
      for (const item of data.linear_conversation) {
        if (!item.message) continue;

        const role = item.message.author?.role;
        if (role !== "user" && role !== "assistant") continue;

        const content = this.extractMessageContent(item.message.content);
        if (content.trim()) {
          messages.push({
            role: role as "user" | "assistant",
            content,
          });
        }
      }
      return messages;
    }

    // Otherwise, traverse the mapping tree
    if (data.mapping) {
      // Build the message order from parent-child relationships
      const orderedMessages = this.buildMessageOrder(data.mapping);

      for (const node of orderedMessages) {
        if (!node.message) continue;

        const role = node.message.author?.role;
        if (role !== "user" && role !== "assistant") continue;

        const content = this.extractMessageContent(node.message.content);
        if (content.trim()) {
          messages.push({
            role: role as "user" | "assistant",
            content,
          });
        }
      }
    }

    return messages;
  }

  /**
   * Build ordered message list from mapping tree
   */
  private buildMessageOrder(
    mapping: NonNullable<ChatGPTShareData["mapping"]>
  ): Array<(typeof mapping)[string]> {
    const ordered: Array<(typeof mapping)[string]> = [];

    // Find root (node with no parent or parent not in mapping)
    let rootId: string | null = null;
    for (const [id, node] of Object.entries(mapping)) {
      if (!node.parent || !mapping[node.parent]) {
        rootId = id;
        break;
      }
    }

    if (!rootId) return ordered;

    // BFS traversal
    const queue: string[] = [rootId];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const node = mapping[currentId];
      if (node) {
        ordered.push(node);
        if (node.children) {
          queue.push(...node.children);
        }
      }
    }

    return ordered;
  }

  /**
   * Extract text content from message content object
   */
  private extractMessageContent(content: {
    content_type?: string;
    parts?: string[];
    text?: string;
  }): string {
    if (content.parts && content.parts.length > 0) {
      return content.parts
        .filter((part) => typeof part === "string")
        .join("\n");
    }
    if (content.text) {
      return content.text;
    }
    return "";
  }
}

/**
 * Create and export a singleton instance
 */
export const chatGPTShareLinkAdapter = new ChatGPTShareLinkAdapter();
