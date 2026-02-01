"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import * as React from "react";
import { Label } from "../ui/label";
import { useI18n } from "~/i18n";
import {
  BACKGROUND_PRESETS,
  type BackgroundPreset,
} from "~/themes/backgrounds";
import { cn } from "~/utils/common";

// Re-export for backward compatibility
export type { BackgroundPreset };

export interface BackgroundPickerProps {
  value: string;
  onChange: (value: string, type: "solid" | "gradient") => void;
  presets?: BackgroundPreset[];
  label?: string;
  className?: string;
}

export function BackgroundPicker({
  value,
  onChange,
  presets = BACKGROUND_PRESETS,
  label,
  className,
}: BackgroundPickerProps) {
  const { t } = useI18n();
  const resolvedLabel = label ?? t("theme.background");
  return (
    <div className={cn("c2p-bg-picker space-y-2", className)}>
      {resolvedLabel && (
        <Label className="c2p-bg-picker-label text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
          {resolvedLabel}
        </Label>
      )}
      <div className="c2p-bg-grid grid grid-cols-10 gap-1">
        {presets.map((preset) => {
          const isSelected = value === preset.value;
          return (
            <motion.button
              key={preset.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onChange(preset.value, preset.type)}
              className={cn(
                "c2p-bg-option relative h-5 w-5 rounded border transition-all",
                isSelected
                  ? "c2p-bg-option-selected border-primary ring-primary/30 ring-2"
                  : "border-border/50 hover:border-border",
              )}
              style={{ background: preset.value }}
              title={preset.label}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="c2p-bg-option-check absolute inset-0 flex items-center justify-center"
                >
                  <Check className="h-3 w-3 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
