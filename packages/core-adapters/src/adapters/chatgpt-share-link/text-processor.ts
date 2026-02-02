/**
 * ChatGPT Share Link Text Processor
 *
 * Utilities for cleaning and processing text content from ChatGPT messages.
 */

/** Pattern to match Unicode private use area characters */
const PRIVATE_USE_PATTERN = /[\uE000-\uF8FF]/g;

/** Pattern to match citation tokens */
const CITATION_TOKEN_PATTERN = /\s*(?:citeturn|navlist|turn\d+\w*)[^,\s]*,?/g;

/**
 * Strip private use Unicode characters
 */
export function stripPrivateUse(text: string): string {
  return text.replace(PRIVATE_USE_PATTERN, "");
}

/**
 * Strip citation tokens from text
 */
export function stripCitationTokens(text: string): string {
  if (!text) return text;
  return text
    .split("\n")
    .map((line) => line.replace(CITATION_TOKEN_PATTERN, "").trimEnd())
    .join("\n");
}
