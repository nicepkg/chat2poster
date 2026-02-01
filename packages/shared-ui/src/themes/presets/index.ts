import type { Theme } from "@chat2poster/core-schema";
import { darkTheme } from "./dark";
import { lightTheme } from "./light";
import { sunsetTheme } from "./sunset";

export { lightTheme } from "./light";
export { darkTheme } from "./dark";
export { sunsetTheme } from "./sunset";

/**
 * All built-in theme presets
 * Single source of truth for theme definitions
 */
export const THEME_PRESETS: Theme[] = [lightTheme, darkTheme, sunsetTheme];
