import type { Theme } from "@chat2poster/core-schema";
import { MESH_BACKGROUND_VALUES } from "../backgrounds";

/**
 * Dark theme preset
 *
 * Sleek dark theme with excellent contrast.
 * User and Assistant bubbles use the same colors for visual consistency.
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
    messageGap: 16,
    colors: {
      // Window background
      background: "#0a0a0a",
      // Primary text
      foreground: "#fafafa",
      // Muted
      muted: "#1c1c1e",
      mutedForeground: "#a1a1aa",
      // Message bubbles - same color for both user and assistant
      userBubble: "#27272a",
      userBubbleForeground: "#fafafa",
      assistantBubble: "#27272a",
      assistantBubbleForeground: "#fafafa",
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
    backgroundType: "gradient",
    backgroundValue: MESH_BACKGROUND_VALUES.graphiteAurora,
    macosBarEnabled: true,
  },
};
