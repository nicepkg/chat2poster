import type { Message } from "@chat2poster/core-schema";

/**
 * Configuration for height estimation
 */
export interface HeightEstimationConfig {
  /** Base height for message container (padding, margins, avatar) */
  baseMessageHeightPx: number;
  /** Height per line of text */
  lineHeightPx: number;
  /** Average characters per line */
  charsPerLine: number;
  /** Additional height per code block */
  codeBlockHeightPx: number;
  /** Height per line in code block */
  codeLineHeightPx: number;
  /** Average characters per code line */
  charsPerCodeLine: number;
  /** Height for an inline image */
  imageHeightPx: number;
  /** Minimum message height */
  minMessageHeightPx: number;
}

/**
 * Default height estimation configuration
 * Based on typical rendering with 16px base font
 */
export const DEFAULT_HEIGHT_CONFIG: HeightEstimationConfig = {
  baseMessageHeightPx: 48, // Padding + avatar space
  lineHeightPx: 24, // ~1.5x line-height at 16px
  charsPerLine: 60, // Typical characters per line at 1080px width
  codeBlockHeightPx: 32, // Code block header/padding
  codeLineHeightPx: 20, // Code uses smaller line-height
  charsPerCodeLine: 80, // Code lines are usually longer
  imageHeightPx: 300, // Default image height assumption
  minMessageHeightPx: 60, // Minimum height for any message
};

/**
 * Count code blocks in markdown content
 */
function countCodeBlocks(markdown: string): {
  count: number;
  totalLines: number;
} {
  const codeBlockRegex = /```[\s\S]*?```/g;
  const matches = markdown.match(codeBlockRegex) || [];
  let totalLines = 0;

  for (const match of matches) {
    // Count lines in each code block (excluding the ``` markers)
    const lines = match.split("\n").length - 2;
    totalLines += Math.max(lines, 1);
  }

  return { count: matches.length, totalLines };
}

/**
 * Count inline code segments (for slight height adjustment)
 */
function countInlineCode(markdown: string): number {
  // Match inline code but not code blocks
  const withoutBlocks = markdown.replace(/```[\s\S]*?```/g, "");
  const matches = withoutBlocks.match(/`[^`]+`/g) || [];
  return matches.length;
}

/**
 * Check if content contains images
 */
function countImages(markdown: string): number {
  // Match markdown image syntax: ![alt](url)
  const matches = markdown.match(/!\[[^\]]*\]\([^)]+\)/g) || [];
  return matches.length;
}

/**
 * Calculate text content (excluding code blocks)
 */
function getTextContent(markdown: string): string {
  // Remove code blocks
  let text = markdown.replace(/```[\s\S]*?```/g, "");
  // Remove inline code
  text = text.replace(/`[^`]+`/g, "");
  // Remove images
  text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, "");
  // Remove links but keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  return text;
}

/**
 * Estimate the height of a single message in pixels
 */
export function estimateMessageHeight(
  message: Message,
  config: HeightEstimationConfig = DEFAULT_HEIGHT_CONFIG,
): number {
  // If pre-computed height exists, use it
  if (message.contentMeta?.approxHeightPx) {
    return message.contentMeta.approxHeightPx;
  }

  const markdown = message.contentMarkdown;
  let height = config.baseMessageHeightPx;

  // Count code blocks and their lines
  const codeInfo = countCodeBlocks(markdown);
  if (codeInfo.count > 0) {
    height += codeInfo.count * config.codeBlockHeightPx;
    height += codeInfo.totalLines * config.codeLineHeightPx;
  }

  // Count images
  const imageCount = countImages(markdown);
  height += imageCount * config.imageHeightPx;

  // Calculate text lines (excluding code blocks)
  const textContent = getTextContent(markdown);
  const textChars = textContent.length;
  const textLines = Math.ceil(textChars / config.charsPerLine);
  height += textLines * config.lineHeightPx;

  // Add small adjustment for inline code (slight height increase)
  const inlineCodeCount = countInlineCode(markdown);
  height += inlineCodeCount * 2; // Small adjustment per inline code

  return Math.max(height, config.minMessageHeightPx);
}

/**
 * Estimate heights for multiple messages
 */
export function estimateMessagesHeight(
  messages: Message[],
  config: HeightEstimationConfig = DEFAULT_HEIGHT_CONFIG,
): number {
  return messages.reduce(
    (total, msg) => total + estimateMessageHeight(msg, config),
    0,
  );
}

/**
 * Estimate heights and return per-message breakdown
 */
export function estimateMessagesHeightWithBreakdown(
  messages: Message[],
  config: HeightEstimationConfig = DEFAULT_HEIGHT_CONFIG,
): Map<string, number> {
  const result = new Map<string, number>();
  for (const msg of messages) {
    result.set(msg.id, estimateMessageHeight(msg, config));
  }
  return result;
}

/**
 * Check if content meta needs updating
 */
export function analyzeContentMeta(markdown: string): {
  containsCodeBlock: boolean;
  containsImage: boolean;
} {
  const codeInfo = countCodeBlocks(markdown);
  const imageCount = countImages(markdown);

  return {
    containsCodeBlock: codeInfo.count > 0,
    containsImage: imageCount > 0,
  };
}
