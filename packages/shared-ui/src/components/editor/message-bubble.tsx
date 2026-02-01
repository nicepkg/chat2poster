"use client";

import type { MessageRole } from "@chat2poster/core-schema";
import { motion } from "framer-motion";
import { User, Bot } from "lucide-react";
import * as React from "react";
import { useI18n } from "~/i18n";
import { cn } from "~/utils/common";

export interface MessageBubbleProps {
  role: MessageRole;
  children: React.ReactNode;
  isDarkBackground?: boolean;
  className?: string;
}

export function MessageBubble({
  role,
  children,
  isDarkBackground = false,
  className,
}: MessageBubbleProps) {
  const { t } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        `c2p-bubble c2p-bubble-${role} rounded-xl p-4`,
        isDarkBackground
          ? role === "user"
            ? "bg-white/10 text-white"
            : "bg-white/5 text-white/90"
          : role === "user"
            ? "bg-primary/10 text-foreground"
            : "bg-muted/50 text-foreground",
        className,
      )}
    >
      <div className="c2p-bubble-header mb-2 flex items-center gap-2">
        {role === "user" ? (
          <User className="c2p-bubble-icon h-3.5 w-3.5 opacity-60" />
        ) : (
          <Bot className="c2p-bubble-icon h-3.5 w-3.5 opacity-60" />
        )}
        <span className="c2p-bubble-role text-xs font-medium uppercase tracking-wide opacity-60">
          {role === "user"
            ? t("role.user")
            : role === "assistant"
              ? t("role.assistant")
              : t("role.system")}
        </span>
      </div>
      <div className="c2p-bubble-content prose prose-sm max-w-none dark:prose-invert">
        {children}
      </div>
    </motion.div>
  );
}
