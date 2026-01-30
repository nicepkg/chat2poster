/**
 * Claude Share Link Adapter
 *
 * Parses conversations from Claude share link pages.
 *
 * Share Link URL Format:
 * - https://claude.ai/share/{uuid}
 *
 * Note: Claude share pages are protected by Cloudflare and require
 * JavaScript execution to access. The conversation data is loaded
 * dynamically and may require authentication context.
 *
 * This adapter attempts to extract data from:
 * 1. Server-side rendered HTML (if available)
 * 2. Embedded JSON data in script tags
 * 3. API endpoints (may require authentication)
 */

import type { Provider } from "@chat2poster/core-schema";
import { createAppError } from "@chat2poster/core-schema";
import { BaseShareLinkAdapter, type RawMessage } from "../base";

/**
 * Claude conversation structure
 */
interface ClaudeShareData {
  uuid?: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
  chat_messages?: Array<{
    uuid: string;
    sender: "human" | "assistant";
    text: string;
    created_at?: string;
    updated_at?: string;
    attachments?: unknown[];
  }>;
  // Alternative structure
  messages?: Array<{
    id: string;
    role: "user" | "assistant";
    content: string | { type: string; text?: string }[];
  }>;
}

/**
 * Claude Share Link Adapter
 *
 * Extracts conversation from Claude share page.
 */
export class ClaudeShareLinkAdapter extends BaseShareLinkAdapter {
  readonly id = "claude-share-link";
  readonly version = "1.0.0";
  readonly name = "Claude Share Link Parser";
  readonly provider: Provider = "claude";

  readonly urlPatterns = [
    /^https?:\/\/claude\.ai\/share\/[a-f0-9-]+$/i,
  ];

  /**
   * Fetch share link and extract messages
   */
  async fetchAndExtract(url: string): Promise<RawMessage[]> {
    const shareId = this.extractShareId(url);

    // Try multiple extraction strategies
    const strategies = [
      () => this.extractFromHtml(url),
      () => this.extractFromApi(shareId),
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
      `Failed to extract messages from Claude share link. Claude share pages require browser authentication. ${lastError?.message || ""}`
    );
  }

  /**
   * Extract share ID from URL
   */
  private extractShareId(url: string): string {
    const match = url.match(/\/share\/([a-f0-9-]+)/i);
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
      // Claude often returns 403 due to Cloudflare protection
      if (response.status === 403) {
        throw new Error(
          "Cloudflare protection detected. Browser-based extraction required."
        );
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Check for Cloudflare challenge
    if (
      html.includes("Just a moment...") ||
      html.includes("cf-challenge-running")
    ) {
      throw new Error(
        "Cloudflare challenge detected. Browser-based extraction required."
      );
    }

    // Strategy 1: Look for __NEXT_DATA__ or similar hydration script
    const nextDataMatch = html.match(
      /<script id="__NEXT_DATA__"[^>]*>([^<]+)<\/script>/
    );
    if (nextDataMatch?.[1]) {
      try {
        const data = JSON.parse(nextDataMatch[1]);
        const shareData = data?.props?.pageProps?.sharedConversation;
        if (shareData) {
          return this.parseShareData(shareData);
        }
      } catch {
        // Continue to other strategies
      }
    }

    // Strategy 2: Look for embedded conversation data
    const dataPatterns = [
      /<script[^>]*>window\.__CLAUDE_DATA__\s*=\s*({[\s\S]*?})\s*<\/script>/,
      /<script[^>]*>window\.sharedConversation\s*=\s*({[\s\S]*?})\s*;?\s*<\/script>/,
      /data-conversation="([^"]+)"/,
      /data-messages="([^"]+)"/,
    ];

    for (const pattern of dataPatterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        try {
          // Handle HTML-encoded JSON
          let jsonStr: string = match[1];
          if (jsonStr.includes("&quot;")) {
            jsonStr = jsonStr
              .replace(/&quot;/g, '"')
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&#39;/g, "'");
          }
          const data = JSON.parse(jsonStr);
          return this.parseShareData(data);
        } catch {
          // Continue
        }
      }
    }

    // Strategy 3: Parse DOM structure if available
    // Look for message containers in the HTML
    const messagePatterns = [
      /<div[^>]*class="[^"]*human[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*data-role="(human|assistant)"[^>]*>([\s\S]*?)<\/div>/gi,
    ];

    for (const pattern of messagePatterns) {
      const matches = [...html.matchAll(pattern)];
      if (matches.length > 0) {
        const messages: RawMessage[] = [];
        for (const match of matches) {
          const roleText = match[1] ?? "";
          const role = roleText.toLowerCase() === "human" ? "user" : "assistant";
          const contentText = match[2] ?? match[1] ?? "";
          const content = this.stripHtml(contentText);
          if (content.trim()) {
            messages.push({ role, content });
          }
        }
        if (messages.length > 0) {
          return messages;
        }
      }
    }

    return [];
  }

  /**
   * Try to extract from Claude API directly
   * Note: This typically requires authentication
   */
  private async extractFromApi(shareId: string): Promise<RawMessage[]> {
    if (!shareId) {
      throw new Error("Could not extract share ID from URL");
    }

    // Try the share API endpoint
    const apiUrl = `https://claude.ai/api/share/${shareId}`;

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
      if (data) {
        return this.parseShareData(data);
      }
    } catch (error) {
      throw new Error(
        `API access failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    return [];
  }

  /**
   * Parse Claude share data into RawMessages
   */
  private parseShareData(data: ClaudeShareData): RawMessage[] {
    const messages: RawMessage[] = [];

    // Format 1: chat_messages array
    if (data.chat_messages && Array.isArray(data.chat_messages)) {
      for (const msg of data.chat_messages) {
        const role = msg.sender === "human" ? "user" : "assistant";
        if (msg.text?.trim()) {
          messages.push({
            role,
            content: msg.text,
          });
        }
      }
      return messages;
    }

    // Format 2: messages array
    if (data.messages && Array.isArray(data.messages)) {
      for (const msg of data.messages) {
        const role = msg.role === "user" ? "user" : "assistant";
        let content = "";

        if (typeof msg.content === "string") {
          content = msg.content;
        } else if (Array.isArray(msg.content)) {
          content = msg.content
            .filter((c) => c.type === "text" && c.text)
            .map((c) => c.text)
            .join("\n");
        }

        if (content.trim()) {
          messages.push({ role, content });
        }
      }
      return messages;
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
export const claudeShareLinkAdapter = new ClaudeShareLinkAdapter();
