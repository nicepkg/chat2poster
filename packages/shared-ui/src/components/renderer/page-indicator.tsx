"use client";

import { memo } from "react";
import { cssVar } from "~/themes";

export interface PageIndicatorProps {
  /** Current page number (1-based) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Position of the indicator */
  position?: "top-right" | "bottom-right" | "bottom-center";
  /** Show as badge or inline text */
  variant?: "badge" | "text";
}

/**
 * Page number indicator for multi-page exports
 */
export const PageIndicator = memo(function PageIndicator({
  currentPage,
  totalPages,
  position = "bottom-right",
  variant = "badge",
}: PageIndicatorProps) {
  const getPositionStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "absolute",
      zIndex: 10,
    };

    switch (position) {
      case "top-right":
        return { ...base, top: "8px", right: "8px" };
      case "bottom-right":
        return { ...base, bottom: "8px", right: "8px" };
      case "bottom-center":
        return {
          ...base,
          bottom: "8px",
          left: "50%",
          transform: "translateX(-50%)",
        };
      default:
        return { ...base, bottom: "8px", right: "8px" };
    }
  };

  const badgeStyle: React.CSSProperties = {
    ...getPositionStyle(),
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px 10px",
    fontSize: "12px",
    fontWeight: 500,
    fontFamily: cssVar("fontFamily"),
    color: cssVar("mutedForeground"),
    backgroundColor: cssVar("muted"),
    borderRadius: "12px",
    border: `1px solid ${cssVar("border")}`,
  };

  const textStyle: React.CSSProperties = {
    ...getPositionStyle(),
    fontSize: "11px",
    fontWeight: 500,
    fontFamily: cssVar("fontFamily"),
    color: cssVar("mutedForeground"),
  };

  const style = variant === "badge" ? badgeStyle : textStyle;

  return (
    <div
      style={style}
      className={`c2p-page-indicator c2p-page-indicator-${variant}`}
    >
      {currentPage} / {totalPages}
    </div>
  );
});
