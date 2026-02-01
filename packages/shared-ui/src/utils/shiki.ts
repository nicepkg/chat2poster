import {
  createHighlighter,
  type Highlighter,
  type BundledLanguage,
  type BundledTheme,
} from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;
let highlighter: Highlighter | null = null;

/**
 * Common languages to pre-load for better performance
 */
const COMMON_LANGUAGES: BundledLanguage[] = [
  "javascript",
  "typescript",
  "jsx",
  "tsx",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "rust",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "sql",
  "html",
  "css",
  "json",
  "yaml",
  "markdown",
  "bash",
  "shell",
];

/**
 * Default themes to pre-load
 */
const DEFAULT_THEMES: BundledTheme[] = ["github-dark", "github-light"];

/**
 * Initialize the Shiki highlighter
 */
export async function initHighlighter(): Promise<Highlighter> {
  if (highlighter) {
    return highlighter;
  }

  if (highlighterPromise) {
    return highlighterPromise;
  }

  highlighterPromise = createHighlighter({
    themes: DEFAULT_THEMES,
    langs: COMMON_LANGUAGES,
  });

  highlighter = await highlighterPromise;
  return highlighter;
}

/**
 * Get the current highlighter instance (must call initHighlighter first)
 */
export function getHighlighter(): Highlighter | null {
  return highlighter;
}

/**
 * Highlight code with Shiki
 */
export async function highlightCode(
  code: string,
  language: string,
  theme: BundledTheme = "github-dark",
): Promise<string> {
  const hl = await initHighlighter();

  // Normalize language name
  const lang = normalizeLanguage(language);

  // Check if language is loaded
  const loadedLangs = hl.getLoadedLanguages();
  if (!loadedLangs.includes(lang as BundledLanguage)) {
    // Try to load the language dynamically
    try {
      await hl.loadLanguage(lang as BundledLanguage);
    } catch {
      // Fall back to plaintext if language is not supported
      return hl.codeToHtml(code, { lang: "text", theme });
    }
  }

  return hl.codeToHtml(code, { lang, theme });
}

/**
 * Synchronously highlight code (returns plain text if highlighter not ready)
 */
export function highlightCodeSync(
  code: string,
  language: string,
  theme: BundledTheme = "github-dark",
): string {
  if (!highlighter) {
    return escapeHtml(code);
  }

  const lang = normalizeLanguage(language);
  const loadedLangs = highlighter.getLoadedLanguages();

  if (!loadedLangs.includes(lang as BundledLanguage)) {
    return highlighter.codeToHtml(code, { lang: "text", theme });
  }

  return highlighter.codeToHtml(code, { lang, theme });
}

/**
 * Normalize language aliases
 */
function normalizeLanguage(lang: string): string {
  const normalized = lang.toLowerCase().trim();

  const aliases: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    rb: "ruby",
    cs: "csharp",
    "c++": "cpp",
    "c#": "csharp",
    sh: "bash",
    zsh: "bash",
    yml: "yaml",
    md: "markdown",
    plaintext: "text",
    plain: "text",
    "": "text",
  };

  return aliases[normalized] ?? normalized;
}

/**
 * Escape HTML for fallback rendering
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
