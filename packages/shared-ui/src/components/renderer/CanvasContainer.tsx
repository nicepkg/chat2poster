"use client";

import { memo, forwardRef } from "react";
import type { Decoration } from "@chat2poster/core-schema";
import type { Theme } from "@chat2poster/themes";
import { applyThemeToElement } from "@chat2poster/themes";
import { DecorationFrame } from "./DecorationFrame";

export interface CanvasContainerProps {
  /** Theme to apply */
  theme: Theme;
  /** Decoration settings */
  decoration: Decoration;
  /** Canvas width in pixels */
  widthPx: number;
  /** Children to render */
  children: React.ReactNode;
  /** Optional title for macOS bar */
  macosBarTitle?: string;
  /** Additional class name */
  className?: string;
}

/**
 * Container component for export canvas
 * Wraps content with theme and decoration, sets fixed width
 * Use ref to access the DOM element for export
 */
export const CanvasContainer = memo(
  forwardRef<HTMLDivElement, CanvasContainerProps>(function CanvasContainer(
    {
      theme,
      decoration,
      widthPx,
      children,
      macosBarTitle,
      className,
    },
    ref
  ) {
    const containerStyle: React.CSSProperties = {
      width: `${widthPx}px`,
      maxWidth: "100%",
    };

    // Apply theme CSS variables via callback ref
    const handleRef = (element: HTMLDivElement | null) => {
      if (element) {
        applyThemeToElement(theme, element);
      }
      // Forward ref
      if (typeof ref === "function") {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    return (
      <div
        ref={handleRef}
        style={containerStyle}
        className={`c2p-canvas-container ${className || ""}`}
        data-theme-id={theme.id}
        data-theme-mode={theme.mode}
      >
        <DecorationFrame
          decoration={decoration}
          macosBarTitle={macosBarTitle}
        >
          {children}
        </DecorationFrame>
      </div>
    );
  })
);
