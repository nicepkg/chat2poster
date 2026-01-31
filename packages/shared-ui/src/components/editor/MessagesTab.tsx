"use client";

import * as React from "react";
import type { Message } from "@chat2poster/core-schema";
import { cn } from "../../lib/utils";

function ScissorsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

export interface MessagesTabProps {
  messages: Message[];
  selectedIds: string[];
  pageBreaks: { id: string; afterMessageId: string }[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onAddPageBreak: (afterMessageId: string) => void;
  onRemovePageBreak: (pageBreakId: string) => void;
  className?: string;
}

export function MessagesTab({
  messages,
  selectedIds,
  pageBreaks,
  onToggle,
  onSelectAll,
  onDeselectAll,
  onAddPageBreak,
  onRemovePageBreak,
  className,
}: MessagesTabProps) {
  const getPageBreakAfter = (messageId: string) =>
    pageBreaks.find((pb) => pb.afterMessageId === messageId);

  return (
    <div className={cn("p-4", className)}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {selectedIds.length} of {messages.length} selected
        </span>
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            className="text-sm text-primary hover:text-primary/80"
          >
            Select All
          </button>
          <button
            onClick={onDeselectAll}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Deselect
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {messages.map((message, index) => {
          const pageBreak = getPageBreakAfter(message.id);
          const isLast = index === messages.length - 1;

          return (
            <div key={message.id}>
              <div className="group relative">
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(message.id)}
                    onChange={() => onToggle(message.id)}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <div className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "inline-block rounded px-1.5 py-0.5 text-xs font-medium",
                        message.role === "user"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          : message.role === "assistant"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      {message.role}
                    </span>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {message.contentMarkdown}
                    </p>
                  </div>
                </label>

                {/* Page break button */}
                {!isLast && !pageBreak && (
                  <button
                    onClick={() => onAddPageBreak(message.id)}
                    className="absolute -bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground opacity-0 shadow-sm transition-opacity hover:border-primary hover:text-primary group-hover:opacity-100"
                    title="Insert page break"
                  >
                    <ScissorsIcon />
                    <span>Page break</span>
                  </button>
                )}
              </div>

              {/* Page break indicator */}
              {pageBreak && (
                <div className="my-3 flex items-center gap-2">
                  <div className="h-px flex-1 bg-orange-300" />
                  <div className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                    <ScissorsIcon />
                    <span>Page break</span>
                    <button
                      onClick={() => onRemovePageBreak(pageBreak.id)}
                      className="ml-1 rounded-full p-0.5 hover:bg-orange-200 dark:hover:bg-orange-800"
                      title="Remove page break"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="h-px flex-1 bg-orange-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
