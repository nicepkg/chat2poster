import type {
  Conversation,
  Message,
  ContentMeta,
} from "@chat2poster/core-schema";

/**
 * Merge content metadata from two messages
 */
function mergeContentMeta(
  meta1: ContentMeta | undefined,
  meta2: ContentMeta | undefined,
): ContentMeta | undefined {
  if (!meta1 && !meta2) return undefined;

  return {
    containsCodeBlock: meta1?.containsCodeBlock || meta2?.containsCodeBlock,
    containsImage: meta1?.containsImage || meta2?.containsImage,
    // Height needs recalculation after merge
    approxHeightPx: undefined,
  };
}

/**
 * Get the latest timestamp between two optional dates
 */
function getLatestTimestamp(
  time1: string | undefined,
  time2: string | undefined,
): string | undefined {
  if (!time1) return time2;
  if (!time2) return time1;
  return time1 > time2 ? time1 : time2;
}

/**
 * Merge two messages with the same role
 */
function mergeTwoMessages(msg1: Message, msg2: Message): Message {
  return {
    ...msg1,
    contentMarkdown: `${msg1.contentMarkdown}\n\n${msg2.contentMarkdown}`,
    updatedAt: getLatestTimestamp(msg1.updatedAt, msg2.updatedAt),
    contentMeta: mergeContentMeta(msg1.contentMeta, msg2.contentMeta),
  };
}

/**
 * Merge adjacent messages with the same role in a conversation
 *
 * @example
 * Input:
 * - user: "Hello"
 * - user: "How are you?"
 * - assistant: "Hi!"
 * - assistant: "I'm fine."
 *
 * Output:
 * - user: "Hello\n\nHow are you?"
 * - assistant: "Hi!\n\nI'm fine."
 *
 * @param conversation - The conversation to process
 * @returns A new conversation with merged messages
 */
export function mergeAdjacentSameRoleMessages(
  conversation: Conversation,
): Conversation {
  const { messages } = conversation;

  // Early returns for edge cases
  if (messages.length <= 1) {
    return conversation;
  }

  const mergedMessages: Message[] = [];
  let currentMessage = { ...messages[0]! };

  for (let i = 1; i < messages.length; i++) {
    const nextMessage = messages[i]!;

    if (currentMessage.role === nextMessage.role) {
      // Same role: merge into current
      currentMessage = mergeTwoMessages(currentMessage, nextMessage);
    } else {
      // Different role: save current and start new
      mergedMessages.push(currentMessage);
      currentMessage = { ...nextMessage };
    }
  }

  // Don't forget the last message
  mergedMessages.push(currentMessage);

  // Reindex order field
  const reindexedMessages = mergedMessages.map((msg, index) => ({
    ...msg,
    order: index,
  }));

  return {
    ...conversation,
    messages: reindexedMessages,
    updatedAt: new Date().toISOString(),
  };
}
