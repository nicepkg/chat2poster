/**
 * ChatGPT Extension Adapter Tests
 */

import type { ExtInput } from "@chat2poster/core-schema";
import { JSDOM } from "jsdom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  ChatGPTExtAdapter,
  resetChatGPTExtAdapterTokenCacheForTests,
} from "../adapters/chatgpt/ext-adapter";

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
    resetChatGPTExtAdapterTokenCacheForTests();
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
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(
          createMockResponse({
            accessToken: "mock-access-token",
          }),
        )
        .mockResolvedValueOnce(
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

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        "https://chatgpt.com/api/auth/session",
        expect.objectContaining({
          method: "GET",
          credentials: "include",
        }),
      );
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        `https://chatgpt.com/backend-api/conversation/${CONVERSATION_ID}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: "Bearer mock-access-token",
          },
        },
      );
      expect(conversation.messages).toHaveLength(2);
      expect(conversation.messages[0]?.role).toBe("user");
      expect(conversation.messages[0]?.contentMarkdown).toBe("Hello");
      expect(conversation.messages[1]?.role).toBe("assistant");
      expect(conversation.messages[1]?.contentMarkdown).toBe("Hi there");
    });

    it("should reuse cached token between parses before expiry", async () => {
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(
          createMockResponse({
            accessToken: "cached-token",
            expires: "2099-01-01T00:00:00.000Z",
          }),
        )
        .mockResolvedValue(
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

      await adapter.parse(input);
      await adapter.parse(input);

      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        "https://chatgpt.com/api/auth/session",
        expect.any(Object),
      );
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        `https://chatgpt.com/backend-api/conversation/${CONVERSATION_ID}`,
        expect.any(Object),
      );
      expect(fetchMock).toHaveBeenNthCalledWith(
        3,
        `https://chatgpt.com/backend-api/conversation/${CONVERSATION_ID}`,
        expect.any(Object),
      );
    });

    it("should refresh token once when conversation request returns 401", async () => {
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(
          createMockResponse({
            accessToken: "expired-token",
            expires: "2099-01-01T00:00:00.000Z",
          }),
        )
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({}),
        } as Response)
        .mockResolvedValueOnce(
          createMockResponse({
            accessToken: "fresh-token",
            expires: "2099-01-01T00:00:00.000Z",
          }),
        )
        .mockResolvedValueOnce(
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

      await adapter.parse(input);

      expect(fetchMock).toHaveBeenCalledTimes(4);
      expect(fetchMock).toHaveBeenNthCalledWith(
        3,
        "https://chatgpt.com/api/auth/session",
        expect.any(Object),
      );
      expect(fetchMock).toHaveBeenNthCalledWith(
        4,
        `https://chatgpt.com/backend-api/conversation/${CONVERSATION_ID}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: "Bearer fresh-token",
          },
        },
      );
    });

    it("should fail when session has no access token", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        createMockResponse({
          accessToken: null,
        }),
      );

      const input: ExtInput = {
        type: "ext",
        document: createDOM("<html></html>"),
        url: `https://chatgpt.com/c/${CONVERSATION_ID}`,
      };

      await expect(adapter.parse(input)).rejects.toMatchObject({
        code: "E-PARSE-005",
        detail: "Cannot retrieve ChatGPT access token from session",
      });
    });
  });
});
