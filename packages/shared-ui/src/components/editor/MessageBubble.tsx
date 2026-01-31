"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { User, Bot } from "lucide-react";
import { cn } from "../../lib/utils";

export interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "rounded-xl p-4",
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
      <div className="mb-2 flex items-center gap-2">
        {role === "user" ? (
          <User className="h-3.5 w-3.5 opacity-60" />
        ) : (
          <Bot className="h-3.5 w-3.5 opacity-60" />
        )}
        <span className="text-xs font-medium uppercase tracking-wide opacity-60">
          {role}
        </span>
      </div>
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {children}
      </div>
    </motion.div>
  );
}
