/**
 * Gemini Share Link Adapter
 *
 * Parses public Gemini share links via batchexecute.
 */

import type { Provider } from "@chat2poster/core-schema";
import { createAppError } from "@chat2poster/core-schema";
import { BaseShareLinkAdapter, type RawMessage } from "../../../base";
import { fetchHtmlWithCookies, getRedirectUrl } from "../../../network";
import {
  extractHtmlLang,
  extractMessagesFromPayload,
  extractRuntimeParamsFromHtml,
  fetchBatchExecutePayload,
} from "../shared";

const READ_SHARE_RPC_ID = "ujx1Bf";

function extractShareId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const match = /^\/share\/([a-zA-Z0-9]+)$/.exec(parsed.pathname);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

async function normalizeShareUrl(url: string): Promise<string> {
  if (!/^https?:\/\/g\.co\/gemini\/share\/[a-zA-Z0-9]+/.test(url)) {
    return url;
  }

  try {
    return await getRedirectUrl(url);
  } catch {
    return url.replace("https://g.co/gemini", "https://gemini.google.com");
  }
}

async function fetchGeminiShareMessages(url: string): Promise<RawMessage[]> {
  const normalizedUrl = await normalizeShareUrl(url);
  const shareId = extractShareId(normalizedUrl);
  if (!shareId) {
    throw createAppError("E-PARSE-001", "Invalid Gemini share link URL");
  }

  const { html, cookies } = await fetchHtmlWithCookies(normalizedUrl, {
    credentials: "include",
    mode: "cors",
  });

  const hl = extractHtmlLang(html) || "en";
  const runtimeParams = extractRuntimeParamsFromHtml(html, hl);
  if (!runtimeParams) {
    throw createAppError(
      "E-PARSE-001",
      "Cannot find Gemini runtime tokens (SNlM0e/cfb2h/FdrFJe) on share page",
    );
  }

  const payloadString = await fetchBatchExecutePayload({
    rpcId: READ_SHARE_RPC_ID,
    sourcePath: `/share/${shareId}`,
    referrerUrl: normalizedUrl,
    runtimeParams,
    cookie: cookies || undefined,
  });

  let payload: unknown;
  try {
    payload = JSON.parse(payloadString) as unknown;
  } catch {
    throw createAppError(
      "E-PARSE-005",
      "Gemini share payload is not valid JSON",
    );
  }

  const messages = extractMessagesFromPayload(payload);
  if (messages.length === 0) {
    throw createAppError(
      "E-PARSE-005",
      "No messages found. Gemini share response format may have changed.",
    );
  }

  return messages;
}

export class GeminiShareLinkAdapter extends BaseShareLinkAdapter {
  readonly id = "gemini-share-link";
  readonly version = "1.0.0";
  readonly name = "Gemini Share Link Parser";
  readonly provider: Provider = "gemini";

  readonly urlPatterns = [
    /^https?:\/\/gemini\.google\.com\/share\/[a-zA-Z0-9]+/,
    /^https?:\/\/g\.co\/gemini\/share\/[a-zA-Z0-9]+/,
  ];

  async fetchAndExtract(url: string): Promise<RawMessage[]> {
    return fetchGeminiShareMessages(url);
  }
}

export const geminiShareLinkAdapter = new GeminiShareLinkAdapter();
