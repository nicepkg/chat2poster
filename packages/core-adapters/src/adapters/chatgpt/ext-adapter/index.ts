/**
 * ChatGPT Extension Adapter
 *
 * Fetches conversation data from ChatGPT backend API using current session.
 */

import type { ExtInput, Provider } from "@chat2poster/core-schema";
import { createAppError } from "@chat2poster/core-schema";
import { BaseExtAdapter, type RawMessage } from "../../../base";
import { convertShareDataToMessages } from "../shared/message-converter";
import type { MessageNode, ShareData } from "../shared/types";

const API_ENDPOINT = "https://chatgpt.com/backend-api/conversation";

interface ChatGPTConversationResponse {
  conversation_id?: string;
  title?: string;
  mapping?: Record<string, MessageNode>;
  current_node?: string;
}

function extractConversationId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const lastSegment = parsed.pathname.split("/").filter(Boolean).pop();
    if (lastSegment?.length === 36) return lastSegment;

    const match = /\/c\/([a-zA-Z0-9-]{36})/.exec(parsed.pathname);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function buildLinearConversation(
  mapping: Record<string, MessageNode>,
  currentNodeId?: string,
): string[] {
  if (currentNodeId && mapping[currentNodeId]) {
    const ids: string[] = [];
    let nodeId: string | undefined = currentNodeId;
    const visited = new Set<string>();

    while (nodeId && !visited.has(nodeId)) {
      visited.add(nodeId);
      ids.push(nodeId);
      nodeId = mapping[nodeId]?.parent;
    }

    return ids.reverse();
  }

  const nodes = Object.values(mapping)
    .filter((node): node is MessageNode & { id: string } => Boolean(node?.id))
    .sort(
      (a, b) => (a.message?.create_time ?? 0) - (b.message?.create_time ?? 0),
    );

  return nodes.map((node) => node.id);
}

async function fetchConversation(
  conversationId: string,
): Promise<ChatGPTConversationResponse> {
  const response = await fetch(`${API_ENDPOINT}/${conversationId}`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`ChatGPT API responded with ${response.status}`);
  }

  return (await response.json()) as ChatGPTConversationResponse;
}

export class ChatGPTExtAdapter extends BaseExtAdapter {
  readonly id = "chatgpt-ext";
  readonly version = "1.0.0";
  readonly name = "ChatGPT Extension Parser";
  readonly provider: Provider = "chatgpt";

  readonly urlPatterns = [
    /^https?:\/\/(chat\.openai\.com|chatgpt\.com)\/c\/[a-zA-Z0-9-]+/,
  ];

  async getRawMessages(input: ExtInput): Promise<RawMessage[]> {
    const conversationId = extractConversationId(input.url);
    if (!conversationId) {
      throw createAppError("E-PARSE-001", "Invalid ChatGPT conversation URL");
    }

    const data = await fetchConversation(conversationId);

    if (!data.mapping) {
      throw new Error("No conversation mapping found");
    }

    const linear = buildLinearConversation(data.mapping, data.current_node);
    const shareData: ShareData = {
      mapping: data.mapping,
      linear_conversation: linear.map((id) => ({ id })),
    };

    const messages = await convertShareDataToMessages(
      shareData,
      data.conversation_id ?? conversationId,
      undefined,
    );
    if (messages.length === 0) {
      throw createAppError(
        "E-PARSE-005",
        "No messages found. ChatGPT API response may have changed.",
      );
    }

    return messages;
  }
}

export const chatGPTExtAdapter = new ChatGPTExtAdapter();
