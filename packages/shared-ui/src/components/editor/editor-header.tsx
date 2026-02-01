"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import * as React from "react";
import { useI18n } from "~/i18n";
import { cn } from "~/utils/common";

export interface EditorHeaderProps {
  /** Page title */
  title?: string;
  /** Back link URL - if provided, shows back button */
  backHref?: string;
  /** Back button click handler - alternative to backHref */
  onBack?: () => void;
  /** Back button label */
  backLabel?: string;
  /** Show title icon */
  showIcon?: boolean;
  /** Slot for export button or other actions */
  exportSlot?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * EditorHeader component with frosted glass effect.
 * Provides consistent header styling across editor pages.
 */
export function EditorHeader({
  title,
  backHref,
  onBack,
  backLabel,
  showIcon = true,
  exportSlot,
  className,
}: EditorHeaderProps) {
  const { t } = useI18n();
  const resolvedTitle = title ?? t("editor.title");
  const resolvedBackLabel = backLabel ?? t("editor.back");
  const BackComponent = backHref ? "a" : "button";
  const backProps = backHref
    ? { href: backHref }
    : { onClick: onBack, type: "button" as const };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "c2p-editor-header bg-background/80 sticky top-0 z-50 border-b backdrop-blur-lg",
        className,
      )}
    >
      <div className="c2p-header-container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="c2p-header-left flex items-center gap-4">
          {(backHref || onBack) && (
            <>
              <BackComponent
                {...backProps}
                className="c2p-header-back text-muted-foreground hover:text-foreground group flex items-center gap-2 text-sm transition-colors"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline">{resolvedBackLabel}</span>
              </BackComponent>
              <div className="c2p-header-divider bg-border h-6 w-px" />
            </>
          )}
          <div className="c2p-header-title flex items-center gap-2">
            {showIcon && (
              <Sparkles className="c2p-header-icon text-primary h-5 w-5" />
            )}
            <h1 className="text-foreground text-lg font-semibold">
              {resolvedTitle}
            </h1>
          </div>
        </div>

        {exportSlot && <div className="c2p-header-actions">{exportSlot}</div>}
      </div>
    </motion.header>
  );
}
