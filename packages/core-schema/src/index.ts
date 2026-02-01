/**
 * @chat2poster/core-schema
 *
 * Core types, schemas, and validators for chat2poster.
 * This package defines the contract for all other packages.
 */

// Message types
export { MessageRole, ContentMeta, Message, createMessage } from "./message";

// Conversation types
export {
  SourceType,
  Provider,
  SourceMeta,
  Conversation,
  createConversation,
} from "./conversation";

// Selection types
export {
  PageBreak,
  Selection,
  createSelection,
  createFullSelection,
} from "./selection";

// Theme types
export {
  ThemeMode,
  ThemeColors,
  ThemeTokens,
  BackgroundType,
  ShadowLevel,
  DecorationDefaults,
  Theme,
  Decoration,
  createDecorationFromTheme,
} from "./theme";

// Export types
export {
  DeviceType,
  DEVICE_WIDTHS,
  EXPORT_DEFAULTS,
  ExportFormat,
  ExportScale,
  OutputMode,
  ExportParams,
  ExportJobStatus,
  PaginationResult,
  ExportError,
  ExportJob,
  createExportJob,
  getDesktopWidth,
} from "./export";

// Adapter types
export {
  AdapterInputType,
  DOMInput,
  ShareLinkInput,
  ManualInput,
  PasteTextInput,
  AdapterInput,
  AdapterMeta,
} from "./adapter";
export type { Adapter } from "./adapter";

// Error types
export {
  ParseErrorCode,
  ExportErrorCode,
  ErrorCode,
  AppError,
  ERROR_MESSAGES,
  createAppError,
  isParseError,
  isExportError,
} from "./errors";
