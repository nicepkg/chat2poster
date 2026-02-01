/**
 * Theme presets and utilities
 */

// Presets
export { lightTheme, darkTheme, sunsetTheme, THEME_PRESETS } from "./presets";

// Backgrounds
export { BACKGROUND_PRESETS, type BackgroundPreset } from "./backgrounds";

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

// Shadows
export {
  SHADOW_STYLES,
  GLOW_STYLES,
  getShadowStyle,
  getGlowStyle,
  type GlowType,
} from "./shadows";

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
