"use client";

import { memo } from "react";
import { cssVar } from "@chat2poster/themes";

export interface PageBreakIndicatorProps {
  pageNumber?: number;
  label?: string;
  onRemove?: () => void;
  editable?: boolean;
}

/**
 * Visual indicator for page breaks between messages
 */
export const PageBreakIndicator = memo(function PageBreakIndicator({
  pageNumber,
  label,
  onRemove,
  editable = false,
}: PageBreakIndicatorProps) {
  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 0",
    margin: `${cssVar("messageGap")} 0`,
  };

  const lineStyle: React.CSSProperties = {
    flex: 1,
    height: "1px",
    background: `linear-gradient(to right, transparent, ${cssVar("border")}, transparent)`,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 500,
    color: cssVar("mutedForeground"),
    fontFamily: cssVar("fontFamily"),
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "4px 12px",
    backgroundColor: cssVar("muted"),
    borderRadius: "12px",
  };

  const removeButtonStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: cssVar("mutedForeground"),
    padding: "2px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    lineHeight: 1,
  };

  const displayLabel = label || (pageNumber ? `Page ${pageNumber + 1} starts here` : "Page break");

  return (
    <div style={containerStyle} className="c2p-page-break">
      <div style={lineStyle} />
      <span style={labelStyle} className="c2p-page-break-label">
        <PageBreakIcon />
        {displayLabel}
        {editable && onRemove && (
          <button
            onClick={onRemove}
            style={removeButtonStyle}
            className="c2p-page-break-remove"
            title="Remove page break"
          >
            <CloseIcon />
          </button>
        )}
      </span>
      <div style={lineStyle} />
    </div>
  );
});

function PageBreakIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="17 11 12 6 7 11" />
      <polyline points="17 18 12 13 7 18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
