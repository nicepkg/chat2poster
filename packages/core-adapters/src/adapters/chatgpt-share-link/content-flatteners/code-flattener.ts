/**
 * Code Content Flattener
 *
 * Handles content_type: "code"
 */

import { ContentType } from "../constants";
import type { MessageContent } from "../types";
import type { ContentFlattener, FlattenContext } from "./types";

export class CodeFlattener implements ContentFlattener {
  readonly contentType = ContentType.CODE;

  canHandle(content: MessageContent): boolean {
    return content.content_type === ContentType.CODE;
  }

  async flatten(
    content: MessageContent,
    _context?: FlattenContext,
  ): Promise<string> {
    const lang =
      content.language && content.language !== "unknown"
        ? content.language
        : "";
    let body = typeof content.text === "string" ? content.text.trimEnd() : "";

    if (body) {
      // Try to summarize tool payload
      try {
        const json = JSON.parse(body) as Record<string, unknown>;
        // Remove response_length and format nicely
        const cleaned = Object.fromEntries(
          Object.entries(json).filter(([k]) => k !== "response_length"),
        );
        if (Object.keys(cleaned).length > 0) {
          body = JSON.stringify(cleaned, null, 2);
        } else {
          return "";
        }
      } catch {
        // Not JSON, keep as is
      }
    }

    return body ? `\`\`\`${lang}\n${body}\n\`\`\`` : "";
  }
}

export const codeFlattener = new CodeFlattener();
