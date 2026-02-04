/**
 * Message Converter
 *
 * Shared logic for converting ChatGPT share data to RawMessage format.
 * Used by both modern and legacy parsing strategies.
 */

import type { RawMessage } from "../../../base";
import { ContentType, MessageRole } from "./constants";
import {
  flattenMessageContent,
  type FlattenContext,
} from "./content-flatteners";
import { createScopedLogger } from "./logger";
import { stripCitationTokens } from "./text-processor";
import type { MessageNode, ShareData } from "./types";

const logger = createScopedLogger("MessageConverter");

/**
 * Message skip reasons for debugging
 */
const SkipReason = {
  NO_NODE_ID: "no_node_id",
  NO_MESSAGE: "no_message",
  SYSTEM_ROLE: "system_role",
  INVALID_ROLE: "invalid_role",
  HIDDEN_THOUGHTS: "hidden_thoughts",
  HIDDEN_CODE: "hidden_code",
  VISUALLY_HIDDEN: "visually_hidden",
  REDACTED: "redacted",
  USER_SYSTEM_MESSAGE: "user_system_message",
  REASONING_STATUS: "reasoning_status",
  NO_CONTENT: "no_content",
  EMPTY_TEXT: "empty_text",
} as const;

/**
 * Check if a message should be skipped during conversion
 *
 * @returns The skip reason if the message should be skipped, null otherwise
 */
function shouldSkipMessage(
  node: MessageNode | undefined,
): (typeof SkipReason)[keyof typeof SkipReason] | null {
  if (!node?.message) {
    return SkipReason.NO_MESSAGE;
  }

  const message = node.message;
  const role = message.author?.role;

  // Skip system messages
  if (role === MessageRole.SYSTEM) {
    return SkipReason.SYSTEM_ROLE;
  }

  // Only process user, assistant, and tool messages
  if (
    role !== MessageRole.USER &&
    role !== MessageRole.ASSISTANT &&
    role !== MessageRole.TOOL
  ) {
    return SkipReason.INVALID_ROLE;
  }

  // Skip hidden message types
  if (message.content?.content_type === ContentType.THOUGHTS) {
    return SkipReason.HIDDEN_THOUGHTS;
  }

  if (message.content?.content_type === ContentType.CODE) {
    return SkipReason.HIDDEN_CODE;
  }

  if (message.metadata?.is_visually_hidden_from_conversation) {
    return SkipReason.VISUALLY_HIDDEN;
  }

  if (message.metadata?.is_redacted) {
    return SkipReason.REDACTED;
  }

  if (message.metadata?.is_user_system_message) {
    return SkipReason.USER_SYSTEM_MESSAGE;
  }

  if (Boolean(message.metadata?.reasoning_status)) {
    return SkipReason.REASONING_STATUS;
  }

  // Check for content
  if (!message.content) {
    return SkipReason.NO_CONTENT;
  }

  return null;
}

/**
 * Convert ShareData to RawMessage array
 *
 * This is the shared conversion logic used by both modern and legacy parsers.
 */
export async function convertShareDataToMessages(
  data: ShareData,
  sharedConversationId: string | undefined,
  cookies: string | undefined,
): Promise<RawMessage[]> {
  const mapping = data.mapping ?? {};
  const sequence = data.linear_conversation ?? [];
  const messages: RawMessage[] = [];

  // Create base flatten context
  const baseFlattenContext: FlattenContext = {
    sharedConversationId,
    cookies,
  };

  for (const entry of sequence) {
    const nodeId = entry.id;
    if (!nodeId) {
      logger.debug("Skipping entry without nodeId");
      continue;
    }

    const node = mapping[nodeId];
    if (!node) {
      logger.debug("Skipping entry without node");
      continue;
    }

    const skipReason = shouldSkipMessage(node);

    if (skipReason) {
      logger.debug("Skipping message", skipReason);
      continue;
    }

    // After shouldSkipMessage passes, message is guaranteed to exist
    const message = node.message!;
    const role = message.author!.role!;
    const content = message.content!;

    logger.debug("Processing message", role);

    // Try to get sharedConversationId from message metadata as fallback
    const messageConversationId =
      message.metadata?.shared_conversation_id || sharedConversationId;

    const ctx: FlattenContext = messageConversationId
      ? { sharedConversationId: messageConversationId, cookies }
      : baseFlattenContext;

    let text = await flattenMessageContent(content, ctx);
    text = stripCitationTokens(text);

    if (!text.trim()) {
      logger.debug("Skipping message with empty text");
      continue;
    }

    messages.push({
      role: role === MessageRole.USER ? "user" : "assistant",
      content: text,
    });
  }

  logger.debug("Converted messages count", messages.length);
  return messages;
}
