/**
 * Tool Response Content Flattener
 *
 * Handles content_type: "tool_response"
 */

import { ContentType } from "../constants";
import { stripPrivateUse } from "../text-processor";
import type { MessageContent } from "../types";
import type { ContentFlattener, FlattenContext } from "./types";

export class ToolResponseFlattener implements ContentFlattener {
  readonly contentType = ContentType.TOOL_RESPONSE;

  canHandle(content: MessageContent): boolean {
    return content.content_type === ContentType.TOOL_RESPONSE;
  }

  async flatten(
    content: MessageContent,
    _context?: FlattenContext,
  ): Promise<string> {
    const output =
      typeof (content as Record<string, unknown>).output === "string"
        ? ((content as Record<string, unknown>).output as string)
        : "";
    return stripPrivateUse(output);
  }
}

export const toolResponseFlattener = new ToolResponseFlattener();
