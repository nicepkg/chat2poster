/**
 * Gemini Share Link Adapter
 *
 * Parses conversations from Google Gemini share link pages.
 *
 * Share Link URL Format:
 * - https://gemini.google.com/share/{id}
 * - https://g.co/gemini/share/{id}
 *
 * Note: Gemini share pages are Google web apps that use complex
 * data loading patterns (WIZ framework). The conversation data
 * is typically loaded via JavaScript and may not be in the initial HTML.
 *
 * This adapter attempts to extract data from:
 * 1. WIZ_global_data object in script tags
 * 2. AF_initDataCallback calls
 * 3. Embedded proto-style data structures
 * 4. DOM parsing if content is rendered
 */

import type { Provider } from "@chat2poster/core-schema";
import { createAppError } from "@chat2poster/core-schema";
import { BaseShareLinkAdapter, type RawMessage } from "../base";

/**
 * Gemini conversation structure (varies by version)
 * Used in parseGeminiApiResponse for typed parsing
 */
interface GeminiApiResponse {
  turns?: Array<{
    role?: string;
    content?: string;
  }>;
  messages?: Array<{
    author?: string;
    text?: string;
  }>;
}

/**
 * Gemini Share Link Adapter
 *
 * Extracts conversation from Gemini share page.
 */
export class GeminiShareLinkAdapter extends BaseShareLinkAdapter {
  readonly id = "gemini-share-link";
  readonly version = "1.0.0";
  readonly name = "Gemini Share Link Parser";
  readonly provider: Provider = "gemini";

  readonly urlPatterns = [
    /^https?:\/\/gemini\.google\.com\/share\/[a-zA-Z0-9]+$/,
    /^https?:\/\/g\.co\/gemini\/share\/[a-zA-Z0-9]+$/,
  ];

  /**
   * Fetch share link and extract messages
   */
  async fetchAndExtract(url: string): Promise<RawMessage[]> {
    // Normalize short URLs
    const normalizedUrl = await this.normalizeUrl(url);

    // Try multiple extraction strategies
    const strategies = [
      () => this.extractFromHtml(normalizedUrl),
      () => this.extractFromWizData(normalizedUrl),
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
      `Failed to extract messages from Gemini share link. Gemini uses dynamic loading that requires browser execution. ${lastError?.message || ""}`
    );
  }

  /**
   * Normalize URL (handle redirects from short URLs)
   */
  private async normalizeUrl(url: string): Promise<string> {
    // g.co URLs redirect to gemini.google.com
    if (url.includes("g.co")) {
      try {
        const response = await fetch(url, {
          method: "HEAD",
          redirect: "follow",
        });
        return response.url;
      } catch {
        // Return original if redirect fails
        return url.replace("g.co/gemini", "gemini.google.com");
      }
    }
    return url;
  }

  /**
   * Extract share ID from URL
   */
  private extractShareId(url: string): string {
    const match = url.match(/\/share\/([a-zA-Z0-9]+)/);
    return match?.[1] || "";
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

    // Strategy 1: Look for AF_initDataCallback with conversation data
    const initCallbacks = html.match(/AF_initDataCallback\([^)]+\)/g);
    if (initCallbacks) {
      for (const callback of initCallbacks) {
        const dataMatch = callback.match(
          /data:\s*(\[[\s\S]*?\])(?:\s*,\s*sideChannel)?/
        );
        if (dataMatch?.[1]) {
          try {
            const data = JSON.parse(dataMatch[1]);
            const messages = this.parseAfInitData(data);
            if (messages.length > 0) {
              return messages;
            }
          } catch {
            // Continue to next callback
          }
        }
      }
    }

