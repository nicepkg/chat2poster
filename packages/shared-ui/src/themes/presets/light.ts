import type { Theme } from "@chat2poster/core-schema";

/**
 * Light theme preset
 * A clean, minimal theme with neutral colors for readability
 */
export const lightTheme: Theme = {
  id: "light",
  name: "Light",
  mode: "light",
  tokens: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    baseFontSize: 16,
    lineHeight: 1.6,
    bubbleRadius: 12,
    messagePadding: 16,
    messageGap: 16,
    colors: {
      background: "#ffffff",
      foreground: "#1a1a1a",
      muted: "#f5f5f5",
      mutedForeground: "#737373",
      userBubble: "#e8f0fe",
      userBubbleForeground: "#1a1a1a",
      assistantBubble: "#f5f5f5",
      assistantBubbleForeground: "#1a1a1a",
      systemBubble: "#fff7e6",
      systemBubbleForeground: "#8b6914",
      codeBlockBackground: "#1e1e1e",
      codeBlockForeground: "#d4d4d4",
      border: "#e5e5e5",
    },
    codeTheme: "github-dark",
  },
  decorationDefaults: {
    canvasPaddingPx: 32,
    canvasRadiusPx: 16,
    shadowLevel: "md",
    backgroundType: "solid",
    backgroundValue: "#f8f9fa",
    macosBarEnabled: true,
  },
};
