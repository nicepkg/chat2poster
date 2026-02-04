/**
 * Claude Share Link Adapter Tests
 */

import type { ShareLinkInput } from "@chat2poster/core-schema";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClaudeShareLinkAdapter } from "../adapters/claude/share-link-adapter";

const SNAPSHOT_ID = "3745d94b-a9cc-405f-93f8-c67b24fc205c";

function createMockResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    headers: new Headers(),
    json: async () => payload,
  } as Response;
}

describe("ClaudeShareLinkAdapter", () => {
  let adapter: ClaudeShareLinkAdapter;

  beforeEach(() => {
    adapter = new ClaudeShareLinkAdapter();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("parse", () => {
    it("should parse messages from Claude share snapshot API", async () => {
      const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        createMockResponse({
          uuid: SNAPSHOT_ID,
          snapshot_name: "今天的重大新闻",
          chat_messages: [
            {
              uuid: "m-1",
              sender: "human",
              index: 0,
              created_at: "2026-02-04T04:35:53.843752Z",
              content: [{ type: "text", text: "今天有什么重大新闻？" }],
            },
            {
              uuid: "m-2",
              sender: "assistant",
              index: 1,
              created_at: "2026-02-04T04:36:18.692557Z",
              content: [
                {
                  type: "tool_use",
                  id: "toolu_01",
                  name: "web_search",
                  input: { query: "major news today February 4 2026" },
                },
                {
                  type: "tool_result",
                  tool_use_id: "toolu_01",
                  content: [{ type: "knowledge", title: "test" }],
                },
                {
                  type: "text",
                  text: "兄弟今天新闻还挺炸的，我给你捋捋。",
                },
              ],
            },
            {
              uuid: "m-3",
              sender: "human",
              index: 2,
              created_at: "2026-02-04T04:36:28.430291Z",
              content: [{ type: "text", text: "生成一张图片给我" }],
            },
          ],
        }),
      );

      const input: ShareLinkInput = {
        type: "share-link",
        url: `https://claude.ai/share/${SNAPSHOT_ID}`,
      };

      const conversation = await adapter.parse(input);

      expect(fetchMock).toHaveBeenCalledOnce();
      expect(fetchMock).toHaveBeenCalledWith(
        `https://claude.ai/api/chat_snapshots/${SNAPSHOT_ID}?rendering_mode=messages&render_all_tools=true`,
        expect.objectContaining({
          method: "GET",
          credentials: "include",
        }),
      );

      expect(conversation.sourceType).toBe("web-share-link");
      expect(conversation.sourceMeta).toBeDefined();
      expect(conversation.sourceMeta?.provider).toBe("claude");
      expect(conversation.messages).toHaveLength(3);
      expect(conversation.messages[0]?.role).toBe("user");
      expect(conversation.messages[0]?.contentMarkdown).toContain(
        "今天有什么重大新闻？",
      );
      expect(conversation.messages[1]?.role).toBe("assistant");
      expect(conversation.messages[1]?.contentMarkdown).toContain(
        "兄弟今天新闻还挺炸的",
      );
      expect(conversation.messages[1]?.contentMarkdown).not.toContain(
        "toolu_01",
      );
      expect(conversation.messages[2]?.role).toBe("user");
      expect(conversation.messages[2]?.contentMarkdown).toBe(
        "生成一张图片给我",
      );
    });

    it("should throw when snapshot has no text messages", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        createMockResponse({
          uuid: SNAPSHOT_ID,
          chat_messages: [],
        }),
      );

      const input: ShareLinkInput = {
        type: "share-link",
        url: `https://claude.ai/share/${SNAPSHOT_ID}`,
      };

      await expect(adapter.parse(input)).rejects.toMatchObject({
        code: "E-PARSE-005",
      });
    });
  });
});
