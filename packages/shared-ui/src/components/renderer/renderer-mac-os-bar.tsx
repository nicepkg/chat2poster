"use client";

import { memo } from "react";
import { cssVar } from "~/themes";

export interface RendererMacOSBarProps {
  /** Title to display in the center (optional) */
  title?: string;
  /** Show traffic light buttons */
  showButtons?: boolean;
  /** Background color override */
  backgroundColor?: string;
}

/**
 * macOS-style window title bar with traffic light buttons
 * For use in the renderer context (export images)
 */
export const RendererMacOSBar = memo(function RendererMacOSBar({
  title,
  showButtons = true,
  backgroundColor,
}: RendererMacOSBarProps) {
  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    height: "28px",
    padding: "0 12px",
    backgroundColor: backgroundColor || cssVar("muted"),
    borderBottom: `1px solid ${cssVar("border")}`,
    position: "relative",
  };

  const buttonsStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const buttonBaseStyle: React.CSSProperties = {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    border: "none",
    cursor: "default",
  };

  const closeButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: "#ff5f56",
  };

  const minimizeButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: "#ffbd2e",
  };

  const maximizeButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: "#27c93f",
  };

  const titleStyle: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "13px",
    fontWeight: 500,
    color: cssVar("mutedForeground"),
    fontFamily: cssVar("fontFamily"),
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "calc(100% - 120px)",
  };

  return (
    <div style={containerStyle} className="c2p-macos-bar">
      {showButtons && (
        <div style={buttonsStyle} className="c2p-macos-buttons">
          <span
            style={closeButtonStyle}
            className="c2p-macos-button c2p-macos-close"
          />
          <span
            style={minimizeButtonStyle}
            className="c2p-macos-button c2p-macos-minimize"
          />
          <span
            style={maximizeButtonStyle}
            className="c2p-macos-button c2p-macos-maximize"
          />
        </div>
      )}
      {title && (
        <span style={titleStyle} className="c2p-macos-title">
          {title}
        </span>
      )}
    </div>
  );
});
