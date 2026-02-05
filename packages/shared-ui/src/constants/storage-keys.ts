/**
 * Centralized storage keys to prevent hardcoded strings scattered across the codebase.
 * ALL sessionStorage/localStorage keys MUST be defined here.
 *
 * @example
 * // Good - import from constants
 * import { STORAGE_KEYS } from "@chat2poster/shared-ui";
 * sessionStorage.getItem(STORAGE_KEYS.CONVERSATION);
 *
 * // Bad - hardcoded string (will be caught in code review)
 * sessionStorage.getItem("chat2poster:conversation");
 */
export const STORAGE_KEYS = {
  /** User preferences (theme, decoration, export params) - persisted to localStorage */
  PREFERENCES: "chat2poster:preferences",

  /** Parsed conversation data from share link import - stored in sessionStorage */
  CONVERSATION: "chat2poster:conversation",

  /** Manual message builder data - stored in sessionStorage */
  MANUAL_MESSAGES: "chat2poster:manual-messages",

  /** Extension floating button position - stored in localStorage */
  EXT_FLOATING_BUTTON_POSITION: "chat2poster:ext-floating-button-position",
} as const;

/** Type for storage key values */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
