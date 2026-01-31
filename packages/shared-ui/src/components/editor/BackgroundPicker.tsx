"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "~/utils/common";
import { Label } from "../ui/label";

export interface BackgroundPreset {
  id: string;
  label: string;
  value: string;
  type: "solid" | "gradient";
}

export const DEFAULT_BACKGROUND_PRESETS: BackgroundPreset[] = [
  { id: "white", label: "White", value: "#ffffff", type: "solid" },
  { id: "slate", label: "Slate", value: "#f8fafc", type: "solid" },
  { id: "amber", label: "Amber", value: "#fef3c7", type: "solid" },
  { id: "blue", label: "Blue", value: "#dbeafe", type: "solid" },
  { id: "green", label: "Green", value: "#dcfce7", type: "solid" },
  { id: "fuchsia", label: "Fuchsia", value: "#fae8ff", type: "solid" },
  { id: "dark", label: "Dark", value: "#1e1e2e", type: "solid" },
  {
    id: "gradient-indigo",
    label: "Indigo",
    value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    type: "gradient",
  },
];

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
  presets = DEFAULT_BACKGROUND_PRESETS,
  label = "Background",
  className,
}: BackgroundPickerProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <Label className="text-muted-foreground text-xs uppercase tracking-wide">
          {label}
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
