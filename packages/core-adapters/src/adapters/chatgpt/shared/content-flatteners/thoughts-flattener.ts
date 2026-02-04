/**
 * Thoughts Content Flattener
 *
 * Handles content_type: "thoughts"
 */

import { ContentType } from "../constants";
import type { MessageContent } from "../types";
import type { ContentFlattener, FlattenContext } from "./types";

export class ThoughtsFlattener implements ContentFlattener {
  readonly contentType = ContentType.THOUGHTS;

  canHandle(content: MessageContent): boolean {
    return content.content_type === ContentType.THOUGHTS;
  }

  async flatten(
    content: MessageContent,
    _context?: FlattenContext,
  ): Promise<string> {
    const thoughts = content.thoughts ?? [];
    const parts: string[] = [];

    for (const thought of thoughts) {
      const summary = thought.summary ?? "";
      const detail = thought.content ?? "";
      const combined = [summary, detail].filter(Boolean).join(": ");
      if (combined) {
        parts.push(`_${combined}_`);
      }
    }

    return parts.join("\n\n");
  }
}

export const thoughtsFlattener = new ThoughtsFlattener();
