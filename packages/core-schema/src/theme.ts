import { z } from "zod";

/**
 * Theme mode (light/dark)
 */
export const ThemeMode = z.enum(["light", "dark"]);
export type ThemeMode = z.infer<typeof ThemeMode>;

/**
 * Theme color tokens for the content area (c2p-window-content)
 * These colors define how messages and content are displayed
 */
export const ThemeColors = z
  .object({
    /** Content area background color */
    background: z.string(),
    /** Default text color */
    foreground: z.string(),
    /** Muted background for secondary elements */
    muted: z.string(),
    /** Muted text color */
    mutedForeground: z.string(),
    /** User message bubble background */
    userBubble: z.string(),
    /** User message text color */
    userBubbleForeground: z.string(),
    /** Assistant message bubble background */
    assistantBubble: z.string(),
    /** Assistant message text color */
    assistantBubbleForeground: z.string(),
    /** System message bubble background */
    systemBubble: z.string(),
    /** System message text color */
    systemBubbleForeground: z.string(),
    /** Code block background */
    codeBlockBackground: z.string(),
    /** Code block text color */
    codeBlockForeground: z.string(),
    /** Border color */
    border: z.string(),
  })
  .strict();
export type ThemeColors = z.infer<typeof ThemeColors>;

/**
 * Theme tokens structure
 */
export const ThemeTokens = z
  .object({
    fontFamily: z.string(),
    baseFontSize: z.number().positive(),
    lineHeight: z.number().positive(),
    bubbleRadius: z.number().nonnegative(),
    messagePadding: z.number().nonnegative(),
    messageGap: z.number().nonnegative(),
    colors: ThemeColors,
    codeTheme: z.string(),
  })
  .strict();
export type ThemeTokens = z.infer<typeof ThemeTokens>;

/**
 * Background type for decoration
 */
export const BackgroundType = z.enum(["solid", "gradient", "image"]);
export type BackgroundType = z.infer<typeof BackgroundType>;

/**
 * Shadow level preset
 */
export const ShadowLevel = z.enum(["none", "xs", "sm", "md", "lg", "xl"]);
export type ShadowLevel = z.infer<typeof ShadowLevel>;

/**
 * Available shadow levels for UI controls (excludes 'xs' which is rarely used)
 */
export const SHADOW_LEVELS = ["none", "sm", "md", "lg", "xl"] as const;

/**
 * Decoration slider limits - single source of truth for UI controls
 */
export const DECORATION_LIMITS = {
  radius: { min: 0, max: 32, step: 2 },
  padding: { min: 0, max: 64, step: 4 },
} as const;

/**
 * Theme decoration defaults
 *
 * Layer structure (like CleanShot X):
 * - Desktop (c2p-desktop): The canvas surface with gradient/solid background
 * - Window (c2p-window): The app window with rounded corners and shadow
 * - Window Bar (c2p-window-bar): macOS traffic lights
 * - Window Content (c2p-window-content): Message area with theme colors
 */
export const DecorationDefaults = z
  .object({
    /** Window margin - distance from desktop edge to window edge (px) */
    canvasPaddingPx: z.number().nonnegative(),
    /** Window border radius (px) */
    canvasRadiusPx: z.number().nonnegative(),
    /** Window shadow level */
    shadowLevel: ShadowLevel,
    /** Desktop background type */
    backgroundType: BackgroundType,
    /** Desktop background value (color, gradient, or image URL) */
    backgroundValue: z.string(),
    /** Show macOS title bar with traffic lights */
    macosBarEnabled: z.boolean(),
  })
  .strict();
export type DecorationDefaults = z.infer<typeof DecorationDefaults>;

/**
 * A complete theme definition
 */
export const Theme = z
  .object({
    id: z.string(),
    name: z.string(),
    mode: ThemeMode,
    tokens: ThemeTokens,
    decorationDefaults: DecorationDefaults,
  })
  .strict();
export type Theme = z.infer<typeof Theme>;

/**
 * Decoration settings for export
 *
 * Controls the visual appearance of the poster:
 * - Desktop: backgroundType + backgroundValue (the canvas behind the window)
 * - Window: canvasRadiusPx + shadowLevel (the app window container)
 * - Spacing: canvasPaddingPx (margin between desktop edge and window)
 * - Title bar: macosBarEnabled (show/hide macOS traffic lights)
 */
export const Decoration = DecorationDefaults;
export type Decoration = z.infer<typeof Decoration>;

/**
 * Create decoration from theme defaults
 */
export function createDecorationFromTheme(theme: Theme): Decoration {
  return Decoration.parse(theme.decorationDefaults);
}
