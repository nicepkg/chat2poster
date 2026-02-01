import type { Theme } from "@chat2poster/core-schema";

/**
 * Light theme preset - "Daylight"
 *
 * A clean, professional light theme with excellent contrast.
 * User messages use a warm accent, assistant uses neutral.
 */
export const lightTheme: Theme = {
  id: "light",
  name: "Light",
  mode: "light",
  tokens: {
    fontFamily:
      '"Inter var", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Noto Sans SC", sans-serif',
    baseFontSize: 15,
    lineHeight: 1.65,
    bubbleRadius: 18,
    messagePadding: 16,
    messageGap: 12,
    colors: {
      // Window background - clean white
      background: "#ffffff",
      // Primary text - dark gray
      foreground: "#1a1a1a",
      // Muted
      muted: "#f4f4f5",
      mutedForeground: "#71717a",
      // User bubble - vibrant blue
      userBubble: "#3b82f6",
      userBubbleForeground: "#ffffff",
      // Assistant bubble - light neutral
      assistantBubble: "#f4f4f5",
      assistantBubbleForeground: "#18181b",
      // System
      systemBubble: "#fef3c7",
      systemBubbleForeground: "#92400e",
      // Code
      codeBlockBackground: "#18181b",
      codeBlockForeground: "#fafafa",
      // Border
      border: "#e4e4e7",
    },
    codeTheme: "github-dark",
  },
  decorationDefaults: {
    canvasPaddingPx: 48,
    canvasRadiusPx: 20,
    shadowLevel: "lg",
    backgroundType: "solid",
    backgroundValue: "#f5f5f4",
    macosBarEnabled: true,
  },
};