    // Strategy 2: Look for WIZ_global_data
    const wizMatch = html.match(/WIZ_global_data\s*=\s*\{[^}]+\}/);
    if (wizMatch) {
      // WIZ_global_data typically contains metadata, not conversation content
      // But it might have references to where data is loaded from
    }

    // Strategy 3: Parse inline script data
    // Gemini may embed data in proto-format in script tags
    const scriptDataPatterns: RegExp[] = [
      /window\['[\w_]+'\]\s*=\s*(\[[\s\S]*?\]);/g,
      /var\s+[\w_]+\s*=\s*(\[[\s\S]*?\]);/g,
    ];

    for (const pattern of scriptDataPatterns) {
      const matches = [...html.matchAll(pattern)];
      for (const match of matches) {
        if (!match[1]) continue;
        try {
          const data = JSON.parse(match[1]);
          if (Array.isArray(data) && data.length > 0) {
            const messages = this.parseGeminiArrayData(data);
            if (messages.length > 0) {
              return messages;
            }
          }
        } catch {
          // Continue
        }
      }
    }

    // Strategy 4: Look for rendered conversation in DOM
    const messagePatterns: RegExp[] = [
      // User turns
      /<div[^>]*class="[^"]*query-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      // Model turns
      /<div[^>]*class="[^"]*response-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      // Alternative class names
      /<div[^>]*class="[^"]*user-message[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class="[^"]*model-response[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    ];

    const userMessages: string[] = [];
    const modelMessages: string[] = [];

    for (let i = 0; i < messagePatterns.length; i++) {
      const pattern = messagePatterns[i];
      if (!pattern) continue;
      const matches = [...html.matchAll(pattern)];
      const isUserPattern = i % 2 === 0;
      for (const match of matches) {
        const contentText = match[1] ?? "";
        const content = this.stripHtml(contentText);
        if (content.trim()) {
          if (isUserPattern) {
            userMessages.push(content);
          } else {
            modelMessages.push(content);
          }
        }
      }
    }

    // Interleave user and model messages
    if (userMessages.length > 0 || modelMessages.length > 0) {
      const messages: RawMessage[] = [];
      const maxLen = Math.max(userMessages.length, modelMessages.length);
      for (let i = 0; i < maxLen; i++) {
        const userMsg = userMessages[i];
        const modelMsg = modelMessages[i];
        if (i < userMessages.length && userMsg) {
          messages.push({ role: "user", content: userMsg });
        }
        if (i < modelMessages.length && modelMsg) {
          messages.push({ role: "assistant", content: modelMsg });
        }
      }
      return messages;
    }

    return [];
  }

  /**
   * Try to extract from WIZ framework data
   */
  private async extractFromWizData(url: string): Promise<RawMessage[]> {
    // WIZ framework loads data via specific endpoints
    // This would require understanding the exact data loading pattern
    // which changes frequently

    const shareId = this.extractShareId(url);
    if (!shareId) {
      throw new Error("Could not extract share ID from URL");
    }

    // Gemini may have an API endpoint for share data
    // This is speculative and may not work
    const possibleEndpoints = [
      `https://gemini.google.com/app/share/${shareId}`,
      `https://gemini.google.com/u/0/api/share/${shareId}`,
    ];

    for (const endpoint of possibleEndpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: {
            Accept: "application/json",
          },
        });

        if (response.ok) {
          const text = await response.text();
          // Gemini API responses often have a security prefix
          const jsonText = text.replace(/^\)\]\}'\n/, "");
          try {
            const data = JSON.parse(jsonText);
            const messages = this.parseGeminiApiResponse(data);
            if (messages.length > 0) {
              return messages;
            }
          } catch {
            // Not valid JSON, continue
          }
        }
      } catch {
        // Endpoint not accessible
        continue;
      }
    }

    return [];
  }

  /**
   * Parse AF_initDataCallback data format
   */
  private parseAfInitData(data: unknown[]): RawMessage[] {
    const messages: RawMessage[] = [];

    // AF_initDataCallback data is usually a nested array structure
    // The exact structure varies, so we need to search for message-like content
    const searchForMessages = (arr: unknown[], depth = 0): void => {
      if (depth > 10) return; // Prevent infinite recursion

      for (const item of arr) {
        if (Array.isArray(item)) {
          // Look for turn structure: [type, [content, ...], ...]
          if (
            item.length >= 2 &&
            typeof item[0] === "string" &&
            Array.isArray(item[1])
          ) {
            const type = item[0];
            const content = item[1];

            // Check if this looks like a user prompt
            if (
              (type.includes("user") || type.includes("prompt")) &&
              typeof content[0] === "string"
            ) {
              messages.push({ role: "user", content: content[0] });
            }
            // Check if this looks like a model response
            else if (
              (type.includes("model") || type.includes("response")) &&
              typeof content[0] === "string"
            ) {
              messages.push({ role: "assistant", content: content[0] });
            }
          }
          // Recurse into nested arrays
          searchForMessages(item, depth + 1);
        }
      }
    };

    searchForMessages(data);
    return messages;
  }

  /**
   * Parse Gemini array-based data structure
   */
  private parseGeminiArrayData(data: unknown[]): RawMessage[] {
    const messages: RawMessage[] = [];

    // Gemini data often has a specific nested structure
    // This attempts to find content that looks like a conversation
    const extractText = (item: unknown): string | null => {
      if (typeof item === "string") {
        return item;
      }
      if (Array.isArray(item)) {
        for (const subItem of item) {
          const text = extractText(subItem);
          if (text && text.length > 10) {
            return text;
          }
        }
      }
      return null;
    };

    // Look for alternating user/model turns in the data
    let lastRole: "user" | "assistant" | null = null;

    const processItem = (item: unknown): void => {
      if (Array.isArray(item) && item.length > 0) {
        const text = extractText(item);
        if (text && text.length > 20) {
          // Simple heuristic: alternate between user and assistant
          const role = lastRole === "user" ? "assistant" : "user";
          messages.push({ role, content: text });
          lastRole = role;
        }
        // Continue processing nested items
        for (const subItem of item) {
          if (Array.isArray(subItem)) {
            processItem(subItem);
          }
        }
      }
    };

    processItem(data);
    return messages;
  }

  /**
   * Parse Gemini API response
   */
  private parseGeminiApiResponse(data: unknown): RawMessage[] {
    const messages: RawMessage[] = [];

    // Handle various response formats
    if (Array.isArray(data)) {
      // Array format (proto-style)
      return this.parseGeminiArrayData(data);
    }

    if (typeof data === "object" && data !== null) {
      const obj = data as GeminiApiResponse;

      // Object format with turns
      if (obj.turns && Array.isArray(obj.turns)) {
        for (const turn of obj.turns) {
          if (turn.role && turn.content) {
            messages.push({
              role: turn.role === "user" ? "user" : "assistant",
              content: turn.content,
            });
          }
        }
      }

      // Object format with messages
      if (obj.messages && Array.isArray(obj.messages)) {
        for (const msg of obj.messages) {
          if (msg.text) {
            messages.push({
              role: msg.author === "0" ? "user" : "assistant",
              content: msg.text,
            });
          }
        }
      }
    }

    return messages;
  }

  /**
   * Strip HTML tags and decode entities
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  }
}

/**
 * Create and export a singleton instance
 */
export const geminiShareLinkAdapter = new GeminiShareLinkAdapter();
