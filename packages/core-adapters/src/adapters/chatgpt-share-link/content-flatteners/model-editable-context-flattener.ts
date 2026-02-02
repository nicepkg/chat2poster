/**
 * Model Editable Context Content Flattener
 *
 * Handles content_type: "model_editable_context"
 */

import { ContentType } from "../constants";
import type { MessageContent } from "../types";
import type { ContentFlattener, FlattenContext } from "./types";

export class ModelEditableContextFlattener implements ContentFlattener {
  readonly contentType = ContentType.MODEL_EDITABLE_CONTEXT;

  canHandle(content: MessageContent): boolean {
    return content.content_type === ContentType.MODEL_EDITABLE_CONTEXT;
  }

  async flatten(
    content: MessageContent,
    _context?: FlattenContext,
  ): Promise<string> {
    const ctx = (content as Record<string, unknown>).model_set_context;
    return typeof ctx === "string" ? ctx.trim() : "";
  }
}

export const modelEditableContextFlattener =
  new ModelEditableContextFlattener();
