/**
 * Claude Extension Adapter Tests
 */

import type { ExtInput } from "@chat2poster/core-schema";
import { JSDOM } from "jsdom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ClaudeExtAdapter } from "../adapters/claude/ext-adapter";

const CONVERSATION_ID = "e939f454-b683-45d5-bdbc-de6154a2ec8d";
const ORG_ID = "f4f91f3c-9b11-4f52-aa64-1e6b69f92fb5";

function createDOM(html: string, withOrgCookie = true): Document {
  const dom = new JSDOM(html, {
    url: `https://claude.ai/chat/${CONVERSATION_ID}`,
  });

  if (withOrgCookie) {
    dom.window.document.cookie = `lastActiveOrg=${ORG_ID}`;
  }

  return dom.window.document;
}

function createMockResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as Response;
}

describe("ClaudeExtAdapter", () => {
  let adapter: ClaudeExtAdapter;

  beforeEach(() => {
    adapter = new ClaudeExtAdapter();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("canHandle", () => {
    it("should handle claude.ai chat URLs", () => {
      const input: ExtInput = {
        type: "ext",
        document: createDOM("<html></html>"),
        url: `https://claude.ai/chat/${CONVERSATION_ID}`,
      };

      expect(adapter.canHandle(input)).toBe(true);
    });

    it("should not handle non-Claude URLs", () => {
      const input: ExtInput = {
        type: "ext",
        document: createDOM("<html></html>"),
        url: "https://chatgpt.com/c/123",
      };

      expect(adapter.canHandle(input)).toBe(false);
    });
  });

  describe("parse", () => {
    it("should parse messages from Claude backend API", async () => {
      const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        createMockResponse({
          uuid: CONVERSATION_ID,
          name: "今天的重大新闻",
          chat_messages: [
            {
              uuid: "message-1",
              sender: "human",
              index: 0,
              created_at: "2026-02-04T04:35:52.191714Z",
              content: [{ type: "text", text: "今天有什么重大新闻？" }],
            },
            {
              uuid: "message-2",
              sender: "assistant",
              index: 1,
              created_at: "2026-02-04T04:36:52.191714Z",
              content: [{ type: "text", text: "这是今天的主要新闻..." }],
            },
          ],
        }),
      );

      const input: ExtInput = {
        type: "ext",
        document: createDOM("<html></html>"),
        url: `https://claude.ai/chat/${CONVERSATION_ID}`,
      };

      const conversation = await adapter.parse(input);

      expect(fetchMock).toHaveBeenCalledOnce();
      expect(conversation.messages).toHaveLength(2);
      expect(conversation.messages[0]?.role).toBe("user");
      expect(conversation.messages[0]?.contentMarkdown).toBe(
        "今天有什么重大新闻？",
      );
      expect(conversation.messages[1]?.role).toBe("assistant");
      expect(conversation.messages[1]?.contentMarkdown).toBe(
        "这是今天的主要新闻...",
      );
    });

    it("should throw when lastActiveOrg cookie is missing", async () => {
      const input: ExtInput = {
        type: "ext",
        document: createDOM("<html></html>", false),
        url: `https://claude.ai/chat/${CONVERSATION_ID}`,
      };

      await expect(adapter.parse(input)).rejects.toMatchObject({
        code: "E-PARSE-001",
      });
    });
  });
});
