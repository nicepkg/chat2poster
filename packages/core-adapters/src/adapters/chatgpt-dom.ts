/**
 * ChatGPT DOM Adapter
 *
 * Parses conversations from ChatGPT's web interface DOM.
 *
 * DOM Structure (as of 2024):
 * - Conversation container: [data-testid^="conversation-turn-"]
 * - User messages: data-message-author-role="user"
 * - Assistant messages: data-message-author-role="assistant"
 * - Message content: .markdown or [data-message-content]
 *
 * Note: ChatGPT's DOM structure changes frequently.
 * Multiple selector strategies are used as fallbacks.
 */

import type { Provider } from "@chat2poster/core-schema";
import { createAppError } from "@chat2poster/core-schema";
import { BaseDOMAdapter, type RawMessage } from "../base";

/**
 * Selector strategies for ChatGPT DOM
 * Multiple strategies to handle DOM structure changes
 */
const SELECTORS = {
  // Primary selectors (most reliable as of 2024)
  conversationTurn: '[data-testid^="conversation-turn-"]',
  messageRole: "[data-message-author-role]",
  messageContent: ".markdown",

  // Fallback selectors
  fallbackTurn: ".group\\/conversation-turn",
  fallbackContent: "[data-message-content]",
  fallbackContentAlt: ".prose",

  // Legacy selectors (older DOM structure)
  legacyContainer: ".flex.flex-col.items-center",
  legacyMessage: ".min-h-\\[20px\\]",
} as const;

/**
 * ChatGPT DOM Adapter
 *
 * Extracts conversation messages from ChatGPT's web page DOM.
 */
export class ChatGPTDOMAdapter extends BaseDOMAdapter {
  readonly id = "chatgpt-dom";
  readonly version = "1.0.0";
  readonly name = "ChatGPT DOM Parser";
  readonly provider: Provider = "chatgpt";

  readonly urlPatterns = [
    /^https?:\/\/(chat\.openai\.com|chatgpt\.com)(\/.*)?$/,
  ];

  /**
   * Extract messages from ChatGPT DOM
   */
  extractMessages(document: Document): RawMessage[] {
    // Try primary strategy first
    let messages = this.extractWithPrimaryStrategy(document);

    // Fallback to alternative strategies
    if (messages.length === 0) {
      messages = this.extractWithFallbackStrategy(document);
    }

    if (messages.length === 0) {
      messages = this.extractWithLegacyStrategy(document);
    }

    if (messages.length === 0) {
      throw createAppError(
        "E-PARSE-005",
        "No messages found. ChatGPT DOM structure may have changed."
      );
    }

    return messages;
  }

  /**
   * Primary extraction strategy using data-testid selectors
   */
  private extractWithPrimaryStrategy(document: Document): RawMessage[] {
    const messages: RawMessage[] = [];

    // Find all conversation turns
    const turns = document.querySelectorAll(SELECTORS.conversationTurn);

    for (const turn of turns) {
      // Find the message role element
      const roleElement = turn.querySelector(SELECTORS.messageRole);
      if (!roleElement) continue;

      const role = roleElement.getAttribute("data-message-author-role");
      if (role !== "user" && role !== "assistant") continue;

      // Find the content element
      const contentElement =
        turn.querySelector(SELECTORS.messageContent) ||
        turn.querySelector(SELECTORS.fallbackContent);

      if (!contentElement) continue;

      const content = this.extractContent(contentElement as HTMLElement);
      if (content.trim()) {
        messages.push({ role, content });
      }
    }

    return messages;
  }

  /**
   * Fallback extraction strategy using class-based selectors
   */
  private extractWithFallbackStrategy(document: Document): RawMessage[] {
    const messages: RawMessage[] = [];

    // Try fallback turn selector
    const turns = document.querySelectorAll(SELECTORS.fallbackTurn);

    for (const turn of turns) {
      // Determine role based on DOM structure or content
      const role = this.inferRole(turn as HTMLElement);
      if (!role) continue;

      // Find content
      const contentElement =
        turn.querySelector(SELECTORS.messageContent) ||
        turn.querySelector(SELECTORS.fallbackContentAlt);

      if (!contentElement) continue;

      const content = this.extractContent(contentElement as HTMLElement);
      if (content.trim()) {
        messages.push({ role, content });
      }
    }

    return messages;
  }

  /**
   * Legacy extraction strategy for older DOM structures
   */
  private extractWithLegacyStrategy(document: Document): RawMessage[] {
    const messages: RawMessage[] = [];

    // Find main container
    const container = document.querySelector(SELECTORS.legacyContainer);
    if (!container) return messages;

    // Find all message elements
    const messageElements = container.querySelectorAll(SELECTORS.legacyMessage);

    let currentRole: "user" | "assistant" = "user";
    for (const element of messageElements) {
      const content = this.extractContent(element as HTMLElement);
      if (content.trim()) {
        messages.push({ role: currentRole, content });
        // Alternate roles
        currentRole = currentRole === "user" ? "assistant" : "user";
      }
    }

    return messages;
  }

