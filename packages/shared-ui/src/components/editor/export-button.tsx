"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Download, Loader2, Check } from "lucide-react";
import * as React from "react";
import { useState, useCallback } from "react";
import { Button } from "../ui/button";
import { useI18n } from "~/i18n";
import { cn } from "~/utils/common";

export interface ExportButtonProps {
  /** Number of pages to export (shows count if > 1) */
  pageCount?: number;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Export handler - called when button is clicked */
  onExport: () => Promise<void>;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Animated export button with loading and success states.
 * Displays page count for multi-page exports.
 */
export function ExportButton({
  pageCount = 1,
  disabled = false,
  onExport,
  className,
}: ExportButtonProps) {
  const { t } = useI18n();
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = useCallback(async () => {
    if (isExporting || disabled) return;

    setIsExporting(true);
    try {
      await onExport();
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
    } catch (error) {
      // Error handling should be done in the onExport handler
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, disabled, onExport]);

  const buttonText =
    pageCount > 1
      ? t("exportButton.exportPages", { count: pageCount })
      : t("exportButton.exportPng");

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || isExporting}
      className={cn(
        "group h-10 px-5 transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-lg",
        "active:translate-y-0 active:shadow-sm",
        className,
      )}
    >
      <AnimatePresence mode="wait">
        {isExporting ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("exportButton.exporting")}
          </motion.span>
        ) : exportSuccess ? (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex items-center gap-2 text-green-500"
          >
            <Check className="h-4 w-4" />
            {t("exportButton.done")}
          </motion.span>
        ) : (
          <motion.span
            key="default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {buttonText}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
