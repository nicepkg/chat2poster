/**
 * Adapter Implementations
 *
 * All adapter implementations are exported from here.
 * Import individual adapters or use the registerBuiltinAdapters function.
 */

// Extension adapters (for browser extension)
export { ChatGPTExtAdapter, chatGPTExtAdapter } from "./chatgpt/ext-adapter";

// Share link adapters (for web app)
export {
  ChatGPTShareLinkAdapter,
  chatGPTShareLinkAdapter,
} from "./chatgpt/share-link-adapter";
export {
  ClaudeShareLinkAdapter,
  claudeShareLinkAdapter,
} from "./claude-share-link";
export {
  GeminiShareLinkAdapter,
  geminiShareLinkAdapter,
} from "./gemini-share-link";

// Future adapters:
// export { ClaudeDOMAdapter, claudeDOMAdapter } from './claude-dom';
// export { GeminiDOMAdapter, geminiDOMAdapter } from './gemini-dom';
// export { ManualInputAdapter, manualInputAdapter } from './manual-input';
// export { PasteTextAdapter, pasteTextAdapter } from './paste-text';