  /**
   * Infer message role from element structure
   */
  private inferRole(element: HTMLElement): "user" | "assistant" | null {
    // Check for explicit role attribute
    const roleAttr = element.querySelector("[data-message-author-role]");
    if (roleAttr) {
      const role = roleAttr.getAttribute("data-message-author-role");
      if (role === "user" || role === "assistant") {
        return role;
      }
    }

    // Check for avatar or icon indicators
    const hasUserIcon =
      element.querySelector('[data-testid="user-avatar"]') !== null ||
      element.classList.contains("user");
    const hasAssistantIcon =
      element.querySelector('[data-testid="chatgpt-avatar"]') !== null ||
      element.querySelector("svg") !== null;

    if (hasUserIcon) return "user";
    if (hasAssistantIcon) return "assistant";

    // Check text content for hints
    const text = element.textContent || "";
    if (text.includes("You:") || text.startsWith("User:")) return "user";
    if (text.includes("ChatGPT:") || text.includes("Assistant:"))
      return "assistant";

    return null;
  }

  /**
   * Extract and clean content from an element
   */
  private extractContent(element: HTMLElement): string {
    // Clone to avoid modifying the actual DOM
    const clone = element.cloneNode(true) as HTMLElement;

    // Remove buttons and interactive elements
    const removeSelectors = [
      "button",
      '[role="button"]',
      ".copy-button",
      ".feedback-buttons",
      '[data-testid="copy-code-button"]',
    ];

    for (const selector of removeSelectors) {
      clone.querySelectorAll(selector).forEach((el) => el.remove());
    }

    // Convert to markdown-like format
    return this.htmlToMarkdown(clone);
  }

  /**
   * Convert HTML content to markdown
   */
  private htmlToMarkdown(element: HTMLElement): string {
    let result = "";

    const processNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || "";
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return "";
      }

      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      const children = Array.from(el.childNodes).map(processNode).join("");

      switch (tag) {
        // Code blocks
        case "pre": {
          const code = el.querySelector("code");
          const language = this.extractCodeLanguage(el);
          const codeContent = code?.textContent || el.textContent || "";
          return `\n\`\`\`${language}\n${codeContent.trim()}\n\`\`\`\n`;
        }

        // Inline code
        case "code": {
          // Skip if inside pre (handled by pre case)
          if (el.parentElement?.tagName.toLowerCase() === "pre") {
            return children;
          }
          return `\`${el.textContent || ""}\``;
        }

        // Bold
        case "strong":
        case "b":
          return `**${children}**`;

        // Italic
        case "em":
        case "i":
          return `*${children}*`;

        // Links
        case "a": {
          const href = el.getAttribute("href") || "";
          return `[${children}](${href})`;
        }

        // Headers
        case "h1":
          return `\n# ${children}\n`;
        case "h2":
          return `\n## ${children}\n`;
        case "h3":
          return `\n### ${children}\n`;
        case "h4":
          return `\n#### ${children}\n`;
        case "h5":
          return `\n##### ${children}\n`;
        case "h6":
          return `\n###### ${children}\n`;

        // Lists
        case "ul":
        case "ol":
          return `\n${children}\n`;

        case "li": {
          const parent = el.parentElement;
          const isOrdered = parent?.tagName.toLowerCase() === "ol";
          const prefix = isOrdered ? "1. " : "- ";
          return `${prefix}${children.trim()}\n`;
        }

        // Paragraphs and divs
        case "p":
          return `\n${children}\n`;

        case "br":
          return "\n";

        // Block quotes
        case "blockquote":
          return `\n> ${children.trim()}\n`;

        // Images
        case "img": {
          const src = el.getAttribute("src") || "";
          const alt = el.getAttribute("alt") || "image";
          return `![${alt}](${src})`;
        }

        // Tables
        case "table":
          return `\n${children}\n`;
        case "tr":
          return `|${children}\n`;
        case "th":
        case "td":
          return ` ${children.trim()} |`;
        case "thead":
        case "tbody":
          return children;

        default:
          return children;
      }
    };

    result = processNode(element);

    // Clean up extra whitespace
    return result
      .replace(/\n{3,}/g, "\n\n")
      .replace(/^\n+/, "")
      .replace(/\n+$/, "")
      .trim();
  }

  /**
   * Extract code language from code block
   */
  private extractCodeLanguage(preElement: HTMLElement): string {
    // Check for language class on code element
    const code = preElement.querySelector("code");
    if (code) {
      const classList = Array.from(code.classList);
      const langClass = classList.find(
        (c) => c.startsWith("language-") || c.startsWith("hljs-")
      );
      if (langClass) {
        return langClass.replace(/^(language-|hljs-)/, "");
      }
    }

    // Check for language label in header
    const header = preElement.querySelector(
      ".bg-gray-700, .code-header, [class*='header']"
    );
    if (header) {
      const text = header.textContent?.trim().toLowerCase() || "";
      if (text && !text.includes("copy")) {
        return text;
      }
    }

    return "";
  }
}

/**
 * Create and export a singleton instance
 */
export const chatGPTDOMAdapter = new ChatGPTDOMAdapter();
