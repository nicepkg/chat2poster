import type { Theme } from "@chat2poster/core-schema";

/**
 * Light theme preset
 *
 * Clean, professional light theme.
 * User and Assistant bubbles use the same colors for visual consistency.
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
    messageGap: 16,
    colors: {
      // Window background
      background: "#ffffff",
      // Primary text
      foreground: "#1a1a1a",
      // Muted
      muted: "#f4f4f5",
      mutedForeground: "#71717a",
      // Message bubbles - same color for both user and assistant
      userBubble: "#f4f4f5",
      userBubbleForeground: "#18181b",
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
