import { z } from "zod";
import { Message } from "./message";

/**
 * Source type of the conversation - how it was obtained
 */
export const SourceType = z.enum([
  "extension-current",
  "web-share-link",
  "web-manual",
  "web-paste",
]);
export type SourceType = z.infer<typeof SourceType>;

/**
 * Provider of the original AI conversation
 */
export const Provider = z.enum(["chatgpt", "claude", "gemini", "unknown"]);
export type Provider = z.infer<typeof Provider>;

/**
 * Metadata about where the conversation came from
 */
export const SourceMeta = z
  .object({
    provider: Provider,
    shareUrl: z.string().url().optional(),
    parsedAt: z.string().datetime().optional(),
    adapterId: z.string().optional(),
    adapterVersion: z.string().optional(),
  })
  .strict();
export type SourceMeta = z.infer<typeof SourceMeta>;

/**
 * A conversation containing ordered messages
 */
export const Conversation = z
  .object({
    id: z.string().uuid(),
    sourceType: SourceType,
    messages: z.array(Message),
    sourceMeta: SourceMeta.optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
  })
  .strict()
  .refine(
    (conv) => {
      // CONV-001: Message order must be consistent
      return conv.messages.every((msg, idx) => msg.order === idx);
    },
    { message: "Message order must be sequential starting from 0" }
  )
  .refine(
    (conv) => {
      // CONV-002: web-share-link must have shareUrl
      if (conv.sourceType === "web-share-link") {
        return conv.sourceMeta?.shareUrl !== undefined;
      }
      return true;
    },
    { message: "web-share-link source type requires sourceMeta.shareUrl" }
  );
export type Conversation = z.infer<typeof Conversation>;

/**
 * Create a new conversation with defaults
 */
export function createConversation(
  partial: Pick<Conversation, "id" | "sourceType" | "messages"> &
    Partial<Conversation>
): Conversation {
  return Conversation.parse({
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...partial,
  });
}
