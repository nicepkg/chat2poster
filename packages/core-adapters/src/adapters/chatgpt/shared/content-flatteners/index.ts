/**
 * Content Flatteners Registry
 *
 * Registers all content flatteners and provides the main flattenMessageContent function.
 */

import type { MessageContent } from "../types";
import { codeFlattener } from "./code-flattener";
import { fallbackFlattener } from "./fallback-flattener";
import { modelEditableContextFlattener } from "./model-editable-context-flattener";
import { multimodalTextFlattener } from "./multimodal-text-flattener";
import { reasoningRecapFlattener } from "./reasoning-recap-flattener";
import { textFlattener } from "./text-flattener";
import { thoughtsFlattener } from "./thoughts-flattener";
import { toolResponseFlattener } from "./tool-response-flattener";
import type {
  ContentFlattener,
  ContentFlattenerRegistry,
  FlattenContext,
} from "./types";

// Re-export types
export type { ContentFlattener, ContentFlattenerRegistry, FlattenContext };

/**
 * Registry of content flatteners by content type
 */
const registry: ContentFlattenerRegistry = new Map();

/**
 * Register a content flattener
 */
export function registerContentFlattener(flattener: ContentFlattener): void {
  registry.set(flattener.contentType, flattener);
}

/**
 * Unregister a content flattener
 */
export function unregisterContentFlattener(contentType: string): boolean {
  return registry.delete(contentType);
}

/**
 * Get a registered content flattener
 */
export function getContentFlattener(
  contentType: string,
): ContentFlattener | undefined {
  return registry.get(contentType);
}

/**
 * Get all registered content flatteners
 */
export function getAllContentFlatteners(): ContentFlattener[] {
  return Array.from(registry.values());
}

// Register default flatteners
registerContentFlattener(textFlattener);
registerContentFlattener(codeFlattener);
registerContentFlattener(thoughtsFlattener);
registerContentFlattener(reasoningRecapFlattener);
registerContentFlattener(multimodalTextFlattener);
registerContentFlattener(toolResponseFlattener);
registerContentFlattener(modelEditableContextFlattener);

/**
 * Flatten message content into a string based on content type
 *
 * This function is async because it may need to fetch actual image URLs
 * from ChatGPT's API when processing image_asset_pointer content.
 */
export async function flattenMessageContent(
  content: MessageContent,
  context?: FlattenContext,
): Promise<string> {
  const contentType = content.content_type;

  // Try to find a registered flattener for this content type
  if (contentType) {
    const flattener = registry.get(contentType);
    if (flattener?.canHandle(content)) {
      return flattener.flatten(content, context);
    }
  }

  // Fall back to the fallback flattener
  return fallbackFlattener.flatten(content, context);
}
