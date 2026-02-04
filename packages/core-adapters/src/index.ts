/**
 * @chat2poster/core-adapters
 *
 * Adapter registry and implementations for parsing conversations.
 * Provides a plugin-style architecture where new adapters can be added
 * without modifying existing code.
 *
 * Usage:
 * ```typescript
 * import {
 *   registerAdapter,
 *   parseWithAdapters,
 *   chatGPTExtAdapter,
 *   registerBuiltinAdapters,
 * } from '@chat2poster/core-adapters';
 *
 * // Register all built-in adapters
 * registerBuiltinAdapters();
 *
 * // Or register individual adapters
 * registerAdapter(chatGPTExtAdapter);
 *
 * // Parse input
 * const result = await parseWithAdapters({
 *   type: 'ext',
 *   document: document,
 *   url: 'https://chat.openai.com/c/xxx',
 * });
 * ```
 */

// Internal imports for registerBuiltinAdapters
import {
  chatGPTExtAdapter as _chatGPTExtAdapter,
  claudeExtAdapter as _claudeExtAdapter,
  chatGPTShareLinkAdapter as _chatGPTShareLinkAdapter,
  claudeShareLinkAdapter as _claudeShareLinkAdapter,
  geminiShareLinkAdapter as _geminiShareLinkAdapter,
} from "./adapters";
import {
  registerAdapter as _registerAdapter,
  getAdapter as _getAdapter,
} from "./registry";

// Registry functions
export {
  registerAdapter,
  unregisterAdapter,
  getAdapters,
  getAdapter,
  getAdaptersMeta,
  parseWithAdapters,
  clearAdapters,
  findAdapterForUrl,
  canHandleShareLink,
} from "./registry";
export type { ParseResult } from "./registry";

// Base classes and utilities
export {
  BaseExtAdapter,
  BaseShareLinkAdapter,
  buildMessages,
  buildConversation,
  generateId,
} from "./base";
export type { AdapterConfig, ConversationOptions, RawMessage } from "./base";

// Network utilities
export {
  generateChromeUserAgent,
  generateFirefoxUserAgent,
  getRealUserHeaders,
  getRequestHeaders,
  getHtmlHeaders,
  getJsonHeaders,
  getApiHeaders,
  getSameOriginHeaders,
  fetchExternal,
  fetchHtml,
  fetchJson,
  isUrlReachable,
  getRedirectUrl,
} from "./network";
export type {
  HeaderPreset,
  HeaderOptions,
  FetchOptions,
  FetchResult,
} from "./network";

// Adapter implementations
export {
  // Extension adapters
  ChatGPTExtAdapter,
  chatGPTExtAdapter,
  ClaudeExtAdapter,
  claudeExtAdapter,
  // Share link adapters
  ChatGPTShareLinkAdapter,
  chatGPTShareLinkAdapter,
  ClaudeShareLinkAdapter,
  claudeShareLinkAdapter,
  GeminiShareLinkAdapter,
  geminiShareLinkAdapter,
} from "./adapters";

/**
 * Register all built-in adapters with the registry
 *
 * Call this function once at application startup to enable
 * all built-in adapter implementations.
 *
 * ```typescript
 * import { registerBuiltinAdapters } from '@chat2poster/core-adapters';
 *
 * // In your app initialization
 * registerBuiltinAdapters();
 * ```
 */
export function registerBuiltinAdapters(): void {
  // Extension adapters
  if (!_getAdapter(_chatGPTExtAdapter.id)) {
    _registerAdapter(_chatGPTExtAdapter);
  }
  if (!_getAdapter(_claudeExtAdapter.id)) {
    _registerAdapter(_claudeExtAdapter);
  }

  // Share link adapters
  if (!_getAdapter(_chatGPTShareLinkAdapter.id)) {
    _registerAdapter(_chatGPTShareLinkAdapter);
  }
  if (!_getAdapter(_claudeShareLinkAdapter.id)) {
    _registerAdapter(_claudeShareLinkAdapter);
  }

  if (!_getAdapter(_geminiShareLinkAdapter.id)) {
    _registerAdapter(_geminiShareLinkAdapter);
  }

  // Future adapters will be registered here:
  // if (!_getAdapter(claudeDOMAdapter.id)) {
  //   _registerAdapter(claudeDOMAdapter);
  // }
}
