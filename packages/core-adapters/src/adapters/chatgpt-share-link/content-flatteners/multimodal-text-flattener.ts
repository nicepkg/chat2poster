/**
 * Multimodal Text Content Flattener
 *
 * Handles content_type: "multimodal_text"
 * Supports text and image_asset_pointer parts.
 */

import { ApiEndpoint, AssetPointerPrefix, ContentType } from "../constants";
import { createScopedLogger } from "../logger";
import { stripPrivateUse } from "../text-processor";
import type { ImageAssetPointer, MessageContent } from "../types";
import type { ContentFlattener, FlattenContext } from "./types";

const logger = createScopedLogger("MultimodalFlattener");

/**
 * ChatGPT file download API response
 */
interface FileDownloadResponse {
  status: string;
  download_url?: string;
  file_name?: string;
  mime_type?: string;
}

/**
 * Build the ChatGPT backend-anon API URL for file download
 */
function buildFileApiUrl(
  fileId: string,
  conversationId?: string,
): string | null {
  if (!fileId) return null;

  if (conversationId) {
    return `${ApiEndpoint.FILE_DOWNLOAD}/${fileId}?shared_conversation_id=${conversationId}`;
  }
  return `${ApiEndpoint.FILE_DOWNLOAD}/${fileId}`;
}

/**
 * Fetch the actual download URL from ChatGPT's backend-anon API
 */
async function fetchDownloadUrl(
  apiUrl: string,
  cookies?: string,
): Promise<string | null> {
  try {
    logger.debug("Fetching download URL", apiUrl);

    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };

    if (cookies) {
      headers.Cookie = cookies;
    }

    const response = await fetch(apiUrl, { headers });
    logger.debug("Response status", response.status);

    if (!response.ok) {
      logger.debug("Response not ok");
      return null;
    }

    const data = (await response.json()) as FileDownloadResponse;
    logger.debug("Got download_url", data.download_url ? "yes" : "no");
    return data.download_url || null;
  } catch (err) {
    logger.debug("Error fetching download URL", err);
    return null;
  }
}

/**
 * Parse asset_pointer and resolve to image URL
 */
async function resolveAssetPointerToUrl(
  assetPointer: string,
  sharedConversationId?: string,
  cookies?: string,
): Promise<string | null> {
  if (!assetPointer) return null;

  let fileId: string | null = null;
  let conversationId = sharedConversationId;

  // Extract file ID from sediment:// format
  if (assetPointer.startsWith(AssetPointerPrefix.SEDIMENT)) {
    const withoutPrefix = assetPointer.replace(AssetPointerPrefix.SEDIMENT, "");
    const [id, queryString] = withoutPrefix.split("?");
    fileId = id || null;

    if (!conversationId && queryString) {
      const params = new URLSearchParams(queryString);
      conversationId = params.get("shared_conversation_id") ?? undefined;
    }
  }

  // Extract file ID from file-service:// format
  if (assetPointer.startsWith(AssetPointerPrefix.FILE_SERVICE)) {
    fileId = assetPointer.replace(AssetPointerPrefix.FILE_SERVICE, "");
  }

  if (!fileId) {
    logger.debug("No fileId found in asset pointer");
    return null;
  }

  const apiUrl = buildFileApiUrl(fileId, conversationId);
  if (!apiUrl) {
    logger.debug("Failed to build API URL");
    return null;
  }

  logger.debug("API URL", apiUrl);

  // Try to fetch the actual download URL
  const downloadUrl = await fetchDownloadUrl(apiUrl, cookies);

  // If fetch succeeded, return the download URL
  // If fetch failed (server-side without cookies), return the API URL as fallback
  const result = downloadUrl || apiUrl;
  logger.debug("Resolved URL", result ? "success" : "failed");
  return result;
}

/**
 * Check if a part is an image asset pointer
 */
function isImageAssetPointer(part: unknown): part is ImageAssetPointer {
  return (
    typeof part === "object" &&
    part !== null &&
    (part as Record<string, unknown>).content_type ===
      ContentType.IMAGE_ASSET_POINTER &&
    typeof (part as Record<string, unknown>).asset_pointer === "string"
  );
}

export class MultimodalTextFlattener implements ContentFlattener {
  readonly contentType = ContentType.MULTIMODAL_TEXT;

  canHandle(content: MessageContent): boolean {
    return content.content_type === ContentType.MULTIMODAL_TEXT;
  }

  async flatten(
    content: MessageContent,
    context?: FlattenContext,
  ): Promise<string> {
    const parts = content.parts ?? [];
    const segments: string[] = [];

    for (const part of parts) {
      if (typeof part === "string") {
        segments.push(stripPrivateUse(part));
        continue;
      }

      if (typeof part === "object" && part !== null) {
        // Handle image_asset_pointer
        if (isImageAssetPointer(part)) {
          const imageUrl = await resolveAssetPointerToUrl(
            part.asset_pointer,
            context?.sharedConversationId,
            context?.cookies,
          );
          if (imageUrl) {
            // Use DALL-E prompt as alt text if available
            const altText = part.metadata?.dalle?.prompt || "Generated image";
            segments.push(`![${altText}](${imageUrl})`);
          }
          continue;
        }

        const pType =
          (part as Record<string, unknown>).content_type ??
          (part as Record<string, unknown>).type;

        if (pType === ContentType.TEXT) {
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
        // Other non-text types are skipped
      }
    }

    return segments
      .map((s) => s.trim())
      .filter(Boolean)
      .join("\n\n");
  }
}

export const multimodalTextFlattener = new MultimodalTextFlattener();
