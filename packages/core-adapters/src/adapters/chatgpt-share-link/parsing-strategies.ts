/**
 * Parsing Strategies
 *
 * Different strategies for parsing ChatGPT share link HTML content.
 * Each strategy extracts ShareData, then delegates to message-converter.
 */

import type { RawMessage } from "../../base";
import { createScopedLogger } from "./logger";
import { convertShareDataToMessages } from "./message-converter";
import { decodeLoader, extractLoaderPayload } from "./react-flight-decoder";
import type { ShareData } from "./types";

const logger = createScopedLogger("ParsingStrategies");

/**
 * Extract share data from modern format (React Flight)
 *
 * @returns The share data and shared conversation ID, or null if not found
 */
function extractModernShareData(
  html: string,
): { data: ShareData; sharedConversationId?: string } | null {
  const loader = extractLoaderPayload(html);
  if (!loader) {
    return null;
  }

  const decoded = decodeLoader(loader);
  const route = decoded.loaderData?.["routes/share.$shareId.($action)"];
  const data = route?.serverResponse?.data;
  const sharedConversationId = route?.sharedConversationId;

  if (!data?.mapping) {
    return null;
  }

  return { data, sharedConversationId };
}

/**
 * Extract share data from legacy format (__NEXT_DATA__)
 *
 * @returns The share data and shared conversation ID, or null if not found
 */
function extractLegacyShareData(
  html: string,
): { data: ShareData; sharedConversationId?: string } | null {
  const match = /<script id="__NEXT_DATA__"[^>]*>([^<]+)<\/script>/.exec(html);
  if (!match?.[1]) {
    return null;
  }

  try {
    const payload = JSON.parse(match[1]) as {
      props?: {
        pageProps?: {
          serverResponse?: {
            data?: ShareData;
            sharedConversationId?: string;
          };
          sharedConversationId?: string;
        };
      };
    };

    const pageProps = payload.props?.pageProps;
    const data = pageProps?.serverResponse?.data;
    const sharedConversationId =
      pageProps?.serverResponse?.sharedConversationId ||
      pageProps?.sharedConversationId;

    if (!data) {
      return null;
    }

    return { data, sharedConversationId };
  } catch {
    return null;
  }
}

/**
 * Parse modern share format (React Flight)
 */
export async function parseModernShare(
  html: string,
  cookies?: string,
): Promise<RawMessage[]> {
  const extracted = extractModernShareData(html);
  if (!extracted) {
    throw new Error("Modern share payload not found");
  }

  const { data, sharedConversationId } = extracted;

  if (!data.mapping) {
    throw new Error("No conversation mapping found");
  }

  logger.debug(
    "Extracted modern share data",
    sharedConversationId ? "with ID" : "without ID",
  );

  return convertShareDataToMessages(data, sharedConversationId, cookies);
}

/**
 * Parse legacy share format (__NEXT_DATA__)
 */
export async function parseLegacyShare(
  html: string,
  cookies?: string,
): Promise<RawMessage[]> {
  const extracted = extractLegacyShareData(html);
  if (!extracted) {
    throw new Error("Legacy share payload not found");
  }

  const { data, sharedConversationId } = extracted;

  if (!data) {
    throw new Error("No conversation data found");
  }

  logger.debug(
    "Extracted legacy share data",
    sharedConversationId ? "with ID" : "without ID",
  );

  return convertShareDataToMessages(data, sharedConversationId, cookies);
}

/**
 * Parse share HTML using best available strategy
 */
export async function parseShareHtml(
  html: string,
  cookies?: string,
): Promise<RawMessage[]> {
  // Try modern format first
  try {
    const messages = await parseModernShare(html, cookies);
    if (messages.length > 0) {
      logger.debug("Parsed using modern strategy", messages.length);
      return messages;
    }
  } catch {
    // Fall through to legacy
  }

  // Try legacy format
  try {
    const messages = await parseLegacyShare(html, cookies);
    if (messages.length > 0) {
      logger.debug("Parsed using legacy strategy", messages.length);
      return messages;
    }
  } catch {
    // Fall through
  }

  logger.debug("No messages extracted from either strategy");
  return [];
}
