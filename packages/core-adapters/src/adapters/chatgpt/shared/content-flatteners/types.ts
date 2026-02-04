/**
 * Content Flattener Types
 *
 * Interfaces for the content flattener strategy pattern.
 */

import type { MessageContent } from "../types";

/**
 * Context for content flattening
 */
export interface FlattenContext {
  /** Shared conversation ID for constructing image URLs */
  sharedConversationId?: string;
  /** Cookies from the share link page for authenticated API requests */
  cookies?: string;
}

/**
 * Content flattener interface
 *
 * Each flattener handles a specific content_type from ChatGPT messages.
 */
export interface ContentFlattener {
  /** The content type this flattener handles */
  readonly contentType: string;

  /**
   * Check if this flattener can handle the given content
   */
  canHandle(content: MessageContent): boolean;

  /**
   * Flatten the content into a string
   */
  flatten(content: MessageContent, context?: FlattenContext): Promise<string>;
}

/**
 * Content flattener registry type
 */
export type ContentFlattenerRegistry = Map<string, ContentFlattener>;
