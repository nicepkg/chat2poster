/**
 * @chat2poster/core-renderer
 *
 * React components for rendering chat conversations as exportable images.
 */

// Message components
export {
  MessageItem,
  type MessageItemProps,
  MessageAvatar,
  type MessageAvatarProps,
  CodeBlock,
  type CodeBlockProps,
} from "./components";

// Conversation components
export {
  ConversationView,
  type ConversationViewProps,
  ConversationHeader,
  type ConversationHeaderProps,
  PageBreakIndicator,
  type PageBreakIndicatorProps,
} from "./components";

// Decoration components
export {
  DecorationFrame,
  type DecorationFrameProps,
  MacOSBar,
  type MacOSBarProps,
  CanvasContainer,
  type CanvasContainerProps,
} from "./components";

// Preview components
export {
  PreviewPanel,
  type PreviewPanelProps,
  PageIndicator,
  type PageIndicatorProps,
} from "./components";

// Markdown components
export {
  MarkdownRenderer,
  type MarkdownRendererProps,
  MermaidBlock,
  type MermaidBlockProps,
} from "./components";

// Utils
export { initHighlighter, getHighlighter, highlightCode } from "./utils";

// Re-export schema types for convenience
export type {
  Message,
  MessageRole,
  Conversation,
  Selection,
  PageBreak,
  Decoration,
} from "@chat2poster/core-schema";

// Re-export theme types
export type { Theme } from "@chat2poster/themes";
export { applyThemeToElement, themeToCSSString, cssVar } from "@chat2poster/themes";
