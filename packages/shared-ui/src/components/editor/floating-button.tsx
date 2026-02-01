"use client";

import * as React from "react";
import { useI18n } from "~/i18n";
import { cn } from "~/utils/common";

export interface FloatingButtonProps {
  onClick: () => void;
  visible: boolean;
  className?: string;
}

export function FloatingButton({
  onClick,
  visible,
  className,
}: FloatingButtonProps) {
  const { t } = useI18n();
  if (!visible) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl active:scale-95",
        className,
      )}
      title={t("floatingButton.title")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    </button>
  );
}
