/**
 * ChatGPT Share Link Parser Tests
 *
 * Tests for parsing ChatGPT share link HTML content.
 * Uses real HTML fixtures to verify the parser works correctly.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect, beforeAll } from "vitest";
import {
  parseShareHtml,
  flattenMessageContent,
  ContentType,
  disableDebugLogging,
} from "../adapters/chatgpt/share-link-adapter";

// Load fixtures
const FIXTURES_DIR = join(__dirname, "__fixtures__");

function loadFixture(name: string): string {
  return readFileSync(join(FIXTURES_DIR, name), "utf-8");
}

describe("ChatGPT Share Link Parser", () => {
  // Enable debug logging for tests if needed
  beforeAll(() => {
    // Uncomment to see debug logs during test development
    // enableDebugLogging();
  });

  describe("parseShareHtml", () => {
    it("should parse modern share format HTML", async () => {
      const html = loadFixture("chatgpt-share-modern.html");
      const messages = await parseShareHtml(html);

      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0]).toHaveProperty("role");
      expect(messages[0]).toHaveProperty("content");
    });

    it("should return user and assistant messages with correct roles", async () => {
      const html = loadFixture("chatgpt-share-modern.html");
      const messages = await parseShareHtml(html);

      const roles = messages.map((m) => m.role);
      expect(roles).toContain("user");
      expect(roles).toContain("assistant");

      // All roles should be either 'user' or 'assistant'
      for (const role of roles) {
        expect(["user", "assistant"]).toContain(role);
      }
    });

    it("should extract message content correctly", async () => {
      const html = loadFixture("chatgpt-share-modern.html");
      const messages = await parseShareHtml(html);

      // Content should not be empty
      for (const message of messages) {
        expect(message.content.trim()).not.toBe("");
      }
    });

    it("should skip system messages and hidden content", async () => {
      const html = loadFixture("chatgpt-share-modern.html");
      const messages = await parseShareHtml(html);

      // No system role in output
      const roles = messages.map((m) => m.role);
      expect(roles).not.toContain("system");
    });
  });

  describe("flattenMessageContent", () => {
    it("should flatten text content", async () => {
      const content = {
        content_type: ContentType.TEXT,
        parts: ["Hello, world!"],
      };
      const result = await flattenMessageContent(content);
      expect(result).toBe("Hello, world!");
    });

    it("should flatten multipart text content", async () => {
      const content = {
        content_type: ContentType.TEXT,
        parts: ["Part 1", "Part 2"],
      };
      const result = await flattenMessageContent(content);
      expect(result).toBe("Part 1\n\nPart 2");
    });

    it("should flatten code content with language", async () => {
      const content = {
        content_type: ContentType.CODE,
        language: "python",
        text: "print('hello')",
      };
      const result = await flattenMessageContent(content);
      expect(result).toBe("```python\nprint('hello')\n```");
    });

    it("should flatten code content without language", async () => {
      const content = {
        content_type: ContentType.CODE,
        language: "unknown",
        text: "some code",
      };
      const result = await flattenMessageContent(content);
      expect(result).toBe("```\nsome code\n```");
    });

    it("should flatten thoughts content", async () => {
      const content = {
        content_type: ContentType.THOUGHTS,
        thoughts: [
          { summary: "Thinking", content: "about the problem" },
          { summary: "Analyzing", content: "the data" },
        ],
      };
      const result = await flattenMessageContent(content);
      expect(result).toContain("_Thinking: about the problem_");
      expect(result).toContain("_Analyzing: the data_");
    });

    it("should flatten reasoning_recap content", async () => {
      const content = {
        content_type: ContentType.REASONING_RECAP,
        text: "This is a recap of the reasoning process",
      };
      const result = await flattenMessageContent(content);
      expect(result).toBe("_This is a recap of the reasoning process_");
    });

    it("should handle empty parts", async () => {
      const content = {
        content_type: ContentType.TEXT,
        parts: ["", "  ", "valid"],
      };
      const result = await flattenMessageContent(content);
      expect(result).toBe("valid");
    });

    it("should extract JSON response field if present", async () => {
      const content = {
        content_type: ContentType.TEXT,
        parts: ['{"response": "Extracted response"}'],
      };
      const result = await flattenMessageContent(content);
      expect(result).toBe("Extracted response");
    });

    it("should extract JSON content field if present", async () => {
      const content = {
        content_type: ContentType.TEXT,
        parts: ['{"content": "Extracted content"}'],
      };
      const result = await flattenMessageContent(content);
      expect(result).toBe("Extracted content");
    });

    it("should fallback to extracting from parts for unknown content types", async () => {
      const content = {
        content_type: "unknown_type",
        parts: ["fallback content"],
      };
      const result = await flattenMessageContent(content);
      expect(result).toBe("fallback content");
    });
  });

  describe("Content flattener registry", () => {
    it("should handle all known content types", async () => {
      const contentTypes = [
        {
          type: ContentType.TEXT,
          content: { content_type: ContentType.TEXT, parts: ["test"] },
        },
        {
          type: ContentType.CODE,
          content: { content_type: ContentType.CODE, text: "code" },
        },
        {
          type: ContentType.THOUGHTS,
          content: { content_type: ContentType.THOUGHTS, thoughts: [] },
        },
        {
          type: ContentType.REASONING_RECAP,
          content: { content_type: ContentType.REASONING_RECAP, text: "recap" },
        },
        {
          type: ContentType.MULTIMODAL_TEXT,
          content: {
            content_type: ContentType.MULTIMODAL_TEXT,
            parts: ["text"],
          },
        },
        {
          type: ContentType.TOOL_RESPONSE,
          content: {
            content_type: ContentType.TOOL_RESPONSE,
            output: "output",
          },
        },
        {
          type: ContentType.MODEL_EDITABLE_CONTEXT,
          content: {
            content_type: ContentType.MODEL_EDITABLE_CONTEXT,
            model_set_context: "context",
          },
        },
      ];

      for (const { content } of contentTypes) {
        // Should not throw
        const result = await flattenMessageContent(content);
        expect(typeof result).toBe("string");
      }
    });
  });
});

describe("Privacy: No console.log leakage", () => {
  it("should not log to console by default", async () => {
    const originalLog = console.log;
    const logs: unknown[][] = [];
    console.log = (...args: unknown[]) => logs.push(args);

    try {
      disableDebugLogging(); // Ensure logging is disabled

      const content = {
        content_type: ContentType.TEXT,
        parts: ["sensitive user data here"],
      };
      await flattenMessageContent(content);

      // No logs should have been emitted
      expect(logs.length).toBe(0);
    } finally {
      console.log = originalLog;
    }
  });
});
