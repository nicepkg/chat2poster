"use client";

import type { Decoration, ShadowLevel, Theme } from "@chat2poster/core-schema";
import { motion } from "framer-motion";
import { Monitor } from "lucide-react";
import * as React from "react";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { BackgroundPicker, type BackgroundPreset } from "./background-picker";
import { useI18n } from "~/i18n";
import { BACKGROUND_PRESETS } from "~/themes/backgrounds";
import { cn } from "~/utils/common";

// Shadow levels mapped to slider values (0-4)
const SHADOW_LEVELS: ShadowLevel[] = ["none", "sm", "md", "lg", "xl"];
const SHADOW_LABELS: Record<ShadowLevel, string> = {
  none: "None",
  xs: "XS",
  sm: "S",
  md: "M",
  lg: "L",
  xl: "XL",
};

export interface ThemeTabProps {
  selectedThemeId: string;
  decoration: Decoration;
  themes?: Theme[];
  backgroundPresets?: BackgroundPreset[];
  onThemeChange: (theme: Theme) => void;
  onDecorationChange: (decoration: Partial<Decoration>) => void;
  className?: string;
}

export function ThemeTab({
  selectedThemeId,
  decoration,
  themes = [],
  backgroundPresets = BACKGROUND_PRESETS,
  onThemeChange,
  onDecorationChange,
  className,
}: ThemeTabProps) {
  const { t } = useI18n();

  // Convert shadow level to slider index
  const shadowIndex = SHADOW_LEVELS.indexOf(decoration.shadowLevel);
  const currentShadowIndex = shadowIndex === -1 ? 2 : shadowIndex; // default to "md"

  return (
    <div className={cn("c2p-theme-tab space-y-4 p-3", className)}>
      {/* Theme Selector */}
      {themes.length > 0 && (
        <div className="space-y-2">
          <Label className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
            {t("theme.label")}
          </Label>
          <div className="grid grid-cols-2 gap-1.5">
            {themes.map((theme) => (
              <motion.button
                key={theme.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onThemeChange(theme)}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-all",
                  selectedThemeId === theme.id
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border/60 text-muted-foreground hover:border-border hover:bg-muted/30",
                )}
              >
                <div
                  className="h-4 w-4 shrink-0 rounded-full border"
                  style={{
                    background: theme.tokens.colors.background,
                    borderColor: theme.tokens.colors.border,
                  }}
                />
                {theme.name}
                {selectedThemeId === theme.id && (
                  <motion.div
                    layoutId="theme-indicator"
                    className="bg-primary absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Background */}
      <div>
        <BackgroundPicker
          value={decoration.backgroundValue}
          onChange={(value, type) =>
            onDecorationChange({
              backgroundType: type,
              backgroundValue: value,
            })
          }
          presets={backgroundPresets}
          label={t("theme.background")}
        />
      </div>

      {/* Radius + Padding in one row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Radius */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
              {t("theme.borderRadius")}
            </Label>
            <span className="text-muted-foreground/70 text-[10px] tabular-nums">
              {decoration.canvasRadiusPx}
            </span>
          </div>
          <Slider
            value={[decoration.canvasRadiusPx]}
            min={0}
            max={32}
            step={2}
            onValueChange={(values) =>
              onDecorationChange({
                canvasRadiusPx: values[0] ?? decoration.canvasRadiusPx,
              })
            }
            className="h-5"
          />
        </div>

        {/* Padding */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
              {t("theme.padding")}
            </Label>
            <span className="text-muted-foreground/70 text-[10px] tabular-nums">
              {decoration.canvasPaddingPx}
            </span>
          </div>
          <Slider
            value={[decoration.canvasPaddingPx]}
            min={0}
            max={64}
            step={4}
            onValueChange={(values) =>
              onDecorationChange({
                canvasPaddingPx: values[0] ?? decoration.canvasPaddingPx,
              })
            }
            className="h-5"
          />
        </div>
      </div>

      {/* Shadow Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
            {t("theme.shadow")}
          </Label>
          <span className="text-muted-foreground/70 text-[10px]">
            {SHADOW_LABELS[decoration.shadowLevel]}
          </span>
        </div>
        <Slider
          value={[currentShadowIndex]}
          min={0}
          max={4}
          step={1}
          onValueChange={(values) => {
            const index = values[0] ?? 2;
            const level = SHADOW_LEVELS[index] ?? "md";
            onDecorationChange({ shadowLevel: level });
          }}
          className="h-5"
        />
        {/* Shadow level markers */}
        <div className="text-muted-foreground/50 flex justify-between px-0.5 text-[9px]">
          {SHADOW_LEVELS.map((level) => (
            <span key={level}>{SHADOW_LABELS[level]}</span>
          ))}
        </div>
      </div>

      {/* macOS Bar Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
        <div className="flex items-center gap-2">
          <Monitor className="text-muted-foreground h-3.5 w-3.5" />
          <Label className="text-xs font-medium">{t("theme.macosBar")}</Label>
        </div>
        <Switch
          checked={decoration.macosBarEnabled}
          onCheckedChange={(checked) =>
            onDecorationChange({ macosBarEnabled: checked })
          }
          className="scale-90"
        />
      </div>
    </div>
  );
}
