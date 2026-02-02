import { z } from "zod";
import { type Conversation } from "./conversation";
import { MessageRole } from "./message";

/**
 * Adapter input type - the discriminator for adapter inputs
 * Single source of truth for input type values
 */
export const AdapterInputType = z.enum([
  "dom",
  "share-link",
  "manual",
  "paste",
]);
export type AdapterInputType = z.infer<typeof AdapterInputType>;

/**
 * Input type for DOM-based parsing (extension)
 */
export const DOMInput = z
  .object({
    type: z.literal(AdapterInputType.enum.dom),
    document: z.custom<Document>(),
    url: z.string().url(),
  })
  .strict();
export type DOMInput = z.infer<typeof DOMInput>;

/**
 * Input type for share link parsing (web)
 */
export const ShareLinkInput = z
  .object({
    type: z.literal(AdapterInputType.enum["share-link"]),
    url: z.string().url(),
  })
  .strict();
export type ShareLinkInput = z.infer<typeof ShareLinkInput>;

/**
 * Input type for manual message input (web)
 */
export const ManualInput = z
  .object({
    type: z.literal(AdapterInputType.enum.manual),
    messages: z.array(
      z.object({
        role: MessageRole,
        content: z.string(),
      }),
    ),
  })
  .strict();
export type ManualInput = z.infer<typeof ManualInput>;

/**
 * Input type for pasted text (web)
 */
export const PasteTextInput = z
  .object({
    type: z.literal(AdapterInputType.enum.paste),
    text: z.string(),
    format: z.enum(["plain", "markdown"]).default("plain"),
  })
  .strict();
export type PasteTextInput = z.infer<typeof PasteTextInput>;

/**
 * Union of all adapter input types
 */
export const AdapterInput = z.discriminatedUnion("type", [
  DOMInput,
  ShareLinkInput,
  ManualInput,
  PasteTextInput,
]);
export type AdapterInput = z.infer<typeof AdapterInput>;

/**
 * Adapter interface for parsing conversations
 * Implementors should extend this interface
 */
export interface Adapter {
  /**
   * Unique identifier for this adapter
   */
  readonly id: string;

  /**
   * Semantic version of this adapter
   */
  readonly version: string;

  /**
   * Human-readable name
   */
  readonly name: string;

  /**
   * Input types this adapter supports
   */
  readonly supportedInputTypes: readonly AdapterInputType[];

  /**
   * Check if this adapter can handle the given input
   */
  canHandle(input: AdapterInput): boolean;

  /**
   * Parse the input into a Conversation
   * @throws AppError if parsing fails
   */
  parse(input: AdapterInput): Promise<Conversation>;
}

/**
 * Adapter metadata for registration
 */
export const AdapterMeta = z
  .object({
    id: z.string(),
    version: z.string(),
    name: z.string(),
    supportedInputTypes: z.array(AdapterInputType),
  })
  .strict();
export type AdapterMeta = z.infer<typeof AdapterMeta>;
