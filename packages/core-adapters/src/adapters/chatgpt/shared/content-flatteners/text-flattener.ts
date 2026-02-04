/**
 * Text Content Flattener
 *
 * Handles content_type: "text"
 */

import { ContentType } from "../constants";
import { stripPrivateUse } from "../text-processor";
import type { MessageContent } from "../types";
import type { ContentFlattener, FlattenContext } from "./types";

export class TextFlattener implements ContentFlattener {
  readonly contentType = ContentType.TEXT;

  canHandle(content: MessageContent): boolean {
    return content.content_type === ContentType.TEXT;
  }

  async flatten(
    content: MessageContent,
    _context?: FlattenContext,
  ): Promise<string> {
    const parts = content.parts ?? [];
    const textParts: string[] = [];

    for (const part of parts) {
      if (typeof part !== "string") continue;

      let cleaned = stripPrivateUse(part).trim();

      // Try to parse JSON response
      if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
        try {
          const json = JSON.parse(cleaned) as Record<string, unknown>;
          if (typeof json.response === "string") {
            cleaned = json.response;
          } else if (typeof json.content === "string") {
            cleaned = json.content;
          }
        } catch {
          // Keep original
        }
      }

      if (cleaned) {
        textParts.push(cleaned);
      }
    }

    if (textParts.length === 0 && typeof content.text === "string") {
      const cleaned = stripPrivateUse(content.text).trim();
      if (cleaned) {
        textParts.push(cleaned);
      }
    }

    return textParts.join("\n\n");
  }
}

export const textFlattener = new TextFlattener();
