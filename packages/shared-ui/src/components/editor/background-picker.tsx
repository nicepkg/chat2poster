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
    <div className={cn("space-y-3", className)}>
      {resolvedLabel && (
        <Label className="text-muted-foreground text-xs uppercase tracking-wide">
          {resolvedLabel}
        </Label>
      )}
      <div className="grid grid-cols-4 gap-2">
        {presets.map((preset) => {
          const isSelected = value === preset.value;
          return (
            <motion.button
              key={preset.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(preset.value, preset.type)}
              className={cn(
                "relative aspect-square rounded-lg border-2 transition-all",
                isSelected
                  ? "border-primary ring-primary/20 ring-2"
                  : "border-transparent hover:border-border",
              )}
              style={{ background: preset.value }}
              title={preset.label}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center rounded-md bg-black/20"
                >
                  <Check className="h-4 w-4 text-white drop-shadow" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
