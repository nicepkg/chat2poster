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
 * Premium solid color backgrounds
 * Clean, professional colors for beautiful poster exports
 */
export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  // === Whites & Neutrals ===
  { id: "white", label: "White", value: "#ffffff", type: "solid" },
  { id: "snow", label: "Snow", value: "#fafafa", type: "solid" },
  { id: "pearl", label: "Pearl", value: "#f5f5f4", type: "solid" },
  { id: "silver", label: "Silver", value: "#e5e5e5", type: "solid" },

  // === Cool Tones ===
  { id: "ice", label: "Ice", value: "#f0f9ff", type: "solid" },
  { id: "sky", label: "Sky", value: "#e0f2fe", type: "solid" },
  { id: "ocean", label: "Ocean", value: "#0ea5e9", type: "solid" },
  { id: "navy", label: "Navy", value: "#1e3a5f", type: "solid" },

  // === Warm Tones ===
  { id: "cream", label: "Cream", value: "#fef7ed", type: "solid" },
  { id: "peach", label: "Peach", value: "#fed7aa", type: "solid" },
  { id: "coral", label: "Coral", value: "#f97316", type: "solid" },
  { id: "rose", label: "Rose", value: "#fda4af", type: "solid" },

  // === Nature ===
  { id: "mint", label: "Mint", value: "#d1fae5", type: "solid" },
  { id: "sage", label: "Sage", value: "#86efac", type: "solid" },
  { id: "forest", label: "Forest", value: "#166534", type: "solid" },
  { id: "lavender", label: "Lavender", value: "#e9d5ff", type: "solid" },

  // === Darks ===
  { id: "slate", label: "Slate", value: "#475569", type: "solid" },
  { id: "graphite", label: "Graphite", value: "#374151", type: "solid" },
  { id: "charcoal", label: "Charcoal", value: "#1f2937", type: "solid" },
  { id: "black", label: "Black", value: "#0a0a0a", type: "solid" },
];
