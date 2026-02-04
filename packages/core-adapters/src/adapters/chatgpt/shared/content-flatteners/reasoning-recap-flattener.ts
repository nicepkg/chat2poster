/**
 * Reasoning Recap Content Flattener
 *
 * Handles content_type: "reasoning_recap"
 */

import { ContentType } from "../constants";
import type { MessageContent } from "../types";
import type { ContentFlattener, FlattenContext } from "./types";

export class ReasoningRecapFlattener implements ContentFlattener {
  readonly contentType = ContentType.REASONING_RECAP;

  canHandle(content: MessageContent): boolean {
    return content.content_type === ContentType.REASONING_RECAP;
  }

  async flatten(
    content: MessageContent,
    _context?: FlattenContext,
  ): Promise<string> {
    const recap = typeof content.text === "string" ? content.text.trim() : "";
    return recap ? `_${recap}_` : "";
  }
}

export const reasoningRecapFlattener = new ReasoningRecapFlattener();
