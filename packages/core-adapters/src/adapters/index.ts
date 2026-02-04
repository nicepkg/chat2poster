/**
 * Adapter Implementations
 *
 * All adapter implementations are exported from here.
 * Import individual adapters or use the registerBuiltinAdapters function.
 */

// Extension adapters (for browser extension)
export { ChatGPTExtAdapter, chatGPTExtAdapter } from "./chatgpt/ext-adapter";
export { ClaudeExtAdapter, claudeExtAdapter } from "./claude/ext-adapter";

// Share link adapters (for web app)
export {
  ChatGPTShareLinkAdapter,
  chatGPTShareLinkAdapter,
} from "./chatgpt/share-link-adapter";
export {
  GeminiShareLinkAdapter,
  geminiShareLinkAdapter,
} from "./gemini-share-link";
