import type { Theme } from "@chat2poster/core-schema";

export { lightTheme } from "./light";
export { darkTheme } from "./dark";
export { sunsetTheme } from "./sunset";

// Re-import for array construction
import { lightTheme } from "./light";
import { darkTheme } from "./dark";
import { sunsetTheme } from "./sunset";

/**
 * All built-in theme presets
 * Single source of truth for theme definitions
 */
export const THEME_PRESETS: Theme[] = [lightTheme, darkTheme, sunsetTheme];
