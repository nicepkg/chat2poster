"use client";

import { cn } from "@ui/utils/common";
import { motion } from "framer-motion";

export interface MacOSBarProps {
  className?: string;
}

export function MacOSBar({ className }: MacOSBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn("c2p-macos-bar flex gap-2", className)}
    >
      <div className="c2p-traffic-light c2p-traffic-light-close h-3 w-3 rounded-full bg-[#ff5f57]" />
      <div className="c2p-traffic-light c2p-traffic-light-minimize h-3 w-3 rounded-full bg-[#febc2e]" />
      <div className="c2p-traffic-light c2p-traffic-light-maximize h-3 w-3 rounded-full bg-[#28c840]" />
    </motion.div>
  );
}
