/**
 * Base Adapter Utilities
 *
 * Common utilities and base implementations for adapters.
 */

import type {
  Adapter,
  AdapterInput,
  AdapterInputType,
  Conversation,
  ExtInput,
  Message,
  MessageRole,
  Provider,
  SourceType,
} from "@chat2poster/core-schema";
import { createConversation, createMessage } from "@chat2poster/core-schema";
import { v4 as uuidv4 } from "uuid";

/**
 * Configuration for creating an adapter
 */
export interface AdapterConfig {
  id: string;
  version: string;
  name: string;
}

/**
 * Options for creating a conversation
 */
export interface ConversationOptions {
  sourceType: SourceType;
  provider: Provider;
  adapterId: string;
  adapterVersion: string;
  shareUrl?: string;
}

/**
 * Raw message data before transformation
 */
export interface RawMessage {
  role: MessageRole;
  content: string;
}

/**
 * Generate a UUID v4
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Convert raw messages to Message schema
 */
export function buildMessages(rawMessages: RawMessage[]): Message[] {
  return rawMessages.map((raw, index) =>
    createMessage({
      id: generateId(),
      role: raw.role,
      contentMarkdown: raw.content,
      order: index,
      contentMeta: {
        containsCodeBlock: raw.content.includes("```"),
        containsImage:
          raw.content.includes("![") || raw.content.includes("<img"),
      },
    }),
  );
}

/**
 * Build a conversation from raw messages
 */
export function buildConversation(
  rawMessages: RawMessage[],
  options: ConversationOptions,
): Conversation {
  const messages = buildMessages(rawMessages);
  const now = new Date().toISOString();

  return createConversation({
    id: generateId(),
    sourceType: options.sourceType,
    messages,
    sourceMeta: {
      provider: options.provider,
      shareUrl: options.shareUrl,
      parsedAt: now,
      adapterId: options.adapterId,
      adapterVersion: options.adapterVersion,
    },
  });
}

/**
 * Abstract base for extension adapters
 */
export abstract class BaseExtAdapter implements Adapter {
  abstract readonly id: string;
  abstract readonly version: string;
  abstract readonly name: string;

  /**
   * Input types this adapter supports
   */
  readonly supportedInputTypes: readonly AdapterInputType[] = ["ext"];

  /**
   * URL patterns this adapter handles
   */
  abstract readonly urlPatterns: RegExp[];

  /**
   * Provider name for this adapter
   */
  abstract readonly provider: Provider;

  /**
   * Check if this adapter can handle the given input
   */
  canHandle(input: AdapterInput): boolean {
    if (input.type !== "ext") {
      return false;
    }

    return this.urlPatterns.some((pattern) => pattern.test(input.url));
  }

  /**
   * Parse the input into a Conversation
   */
  async parse(input: AdapterInput): Promise<Conversation> {
    if (input.type !== "ext") {
      throw new Error(`${this.name} only handles ext input`);
    }

    const rawMessages = await this.getRawMessages(input);
    return buildConversation(rawMessages, {
      sourceType: "extension-current",
      provider: this.provider,
      adapterId: this.id,
      adapterVersion: this.version,
    });
  }

  /**
   * Fetch or extract messages from the input
   * Subclasses must implement this
   */
  abstract getRawMessages(input: ExtInput): Promise<RawMessage[]>;
}

/**
 * Abstract base for share-link adapters
 */
export abstract class BaseShareLinkAdapter implements Adapter {
  abstract readonly id: string;
  abstract readonly version: string;
  abstract readonly name: string;

  /**
   * Input types this adapter supports
   */
  readonly supportedInputTypes: readonly AdapterInputType[] = ["share-link"];

  /**
   * URL patterns this adapter handles
   */
  abstract readonly urlPatterns: RegExp[];

  /**
   * Provider name for this adapter
   */
  abstract readonly provider: Provider;

  /**
   * Check if this adapter can handle the given input
   */
  canHandle(input: AdapterInput): boolean {
    if (input.type !== "share-link") {
      return false;
    }

    return this.urlPatterns.some((pattern) => pattern.test(input.url));
  }

  /**
   * Parse the input into a Conversation
   */
  async parse(input: AdapterInput): Promise<Conversation> {
    if (input.type !== "share-link") {
      throw new Error(`${this.name} only handles share-link input`);
    }

    const rawMessages = await this.fetchAndExtract(input.url);
    return buildConversation(rawMessages, {
      sourceType: "web-share-link",
      provider: this.provider,
      adapterId: this.id,
      adapterVersion: this.version,
      shareUrl: input.url,
    });
  }

  /**
   * Fetch share link and extract messages
   * Subclasses must implement this
   */
  abstract fetchAndExtract(url: string): Promise<RawMessage[]>;
}
