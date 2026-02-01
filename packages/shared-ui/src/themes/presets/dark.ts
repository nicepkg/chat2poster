import type { Theme } from "@chat2poster/core-schema";

/**
 * Dark theme preset - "Midnight"
 *
 * A sleek dark theme with vibrant accents for excellent contrast.
 * All text uses light colors for perfect readability on dark backgrounds.
 */
export const darkTheme: Theme = {
  id: "dark",
  name: "Dark",
  mode: "dark",
  tokens: {
    fontFamily:
      '"Inter var", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Noto Sans SC", sans-serif',
    baseFontSize: 15,
    lineHeight: 1.65,
    bubbleRadius: 18,
    messagePadding: 16,
    messageGap: 12,
    colors: {
      // Window background - deep dark
      background: "#0a0a0a",
      // Primary text - bright white for excellent contrast
      foreground: "#f5f5f5",
      // Muted
      muted: "#1c1c1e",
      mutedForeground: "#a1a1aa",
      // User bubble - vibrant blue
      userBubble: "#2563eb",
      userBubbleForeground: "#ffffff",
      // Assistant bubble - dark gray with light text
      assistantBubble: "#27272a",
      assistantBubbleForeground: "#f5f5f5",
      // System
      systemBubble: "#422006",
      systemBubbleForeground: "#fcd34d",
      // Code
      codeBlockBackground: "#000000",
      codeBlockForeground: "#e4e4e7",
      // Border
      border: "#3f3f46",
    },
    codeTheme: "github-dark",
  },
  decorationDefaults: {
    canvasPaddingPx: 48,
    canvasRadiusPx: 20,
    shadowLevel: "xl",
    backgroundType: "solid",
    backgroundValue: "#1f2937",
    macosBarEnabled: true,
  },
};
