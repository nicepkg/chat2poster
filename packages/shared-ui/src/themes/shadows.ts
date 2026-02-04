import type { ShadowLevel } from "@chat2poster/core-schema";

/**
 * Shadow styles using OKLCH color space for consistent, harmonious shadows.
 * Based on CLAUDE.md design system specifications.
 */

/**
 * Shadow levels from none to extra-large.
 * Uses layered shadows with OKLCH colors for depth and warmth.
 */
export const SHADOW_STYLES: Record<ShadowLevel, string> = {
  /** No shadow */
  none: "none",

  /** Extra small - subtle elevation */
  xs: "0 1px 2px oklch(0.2 0.02 260 / 0.04)",

  /** Small - light elevation for hover states */
  sm: "0 1px 3px oklch(0.2 0.02 260 / 0.06), 0 1px 2px oklch(0.2 0.02 260 / 0.04)",

  /** Medium - standard card elevation */
  md: "0 4px 6px oklch(0.2 0.02 260 / 0.05), 0 2px 4px oklch(0.2 0.02 260 / 0.03)",

  /** Large - raised elements */
  lg: "0 10px 15px oklch(0.2 0.02 260 / 0.06), 0 4px 6px oklch(0.2 0.02 260 / 0.03)",

  /** Extra large - floating elements, modals */
  xl: "0 20px 25px oklch(0.2 0.02 260 / 0.08), 0 8px 10px oklch(0.2 0.02 260 / 0.04)",
};

/**
 * Glow effects for emphasis and focus states.
 */
export const GLOW_STYLES = {
  /** Primary color glow */
  primary: "0 0 20px oklch(0.619 0.202 268.7 / 0.25)",

  /** Secondary/violet color glow */
  secondary: "0 0 20px oklch(0.685 0.17 277 / 0.25)",

  /** Soft primary glow for subtle emphasis */
  primarySoft: "0 0 15px oklch(0.619 0.202 268.7 / 0.15)",

  /** Success glow */
  success: "0 0 20px oklch(0.6 0.2 145 / 0.25)",

  /** Error/destructive glow */
  error: "0 0 20px oklch(0.6 0.25 25 / 0.25)",
} as const;

// Re-export ShadowLevel from core-schema for convenience
export type { ShadowLevel } from "@chat2poster/core-schema";
export type GlowType = keyof typeof GLOW_STYLES;

/**
 * Get shadow style by level
 */
export function getShadowStyle(level: ShadowLevel): string {
  return SHADOW_STYLES[level];
}

/**
 * Get glow style by type
 */
export function getGlowStyle(type: GlowType): string {
  return GLOW_STYLES[type];
}
