import type { Theme } from "@chat2poster/core-schema";

/**
 * Dark theme preset
 * A sleek, modern dark theme with comfortable contrast
 */
export const darkTheme: Theme = {
  id: "dark",
  name: "Dark",
  mode: "dark",
  tokens: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    baseFontSize: 16,
    lineHeight: 1.6,
    bubbleRadius: 12,
    messagePadding: 16,
    messageGap: 16,
    colors: {
      background: "#1a1a1a",
      foreground: "#f5f5f5",
      muted: "#262626",
      mutedForeground: "#a3a3a3",
      userBubble: "#1d3a5c",
      userBubbleForeground: "#e8f0fe",
      assistantBubble: "#262626",
      assistantBubbleForeground: "#f5f5f5",
      systemBubble: "#3d3319",
      systemBubbleForeground: "#fcd34d",
      codeBlockBackground: "#0d0d0d",
      codeBlockForeground: "#d4d4d4",
      border: "#333333",
    },
    codeTheme: "github-dark",
  },
  decorationDefaults: {
    canvasPaddingPx: 32,
    canvasRadiusPx: 16,
    shadowLevel: "lg",
    backgroundType: "solid",
    backgroundValue: "#0d0d0d",
    macosBarEnabled: true,
  },
};
