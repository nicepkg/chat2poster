"use client";

import type { Message, PageBreak } from "@chat2poster/core-schema";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, X, User, Bot } from "lucide-react";
import * as React from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";
import { useI18n } from "~/i18n";
import { cn } from "~/utils/common";

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
  const getPageBreakAfter = (messageId: string) =>
    pageBreaks.find((pb) => pb.afterMessageId === messageId);

  return (
    <div className={cn("c2p-messages-tab flex h-full flex-col", className)}>
      {/* Header with selection controls */}
      <div className="c2p-messages-header border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="c2p-messages-count text-muted-foreground text-sm">
            {t("messages.selected", {
              selected: selectedIds.length,
              total: messages.length,
            })}
          </span>
          <div className="c2p-messages-actions flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSelectAll}
              className="c2p-select-all-btn text-primary h-7 px-2 text-xs"
            >
              {t("messages.selectAll")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDeselectAll}
              className="c2p-deselect-all-btn h-7 px-2 text-xs"
            >
              {t("messages.selectNone")}
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable message list */}
      <ScrollArea className="c2p-messages-list flex-1">
        <div className="w-full space-y-1.5 px-2 py-2">
          {messages.map((message, index) => {
            const pageBreak = getPageBreakAfter(message.id);
            const isSelected = selectedIds.includes(message.id);
            const isLast = index === messages.length - 1;

            return (
              <div key={message.id} className="c2p-message-wrapper">
                <motion.div
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                  className="w-full"
                >
                  <label
                    className={cn(
                      "c2p-message-item group flex w-full cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition-all duration-200",
                      isSelected
                        ? "c2p-message-selected border-primary/40 bg-primary/5 shadow-sm shadow-primary/5"
                        : "border-transparent bg-muted/30 hover:border-border hover:bg-muted/50",
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggle(message.id)}
                      className="c2p-message-checkbox mt-0.5 shrink-0"
                    />
                    <div className="c2p-message-content min-w-0 flex-1 overflow-hidden">
                      <div className="c2p-message-role mb-1.5 flex items-center gap-2">
                        <div
                          className={cn(
                            "c2p-role-icon flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                            message.role === "user"
                              ? "bg-primary/10"
                              : "bg-secondary/10",
                          )}
                        >
                          {message.role === "user" ? (
                            <User className="text-primary h-3 w-3" />
                          ) : (
                            <Bot className="text-secondary h-3 w-3" />
                          )}
                        </div>
                        <span
                          className={cn(
                            "c2p-role-label text-xs font-medium",
                            message.role === "user"
                              ? "text-primary"
                              : "text-secondary",
                          )}
                        >
                          {message.role === "user"
                            ? t("role.user")
                            : message.role === "assistant"
                              ? t("role.assistant")
                              : t("role.system")}
                        </span>
                      </div>
                      <p className="c2p-message-preview text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                        {message.contentMarkdown}
                      </p>
                    </div>

                    {/* Page break button - appears on hover */}
                    {!isLast && !pageBreak && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          onAddPageBreak(message.id);
                        }}
                        className="c2p-pagebreak-btn text-muted-foreground hover:text-primary h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Scissors className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </label>
                </motion.div>

                {/* Page break indicator between messages */}
                <AnimatePresence>
                  {pageBreak && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="c2p-pagebreak-indicator flex items-center gap-2 px-3 py-2"
                    >
                      <div className="bg-secondary/30 h-px flex-1" />
                      <span className="c2p-pagebreak-label text-secondary flex items-center gap-1 text-xs font-medium">
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
                      <div className="bg-secondary/30 h-px flex-1" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
