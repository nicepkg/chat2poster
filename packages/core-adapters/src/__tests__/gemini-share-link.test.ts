/**
 * Gemini Share Link Adapter Tests
 */

import type { ShareLinkInput } from "@chat2poster/core-schema";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GeminiShareLinkAdapter } from "../adapters/gemini/share-link-adapter";

const SHARE_ID = "836fffdbab41";

function createHtmlResponse(html: string): Response {
  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html;charset=utf-8",
    },
  });
}

function createBatchResponse(payload: unknown): Response {
  const envelope = [
    ["wrb.fr", "ujx1Bf", JSON.stringify(payload), null, null, null, "generic"],
  ];

  return new Response(`)]}'\n31479\n${JSON.stringify(envelope)}\n`, {
    status: 200,
    headers: {
      "content-type": "text/plain;charset=utf-8",
    },
  });
}

describe("GeminiShareLinkAdapter", () => {
  let adapter: GeminiShareLinkAdapter;

  beforeEach(() => {
    adapter = new GeminiShareLinkAdapter();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("parse", () => {
    it("should parse messages from Gemini share batchexecute endpoint", async () => {
      const payload = [
        [
          [["今天有什么重大新闻？"], 1, null, 0, "fbb127bbb056c959", 0],
          [
            "rc_25fb82d970a49f0d",
            ["今天是2026年2月4日，今天国内外有不少重磅消息。"],
          ],
        ],
      ];

      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(
          createHtmlResponse(`
            <html lang="en-US">
              <head>
                <script>
                  window.__RUNTIME__ = {"SNlM0e":"test-at","cfb2h":"boq_assistant-bard-web-server_20260202.09_p1","FdrFJe":"-5386850166387042553"};
                </script>
              </head>
              <body></body>
            </html>
          `),
        )
        .mockResolvedValueOnce(createBatchResponse(payload));

      const input: ShareLinkInput = {
        type: "share-link",
        url: `https://gemini.google.com/share/${SHARE_ID}`,
      };

      const conversation = await adapter.parse(input);

      expect(fetchMock).toHaveBeenCalledTimes(2);
      const [batchedUrl] = fetchMock.mock.calls[1] ?? [];
      const [, batchedInit] = fetchMock.mock.calls[1] ?? [];
      const requestUrl =
        typeof batchedUrl === "string"
          ? batchedUrl
          : batchedUrl instanceof URL
            ? batchedUrl.href
            : batchedUrl instanceof Request
              ? batchedUrl.url
              : "";
      expect(requestUrl).toContain("rpcids=ujx1Bf");
      expect(requestUrl).toContain(`source-path=%2Fshare%2F${SHARE_ID}`);

      const requestBody = batchedInit?.body;
      const body =
        typeof requestBody === "string"
          ? requestBody
          : requestBody instanceof URLSearchParams
            ? requestBody.toString()
            : "";
      const fReq = new URLSearchParams(body).get("f.req");
      const parsedFReq = JSON.parse(fReq ?? "[]") as unknown[][][];
      expect(parsedFReq[0]?.[0]?.[1]).toBe(`[null,"${SHARE_ID}"]`);

      expect(conversation.sourceType).toBe("web-share-link");
      expect(conversation.sourceMeta?.provider).toBe("gemini");
      expect(conversation.messages).toHaveLength(2);
      expect(conversation.messages[0]?.role).toBe("user");
      expect(conversation.messages[0]?.contentMarkdown).toBe(
        "今天有什么重大新闻？",
      );
      expect(conversation.messages[1]?.role).toBe("assistant");
      expect(conversation.messages[1]?.contentMarkdown).toContain(
        "今天是2026年2月4日",
      );
    });
  });
});
