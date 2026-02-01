import type { BackgroundType } from "@chat2poster/core-schema";

/**
 * Background preset definition
 */
export interface BackgroundPreset {
  id: string;
  label: string;
  value: string;
  type: Exclude<BackgroundType, "image">;
}

/**
 * All background presets - single source of truth
 * Used by background-picker and editor-context
 */
export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  // Solid colors
  { id: "white", label: "White", value: "#ffffff", type: "solid" },
  { id: "slate", label: "Slate", value: "#f8fafc", type: "solid" },
  { id: "gray", label: "Gray", value: "#f5f5f5", type: "solid" },
  { id: "amber", label: "Amber", value: "#fef3c7", type: "solid" },
  { id: "blue", label: "Blue", value: "#dbeafe", type: "solid" },
  { id: "green", label: "Green", value: "#dcfce7", type: "solid" },
  { id: "fuchsia", label: "Fuchsia", value: "#fae8ff", type: "solid" },
  { id: "dark", label: "Dark", value: "#1e1e2e", type: "solid" },

  // Gradients
  {
    id: "gradient-indigo",
    label: "Indigo",
    value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    type: "gradient",
  },
  {
    id: "gradient-blue",
    label: "Blue Gradient",
    value: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
    type: "gradient",
  },
  {
    id: "gradient-purple",
    label: "Purple Gradient",
    value: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)",
    type: "gradient",
  },
  {
    id: "gradient-sunset",
    label: "Sunset Gradient",
    value: "linear-gradient(135deg, #fef3c7 0%, #fce7f3 100%)",
    type: "gradient",
  },
];
