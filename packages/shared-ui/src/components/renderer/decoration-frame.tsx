"use client";

import type { Decoration, ShadowLevel } from "@chat2poster/core-schema";
import { cssVar } from "@ui/themes";
import { memo } from "react";
import { RendererMacOSBar } from "./renderer-mac-os-bar";

export interface DecorationFrameProps {
  /** Decoration settings */
  decoration: Decoration;
  /** Children to render inside the frame */
  children: React.ReactNode;
  /** Optional title for macOS bar */
  macosBarTitle?: string;
  /** Additional class name */
  className?: string;
  /** Additional style */
  style?: React.CSSProperties;
}

/**
 * Get box-shadow CSS value for a given shadow level
 */
function getShadowValue(level: ShadowLevel): string {
  switch (level) {
    case "none":
      return "none";
    case "sm":
      return "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
    case "md":
      return "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    case "lg":
      return "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
    case "xl":
      return "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
    default:
      return "none";
  }
}

/**
 * Get background CSS value from decoration
 */
function getBackgroundValue(decoration: Decoration): string {
  switch (decoration.backgroundType) {
    case "solid":
      return decoration.backgroundValue;
    case "gradient":
      return decoration.backgroundValue;
    case "image":
      return `url(${decoration.backgroundValue})`;
    default:
      return decoration.backgroundValue;
  }
}

/**
 * Decorative frame component that applies styling to its children
 * Includes border radius, padding, shadow, background, and optional macOS bar
 */
export const DecorationFrame = memo(function DecorationFrame({
  decoration,
  children,
  macosBarTitle,
  className,
  style,
}: DecorationFrameProps) {
  const outerStyle: React.CSSProperties = {
    background: getBackgroundValue(decoration),
    backgroundSize: decoration.backgroundType === "image" ? "cover" : undefined,
    backgroundPosition:
      decoration.backgroundType === "image" ? "center" : undefined,
    padding: `${decoration.canvasPaddingPx}px`,
    ...style,
  };

  const innerStyle: React.CSSProperties = {
    borderRadius: `${decoration.canvasRadiusPx}px`,
    boxShadow: getShadowValue(decoration.shadowLevel),
    overflow: "hidden",
    backgroundColor: cssVar("background"),
  };

  const contentStyle: React.CSSProperties = {
    backgroundColor: cssVar("background"),
  };

  return (
    <div
      style={outerStyle}
      className={`c2p-decoration-frame ${className || ""}`}
    >
      <div style={innerStyle} className="c2p-decoration-inner">
        {decoration.macosBarEnabled && (
          <RendererMacOSBar title={macosBarTitle} />
        )}
        <div style={contentStyle} className="c2p-decoration-content">
          {children}
        </div>
      </div>
    </div>
  );
});
