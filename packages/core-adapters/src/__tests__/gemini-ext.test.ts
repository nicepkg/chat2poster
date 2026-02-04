/**
 * Gemini Extension Adapter Tests
 */

import type { ExtInput } from "@chat2poster/core-schema";
import { JSDOM } from "jsdom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GeminiExtAdapter } from "../adapters/gemini/ext-adapter";

const CONVERSATION_ID = "d54c429fda42be39";

function createDOM(html: string): Document {
  const dom = new JSDOM(html, {
    url: `https://gemini.google.com/app/${CONVERSATION_ID}`,
  });
  return dom.window.document;
}

function buildBatchExecuteResponse(payload: unknown): string {
  const envelope = [
    ["wrb.fr", "hNvQHb", JSON.stringify(payload), null, null, null, "generic"],
  ];
  return `)]}'\n54773\n${JSON.stringify(envelope)}\n`;
}

describe("GeminiExtAdapter", () => {
  let adapter: GeminiExtAdapter;

  beforeEach(() => {
    adapter = new GeminiExtAdapter();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("canHandle", () => {
    it("should handle gemini app URLs", () => {
      const input: ExtInput = {
        type: "ext",
        document: createDOM("<html lang='en'></html>"),
        url: `https://gemini.google.com/app/${CONVERSATION_ID}`,
      };

      expect(adapter.canHandle(input)).toBe(true);
    });

    it("should not handle gemini share URLs", () => {
      const input = {
        type: "share-link" as const,
        url: "https://gemini.google.com/share/abc123",
      };

      expect(adapter.canHandle(input)).toBe(false);
    });
  });

  describe("parse", () => {
    it("should parse user and assistant messages from batchexecute payload", async () => {
      const payload = [
        [
          [["给一个mermaid流程图给我"], 1, null, 0, "state", 0],
          ["rc_abc123", ["当然可以，下面是流程图代码。"], null, null, true],
        ],
      ];

      const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(buildBatchExecuteResponse(payload), {
          status: 200,
          headers: { "content-type": "text/plain;charset=utf-8" },
        }),
      );

      const input: ExtInput = {
        type: "ext",
        document: createDOM(`
          <html lang="en">
            <head>
              <script>
                window.__RUNTIME__ = {"SNlM0e":"test-at","cfb2h":"boq_assistant-bard-web-server_20260202.09_p1","FdrFJe":"-7928534935687733480"};
              </script>
            </head>
            <body></body>
          </html>
        `),
        url: `https://gemini.google.com/app/${CONVERSATION_ID}`,
      };

      const conversation = await adapter.parse(input);

      expect(fetchMock).toHaveBeenCalledOnce();
      const [firstUrl] = fetchMock.mock.calls[0] ?? [];
      const requestUrl =
        typeof firstUrl === "string"
          ? firstUrl
          : firstUrl instanceof URL
            ? firstUrl.href
            : firstUrl instanceof Request
              ? firstUrl.url
              : "";
      expect(requestUrl).toContain("rpcids=hNvQHb");
      expect(requestUrl).toContain(`source-path=%2Fapp%2F${CONVERSATION_ID}`);

      expect(conversation.messages).toHaveLength(2);
      expect(conversation.messages[0]?.role).toBe("user");
      expect(conversation.messages[0]?.contentMarkdown).toBe(
        "给一个mermaid流程图给我",
      );
      expect(conversation.messages[1]?.role).toBe("assistant");
      expect(conversation.messages[1]?.contentMarkdown).toBe(
        "当然可以，下面是流程图代码。",
      );
    });
  });
});
