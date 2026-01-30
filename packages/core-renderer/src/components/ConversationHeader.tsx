import { memo } from "react";
import { cssVar } from "@chat2poster/themes";

export interface ConversationHeaderProps {
  title?: string;
  subtitle?: string;
  showDivider?: boolean;
}

/**
 * Optional header component for conversation display
 */
export const ConversationHeader = memo(function ConversationHeader({
  title,
  subtitle,
  showDivider = true,
}: ConversationHeaderProps) {
  if (!title && !subtitle) {
    return null;
  }

  const containerStyle: React.CSSProperties = {
    padding: cssVar("messagePadding"),
    borderBottom: showDivider ? `1px solid ${cssVar("border")}` : "none",
    marginBottom: cssVar("messageGap"),
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "1.25em",
    fontWeight: 600,
    color: cssVar("foreground"),
    fontFamily: cssVar("fontFamily"),
  };

  const subtitleStyle: React.CSSProperties = {
    margin: "4px 0 0 0",
    fontSize: "0.875em",
    color: cssVar("mutedForeground"),
    fontFamily: cssVar("fontFamily"),
  };

  return (
    <header style={containerStyle} className="c2p-conversation-header">
      {title && (
        <h1 style={titleStyle} className="c2p-conversation-title">
          {title}
        </h1>
      )}
      {subtitle && (
        <p style={subtitleStyle} className="c2p-conversation-subtitle">
          {subtitle}
        </p>
      )}
    </header>
  );
});
