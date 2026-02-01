import type { Theme } from "@chat2poster/core-schema";
import { lightTheme, darkTheme, sunsetTheme } from "./presets";

/**
 * Theme registry - stores all available themes
 */
const themeRegistry = new Map<string, Theme>();

/**
 * Register a theme
 */
export function registerTheme(theme: Theme): void {
  themeRegistry.set(theme.id, theme);
}

/**
 * Get a theme by ID
 */
export function getTheme(id: string): Theme | undefined {
  return themeRegistry.get(id);
}

/**
 * Get all registered themes
 */
export function getAllThemes(): Theme[] {
  return Array.from(themeRegistry.values());
}

/**
 * Get themes by mode
 */
export function getThemesByMode(mode: "light" | "dark"): Theme[] {
  return getAllThemes().filter((theme) => theme.mode === mode);
}

/**
 * Get the default theme
 */
export function getDefaultTheme(): Theme {
  return lightTheme;
}

// Register built-in themes
registerTheme(lightTheme);
registerTheme(darkTheme);
registerTheme(sunsetTheme);
