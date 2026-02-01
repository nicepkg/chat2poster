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
    <div className={cn("space-y-6 p-4", className)}>
      {/* Theme Selector (if themes provided) */}
      {themes.length > 0 && (
        <div className="space-y-3">
          <Label className="text-muted-foreground text-xs uppercase tracking-wide">
            {t("theme.label")}
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((theme) => (
              <motion.button
                key={theme.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onThemeChange(theme)}
                className={cn(
                  "rounded-lg border-2 p-2 text-center text-xs font-medium transition-all",
                  selectedThemeId === theme.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-border/80",
                )}
              >
                <div
                  className="mb-1.5 h-6 w-full rounded"
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

      {/* Background Picker */}
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

      {/* Border Radius */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-muted-foreground text-xs uppercase tracking-wide">
            {t("theme.borderRadius")}
          </Label>
          <span className="text-muted-foreground text-xs">
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
        />
      </div>

      {/* Padding */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-muted-foreground text-xs uppercase tracking-wide">
            {t("theme.padding")}
          </Label>
          <span className="text-muted-foreground text-xs">
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
        />
      </div>

      {/* Shadow */}
      <div className="space-y-3">
        <Label className="text-muted-foreground text-xs uppercase tracking-wide">
          {t("theme.shadow")}
        </Label>
        <Select
          value={decoration.shadowLevel}
          onValueChange={(value: Decoration["shadowLevel"]) =>
            onDecorationChange({ shadowLevel: value })
          }
        >
          <SelectTrigger className="h-9">
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

      {/* macOS Bar Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="text-muted-foreground h-4 w-4" />
          <Label className="text-sm">{t("theme.macosBar")}</Label>
        </div>
        <Switch
          checked={decoration.macosBarEnabled}
          onCheckedChange={(checked) =>
            onDecorationChange({ macosBarEnabled: checked })
          }
        />
      </div>
    </div>
  );
}
