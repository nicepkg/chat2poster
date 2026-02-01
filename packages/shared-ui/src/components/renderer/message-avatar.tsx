"use client";

import type { MessageRole } from "@chat2poster/core-schema";
import { memo } from "react";
import { cssVar } from "~/themes";

export interface MessageAvatarProps {
  role: MessageRole;
  size?: number;
}

/**
 * Avatar component for message display
 */
export const MessageAvatar = memo(function MessageAvatar({
  role,
  size = 32,
}: MessageAvatarProps) {
  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: size * 0.5,
    fontWeight: 600,
    backgroundColor: getBackgroundColor(role),
    color: getForegroundColor(role),
  };

  return (
    <div style={containerStyle} className={`c2p-avatar c2p-avatar-${role}`}>
      {getAvatarContent(role)}
    </div>
  );
});

function getBackgroundColor(role: MessageRole): string {
  switch (role) {
    case "user":
      return cssVar("userBubble");
    case "assistant":
      return cssVar("assistantBubble");
    case "system":
      return cssVar("systemBubble");
    default:
      return cssVar("muted");
  }
}

function getForegroundColor(role: MessageRole): string {
  switch (role) {
    case "user":
      return cssVar("userBubbleForeground");
    case "assistant":
      return cssVar("assistantBubbleForeground");
    case "system":
      return cssVar("systemBubbleForeground");
    default:
      return cssVar("foreground");
  }
}

function getAvatarContent(role: MessageRole): React.ReactNode {
  switch (role) {
    case "user":
      return <UserIcon />;
    case "assistant":
      return <AssistantIcon />;
    case "system":
      return <SystemIcon />;
    default:
      return "?";
  }
}

function UserIcon() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function AssistantIcon() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect x="2" y="8" width="20" height="14" rx="2" />
      <path d="M6 16h.01" />
      <path d="M10 16h.01" />
      <path d="M14 16h.01" />
      <path d="M18 16h.01" />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
