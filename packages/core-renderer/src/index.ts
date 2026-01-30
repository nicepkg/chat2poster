/**
 * @chat2poster/core-renderer
 *
 * React components for rendering chat conversations as exportable images.
 */

// Components
export {
  MessageItem,
  type MessageItemProps,
  MessageAvatar,
  type MessageAvatarProps,
  CodeBlock,
  type CodeBlockProps,
} from "./components";

// Utils
export { initHighlighter, getHighlighter, highlightCode } from "./utils";

// Re-export schema types for convenience
export type {
  Message,
  MessageRole,
  Conversation,
  Selection,
} from "@chat2poster/core-schema";

// Re-export theme types
export type { Theme, Decoration } from "@chat2poster/themes";
