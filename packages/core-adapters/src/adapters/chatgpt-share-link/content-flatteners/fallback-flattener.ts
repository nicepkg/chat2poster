/**
 * Fallback Content Flattener
 *
 * Handles unknown content types by extracting text from parts array.
 */

import { stripPrivateUse } from "../text-processor";
import type { MessageContent } from "../types";
import type { ContentFlattener, FlattenContext } from "./types";

export class FallbackFlattener implements ContentFlattener {
  readonly contentType = "__fallback__";

  canHandle(_content: MessageContent): boolean {
    // Always returns true as this is the fallback handler
    return true;
  }

  async flatten(
    content: MessageContent,
    _context?: FlattenContext,
  ): Promise<string> {
    // Try to extract from parts
    if (content.parts) {
      const parts = content.parts
        .filter((p): p is string => typeof p === "string")
        .map((p) => stripPrivateUse(p));
      return parts.join("\n\n").trim();
    }

    return "";
  }
}

export const fallbackFlattener = new FallbackFlattener();
