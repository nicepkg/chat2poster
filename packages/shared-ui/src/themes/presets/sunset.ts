import type { Theme } from "@chat2poster/core-schema";
import { MESH_BACKGROUND_VALUES } from "../backgrounds";

/**
 * Sunset gradient theme preset
 * A warm, playful theme with amber and rose tones
 */
export const sunsetTheme: Theme = {
  id: "gradient-sunset",
  name: "Sunset",
  mode: "light",
  tokens: {
    fontFamily:
      '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    baseFontSize: 16,
    lineHeight: 1.6,
    bubbleRadius: 16,
    messagePadding: 16,
    messageGap: 16,
    colors: {
      background: "#ffffff",
      foreground: "#1a1a1a",
      muted: "#fef3c7",
      mutedForeground: "#92400e",
      userBubble: "#fef3c7",
      userBubbleForeground: "#78350f",
      assistantBubble: "#fce7f3",
      assistantBubbleForeground: "#831843",
      systemBubble: "#f5f5f5",
      systemBubbleForeground: "#525252",
      codeBlockBackground: "#1e1e1e",
      codeBlockForeground: "#d4d4d4",
      border: "#fde68a",
    },
    codeTheme: "github-dark",
  },
  decorationDefaults: {
    canvasPaddingPx: 32,
    canvasRadiusPx: 20,
    shadowLevel: "xl",
    backgroundType: "gradient",
    backgroundValue: MESH_BACKGROUND_VALUES.solarPunch,
    macosBarEnabled: true,
  },
};
