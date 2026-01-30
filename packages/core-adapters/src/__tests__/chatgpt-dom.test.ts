/**
 * ChatGPT DOM Adapter Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { JSDOM } from "jsdom";
import { ChatGPTDOMAdapter } from "../adapters/chatgpt-dom";
import type { DOMInput } from "@chat2poster/core-schema";

// Helper to create a DOM from HTML
function createDOM(html: string): Document {
  const dom = new JSDOM(html, { url: "https://chat.openai.com/c/test" });
  return dom.window.document;
}

describe("ChatGPTDOMAdapter", () => {
  let adapter: ChatGPTDOMAdapter;

  beforeEach(() => {
    adapter = new ChatGPTDOMAdapter();
  });

  describe("canHandle", () => {
    it("should handle chat.openai.com URLs", () => {
      const input: DOMInput = {
        type: "dom",
        document: createDOM("<html></html>"),
        url: "https://chat.openai.com/c/12345",
      };
      expect(adapter.canHandle(input)).toBe(true);
    });

    it("should handle chatgpt.com URLs", () => {
      const input: DOMInput = {
        type: "dom",
        document: createDOM("<html></html>"),
        url: "https://chatgpt.com/c/12345",
      };
      expect(adapter.canHandle(input)).toBe(true);
    });

    it("should not handle non-ChatGPT URLs", () => {
      const input: DOMInput = {
        type: "dom",
        document: createDOM("<html></html>"),
        url: "https://claude.ai/chat/123",
      };
      expect(adapter.canHandle(input)).toBe(false);
    });

    it("should not handle non-DOM input types", () => {
      const input = {
        type: "share-link" as const,
        url: "https://chat.openai.com/share/123",
      };
      expect(adapter.canHandle(input)).toBe(false);
    });
  });

  describe("parse - Primary Strategy", () => {
    it("should extract messages from modern ChatGPT DOM", async () => {
      const html = `
        <html>
          <body>
            <div data-testid="conversation-turn-2">
              <div data-message-author-role="user">
                <div class="markdown">Hello, how are you?</div>
              </div>
            </div>
            <div data-testid="conversation-turn-3">
              <div data-message-author-role="assistant">
                <div class="markdown">I'm doing great, thank you!</div>
              </div>
            </div>
          </body>
        </html>
      `;

      const input: DOMInput = {
        type: "dom",
        document: createDOM(html),
        url: "https://chat.openai.com/c/test",
      };

      const conversation = await adapter.parse(input);

      expect(conversation.messages).toHaveLength(2);

      const msg0 = conversation.messages[0];
      const msg1 = conversation.messages[1];

      expect(msg0).toBeDefined();
      expect(msg1).toBeDefined();
      expect(msg0!.role).toBe("user");
      expect(msg0!.contentMarkdown).toBe("Hello, how are you?");
      expect(msg1!.role).toBe("assistant");
      expect(msg1!.contentMarkdown).toBe("I'm doing great, thank you!");
    });

    it("should handle code blocks", async () => {
      const html = `
        <html>
          <body>
            <div data-testid="conversation-turn-2">
              <div data-message-author-role="assistant">
                <div class="markdown">
                  Here's some code:
                  <pre><code class="language-javascript">console.log('hello');</code></pre>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const input: DOMInput = {
        type: "dom",
        document: createDOM(html),
        url: "https://chat.openai.com/c/test",
      };

      const conversation = await adapter.parse(input);

      expect(conversation.messages).toHaveLength(1);

      const msg = conversation.messages[0];
      expect(msg).toBeDefined();
      expect(msg!.contentMarkdown).toContain("```javascript");
      expect(msg!.contentMarkdown).toContain("console.log('hello');");
      expect(msg!.contentMeta?.containsCodeBlock).toBe(true);
    });

    it("should handle bold and italic text", async () => {
      const html = `
        <html>
          <body>
            <div data-testid="conversation-turn-2">
              <div data-message-author-role="assistant">
                <div class="markdown">
                  <p>This is <strong>bold</strong> and <em>italic</em> text.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const input: DOMInput = {
        type: "dom",
        document: createDOM(html),
        url: "https://chat.openai.com/c/test",
      };

      const conversation = await adapter.parse(input);

      const msg = conversation.messages[0];
      expect(msg).toBeDefined();
      expect(msg!.contentMarkdown).toContain("**bold**");
      expect(msg!.contentMarkdown).toContain("*italic*");
    });

    it("should handle lists", async () => {
      const html = `
        <html>
          <body>
            <div data-testid="conversation-turn-2">
              <div data-message-author-role="assistant">
                <div class="markdown">
                  <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                  </ul>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const input: DOMInput = {
        type: "dom",
        document: createDOM(html),
        url: "https://chat.openai.com/c/test",
      };

      const conversation = await adapter.parse(input);

      const msg = conversation.messages[0];
      expect(msg).toBeDefined();
      expect(msg!.contentMarkdown).toContain("- Item 1");
      expect(msg!.contentMarkdown).toContain("- Item 2");
    });

    it("should handle links", async () => {
      const html = `
        <html>
          <body>
            <div data-testid="conversation-turn-2">
              <div data-message-author-role="assistant">
                <div class="markdown">
                  <p>Check out <a href="https://example.com">this link</a>.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const input: DOMInput = {
        type: "dom",
        document: createDOM(html),
        url: "https://chat.openai.com/c/test",
      };

      const conversation = await adapter.parse(input);

      const msg = conversation.messages[0];
      expect(msg).toBeDefined();
      expect(msg!.contentMarkdown).toContain("[this link](https://example.com)");
    });

    it("should handle headers", async () => {
      const html = `
        <html>
          <body>
            <div data-testid="conversation-turn-2">
              <div data-message-author-role="assistant">
                <div class="markdown">
                  <h1>Main Title</h1>
                  <h2>Subtitle</h2>
                  <p>Content here.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const input: DOMInput = {
        type: "dom",
        document: createDOM(html),
        url: "https://chat.openai.com/c/test",
      };

      const conversation = await adapter.parse(input);

      const msg = conversation.messages[0];
      expect(msg).toBeDefined();
      expect(msg!.contentMarkdown).toContain("# Main Title");
      expect(msg!.contentMarkdown).toContain("## Subtitle");
    });
  });

  describe("parse - Error Cases", () => {
    it("should throw E-PARSE-005 when no messages found", async () => {
      const html = `<html><body><div>Empty page</div></body></html>`;

      const input: DOMInput = {
        type: "dom",
        document: createDOM(html),
        url: "https://chat.openai.com/c/test",
      };

      await expect(adapter.parse(input)).rejects.toMatchObject({
        code: "E-PARSE-005",
      });
    });

    it("should throw error for non-DOM input", async () => {
      const input = {
        type: "share-link" as const,
        url: "https://chat.openai.com/share/123",
      };

      await expect(adapter.parse(input)).rejects.toThrow("only handles DOM");
    });
  });

  describe("parse - Metadata", () => {
    it("should set correct source metadata", async () => {
      const html = `
        <html>
          <body>
            <div data-testid="conversation-turn-2">
              <div data-message-author-role="user">
                <div class="markdown">Test</div>
              </div>
            </div>
          </body>
        </html>
      `;

      const input: DOMInput = {
        type: "dom",
        document: createDOM(html),
        url: "https://chat.openai.com/c/test",
      };

      const conversation = await adapter.parse(input);

      expect(conversation.sourceType).toBe("extension-current");
      expect(conversation.sourceMeta?.provider).toBe("chatgpt");
      expect(conversation.sourceMeta?.adapterId).toBe("chatgpt-dom");
      expect(conversation.sourceMeta?.adapterVersion).toBe("1.0.0");
      expect(conversation.sourceMeta?.parsedAt).toBeDefined();
    });

    it("should set message order correctly", async () => {
      const html = `
        <html>
          <body>
            <div data-testid="conversation-turn-2">
              <div data-message-author-role="user">
                <div class="markdown">First</div>
              </div>
            </div>
            <div data-testid="conversation-turn-3">
              <div data-message-author-role="assistant">
                <div class="markdown">Second</div>
              </div>
            </div>
            <div data-testid="conversation-turn-4">
              <div data-message-author-role="user">
                <div class="markdown">Third</div>
              </div>
            </div>
          </body>
        </html>
      `;

      const input: DOMInput = {
        type: "dom",
        document: createDOM(html),
        url: "https://chat.openai.com/c/test",
      };

      const conversation = await adapter.parse(input);

      const msg0 = conversation.messages[0];
      const msg1 = conversation.messages[1];
      const msg2 = conversation.messages[2];

      expect(msg0).toBeDefined();
      expect(msg1).toBeDefined();
      expect(msg2).toBeDefined();
      expect(msg0!.order).toBe(0);
      expect(msg1!.order).toBe(1);
      expect(msg2!.order).toBe(2);
    });

    it("should detect code blocks in contentMeta", async () => {
      const html = `
        <html>
          <body>
            <div data-testid="conversation-turn-2">
              <div data-message-author-role="assistant">
                <div class="markdown">
                  <pre><code>code here</code></pre>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const input: DOMInput = {
        type: "dom",
        document: createDOM(html),
        url: "https://chat.openai.com/c/test",
      };

      const conversation = await adapter.parse(input);

      const msg = conversation.messages[0];
      expect(msg).toBeDefined();
      expect(msg!.contentMeta?.containsCodeBlock).toBe(true);
    });
  });
});
