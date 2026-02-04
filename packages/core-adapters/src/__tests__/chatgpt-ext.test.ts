/**
 * ChatGPT Extension Adapter Tests
 */

import type { ExtInput } from "@chat2poster/core-schema";
import { JSDOM } from "jsdom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ChatGPTExtAdapter } from "../adapters/chatgpt/ext-adapter";

const CONVERSATION_ID = "3032a77c-d0ce-4d8b-bfcb-e653b1cfdaf6";

function createDOM(html: string): Document {
  const dom = new JSDOM(html, {
    url: `https://chatgpt.com/c/${CONVERSATION_ID}`,
  });
  return dom.window.document;
}

function createMockResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as Response;
}

describe("ChatGPTExtAdapter", () => {
  let adapter: ChatGPTExtAdapter;

  beforeEach(() => {
    adapter = new ChatGPTExtAdapter();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("canHandle", () => {
    it("should handle chat.openai.com URLs", () => {
      const input: ExtInput = {
        type: "ext",
        document: createDOM("<html></html>"),
        url: `https://chat.openai.com/c/${CONVERSATION_ID}`,
      };
      expect(adapter.canHandle(input)).toBe(true);
    });

    it("should handle chatgpt.com URLs", () => {
      const input: ExtInput = {
        type: "ext",
        document: createDOM("<html></html>"),
        url: `https://chatgpt.com/c/${CONVERSATION_ID}`,
      };
      expect(adapter.canHandle(input)).toBe(true);
    });

    it("should not handle non-ChatGPT URLs", () => {
      const input: ExtInput = {
        type: "ext",
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

  describe("parse", () => {
    it("should parse messages from backend API", async () => {
      const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        createMockResponse({
          conversation_id: CONVERSATION_ID,
          current_node: "assistant-id",
          mapping: {
            root: {
              id: "root",
              message: null,
              parent: null,
              children: ["user-id"],
            },
            "user-id": {
              id: "user-id",
              message: {
                id: "user-id",
                author: { role: "user", name: null },
                content: { content_type: "text", parts: ["Hello"] },
                create_time: 1,
              },
              parent: "root",
              children: ["assistant-id"],
            },
            "assistant-id": {
              id: "assistant-id",
              message: {
                id: "assistant-id",
                author: { role: "assistant", name: null },
                content: { content_type: "text", parts: ["Hi there"] },
                create_time: 2,
              },
              parent: "user-id",
              children: [],
            },
          },
        }),
      );

      const input: ExtInput = {
        type: "ext",
        document: createDOM("<html></html>"),
        url: `https://chatgpt.com/c/${CONVERSATION_ID}`,
      };

      const conversation = await adapter.parse(input);

      expect(fetchMock).toHaveBeenCalledOnce();
      expect(conversation.messages).toHaveLength(2);
      expect(conversation.messages[0]?.role).toBe("user");
      expect(conversation.messages[0]?.contentMarkdown).toBe("Hello");
      expect(conversation.messages[1]?.role).toBe("assistant");
      expect(conversation.messages[1]?.contentMarkdown).toBe("Hi there");
    });
  });
});
