/**
 * Adapter Implementations
 *
 * All adapter implementations are exported from here.
 * Import individual adapters or use the registerBuiltinAdapters function.
 */

// Extension adapters (for browser extension)
export { ChatGPTExtAdapter, chatGPTExtAdapter } from "./chatgpt/ext-adapter";
export { ClaudeExtAdapter, claudeExtAdapter } from "./claude/ext-adapter";
export { GeminiExtAdapter, geminiExtAdapter } from "./gemini/ext-adapter";

// Share link adapters (for web app)
export {
  ChatGPTShareLinkAdapter,
  chatGPTShareLinkAdapter,
} from "./chatgpt/share-link-adapter";
export {
  ClaudeShareLinkAdapter,
  claudeShareLinkAdapter,
} from "./claude/share-link-adapter";
export {
  GeminiShareLinkAdapter,
  geminiShareLinkAdapter,
} from "./gemini/share-link-adapter";
