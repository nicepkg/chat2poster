"use client";

import type { Decoration, Theme } from "@chat2poster/core-schema";
import { motion } from "framer-motion";
import { Monitor } from "lucide-react";
import * as React from "react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { BackgroundPicker, type BackgroundPreset } from "./background-picker";
import { useI18n } from "~/i18n";
import { BACKGROUND_PRESETS } from "~/themes/backgrounds";
import { cn } from "~/utils/common";

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
  return (
    <div className={cn("c2p-theme-tab space-y-6 p-4", className)}>
      {/* Content Theme Selector - controls c2p-window-content colors */}
      {themes.length > 0 && (
        <div className="c2p-content-theme-section space-y-3">
          <Label className="c2p-section-label text-muted-foreground text-xs uppercase tracking-wide">
            {t("theme.label")}
          </Label>
          <div className="c2p-theme-grid grid grid-cols-3 gap-2">
            {themes.map((theme) => (
              <motion.button
                key={theme.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onThemeChange(theme)}
                className={cn(
                  "c2p-theme-option rounded-lg border-2 p-2 text-center text-xs font-medium transition-all",
                  selectedThemeId === theme.id
                    ? "c2p-theme-selected border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-border/80",
                )}
              >
                <div
                  className="c2p-theme-preview mb-1.5 h-6 w-full rounded"
                  style={{
                    background: theme.decorationDefaults.backgroundValue,
                  }}
                />
                {theme.name}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Desktop Background Picker - controls c2p-desktop background */}
      <div className="c2p-desktop-bg-section">
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

      {/* Window Radius - controls c2p-window border-radius */}
      <div className="c2p-window-radius-section space-y-3">
        <div className="flex items-center justify-between">
          <Label className="c2p-section-label text-muted-foreground text-xs uppercase tracking-wide">
            {t("theme.borderRadius")}
          </Label>
          <span className="c2p-value-display text-muted-foreground text-xs">
            {decoration.canvasRadiusPx}px
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
          className="c2p-radius-slider"
        />
      </div>

      {/* Window Margin - controls c2p-desktop padding (distance from desktop edge to window) */}
      <div className="c2p-window-margin-section space-y-3">
        <div className="flex items-center justify-between">
          <Label className="c2p-section-label text-muted-foreground text-xs uppercase tracking-wide">
            {t("theme.padding")}
          </Label>
          <span className="c2p-value-display text-muted-foreground text-xs">
            {decoration.canvasPaddingPx}px
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
          className="c2p-margin-slider"
        />
      </div>

      {/* Window Shadow - controls c2p-window box-shadow */}
      <div className="c2p-window-shadow-section space-y-3">
        <Label className="c2p-section-label text-muted-foreground text-xs uppercase tracking-wide">
          {t("theme.shadow")}
        </Label>
        <Select
          value={decoration.shadowLevel}
          onValueChange={(value: Decoration["shadowLevel"]) =>
            onDecorationChange({ shadowLevel: value })
          }
        >
          <SelectTrigger className="c2p-shadow-select h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t("theme.shadow.none")}</SelectItem>
            <SelectItem value="sm">{t("theme.shadow.small")}</SelectItem>
            <SelectItem value="md">{t("theme.shadow.medium")}</SelectItem>
            <SelectItem value="lg">{t("theme.shadow.large")}</SelectItem>
            <SelectItem value="xl">{t("theme.shadow.extraLarge")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* macOS Title Bar Toggle - controls c2p-window-bar visibility */}
      <div className="c2p-macos-bar-section flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="text-muted-foreground h-4 w-4" />
          <Label className="c2p-toggle-label text-sm">
            {t("theme.macosBar")}
          </Label>
        </div>
        <Switch
          checked={decoration.macosBarEnabled}
          onCheckedChange={(checked) =>
            onDecorationChange({ macosBarEnabled: checked })
          }
          className="c2p-macos-bar-toggle"
        />
      </div>
    </div>
  );
}
