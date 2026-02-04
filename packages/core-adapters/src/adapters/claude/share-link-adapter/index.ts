/**
 * Claude Share Link Adapter
 *
 * Parses conversations from Claude public share links.
 */

import type { Provider } from "@chat2poster/core-schema";
import { createAppError } from "@chat2poster/core-schema";
import { BaseShareLinkAdapter, type RawMessage } from "../../../base";
import { fetchJson } from "../../../network";
import { convertClaudeMessagesToRawMessages } from "../shared/message-converter";
import type { ClaudeConversationResponse } from "../shared/types";

const SHARE_API_BASE = "https://claude.ai/api/chat_snapshots";

function extractShareId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const match = /^\/share\/([a-zA-Z0-9-]+)$/.exec(parsed.pathname);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

async function fetchSnapshot(
  shareId: string,
): Promise<ClaudeConversationResponse> {
  return fetchJson<ClaudeConversationResponse>(
    `${SHARE_API_BASE}/${shareId}?rendering_mode=messages&render_all_tools=true`,
    {
      method: "GET",
      credentials: "include",
    },
  );
}

export class ClaudeShareLinkAdapter extends BaseShareLinkAdapter {
  readonly id = "claude-share-link";
  readonly version = "2.0.0";
  readonly name = "Claude Share Link Parser";
  readonly provider: Provider = "claude";

  readonly urlPatterns = [/^https?:\/\/claude\.ai\/share\/[a-zA-Z0-9-]+$/i];

  async fetchAndExtract(url: string): Promise<RawMessage[]> {
    const shareId = extractShareId(url);
    if (!shareId) {
      throw createAppError("E-PARSE-001", "Invalid Claude share URL");
    }

    const snapshot = await fetchSnapshot(shareId);
    console.log("snapshot", snapshot);
    const chatMessages = snapshot.chat_messages ?? [];
    const messages = convertClaudeMessagesToRawMessages(chatMessages);

    if (messages.length === 0) {
      throw createAppError(
        "E-PARSE-005",
        "No messages found. Claude snapshot response may have changed.",
      );
    }

    return messages;
  }
}

export const claudeShareLinkAdapter = new ClaudeShareLinkAdapter();
