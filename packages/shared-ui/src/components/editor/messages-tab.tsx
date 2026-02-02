"use client";

import type { Message, PageBreak } from "@chat2poster/core-schema";
import { useI18n } from "@ui/i18n";
import { cn } from "@ui/utils/common";
import { AnimatePresence, motion } from "framer-motion";
import { Scissors, X, User, Bot } from "lucide-react";
import { useMemo } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";

type MessageId = Message["id"];

export interface MessagesTabProps {
  messages: Message[];
  selectedIds: MessageId[];
  pageBreaks: Pick<PageBreak, "id" | "afterMessageId">[];
  onToggle: (id: MessageId) => void;
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
  const { t } = useI18n();

  // Pre-build Set for O(1) lookups
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  // Pre-build Map for O(1) page break lookups
  const pageBreakMap = useMemo(
    () => new Map(pageBreaks.map((pb) => [pb.afterMessageId, pb])),
    [pageBreaks],
  );

  const getPageBreakAfter = (messageId: string) => pageBreakMap.get(messageId);

  return (
    <div className={cn("c2p-messages-tab flex h-full flex-col", className)}>
      {/* Header */}
      <div className="c2p-messages-header shrink-0 border-b p-3">
        <label className="flex cursor-pointer items-center gap-3">
          <Checkbox
            checked={
              selectedIds.length === messages.length && messages.length > 0
            }
            onCheckedChange={(checked) => {
              if (checked) {
                onSelectAll();
              } else {
                onDeselectAll();
              }
            }}
            className="c2p-select-all-checkbox"
          />
          <span className="c2p-messages-count text-muted-foreground text-sm">
            {t("messages.selected", {
              selected: selectedIds.length,
              total: messages.length,
            })}
          </span>
        </label>
      </div>

      {/* Scrollable message list */}
      <div className="c2p-messages-list min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-2 p-3">
          {messages.map((message, index) => {
            const pageBreak = getPageBreakAfter(message.id);
            const isSelected = selectedIdSet.has(message.id);
            const isLast = index === messages.length - 1;

            return (
              <div key={message.id} className="c2p-message-wrapper">
                <label
                  className={cn(
                    "c2p-message-item group relative flex w-full cursor-pointer items-start gap-3 rounded-md py-3 transition-all duration-200",
                    isSelected
                      ? "c2p-message-selected"
                      : "c2p-message-excluded bg-muted/40 opacity-50 hover:opacity-70",
                  )}
                >
                  {/* Checkbox */}
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggle(message.id)}
                    className="c2p-message-checkbox mt-0.5 shrink-0"
                  />

                  {/* Content */}
                  <div className="min-w-0 flex-1 space-y-1">
                    {/* Role badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "c2p-role-badge inline-flex items-center gap-1 text-xs font-medium",
                          message.role === "user"
                            ? "text-primary"
                            : "text-muted-foreground",
                        )}
                      >
                        {message.role === "user" ? (
                          <User className="h-3 w-3" />
                        ) : (
                          <Bot className="h-3 w-3" />
                        )}
                        {message.role === "user"
                          ? t("role.user")
                          : t("role.assistant")}
                      </span>
                    </div>

                    {/* Preview text */}
                    <p
                      className={cn(
                        "c2p-message-preview line-clamp-2 text-sm leading-relaxed",
                        isSelected
                          ? "text-foreground/80"
                          : "text-muted-foreground",
                      )}
                    >
                      {message.contentMarkdown}
                    </p>
                  </div>

                  {/* Page break button */}
                  {!isLast && !pageBreak && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        onAddPageBreak(message.id);
                      }}
                      className="c2p-pagebreak-btn text-muted-foreground hover:text-primary absolute right-2 top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Scissors className="h-3 w-3" />
                    </Button>
                  )}
                </label>

                {/* Page break indicator */}
                <AnimatePresence>
                  {pageBreak && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="c2p-pagebreak-indicator my-2 flex items-center gap-2"
                    >
                      <div className="from-transparent via-secondary/50 to-transparent h-px flex-1 bg-gradient-to-r" />
                      <span className="c2p-pagebreak-label bg-secondary/10 text-secondary flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium">
                        <Scissors className="h-3 w-3" />
                        {t("messages.pageBreak")}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onRemovePageBreak(pageBreak.id)}
                        className="c2p-pagebreak-remove text-muted-foreground hover:text-destructive h-5 w-5"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <div className="from-transparent via-secondary/50 to-transparent h-px flex-1 bg-gradient-to-r" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
