"use client";

import { memo, useMemo } from "react";
import type { Message, Selection, PageBreak } from "@chat2poster/core-schema";
import type { Theme } from "@chat2poster/themes";
import { cssVar } from "@chat2poster/themes";
import { MessageItem } from "./MessageItem";
import { ConversationHeader } from "./ConversationHeader";
import { PageBreakIndicator } from "./PageBreakIndicator";

export interface ConversationViewProps {
  /** All messages in the conversation */
  messages: Message[];
  /** Current theme */
  theme?: Theme;
  /** Selection state (which messages are selected) */
  selection?: Selection;
  /** Optional title for the conversation */
  title?: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Show avatars for messages */
  showAvatars?: boolean;
  /** Show role badges */
  showRoleBadges?: boolean;
  /** Show page break indicators */
  showPageBreaks?: boolean;
  /** Editable page breaks (show remove button) */
  editablePageBreaks?: boolean;
  /** Callback when a page break is removed */
  onRemovePageBreak?: (pageBreakId: string) => void;
}

/**
 * Main component for rendering a conversation
 * Handles message rendering, selection filtering, and page breaks
 */
export const ConversationView = memo(function ConversationView({
  messages,
  theme,
  selection,
  title,
  subtitle,
  showAvatars = true,
  showRoleBadges = false,
  showPageBreaks = true,
  editablePageBreaks = false,
  onRemovePageBreak,
}: ConversationViewProps) {
  // Filter and order messages based on selection
  const displayMessages = useMemo(() => {
    if (!selection || selection.selectedMessageIds.length === 0) {
      // If no selection, show all messages
      return messages.slice().sort((a, b) => a.order - b.order);
    }

    // Filter to selected messages and maintain selection order
    const messageMap = new Map(messages.map((m) => [m.id, m]));
    return selection.selectedMessageIds
      .map((id) => messageMap.get(id))
      .filter((m): m is Message => m !== undefined);
  }, [messages, selection]);

  // Build page break lookup for efficient rendering
  const pageBreakMap = useMemo(() => {
    const map = new Map<string, PageBreak>();
    if (selection?.pageBreaks) {
      for (const pb of selection.pageBreaks) {
        map.set(pb.afterMessageId, pb);
      }
    }
    return map;
  }, [selection?.pageBreaks]);

  // Calculate page numbers for each message
  const pageNumberMap = useMemo(() => {
    const map = new Map<string, number>();
    let currentPage = 0;
    for (const message of displayMessages) {
      map.set(message.id, currentPage);
      if (pageBreakMap.has(message.id)) {
        currentPage++;
      }
    }
    return map;
  }, [displayMessages, pageBreakMap]);

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: cssVar("messageGap"),
    fontFamily: cssVar("fontFamily"),
    fontSize: cssVar("fontSize"),
    lineHeight: cssVar("lineHeight"),
    color: cssVar("foreground"),
    backgroundColor: cssVar("background"),
  };

  const handleRemovePageBreak = (pageBreakId: string) => {
    onRemovePageBreak?.(pageBreakId);
  };

  return (
    <div style={containerStyle} className="c2p-conversation">
      <ConversationHeader title={title} subtitle={subtitle} />

      {displayMessages.map((message) => {
        const pageBreak = pageBreakMap.get(message.id);
        const pageNumber = pageNumberMap.get(message.id) ?? 0;

        return (
          <div key={message.id} className="c2p-conversation-item">
            <MessageItem
              message={message}
              theme={theme}
              showAvatar={showAvatars}
              showRoleBadge={showRoleBadges}
            />

            {showPageBreaks && pageBreak && (
              <PageBreakIndicator
                pageNumber={pageNumber + 1}
                label={pageBreak.label}
                editable={editablePageBreaks}
                onRemove={() => handleRemovePageBreak(pageBreak.id)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
});
