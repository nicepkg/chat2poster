import type { Theme, ThemeMode } from "@chat2poster/core-schema";
import { lightTheme, darkTheme, sunsetTheme } from "./presets";

/**
 * Theme registry interface
 */
export interface ThemeRegistry {
  register: (theme: Theme) => void;
  get: (id: string) => Theme | undefined;
  getAll: () => Theme[];
  getByMode: (mode: ThemeMode) => Theme[];
  getDefault: () => Theme;
}

/**
 * Create a new theme registry instance
 * @param initialThemes - Optional array of themes to register initially
 */
export function createThemeRegistry(
  initialThemes: Theme[] = [],
): ThemeRegistry {
  const registry = new Map<string, Theme>();
  initialThemes.forEach((t) => registry.set(t.id, t));

  return {
    register: (theme: Theme) => {
      registry.set(theme.id, theme);
    },
    get: (id: string) => registry.get(id),
    getAll: () => Array.from(registry.values()),
    getByMode: (mode: ThemeMode) =>
      Array.from(registry.values()).filter((t) => t.mode === mode),
    getDefault: (): Theme => {
      const light = registry.get("light");
      if (light) return light;
      const themes = Array.from(registry.values());
      // Return first theme or fallback to lightTheme
      return themes[0] ?? lightTheme;
    },
  };
}

// Create default registry with built-in themes
const defaultRegistry = createThemeRegistry([
  lightTheme,
  darkTheme,
  sunsetTheme,
]);

/**
 * Register a theme
 */
export const registerTheme = defaultRegistry.register;

/**
 * Get a theme by ID
 */
export const getTheme = defaultRegistry.get;

/**
 * Get all registered themes
 */
export const getAllThemes = defaultRegistry.getAll;

/**
 * Get themes by mode
 */
export const getThemesByMode = defaultRegistry.getByMode;

/**
 * Get the default theme
 */
export const getDefaultTheme = defaultRegistry.getDefault;
