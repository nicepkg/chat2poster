/**
 * ChatGPT Share Link Constants
 *
 * Centralized constants to avoid magic strings throughout the codebase.
 */

/**
 * Content types used in ChatGPT message content
 */
export const ContentType = {
  TEXT: "text",
  CODE: "code",
  THOUGHTS: "thoughts",
  REASONING_RECAP: "reasoning_recap",
  MULTIMODAL_TEXT: "multimodal_text",
  TOOL_RESPONSE: "tool_response",
  MODEL_EDITABLE_CONTEXT: "model_editable_context",
  IMAGE_ASSET_POINTER: "image_asset_pointer",
} as const;

export type ContentTypeValue = (typeof ContentType)[keyof typeof ContentType];

/**
 * Message roles in ChatGPT conversations
 */
export const MessageRole = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
  TOOL: "tool",
} as const;

export type MessageRoleValue = (typeof MessageRole)[keyof typeof MessageRole];

/**
 * Asset pointer URL prefixes
 */
export const AssetPointerPrefix = {
  SEDIMENT: "sediment://",
  FILE_SERVICE: "file-service://",
} as const;

/**
 * ChatGPT API endpoints
 */
export const ApiEndpoint = {
  FILE_DOWNLOAD: "https://chatgpt.com/backend-anon/files/download",
} as const;
