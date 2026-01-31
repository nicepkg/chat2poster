"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, X, User, Bot } from "lucide-react";
import type { Message } from "@chat2poster/core-schema";
import { cn } from "~/utils/common";
import { useI18n } from "~/i18n";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";

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
  const { t } = useI18n();
  const getPageBreakAfter = (messageId: string) =>
    pageBreaks.find((pb) => pb.afterMessageId === messageId);

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Header */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            {t("messages.selected", {
              selected: selectedIds.length,
              total: messages.length,
            })}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSelectAll}
              className="text-primary h-7 px-2 text-xs"
            >
              {t("messages.selectAll")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDeselectAll}
              className="h-7 px-2 text-xs"
            >
              {t("messages.selectNone")}
            </Button>
          </div>
        </div>
      </div>

      {/* Message List */}
      <ScrollArea className="flex-1 px-2 py-2">
        <div className="space-y-1.5">
          {messages.map((message, index) => {
            const pageBreak = getPageBreakAfter(message.id);
            const isSelected = selectedIds.includes(message.id);
            const isLast = index === messages.length - 1;

            return (
              <div key={message.id}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <label
                    className={cn(
                      "group flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all duration-200",
                      isSelected
                        ? "border-primary/30 bg-primary/5"
                        : "border-transparent hover:border-border hover:bg-muted/50",
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggle(message.id)}
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      {message.role === "user" ? (
                        <User className="text-primary h-3.5 w-3.5" />
                      ) : (
                        <Bot className="text-secondary h-3.5 w-3.5" />
                        )}
                        <span
                          className={cn(
                            "text-xs font-medium",
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
                      <p className="text-muted-foreground line-clamp-2 text-xs">
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
                        className="text-muted-foreground hover:text-primary h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Scissors className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </label>
                </motion.div>

                {/* Page break indicator */}
                <AnimatePresence>
                  {pageBreak && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 px-3 py-2"
                    >
                      <div className="bg-secondary/30 h-px flex-1" />
                      <span className="text-secondary flex items-center gap-1 text-xs font-medium">
                        <Scissors className="h-3 w-3" />
                        {t("messages.pageBreak")}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onRemovePageBreak(pageBreak.id)}
                        className="text-muted-foreground hover:text-destructive h-5 w-5"
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
