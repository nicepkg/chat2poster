/**
 * Claude Extension Adapter
 *
 * Fetches conversation data from Claude backend API using current session.
 */

import type { ExtInput, Provider } from "@chat2poster/core-schema";
import { createAppError } from "@chat2poster/core-schema";
import { BaseExtAdapter, type RawMessage } from "../../../base";
import type { ExtensionSiteConfig } from "../../../extension-site-types";
import { convertClaudeMessagesToRawMessages } from "../shared/message-converter";
import type { ClaudeConversationResponse } from "../shared/types";

const API_BASE = "https://claude.ai/api/organizations";

function extractConversationId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const match = /^\/chat\/([a-zA-Z0-9-]+)$/.exec(parsed.pathname);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function extractOrgIdFromCookie(cookie: string): string | null {
  const match = /(?:^|;\s*)lastActiveOrg=([^;]+)/.exec(cookie);
  if (!match?.[1]) {
    return null;
  }

  return decodeURIComponent(match[1]);
}

async function fetchConversation(
  orgId: string,
  conversationId: string,
): Promise<ClaudeConversationResponse> {
  const response = await fetch(
    `${API_BASE}/${orgId}/chat_conversations/${conversationId}?tree=True&rendering_mode=messages&render_all_tools=true`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
      referrer: `https://claude.ai/chat/${conversationId}`,
      referrerPolicy: "strict-origin-when-cross-origin",
      mode: "cors",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(`Claude API responded with ${response.status}`);
  }

  return (await response.json()) as ClaudeConversationResponse;
}

export const CLAUDE_EXT_SITE = {
  id: "claude",
  provider: "claude",
  name: "Claude",
  hostPermissions: ["https://claude.ai/*"],
  hostPatterns: [/^https:\/\/claude\.ai\//i],
  conversationUrlPatterns: [/^https?:\/\/claude\.ai\/chat\/[a-zA-Z0-9-]+/],
  getConversationId: extractConversationId,
  theme: {
    light: {
      primary: "#c6613f",
      secondary: "#ffedd5",
      primaryForeground: "#ffffff",
      secondaryForeground: "#9a3412",
    },
    dark: {
      primary: "#c6613f",
      secondary: "#7c2d12",
      primaryForeground: "#431407",
      secondaryForeground: "#ffedd5",
    },
  },
} satisfies ExtensionSiteConfig;

export class ClaudeExtAdapter extends BaseExtAdapter {
  readonly id = "claude-ext";
  readonly version = "1.0.0";
  readonly name = "Claude Extension Parser";
  readonly provider: Provider = "claude";

  readonly urlPatterns = CLAUDE_EXT_SITE.conversationUrlPatterns;

  async getRawMessages(input: ExtInput): Promise<RawMessage[]> {
    const conversationId = CLAUDE_EXT_SITE.getConversationId(input.url);
    if (!conversationId) {
      throw createAppError("E-PARSE-001", "Invalid Claude conversation URL");
    }

    const cookie = input.document?.cookie ?? "";
    const orgId = extractOrgIdFromCookie(cookie);
    if (!orgId) {
      throw createAppError(
        "E-PARSE-001",
        "Cannot find Claude organization from cookies",
      );
    }

    const data = await fetchConversation(orgId, conversationId);
    const chatMessages = data.chat_messages ?? [];
    const messages = convertClaudeMessagesToRawMessages(chatMessages);

    if (messages.length === 0) {
      throw createAppError(
        "E-PARSE-005",
        "No messages found. Claude API response may have changed.",
      );
    }

    return messages;
  }
}

export const claudeExtAdapter = new ClaudeExtAdapter();
