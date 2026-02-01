import type { Theme, ThemeTokens, ThemeColors } from "@chat2poster/core-schema";

/**
 * CSS variable prefix for theme tokens
 */
const CSS_VAR_PREFIX = "--c2p";

/**
 * Convert camelCase to kebab-case
 */
function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Generate CSS variables from theme colors
 */
function colorsToCSS(colors: ThemeColors): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(colors)) {
    result[`${CSS_VAR_PREFIX}-${toKebabCase(key)}`] = value;
  }
  return result;
}

/**
 * Generate CSS variables from theme tokens
 */
function tokensToCSS(tokens: ThemeTokens): Record<string, string> {
  const result: Record<string, string> = {
    [`${CSS_VAR_PREFIX}-font-family`]: tokens.fontFamily,
    [`${CSS_VAR_PREFIX}-font-size`]: `${tokens.baseFontSize}px`,
    [`${CSS_VAR_PREFIX}-line-height`]: String(tokens.lineHeight),
    [`${CSS_VAR_PREFIX}-bubble-radius`]: `${tokens.bubbleRadius}px`,
    [`${CSS_VAR_PREFIX}-message-padding`]: `${tokens.messagePadding}px`,
    [`${CSS_VAR_PREFIX}-message-gap`]: `${tokens.messageGap}px`,
    [`${CSS_VAR_PREFIX}-code-theme`]: tokens.codeTheme,
    ...colorsToCSS(tokens.colors),
  };
  return result;
}

/**
 * Generate CSS variables from a theme
 */
export function themeToCSS(theme: Theme): Record<string, string> {
  return {
    [`${CSS_VAR_PREFIX}-theme-id`]: theme.id,
    [`${CSS_VAR_PREFIX}-theme-mode`]: theme.mode,
    ...tokensToCSS(theme.tokens),
  };
}

/**
 * Generate CSS string from a theme (for injection into style tags)
 */
export function themeToCSSString(theme: Theme, selector = ":root"): string {
  const vars = themeToCSS(theme);
  const declarations = Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
  return `${selector} {\n${declarations}\n}`;
}

/**
 * Apply theme CSS variables to an element
 */
export function applyThemeToElement(theme: Theme, element: HTMLElement): void {
  const vars = themeToCSS(theme);
  for (const [key, value] of Object.entries(vars)) {
    element.style.setProperty(key, value);
  }
}

/**
 * Create a style element with theme CSS variables
 */
export function createThemeStyleElement(
  theme: Theme,
  selector = ":host",
): HTMLStyleElement {
  const style = document.createElement("style");
  style.textContent = themeToCSSString(theme, selector);
  style.setAttribute("data-theme-id", theme.id);
  return style;
}

/**
 * Get CSS variable value helper
 * Use in CSS: var(--c2p-background)
 */
export function cssVar(name: string): string {
  return `var(${CSS_VAR_PREFIX}-${toKebabCase(name)})`;
}

/**
 * Export the prefix for external use
 */
export const CSS_VARIABLE_PREFIX = CSS_VAR_PREFIX;
