export const CHAT2POSTER_COMPONENT_NAME = "chat2poster-panel";

export const EXTENSION_RUNTIME_MESSAGE = {
  TOGGLE_PANEL: "chat2poster:toggle-panel",
  OPEN_PANEL: "chat2poster:open-panel",
  CLOSE_PANEL: "chat2poster:close-panel",
} as const;

export const EXTENSION_WINDOW_EVENT = {
  TOGGLE_PANEL: "chat2poster:toggle-panel",
  OPEN_PANEL: "chat2poster:open-panel",
  CLOSE_PANEL: "chat2poster:close-panel",
} as const;

export const SUPPORTED_HOST_PATTERNS = [
  /^https:\/\/chatgpt\.com\//i,
  /^https:\/\/chat\.openai\.com\//i,
  /^https:\/\/claude\.ai\//i,
  /^https:\/\/gemini\.google\.com\//i,
] as const;

export type ExtensionRuntimeMessageType =
  (typeof EXTENSION_RUNTIME_MESSAGE)[keyof typeof EXTENSION_RUNTIME_MESSAGE];

export function isSupportedTabUrl(url?: string): boolean {
  if (!url) return false;
  return SUPPORTED_HOST_PATTERNS.some((pattern) => pattern.test(url));
}
