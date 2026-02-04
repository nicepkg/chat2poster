"use client";

import { useI18n } from "@ui/i18n";
import {
  BACKGROUND_PRESETS,
  type BackgroundPreset,
} from "@ui/themes/backgrounds";
import { cn } from "@ui/utils/common";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Label } from "../ui/label";

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
      <div className="c2p-bg-grid grid grid-cols-4 gap-1.5">
        {presets.map((preset) => {
          const isSelected = value === preset.value;
          return (
            <motion.button
              key={preset.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(preset.value, preset.type)}
              className={cn(
                "c2p-bg-option group relative aspect-[5/4] w-full overflow-hidden rounded-md border transition-all",
                isSelected
                  ? "c2p-bg-option-selected border-primary ring-primary/25 ring-2"
                  : "border-border/60 hover:border-border",
              )}
              style={{
                background: preset.value,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
              }}
              title={preset.label}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="c2p-bg-option-check absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/45"
                >
                  <Check className="h-3 w-3 text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
