"use client";

import * as React from "react";
import type { Decoration, Theme } from "@chat2poster/core-schema";
import { cn } from "../../lib/utils";
import { THEME_PRESETS, BACKGROUND_PRESETS } from "../../contexts/EditorContext";

export interface ThemeTabProps {
  selectedThemeId: string;
  decoration: Decoration;
  onThemeChange: (theme: Theme) => void;
  onDecorationChange: (decoration: Partial<Decoration>) => void;
  className?: string;
}

export function ThemeTab({
  selectedThemeId,
  decoration,
  onThemeChange,
  onDecorationChange,
  className,
}: ThemeTabProps) {
  return (
    <div className={cn("space-y-5 p-4", className)}>
      {/* Theme Selector */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Theme
        </label>
        <div className="grid grid-cols-3 gap-2">
          {THEME_PRESETS.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onThemeChange(theme)}
              className={cn(
                "rounded-lg border-2 p-2 text-center text-xs font-medium transition-colors",
                selectedThemeId === theme.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-border/80"
              )}
            >
              <div
                className="mb-1.5 h-6 w-full rounded"
                style={{
                  background:
                    theme.decorationDefaults.backgroundType === "gradient"
                      ? theme.decorationDefaults.backgroundValue
                      : theme.decorationDefaults.backgroundValue,
                }}
              />
              {theme.name}
            </button>
          ))}
        </div>
      </div>

      {/* Background Picker */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Background
        </label>
        <div className="grid grid-cols-3 gap-2">
          {BACKGROUND_PRESETS.map((bg) => (
            <button
              key={bg.id}
              onClick={() =>
                onDecorationChange({
                  backgroundType: bg.type,
                  backgroundValue: bg.value,
                })
              }
              className={cn(
                "rounded-lg border-2 p-1.5 transition-colors",
                decoration.backgroundValue === bg.value
                  ? "border-primary"
                  : "border-border hover:border-border/80"
              )}
              title={bg.label}
            >
              <div
                className="h-6 w-full rounded"
                style={{ background: bg.value }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Border Radius
        </label>
        <input
          type="range"
          min="0"
          max="32"
          value={decoration.canvasRadiusPx}
          onChange={(e) =>
            onDecorationChange({ canvasRadiusPx: Number(e.target.value) })
          }
          className="w-full"
        />
        <span className="text-xs text-muted-foreground">
          {decoration.canvasRadiusPx}px
        </span>
      </div>

      {/* Padding */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Padding
        </label>
        <input
          type="range"
          min="0"
          max="64"
          value={decoration.canvasPaddingPx}
          onChange={(e) =>
            onDecorationChange({ canvasPaddingPx: Number(e.target.value) })
          }
          className="w-full"
        />
        <span className="text-xs text-muted-foreground">
          {decoration.canvasPaddingPx}px
        </span>
      </div>

      {/* Shadow */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Shadow
        </label>
        <select
          value={decoration.shadowLevel}
          onChange={(e) =>
            onDecorationChange({
              shadowLevel: e.target.value as Decoration["shadowLevel"],
            })
          }
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="none">None</option>
          <option value="sm">Small</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
          <option value="xl">Extra Large</option>
        </select>
      </div>

      {/* macOS Bar Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">macOS Bar</label>
        <button
          onClick={() =>
            onDecorationChange({ macosBarEnabled: !decoration.macosBarEnabled })
          }
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            decoration.macosBarEnabled ? "bg-primary" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform",
              decoration.macosBarEnabled ? "left-5" : "left-0.5"
            )}
          />
        </button>
      </div>
    </div>
  );
}
