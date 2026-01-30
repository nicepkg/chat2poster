import { z } from "zod";

/**
 * Theme mode (light/dark)
 */
export const ThemeMode = z.enum(["light", "dark"]);
export type ThemeMode = z.infer<typeof ThemeMode>;

/**
 * Theme color tokens
 */
export const ThemeColors = z
  .object({
    background: z.string(),
    foreground: z.string(),
    muted: z.string(),
    mutedForeground: z.string(),
    userBubble: z.string(),
    userBubbleForeground: z.string(),
    assistantBubble: z.string(),
    assistantBubbleForeground: z.string(),
    systemBubble: z.string(),
    systemBubbleForeground: z.string(),
    codeBlockBackground: z.string(),
    codeBlockForeground: z.string(),
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
export const ShadowLevel = z.enum(["none", "sm", "md", "lg", "xl"]);
export type ShadowLevel = z.infer<typeof ShadowLevel>;

/**
 * Theme decoration defaults
 */
export const DecorationDefaults = z
  .object({
    canvasPaddingPx: z.number().nonnegative(),
    canvasRadiusPx: z.number().nonnegative(),
    shadowLevel: ShadowLevel,
    backgroundType: BackgroundType,
    backgroundValue: z.string(),
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
 * Decoration settings for export (overrides theme defaults)
 */
export const Decoration = z
  .object({
    canvasPaddingPx: z.number().nonnegative(),
    canvasRadiusPx: z.number().nonnegative(),
    shadowLevel: ShadowLevel,
    backgroundType: BackgroundType,
    backgroundValue: z.string(),
    macosBarEnabled: z.boolean(),
  })
  .strict();
export type Decoration = z.infer<typeof Decoration>;

/**
 * Create decoration from theme defaults
 */
export function createDecorationFromTheme(theme: Theme): Decoration {
  return Decoration.parse(theme.decorationDefaults);
}
