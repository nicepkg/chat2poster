/**
 * Content Flattener
 *
 * Extracts and flattens message content from various ChatGPT content types.
 */

import { stripPrivateUse } from "./text-processor";
import type { MessageContent } from "./types";

/**
 * Flatten message content into a string based on content type
 */
export function flattenMessageContent(content: MessageContent): string {
  const contentType = content.content_type;

  // Text content
  if (contentType === "text") {
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

    return textParts.join("\n\n");
  }

  // Code content
  if (contentType === "code") {
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

  // Thoughts content
  if (contentType === "thoughts") {
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

  // Reasoning recap
  if (contentType === "reasoning_recap") {
    const recap = typeof content.text === "string" ? content.text.trim() : "";
    return recap ? `_${recap}_` : "";
  }

  // Multimodal text
  if (contentType === "multimodal_text") {
    const parts = content.parts ?? [];
    const segments: string[] = [];

    for (const part of parts) {
      if (typeof part === "string") {
        segments.push(stripPrivateUse(part));
        continue;
      }

      if (typeof part === "object" && part !== null) {
        const pType =
          (part as Record<string, unknown>).content_type ??
          (part as Record<string, unknown>).type;

        if (pType === "text") {
          const texts = (part as Record<string, unknown>).text;
          if (Array.isArray(texts)) {
            segments.push(
              ...texts
                .filter((t): t is string => typeof t === "string")
                .map(stripPrivateUse),
            );
          } else if (typeof texts === "string") {
            segments.push(stripPrivateUse(texts));
          }
        }
        // Skip image_asset_pointer and file types (not downloadable server-side)
      }
    }

    return segments
      .map((s) => s.trim())
      .filter(Boolean)
      .join("\n\n");
  }

  // Tool response
  if (contentType === "tool_response") {
    const output =
      typeof (content as Record<string, unknown>).output === "string"
        ? ((content as Record<string, unknown>).output as string)
        : "";
    return stripPrivateUse(output);
  }

  // Model editable context
  if (contentType === "model_editable_context") {
    const context = (content as Record<string, unknown>).model_set_context;
    return typeof context === "string" ? context.trim() : "";
  }

  // Fallback: try to extract from parts
  if (content.parts) {
    const parts = content.parts
      .filter((p): p is string => typeof p === "string")
      .map((p) => stripPrivateUse(p));
    return parts.join("\n\n").trim();
  }

  return "";
}
