"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "~/utils/common";

export interface MacOSBarProps {
  className?: string;
}

export function MacOSBar({ className }: MacOSBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn("flex gap-2", className)}
    >
      <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
      <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
      <div className="h-3 w-3 rounded-full bg-[#28c840]" />
    </motion.div>
  );
}
