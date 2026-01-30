/**
 * @chat2poster/themes
 *
 * Theme presets and utilities for chat2poster.
 */

// Presets
export { lightTheme, darkTheme } from "./presets";

// Registry
export {
  registerTheme,
  getTheme,
  getAllThemes,
  getThemesByMode,
  getDefaultTheme,
} from "./registry";

// CSS utilities
export {
  themeToCSS,
  themeToCSSString,
  applyThemeToElement,
  createThemeStyleElement,
  cssVar,
  CSS_VARIABLE_PREFIX,
} from "./css-variables";

// Re-export schema types for convenience
export type {
  Theme,
  ThemeMode,
  ThemeTokens,
  ThemeColors,
  Decoration,
  DecorationDefaults,
  ShadowLevel,
  BackgroundType,
} from "@chat2poster/core-schema";
