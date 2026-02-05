/**
 * Gemini Extension Adapter
 *
 * Reads conversation data from Gemini's internal batchexecute endpoint.
 */

import type { ExtInput, Provider } from "@chat2poster/core-schema";
import { createAppError } from "@chat2poster/core-schema";
import { BaseExtAdapter, type RawMessage } from "../../../base";
import type { ExtensionSiteConfig } from "../../../extension-site-types";
import { fetchHtml } from "../../../network";
import {
  extractMessagesFromPayload,
  extractRuntimeParamsFromHtml,
  fetchBatchExecutePayload,
  getPreferredLanguage,
} from "../shared";

const READ_CHAT_RPC_ID = "hNvQHb";

function extractConversationId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const match = /^\/(?:u\/\d+\/)?app\/([a-zA-Z0-9]+)$/.exec(parsed.pathname);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

async function resolveRuntimeParams(input: ExtInput) {
  const hl = getPreferredLanguage(input.document);
  const initialHtml = input.document.documentElement.outerHTML;
  const directParams = extractRuntimeParamsFromHtml(initialHtml, hl);
  if (directParams) {
    return directParams;
  }

  const remoteHtml = await fetchHtml(input.url, {
    credentials: "include",
    mode: "cors",
  });
  const fallbackParams = extractRuntimeParamsFromHtml(remoteHtml, hl);
  if (fallbackParams) {
    return fallbackParams;
  }

  throw createAppError(
    "E-PARSE-001",
    "Cannot find Gemini runtime tokens (SNlM0e/cfb2h/FdrFJe)",
  );
}

async function fetchGeminiConversation(
  conversationId: string,
  runtimeParams: {
    at?: string;
    bl: string;
    fSid: string;
    hl: string;
  },
): Promise<RawMessage[]> {
  const payloadString = await fetchBatchExecutePayload({
    rpcId: READ_CHAT_RPC_ID,
    rpcPayload: JSON.stringify([null, conversationId]),
    sourcePath: `/app/${conversationId}`,
    referrerUrl: `https://gemini.google.com/app/${conversationId}`,
    runtimeParams,
  });

  let payload: unknown;
  try {
    payload = JSON.parse(payloadString) as unknown;
  } catch {
    throw createAppError("E-PARSE-005", "Gemini payload is not valid JSON");
  }

  const messages = extractMessagesFromPayload(payload);
  if (messages.length === 0) {
    throw createAppError(
      "E-PARSE-005",
      "No messages found. Gemini response format may have changed.",
    );
  }

  return messages;
}

export const GEMINI_EXT_SITE = {
  id: "gemini",
  provider: "gemini",
  name: "Gemini",
  hostPermissions: ["https://gemini.google.com/*"],
  hostPatterns: [/^https:\/\/gemini\.google\.com\//i],
  conversationUrlPatterns: [
    /^https?:\/\/gemini\.google\.com\/(?:u\/\d+\/)?app\/[a-zA-Z0-9]+/,
  ],
  getConversationId: extractConversationId,
  theme: {
    light: {
      primary: "#0842a0",
      secondary: "#d3e3fd",
      primaryForeground: "#ffffff",
      secondaryForeground: "#1d4ed8",
    },
    dark: {
      primary: "#d3e3fd",
      secondary: "#0842a0",
      primaryForeground: "#0b1537",
      secondaryForeground: "#e0ecff",
    },
  },
} satisfies ExtensionSiteConfig;

export class GeminiExtAdapter extends BaseExtAdapter {
  readonly id = "gemini-ext";
  readonly version = "1.0.0";
  readonly name = "Gemini Extension Parser";
  readonly provider: Provider = "gemini";

  readonly urlPatterns = GEMINI_EXT_SITE.conversationUrlPatterns;

  async getRawMessages(input: ExtInput): Promise<RawMessage[]> {
    const conversationId = GEMINI_EXT_SITE.getConversationId(input.url);
    if (!conversationId) {
      throw createAppError("E-PARSE-001", "Invalid Gemini conversation URL");
    }

    const runtimeParams = await resolveRuntimeParams(input);
    return fetchGeminiConversation(conversationId, runtimeParams);
  }
}

export const geminiExtAdapter = new GeminiExtAdapter();
